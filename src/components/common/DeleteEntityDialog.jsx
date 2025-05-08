import React from 'react';
import { useTranslation, Trans } from 'react-i18next'
import TextField from '@mui/material/TextField'
import DialogContent from '@mui/material/DialogContent'
import Alert from '@mui/material/Alert'
import Button from '../common/Button';
import Dialog from '../common/Dialog'
import DialogTitle from '../common/DialogTitle'

const DeleteEntityDialog = ({ onSubmit, onClose, open, entityId, entityType, warning, relationship, associationsLabel }) => {
  const { t } = useTranslation()
  const [value, setValue] = React.useState('')
  const onChange = event => setValue(event.target.value || '')

  return (
    <Dialog open={Boolean(open)} onClose={onClose}>
      <DialogTitle>
        <Trans
          i18nKey='common.delete.title'
          values={{resourceType: entityType, resourceId: entityId}}
        />
      </DialogTitle>
      <DialogContent sx={{padding: '16px 0 0 0 !important'}}>
        {
          warning &&
            <Alert variant="filled" severity="warning" sx={{backgroundColor: '#ed6c02 !important', padding: '6px 16px !important', borderRadius: '4px !important'}}>
              {t('common.delete.warning')}
            </Alert>
        }
        <p>
          {t('common.delete.confirmation_title', {resourceType: entityType})} <b>{entityId}</b>?
        </p>
        <p>
          <Trans
            i18nKey='common.delete.message'
            values={{
              resourceType: entityType.toLowerCase(),
              relationship: relationship,
              associationsLabel: associationsLabel
            }}
            components={[<strong key='strong' />]}
          />
        </p>
        <p>
          <Trans
            i18nKey='common.delete.confirmation_message'
            values={{resourceId: entityId}}
            components={[<strong key='strong' />]}
          />
        </p>
        <TextField
          sx={{backgroundColor: 'surface.n92'}}
          fullWidth
          required
          value={value}
          onChange={onChange}
        />
        <Button
          sx={{marginTop: '24px', width: '100%', textTransform: 'uppercase'}}
          color='error'
          label={
            <Trans
              i18nKey='common.delete.confirmation_button_label'
              values={{resourceType: entityType}}
            />
          }
          onClick={onSubmit}
          disabled={value !== entityId}
        />
    </DialogContent>
    </Dialog>
  )
}

export default DeleteEntityDialog;
