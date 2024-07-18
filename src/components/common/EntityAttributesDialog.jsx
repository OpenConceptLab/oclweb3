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
import { map, get } from 'lodash'
import Link from '../common/Link'
import { formatWebsiteLink } from '../../common/utils'

const EntityAttributesDialog = ({ title, entity, fields, open, onClose }) => {
  const { t } = useTranslation()
  const getValue = (field, info) => {
    let value = get(entity, field)
    if(value) {
      if(info.type === 'datetime')
        return moment(value).format('lll')
      if(info.type === 'external_link')
        return formatWebsiteLink(value)
      if(info.type === 'user')
        return formatWebsiteLink(`${window.location.origin}/#/users/${value}/`, null, value)
      if(info.type === 'json')
        return <pre>{JSON.stringify(value, undefined, 2)}</pre>
    }
    return value
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll='paper'
      maxWidth="xs"
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'surface.n92',
          borderRadius: '28px',
          minWidth: '312px',
          minHeight: '262px',
          padding: 0
        }
      }}
    >
      <DialogTitle sx={{p: 3, color: 'surface.dark', fontSize: '22px', textAlign: 'left'}}>
        {title}
      </DialogTitle>
      <DialogContent style={{padding: '0 8px'}}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><b>{t('common.attribute')}</b></TableCell>
              <TableCell><b>{t('common.value')}</b></TableCell>
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
                    <TableCell component="th" scope="row">
                      {info?.label}
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
