import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableContainer from '@mui/material/TableContainer'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import ButtonGroup from '@mui/material/ButtonGroup'

import SelectedIcon from '@mui/icons-material/Done';
import UpIcon from '@mui/icons-material/KeyboardArrowUp';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import WarnIcon from '@mui/icons-material/WarningAmber';
import { get, isEmpty, forEach, map, find, compact, flatten, values, filter, without, uniqBy, orderBy } from 'lodash';
import { generateRandomString, dropVersion, URIToParentParams, toParentURI, getResourceIdFromUrl } from '../../common/utils'
import TagCountLabel from '../common/TagCountLabel'
import RepoChip from '../repos/RepoChip'
import AssociationMappingCells from '../mappings/AssociationMappingCells'
import SortableAssociationRow from '../mappings/SortableAssociationRow'
import MappingInlineForm from '../mappings/MappingInlineForm'

const groupMappings = (orderedMappings, concept, mappings, forward) => {
  forEach(mappings, resource => {
    if(!(find(mappings, mapping => dropVersion(mapping.cascade_target_concept_url) === dropVersion(resource.url)))) {
      let mapType = resource.map_type
      const isMapping = Boolean(mapType)
      if(!mapType)
        mapType = forward ? 'children' : 'parent';
      orderedMappings[mapType] = orderedMappings[mapType] || {order: null, direct: [], indirect: [], unknown: [], hierarchy: [], reverseHierarchy: [], self: []}
      const isSelfMapping = isMapping && Boolean(concept?.url) && dropVersion(concept.url) === dropVersion(resource.cascade_target_concept_url)
      let _resource = isMapping ? {...resource, isSelf: isSelfMapping, cascade_target_concept_name: resource.cascade_target_concept_name || get(find(mappings, m => dropVersion(m.url) === dropVersion(resource.cascade_target_concept_url)), 'display_name')} : {...resource, cascade_target_concept_name: resource.display_name}
      if(isSelfMapping) {
        if(!map(orderedMappings[mapType].self, 'id').includes(resource.id))
          orderedMappings[mapType].self.push(_resource)
      } else {
        if(isMapping)
          forward ? orderedMappings[mapType].direct.push(_resource) : orderedMappings[mapType].indirect.push(_resource)
        else
          forward ? orderedMappings[mapType].hierarchy.push(_resource) : orderedMappings[mapType].reverseHierarchy.push(_resource)
      }
    }
  })
}


const AssociationRow = ({mappings, id, mapType, isSelf, isIndirect, isHierarchy, hide, getTargetURL}) => {
  const { t } = useTranslation()
  const rows = isHierarchy ? orderBy(mappings, 'display_name') : mappings
  const rowProps = resource => {
    const targetURL = getTargetURL ?
                    getTargetURL(resource) :
                    (resource?.type === 'Mapping' ? resource?.cascade_target_concept_url : resource?.url)
    return {
      hover: true,
      sx: {...(hide ? {display: 'none'} : {}), cursor: targetURL ? 'pointer' : 'default'},
      onClick: () => { if(targetURL) window.location.hash = targetURL }
    }
  }
  return (
    <React.Fragment>
      <TableRow id={id || mapType} {...rowProps(get(rows, 0))}>
        <TableCell className='sticky-col' rowSpan={rows?.length} align='left' sx={{verticalAlign: 'top', width: '22%', paddingLeft: '8px', top: '37px', zIndex: 1}}>
          <span className='flex-vertical-center'>
            <Tooltip placement='left' title={isHierarchy ? '' : (isIndirect ? t('mapping.inverse_mappings') : (isSelf ? t('mapping.self_mappings') : t('mapping.direct_mappings')))}>
              <Chip
                size='small'
                variant='outlined'
                color='default'
                label={
                  <span>
                    <span>{mapType}</span>
                    {isIndirect && <sup>-1</sup>}
                    {isSelf && <sup>∞</sup>}
                  </span>
                }
                sx={{
                  border: 'none',
                  height: 'auto',
                  minHeight: '24px',
                  maxWidth: '100%',
                  '.MuiChip-label': {whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', padding: '2px 8px'}
                }}
              />
            </Tooltip>
          </span>
        </TableCell>
        {
          !isEmpty(get(rows, 0)) &&
            <AssociationMappingCells mapping={get(rows, 0)} isIndirect={isIndirect} />
        }
      </TableRow>
      {
        map(rows?.slice(1), (mapping, index) => {
          return (!mapping || isEmpty(mapping)) ? null : (
            <TableRow key={index} {...rowProps(mapping)}>
              <AssociationMappingCells mapping={mapping} isIndirect={isIndirect} />
            </TableRow>
          )
        })
      }
    </React.Fragment>
  )
}
const borderColor = 'rgba(0, 0, 0, 0.12)'
const Associations = ({concept, source, repoSummary, mappings, reverseMappings, ownerMappings, reverseOwnerMappings, onLoadOwnerMappings, loadingOwnerMappings, nested, includeRetired, onIncludeRetiredToggle, readOnlyMappings, onCreateNewMapping, onUpdateMappingsSorting, onAssignSortWeight, onClearSortWeight, onRetireMapping}) => {
  const [scope, setScope] = React.useState('repo')
  const [mappingForm, setMappingForm] = React.useState(null)
  const [updatedMappings, setUpdatedMappings] = React.useState([])
  const [orderedMappings, setOrderedMappings] = React.useState({});
  const [orderedOwnerMappings, setOrderedOwnerMappings] = React.useState({});
  const [ownerMappingsGroupedByRepo, setOwnerMappingsGroupedByRepo] = React.useState({});
  const [collapsedSections, setCollapsedSections] = React.useState([])
  const { t } = useTranslation()
  const location = useLocation()
  const getMappings = () => {
    let _mappings = {}
    groupMappings(_mappings, concept, mappings, true)
    groupMappings(_mappings, concept, reverseMappings, false)
    return _mappings
  }
  const getOwnerMappings = () => {
    let _ownerMappingsGroupedByRepo = {}
    let groupedMappings = {}
    forEach(ownerMappings, _mapping => {
      let url = _mapping?.version_url || _mapping?.url
      let parent = URIToParentParams(url)
      let parentURI = toParentURI(url)
      _mapping.direct = true
      _mapping.parent = parent
      _ownerMappingsGroupedByRepo[parentURI] ||= []
      _ownerMappingsGroupedByRepo[parentURI].push(_mapping)
    })
    forEach(reverseOwnerMappings, _mapping => {
      _mapping.indirect = true
      let url = _mapping?.version_url || _mapping?.url
      let parent = URIToParentParams(url)
      let parentURI = toParentURI(url)
      _mapping.parent = parent
      _ownerMappingsGroupedByRepo[parentURI] ||= []
      _ownerMappingsGroupedByRepo[parentURI].push(_mapping)
    })
    setOwnerMappingsGroupedByRepo(_ownerMappingsGroupedByRepo)
    forEach(_ownerMappingsGroupedByRepo, (mappings, repoURI) => {
      let __mappings = {}
      groupMappings(__mappings, concept, filter(mappings, {direct: true}), true)
      groupMappings(__mappings, concept, filter(mappings, {indirect: true}), false)
      groupedMappings[repoURI] = __mappings
    })
    return groupedMappings
  }
  const countOwnerMappings = ownerMappings?.length + reverseOwnerMappings?.length
  const count = flatten(compact(flatten(map(values(orderedMappings), mapping => values(mapping))))).length + countOwnerMappings
  React.useEffect(() => setOrderedMappings(getMappings()), [mappings, reverseMappings])
  React.useEffect(() => setOrderedOwnerMappings(getOwnerMappings()), [ownerMappings, reverseOwnerMappings])
  const onScopeClick = newScope => {
    setScope(newScope)
    if(['all', 'namespace'].includes(newScope)) {
      loadingOwnerMappings === null ? onLoadOwnerMappings() : undefined
    }
  }
  const toggleSection = repoURI => setCollapsedSections(collapsedSections?.includes(repoURI) ? without(collapsedSections, repoURI) : [...collapsedSections, repoURI])

  const getHierarchyURL = resource => {
    const path = location.pathname.replace(/\/$/, '')
    const base = getResourceIdFromUrl(path, 'concepts') ? path.split('/').slice(0, -1).join('/') : (/\/concepts$/.test(path) ? path : null)
    return base ? `${base}/${encodeURIComponent(resource?.id)}/` : resource?.url
  }

  const hierarchyMeaning = source?.hierarchy_meaning
  const hierarchyMapType = isChild => (
    <span>
      <span>{isChild ? t('mapping.has_child') : t('mapping.has_parent')}</span>
      {!isChild && <sup>-1</sup>}
      {hierarchyMeaning && <span style={{display: 'block'}}>{`(${hierarchyMeaning})`}</span>}
    </span>
  )

  // Outside a HEAD source (repo version, global search) mappings are shown but cannot be added/sorted.
  const canManage = Boolean(onCreateNewMapping || onUpdateMappingsSorting)
  const canAct = Boolean(onCreateNewMapping) && !readOnlyMappings
  const canSort = Boolean(onUpdateMappingsSorting) && !readOnlyMappings
  const suggestedSources = compact([source])

  const _onCreateNewMapping = canAct ? (payload, targetConcept, isDirect) => onCreateNewMapping(payload, targetConcept, isDirect, () => setMappingForm(null)) : false
  const onSortEnd = canSort ? updated => setUpdatedMappings(uniqBy(updated, 'version_url')) : false
  const onSortCancel = () => {
    setUpdatedMappings([])
    setOrderedMappings(getMappings())
  }
  const onSortSave = () => {
    onUpdateMappingsSorting(updatedMappings)
    setUpdatedMappings([])
  }

  const renderInlineForm = (defaultMapType, isDirect) => (
    <TableRow>
      <TableCell colSpan={4}>
        <MappingInlineForm
          concept={concept}
          defaultMapType={defaultMapType}
          isDirect={isDirect}
          suggested={suggestedSources}
          repoSummary={repoSummary}
          onSubmit={_onCreateNewMapping}
          onClose={() => setMappingForm(null)}
        />
      </TableCell>
    </TableRow>
  )

  const renderMappingGroup = (groupMappingsList, mapType, kind) => {
    const isIndirect = kind === 'indirect'
    return (
      <React.Fragment key={`${kind}-${mapType}`}>
        {
          canManage ?
            <SortableAssociationRow
              concept={concept}
              mappings={groupMappingsList}
              mapType={mapType}
              isSelf={kind === 'self'}
              isIndirect={isIndirect}
              canAct={canAct}
              canSort={canSort && !isIndirect}
              onSortEnd={onSortEnd}
              onAddNewClick={() => setMappingForm({mapType: mapType, kind: kind})}
              onAssignSortWeight={onAssignSortWeight}
              onClearSortWeight={onClearSortWeight}
              onRetireMapping={onRetireMapping}
            /> :
          <AssociationRow mapType={mapType} mappings={groupMappingsList} isSelf={kind === 'self'} isIndirect={isIndirect} />
        }
        {
          mappingForm?.mapType === mapType && mappingForm?.kind === kind && renderInlineForm(mapType, !isIndirect)
        }
      </React.Fragment>
    )
  }

  return (
    <Paper className='col-xs-12 padding-0' sx={[{
      boxShadow: 'none',
      borderRadius: '10px'
    }, nested ? {
      border: 'none'
    } : {
      border: '1px solid',
      borderColor: borderColor
    }]}>
      {
      !nested &&
      <Typography component="span" sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <TagCountLabel label={t('concept.associations')} count={scope === 'all' ? count : (scope === 'namespace' ? countOwnerMappings : count - countOwnerMappings)}/>
        </span>
        <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        {
          onIncludeRetiredToggle && scope !== 'namespace' &&
            <Chip
              label={t('mapping.include_retired')}
              icon={includeRetired ? <SelectedIcon fontSize='small' /> : undefined}
              onClick={() => onIncludeRetiredToggle(!includeRetired)}
              sx={[{textTransform: 'none'}, includeRetired ? {backgroundColor: 'primary.90'} : {backgroundColor: null}]}
              variant={includeRetired ? 'filled' : 'outlined'}
            />
        }
        <ButtonGroup size='small' color='secondary'>
          <Button selected={scope === 'repo'} startIcon={scope === 'repo' ? <SelectedIcon /> : undefined } sx={[{
            textTransform: 'none',
            borderTopLeftRadius: '50px',
            borderBottomLeftRadius: '50px'
          }, scope === 'repo' ? {
            backgroundColor: 'primary.90'
          } : {
            backgroundColor: null
          }]} onClick={() => onScopeClick('repo')}>
            <b>{t('repo.repo')}</b>
          </Button>
          <Button selected={scope === 'namespace'} startIcon={scope === 'namespace' ? <SelectedIcon /> : undefined } sx={[{
            textTransform: 'none'
          }, scope === 'namespace' ? {
            backgroundColor: 'primary.90'
          } : {
            backgroundColor: null
          }]} onClick={() => onScopeClick('namespace')}>
            <b>{t('concept.namespace')}</b>
          </Button>
          <Button selected={scope === 'all'} startIcon={scope === 'all' ? <SelectedIcon /> : undefined } sx={[{
            textTransform: 'none',
            borderTopRightRadius: '50px',
            borderBottomRightRadius: '50px'
          }, scope==='all' ? {
            backgroundColor: 'primary.90'
          } : {
            backgroundColor: null
          }]} onClick={() => onScopeClick('all')}>
            <b>{t('common.all')}</b>
          </Button>
        </ButtonGroup>
        </span>
      </Typography>
      }
      <TableContainer sx={{ maxHeight: 400, borderRadius: '10px' }}>
        <Table stickyHeader size='small' sx={{tableLayout: 'fixed', minWidth: '480px'}}>
          <TableHead>
            <TableRow>
              <TableCell sx={{width: '22%', zIndex: 3}} className='sticky-col'><b>{t('mapping.relationship')}</b></TableCell>
              <TableCell sx={{width: '20%'}}><b>{t('mapping.code')}</b></TableCell>
              <TableCell sx={{width: '38%'}}><b>{t('common.name')}</b></TableCell>
              <TableCell sx={{width: '20%'}}><b>{t('repo.source')}</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              ['repo', 'all'].includes(scope) &&
                <React.Fragment>
                  {
                    map(orderedMappings, (oMappings, mapType) => isEmpty(oMappings.self) ? null : renderMappingGroup(oMappings.self, mapType, 'self'))
                  }
                  {
                    !isEmpty(orderedMappings?.children?.hierarchy) &&
                      <AssociationRow
                        mappings={orderedMappings?.children?.hierarchy}
                        id='has-child'
                        mapType={hierarchyMapType(true)}
                        isHierarchy
                        getTargetURL={getHierarchyURL}
                      />
                  }
                  {
                    !isEmpty(orderedMappings?.parent?.reverseHierarchy) &&
                      <AssociationRow
                        mappings={orderedMappings?.parent?.reverseHierarchy}
                        id='has-parent'
                        mapType={hierarchyMapType(false)}
                        isHierarchy
                        getTargetURL={getHierarchyURL}
                      />
                  }
                  {
                    map(orderedMappings, (oMappings, mapType) => isEmpty(oMappings.direct) ? null : renderMappingGroup(oMappings.direct, mapType, 'direct'))
                  }
                  {
                    map(orderedMappings, (oMappings, mapType) => isEmpty(oMappings.indirect) ? null : renderMappingGroup(oMappings.indirect, mapType, 'indirect'))
                  }
                  {
                    mappingForm && !mappingForm.mapType && renderInlineForm(undefined, true)
                  }
                </React.Fragment>
            }
            {
              ['namespace', 'all'].includes(scope) &&
                <React.Fragment>
                  {
                    loadingOwnerMappings === true ?
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Skeleton width='100%' />
                        </TableCell>
                      </TableRow> :
                    <React.Fragment>
                      {
                        map(orderedOwnerMappings, (gMappings, repoURI) => {
                          const repoMappings = ownerMappingsGroupedByRepo[repoURI]
                          const repo = repoMappings[0].parent
                          const isCollapsed = collapsedSections.includes(repoURI)
                          return (
                            <React.Fragment key={repoURI}>
                              <TableRow>
                                <TableCell align='left' colSpan={4} sx={{cursor: 'pointer', fontSize: '12px', padding: '6px 12px', backgroundColor: 'primary.95'}} onClick={() => toggleSection(repoURI)}>
                                <span style={{display: 'flex', alignItems: 'center'}}>
                                  {isCollapsed ? <DownIcon /> : <UpIcon />}
                                  <TagCountLabel
                                    label={
                                      <RepoChip
                                        filled
                                        color='primary'
                                        size='medium'
                                        sx={{
                                          marginLeft: '10px',
                                          padding: '0 0 0 3px !important',
                                          height: '28px !important',
                                          background: 'transparent',
                                          border: 'none',
                                          '.MuiAvatar-root .MuiSvgIcon-root': {
                                            color: 'primary.main'
                                          }
                                        }}
                                        repo={{...repo, url: repoURI, id: repo.repo, type: repo.repoType}}
                                      />
                                    }
                                    count={repoMappings?.length}
                                  />
                                  </span>
                                </TableCell>
                              </TableRow>
                              {
                                map(gMappings, (oMappings, mapType) => {
                                  const key = generateRandomString()
                                  const hasMappings = !isEmpty(oMappings.direct)
                                  return (
                                    <React.Fragment key={key}>
                                      {
                                        hasMappings &&
                                          <AssociationRow
                                            hide={isCollapsed}
                                            key={mapType}
                                            mapType={mapType}
                                            mappings={oMappings.direct}
                                          />
                                      }
                                    </React.Fragment>
                                  )
                                })
                              }
                              {
                                map(gMappings, (oMappings, mapType) => {
                                  const key = generateRandomString()
                                  const hasMappings = !isEmpty(oMappings.indirect)
                                  return (
                                    <React.Fragment key={key}>
                                      {
                                        hasMappings &&
                                          <AssociationRow
                                            hide={isCollapsed}
                                            key={mapType}
                                            mapType={mapType}
                                            mappings={oMappings.indirect}
                                            isIndirect
                                          />
                                      }
                                    </React.Fragment>
                                  )
                                })
                              }
                            </React.Fragment>
                          )
                        })
                      }
                    </React.Fragment>
                  }
                </React.Fragment>
            }
          </TableBody>
        </Table>
      </TableContainer>
      {
        canAct && scope !== 'namespace' && !mappingForm && isEmpty(updatedMappings) &&
          <div className='col-xs-12' style={{padding: '4px 8px'}}>
            <Button size='small' endIcon={<AddIcon fontSize='inherit' />} sx={{fontWeight: 600, textTransform: 'none'}} onClick={() => setMappingForm({mapType: null})}>
              {t('mapping.add_new_mapping')}
            </Button>
          </div>
      }
      {
        canSort && !isEmpty(updatedMappings) &&
          <div className='col-xs-12' style={{display: 'flex', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(51, 115, 170, 0.1)'}}>
            <WarnIcon fontSize='small' sx={{marginRight: '8px'}} />
            <Typography component='span' sx={{fontSize: '13px', flexGrow: 1}}>
              {t('mapping.sort_changes_warning', {total: updatedMappings.length})}
            </Typography>
            <Button size='small' sx={{textTransform: 'none'}} onClick={onSortCancel}>{t('common.undo')}</Button>
            <Button size='small' color='primary' sx={{textTransform: 'none'}} onClick={onSortSave}>{t('common.save')}</Button>
          </div>
      }
    </Paper>
  );
}

export default Associations;
