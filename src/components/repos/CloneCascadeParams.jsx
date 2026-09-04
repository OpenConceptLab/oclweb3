import React from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CascadeLevelDropdown from './CascadeLevelDropdown'
import SourceMapTypeDropdown from './SourceMapTypeDropdown'

const CloneCascadeParams = ({ params, onChange, disabled, conceptSources, toSource }) => {
  const { t } = useTranslation()
  const set = (field, value) => onChange({ ...params, [field]: value })
  const destinationSources = toSource ? [toSource] : []

  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
        {t('cloneToSource.advanced_caution')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {t('cloneToSource.origination_sources')}
          </Typography>
          <CascadeLevelDropdown
            label={t('cloneToSource.cascade_levels')}
            value={params.cascadeLevels}
            disabled={disabled}
            backgroundColor='surface.n92'
            onChange={value => set('cascadeLevels', value)}
          />
          <SourceMapTypeDropdown
            label={t('cloneToSource.map_types')}
            sources={conceptSources}
            value={params.mapTypes}
            disabled={disabled}
            backgroundColor='surface.n92'
            multiple
            onChange={value => set('mapTypes', value)}
          />
          <SourceMapTypeDropdown
            label={t('cloneToSource.exclude_map_types')}
            placeholder='e.g. Q-AND-A,CONCEPT-SET'
            sources={conceptSources}
            value={params.excludeMapTypes}
            disabled={disabled}
            backgroundColor='surface.n92'
            multiple
            onChange={value => set('excludeMapTypes', value)}
          />
          <SourceMapTypeDropdown
            label={t('cloneToSource.return_map_types')}
            placeholder='e.g. Q-AND-A,CONCEPT-SET'
            sources={conceptSources}
            value={params.returnMapTypes}
            disabled={disabled}
            backgroundColor='surface.n92'
            multiple
            includeAll
            onChange={value => set('returnMapTypes', value)}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {t('cloneToSource.destination_source')}
          </Typography>
          <SourceMapTypeDropdown
            label={t('cloneToSource.equivalency_map_type')}
            placeholder='e.g. SAME-AS,CONCEPT-SET'
            sources={destinationSources}
            value={params.equivalencyMapType}
            disabled={disabled}
            backgroundColor='surface.n92'
            multiple
            freeSolo
            includeSameAs
            onChange={value => set('equivalencyMapType', value)}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default CloneCascadeParams
