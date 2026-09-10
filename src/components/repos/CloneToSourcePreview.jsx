import React from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { filter } from 'lodash'
import ConceptChip from '../concepts/ConceptChip'
import MappingIcon from '../mappings/MappingIcon'

const CONCEPT_TYPES = ['Concept', 'Concept Version']
const MAPPING_TYPES = ['Mapping', 'Mapping Version']

const isVersionType = type => (type || '').endsWith('Version')

const entityHref = entity => {
  const url = isVersionType(entity?.type)
    ? entity?.version_url || entity?.url
    : entity?.url || entity?.version_url
  return url ? `#${url}` : undefined
}

const MappingRow = ({ mapping }) => {
  const href = entityHref(mapping)
  return (
    <Box
      component={href ? 'a' : 'div'}
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        color: 'inherit',
        textDecoration: 'none',
        '&:hover': href ? { textDecoration: 'underline' } : {},
      }}
    >
      <MappingIcon sx={{ fontSize: '16px', color: 'text.secondary' }} />
      <Typography variant='body2' sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <b>{mapping.map_type}</b>
        {' — '}
        {mapping.from_concept_code}
        {' → '}
        {mapping.to_concept_code}
      </Typography>
    </Box>
  )
}

const Column = ({ title, items, emptyText, renderItem }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
      {title}
    </Typography>
    {items.length === 0 ? (
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {emptyText}
      </Typography>
    ) : (
      items.map((item, index) => (
        <React.Fragment key={item.url || item.id || index}>
          {renderItem(item)}
          {index < items.length - 1 && <Divider />}
        </React.Fragment>
      ))
    )}
  </Box>
)

const CloneToSourcePreview = ({ concept, isLoading }) => {
  const { t } = useTranslation()
  const bundle = concept?.previewBundle
  const entries = bundle?.entry || []
  const concepts = filter(entries, entry => CONCEPT_TYPES.includes(entry?.type))
  const mappings = filter(entries, entry => MAPPING_TYPES.includes(entry?.type))

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    )

  if (bundle && !Array.isArray(bundle.entry))
    return <Alert severity='error'>{bundle.detail || bundle.error || t('errors.generic')}</Alert>

  return (
    <Box sx={{ display: 'flex', gap: 2, maxHeight: '420px', overflow: 'auto' }}>
      <Column
        title={t('cloneToSource.concepts_count', { count: concepts.length })}
        items={concepts}
        emptyText={t('cloneToSource.no_concepts')}
        renderItem={item => (
          <Box sx={{ py: 0.75, display: 'flex' }}>
            <ConceptChip
              concept={item}
              filled
              noTooltip
              hideType
              href={entityHref(item)}
              target='_blank'
              rel='noopener noreferrer'
              sx={{
                maxWidth: '100%',
                '.MuiSvgIcon-root': { color: 'primary.main', fill: 'currentColor', fontSize: '18px' },
                '.MuiChip-label': { paddingTop: 0, paddingLeft: '2px' },
                '.entity-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
              }}
            />
          </Box>
        )}
      />
      <Divider orientation='vertical' flexItem />
      <Column
        title={t('cloneToSource.mappings_count', { count: mappings.length })}
        items={mappings}
        emptyText={t('cloneToSource.no_mappings')}
        renderItem={item => <MappingRow mapping={item} />}
      />
    </Box>
  )
}

export default CloneToSourcePreview
