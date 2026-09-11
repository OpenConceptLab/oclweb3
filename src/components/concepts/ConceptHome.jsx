import React from 'react';
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';

import APIService from '../../services/APIService';
import { toParentURI, dropVersion, getResourceIdFromUrl, currentUserHasAccess, latestResolvedRepoVersion } from '../../common/utils'

import { OperationsContext } from '../app/LayoutContext';
import RetireConfirmDialog from '../common/RetireConfirmDialog'
import RemoveFromCollectionDialog from '../collections/RemoveFromCollectionDialog'

import PanelError from '../errors/PanelError';
import ConceptHeader from './ConceptHeader';
import ConceptTabs from './ConceptTabs';
import ConceptForm from './ConceptForm'
import ConceptIcon from './ConceptIcon'
import ConceptDetails from './ConceptDetails'
import History from './History'

// Repo version segment of a resource URL, e.g. /orgs/CIEL/sources/CIEL/v2026/concepts/1/ -> 'v2026'
const repoVersionFromURL = url => {
  const parts = (url || '').split('/').filter(Boolean)
  const repoIndex = parts.findIndex(part => ['sources', 'collections'].includes(part))
  const version = repoIndex > -1 ? parts[repoIndex + 2] : undefined
  return (version && !['concepts', 'mappings', 'references'].includes(version)) ? version : 'HEAD'
}

const ConceptHome = props => {
  const { t } = useTranslation()
  const history = useHistory()

  const [concept, setConcept] = React.useState(props.concept || {})
  const [versions, setVersions] = React.useState([])

  const [repo, setRepo] = React.useState(props.repo || {})
  const [repoVersions, setRepoVersions] = React.useState(props.repoVersions || [])
  const [tab, setTab] = React.useState('metadata')
  const [edit, setEdit] = React.useState(false)
  const [createSimilar, setCreateSimilar] = React.useState(false)

  const [loading, setLoading] = React.useState(false)
  const [errorStatus, setErrorStatus] = React.useState(false)
  const [detailsLoaded, setDetailsLoaded] = React.useState(false)
  const [loadingOwnerMappings, setLoadingOwnerMappings] = React.useState(null)
  const [includeRetiredAssociations, setIncludeRetiredAssociations] = React.useState(false)
  const [mappings, setMappings] = React.useState([])
  const [reverseMappings, setReverseMappings] = React.useState([])
  const [ownerMappings, setOwnerMappings] = React.useState([])
  const [reverseOwnerMappings, setReverseOwnerMappings] = React.useState([])

  const [retireDialog, setRetireDialog] = React.useState(false)
  const [mappingRetireDialog, setMappingRetireDialog] = React.useState(null)
  const [removeFromCollectionDialog, setRemoveFromCollectionDialog] = React.useState(false)
  const [removingFromCollection, setRemovingFromCollection] = React.useState(false)
  const { setAlert } = React.useContext(OperationsContext);

  const isInCollection = Boolean(props.repo?.type?.includes('Collection') || props.url?.includes('/collections/'))

  const getActiveConceptId = () => getResourceIdFromUrl(props.url, 'concepts') || concept?.id

  React.useEffect(() => {
    setLoading(true)
    setDetailsLoaded(false)
    setErrorStatus(false)
    setConcept(props.concept || {})
    setVersions([])
    const queryParams = isInCollection ? { includeReferences: true, includeResolvedRepoVersions: true } : {}
    getService().get(null, null, queryParams, true).then(response => {
      const status = response?.status || response?.response?.status
      if(status && status !== 200) {
        setErrorStatus(status)
        setLoading(false)
        return
      }
      const resource = response?.data
      setConcept(resource)
      setDetailsLoaded(true)
      props.repo?.id ? setRepo(repo) : fetchRepo(resource)
      getMappings(resource)
      if(tab === 'history')
        fetchVersions(resource?.url)
    })
  }, [props.concept?.id, props.url])

  const fetchRepo = _concept => props?.repo?.id ? setRepo(props.repo) : APIService.new().overrideURL(getRepoURL(_concept)).get().then(response => setRepo(response.data))

  const getRepoURL = _concept => {
    if(isInCollection)
      return latestResolvedRepoVersion(concept)?.version_url ||
             toParentURI((props.concept?.id ? props.concept : concept)?.url || '')
    const parentURL = toParentURI(_concept?.version_url || _concept?.url || props?.url || '')
    const repoURL = props?.repo?.version_url || props?.repo?.url
    if(repoURL && (!parentURL || dropVersion(repoURL) === parentURL))
      return repoURL
    if(!parentURL)
      return ''
    const isStateConceptOfParent = toParentURI(concept?.url || '') === parentURL
    const repoVersion = _concept?.latest_source_version || (isStateConceptOfParent ? concept?.latest_source_version : undefined)
    return repoVersion ? parentURL + repoVersion + '/' : parentURL
  }

  const getFetchParentURL = () => isInCollection ?
                                (props.expansionURL || props.repo?.version_url || props.repo?.url || '') :
                                getRepoURL()

  const getService = () => {
    let _concept = props.concept?.id ? props.concept : concept
    let url = _concept?.version_url || _concept?.url || props.url
    const parentURL = getFetchParentURL()
    const conceptId = getActiveConceptId()
    if(parentURL && conceptId)
      url = `${parentURL}concepts/${encodeURIComponent(conceptId)}/`

    return APIService.new().overrideURL(encodeURI(url))
  }

  const withoutSelfEntry = (entries, _concept) => (entries || []).filter(
    entry => !(entry?.type === 'Concept' && dropVersion(entry?.url || '') === dropVersion(_concept?.url || ''))
  )

  const fetchVersions = conceptURL => {
    if(versions?.length === 0 || conceptURL) {
      let _conceptURL = conceptURL || (props.concept?.id ? props.concept : concept)?.url
      if(!_conceptURL)
        return
      setLoading(true)
      const service = APIService.new().overrideURL(_conceptURL)
      service.appendToUrl('versions/').get(null, null, {includeCollectionVersions: true, includeSourceVersions: true}).then(response => {
        setVersions(response.data || [])
        if(!repoVersions?.length)
          fetchRepoVersions(_conceptURL)
        else
          setLoading(false)
      })
    }
  }

  const fetchRepoVersions = conceptURL => {
    if(repoVersions.length === 0 && conceptURL) {
      let url = dropVersion(toParentURI(conceptURL))
      APIService.new().overrideURL(url).appendToUrl('versions/').get().then(response => {
        setRepoVersions(response.data || [])
        setLoading(false)
      })
    } else setLoading(false)
  }

  const onTabChange = newTab => {
    setTab(newTab)
    if(newTab === 'history')
      fetchVersions()
  }

  const getMappings = (concept, directOnly, includeRetired = includeRetiredAssociations) => {
    getService()
      .appendToUrl('$cascade/')
      .get(
        null,
        null,
        {
          uri: concept?.source_url,
          cascadeLevels: 1,
          method: 'sourceToConcepts',
          view: 'hierarchy',
          includeRetired: includeRetired,
        }
      )
      .then(response => {
        setMappings(withoutSelfEntry(response?.data?.entry?.entries, concept))
        if(directOnly)
          setTimeout(() => setLoading(false), 300)
        !directOnly && getInverseMappings(concept, includeRetired)
      })
  }

  const getInverseMappings = (concept, includeRetired = includeRetiredAssociations) => {
    getService()
      .appendToUrl('$cascade/')
      .get(
        null,
        null,
        {
          uri: concept?.source_url,
          cascadeLevels: 1,
          method: 'sourceToConcepts',
          view: 'hierarchy',
          reverse: true,
          includeRetired: includeRetired,
        })
      .then(response => {
        setReverseMappings(withoutSelfEntry(response?.data?.entry?.entries, concept))
        setTimeout(() => setLoading(false), 300)
      })
  }

  const getOwnerMappings = (concept, directOnly) => {
    setLoadingOwnerMappings(true)
    APIService
      .mappings()
      .get(null, null, {
        ownerType: concept.owner_type,
        owner: concept.owner,
        fromConcept: concept.id,
        fromConceptSource: concept.source,
        source: `!${concept.source}`,
        brief: true,
        pageSize: 1000
      })
      .then(response => {
        setOwnerMappings(response?.data || [])
        if(directOnly)
          setTimeout(() => setLoadingOwnerMappings(false), 300)
        !directOnly && getInverseOwnerMappings(concept)
      })
  }

  const getInverseOwnerMappings = concept => {
    APIService
      .mappings()
      .get(null, null, {
        ownerType: concept.owner_type,
        owner: concept.owner,
        toConcept: concept.id,
        toConceptSource: concept.source,
        source: `!${concept.source}`,
        brief: true,
        pageSize: 1000
      })
      .then(response => {
        setReverseOwnerMappings(response?.data || [])
        setTimeout(() => setLoadingOwnerMappings(false), 300)
      })
  }

  const canManageMappings = !isInCollection && concept?.id && currentUserHasAccess()
  // Mappings can only be added/sorted within the context of a HEAD source - never on a
  // repo version and never in global search, where there is no repo context at all.
  const repoVersion = props.repo?.version || repoVersionFromURL(props.url || props.concept?.version_url || props.concept?.url)
  const isRepoVersion = Boolean(repoVersion && repoVersion !== 'HEAD')
  const mappingsReadOnly = isRepoVersion || !props.repo?.id

  const onCreateNewMapping = (payload, targetConcept, isDirect, successCallback) => {
    APIService.new().overrideURL(`${concept.owner_url}sources/${concept.source}/mappings/`).post(payload).then(response => {
      if(response?.status === 201) {
        setAlert({severity: 'success', message: t('mapping.success_create')})
        successCallback && successCallback()
        isDirect ? getMappings(concept, true) : getInverseMappings(concept)
      } else {
        setAlert({severity: 'error', message: response?.data?.__all__?.[0] || response?.data?.detail || t('mapping.error_create')})
      }
    })
  }

  const updateSortWeight = (mapping, sortWeight, comment) => APIService
        .new()
        .overrideURL(mapping.url)
        .put({id: mapping.id, sort_weight: sortWeight, comment: comment})

  const onSortWeightUpdateSuccess = () => {
    setAlert({severity: 'success', message: t('mapping.sort_success')})
    getMappings(concept, true)
  }

  const onUpdateMappingsSorting = updatedMappings => Promise.all(
    updatedMappings.map(mapping => updateSortWeight(mapping, mapping._sort_weight, 'Updated Sort Weight'))
  ).then(onSortWeightUpdateSuccess)

  const onAssignSortWeight = (mapping, sortWeight) => updateSortWeight(mapping, sortWeight, 'Assigned Sort Weight').then(onSortWeightUpdateSuccess)

  const onClearSortWeight = mapping => updateSortWeight(mapping, null, 'Cleared Sort Weight').then(onSortWeightUpdateSuccess)

  const onIncludeRetiredToggle = value => {
    setIncludeRetiredAssociations(value)
    getMappings(concept, false, value)
  }

  const toggleMappingRetire = reason => {
    const { mapping, isDirect } = mappingRetireDialog
    const isRetired = Boolean(mapping.retired)
    setMappingRetireDialog(null)
    let service = APIService.new().overrideURL(mapping.url)
    service = isRetired ? service.appendToUrl('reactivate/').put({comment: reason}) : service.delete({comment: reason})
    service.then(response => {
      if(response?.status === 204) {
        setAlert({severity: 'success', message: isRetired ? t('mapping.success_unretired') : t('mapping.success_retired')})
        isDirect ? getMappings(concept, true) : getInverseMappings(concept)
      } else {
        setAlert({severity: 'error', message: response?.data?.detail || t('mapping.error_update')})
      }
    })
  }

  const toggleRetire = reason => {
    setRetireDialog(false)
    const isRetired = concept.retired
    let service = APIService.new().overrideURL(concept.url)
    service = concept.retired ? service.appendToUrl('reactivate/').put({comment: reason}) : service.delete({comment: reason})
    service.then(response => {
      if(response?.status === 204) {
        setAlert({severity: 'success', message: isRetired ? t('concept.success_unretired') : t('concept.success_retired')})
        history.push(concept.url)
        setTimeout(() => window.location.reload(), 1000)
      }
      else {
        let error = response?.data?.__all__ || t('concept.error_update')
        setAlert({severity: 'error', message: error})
      }
    })
  }

  const onRemoveFromCollection = deleteBody => {
    const collectionUrl = dropVersion(props.repo?.version_url || props.repo?.url)
    const body = deleteBody || { ids: (concept.references || []).map(r => r.id).filter(Boolean) }
    setRemovingFromCollection(true)
    APIService.new().overrideURL(collectionUrl).appendToUrl('references/').delete(body).then(response => {
      setRemovingFromCollection(false)
      if(response?.status === 204 || response?.status === 200) {
        setRemoveFromCollectionDialog(false)
        setAlert({ severity: 'success', message: t('reference.remove_success') })
        props.onClose && props.onClose()
      } else {
        setAlert({ severity: 'error', message: response?.data?.detail || t('common.generic_error') })
      }
    })
  }

  if(errorStatus)
    return <PanelError status={errorStatus} resourceType='concept' onClose={props.onClose} />

  return (concept?.id && repo?.id) ? (
    <>
      <Fade in={edit || createSimilar}>
        <div className='col-xs-12 padding-0'>
          {
            edit &&
              <ConceptForm
                t={t}
                edit
                repoSummary={props.repoSummary}
                concept={concept}
                source={repo}
                repo={repo}
                onClose={(updated) => {
                  if(updated?.id)
                    setConcept(updated)
                  setEdit(false)
                }}
              />
          }
          {
            createSimilar &&
              <ConceptForm
                t={t}
                repoSummary={props.repoSummary}
                copyFrom={concept}
                source={repo}
                repo={repo}
                onClose={() => setCreateSimilar(false)}
              />
          }
        </div>
      </Fade>
      <Fade in={!edit && !createSimilar}>
        <div className='col-xs-12' style={{padding: '8px 16px 12px 16px', ...props.style}}>
          {
            !edit && !createSimilar &&
              <>
                <div className='col-xs-12 padding-0'>
                  <ConceptHeader concept={concept} detailsLoaded={detailsLoaded} onClose={props.onClose} repoURL={getRepoURL()} onEdit={() => setEdit(true)} onCreateSimilar={() => setCreateSimilar(true)} repo={repo} nested={props.nested} loading={loading} onRetire={() => setRetireDialog(true)} isInCollection={isInCollection} onRemoveFromCollection={() => setRemoveFromCollectionDialog(true)} />
                </div>
                <ConceptTabs tab={tab} onTabChange={(event, newTab) => onTabChange(newTab)} loading={loading} />
                {
                  tab === 'metadata' &&
                    <ConceptDetails
                      style={props.detailsStyle}
                      concept={concept}
                      repo={repo}
                      mappings={mappings}
                      reverseMappings={reverseMappings}
                      loading={loading}
                      ownerMappings={ownerMappings}
                      reverseOwnerMappings={reverseOwnerMappings}
                      loadingOwnerMappings={loadingOwnerMappings}
                      onLoadOwnerMappings={() => getOwnerMappings(concept)}
                      repoSummary={props.repoSummary}
                      readOnlyMappings={mappingsReadOnly}
                      includeRetired={includeRetiredAssociations}
                      onIncludeRetiredToggle={onIncludeRetiredToggle}
                      onCreateNewMapping={canManageMappings ? onCreateNewMapping : false}
                      onRetireMapping={canManageMappings ? (mapping, isDirect) => setMappingRetireDialog({mapping: mapping, isDirect: isDirect}) : false}
                      onUpdateMappingsSorting={canManageMappings ? onUpdateMappingsSorting : false}
                      onAssignSortWeight={canManageMappings ? onAssignSortWeight : false}
                      onClearSortWeight={canManageMappings ? onClearSortWeight : false}
                    />
                }
                {
                  tab === 'history' &&
                    <History
                      repoVersions={repoVersions}
                      versions={versions}
                      loading={loading}
                      resource='concepts'
                      icon={<ConceptIcon selected fontSize='small' />}
                    />
                }
                <RetireConfirmDialog
                  open={retireDialog}
                  onClose={() => setRetireDialog(false)}
                  title={`${t('common.retire')} ${t('concept.concept')}`}
                  onSubmit={toggleRetire}
                />
                <RetireConfirmDialog
                  open={Boolean(mappingRetireDialog)}
                  onClose={() => setMappingRetireDialog(null)}
                  title={`${mappingRetireDialog?.mapping?.retired ? t('common.unretire') : t('common.retire')} ${t('mapping.mapping')}`}
                  onSubmit={toggleMappingRetire}
                />
                <RemoveFromCollectionDialog
                  open={removeFromCollectionDialog}
                  onClose={() => setRemoveFromCollectionDialog(false)}
                  onConfirm={onRemoveFromCollection}
                  resources={[concept]}
                  collectionUrl={dropVersion(props.repo?.version_url || props.repo?.url)}
                  lookupCollectionUrl={props.repo?.version_url || props.repo?.url}
                  loading={removingFromCollection}
                />
              </>
          }
        </div>
      </Fade>
    </>
  ) : <Skeleton variant="rounded" width='100%' height='100%' />
}


export default ConceptHome;
