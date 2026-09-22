import React from 'react';
import { Box, useTheme } from '@mui/material';
import { TableVirtuoso } from 'react-virtuoso';
import MarkdownContent from './MarkdownContent';
import { renderInlineMarkdown } from './markdownPipeline';

const VIRTUALIZE_THRESHOLD = 50;
const VIRTUALIZED_HEIGHT = 480;
const ANCHOR_ID_RE = /<a id="([^"]+)"><\/a>/;

const findAnchorIdsByRow = rows => {
  const map = {};
  rows.forEach((row, index) => {
    row.forEach(cell => {
      const match = ANCHOR_ID_RE.exec(cell);
      if (match) map[match[1]] = index;
    });
  });
  return map;
};

const TableCell = ({ cell }) => {
  const html = React.useMemo(() => renderInlineMarkdown(cell), [cell]);
  // eslint-disable-next-line react/no-danger
  return <Box component="td" sx={{ textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: html }} />;
};

const TableRowContent = ({ row }) => (
  <>
    {row.map((cell, cellIndex) => (
      // eslint-disable-next-line react/no-array-index-key
      <TableCell key={cellIndex} cell={cell} />
    ))}
  </>
);

const VirtualizedMarkdownTable = ({ header, rows, raw, registry }) => {
  const theme = useTheme();
  const virtuosoRef = React.useRef(null);
  const anchorIndex = React.useMemo(() => findAnchorIdsByRow(rows), [rows]);

  React.useEffect(() => {
    if (!registry) return undefined;
    const scrollToAnchor = anchorId => {
      const index = anchorIndex[anchorId];
      if (index === undefined) return false;
      virtuosoRef.current?.scrollToIndex({ index, align: 'center' });
      return true;
    };
    Object.keys(anchorIndex).forEach(id => registry.set(id, scrollToAnchor));
    return () => {
      Object.keys(anchorIndex).forEach(id => {
        if (registry.get(id) === scrollToAnchor) registry.delete(id);
      });
    };
  }, [registry, anchorIndex]);

  if (rows.length < VIRTUALIZE_THRESHOLD) {
    return <MarkdownContent markdown={raw} />;
  }

  return (
    <Box
      sx={{
        my: 2,
        border: '1px solid',
        borderColor: 'surface.nv80',
        '& a': { color: 'primary.main' },
        '& table': { width: '100%', borderCollapse: 'collapse' },
        '& th, & td': {
          border: '1px solid',
          borderColor: 'surface.nv80',
          padding: '6px 13px',
          textAlign: 'left',
          verticalAlign: 'top',
          fontSize: '0.875rem'
        },
        '& th': {
          fontWeight: 700,
          backgroundColor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }
      }}
    >
      <TableVirtuoso
        ref={virtuosoRef}
        style={{ height: VIRTUALIZED_HEIGHT }}
        data={rows}
        fixedHeaderContent={() => (
          <tr>
            {header.map((label, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <th key={index}>{label}</th>
            ))}
          </tr>
        )}
        itemContent={(_, row) => <TableRowContent row={row} />}
        components={{
          // eslint-disable-next-line no-unused-vars
          TableRow: ({ item, ...props }) => (
            <tr
              {...props}
              style={{
                ...props.style,
                backgroundColor: props['data-index'] % 2 === 1 ? theme.palette.action.hover : undefined
              }}
            />
          )
        }}
      />
    </Box>
  );
};

export default VirtualizedMarkdownTable;
