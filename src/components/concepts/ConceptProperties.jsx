import React from 'react';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip';
import map from 'lodash/map'
import ExternalIdLabel from '../common/ExternalIdLabel'

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
                <ExternalIdLabel value={concept.external_id} showFull valueOnly valueStyle={{color: 'rgba(0, 0, 0, 0.87)'}} />
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
                {concept.retired.toString()}
              </TableCell>
            </TableRow>
        }
        {
          map(concept.extras, (value, key) => (
            <TableRow key={key}>
              <TableCell style={{fontSize: '12px', width: '170px'}}>
                {key}
                <Chip
                  label={t('common.custom')}
                  size='small'
                  sx={{
                    height: '20px',
                    borderRadius: '4px',
                    backgroundColor: '#e4e1ec',
                    fontSize: '12px',
                    color: 'surface.dark',
                    marginLeft: '8px',
                    '.MuiChip-label': {
                      padding: '0 6px',
                      fontSize: '12px'
                    }
                  }}
                />
              </TableCell>
              <TableCell sx={{ fontSize: '12px' }}>
                {value}
              </TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}

export default ConceptProperties
