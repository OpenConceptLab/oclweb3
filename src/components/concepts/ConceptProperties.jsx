import React from 'react';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip';
import ListItemText from '@mui/material/ListItemText'
import map from 'lodash/map'
import get from 'lodash/get'
import omitBy from 'lodash/omitBy'
import fromPairs from 'lodash/fromPairs'
import sortBy from 'lodash/sortBy'
import toPairs from 'lodash/toPairs'
import isBoolean from 'lodash/isBoolean'
import compact from 'lodash/compact'
import keys from 'lodash/keys'
import find from 'lodash/find'
import startCase from 'lodash/startCase'

const getRawProperties = concept => {
  const rawProperties = {}
  if(concept?.property?.length)
    rawProperties.properties = concept.property
  if(concept?.extras && Object.keys(concept.extras).length)
    rawProperties.extras = concept.extras
  return rawProperties
}

const ConceptProperties = ({ concept, viewRaw }) => {
  const { t } = useTranslation()
  const isPropertiesDefined = concept?.property?.length > 0
  const sortedProperties = concept?.property?.length > 0 ? concept.property.map(prop => prop.code) : ['concept_class', 'datatype'];
  let definitions = compact(sortedProperties.map(prop => {
    if(isPropertiesDefined) {
      let property = find(concept.property, {code: prop})
      if(property?.code) {
        let label = property.display || startCase(prop)
        if(!property.display && ['concept_class', 'datatype'].includes(prop)) {
          label = t(`concept.${prop}`)
        }
        return {label: label, value: property[keys(property).filter(key => key!== 'code')[0]], code: prop}
      }
    }
    return {label: t(`concept.${prop}`), value: get(concept, prop)}
  }))
  let extras = omitBy(concept?.extras, (value, key) => sortedProperties.includes(key)) || {}
  extras = fromPairs(sortBy(toPairs(extras), 0))
  if(viewRaw) {
    return (
      <pre
        className='searchable'
        style={{
          margin: 0,
          padding: '16px',
          fontSize: '0.875rem',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {JSON.stringify(getRawProperties(concept), null, 2)}
      </pre>
    )
  }

  return (
    <Table size='small'>
      <TableBody sx={{ '.MuiTableRow-root': {'&:last-child td': {border: 0, borderRadius: '10px'}} }}>
        {
          map(definitions, (definition, index) => {
            return (
              <TableRow key={index}>
                <TableCell sx={{fontSize: '0.875rem', width: '150px', whiteSpace: definition.custom ? 'pre': undefined, verticalAlign: 'top'}}>
                  <ListItemText primary={definition.label} secondary={definition.label !== definition.code ? definition.code : undefined} sx={{margin: 0, '.MuiListItemText-primary': {fontSize: '0.875rem'}, '.MuiListItemText-secondary': {fontSize: '0.75rem'}}} />
                </TableCell>
                <TableCell sx={{fontSize: '0.875rem', verticalAlign: 'top'}} className='searchable'>
                  {isBoolean(definition.value) ? definition.value.toString() : definition.value}
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
