import React from 'react';
import {
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

const renderInlineMarkdown = text => {
  const tokens = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match;

  while((match = pattern.exec(text || ''))) {
    if(match.index > lastIndex)
      tokens.push(text.slice(lastIndex, match.index));

    if(match[2])
      tokens.push(<strong key={tokens.length}>{match[2]}</strong>);
    else if(match[3])
      tokens.push(<em key={tokens.length}>{match[3]}</em>);
    else if(match[4])
      tokens.push(<Box component="code" key={tokens.length} sx={{ fontFamily: 'monospace', px: 0.5, bgcolor: 'surface.main', borderRadius: '3px' }}>{match[4]}</Box>);
    else if(match[5])
      tokens.push(<a key={tokens.length} href={match[6]} target="_blank" rel="noopener noreferrer">{match[5]}</a>);

    lastIndex = pattern.lastIndex;
  }

  if(lastIndex < (text || '').length)
    tokens.push(text.slice(lastIndex));

  return tokens;
};

const parseMarkdownTable = lines => {
  if(lines.length < 2 || !lines[0].trim().startsWith('|') || !lines[1].includes('---'))
    return null;

  const parseRow = line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());
  const headers = parseRow(lines[0]);
  const rows = [];
  let nextIndex = 2;

  while(nextIndex < lines.length && lines[nextIndex].trim().startsWith('|')) {
    rows.push(parseRow(lines[nextIndex]));
    nextIndex += 1;
  }

  return { headers, rows, nextIndex };
};

const MarkdownContent = ({ markdown }) => {
  const lines = (markdown || '').split('\n');
  const elements = [];
  let index = 0;

  while(index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if(!trimmed) {
      index += 1;
      continue;
    }

    if(trimmed === '---') {
      elements.push(<Divider key={elements.length} sx={{ my: 2 }} />);
      index += 1;
      continue;
    }

    const table = parseMarkdownTable(lines.slice(index));
    if(table) {
      elements.push(
        <TableContainer key={elements.length} sx={{ my: 2, border: '1px solid', borderColor: 'surface.nv80', borderRadius: '4px' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {table.headers.map(header => <TableCell key={header} sx={{ fontWeight: 700 }}>{renderInlineMarkdown(header)}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {table.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => <TableCell key={`${rowIndex}-${cellIndex}`}>{renderInlineMarkdown(cell)}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
      index += table.nextIndex;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if(heading) {
      const variant = heading[1].length <= 1 ? 'h6' : 'subtitle1';
      elements.push(
        <Typography key={elements.length} variant={variant} sx={{ mt: elements.length ? 2.5 : 0, mb: 1, fontWeight: 700 }}>
          {renderInlineMarkdown(heading[2])}
        </Typography>
      );
      index += 1;
      continue;
    }

    if(trimmed.startsWith('>')) {
      elements.push(
        <Box key={elements.length} sx={{ borderLeft: '3px solid', borderColor: 'primary.main', pl: 1.5, my: 1.5, color: 'text.secondary' }}>
          <Typography variant="body2">{renderInlineMarkdown(trimmed.replace(/^>\s?/, ''))}</Typography>
        </Box>
      );
      index += 1;
      continue;
    }

    elements.push(
      <Typography key={elements.length} variant="body2" sx={{ my: 1, lineHeight: 1.6 }}>
        {renderInlineMarkdown(trimmed)}
      </Typography>
    );
    index += 1;
  }

  return <Box sx={{ '& a': { color: 'primary.main' } }}>{elements}</Box>;
};

export default MarkdownContent;
