import React from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Alert from '@mui/material/Alert'
import { getTransformPreviewItems } from './referenceTransformUtils'

const expressionSx = {
  fontFamily: 'monospace',
  fontSize: '12px',
  overflowWrap: 'anywhere',
  maxWidth: '260px',
}

const TransformReferencesDialog = ({ open, onClose, onConfirm, references, loading }) => {
  const { t } = useTranslation()
  const previewItems = React.useMemo(() => getTransformPreviewItems(references), [references])
  const eligibleItems = previewItems.filter(item => item.eligible)
  const skippedItems = previewItems.filter(item => !item.eligible)
  const selectedCount = references?.length || 0

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        {t('reference.transform_confirm_title', { count: selectedCount })}
      </DialogTitle>
      <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
        <Typography variant='body2' sx={{
          color: 'text.secondary'
        }}>
          {t('reference.transform_confirm_body')}
        </Typography>
        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
          <Chip size='small' color='primary' label={`${selectedCount} ${t('common.selected')}`} />
          <Chip size='small' color='success' label={`${eligibleItems.length} ${t('common.eligible')}`} />
          <Chip size='small' color={skippedItems.length ? 'warning' : 'default'} label={`${skippedItems.length} ${t('common.skipped')}`} />
        </Box>
        {eligibleItems.length === 0 && (
          <Alert severity='warning'>
            {t('reference.transform_no_eligible')}
          </Alert>
        )}

        <TableContainer sx={{border: '1px solid rgba(0,0,0,0.12)', borderRadius: '4px', maxHeight: '420px'}}>
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell>{t('reference.expression')}</TableCell>
                <TableCell>{t('reference.new_expression')}</TableCell>
                <TableCell>{t('common.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {previewItems.map(item => (
                <TableRow key={item.reference?.id || item.reference?.expression}>
                  <TableCell sx={expressionSx}>{item.reference?.expression}</TableCell>
                  <TableCell sx={expressionSx}>{item.proposedExpression || '-'}</TableCell>
                  <TableCell>
                    {item.eligible ? (
                      <Chip size='small' color='success' label={t('common.eligible')} />
                    ) : (
                      <Chip size='small' color='warning' label={t(item.reasonKey)} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='text' disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={() => onConfirm(eligibleItems)}
          variant='contained'
          disabled={loading || eligibleItems.length === 0}
          startIcon={loading ? <CircularProgress size={16} color='inherit' /> : null}
        >
          {t('reference.transform_references')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default TransformReferencesDialog