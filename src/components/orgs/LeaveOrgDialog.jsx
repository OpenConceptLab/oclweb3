import React from 'react';
import { useTranslation } from 'react-i18next'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Button from '../common/Button';
import Dialog from '../common/Dialog'
import DialogTitle from '../common/DialogTitle'

const LeaveOrgDialog = ({ onSubmit, onClose, open, org, pending }) => {
  const { t } = useTranslation()
  return (
    <Dialog open={Boolean(open)} onClose={onClose} fullWidth maxWidth='xs'>
      <DialogTitle>{t('org.leave_org')}</DialogTitle>
      <DialogContent sx={{padding: '16px 0 0 0 !important'}}>
        <p>{t('org.leave_org_message', {org: org.name})}</p>
      </DialogContent>
      <DialogActions sx={{p: 0}}>
        <Button color='default' label={t('common.cancel')} onClick={onClose} />
        <Button color='primary' label={t('org.leave_org')} onClick={onSubmit} disabled={Boolean(pending)} />
      </DialogActions>
    </Dialog>
  )
}

export default LeaveOrgDialog;
