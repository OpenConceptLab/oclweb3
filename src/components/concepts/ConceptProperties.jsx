import React from 'react';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

const ConceptProperties = ({ concept }) => {
  const { t } = useTranslation()
  return (
    <Table>
      <TableBody sx={{ '.MuiTableRow-root': {'&:last-child td': {border: 0, borderRadius: '10px'}} }}>
        <TableRow>
          <TableCell style={{fontSize: '12px', width: '150px'}}>
            {t('concept.concept_class')}
          </TableCell>
          <TableCell style={{fontSize: '12px'}}>
            {concept?.concept_class}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{fontSize: '12px', width: '150px'}}>
            {t('concept.datatype')}
          </TableCell>
          <TableCell style={{fontSize: '12px'}}>
            {concept?.datatype}
          </TableCell>
        </TableRow>
        {
          concept?.external_id &&
            <TableRow>
              <TableCell style={{fontSize: '12px', width: '170px'}}>
                {t('common.external_id')}
              </TableCell>
              <TableCell sx={{ fontSize: '12px' }}>
                {concept.external_id}
              </TableCell>
            </TableRow>
        }
        {
          concept?.retired &&
            <TableRow>
              <TableCell style={{fontSize: '12px', width: '170px'}}>
                {t('common.retired')}
              </TableCell>
              <TableCell sx={{ fontSize: '12px' }}>
                {concept.retired}
              </TableCell>
            </TableRow>
        }
        <TableRow>
          <TableCell style={{fontSize: '12px', width: '150px'}}>
            {t('checksums.standard')}
          </TableCell>
          <TableCell style={{fontSize: '12px'}}>
            {concept?.checksums?.standard}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{fontSize: '12px', width: '170px'}}>
            {t('checksums.smart')}
          </TableCell>
          <TableCell sx={{ fontSize: '12px' }}>
            {concept?.checksums?.smart}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default ConceptProperties
