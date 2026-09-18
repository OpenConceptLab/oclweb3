/* eslint-disable spellcheck/spell-checker */
import React from 'react';
import { Box } from '@mui/material';
import { TableVirtuoso } from 'react-virtuoso';
import MarkdownContent from './MarkdownContent';
import { renderInlineMarkdown } from './markdownPipeline';

const VIRTUALIZE_THRESHOLD = 50;
const VIRTUALIZED_HEIGHT = 480;

const cellSx = {
  border: '1px solid',
  borderColor: 'surface.nv80',
  padding: '6px 13px',
  verticalAlign: 'top',
  fontSize: '0.875rem'
};

const TableCell = ({ cell, align }) => {
  const html = React.useMemo(() => renderInlineMarkdown(cell), [cell]);
  // eslint-disable-next-line react/no-danger
  return <td align={align || 'left'} style={cellSx} dangerouslySetInnerHTML={{ __html: html }} />;
};

const TableRow = ({ row, align }) => (
  <>
    {row.map((cell, cellIndex) => (
      // eslint-disable-next-line react/no-array-index-key
      <TableCell key={cellIndex} cell={cell} align={align[cellIndex]} />
    ))}
  </>
);

const VirtualizedMarkdownTable = ({ header, align, rows, raw }) => {
  if (rows.length < VIRTUALIZE_THRESHOLD) {
    return <MarkdownContent markdown={raw} />;
  }

  return (
    <Box
      sx={{
        my: 2,
        border: '1px solid',
        borderColor: 'surface.nv80',
        '& table': { width: '100%', borderCollapse: 'collapse' },
        '& th': {
          border: '1px solid',
          borderColor: 'surface.nv80',
          padding: '6px 13px',
          textAlign: 'left',
          fontWeight: 700,
          backgroundColor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 1
        },
        '& tr:nth-of-type(even)': { backgroundColor: 'action.hover' }
      }}
    >
      <TableVirtuoso
        style={{ height: VIRTUALIZED_HEIGHT }}
        data={rows}
        fixedHeaderContent={() => (
          <tr>
            {header.map((label, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <th key={index} align={align[index] || 'left'}>{label}</th>
            ))}
          </tr>
        )}
        itemContent={(_, row) => <TableRow row={row} align={align} />}
      />
    </Box>
  );
};

export default VirtualizedMarkdownTable;
