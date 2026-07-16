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

const getVersionToken = version => {
  if(!version) return null
  if(String(version).toUpperCase() === 'HEAD') return version
  return String(version).match(/^v/i) ? version : `v${version}`;
}

const getMappingSourceToken = (mapping, direction) => {
  const source = mapping[`${direction}_source`] ||
    mapping[`${direction}_source_name`] ||
    getUrlPart(mapping[`${direction}_source_url`] || mapping[`${direction}_concept_url`], 'sources') ||
    (direction === 'from' ? mapping.source : null)
  const version = getVersionToken(mapping[`${direction}_source_version`] || (source === mapping.source ? mapping.latest_source_version : null))

  return source && version ? `${source}(${version})` : source
}

const getMappingConceptSyntax = (mapping, direction) => {
  const source = getMappingSourceToken(mapping, direction)
  const code = mapping[`${direction}_concept_code`] || mapping[`${direction}_concept`] || mapping.id
  const name = mapping[`${direction}_concept_name_resolved`] || mapping[`${direction}_concept_name`]
  const escapedName = name ? name.replace(/"/g, '\\"') : ''

  return `${source ? `${source}:` : ''}${code || ''}${escapedName ? ` "${escapedName}"` : ''}`
}

const getMappingInlineSyntax = mapping => {
  const mapType = mapping.map_type ? `[${mapping.map_type}]` : '[SAME-AS]'
  return `${getMappingConceptSyntax(mapping, 'from')} ${mapType} ${getMappingConceptSyntax(mapping, 'to')}`
}

const getResourcePath = resource => resource.concept_class !== undefined ? 'concepts' : 'mappings'

const getResourceUrl = (resource, collectionUrl) => {
  if(collectionUrl)
    return `${collectionUrl}${getResourcePath(resource)}/${encodeURIComponent(resource.id)}/`
  if(resource.version_url || resource.url)
    return resource.version_url || resource.url

  return ''
}

const hasReferenceIds = references => Array.isArray(references) && references.some(ref => ref?.id)

const getReferenceLabel = reference => {
  if(typeof reference === 'string') return reference
  return reference?.expression || reference?.url || reference?.uri || ''
}

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
    <Typography sx={{fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', overflowWrap: 'anywhere'}}>
      {getMappingInlineSyntax(resource)}
    </Typography>
  )
}

const RemoveFromCollectionDialog = ({ open, onClose, onConfirm, resources, collectionUrl, lookupCollectionUrl, loading }) => {
  const { t } = useTranslation()
  const [fetchingRefs, setFetchingRefs] = React.useState(false)
  const [resourcesWithRefs, setResourcesWithRefs] = React.useState([])
  const [checkedRefIds, setCheckedRefIds] = React.useState(new Set())
  const baseCollectionUrl = dropVersion(collectionUrl)
  const resourceLookupUrl = lookupCollectionUrl || baseCollectionUrl

  React.useEffect(() => {
    if(!open || !resources?.length || !resourceLookupUrl) {
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
      resources.map(resource => {
        if(hasReferenceIds(resource.references))
          return Promise.resolve({ resource, references: resource.references })

        return APIService.new()
          .overrideURL(getResourceUrl(resource, resourceLookupUrl))
          .get(null, null, { includeReferences: true })
          .then(response => ({ resource, references: response?.data?.references || [] }))
          .catch(() => ({ resource, references: [] }))
      })
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
  }, [open, resources, resourceLookupUrl])

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
            <Typography variant='body2' sx={{
              color: 'text.secondary'
            }}>{t('common.loading')}</Typography>
          </Box>
        ) : (
          <List dense disablePadding sx={{border: '1px solid rgba(0,0,0,0.12)', borderRadius: '4px'}}>
            {resourcesWithRefs.map(({ resource, references }, groupIndex) => (
              <React.Fragment key={resource.id}>
                {showGroupHeaders && (
                  <ListItem sx={[{
                    bgcolor: 'rgba(0,0,0,0.04)',
                    px: 1.5,
                    py: 0.5
                  }, groupIndex > 0 ? {
                    borderTop: '1px solid rgba(0,0,0,0.12)'
                  } : {
                    borderTop: 'none'
                  }]}>
                    <ResourceLabel resource={resource} />
                  </ListItem>
                )}
                {references.length === 0 ? (
                  <ListItem sx={[{
                    py: 0.5
                  }, showGroupHeaders ? {
                    pl: 3
                  } : {
                    pl: 1.5
                  }]}>
                    <Typography sx={{fontSize: '12px', color: 'text.secondary', fontStyle: 'italic'}}>{t('reference.no_references_found')}</Typography>
                  </ListItem>
                ) : (
                  references.map((ref, refIndex) => {
                    const isLastInGroup = refIndex === references.length - 1
                    const isLastGroup = groupIndex === resourcesWithRefs.length - 1
                    return (
                      <ListItem
                        key={`${ref.id || getReferenceLabel(ref) || 'reference'}-${groupIndex}-${refIndex}`}
                        divider={!(isLastInGroup && isLastGroup)}
                        sx={[{
                          padding: '2px 12px 2px 4px'
                        }, showGroupHeaders ? {
                          pl: 2
                        } : {
                          pl: 0.5
                        }]}
                      >
                        <Checkbox
                          edge='start'
                          checked={checkedRefIds.has(ref.id)}
                          disabled={loading || !ref.id}
                          onChange={() => onToggleRef(ref.id)}
                          size='small'
                          slotProps={{input: {'aria-label': getReferenceLabel(ref)}}}
                        />
                        <ListItemText
                          primary={getReferenceLabel(ref)}
                          slotProps={{primary: {sx: {fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all'}}}}
                        />
                      </ListItem>
                    );
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
  );
}

export default RemoveFromCollectionDialog
