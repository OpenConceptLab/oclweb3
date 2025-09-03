import React from 'react';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip';
import map from 'lodash/map'
import get from 'lodash/get'
import has from 'lodash/has'
import omitBy from 'lodash/omitBy'
import fromPairs from 'lodash/fromPairs'
import sortBy from 'lodash/sortBy'
import toPairs from 'lodash/toPairs'
import isBoolean from 'lodash/isBoolean'
import compact from 'lodash/compact'

const ConceptProperties = ({ concept, repo }) => {
  const { t } = useTranslation()
  const properties = repo?.meta?.display?.concept_summary_properties?.length > 0 ? repo?.meta?.display?.concept_summary_properties : ['concept_class', 'datatype']
  let definitions = compact(properties.map(prop => {
    const isDirect = has(concept, prop)
    let isDefined = isDirect || has(concept, `extras.${prop}`)
    if(isDefined) {
      let customValue = get(concept, `extras.${prop}`)

      if(!isDirect && isBoolean(customValue))
        customValue = customValue.toString()

      return {label: isDirect ? t(`concept.${prop}`) : prop, value: isDirect ? get(concept, prop) : customValue}
    }
  }))
  let extras = omitBy(concept?.extras, (value, key) => properties.includes(key)) || {}
  extras = fromPairs(sortBy(toPairs(extras), 0))
  return (
    <Table size='small'>
      <TableBody sx={{ '.MuiTableRow-root': {'&:last-child td': {border: 0, borderRadius: '10px'}} }}>
        {
          map(definitions, (definition, index) => {
            return (
              <TableRow key={index}>
                <TableCell style={{fontSize: '0.875rem', width: '150px', whiteSpace: definition.custom ? 'pre': undefined}}>
                  {definition.label}
                </TableCell>
                <TableCell style={{fontSize: '0.875rem'}} className='searchable'>
                  {definition.value}
                </TableCell>
              </TableRow>
            )
          })
        }
        {
          map(extras, (value, key) => (
            <TableRow key={key}>
              <TableCell style={{fontSize: '0.875rem', width: '170px', whiteSpace: 'pre'}}>
                {key}
                <Chip
                  label={t('common.custom')?.toLowerCase()}
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
              <TableCell sx={{ fontSize: '0.875rem' }}>
                {isBoolean(value) ? value.toString() : value}
              </TableCell>
            </TableRow>
          ))
        }
        {
          concept?.retired &&
            <TableRow>
              <TableCell style={{fontSize: '0.875rem', width: '170px'}}>
                {t('common.retired')}
              </TableCell>
              <TableCell sx={{ fontSize: '0.875rem' }}>
                {concept.retired.toString()}
              </TableCell>
            </TableRow>
        }
      </TableBody>
    </Table>
  )
}

export default ConceptProperties
