# excel-mutate

改 Excel 模板(增删行/列/sheet/cell),**自动重写公式引用**。

## 用法

### 命令行(单步操作)

```bash
# 看 sheet
excel-mutate show my.xlsx --sheet Sales

# 加行(在第 3 行插 1 行)
excel-mutate add-row my.xlsx Sales 3

# 删行
excel-mutate del-row my.xlsx Sales 5

# 加列(在第 2 列插 1 列)
excel-mutate add-col my.xlsx Sales 2

# 删列
excel-mutate del-col my.xlsx Sales 4

# 加 sheet
excel-mutate add-sheet my.xlsx "NewSheet"

# 改 cell
excel-mutate set my.xlsx Sales A1 100
excel-mutate set my.xlsx Sales A1 "=SUM(B:B)"

# 默认覆盖原文件,加 -o 输出到新文件
excel-mutate add-row my.xlsx Sales 3 -o my_v2.xlsx
```

### TUI(终端 GUI)

```bash
excel-mutate tui my.xlsx
```

进去后:
- 上下方向键选 sheet
- 在底部输入命令:
  - `add-row 3`  - 在第 3 行插 1 行
  - `del-row 5`  - 删第 5 行
  - `add-col 2`  - 在第 2 列插 1 列
  - `del-col 4`  - 删第 4 列
  - `set A1 100` - 改 cell 值
  - `set A1 =SUM(A:A)` - 改 cell 公式
  - `add-sheet Name` / `del-sheet Name`
  - `save` / `show` / `?` / `q`

**所有操作后自动保存**。

## 公式重写

改结构(行/列)时,自动重写**所有 sheet** 的所有公式:

- `=A1` 在 row 3 插 1 行 → `=A2` ✅
- `=SUM(A1:A5)` → `=SUM(A1:A6)` ✅(范围自动扩展)
- `=Sheet2!B2` → `=Sheet2!B3` ✅(跨表引用跟着变)
- 绝对引用 `$A$1` → `$A$2` ✅(值加 1,绝对符号保留)

**Excel 打开后会重算,值自动更新**。

## 安装

```bash
cd ~/.openclaw/workspace/excel-mutate
source .venv/bin/activate
uv pip install -e .
```

## 开发

```bash
source .venv/bin/activate
python3 tests/test_formula.py   # 跑公式引擎测试
```
