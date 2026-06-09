"""
cli.py - 命令行入口

用法:
  excel-mutate show <file> [--sheet NAME]
  excel-mutate add-row <file> <sheet> <at> [--count N]
  excel-mutate del-row <file> <sheet> <at> [--count N]
  excel-mutate add-col <file> <sheet> <at> [--count N]
  excel-mutate del-col <file> <sheet> <at> [--count N]
  excel-mutate add-sheet <file> <name>
  excel-mutate del-sheet <file> <name>
  excel-mutate rename-sheet <file> <old> <new>
  excel-mutate set <file> <sheet> <coord> <value>
  excel-mutate tui <file>            # 启动 TUI

默认修改直接覆盖原文件, --out FILE 输出到新文件
"""
import argparse
import sys
from pathlib import Path
from rich.console import Console
from rich.table import Table

from .workbook import Workbook

console = Console()


def cmd_show(args):
    wb = Workbook(args.file)
    sheets = args.sheet.split(",") if args.sheet else wb.list_sheets()
    
    for sn in sheets:
        ws_name = sn.strip()
        console.print(f"\n[bold blue]Sheet:[/bold blue] [yellow]{ws_name}[/yellow]")
        data = wb.read_sheet(ws_name, max_row=args.max_row, max_col=args.max_col)
        if not data:
            console.print("  (空)")
            continue
        # 用 rich.Table 展示
        n_cols = max(len(r) for r in data)
        t = Table(show_header=True, header_style="bold magenta")
        t.add_column("#", style="dim")
        for c in range(1, n_cols + 1):
            t.add_column(str(c))
        for i, row in enumerate(data, start=1):
            row_strs = [str(c) for c in row]
            t.add_row(str(i), *row_strs)
        console.print(t)


def cmd_insert_row(args):
    wb = Workbook(args.file)
    warnings = wb.insert_row(args.sheet, args.at, args.count)
    out = wb.save(args.out)
    console.print(f"[green]✅ 已插入 {args.count} 行(at row {args.at}),保存到 {out}[/green]")
    for w in warnings:
        console.print(f"  [yellow]⚠️  {w}[/yellow]")


def cmd_delete_row(args):
    wb = Workbook(args.file)
    warnings = wb.delete_row(args.sheet, args.at, args.count)
    out = wb.save(args.out)
    console.print(f"[green]✅ 已删除 {args.count} 行(from row {args.at}),保存到 {out}[/green]")
    for w in warnings:
        console.print(f"  [yellow]⚠️  {w}[/yellow]")


def cmd_insert_col(args):
    wb = Workbook(args.file)
    warnings = wb.insert_column(args.sheet, args.at, args.count)
    out = wb.save(args.out)
    console.print(f"[green]✅ 已插入 {args.count} 列(at col {args.at}),保存到 {out}[/green]")
    for w in warnings:
        console.print(f"  [yellow]⚠️  {w}[/yellow]")


def cmd_delete_col(args):
    wb = Workbook(args.file)
    warnings = wb.delete_column(args.sheet, args.at, args.count)
    out = wb.save(args.out)
    console.print(f"[green]✅ 已删除 {args.count} 列(from col {args.at}),保存到 {out}[/green]")
    for w in warnings:
        console.print(f"  [yellow]⚠️  {w}[/yellow]")


def cmd_add_sheet(args):
    wb = Workbook(args.file)
    wb.insert_sheet(args.name, args.position)
    out = wb.save(args.out)
    console.print(f"[green]✅ 已添加 sheet '{args.name}',保存到 {out}[/green]")


def cmd_del_sheet(args):
    wb = Workbook(args.file)
    wb.delete_sheet(args.name)
    out = wb.save(args.out)
    console.print(f"[green]✅ 已删除 sheet '{args.name}',保存到 {out}[/green]")


def cmd_rename_sheet(args):
    wb = Workbook(args.file)
    wb.rename_sheet(args.old, args.new)
    out = wb.save(args.out)
    console.print(f"[green]✅ 已重命名 sheet '{args.old}' -> '{args.new}',保存到 {out}[/green]")


def cmd_set(args):
    wb = Workbook(args.file)
    value = args.value
    # 试着解析为数字
    try:
        if "." in value:
            value = float(value)
        else:
            value = int(value)
    except ValueError:
        pass  # 保留为字符串
    
    old = wb.get_cell(args.sheet, args.coord)
    wb.set_cell(args.sheet, args.coord, value)
    out = wb.save(args.out)
    console.print(f"[green]✅ {args.sheet}!{args.coord}: {old!r} -> {value!r},保存到 {out}[/green]")


def cmd_tui(args):
    from .tui import ExcelMutateApp
    app = ExcelMutateApp(args.file)
    app.run()


def main():
    p = argparse.ArgumentParser(
        prog="excel-mutate",
        description="改 Excel 模板(增删行/列/sheet/cell),自动重写公式",
    )
    
    sub = p.add_subparsers(dest="cmd", required=True)
    
    # show
    s = sub.add_parser("show", help="显示 sheet 内容")
    s.add_argument("file")
    s.add_argument("--sheet", "-s", help="sheet 名(逗号分隔多个)")
    s.add_argument("--max-row", type=int, default=50)
    s.add_argument("--max-col", type=int, default=20)
    s.set_defaults(func=cmd_show)
    
    # add-row
    s = sub.add_parser("add-row", help="插入行")
    s.add_argument("file")
    s.add_argument("sheet")
    s.add_argument("at", type=int, help="插入位置(行号)")
    s.add_argument("--count", "-n", type=int, default=1)
    s.add_argument("--out", "-o", help="输出文件(默认覆盖)")
    s.set_defaults(func=cmd_insert_row)
    
    # del-row
    s = sub.add_parser("del-row", help="删除行")
    s.add_argument("file")
    s.add_argument("sheet")
    s.add_argument("at", type=int, help="起始行号")
    s.add_argument("--count", "-n", type=int, default=1)
    s.add_argument("--out", "-o")
    s.set_defaults(func=cmd_delete_row)
    
    # add-col
    s = sub.add_parser("add-col", help="插入列")
    s.add_argument("file")
    s.add_argument("sheet")
    s.add_argument("at", type=int, help="插入位置(列号)")
    s.add_argument("--count", "-n", type=int, default=1)
    s.add_argument("--out", "-o")
    s.set_defaults(func=cmd_insert_col)
    
    # del-col
    s = sub.add_parser("del-col", help="删除列")
    s.add_argument("file")
    s.add_argument("sheet")
    s.add_argument("at", type=int, help="起始列号")
    s.add_argument("--count", "-n", type=int, default=1)
    s.add_argument("--out", "-o")
    s.set_defaults(func=cmd_delete_col)
    
    # add-sheet
    s = sub.add_parser("add-sheet", help="添加 sheet")
    s.add_argument("file")
    s.add_argument("name")
    s.add_argument("--position", "-p", type=int)
    s.add_argument("--out", "-o")
    s.set_defaults(func=cmd_add_sheet)
    
    # del-sheet
    s = sub.add_parser("del-sheet", help="删除 sheet")
    s.add_argument("file")
    s.add_argument("name")
    s.add_argument("--out", "-o")
    s.set_defaults(func=cmd_del_sheet)
    
    # rename-sheet
    s = sub.add_parser("rename-sheet", help="重命名 sheet")
    s.add_argument("file")
    s.add_argument("old")
    s.add_argument("new")
    s.add_argument("--out", "-o")
    s.set_defaults(func=cmd_rename_sheet)
    
    # set
    s = sub.add_parser("set", help="设置 cell 值/公式")
    s.add_argument("file")
    s.add_argument("sheet")
    s.add_argument("coord", help="如 A1")
    s.add_argument("value", help="值(纯文本; 公式以 = 开头)")
    s.add_argument("--out", "-o")
    s.set_defaults(func=cmd_set)
    
    # tui
    s = sub.add_parser("tui", help="启动 TUI")
    s.add_argument("file")
    s.set_defaults(func=cmd_tui)
    
    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
