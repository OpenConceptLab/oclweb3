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
import LockIcon from '@mui/icons-material/LockOutlined'
import APIService from '../../services/APIService'
import { LockTooltip, useNoticeLocks } from '../common/NoticeLocks'
import { showNotice, showRefusalNotice } from '../common/LimitNotice'
import {
  REPO_VERSIONED, UNVERSIONED, LEAVE, CONVERSIONS, PREVIEW_PAGE_SIZE, getResourceVersionedIds, mergePreviewPages,
  getDefaultChoices, chooseAll, getConversionPayload, describeConversion, getConversionOutcome, getRollbackMessages,
  isRolledBack, getQueuedConversion, getNotConvertedReasons, TASK_RESULT_QUERY, UNESCAPED, getReasonKey,
} from './referenceConversionUtils'

const TASK_POLL_MS = 3000
// a task that keeps answering with an error is asked about this many times in a row, then given up on
const MAX_POLL_FAILURES = 3

const expressionSx = { fontFamily: 'monospace', fontSize: '12px', overflowWrap: 'anywhere', maxWidth: '240px' }


const chunk = (values, size) => {
  const chunks = []
  for(let index = 0; index < values.length; index += size)
    chunks.push(values.slice(index, index + size))
  return chunks
}

const MemberList = ({ label, members, count }) => {
  const { t } = useTranslation()
  if(!count)
    return null
  return (
    <Box>
      <Typography variant='caption' sx={{ fontWeight: 'bold' }}>{t(label, { count })}</Typography>
      {members.map(member => <Box key={member} sx={expressionSx}>{member}</Box>)}
      {
        count > members.length &&
          <Typography variant='caption' color='text.secondary'>
            {t('reference.convert_more', { count: count - members.length })}
          </Typography>
      }
    </Box>
  )
}

const ConversionCell = ({ conversion }) => {
  const { t } = useTranslation()
  const [showChanges, setShowChanges] = React.useState(false)
  const description = describeConversion(conversion)
  if(!description)
    return <Typography variant='caption' color='text.secondary'>{t('reference.convert_not_possible')}</Typography>
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={expressionSx}>{conversion.expression}</Box>
      {
        description.version &&
          <Typography variant='caption' color='text.secondary' sx={{ overflowWrap: 'anywhere' }}>
            {t('reference.convert_resolves_to', { version: description.version, ...UNESCAPED })}
          </Typography>
      }
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
        {description.followsHead && <Chip size='small' color='warning' label={t('reference.convert_follows_head')} />}
      </Box>
      {
        !description.keeps &&
          <Button
            size='small'
            sx={{ alignSelf: 'flex-start', textTransform: 'none', p: 0, minWidth: 0 }}
            aria-expanded={showChanges}
            onClick={() => setShowChanges(!showChanges)}
          >
            {t(showChanges ? 'reference.convert_hide_changes' : 'reference.convert_show_changes')}
          </Button>
      }
      {
        showChanges &&
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <MemberList label='reference.convert_adds' members={description.addedMembers} count={description.added} />
            <MemberList
              label='reference.convert_removes' members={description.removedMembers} count={description.removed}
            />
          </Box>
      }
    </Box>
  )
}

const ConvertReferencesDialog = ({ open, onClose, onConverted, references, collectionUrl }) => {
  const { t } = useTranslation()
  // a key, not the array: the parent passes a new array on every render, which would reload the preview and its choices
  const selectedKey = getResourceVersionedIds(references).join(',')
  const selectedIds = React.useMemo(() => (selectedKey ? selectedKey.split(',').map(Number) : []), [selectedKey])
  const [scope, setScope] = React.useState('selected')
  const [preview, setPreview] = React.useState(null)
  const [choices, setChoices] = React.useState({})
  const [loading, setLoading] = React.useState(false)
  const [converting, setConverting] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [queuedTaskId, setQueuedTaskId] = React.useState(null)
  // the preview writes nothing, so it stays open; on a collection page whose notices lock its edits, Convert is locked
  // (NoticeLocks)
  const convertLock = useNoticeLocks()('convertReferences')
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
      for(const ids of chunk(selectedIds, PREVIEW_PAGE_SIZE)) {
        const response = await service().appendToUrl('preview/').post({ ids })
        if(response?.status !== 200)
          throw response
        pages.push(response.data)
      }
    }
    return mergePreviewPages(pages)
  }

  React.useEffect(() => {
    // every load starts from nothing, so a failed or empty one shows no old table and leaves Convert disabled
    setPreview(null)
    setChoices({})
    if(!open || !collectionUrl || (scope === 'selected' && !selectedIds.length))
      return
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
  }, [open, scope, collectionUrl, selectedKey])

  const summary = preview?.summary
  const results = preview?.results || []
  const payload = getConversionPayload(choices, results)

  const onResults = conversionResults => {
    const outcome = getConversionOutcome(conversionResults)
    // why each left reference was left, as the API said, translated where known
    const reasons = getNotConvertedReasons(conversionResults).map(
      ({ reason, count }) => `${t(getReasonKey(reason), reason)} (${count})`).join('; ')
    if(isRolledBack(outcome)) {
      const details = getRollbackMessages(conversionResults).join(' ')
      const left = reasons ? ` ${t('reference.convert_not_converted_reasons', { reasons, ...UNESCAPED })}` : ''
      setError(t('reference.convert_rolled_back', { details, ...UNESCAPED }) + left)
    } else {
      onConverted({ ...outcome, unsupported: summary?.unsupported || 0, reasons })
    }
  }

  // a queued conversion is asked about until its task ends, then reported as a direct one is
  React.useEffect(() => {
    if(!queuedTaskId)
      return
    let active = true
    let timer = null
    let failures = 0
    const poll = () => APIService.new().overrideURL(`/tasks/${queuedTaskId}/`).get(null, null, TASK_RESULT_QUERY).then(
      response => {
        if(!active) return
        // APIService never rejects: a failed request comes back without a status
        if(response?.status !== 200) {
          failures += 1
          if(failures < MAX_POLL_FAILURES) {
            timer = setTimeout(poll, TASK_POLL_MS)
            return
          }
          setQueuedTaskId(null)
          setConverting(false)
          setError(t('reference.convert_poll_failed'))
          return
        }
        failures = 0
        const queued = getQueuedConversion(response.data)
        if(!queued) {
          timer = setTimeout(poll, TASK_POLL_MS)
          return
        }
        setQueuedTaskId(null)
        setConverting(false)
        // a refusal that carries a notice opens it in the notice dialog, as a direct one does
        if(queued.results)
          onResults(queued.results)
        else if(queued.notice)
          showNotice(queued.notice)
        else if(queued.refusal !== undefined)
          setError(queued.refusal || t('reference.convert_refused'))
        else
          setError(queued.error || t('reference.convert_task_failed'))
      })
    poll()
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [queuedTaskId])

  const onConvert = () => {
    if(convertLock)
      return
    setConverting(true)
    setError(null)
    service().post(payload).then(response => {
      if(response?.status === 202 && (response.data?.id || response.data?.task)) {
        setQueuedTaskId(response.data.id || response.data.task)
        return
      }
      setConverting(false)
      if(response?.status === 200)
        onResults(response.data)
      else if(!showRefusalNotice(response))
        setError(response?.detail || t('common.generic_error'))
    })
  }

  // closing while a queued conversion runs leaves it running: the list says so
  const onDialogClose = () => queuedTaskId ? onConverted({ queued: true }) : onClose()

  return (
    <Dialog open={open} onClose={converting && !queuedTaskId ? undefined : onDialogClose} maxWidth='lg' fullWidth>
      <DialogTitle>{t('reference.convert_title')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>{t('reference.convert_body')}</Typography>
        <ToggleButtonGroup
          size='small'
          exclusive
          value={scope}
          disabled={converting}
          onChange={(event, value) => value && setScope(value)}
          aria-label={t('reference.convert_scope')}
        >
          <ToggleButton value='selected' sx={{ textTransform: 'none' }}>
            {t('reference.convert_scope_selected', { count: selectedIds.length })}
          </ToggleButton>
          <ToggleButton value='all' sx={{ textTransform: 'none' }}>{t('reference.convert_scope_all')}</ToggleButton>
        </ToggleButtonGroup>
        {scope === 'selected' && !selectedIds.length && <Alert severity='info'>{t('reference.convert_none_selected')}</Alert>}
        {error && <Alert severity='error'>{error}</Alert>}
        {queuedTaskId && <Alert severity='info'>{t('reference.convert_running')}</Alert>}
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
                    {summary.unsupported > 0 && ` ${t('reference.convert_unsupported_note', { count: summary.unsupported })}`}
                  </Alert>
                ))
              }
              {results.length === 0 && <Alert severity='info'>{t('reference.convert_none_in_collection')}</Alert>}
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
                          {item.exclude && <Chip size='small' label={t('reference.convert_exclusion')} sx={{ mb: 0.5 }} />}
                          {item.exclude && <br />}
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
                                  inputProps={{
                                    'aria-label': t('reference.convert_choice_for', { expression: item.expression, ...UNESCAPED }),
                                  }}
                                  value={choices[item.id] || LEAVE}
                                  onChange={event => setChoices({ ...choices, [item.id]: event.target.value })}
                                >
                                  <MenuItem value={LEAVE}>{t('reference.convert_leave')}</MenuItem>
                                  {CONVERSIONS.filter(conversion => item[conversion]).map(conversion => (
                                    <MenuItem key={conversion} value={conversion}>
                                      {t(`reference.convert_to_${conversion}`)}
                                      {
                                        describeConversion(item[conversion]).followsHead &&
                                          ` (${t('reference.convert_follows_head')})`
                                      }
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
        <Button onClick={onDialogClose} variant='text' disabled={converting && !queuedTaskId}>
          {t(queuedTaskId ? 'common.close' : 'common.cancel')}
        </Button>
        <LockTooltip title={convertLock} placement='top' display='inline-block'>
          <Button
            onClick={onConvert}
            variant='contained'
            disabled={loading || converting || !payload.conversions.length || Boolean(convertLock)}
            startIcon={converting ? <CircularProgress size={16} color='inherit' /> : null}
            endIcon={convertLock ? <LockIcon fontSize='inherit' /> : null}
          >
            {t('reference.convert_confirm', { count: payload.conversions.length })}
          </Button>
        </LockTooltip>
      </DialogActions>
    </Dialog>
  )
}

export default ConvertReferencesDialog
