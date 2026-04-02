import React from 'react';
import { useTranslation } from 'react-i18next'
import DialogContent from '@mui/material/DialogContent'
import Button from '../common/Button';
import Dialog from '../common/Dialog'
import DialogTitle from '../common/DialogTitle'

const DeleteReferencesDialog = ({ open, onClose, onConfirm, referenceCount, conceptCount, mappingCount }) => {
  const { t } = useTranslation()

  return (
    <Dialog open={Boolean(open)} onClose={onClose}>
      <DialogTitle>
        {t('reference.delete_dialog.title', { count: referenceCount })}
      </DialogTitle>
      <DialogContent sx={{padding: '16px 0 0 0 !important'}}>
        <p style={{fontSize: '1rem'}}>
          {t('reference.delete_dialog.message', { concepts: conceptCount, mappings: mappingCount })}
        </p>
        <div style={{display: 'flex', gap: '8px', marginTop: '24px'}}>
          <Button
            label={t('common.cancel')}
            onClick={onClose}
          />
          <Button
            color='error'
            label={t('common.remove')}
            onClick={onConfirm}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteReferencesDialog;
