"""
tui.py - Textual TUI(简化版)

布局:
  ┌─────────────────────────────────────────┐
  │ 顶部: 文件名 + 当前 sheet               │
  ├──────────┬──────────────────────────────┤
  │          │                              │
  │  Sheet   │     数据预览(前 30 行 × 10 列)│
  │  列表    │                              │
  │          │                              │
  ├──────────┴──────────────────────────────┤
  │  底部: 命令输入 (q=quit, ?=help)        │
  └─────────────────────────────────────────┘

命令:
  add-row N       - 在第 N 行插入 1 行
  del-row N       - 删除第 N 行
  add-col N       - 在第 N 列插入 1 列
  del-col N       - 删除第 N 列
  set A1 value    - 设置 cell 值
  set A1 =formula - 设置 cell 公式
  add-sheet NAME  - 添加 sheet
  del-sheet NAME  - 删除 sheet
  show            - 刷新预览
  save            - 保存(默认每次操作自动保存)
  q               - 退出
  ?               - 帮助
"""
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Static, Input, ListView, ListItem, Label
from textual.containers import Horizontal, Vertical
from textual.reactive import reactive
from rich.table import Table
from rich.text import Text
from pathlib import Path

from .workbook import Workbook


class SheetList(ListView):
    """左侧 sheet 列表"""
    BINDINGS = []


class DataPreview(Static):
    """右侧数据预览"""


class ExcelMutateApp(App):
    CSS = """
    Screen {
        layout: vertical;
    }
    #body {
        height: 1fr;
    }
    #left {
        width: 25;
        border-right: solid green;
    }
    #right {
        width: 1fr;
    }
    Input {
        dock: bottom;
    }
    """

    BINDINGS = [("q", "quit", "退出")]
    
    def __init__(self, file_path: str):
        super().__init__()
        self.file_path = Path(file_path)
        self.wb = Workbook(str(self.file_path))
        self.current_sheet = self.wb.list_sheets()[0] if self.wb.list_sheets() else None
        self.message = "就绪"
    
    def compose(self) -> ComposeResult:
        yield Header(show_clock=False)
        with Horizontal(id="body"):
            with Vertical(id="left"):
                yield Static("[bold]Sheets[/bold]", id="sheet_header")
                yield SheetList(id="sheet_list")
            with Vertical(id="right"):
                yield DataPreview(id="preview")
        yield Input(placeholder="输入命令 (add-row 3, del-col 2, set A1 100, q 退出, ? 帮助)", id="cmd")
        yield Footer()
    
    def on_mount(self) -> None:
        self.refresh_sheets()
        self.refresh_preview()
        self.query_one("#cmd", Input).focus()
    
    def refresh_sheets(self):
        sheet_list = self.query_one("#sheet_list", SheetList)
        sheet_list.clear()
        for sn in self.wb.list_sheets():
            item = ListItem(Label(sn))
            sheet_list.append(item)
    
    def refresh_preview(self):
        if not self.current_sheet:
            self.query_one("#preview", DataPreview).update("(无 sheet)")
            return
        data = self.wb.read_sheet(self.current_sheet, max_row=30, max_col=12)
        n_cols = max((len(r) for r in data), default=0)
        t = Table(title=f"📄 {self.current_sheet}  |  {self.file_path.name}  |  {self.message}",
                  show_header=True, header_style="bold magenta")
        t.add_column("#", style="dim")
        for c in range(1, n_cols + 1):
            t.add_column(str(c))
        for i, row in enumerate(data, start=1):
            row_strs = [str(c)[:20] for c in row]
            t.add_row(str(i), *row_strs)
        self.query_one("#preview", DataPreview).update(t)
    
    def on_list_view_highlighted(self, event):
        if isinstance(event.item, ListItem):
            label_widget = event.item.query_one(Label)
            self.current_sheet = str(label_widget.renderable)
            self.message = f"切换到 sheet: {self.current_sheet}"
            self.refresh_preview()
    
    def on_input_submitted(self, event: Input.Submitted) -> None:
        cmd = event.value.strip()
        event.input.value = ""
        if not cmd:
            return
        self.execute(cmd)
    
    def execute(self, cmd: str):
        parts = cmd.split(maxsplit=2)
        op = parts[0]
        
        try:
            if op == "q" or op == "quit":
                self.exit()
                return
            if op == "?" or op == "help":
                self.message = "add-row N / del-row N / add-col N / del-col N / set A1 100 / set A1 =SUM(A:A) / add-sheet NAME / del-sheet NAME / save / show / q"
                self.refresh_preview()
                return
            if op == "show":
                self.refresh_preview()
                return
            if op == "save":
                out = self.wb.save()
                self.message = f"已保存到 {out}"
                self.refresh_preview()
                return
            if op == "add-row" and len(parts) >= 2:
                at = int(parts[1])
                warnings = self.wb.insert_row(self.current_sheet, at, 1)
                self.wb.save()
                self.message = f"已在 row {at} 插入 1 行({len(warnings)} 警告)"
                self.refresh_preview()
                return
            if op == "del-row" and len(parts) >= 2:
                at = int(parts[1])
                warnings = self.wb.delete_row(self.current_sheet, at, 1)
                self.wb.save()
                self.message = f"已删除 row {at}({len(warnings)} 警告)"
                self.refresh_preview()
                return
            if op == "add-col" and len(parts) >= 2:
                at = int(parts[1])
                warnings = self.wb.insert_column(self.current_sheet, at, 1)
                self.wb.save()
                self.message = f"已在 col {at} 插入 1 列({len(warnings)} 警告)"
                self.refresh_preview()
                return
            if op == "del-col" and len(parts) >= 2:
                at = int(parts[1])
                warnings = self.wb.delete_column(self.current_sheet, at, 1)
                self.wb.save()
                self.message = f"已删除 col {at}({len(warnings)} 警告)"
                self.refresh_preview()
                return
            if op == "add-sheet" and len(parts) >= 2:
                self.wb.insert_sheet(parts[1])
                self.wb.save()
                self.message = f"已添加 sheet '{parts[1]}'"
                self.refresh_sheets()
                self.refresh_preview()
                return
            if op == "del-sheet" and len(parts) >= 2:
                self.wb.delete_sheet(parts[1])
                self.wb.save()
                self.message = f"已删除 sheet '{parts[1]}'"
                self.refresh_sheets()
                self.refresh_preview()
                return
            if op == "set" and len(parts) >= 3:
                coord = parts[1]
                value = parts[2]
                # 自动转数字
                if not value.startswith("="):
                    try:
                        value = float(value) if "." in value else int(value)
                    except ValueError:
                        pass
                self.wb.set_cell(self.current_sheet, coord, value)
                self.wb.save()
                self.message = f"已设 {self.current_sheet}!{coord} = {value!r}"
                self.refresh_preview()
                return
            self.message = f"未知命令: {op}(输入 ? 看帮助)"
            self.refresh_preview()
        except Exception as e:
            self.message = f"❌ 错误: {e}"
            self.refresh_preview()
