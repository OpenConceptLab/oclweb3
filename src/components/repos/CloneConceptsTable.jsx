import React from 'react'
import { useTranslation } from 'react-i18next'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import ListIcon from '@mui/icons-material/FormatListNumberedOutlined'
import ErrorIcon from '@mui/icons-material/ErrorOutlined'
import { find, get, includes, isEmpty } from 'lodash'
import { toParentURI } from '../../common/utils'

const CONCEPT_TYPES = ['Concept', 'Concept Version']

const PreviewButton = ({ title, ...rest }) => (
  <Tooltip title={title} placement='top' arrow>
    <span>
      <IconButton size='small' color='primary' {...rest}>
        <ListIcon fontSize='inherit' />
      </IconButton>
    </span>
  </Tooltip>
)

const getClonedConcept = (concept, equivalencyMapType) => {
  const mapTypes = (equivalencyMapType || '').split(',').filter(Boolean)
  if (isEmpty(mapTypes)) return get(concept, 'bundle.entry.0')
  const mapping = find(
    concept?.bundle?.entry,
    entry => includes(mapTypes, entry?.map_type) && entry.to_concept_code === concept.id
  )
  return mapping
    ? find(
      concept?.bundle?.entry,
      entry => CONCEPT_TYPES.includes(entry?.type) && entry.id === mapping.from_concept_code
    )
    : undefined
}

const ResultStatus = ({ concept, equivalencyMapType, onPreviewClick }) => {
  const { t } = useTranslation()
  const isSuccess = concept.status === 200
  const added = concept.total || 0
  const cloned = isSuccess ? getClonedConcept(concept, equivalencyMapType) : undefined

  if (!isSuccess)
    return <Chip size='small' variant='outlined' color='error' label={t('cloneToSource.failed')} />

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <Chip
        size='small'
        variant='outlined'
        color={added ? 'success' : 'warning'}
        label={added ? t('cloneToSource.cloned_count', { count: added }) : t('cloneToSource.nothing_cloned')}
      />
      {Boolean(cloned) && (
        <PreviewButton
          title={t('cloneToSource.preview_result_tooltip')}
          onClick={() => onPreviewClick(cloned, true)}
        />
      )}
    </Box>
  )
}

const CloneConceptsTable = ({ concepts, toSourceUrl, showProgress, showStatus, onPreviewClick, equivalencyMapType }) => {
  const { t } = useTranslation()
  const headers = [
    { id: 'owner', label: t('common.owner') },
    { id: 'id', label: t('common.id') },
    { id: 'name', label: t('common.name') },
    { id: 'concept_class', label: t('concept.concept_class') },
    { id: 'datatype', label: t('concept.datatype') },
    { id: 'preview', label: t('cloneToSource.preview_header'), align: 'center' },
    ...(showStatus ? [{ id: 'results', label: t('cloneToSource.results_header'), align: 'center' }] : []),
  ]

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'auto', maxHeight: '280px' }}>
      <Table stickyHeader size='small'>
        <TableHead>
          <TableRow>
            {headers.map(header => (
              <TableCell
                key={header.id}
                align={header.align || 'left'}
                sx={{ fontWeight: 600, bgcolor: 'primary.95', whiteSpace: 'nowrap' }}
              >
                {header.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {concepts.map(concept => {
            const isSameAsDestination = Boolean(toSourceUrl) && toSourceUrl === toParentURI(concept.url || '')
            return (
              <TableRow key={concept.url || concept.id} sx={{ verticalAlign: 'top' }}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isSameAsDestination && (
                      <Tooltip title={t('cloneToSource.same_source_warning')} placement='top' arrow>
                        <ErrorIcon color='error' sx={{ fontSize: '1rem' }} />
                      </Tooltip>
                    )}
                    {`${concept.owner}/${concept.source}`}
                  </Box>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{concept.id}</TableCell>
                <TableCell>{concept.display_name}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{concept.concept_class}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{concept.datatype}</TableCell>
                <TableCell align='center'>
                  <PreviewButton
                    title={t('cloneToSource.preview_tooltip')}
                    onClick={() => onPreviewClick(concept, false)}
                  />
                </TableCell>
                {showStatus && (
                  <TableCell align='center'>
                    {showProgress ? (
                      <CircularProgress size={18} />
                    ) : (
                      Boolean(concept.status) && (
                        <ResultStatus
                          concept={concept}
                          equivalencyMapType={equivalencyMapType}
                          onPreviewClick={onPreviewClick}
                        />
                      )
                    )}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Box>
  )
}

export default CloneConceptsTable
