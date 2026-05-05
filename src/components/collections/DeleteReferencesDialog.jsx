import React from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

const DeleteReferencesDialog = ({ open, onClose, onConfirm, references, loading }) => {
  const { t } = useTranslation()
  const conceptsCount = references.reduce((sum, r) => sum + (r.concepts || 0), 0)
  const mappingsCount = references.reduce((sum, r) => sum + (r.mappings || 0), 0)
  const referenceIds = references.map(r => r.id).filter(Boolean)

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        {t('reference.remove_confirm_title', { count: references.length })}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {t('reference.remove_confirm_body', { concepts: conceptsCount, mappings: mappingsCount })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='text' disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={() => onConfirm({ ids: referenceIds })}
          variant='contained'
          color='error'
          disabled={loading || referenceIds.length === 0}
          startIcon={loading ? <CircularProgress size={16} color='inherit' /> : null}
        >
          {t('common.remove')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteReferencesDialog
