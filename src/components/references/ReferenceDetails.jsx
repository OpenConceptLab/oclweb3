import React from 'react'
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { startCase, isString, isPlainObject, map } from 'lodash'
import { formatDateTime } from '../../common/utils'
import Link from '../common/Link'


const borderColor = 'rgba(0, 0, 0, 0.12)'

const ReferenceDetails = ({ reference, style }) => {
  const { t } = useTranslation()
  const getCascadeDetails = () => {
    if(!reference?.cascade)
      return {}
    if(isString(reference.cascade))
      return {method: reference.cascade}
    if(isPlainObject(reference.cascade))
      return reference.cascade
    return {}
  }
  return (
    <div className='col-xs-12' style={{padding: '16px 0', height: 'calc(100vh - 280px)', overflow: 'auto', ...style}}>
      <Paper className='col-xs-12 padding-0' sx={{boxShadow: 'none', border: '1px solid', borderColor: borderColor, borderRadius: '10px'}}>
        <Typography component='span' sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
          {t('reference.details')}
        </Typography>
        <Table size='small'>
      <TableBody sx={{ '.MuiTableRow-root': {'&:last-child td': {border: 0, borderRadius: '10px'}} }}>
        <TableRow>
          <TableCell style={{fontSize: '0.875rem', width: '150px'}}>
            {t('reference.type')}
          </TableCell>
          <TableCell style={{fontSize: '0.875rem'}}>
            {startCase(reference.reference_type)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{fontSize: '0.875rem', width: '150px'}}>
            {t('reference.translation')}
          </TableCell>
          <TableCell style={{fontSize: '0.875rem'}}>
            {reference.translation}
          </TableCell>
        </TableRow>
        {
          map(getCascadeDetails(), (value, key) => {
            let val = isPlainObject(value) ? <span style={{whiteSpace: 'pre'}}>{JSON.stringify(value, undefined, 2)}</span> : value
            return (
              <TableRow key={key}>
              <TableCell style={{fontSize: '0.875rem', width: '150px'}}>
                {`Cascade ${startCase(key)}`}
              </TableCell>
              <TableCell style={{fontSize: '0.875rem'}}>
                {val}
              </TableCell>
              </TableRow>
            )
          })
        }
        {
          Boolean(reference.transform) &&
            <TableRow>
              <TableCell style={{fontSize: '0.875rem', width: '150px'}}>
                {t('reference.transform')}
              </TableCell>
              <TableCell style={{fontSize: '0.875rem'}}>
                {
                  ['resourceversions', 'intensional'].includes(reference.transform?.toLowerCase()) ?
                    t('reference.intensional') :
                    (
                      reference.transform?.toLowerCase() === 'extensional' ?
                        t('reference.extensional') :
                        reference.transform
                    )
                }
              </TableCell>
            </TableRow>
        }
      </TableBody>
    </Table>
      </Paper>
      {
        reference.filter?.length > 0 &&
          <Paper className='col-xs-12 padding-0' sx={{boxShadow: 'none', border: '1px solid', borderColor: borderColor, borderRadius: '10px', marginTop: '16px'}}>
        <Typography component='span' sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
        {t('repo.filters')}
        </Typography>
        <Table size='small'>
          <TableBody sx={{ '.MuiTableRow-root': {'&:last-child td': {border: 0, borderRadius: '10px'}} }}>
            {
              map(reference.filter, (refFilter, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell style={{fontSize: '0.875rem', width: '150px'}}>
                      {refFilter?.property} {refFilter?.op}
                    </TableCell>
                    <TableCell style={{fontSize: '0.875rem'}}>
                      {refFilter?.value}
                    </TableCell>
                  </TableRow>
                )
              })
            }
        </TableBody>
        </Table>
        </Paper>
      }
      <div className='col-xs-12 padding-0' style={{marginTop: '32px'}}>
        <Typography component='span' sx={{display: 'inline-flex', alignItems: 'center', padding: 0, fontSize: '12px', color: 'surface.contrastText', width: '100%', }}>
          {
            `${t('reference.last_resolved_at')} `
          }
          {
            reference.last_resolved_at ? formatDateTime(reference.last_resolved_at) : <i style={{marginLeft: '8px'}}> -</i>
          }
        </Typography>
        <Typography component='span' sx={{display: 'inline-flex', alignItems: 'center', padding: 0, fontSize: '12px', color: 'surface.contrastText', width: '100%', }}>
          {t('common.created_on')} {
            <>{formatDateTime(reference.created_at)} {t('common.by')} <Link sx={{fontSize: '12px', justifyContent: 'flex-start', padding: '0 0 0 2px', lineHeight: 'normal'}} href={`#/users/${reference.created_by}`} label={reference.created_by} /></>
          }
        </Typography>

      </div>
    </div>
  )
}

export default ReferenceDetails;
