// ============================================
// 简易 Markdown 解析器（够用就行）
// ============================================
window.Markdown = (function() {
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseInline(text) {
    // 代码
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    // 粗体
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // 斜体
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // 链接
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    // 声音档自动标识：检测出"老公"但**非**"老公公"时，加 voice-mark class
    text = text.replace(/(?<![公爷])老公(?![公公])/g, '<span class="voice-mark">老公</span>');
    return text;
  }

  function parse(md) {
    if (!md) return '';
    const lines = md.split('\n');
    let html = '';
    let inList = false;
    let inOrderedList = false;
    let inTable = false;
    let tableHeader = false;
    let inCode = false;
    let codeLang = '';
    let codeBuf = [];

    function closeList() {
      if (inList) { html += '</ul>'; inList = false; }
      if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
    }

    function closeTable() {
      if (inTable) { html += '</tbody></table>'; inTable = false; }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 代码块
      if (trimmed.startsWith('```')) {
        if (inCode) {
          html += `<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`;
          codeBuf = [];
          inCode = false;
        } else {
          closeList(); closeTable();
          inCode = true;
          codeLang = trimmed.slice(3);
        }
        continue;
      }
      if (inCode) {
        codeBuf.push(line);
        continue;
      }

      // 空行
      if (!trimmed) {
        closeList(); closeTable();
        continue;
      }

      // 标题
      const hMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (hMatch) {
        closeList(); closeTable();
        const level = hMatch[1].length;
        html += `<h${level}>${parseInline(hMatch[2])}</h${level}>`;
        continue;
      }

      // 水平线
      if (/^---+\s*$/.test(trimmed) || /^\*\*\*+\s*$/.test(trimmed)) {
        closeList(); closeTable();
        html += '<hr>';
        continue;
      }

      // 引用
      if (trimmed.startsWith('> ')) {
        closeList(); closeTable();
        html += `<blockquote>${parseInline(trimmed.slice(2))}</blockquote>`;
        continue;
      }

      // 表格
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
        // 跳过分隔行 | --- | --- |
        if (cells.every(c => /^[-:]+$/.test(c))) continue;
        if (!inTable) {
          html += '<table><thead>';
          inTable = true;
          tableHeader = true;
        }
        if (tableHeader) {
          html += '<tr>' + cells.map(c => `<th>${parseInline(c)}</th>`).join('') + '</tr></thead><tbody>';
          tableHeader = false;
        } else {
          html += '<tr>' + cells.map(c => `<td>${parseInline(c)}</td>`).join('') + '</tr>';
        }
        continue;
      } else {
        closeTable();
      }

      // 无序列表
      const ulMatch = trimmed.match(/^[-*+]\s+(.+)$/);
      if (ulMatch) {
        if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${parseInline(ulMatch[1])}</li>`;
        continue;
      }

      // 有序列表
      const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
      if (olMatch) {
        if (inList) { html += '</ul>'; inList = false; }
        if (!inOrderedList) { html += '<ol>'; inOrderedList = true; }
        html += `<li>${parseInline(olMatch[1])}</li>`;
        continue;
      }

      // checkbox 列表
      const cbMatch = trimmed.match(/^-\s+\[(.{1})\]\s+(.+)$/);
      if (cbMatch) {
        if (!inList) { html += '<ul>'; inList = true; }
        const checked = cbMatch[1] === 'x' ? '☑' : '☐';
        html += `<li>${checked} ${parseInline(cbMatch[2])}</li>`;
        continue;
      }

      // 普通段落
      closeList();
      html += `<p>${parseInline(trimmed)}</p>`;
    }

    closeList(); closeTable();
    if (inCode) {
      html += `<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`;
    }
    return html;
  }

  return { parse, escapeHtml, parseInline };
})();
