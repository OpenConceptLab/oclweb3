import React from 'react'
import { useTranslation } from 'react-i18next'
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
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined'
import CodeIcon from '@mui/icons-material/CodeOutlined'
import { PRESETS, DEFAULT_CUSTOM_PARAMS, getCascadeRequest } from './cascadeRequest'

// onChange gets {cascade, queryParams}: the request body's cascade and the query params to send
const CascadeSelector = ({ onChange, conceptUrl, collectionUrl, showPreviewDefault = false }) => {
  const { t } = useTranslation()
  const [selectedPresetId, setSelectedPresetId] = React.useState('none')
  const [transform, setTransform] = React.useState(false)
  const [customParams, setCustomParams] = React.useState(DEFAULT_CUSTOM_PARAMS)
  const [showPreview, setShowPreview] = React.useState(showPreviewDefault)
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  const request = getCascadeRequest(selectedPresetId, customParams, transform)

  React.useEffect(() => {
    if (onChange) onChange(request)
  }, [onChange, selectedPresetId, customParams, transform])

  const handleCustomParamChange = field => event => {
    setCustomParams(prev => ({ ...prev, [field]: event.target.value }))
  }

  const queryString = request.queryParams ? `?${new URLSearchParams(request.queryParams)}` : ''
  const collectionBase = (collectionUrl || '/:owner/collections/:collection').replace(/\/$/, '')
  const endpoint = `${collectionBase}/references/${queryString}`
  const conceptExpr = conceptUrl || '/:owner/sources/:source/concepts/:id/'
  const requestBody = JSON.stringify({ data: { expressions: [conceptExpr] }, cascade: request.cascade }, null, 2)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Cascade</InputLabel>
          <Select
            value={selectedPresetId}
            label="Cascade"
            onChange={e => setSelectedPresetId(e.target.value)}
          >
            {PRESETS.map(preset => (
              <MenuItem key={preset.id} value={preset.id}>{t(preset.labelKey)}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
            value={customParams.map_types}
            onChange={handleCustomParamChange('map_types')}
            helperText="Comma-separated map types to follow during traversal"
            fullWidth
          />

          <TextField
            size="small"
            label="Exclude Map Types"
            placeholder="e.g. SAME-AS"
            value={customParams.exclude_map_types}
            onChange={handleCustomParamChange('exclude_map_types')}
            helperText="Comma-separated map types to exclude"
            fullWidth
          />

          <TextField
            size="small"
            label="Cascade Levels"
            placeholder="* or a number"
            value={customParams.cascade_levels}
            onChange={handleCustomParamChange('cascade_levels')}
            helperText="Number of traversal hops; * = unlimited"
            fullWidth
          />

          <TextField
            size="small"
            label="Return Map Types"
            placeholder="* or specific types"
            value={customParams.return_map_types}
            onChange={handleCustomParamChange('return_map_types')}
            helperText="Which map types to include in results"
            fullWidth
          />
        </Box>
      </Collapse>

      {/* Advanced options */}
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          size="small"
          label={showAdvanced ? t('reference.hide_advanced') : t('reference.advanced')}
          variant="outlined"
          clickable
          onClick={() => setShowAdvanced(v => !v)}
          sx={{ fontSize: '0.7rem' }}
        />
      </Box>

      <Collapse in={showAdvanced} unmountOnExit>
        <Box sx={{ mt: 1.5, pl: 1.5, borderLeft: '2px solid', borderColor: 'divider' }}>
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
              title={t('reference.transform_tooltip')}
              placement="top"
              arrow
            >
              <IconButton size="small" tabIndex={-1} sx={{ p: 0.25, color: 'text.secondary' }}>
                <HelpOutlineIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          </Box>
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
