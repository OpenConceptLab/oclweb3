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
  const selectedReferences = references || []
  const conceptsCount = selectedReferences.reduce((sum, r) => sum + (r.concepts || 0), 0)
  const mappingsCount = selectedReferences.reduce((sum, r) => sum + (r.mappings || 0), 0)
  const referenceIds = selectedReferences.map(r => r.id).filter(Boolean)
  const getResourceCountLabel = (count, singular, plural) => `${count.toLocaleString()} ${count === 1 ? singular : plural}`
  const resolvedCounts = [
    conceptsCount > 0 ? getResourceCountLabel(conceptsCount, t('concept.concept').toLowerCase(), t('concept.concepts').toLowerCase()) : null,
    mappingsCount > 0 ? getResourceCountLabel(mappingsCount, t('mapping.mapping').toLowerCase(), t('mapping.mappings').toLowerCase()) : null,
  ].filter(Boolean)

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        {t('reference.remove_confirm_title', { count: selectedReferences.length, reference: selectedReferences.length === 1 ? t('reference.reference').toLowerCase() : t('reference.references').toLowerCase() })}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {
            resolvedCounts.length ?
              t('reference.remove_confirm_body', { summary: resolvedCounts.join(', ') }) :
              t('reference.remove_confirm_body_selected')
          }
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='text' disabled={loading} sx={{ textTransform: 'none' }}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={() => onConfirm({ ids: referenceIds })}
          variant='contained'
          color='error'
          disabled={loading || referenceIds.length === 0}
          startIcon={loading ? <CircularProgress size={16} color='inherit' /> : null}
          sx={{ textTransform: 'none' }}
        >
          {t('common.remove')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteReferencesDialog
