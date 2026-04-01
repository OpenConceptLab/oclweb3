import React from 'react'
import { TextField, CircularProgress, Divider, DialogContent, DialogActions } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { includes, toLower } from 'lodash'
import APIService from '../../services/APIService'
import { getCurrentUserCollections, dropVersion } from '../../common/utils'
import Dialog from './Dialog'
import DialogTitle from './DialogTitle'
import GroupHeader from './GroupHeader'
import GroupItems from './GroupItems'
import AutocompleteLoading from './AutocompleteLoading'
import CascadeSelector from './CascadeSelector'
import RepoChip from '../repos/RepoChip'
import RepoTooltip from '../repos/RepoTooltip'

// Extract "[id] [name]" from an expression URL like /orgs/CIEL/sources/CIEL/concepts/1234/
const extractConceptLabel = expression => {
  if (!expression) return expression
  const parts = expression.replace(/\/$/, '').split('/')
  const conceptsIdx = parts.lastIndexOf('concepts')
  if (conceptsIdx !== -1 && parts[conceptsIdx + 1]) {
    return parts[conceptsIdx + 1]
  }
  return expression
}

// Format one error entry object { description, conflicting_references, conflicting_concept_id, ... }
const formatErrorEntry = entry => {
  if (!entry || typeof entry !== 'object') return String(entry)
  const lines = []
  if (entry.description) lines.push(entry.description)
  if (entry.conflicting_references && entry.conflicting_references.length) {
    const refs = entry.conflicting_references.map(r => {
      // extract the reference ID from the URI e.g. /users/.../references/14957106/
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

// The API returns message as { expressionUrl: { errors: [...] } }
const formatErrorMessage = message => {
  if (!message) return '—'
  if (typeof message === 'string') return message

  // Unwrap the expression-keyed envelope
  const allErrors = []
  Object.values(message).forEach(val => {
    if (val && Array.isArray(val.errors)) {
      val.errors.forEach(e => allErrors.push(formatErrorEntry(e)))
    } else if (val && typeof val === 'object') {
      allErrors.push(formatErrorEntry(val))
    }
  })
  return allErrors.length ? allErrors.join('\n') : JSON.stringify(message)
}

const AddToCollectionDialog = ({ open, onClose, concept }) => {
  const [collections, setCollections] = React.useState([])
  const [selected, setSelected] = React.useState(null)
  const [input, setInput] = React.useState('')
  const [loadingCollections, setLoadingCollections] = React.useState(false)
  const [cascadeParams, setCascadeParams] = React.useState({})
  const [submitting, setSubmitting] = React.useState(false)
  const [results, setResults] = React.useState(null) // array of { added, expression, message }
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    if (open) {
      setLoadingCollections(true)
      setSelected(null)
      setResults(null)
      setError(null)
      setCascadeParams({})
      const seen = new Set()
      getCurrentUserCollections(batch => {
        setCollections(prev => {
          const merged = [
            ...prev,
            ...batch.filter(c => {
              if (seen.has(c.url)) return false
              seen.add(c.url)
              return true
            })
          ]
          return merged
        })
        setLoadingCollections(false)
      })
    } else {
      setCollections([])
    }
  }, [open])

  const handleInputChange = (_, value) => setInput(value || '')

  const filterCollectionOptions = (options, { inputValue }) => {
    if (!inputValue) return options
    const q = toLower(inputValue)
    return options.filter(o =>
      includes(toLower(o.name), q) ||
      includes(toLower(o.id), q) ||
      includes(toLower(o.short_code), q) ||
      includes(toLower(o.owner), q)
    )
  }

  const conceptUrl = concept
    ? dropVersion(concept.url) || concept.url
    : null

  const handleSubmit = () => {
    if (!selected || !conceptUrl) return
    setSubmitting(true)
    setError(null)
    setResults(null)

    const collectionOwnerType = selected.owner_type && selected.owner_type.toLowerCase() === 'organization' ? 'orgs' : 'users'
    const queryParams = Object.keys(cascadeParams).length
      ? cascadeParams
      : undefined

    APIService[collectionOwnerType](selected.owner)
      .collections(selected.short_code || selected.id)
      .appendToUrl('references/')
      .put(
        { data: { expressions: [conceptUrl] }, cascade: cascadeParams.method || '' },
        null,
        {},
        queryParams
      )
      .then(response => {
        setSubmitting(false)
        if (response && (response.status === 200 || response.status === 201)) {
          setResults(Array.isArray(response.data) ? response.data : [])
        } else {
          const msg = (response && (response.detail || response.error)) || 'Something went wrong'
          setError(msg)
        }
      })
  }

  const addedCount = results ? results.filter(r => r.added).length : 0
  const failedCount = results ? results.filter(r => !r.added).length : 0
  const done = results !== null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add to Collection</DialogTitle>

      <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Concept being added */}
        {concept && (
          <Typography variant="body2" color="text.secondary">
            Adding: <strong>{concept.display_name || concept.id}</strong>
            {concept.source && <React.Fragment> from <strong>{concept.source}</strong></React.Fragment>}
          </Typography>
        )}

        {/* Collection selector */}
        <Autocomplete
          filterOptions={filterCollectionOptions}
          openOnFocus
          blurOnSelect
          options={collections}
          loading={loadingCollections}
          value={selected}
          inputValue={input}
          isOptionEqualToValue={(option, value) => option.url === value.url}
          getOptionLabel={option => option ? `${option.name || option.id} (${option.owner})` : ''}
          groupBy={option => option.owner}
          onInputChange={handleInputChange}
          onChange={(_, item) => setSelected(item)}
          disabled={submitting || done}
          renderInput={params => (
            <TextField
              {...params}
              label="Target Collection"
              variant="outlined"
              fullWidth
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {loadingCollections ? <CircularProgress color="inherit" size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              }}
            />
          )}
          loadingText={<AutocompleteLoading text={input} />}
          noOptionsText="No editable collections found"
          renderGroup={params => (
            <li style={{ listStyle: 'none' }} key={params.group}>
              <GroupHeader>{params.group}</GroupHeader>
              <GroupItems>{params.children}</GroupItems>
            </li>
          )}
          renderOption={(props, option) => (
            <React.Fragment key={option.url}>
              <li {...props} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                  {option.name || option.id}
                </span>
                <RepoTooltip repo={option} enterDelay={1000} enterNextDelay={1000}>
                  <span>
                    <RepoChip noTooltip noLink size="small" repo={option} />
                  </span>
                </RepoTooltip>
              </li>
              <Divider component="li" style={{ listStyle: 'none' }} />
            </React.Fragment>
          )}
        />

        {/* Cascade selector */}
        <CascadeSelector
          onChange={setCascadeParams}
          conceptUrl={conceptUrl}
          collectionUrl={selected ? selected.url : null}
        />

        {/* Submitting spinner */}
        {submitting && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">Adding reference…</Typography>
          </Box>
        )}

        {/* Request error */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Results */}
        {done && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              {addedCount > 0 && failedCount === 0 && `${addedCount} reference${addedCount !== 1 ? 's' : ''} added`}
              {addedCount > 0 && failedCount > 0 && `${addedCount} added, ${failedCount} failed`}
              {addedCount === 0 && failedCount > 0 && `${failedCount} reference${failedCount !== 1 ? 's' : ''} failed`}
              {addedCount === 0 && failedCount === 0 && 'No references added'}
            </Typography>

            {/* Successes */}
            {addedCount > 0 && (
              <Box sx={{ mb: failedCount > 0 ? 2 : 0, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                {results.filter(r => r.added).map((item, idx, arr) => (
                  <React.Fragment key={item.expression || idx}>
                    <Box sx={{ px: 1.5, py: 1, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {item.conceptId || extractConceptLabel(item.expression)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {typeof item.message === 'string' ? item.message : ''}
                      </Typography>
                    </Box>
                    {idx < arr.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Box>
            )}

            {/* Failures */}
            {failedCount > 0 && (
              <Table size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600, width: '40%' }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Error</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.filter(r => !r.added).map((item, idx) => (
                    <TableRow key={item.expression || idx} sx={{ verticalAlign: 'top' }}>
                      <TableCell sx={{ fontSize: '0.8rem' }}>
                        {extractConceptLabel(item.expression)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                        {formatErrorMessage(item.message)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ pt: 2 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ textTransform: 'none' }}>
          {done ? 'Close' : 'Cancel'}
        </Button>
        {!done && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selected || submitting}
            sx={{ textTransform: 'none' }}
          >
            Add Reference
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default AddToCollectionDialog
