import React from 'react';
import { useTranslation, Trans } from 'react-i18next'
import TextField from '@mui/material/TextField'
import DialogContent from '@mui/material/DialogContent'
import Alert from '@mui/material/Alert'
import Button from '../common/Button';
import Dialog from '../common/Dialog'
import DialogTitle from '../common/DialogTitle'

const DeleteRepo = ({ onSubmit, onClose, open, repo }) => {
  const { t } = useTranslation()
  const [value, setValue] = React.useState('')
  const onChange = event => setValue(event.target.value || '')
  const repoType = repo.type.replace(' Version', '')
  const repoId = repo.short_code || repo.id

  return (
    <Dialog open={Boolean(open)} onClose={onClose}>
      <DialogTitle>
        <Trans
          i18nKey='repo.delete.title'
          values={{resourceType: repoType, resourceId: repoId}}
        />
    </DialogTitle>
      <DialogContent sx={{padding: '16px 0 0 0 !important'}}>
        <Alert variant="filled" severity="warning" sx={{backgroundColor: '#ed6c02 !important', padding: '6px 16px !important', borderRadius: '4px !important'}}>
          {t('repo.delete.warning')}
        </Alert>
        <p>
          {t('repo.delete.confirmation_title', {resourceType: repoType})} <b>{repoId}</b>?
        </p>
        <p>
          <Trans
            i18nKey='repo.delete.message'
            values={{
              resourceType: repoType.toLowerCase(),
              relationship: 'versions, ',
              associationsLabel: 'concepts and mappings'
            }}
            components={[<strong key='strong' />]}
          />
        </p>
        <p>
          <Trans
            i18nKey="repo.delete.confirmation_message"
            values={{resourceId: repoId}}
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
              i18nKey="repo.delete.confirmation_button_label"
              values={{resourceType: repoType}}
            />
          }
          onClick={onSubmit}
          disabled={value !== repoId}
        />
    </DialogContent>
    </Dialog>
  )
}

export default DeleteRepo;
