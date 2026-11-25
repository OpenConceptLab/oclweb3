import React from 'react'
import { useTranslation } from 'react-i18next'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import ReferenceResultsTable, { LABEL_COLUMN_WIDTH } from './ReferenceResultsTable'

// References the API saved but that added nothing to the collection; the message is the API's, as given
const UnresolvedReferencesTable = ({ items, getLabel, sx = {} }) => {
  const { t } = useTranslation()
  return (
    <ReferenceResultsTable borderColor="warning.main" sx={sx}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600, width: LABEL_COLUMN_WIDTH, color: 'text.primary' }}>
            {t('addToCollection.reference_header')}
          </TableCell>
          <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
            {t('addToCollection.unresolved_header')}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, idx) => (
          <TableRow key={item.expression || idx} sx={{ verticalAlign: 'top' }}>
            <TableCell sx={{ fontSize: '0.8rem' }}>{getLabel(item.expression)}</TableCell>
            <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
              {typeof item.message === 'string' ? item.message : ''}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </ReferenceResultsTable>
  )
}

export default UnresolvedReferencesTable
