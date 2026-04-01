import React from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Collapse from '@mui/material/Collapse'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import CodeIcon from '@mui/icons-material/CodeOutlined'

const PRESETS = [
  {
    id: 'none',
    label: 'None',
    params: {},
  },
  {
    id: 'sourcemappings',
    label: 'Source Mappings',
    params: { method: 'sourcemappings' },
  },
  {
    id: 'sourcetoconcepts',
    label: 'OpenMRS',
    params: { method: 'sourcetoconcepts', mapTypes: 'Q-AND-A,CONCEPT-SET', cascadeLevels: '*', returnMapTypes: '*' },
  },
  {
    id: 'custom',
    label: 'Custom',
    params: null,
  },
]

const DEFAULT_CUSTOM_PARAMS = {
  method: 'sourcetoconcepts',
  mapTypes: '',
  excludeMapTypes: '',
  cascadeLevels: '*',
  returnMapTypes: '*',
}

const buildQueryString = (params, transform) => {
  if (!params || Object.keys(params).length === 0) return ''
  const parts = []
  if (params.method) parts.push(`method=${params.method}`)
  if (params.mapTypes) parts.push(`mapTypes=${params.mapTypes}`)
  if (params.excludeMapTypes) parts.push(`excludeMapTypes=${params.excludeMapTypes}`)
  if (params.cascadeLevels) parts.push(`cascadeLevels=${params.cascadeLevels}`)
  if (params.returnMapTypes) parts.push(`returnMapTypes=${params.returnMapTypes}`)
  if (transform) parts.push('transformReferences=openmrs_concept_reference')
  return parts.length ? `?${parts.join('&')}` : ''
}

const CascadeSelector = ({ onChange, conceptUrl, collectionUrl, showPreviewDefault = false }) => {
  const [selectedPresetId, setSelectedPresetId] = React.useState('none')
  const [transform, setTransform] = React.useState(false)
  const [customParams, setCustomParams] = React.useState(DEFAULT_CUSTOM_PARAMS)
  const [showPreview, setShowPreview] = React.useState(showPreviewDefault)

  const selectedPreset = PRESETS.find(p => p.id === selectedPresetId)
  const baseParams = selectedPresetId === 'custom' ? customParams : (selectedPreset.params || {})
  const currentParams = transform
    ? { ...baseParams, transformReferences: 'openmrs_concept_reference' }
    : baseParams

  React.useEffect(() => {
    if (onChange) onChange(currentParams)
  }, [selectedPresetId, customParams, transform]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCustomParamChange = field => event => {
    setCustomParams(prev => ({ ...prev, [field]: event.target.value }))
  }

  const queryString = buildQueryString(baseParams, transform)
  const collectionBase = (collectionUrl || '/:owner/collections/:collection').replace(/\/$/, '')
  const endpoint = `${collectionBase}/references/${queryString}`
  const conceptExpr = conceptUrl || '/:owner/sources/:source/concepts/:id/'
  const requestBody = JSON.stringify({ data: { expressions: [conceptExpr] }, cascade: baseParams.method || '' }, null, 2)

  return (
    <Box>
      {/* Cascade dropdown + Transform checkbox on same row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Cascade</InputLabel>
          <Select
            value={selectedPresetId}
            label="Cascade"
            onChange={e => setSelectedPresetId(e.target.value)}
          >
            {PRESETS.map(preset => (
              <MenuItem key={preset.id} value={preset.id}>{preset.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={transform}
                onChange={e => setTransform(e.target.checked)}
              />
            }
            label="Transform"
            sx={{ mr: 0, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
          />
          <Tooltip
            title="Applies the OpenMRS transform to restructure cascade results into OpenMRS-compatible format. Only relevant when using OpenMRS or a custom sourcetoconcepts cascade."
            placement="top"
            arrow
          >
            <IconButton size="small" tabIndex={-1} sx={{ p: 0.25, color: 'text.secondary' }}>
              <HelpOutlineIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Custom params form */}
      <Collapse in={selectedPresetId === 'custom'} unmountOnExit>
        <Box
          sx={{
            mt: 1.5,
            pl: 1.5,
            borderLeft: '2px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <FormControl size="small" fullWidth>
            <InputLabel>Method</InputLabel>
            <Select
              value={customParams.method}
              label="Method"
              onChange={handleCustomParamChange('method')}
            >
              <MenuItem value="sourcetoconcepts">sourcetoconcepts — traverse to target concepts</MenuItem>
              <MenuItem value="sourcemappings">sourcemappings — mappings only</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Map Types"
            placeholder="e.g. Q-AND-A,CONCEPT-SET"
            value={customParams.mapTypes}
            onChange={handleCustomParamChange('mapTypes')}
            helperText="Comma-separated map types to follow during traversal"
            fullWidth
          />

          <TextField
            size="small"
            label="Exclude Map Types"
            placeholder="e.g. SAME-AS"
            value={customParams.excludeMapTypes}
            onChange={handleCustomParamChange('excludeMapTypes')}
            helperText="Comma-separated map types to exclude"
            fullWidth
          />

          <TextField
            size="small"
            label="Cascade Levels"
            placeholder="* or a number"
            value={customParams.cascadeLevels}
            onChange={handleCustomParamChange('cascadeLevels')}
            helperText="Number of traversal hops; * = unlimited"
            fullWidth
          />

          <TextField
            size="small"
            label="Return Map Types"
            placeholder="* or specific types"
            value={customParams.returnMapTypes}
            onChange={handleCustomParamChange('returnMapTypes')}
            helperText="Which map types to include in results"
            fullWidth
          />
        </Box>
      </Collapse>

      {/* API call preview */}
      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          size="small"
          icon={<CodeIcon />}
          label={showPreview ? 'Hide API call' : 'Preview API call'}
          variant="outlined"
          clickable
          onClick={() => setShowPreview(v => !v)}
          sx={{ fontSize: '0.7rem' }}
        />
      </Box>

      <Collapse in={showPreview} unmountOnExit>
        <Box
          sx={{
            mt: 1,
            p: 1.25,
            bgcolor: 'grey.100',
            borderRadius: 1,
            fontFamily: 'monospace', // eslint-disable-line spellcheck/spell-checker
            fontSize: '0.72rem',
            wordBreak: 'break-all',
            color: 'text.secondary',
            whiteSpace: 'pre-wrap',
          }}
        >
          {`PUT ${endpoint}\n\n${requestBody}`}
        </Box>
      </Collapse>
    </Box>
  )
}

export default CascadeSelector
