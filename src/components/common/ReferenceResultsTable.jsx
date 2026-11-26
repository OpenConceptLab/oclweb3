import React from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'

export const LABEL_COLUMN_WIDTH = { xs: '30%', sm: '40%' }

// A table's own border doesn't draw with collapsed borders and overflow hidden, so a box frames it.
// The fixed layout lets a long version URL wrap at phone width instead of cutting off the last column.
const ReferenceResultsTable = ({ borderColor, sx = {}, children }) => (
  <Box sx={[{ border: '1px solid', borderColor, borderRadius: 1, overflow: 'hidden' }, sx]}>
    <Table
      size="small"
      sx={{
        tableLayout: 'fixed',
        '& th, & td': { overflowWrap: 'anywhere' },
        // a header is one short word, which shouldn't break mid-word in the narrow label column
        '& th': { overflowWrap: 'normal' },
        '& tbody tr:last-of-type td': { borderBottom: 0 },
      }}
    >
      {children}
    </Table>
  </Box>
)

export default ReferenceResultsTable
