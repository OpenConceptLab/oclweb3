import React from 'react';
import { useTranslation, Trans } from 'react-i18next'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Button from '../common/Button';
import Dialog from '../common/Dialog'
import DialogTitle from '../common/DialogTitle'

const RemoveMemberDialog = ({ member, org, onSubmit, onClose, pending }) => {
  const { t } = useTranslation()
  // The name stays while the dialog fades out
  const shown = React.useRef(member)
  if(member)
    shown.current = member
  // Screen readers announce the warning with the title
  const messageId = React.useId()
  return (
    <Dialog open={Boolean(member)} onClose={pending ? undefined : onClose} fullWidth maxWidth='xs' aria-describedby={messageId}>
      <DialogTitle>{t('org.remove_member')}</DialogTitle>
      <DialogContent sx={{padding: '16px 0 0 0 !important'}}>
        <p id={messageId}><Trans i18nKey='org.remove_member_message' values={{user: shown.current?.username, org: org.name}} shouldUnescape /></p>
      </DialogContent>
      <DialogActions sx={{p: 0}}>
        <Button color='default' label={t('common.cancel')} onClick={onClose} disabled={Boolean(pending)} />
        <Button color='error' label={t('common.remove')} onClick={onSubmit} disabled={Boolean(pending)} />
      </DialogActions>
    </Dialog>
  )
}

export default RemoveMemberDialog;
