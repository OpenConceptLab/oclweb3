import React from 'react'
import { useTranslation } from 'react-i18next'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { DialogContent, DialogActions } from '@mui/material'
import { toLower, includes } from 'lodash'
import APIService from '../../services/APIService'
import Dialog from '../common/Dialog'
import DialogTitle from '../common/DialogTitle'
import CloseIconButton from '../common/CloseIconButton'
import CascadeSelector from '../common/CascadeSelector'
import GroupHeader from '../common/GroupHeader'
import GroupItems from '../common/GroupItems'
import AutocompleteLoading from '../common/AutocompleteLoading'

// ---- error formatting (same pattern as AddToCollectionDialog) ----

const extractLabel = expression => {
  if (!expression) return expression
  const parts = expression.replace(/\/$/, '').split('/')
  for (const resource of ['concepts', 'mappings']) {
    const idx = parts.lastIndexOf(resource)
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
  }
  return expression
}

const formatErrorEntry = entry => {
  if (!entry || typeof entry !== 'object') return String(entry)
  const lines = []
  if (entry.description) lines.push(entry.description)
  if (entry.conflicting_references?.length) {
    const refs = entry.conflicting_references.map(r => {
      const m = r.match(/\/references\/([^/]+)\/?$/)
      return m ? `Reference #${m[1]}` : r
    })
    lines.push(`Conflicting: ${refs.join(', ')}`)
  }
  if (entry.conflicting_concept_id) {
    const label = entry.conflicting_concept_name
      ? `${entry.conflicting_concept_id} ${entry.conflicting_concept_name}`
      : entry.conflicting_concept_id
    lines.push(`Conflicting concept: ${label}`)
  }
  if (entry.conflicting_name) lines.push(`Conflicting name: "${entry.conflicting_name}"`)
  return lines.join(' — ') || JSON.stringify(entry)
}

const formatErrorMessage = message => {
  if (!message) return '—'
  if (typeof message === 'string') return message
  const allErrors = []
  Object.values(message).forEach(val => {
    if (val?.errors) val.errors.forEach(e => allErrors.push(formatErrorEntry(e)))
    else if (val && typeof val === 'object') allErrors.push(formatErrorEntry(val))
  })
  return allErrors.length ? allErrors.join('\n') : JSON.stringify(message)
}

// ---- component ----

const AddReferencesDialog = ({ open, onClose, collectionUrl, onSuccess }) => {
  const { t } = useTranslation()

  // Seed (source or collection to pull from)
  const [seeds, setSeeds] = React.useState([])
  const [seedLoading, setSeedLoading] = React.useState(false)
  const [seedInput, setSeedInput] = React.useState('')
  const [seed, setSeed] = React.useState(null)

  // Version pin
  const [pinVersion, setPinVersion] = React.useState(false)
  const [versions, setVersions] = React.useState([])
  const [versionsLoading, setVersionsLoading] = React.useState(false)
  const [selectedVersion, setSelectedVersion] = React.useState('')

  // Reference configuration
  const [resourceType, setResourceType] = React.useState('concepts')
  const [mode, setMode] = React.useState('ids')
  const [ids, setIds] = React.useState('')
  const [expression, setExpression] = React.useState('')
  const [includeExclude, setIncludeExclude] = React.useState('include')
  const [cascadeParams, setCascadeParams] = React.useState({})

  // Submission state
  const [submitting, setSubmitting] = React.useState(false)
  const [results, setResults] = React.useState(null)
  const [error, setError] = React.useState(null)

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setSeeds([])
      setSeedInput('')
      setSeed(null)
      setPinVersion(false)
      setVersions([])
      setSelectedVersion('')
      setResourceType('concepts')
      setMode('ids')
      setIds('')
      setExpression('')
      setIncludeExclude('include')
      setCascadeParams({})
      setResults(null)
      setError(null)
    }
  }, [open])

  // Debounced global repo search
  const seedSearchTimer = React.useRef(null)
  const handleSeedInputChange = (_, value) => {
    setSeedInput(value || '')
    clearTimeout(seedSearchTimer.current)
    if (!value || value.length < 2) { setSeeds([]); return }
    setSeedLoading(true)
    seedSearchTimer.current = setTimeout(() => {
      APIService.new().overrideURL('/repos/').get(null, null, { q: value, limit: 20, verbose: true })
        .then(response => {
          setSeeds(Array.isArray(response?.data) ? response.data : [])
          setSeedLoading(false)
        })
    }, 300)
  }

  // Fetch released versions when seed changes
  React.useEffect(() => {
    if (!seed?.url) { setVersions([]); setSelectedVersion(''); return }
    setVersionsLoading(true)
    APIService.new().overrideURL(seed.url + 'versions/').get(null, null, { released: true, limit: 20 })
      .then(response => {
        const vList = (Array.isArray(response?.data) ? response.data : [])
          .filter(v => v.version !== 'HEAD')
          .map(v => v.version || v.id)
        setVersions(vList)
        setVersionsLoading(false)
        if (vList.length) setSelectedVersion(vList[0])
      })
  }, [seed])

  // Seed the expression field when relevant inputs change in Expression mode
  React.useEffect(() => {
    if (mode !== 'expression') return
    setExpression(buildBasePath())
  }, [seed, pinVersion, selectedVersion, resourceType, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  const buildBasePath = () => {
    if (!seed?.url) return ''
    const base = seed.url.replace(/\/$/, '') + '/'
    const version = pinVersion && selectedVersion ? selectedVersion + '/' : ''
    return base + version + resourceType + '/'
  }

  const clearResultsOnEdit = () => { if (results !== null) { setResults(null); setError(null) } }

  const buildExpressions = () => {
    if (mode === 'expression') return expression.trim() ? [expression.trim()] : []
    const base = buildBasePath()
    if (!base) return []
    return ids.split(',').map(id => id.trim()).filter(Boolean).map(id => base + id + '/')
  }

  const expressionList = buildExpressions()

  const filterSeedOptions = (options, { inputValue }) => {
    if (!inputValue) return options
    const q = toLower(inputValue)
    return options.filter(o =>
      includes(toLower(o.name), q) ||
      includes(toLower(o.id), q) ||
      includes(toLower(o.short_code), q) ||
      includes(toLower(o.owner), q)
    )
  }

  const handleSubmit = () => {
    if (!expressionList.length) return
    setSubmitting(true)
    setError(null)
    setResults(null)
    const queryParams = Object.keys(cascadeParams).length ? cascadeParams : undefined
    // CollectionVersionReferencesView (matched by /HEAD/references/) is read-only;
    // strip any version segment so the request hits CollectionReferencesView which handles PUT.
    const refsUrl = collectionUrl.replace(/\/HEAD\//i, '/') + 'references/'
    APIService.new().overrideURL(refsUrl)
      .put(
        { data: { expressions: expressionList, ...(includeExclude === 'exclude' && { exclude: true }) }, cascade: cascadeParams.method || '' },
        null,
        {},
        queryParams
      )
      .then(response => {
        setSubmitting(false)
        if (response?.status === 200 || response?.status === 201) {
          setResults(Array.isArray(response.data) ? response.data : [])
          if (onSuccess) onSuccess()
        } else if (response?.status === 202) {
          setResults('pending')
          if (onSuccess) onSuccess()
        } else {
          setError((response?.detail || response?.error) || t('common.something_went_wrong'))
        }
      })
      .catch(() => {
        setSubmitting(false)
        setError(t('reference.request_failed'))
      })
  }

  const isPending = results === 'pending'
  const resultList = Array.isArray(results) ? results : []
  const addedCount = resultList.filter(r => r.added).length
  const failedCount = resultList.filter(r => !r.added).length
  const hasResults = results !== null
  // Lock the form only on full success or async-accepted. Failures keep the form editable so
  // the user can fix the expression and resubmit without closing and reopening the dialog.
  const formLocked = isPending || (hasResults && addedCount > 0 && failedCount === 0)
  const canSubmit = !submitting && !formLocked && expressionList.length > 0
  const resolvedVersionLabel = seed
    ? (pinVersion && selectedVersion
      ? selectedVersion
      : versionsLoading ? '…' : versions.length > 0 ? versions[0] : t('reference.latest_released'))
    : ''

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {t('reference.add_references')}
          <CloseIconButton onClick={onClose} disabled={submitting} size="small" />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ padding: '16px 0 0 0 !important', display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Source / Collection seed + inline open-in-new-tab link */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Autocomplete
            sx={{ flex: 1 }}
            freeSolo
            filterOptions={filterSeedOptions}
            options={seeds}
            loading={seedLoading}
            inputValue={seedInput}
            value={seed}
            isOptionEqualToValue={(option, value) => option?.url === value?.url}
            getOptionLabel={option => typeof option === 'string' ? option : `${option.name || option.id} (${option.owner})`}
            groupBy={option => option.type === 'Collection' ? t('reference.group_collections') : t('reference.group_sources')}
            onInputChange={handleSeedInputChange}
            onChange={(_, item) => setSeed(item && typeof item !== 'string' ? item : null)}
            disabled={submitting || formLocked}
            renderInput={params => (
              <TextField
                {...params}
                label={t('reference.source_or_collection')}
                variant="outlined"
                fullWidth
                size="small"
                placeholder={t('reference.search_sources_collections')}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {seedLoading ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
            loadingText={<AutocompleteLoading text={seedInput} />}
            noOptionsText={seedInput.length < 2 ? t('reference.type_to_search') : t('common.no_results')}
            renderGroup={params => (
              <li style={{ listStyle: 'none' }} key={params.group}>
                <GroupHeader>{params.group}</GroupHeader>
                <GroupItems>{params.children}</GroupItems>
              </li>
            )}
          />
          {seed && (
            <Chip
              size="small"
              icon={<OpenInNewIcon sx={{ fontSize: '0.85rem !important' }} />}
              label={t('reference.open_repo', { name: seed.name || seed.id })}
              variant="outlined"
              clickable
              onClick={() => window.open(window.location.origin + '/#' + seed.url, '_blank')}
              sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}
            />
          )}
        </Box>

        {/* Resolve hint: visible when seed is selected */}
        {seed && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
            {t('reference.resolves_to', { version: resolvedVersionLabel })}
          </Typography>
        )}

        {/* Version pin row: checkbox + inline dropdown, visible when seed is selected */}
        {seed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={pinVersion}
                  onChange={e => { setPinVersion(e.target.checked); if (!e.target.checked) setSelectedVersion('') }}
                  disabled={submitting || formLocked}
                />
              }
              label={<Typography variant="body2">{t('reference.pin_to_version')}</Typography>}
              sx={{ m: 0, width: 'fit-content' }}
            />
            {pinVersion && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>{t('common.version')}</InputLabel>
                <Select
                  value={selectedVersion}
                  label={t('common.version')}
                  onChange={e => setSelectedVersion(e.target.value)}
                  disabled={versionsLoading || submitting || formLocked}
                >
                  {versionsLoading
                    ? <MenuItem disabled><CircularProgress size={14} sx={{ mr: 1 }} /> {t('common.loading')}</MenuItem>
                    : versions.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)
                  }
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {/* Reference type + Include/Exclude */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{t('reference.type')}</InputLabel>
            <Select
              value={resourceType}
              label={t('reference.type')}
              onChange={e => setResourceType(e.target.value)}
              disabled={!seed || submitting || formLocked}
            >
              <MenuItem value="concepts">{t('concept.concepts')}</MenuItem>
              <MenuItem value="mappings">{t('mapping.mappings')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{t('reference.include_exclude')}</InputLabel>
            <Select
              value={includeExclude}
              label={t('reference.include_exclude')}
              onChange={e => setIncludeExclude(e.target.value)}
              disabled={submitting || formLocked}
            >
              <MenuItem value="include">{t('reference.include')}</MenuItem>
              <MenuItem value="exclude">{t('reference.exclude')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Mode toggle */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[
            { value: 'ids', label: t('reference.add_by_ids') },
            { value: 'expression', label: t('reference.expression') },
          ].map(({ value, label }) => (
            <Chip
              key={value}
              label={label}
              onClick={() => { if (!submitting && !formLocked) { clearResultsOnEdit(); setMode(value) } }}
              color={mode === value ? 'primary' : 'default'}
              variant={mode === value ? 'filled' : 'outlined'}
              size="small"
              sx={{ cursor: submitting || formLocked ? 'default' : 'pointer' }}
            />
          ))}
        </Box>

        {/* Add by ID(s) panel */}
        {mode === 'ids' && (
          <TextField
            label={resourceType === 'mappings' ? t('reference.mapping_ids') : t('reference.concept_ids')}
            multiline
            minRows={3}
            value={ids}
            onChange={e => { clearResultsOnEdit(); setIds(e.target.value) }}
            disabled={!seed || submitting || formLocked}
            placeholder={seed ? '1234, 5678, 9012' : t('reference.select_source_first')}
            helperText={seed ? t('reference.id_helper', { path: buildBasePath(), interpolation: { escapeValue: false } }) : t('reference.select_source_first')}
            fullWidth
            size="small"
            InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
          />
        )}

        {/* Expression panel */}
        {mode === 'expression' && (
          <TextField
            label={t('reference.expression')}
            multiline
            minRows={2}
            value={expression}
            onChange={e => { clearResultsOnEdit(); setExpression(e.target.value) }}
            disabled={submitting || formLocked}
            placeholder="/orgs/CIEL/sources/CIEL/concepts/1234/"
            helperText={t('reference.expression_hint')}
            fullWidth
            size="small"
            InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
          />
        )}

        {/* Cascade selector */}
        <CascadeSelector
          onChange={setCascadeParams}
          collectionUrl={collectionUrl}
        />

        {/* Submitting */}
        {submitting && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">{t('reference.adding_references')}</Typography>
          </Box>
        )}

        {/* Request error */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Results */}
        {hasResults && (
          <Box>
            {isPending && <Alert severity="info">{t('addToCollection.request_accepted')}</Alert>}
            {!isPending && (
              <React.Fragment>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  {addedCount > 0 && failedCount === 0 && `${addedCount} reference${addedCount !== 1 ? 's' : ''} added`}
                  {addedCount > 0 && failedCount > 0 && `${addedCount} added, ${failedCount} failed`}
                  {addedCount === 0 && failedCount > 0 && `${failedCount} reference${failedCount !== 1 ? 's' : ''} failed`}
                  {addedCount === 0 && failedCount === 0 && t('addToCollection.no_references_added')}
                </Typography>

                {addedCount > 0 && (
                  <Box sx={{ mb: failedCount > 0 ? 2 : 0, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                    {resultList.filter(r => r.added).map((item, idx, arr) => (
                      <React.Fragment key={item.expression || idx}>
                        <Box sx={{ px: 1.5, py: 1, bgcolor: 'primary.95', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.8rem', fontFamily: 'monospace', wordBreak: 'break-all' }}
                          >
                            {item.expression}
                          </Typography>
                        </Box>
                        {idx < arr.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </Box>
                )}

                {failedCount > 0 && (
                  <Table size="small" sx={{ border: '1px solid', borderColor: 'error.main', borderRadius: 1, overflow: 'hidden' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'error.95' }}>
                        <TableCell sx={{ fontWeight: 600, width: '40%', color: 'error.main' }}>
                          {t('addToCollection.reference_header')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>
                          {t('addToCollection.error_header')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultList.filter(r => !r.added).map((item, idx) => (
                        <TableRow key={item.expression || idx} sx={{ bgcolor: 'error.95' }}>
                          <TableCell sx={{ fontSize: '0.8rem', color: 'error.main' }}>
                            {extractLabel(item.expression)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'pre-line', color: 'error.main' }}>
                            {formatErrorMessage(item.message)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </React.Fragment>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ pt: 2, px: 0, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {expressionList.length > 0 && !formLocked && (
            <Typography variant="caption" color="text.secondary">
              {expressionList.length} expression{expressionList.length !== 1 ? 's' : ''} · {includeExclude}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!formLocked && (
            <React.Fragment>
              <Button onClick={onClose} disabled={submitting} sx={{ textTransform: 'none' }}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!canSubmit}
                sx={{ textTransform: 'none' }}
              >
                {expressionList.length !== 1 ? t('reference.add_references') : t('reference.add_reference')}
              </Button>
            </React.Fragment>
          )}
          {formLocked && (
            <Button variant="outlined" onClick={onClose} sx={{ textTransform: 'none' }}>
              {t('common.close')}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default AddReferencesDialog
