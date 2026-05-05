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

const getResourceLabel = resource => {
  if(resource.display_name) return resource.display_name
  if(resource.map_type) return `${resource.from_concept_code || ''} [${resource.map_type}] ${resource.to_concept_code || ''}`
  return resource.id
}

const getResourcePath = resource => resource.concept_class !== undefined ? 'concepts' : 'mappings'

const RemoveFromCollectionDialog = ({ open, onClose, onConfirm, resources, collectionUrl, loading }) => {
  const { t } = useTranslation()
  const [fetchingRefs, setFetchingRefs] = React.useState(false)
  const [resourcesWithRefs, setResourcesWithRefs] = React.useState([])
  const [checkedRefIds, setCheckedRefIds] = React.useState(new Set())

  React.useEffect(() => {
    if(!open || !resources?.length || !collectionUrl) return
    setFetchingRefs(true)
    setResourcesWithRefs([])
    setCheckedRefIds(new Set())

    Promise.all(
      resources.map(resource =>
        APIService.new()
          .overrideURL(`${collectionUrl}${getResourcePath(resource)}/${encodeURIComponent(resource.id)}/`)
          .get(null, null, { includeReferences: true })
          .then(response => ({ resource, references: response?.data?.references || [] }))
          .catch(() => ({ resource, references: [] }))
      )
    ).then(results => {
      setResourcesWithRefs(results)
      const allIds = new Set()
      results.forEach(({ references }) => references.forEach(ref => ref.id && allIds.add(ref.id)))
      setCheckedRefIds(allIds)
      setFetchingRefs(false)
    })
  }, [open])

  const onToggleRef = refId => {
    setCheckedRefIds(prev => {
      const next = new Set(prev)
      if(next.has(refId)) next.delete(refId)
      else next.add(refId)
      return next
    })
  }

  const showGroupHeaders = resourcesWithRefs.length > 1
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
                    <Typography sx={{fontSize: '13px', fontWeight: 'bold'}}>{getResourceLabel(resource)}</Typography>
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
                        key={ref.id || refIndex}
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
