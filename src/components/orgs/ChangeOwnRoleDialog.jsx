import React from 'react';
import { useTranslation, Trans } from 'react-i18next'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Button from '../common/Button';
import Dialog from '../common/Dialog'
import DialogTitle from '../common/DialogTitle'

const ChangeOwnRoleDialog = ({ onSubmit, onClose, open, org, pending }) => {
  const { t } = useTranslation()
  // Screen readers announce the warning with the title
  const messageId = React.useId()
  return (
    <Dialog open={Boolean(open)} onClose={pending ? undefined : onClose} fullWidth maxWidth='xs' aria-describedby={messageId}>
      <DialogTitle>{t('org.change_role')}</DialogTitle>
      <DialogContent sx={{padding: '16px 0 0 0 !important'}}>
        <p id={messageId}><Trans i18nKey='org.change_own_role_message' values={{org: org.name}} shouldUnescape /></p>
      </DialogContent>
      <DialogActions sx={{p: 0}}>
        <Button color='default' label={t('common.cancel')} onClick={onClose} disabled={Boolean(pending)} />
        <Button color='error' label={t('org.change_role')} onClick={onSubmit} disabled={Boolean(pending)} />
      </DialogActions>
    </Dialog>
  )
}

export default ChangeOwnRoleDialog;
