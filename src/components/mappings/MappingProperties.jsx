import React from 'react';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

const MappingProperties = ({ mapping }) => {
  const { t } = useTranslation()
  return (
    <Table>
      <TableBody sx={{ '.MuiTableRow-root': {'&:last-child td': {border: 0, borderRadius: '10px'}} }}>
        {
          mapping?.external_id &&
            <TableRow>
              <TableCell style={{fontSize: '12px', width: '170px'}}>
                {t('common.external_id')}
              </TableCell>
              <TableCell sx={{ fontSize: '12px' }}>
                {mapping.external_id}
              </TableCell>
            </TableRow>
        }
        {
          mapping?.retired &&
            <TableRow>
              <TableCell style={{fontSize: '12px', width: '170px'}}>
                {t('common.retired')}
              </TableCell>
              <TableCell sx={{ fontSize: '12px' }}>
                {mapping.retired}
              </TableCell>
            </TableRow>
        }
        <TableRow>
          <TableCell style={{fontSize: '12px', width: '150px'}}>
            {t('checksums.standard')}
          </TableCell>
          <TableCell style={{fontSize: '12px'}}>
            {mapping?.checksums?.standard}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{fontSize: '12px', width: '170px'}}>
            {t('checksums.smart')}
          </TableCell>
          <TableCell sx={{ fontSize: '12px' }}>
            {mapping?.checksums?.smart}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default MappingProperties
