import React from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'
import APIService from '../../services/APIService'
import { dropVersion } from '../../common/utils'
import RepoChip from '../repos/RepoChip'

const getUrlPart = (url, part) => {
  const parts = (url || '').replace(/\/$/, '').split('/')
  const index = parts.lastIndexOf(part)
  return index !== -1 ? parts[index + 1] : null
}

const getRepoFromConcept = concept => {
  const sourceId = concept.source || getUrlPart(concept.source_url || concept.url, 'sources')
  if(!sourceId) return null
  const sourceURL = concept.source_url || (concept.owner_url ? `${concept.owner_url}sources/${sourceId}/` : undefined)

  return {
    id: sourceId,
    short_code: sourceId,
    type: 'Source',
    url: sourceURL,
    owner: concept.owner,
    owner_type: concept.owner_type,
    owner_url: concept.owner_url,
    version: concept.latest_source_version,
    version_url: concept.latest_source_version && sourceURL ? `${sourceURL}${concept.latest_source_version}/` : undefined,
  }
}

const getMappingSourceToken = mapping => {
  const source = mapping.to_source || mapping.to_source_name || getUrlPart(mapping.to_source_url || mapping.to_concept_url, 'sources') || mapping.source
  const version = mapping.to_source_version || mapping.latest_source_version
  return source && version ? `${source}(v${version})` : source
}

const getMappingInlineSyntax = mapping => {
  const mapType = mapping.map_type ? `[${mapping.map_type}] ` : ''
  const source = getMappingSourceToken(mapping)
  const code = mapping.to_concept_code || mapping.to_concept || mapping.id
  const name = mapping.to_concept_name_resolved || mapping.to_concept_name
  const escapedName = name ? name.replace(/"/g, '\\"') : ''

  return `${mapType}${source ? `${source}:` : ''}${code || ''}${escapedName ? ` "${escapedName}"` : ''}`
}

const getResourcePath = resource => resource.concept_class !== undefined ? 'concepts' : 'mappings'

const ResourceLabel = ({ resource }) => {
  if(resource.concept_class !== undefined) {
    const repo = getRepoFromConcept(resource)

    return (
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0}}>
        <Typography component='span' sx={{fontSize: '13px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {resource.id} {resource.display_name || resource.name || ''}
        </Typography>
        {repo && (
          <React.Fragment>
            <Typography component='span' sx={{fontSize: '13px', color: 'text.secondary'}}>&middot;</Typography>
            <RepoChip
              noTooltip
              noLink
              hideType
              size='small'
              repo={repo}
              sx={{minWidth: 0, maxWidth: '160px', '.entity-id': {overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}}
            />
          </React.Fragment>
        )}
      </Box>
    )
  }

  return (
    <Typography sx={{fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
      {getMappingInlineSyntax(resource)}
    </Typography>
  )
}

const RemoveFromCollectionDialog = ({ open, onClose, onConfirm, resources, collectionUrl, loading }) => {
  const { t } = useTranslation()
  const [fetchingRefs, setFetchingRefs] = React.useState(false)
  const [resourcesWithRefs, setResourcesWithRefs] = React.useState([])
  const [checkedRefIds, setCheckedRefIds] = React.useState(new Set())
  const baseCollectionUrl = dropVersion(collectionUrl)

  React.useEffect(() => {
    if(!open || !resources?.length || !baseCollectionUrl) {
      setFetchingRefs(false)
      setResourcesWithRefs([])
      setCheckedRefIds(new Set())
      return
    }

    let active = true
    setFetchingRefs(true)
    setResourcesWithRefs([])
    setCheckedRefIds(new Set())

    Promise.all(
      resources.map(resource =>
        APIService.new()
          .overrideURL(`${baseCollectionUrl}${getResourcePath(resource)}/${encodeURIComponent(resource.id)}/`)
          .get(null, null, { includeReferences: true })
          .then(response => ({ resource, references: response?.data?.references || [] }))
          .catch(() => ({ resource, references: [] }))
      )
    ).then(results => {
      if(!active) return
      setResourcesWithRefs(results)
      const allIds = new Set()
      results.forEach(({ references }) => references.forEach(ref => ref.id && allIds.add(ref.id)))
      setCheckedRefIds(allIds)
      setFetchingRefs(false)
    })

    return () => {
      active = false
    }
  }, [open, resources, baseCollectionUrl])

  const onToggleRef = refId => {
    setCheckedRefIds(prev => {
      const next = new Set(prev)
      if(next.has(refId)) next.delete(refId)
      else next.add(refId)
      return next
    })
  }

  const showGroupHeaders = resourcesWithRefs.length > 0
  const checkedCount = checkedRefIds.size
  const isDisabled = loading || fetchingRefs || checkedCount === 0

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        {t('reference.remove_from_collection')}
      </DialogTitle>
      <DialogContent>
        {fetchingRefs ? (
          <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3, gap: 1}}>
            <CircularProgress size={20} />
            <Typography variant='body2' color='text.secondary'>{t('common.loading')}</Typography>
          </Box>
        ) : (
          <List dense disablePadding sx={{border: '1px solid rgba(0,0,0,0.12)', borderRadius: '4px'}}>
            {resourcesWithRefs.map(({ resource, references }, groupIndex) => (
              <React.Fragment key={resource.id}>
                {showGroupHeaders && (
                  <ListItem sx={{bgcolor: 'rgba(0,0,0,0.04)', px: 1.5, py: 0.5, borderTop: groupIndex > 0 ? '1px solid rgba(0,0,0,0.12)' : 'none'}}>
                    <ResourceLabel resource={resource} />
                  </ListItem>
                )}
                {references.length === 0 ? (
                  <ListItem sx={{pl: showGroupHeaders ? 3 : 1.5, py: 0.5}}>
                    <Typography sx={{fontSize: '12px', color: 'text.secondary', fontStyle: 'italic'}}>{t('reference.no_references_found')}</Typography>
                  </ListItem>
                ) : (
                  references.map((ref, refIndex) => {
                    const isLastInGroup = refIndex === references.length - 1
                    const isLastGroup = groupIndex === resourcesWithRefs.length - 1
                    return (
                      <ListItem
                        key={`${ref.id || ref.expression || 'reference'}-${groupIndex}-${refIndex}`}
                        divider={!(isLastInGroup && isLastGroup)}
                        sx={{padding: '2px 12px 2px 4px', pl: showGroupHeaders ? 2 : 0.5}}
                      >
                        <Checkbox
                          edge='start'
                          checked={checkedRefIds.has(ref.id)}
                          disabled={loading || !ref.id}
                          onChange={() => onToggleRef(ref.id)}
                          size='small'
                          inputProps={{'aria-label': ref.expression}}
                        />
                        <ListItemText
                          primary={ref.expression}
                          primaryTypographyProps={{sx: {fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all'}}}
                        />
                      </ListItem>
                    )
                  })
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='text' disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={() => onConfirm({ ids: Array.from(checkedRefIds) })}
          variant='contained'
          color='error'
          disabled={isDisabled}
          startIcon={loading ? <CircularProgress size={16} color='inherit' /> : null}
        >
          {t('common.remove')} {!fetchingRefs && checkedCount > 0 ? `(${checkedCount})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RemoveFromCollectionDialog
