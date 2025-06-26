import React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { map, get, keys, flatten, uniq, isBoolean } from 'lodash'
import Link from '../common/Link'
import { formatWebsiteLink, formatDate, formatDateTime } from '../../common/utils'

const EntityAttributesDialog = ({ entity, fields, open, onClose }) => {
  const { t } = useTranslation()
  const getValue = (field, info) => {
    let value = get(entity, field)
    if(value) {
      if(info.type === 'datetime')
        return moment(value).format('lll')
      if(info.type === 'datetime')
        return formatDateTime(value)
      if(info.type === 'date')
        return formatDate(value)
      if(info.type === 'external_link')
        return formatWebsiteLink(value)
      if(info.type === 'user')
        return <Link sx={{fontSize: '14px'}} label={value} href={`#/users/${value}/`} />
      if(info.type === 'json')
        return <pre>{JSON.stringify(value, undefined, 2)}</pre>
      if(info.type === 'table') {
        if(value?.length > 0) {
          let columns = uniq(flatten(value.map(val => keys(val))))
          return <Table size='small' sx={{'.MuiTableCell-root': {padding: '6px', border: '1px solid rgba(0, 0, 0, 0.1)'}}}>
                   <TableHead>
                     <TableRow>
                       {
                         columns.map(
                           col => <TableCell key={col} sx={{fontSize: '12px'}}><b>{col}</b></TableCell>
                         )
                       }
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     {
                       map(value, (val, index) => (
                         <TableRow key={index}>
                           {
                             columns.map(col => (
                               <TableCell key={col}>
                                 <span style={{display: 'inline-block', maxWidth: '200px', wordBreak: 'break-all'}}>
                                   {isBoolean(val[col]) ? val[col].toString() : val[col] || null}
                                 </span>
                               </TableCell>
                             ))
                           }
                         </TableRow>
                       ))
                     }
          </TableBody>
                 </Table>
        } else {
          return value
        }
      }
    }
    return value
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll='paper'
      maxWidth="lg"
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'surface.n92',
          borderRadius: '28px',
          minWidth: entity?.properties?.length > 0 ? '812px' : '312px',
          minHeight: '262px',
          padding: 0
        }
      }}
    >
      <DialogTitle sx={{p: 3, color: 'surface.dark', fontSize: '22px', textAlign: 'left'}}>
        {entity.type} {t('common.attributes')}
      </DialogTitle>
      <DialogContent style={{padding: '0 8px'}}>
        <Table size="small" sx={{'.MuiTableCell-root': {padding: '6px'}}}>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontSize: '12px'}}><b>{t('common.attribute')}</b></TableCell>
              <TableCell sx={{fontSize: '12px'}}><b>{t('common.value')}</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              map(fields, (info, field) => {
                return (
                  <TableRow
                    key={field}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" sx={{fontSize: '12px', color: 'rgba(0, 0, 0, 0.7)'}}>
                      <span style={{maxWidth: '125px', display: 'inline-block'}}>{info?.label}</span>
                    </TableCell>
                    <TableCell>{getValue(field, info)}</TableCell>
                  </TableRow>
                )
              })
            }
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions sx={{p: 3}}>
        <Link sx={{fontSize: '14px'}} label={t('common.close')} onClick={onClose} />
      </DialogActions>
    </Dialog>
  )
}

export default EntityAttributesDialog;
