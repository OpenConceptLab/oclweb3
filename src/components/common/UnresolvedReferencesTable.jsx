import React from 'react'
import { useTranslation } from 'react-i18next'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

// References the API saved but that added nothing to the collection; the message is the API's, as given
const UnresolvedReferencesTable = ({ items, getLabel, sx }) => {
  const { t } = useTranslation()
  return (
    <Table size="small" sx={[{ border: '1px solid', borderColor: 'warning.main', borderRadius: 1, overflow: 'hidden' }, sx]}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600, width: '40%', color: 'warning.main' }}>
            {t('addToCollection.reference_header')}
          </TableCell>
          <TableCell sx={{ fontWeight: 600, color: 'warning.main' }}>
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
    </Table>
  )
}

export default UnresolvedReferencesTable
