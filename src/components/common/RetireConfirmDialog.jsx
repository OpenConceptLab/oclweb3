import React from 'react';
import { useTranslation } from 'react-i18next'
import TextField from '@mui/material/TextField'
import DialogContent from '@mui/material/DialogContent'
import Button from './Button';
import Dialog from './Dialog'
import DialogTitle from './DialogTitle'

const RetireConfirmDialog = ({ onSubmit, onClose, open, title }) => {
  const { t } = useTranslation()
  const [value, setValue] = React.useState('')
  const [error, setError] = React.useState('')
  const onChange = event => {
    let value = event.target.value || ''
    if(value && error)
      setError(false)
    setValue(value)
  }
  const _onSubmit = () => {
    if(!value) {
      setError(t('errors.mandatory_field'))
      return
    }
    setError(false)
    onSubmit(value)
  }
  return (
    <Dialog open={Boolean(open)} onClose={onClose} fullWidth maxWidth='xs'>
    <DialogTitle>
    {title}
    </DialogTitle>
      <DialogContent sx={{padding: '16px 0 0 0 !important'}}>
        <TextField
          sx={{backgroundColor: 'surface.n92'}}
          fullWidth
          required
          label={t('common.reason')}
          value={value}
          error={Boolean(error)}
          helperText={error}
          onChange={onChange}
          multiline
          rows={2}
          maxRows={4}
        />
        <Button sx={{marginTop: '16px'}} color='primary' label={t('common.submit')} onClick={_onSubmit} />
    </DialogContent>
    </Dialog>
  )
}

export default RetireConfirmDialog;
