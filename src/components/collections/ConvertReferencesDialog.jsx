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
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import APIService from '../../services/APIService'
import {
  REPO_VERSIONED, UNVERSIONED, LEAVE, CONVERSIONS, PREVIEW_PAGE_SIZE, isResourceVersioned, mergePreviewPages,
  getDefaultChoices, chooseAll, getConversionPayload, describeConversion, getConversionOutcome,
} from './referenceConversionUtils'

const expressionSx = { fontFamily: 'monospace', fontSize: '12px', overflowWrap: 'anywhere', maxWidth: '240px' }

// the API's reasons, as translation keys
const REASON_KEYS = {
  'not resource-versioned': 'reference.convert_reason_not_resource_versioned',
  'it also names a value set': 'reference.convert_reason_value_set',
  'it has a filter': 'reference.convert_reason_filter',
}

const getReasonKey = reason => REASON_KEYS[reason] || 'reference.convert_reason_other'

const chunk = (values, size) => {
  const chunks = []
  for(let index = 0; index < values.length; index += size)
    chunks.push(values.slice(index, index + size))
  return chunks
}

const ConversionCell = ({ conversion }) => {
  const { t } = useTranslation()
  const description = describeConversion(conversion)
  if(!description)
    return <Typography variant='caption' color='text.secondary'>{t('reference.convert_not_possible')}</Typography>
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={expressionSx}>{conversion.expression}</Box>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {
          description.keeps ?
            <Chip size='small' color='success' label={t('reference.convert_keeps_members')} /> :
            <Chip
              size='small'
              color='warning'
              label={t('reference.convert_changes_members', { added: description.added, removed: description.removed })}
            />
        }
        {description.createsLock && <Chip size='small' color='info' label={t('reference.convert_creates_lock')} />}
      </Box>
    </Box>
  )
}

const ConvertReferencesDialog = ({ open, onClose, onConverted, references, collectionUrl }) => {
  const { t } = useTranslation()
  const selected = React.useMemo(() => (references || []).filter(isResourceVersioned), [references])
  const [scope, setScope] = React.useState('selected')
  const [preview, setPreview] = React.useState(null)
  const [choices, setChoices] = React.useState({})
  const [loading, setLoading] = React.useState(false)
  const [converting, setConverting] = React.useState(false)
  const [error, setError] = React.useState(null)
  const service = () => APIService.new().overrideURL(collectionUrl).appendToUrl('references/conversions/')

  const fetchPreview = async () => {
    const pages = []
    if(scope === 'all') {
      let offset = 0
      while(offset !== null && offset !== undefined) {
        const response = await service().appendToUrl('preview/').post({ ids: '*', offset })
        if(response?.status !== 200)
          throw response
        pages.push(response.data)
        offset = response.data?.summary?.next_offset
      }
    } else {
      for(const ids of chunk(selected.map(reference => reference.id), PREVIEW_PAGE_SIZE)) {
        const response = await service().appendToUrl('preview/').post({ ids })
        if(response?.status !== 200)
          throw response
        pages.push(response.data)
      }
    }
    return mergePreviewPages(pages)
  }

  React.useEffect(() => {
    if(!open || !collectionUrl || (scope === 'selected' && !selected.length)) {
      setPreview(null)
      return
    }
    let active = true
    setLoading(true)
    setError(null)
    fetchPreview().then(merged => {
      if(!active) return
      setPreview(merged)
      setChoices(getDefaultChoices(merged.results))
    }).catch(response => {
      if(active) setError(response?.detail || t('common.generic_error'))
    }).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [open, scope, collectionUrl, selected])

  const payload = getConversionPayload(choices)

  const onConvert = () => {
    setConverting(true)
    service().post(payload).then(response => {
      setConverting(false)
      if(response?.status === 202) {
        onConverted({ queued: true })
      } else if(response?.status === 200) {
        onConverted(getConversionOutcome(response.data))
      } else {
        setError(response?.detail || t('common.generic_error'))
      }
    })
  }

  const summary = preview?.summary
  const results = preview?.results || []

  return (
    <Dialog open={open} onClose={converting ? undefined : onClose} maxWidth='lg' fullWidth>
      <DialogTitle>{t('reference.convert_title')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>{t('reference.convert_body')}</Typography>
        <ToggleButtonGroup size='small' exclusive value={scope} onChange={(event, value) => value && setScope(value)}>
          <ToggleButton value='selected' sx={{ textTransform: 'none' }}>
            {t('reference.convert_scope_selected', { count: selected.length })}
          </ToggleButton>
          <ToggleButton value='all' sx={{ textTransform: 'none' }}>{t('reference.convert_scope_all')}</ToggleButton>
        </ToggleButtonGroup>
        {scope === 'selected' && !selected.length && <Alert severity='info'>{t('reference.convert_none_selected')}</Alert>}
        {error && <Alert severity='error'>{error}</Alert>}
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>}
        {
          !loading && summary &&
            <React.Fragment>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip size='small' color='primary' label={t('reference.convert_count', { count: summary.references })} />
                <Chip
                  size='small'
                  color={summary.supported === summary.references ? 'default' : 'warning'}
                  label={t('reference.convert_supported', { count: summary.supported })}
                />
              </Box>
              {
                CONVERSIONS.filter(conversion => summary[`${conversion}_keeps_all`]).map(conversion => (
                  <Alert
                    key={conversion}
                    severity='success'
                    action={
                      <Button color='inherit' size='small' onClick={() => setChoices(chooseAll(results, conversion))}>
                        {t(`reference.convert_all_to_${conversion}`)}
                      </Button>
                    }
                  >
                    {t(`reference.convert_all_keep_${conversion}`)}
                  </Alert>
                ))
              }
              <TableContainer sx={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: '4px', maxHeight: '460px' }}>
                <Table stickyHeader size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('reference.expression')}</TableCell>
                      <TableCell>{t('reference.convert_to_repo_versioned')}</TableCell>
                      <TableCell>{t('reference.convert_to_unversioned')}</TableCell>
                      <TableCell>{t('reference.convert_choice')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map(item => (
                      <TableRow key={item.id}>
                        <TableCell sx={expressionSx}>
                          {item.expression}
                          {
                            item.supported &&
                              <Typography variant='caption' display='block' color='text.secondary'>
                                {t('reference.convert_members_now', { count: item.members_count })}
                              </Typography>
                          }
                        </TableCell>
                        {
                          item.supported ?
                            <React.Fragment>
                              <TableCell><ConversionCell conversion={item[REPO_VERSIONED]} /></TableCell>
                              <TableCell><ConversionCell conversion={item[UNVERSIONED]} /></TableCell>
                              <TableCell>
                                <Select
                                  size='small'
                                  value={choices[item.id] || LEAVE}
                                  onChange={event => setChoices({ ...choices, [item.id]: event.target.value })}
                                >
                                  <MenuItem value={LEAVE}>{t('reference.convert_leave')}</MenuItem>
                                  {CONVERSIONS.filter(conversion => item[conversion]).map(conversion => (
                                    <MenuItem key={conversion} value={conversion}>
                                      {t(`reference.convert_to_${conversion}`)}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </TableCell>
                            </React.Fragment> :
                            <TableCell colSpan={3}>
                              <Chip size='small' color='warning' label={t(getReasonKey(item.reason), item.reason)} />
                            </TableCell>
                        }
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </React.Fragment>
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='text' disabled={converting}>{t('common.cancel')}</Button>
        <Button
          onClick={onConvert}
          variant='contained'
          disabled={loading || converting || !payload.conversions.length}
          startIcon={converting ? <CircularProgress size={16} color='inherit' /> : null}
        >
          {t('reference.convert_confirm', { count: payload.conversions.length })}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConvertReferencesDialog
