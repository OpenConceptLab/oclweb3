
const TABLE_ROW_RE = /^\|.*\|\s*$/;
const TABLE_SEPARATOR_RE = /^\|(\s*:?-+:?\s*\|)+\s*$/;

const splitRow = line => {
  const inner = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return inner.split(/(?<!\\)\|/).map(cell => cell.trim().replace(/\\\|/g, '|'));
};

export const splitMarkdownBlocks = markdown => {
  const lines = (markdown || '').split('\n');
  const blocks = [];
  let buffer = [];
  let i = 0;

  const flushBuffer = () => {
    if (buffer.length) blocks.push({ type: 'markdown', content: buffer.join('\n') });
    buffer = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    const next = lines[i + 1] || '';
    if (TABLE_ROW_RE.test(line) && TABLE_SEPARATOR_RE.test(next)) {
      flushBuffer();
      const rawLines = [line, next];
      const header = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && TABLE_ROW_RE.test(lines[i])) {
        rawLines.push(lines[i]);
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      blocks.push({ type: 'table', header, rows, raw: rawLines.join('\n') });
    } else {
      buffer.push(line);
      i += 1;
    }
  }
  flushBuffer();
  return blocks;
};
