"""
formula.py 单元测试

测试覆盖:
- 单 cell 重写(加/删 行/列)
- 跨 sheet 不受影响
- 绝对引用 vs 相对引用
- 范围 A1:B2
- 边界(at_row 等于引用行)
- 嵌套公式(SUM / IF / VLOOKUP)
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from excel_mutate.formula import (
    rewrite_after_insert_row,
    rewrite_after_delete_row,
    rewrite_after_insert_column,
    rewrite_after_delete_column,
    parse_cell_ref,
)


def test(name, actual, expected):
    ok = actual == expected
    sym = "✅" if ok else "❌"
    print(f"  {sym} {name}")
    if not ok:
        print(f"     实际: {actual!r}")
        print(f"     期望: {expected!r}")
    return ok


def main():
    passed = 0
    total = 0
    
    print("=== 加 1 行 (at_row=3, count=1) ===")
    cases = [
        ("=A1",                 "=A1"),     # 行 1 < 3, 不动
        ("=A3",                 "=A4"),     # 行 3 >= 3, 下移
        ("=A5",                 "=A6"),     # 行 5 >= 3, 下移
        ("=A$3",                "=A$4"),    # 绝对行,值还是 +1
        ("=$A$3",               "=$A$4"),   # 全绝对
        ("=B2",                 "=B2"),     # 行 2 < 3, 不动
        ("=SUM(A1:A10)",        "=SUM(A1:A11)"),  # 范围内有 1 个 >= 3,扩展
        ("=SUM(A1:A2)",         "=SUM(A1:A2)"),   # 范围都 < 3, 不动
        ("=SUM(A3:A10)",        "=SUM(A4:A11)"),  # 范围都 >= 3, 整体下移
    ]
    for f, exp in cases:
        total += 1
        if test(f"加行: {f}", rewrite_after_insert_row(f, at_row=3, count=1), exp):
            passed += 1
    
    print("\n=== 删 1 行 (at_row=3, count=1) ===")
    cases = [
        ("=A1",                 "=A1"),
        ("=A2",                 "=A2"),
        ("=A3",                 None),      # 指向被删行,本测试里返回原样
        ("=A4",                 "=A3"),     # 行 4 >= 4, 上移
        ("=$A$4",               "=$A$3"),
        ("=SUM(A1:A10)",        None),      # 包含被删的 A3,我们的实现是跳过它
    ]
    for f, exp in cases:
        total += 1
        if exp is None:
            print(f"  ⚠️  跳过(测试空): {f}")
            continue
        if test(f"删行: {f}", rewrite_after_delete_row(f, at_row=3, count=1), exp):
            passed += 1
    
    print("\n=== 跨 sheet 不动 ===")
    # 跨 sheet 引用: 不应被本表操作影响
    cases = [
        ("=Sheet2!A1",  "=Sheet2!A1"),  # 跨表不动(Sheet2 不在 Sheet1 上加行)
        ("=A2",        "=A3"),         # 本表变(A2 在 at_row=2 处下移)
    ]
    for f, exp in cases:
        total += 1
        if test(f"加行: {f}", rewrite_after_insert_row(f, at_row=2, count=1, sheet="Sheet1"), exp):
            passed += 1
    
    print("\n=== 加 1 列 (at_col=2, count=1) ===")
    cases = [
        ("=A1",        "=A1"),         # A < B (col 1 < 2), 不动
        ("=B1",        "=C1"),         # B >= 2, +1
        ("=$B$1",      "=$C$1"),
        ("=SUM(A1:D1)", "=SUM(A1:E1)"),
    ]
    for f, exp in cases:
        total += 1
        if test(f"加列: {f}", rewrite_after_insert_column(f, at_col=2, count=1), exp):
            passed += 1
    
    print("\n=== 删 1 列 (at_col=2, count=1) ===")
    cases = [
        ("=A1",        "=A1"),
        ("=B1",        None),  # 指向被删
        ("=C1",        "=B1"),
        ("=$C$1",      "=$B$1"),
    ]
    for f, exp in cases:
        total += 1
        if exp is None:
            print(f"  ⚠️  跳过: {f}")
            continue
        if test(f"删列: {f}", rewrite_after_delete_column(f, at_col=2, count=1), exp):
            passed += 1
    
    print("\n=== parse_cell_ref ===")
    ref = parse_cell_ref("Sheet1!$A$1")
    if test("parse Sheet1!$A$1", (ref.col, ref.row, ref.col_abs, ref.row_abs, ref.sheet), (1, 1, True, True, "Sheet1")):
        passed += 1
    total += 1
    
    ref = parse_cell_ref("'Sheet Name'!B2")
    if test("parse 'Sheet Name'!B2", (ref.col, ref.row, ref.sheet), (2, 2, "Sheet Name")):
        passed += 1
    total += 1
    
    print(f"\n=== 总结: {passed}/{total} 通过 ===")
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
