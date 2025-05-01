import React from 'react';
import { useTranslation, Trans } from 'react-i18next'
import DialogContent from '@mui/material/DialogContent'
import Button from '../common/Button';
import Dialog from '../common/Dialog'
import DialogTitle from '../common/DialogTitle'

const ReleaseVersion = ({ onSubmit, onClose, open, repo }) => {
  const { t } = useTranslation()
  const repoType = repo.type
  const repoId = `${repo.short_code} [${repo.version}]`
  const isReleased = repo.released

  return (
    <Dialog open={Boolean(open)} onClose={onClose}>
      <DialogTitle>
        <Trans
          i18nKey={'repo.version.update_dialog.title'}
          values={{resourceType: repoType, resourceId: repoId}}
        />
      </DialogTitle>
      <DialogContent sx={{padding: '16px 0 0 0 !important'}}>
        <p style={{fontSize: '1rem'}}>
          <Trans
            i18nKey='repo.version.update_dialog.message'
            values={{
              resourceType: repoType.toLowerCase(),
              repoId: repoId,
              action: isReleased ? t('common.unrelease') : t('common.release')
            }}
          />
        </p>
        <Button
          sx={{marginTop: '24px'}}
          color='primary'
          label={t('common.submit')}
          onClick={onSubmit}
        />
    </DialogContent>
    </Dialog>
  )
}

export default ReleaseVersion;
