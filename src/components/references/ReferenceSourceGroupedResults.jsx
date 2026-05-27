import React from 'react'
import { useTranslation } from 'react-i18next'
import find from 'lodash/find'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import orderBy from 'lodash/orderBy'
import uniq from 'lodash/uniq'
import isNumber from 'lodash/isNumber'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import CollapseIcon from '@mui/icons-material/KeyboardArrowDown'
import ExpandIcon from '@mui/icons-material/KeyboardArrowRight'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { SOURCE_COLORS } from '../../common/colors'
import { hashString, URIToParentParams } from '../../common/utils'
import RepoChip from '../repos/RepoChip'

const getReferenceId = reference => reference.version_url || reference.url || reference.id

const getReferenceSummary = reference => {
  let label = ''
  if(reference.last_resolved_at && reference.concepts === 0 && reference.mappings === 0)
    return '-'
  if(isNumber(reference.concepts) && reference.concepts > 0)
    label += `${reference.concepts.toLocaleString()} concepts`
  if(isNumber(reference.mappings) && reference.mappings > 0) {
    if(label?.length)
      label += ', '
    label += `${reference.mappings.toLocaleString()} mappings`
  }

  return label || '-'
}

const getSourceColorKey = source => [source?.owner, source?.id || source?.short_code].filter(Boolean).join('/')

const parseSourceFromExpression = expression => {
  if(!expression || !/\/sources\//.test(expression))
    return false

  const parent = URIToParentParams(expression)
  if(!parent.repo)
    return false

  const parts = expression.split('/').filter(Boolean)
  const sourceIndex = parts.indexOf('sources')
  const afterSourceId = parts[sourceIndex + 2]
  const isVersion = afterSourceId && !['concepts', 'mappings'].includes(afterSourceId)

  return {
    id: parent.repo,
    short_code: parent.repo,
    owner: parent.owner,
    type: isVersion ? 'Source Version' : 'Source',
    version: isVersion ? afterSourceId : undefined,
  }
}

const getSource = reference => {
  const resolvedSource = find(reference?.resolved_repo_versions, version => ['Source Version', 'Source'].includes(version?.type)) || reference?.resolved_repo_versions?.[0]
  return resolvedSource || parseSourceFromExpression(reference?.expression) || {id: 'unresolved', short_code: 'Unresolved', type: 'Source'}
}

const getSourceKey = reference => {
  const source = getSource(reference)
  return source.version_url || source.url || [source.owner, source.id || source.short_code, source.version].filter(Boolean).join('/')
}

export const getReferenceSourceGroups = references => {
  const grouped = groupBy(references || [], getSourceKey)
  return orderBy(map(grouped, (items, key) => ({key, source: getSource(items[0]), references: items})), group => (group.source?.short_code || group.source?.id || '').toLowerCase())
}

const getCascadeValue = reference => {
  if(!reference?.cascade)
    return ''
  if(typeof reference.cascade === 'string')
    return reference.cascade
  if(reference.cascade?.method)
    return reference.cascade.method
  return JSON.stringify(reference.cascade)
}

const getCascadeLabel = (references, t) => {
  const values = uniq(references.map(getCascadeValue))
  if(values.length > 1)
    return {label: t('reference.mixed'), mixed: true}
  const value = values[0]
  if(!value)
    return {label: t('common.none'), mixed: false}
  const normalized = value.toLowerCase()
  if(normalized === 'sourcetoconcepts')
    return {label: t('reference.source_to_concepts'), mixed: false}
  if(normalized === 'sourcemappings')
    return {label: t('reference.source_to_mappings'), mixed: false}
  return {label: value, mixed: false}
}

const getConceptLabel = reference => {
  if(reference.translation)
    return reference.translation
  const expression = reference.expression || ''
  const parts = expression.replace(/\/$/, '').split('/')
  const conceptIndex = parts.indexOf('concepts')
  const mappingIndex = parts.indexOf('mappings')
  const resourceIndex = conceptIndex !== -1 ? conceptIndex : mappingIndex
  if(resourceIndex !== -1 && parts[resourceIndex + 1])
    return parts[resourceIndex + 1]
  return expression
}

const SourceGroup = ({ group, selected, onSelectedChange, onReferenceClick, isItemShown, size }) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = React.useState(true)
  const ids = group.references.map(getReferenceId).filter(Boolean)
  const allSelected = ids.length > 0 && ids.every(id => selected.includes(id))
  const someSelected = ids.some(id => selected.includes(id))
  const cascade = getCascadeLabel(group.references, t)
  const sourceColor = SOURCE_COLORS[hashString(getSourceColorKey(group.source) || group.key) % SOURCE_COLORS.length]

  const onGroupSelect = event => {
    event.stopPropagation()
    const nextSelected = allSelected ? selected.filter(id => !ids.includes(id)) : uniq([...selected, ...ids])
    onSelectedChange(nextSelected)
  }

  const onRowSelect = (event, id) => {
    event.stopPropagation()
    const nextSelected = selected.includes(id) ? selected.filter(selectedId => selectedId !== id) : [...selected, id]
    onSelectedChange(nextSelected)
  }

  return (
    <React.Fragment>
      <TableRow sx={{backgroundColor: '#f8f7ff'}}>
        <TableCell padding='checkbox'>
          <Checkbox
            size={size || 'medium'}
            checked={allSelected}
            indeterminate={!allSelected && someSelected}
            onChange={onGroupSelect}
          />
        </TableCell>
        <TableCell padding='checkbox'>
          <IconButton size='small' onClick={() => setExpanded(!expanded)}>
            {expanded ? <CollapseIcon fontSize='small' /> : <ExpandIcon fontSize='small' />}
          </IconButton>
        </TableCell>
        <TableCell colSpan={3}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
            <RepoChip
              hideType
              noLink
              size='small'
              repo={group.source}
              sx={{
                backgroundColor: `${sourceColor.bg} !important`,
                borderColor: sourceColor.border,
                minWidth: 'auto'
              }}
            />
            <Chip size='small' label={`${group.references.length.toLocaleString()} ${t(group.references.length === 1 ? 'reference.reference' : 'reference.references').toLowerCase()}`} />
            <Typography sx={{fontSize: '13px', color: 'text.secondary'}}>
              {t('reference.cascade')}: {cascade.label}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
      {
        expanded && group.references.map((reference, index) => {
          const id = getReferenceId(reference)
          const isSelected = selected.includes(id)
          const isShown = isItemShown(id)
          return (
            <TableRow
              hover
              key={id || index}
              selected={isShown}
              className={isShown ? 'show-item' : ''}
              onClick={event => onReferenceClick(event, id)}
              sx={{
                cursor: 'pointer',
                backgroundColor: '#FFF',
                '&.Mui-selected': {
                  backgroundColor: 'primary.90'
                },
                '&.MuiTableRow-hover:hover': {
                  backgroundColor: isShown ? 'primary.90' : 'primary.95'
                },
              }}
            >
              <TableCell padding='checkbox' onClick={event => onRowSelect(event, id)}>
                <Checkbox size={size || 'medium'} checked={isSelected} />
              </TableCell>
              <TableCell padding='checkbox' />
              <TableCell className='searchable' sx={{pl: 3}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                  {
                    reference.include === false &&
                      <Chip color='error' size='small' label={t('reference.exclude')} />
                  }
                  <Typography sx={{fontSize: '13px'}}>{getConceptLabel(reference)}</Typography>
                </Box>
              </TableCell>
              <TableCell>{reference.last_resolved_at ? getReferenceSummary(reference) : '-'}</TableCell>
              <TableCell align='right'>
                <IconButton size='small' onClick={event => onReferenceClick(event, id)}>
                  <MoreVertIcon fontSize='small' />
                </IconButton>
              </TableCell>
            </TableRow>
          )
        })
      }
    </React.Fragment>
  )
}

const ReferenceSourceGroupedResults = ({ selected, results, loading, selectedToShowItem, handleRowClick, onSelectedChange, className, style, size }) => {
  const { t } = useTranslation()
  const rows = results?.results || []
  const groups = getReferenceSourceGroups(rows)
  const isItemShown = id => (selectedToShowItem?.version_url || selectedToShowItem?.url || selectedToShowItem?.id) === id

  return (
    <TableContainer style={style || {height: 'calc(100vh - 263px)'}} className={className}>
      <Table stickyHeader size={size || 'small'} sx={{'.MuiTableCell-head': {lineHeight: '1.2rem', padding: '3px 16px', fontSize: '12px'}}}>
        <TableHead>
          <TableRow sx={{background: '#FFF'}}>
            <TableCell padding='checkbox' sx={{background: 'inherit'}} />
            <TableCell padding='checkbox' sx={{background: 'inherit'}} />
            <TableCell sx={{background: 'inherit'}}><b>{t('reference.reference')}</b></TableCell>
            <TableCell sx={{background: 'inherit'}}><b>{t('common.results')}</b></TableCell>
            <TableCell align='right' sx={{background: 'inherit'}} />
          </TableRow>
        </TableHead>
        <TableBody>
          {
            loading ?
              map(Array.from({length: 10}), (item, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton height={33} sx={{'WebkitTransform': 'none', transform: 'none'}} /></TableCell>
                  <TableCell><Skeleton height={33} sx={{'WebkitTransform': 'none', transform: 'none'}} /></TableCell>
                  <TableCell><Skeleton height={33} sx={{'WebkitTransform': 'none', transform: 'none'}} /></TableCell>
                  <TableCell><Skeleton height={33} sx={{'WebkitTransform': 'none', transform: 'none'}} /></TableCell>
                  <TableCell><Skeleton height={33} sx={{'WebkitTransform': 'none', transform: 'none'}} /></TableCell>
                </TableRow>
              )) :
              groups.map(group => (
                <SourceGroup
                  key={group.key}
                  group={group}
                  selected={selected}
                  onSelectedChange={onSelectedChange}
                  onReferenceClick={handleRowClick}
                  isItemShown={isItemShown}
                  size={size}
                />
              ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ReferenceSourceGroupedResults
