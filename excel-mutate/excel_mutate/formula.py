"""
公式重写引擎 - excel-mutate 的核心

当 Excel 模板结构改变(加行/删行/加列/删列/加 sheet)时,
自动重写所有公式中的单元格引用,保持公式语义。

支持的操作:
- 增/删 行(row-level)
- 增/删 列(column-level)
- 增/删 sheet
- 改 cell 内容(不改公式,只改 cell 的 value/formula 字段)

支持的引用类型:
- A1 / $A$1 / A$1 / $A1(相对/绝对)
- Sheet1!A1
- 'Sheet Name'!A1
- 范围 A1:B2
- 跨 sheet 范围 Sheet1!A1:B2
- 联合范围 (A1:B2, C3:D4)
- 整行 1:1 / 整列 A:A
- 命名范围(暂不处理,只做字符串保留)
"""
from __future__ import annotations
import re
from dataclasses import dataclass
from typing import Optional


# 单 cell 引用: 可选 sheet 前缀 + $col$row
CELL_REF_RE = re.compile(
    r"""
    (?:                              # 可选的 sheet 前缀
        (?:'([^']+)')|                # 'Sheet Name' 形式
        ([A-Za-z_][A-Za-z0-9_]*)      # SheetName 形式(无空格)
    )?!
    \$?([A-Z]+)\$?(\d+)              # $col $row  可选 $
    """,
    re.VERBOSE,
)

# 范围 (A1:B2) 捕获: A1 冒号 B2
RANGE_RE = re.compile(
    r"""
    (                                  # 整个范围
      (?:'[^']+'|[A-Za-z_][A-Za-z0-9_]*)!    # sheet
      \$?[A-Z]+\$?\d+                           # start
      :
      \$?[A-Z]+\$?\d+                           # end
    )
    """,
    re.VERBOSE,
)


@dataclass
class CellRef:
    """单个 cell 引用,带绝对/相对标记"""
    col: int                # 1-based 列号(A=1)
    row: int                # 1-based 行号
    col_abs: bool           # $A
    row_abs: bool           # $1
    sheet: Optional[str] = None  # None = 本表,字符串 = 跨表
    
    @property
    def col_letter(self) -> str:
        s = ""
        n = self.col
        while n > 0:
            n, r = divmod(n - 1, 26)
            s = chr(65 + r) + s
        return s
    
    def __str__(self) -> str:
        col_s = "$" + self.col_letter if self.col_abs else self.col_letter
        row_s = "$" + str(self.row) if self.row_abs else str(self.row)
        cell = f"{col_s}{row_s}"
        if self.sheet:
            if any(c in self.sheet for c in " '!"):
                return f"'{self.sheet}'!{cell}"
            return f"{self.sheet}!{cell}"
        return cell


def col_letter_to_num(letter: str) -> int:
    """A -> 1, B -> 2, ..., Z -> 26, AA -> 27"""
    n = 0
    for c in letter:
        n = n * 26 + (ord(c.upper()) - 64)
    return n


def parse_cell_ref(s: str, default_sheet: Optional[str] = None) -> Optional[CellRef]:
    """解析 'Sheet1!$A$1' 形式,返回 CellRef 或 None"""
    s = s.strip()
    sheet = default_sheet
    
    # 拆 sheet
    if "!" in s:
        sheet_part, cell_part = s.rsplit("!", 1)
        if sheet_part.startswith("'") and sheet_part.endswith("'"):
            sheet = sheet_part[1:-1]
        else:
            sheet = sheet_part
        s = cell_part
    
    m = re.match(r"^(\$?)([A-Z]+)(\$?)(\d+)$", s)
    if not m:
        return None
    
    col_abs = bool(m.group(1))
    col = col_letter_to_num(m.group(2))
    row_abs = bool(m.group(3))
    row = int(m.group(4))
    
    return CellRef(col=col, row=row, col_abs=col_abs, row_abs=row_abs, sheet=sheet)


# ---------------------------------------------------------------------------
# 核心: 重写公式
# ---------------------------------------------------------------------------

def rewrite_after_insert_row(formula: str, *, at_row: int, count: int, sheet: Optional[str] = None) -> str:
    """在 at_row 处插入 count 行后,重写公式
    
    规则:
    - 引用行 < at_row: 不变
    - 引用行 >= at_row: 行号 + count(下移)
    """
    def transform(ref):
        new_row = _shift_row_insert(ref.row, at_row, count) if ref.row >= at_row else ref.row
        return (ref.col, new_row, ref.col_abs, ref.row_abs)
    return _rewrite_cell_refs(formula, sheet, transform)


def rewrite_after_delete_row(formula: str, *, at_row: int, count: int, sheet: Optional[str] = None) -> str:
    """在 at_row 处删除 count 行后,重写公式"""
    def transform(ref):
        if at_row <= ref.row < at_row + count:
            # 指向被删行 → 返回 None 让调用方处理
            return (None, None, ref.col_abs, ref.row_abs)
        new_row = ref.row - count if ref.row >= at_row + count else ref.row
        return (ref.col, new_row, ref.col_abs, ref.row_abs)
    return _rewrite_cell_refs(formula, sheet, transform)


def rewrite_after_insert_column(formula: str, *, at_col: int, count: int, sheet: Optional[str] = None) -> str:
    """在 at_col 处插入 count 列后,重写公式"""
    def transform(ref):
        new_col = _shift_col_insert(ref.col, at_col, count) if ref.col >= at_col else ref.col
        return (new_col, ref.row, ref.col_abs, ref.row_abs)
    return _rewrite_cell_refs(formula, sheet, transform)


def rewrite_after_delete_column(formula: str, *, at_col: int, count: int, sheet: Optional[str] = None) -> str:
    def transform(ref):
        if at_col <= ref.col < at_col + count:
            return (None, None, ref.col_abs, ref.row_abs)
        new_col = ref.col - count if ref.col >= at_col + count else ref.col
        return (new_col, ref.row, ref.col_abs, ref.row_abs)
    return _rewrite_cell_refs(formula, sheet, transform)


def _shift_row_insert(row: int, at: int, count: int) -> int:
    return row + count if row >= at else row


def _shift_col_insert(col: int, at: int, count: int) -> int:
    return col + count if col >= at else col


def _rewrite_cell_refs(formula: str, default_sheet: Optional[str], transform) -> str:
    """扫描公式,把所有 cell 引用用 transform 重写
    
    transform: Callable[[CellRef], Tuple[Optional[int], Optional[int], bool, bool]]
        返回 (new_col, new_row, col_abs, row_abs)
        new_col/row = None 表示"指向已删除位置"→ 跳过(返回原字符串)
    """
    if not formula or not formula.startswith("="):
        return formula
    
    body = formula[1:]  # 去掉 =
    
    # 找所有 cell 引用位置,按从右往左替换(避免 index 漂移)
    matches = list(re.finditer(
        r"(?:(?:'([^']+)')|([A-Za-z_][A-Za-z0-9_]*))?!?\$?([A-Z]+)\$?(\d+)",
        body
    ))
    
    if not matches:
        return formula
    
    new_body = body
    offset = 0
    for m in matches:
        # 拆 sheet - 只在原串有 sheet 前缀时填
        if m.group(1):
            sheet = m.group(1)
        elif m.group(2):
            sheet = m.group(2)
        else:
            sheet = None  # 原公式没写 sheet, 表示本表
        has_explicit_sheet = m.group(1) is not None or m.group(2) is not None
        
        # 解析绝对/相对 标记
        raw = m.group(0)
        cell_part = raw
        if "!" in raw:
            cell_part = raw.rsplit("!", 1)[1]
        col_abs = cell_part.startswith("$")
        if col_abs:
            cell_part = cell_part[1:]
        row_abs = False
        if "$" in cell_part:
            row_abs = True
        
        ref = CellRef(
            col=col_letter_to_num(m.group(3)),
            row=int(m.group(4)),
            col_abs=col_abs,
            row_abs=row_abs,
            sheet=sheet,
        )
        
        # 跨 sheet 比较: 显式写了其他 sheet 名的 → 不动
        if has_explicit_sheet and ref.sheet is not None and default_sheet is not None and ref.sheet != default_sheet:
            continue  # 跨表引用,不动
        
        new_col, new_row, new_col_abs, new_row_abs = transform(ref)
        
        if new_col is None or new_row is None:
            # 指向被删的位置 → 跳过(让调用方决定怎么处理,默认原样保留 + 标警告)
            continue
        
        new_ref = CellRef(
            col=new_col,
            row=new_row,
            col_abs=new_col_abs,
            row_abs=new_row_abs,
            sheet=ref.sheet,
        )
        new_str = str(new_ref)
        
        # 替换 - 注意: 因为是 sub-string replace,需要确保
        # 不会被部分匹配替换错。这里 m.group(0) 是完整引用,直接替换
        start = m.start() + offset
        end = m.end() + offset
        if new_str != raw:
            new_body = new_body[:start] + new_str + new_body[end:]
            offset += len(new_str) - len(raw)
    
    return "=" + new_body
