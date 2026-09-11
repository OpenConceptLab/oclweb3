import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import Paper from '@mui/material/Paper'
import orderBy from 'lodash/orderBy'
import filter from 'lodash/filter'
import find from 'lodash/find'

import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import APIService from '../../services/APIService';
import ProcessingBanner from './ProcessingBanner';
import { useProcessingVersions } from '../../hooks/useProcessingState';
import { PROCESSING_QUERY_PARAMS, isVersionProcessing } from './processingStages';
import { dropVersion, toOwnerURI, currentUserHasAccess } from '../../common/utils';
import { parseRepoPath, buildRepoPath, buildRepoApiUrl, isSameRepoScope, hasResourcePanel, RESOURCE_TABS } from '../../common/repoRoute';
import { WHITE } from '../../common/colors';

import { OperationsContext } from '../app/LayoutContext';
import CommonTabs from '../common/CommonTabs';
import Search from '../search/Search';
import DeleteEntityDialog from '../common/DeleteEntityDialog'
import ConceptHome from '../concepts/ConceptHome';
import MappingHome from '../mappings/MappingHome';
import ConceptForm from '../concepts/ConceptForm';
import MappingForm from '../mappings/MappingForm';
import Error40X from '../errors/Error40X';
import RepoSummary from './RepoSummary'
import RepoOverview from './RepoOverview'
import VersionForm from './VersionForm'
import ReleaseVersion from './ReleaseVersion'
import RepoHeader from './RepoHeader';
import CollectionVersionsTab from './CollectionVersionsTab';
import SourceVersionsTab from './SourceVersionsTab';
import ReferenceHome from '../references/ReferenceHome'
import AddReferencesDialog from '../collections/AddReferencesDialog'
import ExpansionDropDown from './ExpansionDropDown';

const DEFAULT_VERSIONS_PAGE_SIZE = 100

const RepoHome = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const history = useHistory()
  const route = React.useMemo(() => parseRepoPath(location.pathname), [location.pathname])
  const TABS = [
    {key: 'concepts', label: t('concept.concepts')},
    {key: 'mappings', label: t('mapping.mappings')},
  ]
  const isCollection = route.repoType === 'collections'
  const getRepoTabs = React.useCallback(() => {
    if(isCollection)
      return [...TABS, {key: 'references', label: t('reference.references')}, {key: 'versions', label: t('repo.versions_expansions')}]

    return [...TABS, {key: 'versions', label: t('repo.versions')}]
  }, [isCollection, t])

  const [tabs, setTabs] = React.useState(getRepoTabs)

  const [status, setStatus] = React.useState(false)
  const [repo, setRepo] = React.useState(false)
  const [owner, setOwner] = React.useState(false)
  const [repoSummary, setRepoSummary] = React.useState(false)
  const [versions, setVersions] = React.useState(false)
  const versionsPage = 1
  const versionsPageSize = DEFAULT_VERSIONS_PAGE_SIZE
  const [versionsRefreshKey, setVersionsRefreshKey] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  const routeRepoURL = buildRepoApiUrl({...route, version: ''})
  const isRepoForRoute = Boolean(repo?.url) && repo.url.toLowerCase() === routeRepoURL.toLowerCase()
  const [seedItem, setSeedItem] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState([])
  const [conceptForm, setConceptForm] = React.useState(false)
  const [mappingForm, setMappingForm] = React.useState(false)
  const [versionForm, setVersionForm] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState(false)
  const [deletingRepo, setDeletingRepo] = React.useState(false)
  const [releaseTarget, setReleaseTarget] = React.useState(false)
  const [showSummary, setShowSummary] = React.useState(true)
  const [addReferencesOpen, setAddReferencesOpen] = React.useState(false)
  const [searchReloadKey, setSearchReloadKey] = React.useState(0)
  const [expansions, setExpansions] = React.useState([])
  const [expansionsLoading, setExpansionsLoading] = React.useState(false)
  const [selectedExpansion, setSelectedExpansion] = React.useState(false)
  const prevRouteRef = React.useRef(null)

  const [tab, setTab] = React.useState(route.tab || 'concepts')
  const { setAlert, setContextRepo } = React.useContext(OperationsContext);

  const getURL = () => buildRepoApiUrl(route)
  const getSearchURL = () => {
    if(isCollection && selectedExpansion?.url && ['concepts', 'mappings'].includes(tab))
      return `${selectedExpansion.url}${tab}/`
    return getURL() + tab + '/'
  }

  const replacePath = overrides => {
    const nextPath = buildRepoPath(route, overrides)
    if(nextPath !== location.pathname)
      history.replace(nextPath + (location.search || ''))
  }

  const pickExpansion = (list, version) =>
    (route.expansion && find(list, {mnemonic: route.expansion})) ||
    find(list, {url: version?.expansion_url}) ||
    false

  const fetchExpansions = React.useCallback((url, version = repo) => {
    setExpansions([])
    setSelectedExpansion(false)

    if (!isCollection || !url) {
      setExpansionsLoading(false)
      return Promise.resolve([])
    }

    setExpansionsLoading(true)
    return APIService.new().overrideURL(url).get(null, null, {includeSummary: true, verbose: true}, true).then(response => {
      let versionExpansions = Array.isArray(response?.data) ? response.data : []
      versionExpansions = orderBy(versionExpansions, ['created_on', 'id'], ['desc', 'desc']).map(expansion => ({...expansion, default: expansion.url === version?.expansion_url}))
      setExpansions(versionExpansions)
      setSelectedExpansion(pickExpansion(versionExpansions, version))
      setExpansionsLoading(false)
      return versionExpansions
    }).catch(() => {
      setExpansions([])
      setExpansionsLoading(false)
      setSelectedExpansion(false)
      return []
    })
  }, [getURL, isCollection, repo])

  const fetchRepo = () => {
    setLoading(true)
    setStatus(false)
    setExpansions([])
    setSelectedExpansion(false)
    APIService.new().overrideURL(getURL()).get(null, null, {includeSummary: true, ...PROCESSING_QUERY_PARAMS}, true).then(response => {
      const newStatus = response?.status || response?.response?.status
      const _repo = response?.data || response?.response?.data || {}

      if(route.version && (newStatus !== 200 || !_repo?.url)) {
        history.replace(buildRepoPath(route, {version: '', expansion: '', tab: '', resource: ''}))
        return
      }

      setStatus(newStatus)
      setLoading(false)
      setRepo(_repo)
      if(!isCollection)
        setContextRepo(_repo)
      fetchOwner()
      fetchRepoSummary()
      setTabs(getRepoTabs())
      if(isCollection) {
        let expansionURL = _repo?.expansions_url
        if(_repo?.version === 'HEAD') {
          expansionURL = _repo?.version_url || _repo.url
          if(!expansionURL.includes('/HEAD/'))
            expansionURL += 'HEAD/'
          expansionURL += 'expansions/'
        }
        fetchExpansions(expansionURL, _repo)
      }
    })
  }

  const fetchOwner = () => {
    APIService.new().overrideURL(toOwnerURI(getURL())).get().then(response => {
      setOwner(response?.data || {})
    })
  }

  const fetchRepoSummary = () => {
    APIService.new().overrideURL(getURL()).appendToUrl('summary/').get(null, null, {verbose: true}, true).then(response => {
      setRepoSummary(response?.data || response?.response?.data)
    })
  }

  const fetchVersions = (page=versionsPage, limit=versionsPageSize) => {
    APIService.new().overrideURL(dropVersion(getURL())).appendToUrl('versions/').get(null, null, {verbose:true, includeSummary: true, limit, page, ...PROCESSING_QUERY_PARAMS}).then(response => {
      const _versions = Array.isArray(response?.data) ? response.data : []
      setVersions(_versions)
      if(!repo.version_url && !route.version && !route.resource) {
        const releasedVersions = filter(_versions, {released: true})
        let version = orderBy(releasedVersions, 'created_on', ['desc'])[0] || orderBy(_versions, 'created_on', ['desc'])[0]
        if((version?.version_url || version?.url) != (repo?.version_url || repo?.url))
          onVersionChange(version, false)
      }
    })
  }

  React.useEffect(() => {
    const prevRoute = prevRouteRef.current
    prevRouteRef.current = route
    setTab(route.tab || 'concepts')
    if(prevRoute && isSameRepoScope(prevRoute, route))
      return
    fetchRepo()
    fetchVersions()
  }, [location.pathname])

  React.useEffect(() => {
    if(!isCollection || !expansions?.length)
      return
    const next = pickExpansion(expansions, repo)
    if((next?.url || '') !== (selectedExpansion?.url || ''))
      setSelectedExpansion(next)
  }, [expansions, route.expansion])

  React.useEffect(() => {
    return () => {
      // runs on unmount
      setContextRepo(false);
    };
  }, []);


  const onVersionChange = (version, reload=true, targetTab=null) => {
    const nextTab = targetTab || route.tab || 'concepts'
    const versionId = version?.version || version?.id || ''
    const isHead = versionId === 'HEAD'
    const nextVersion = isHead ? (reload ? 'HEAD' : '') : versionId
    const nextPath = buildRepoPath(route, {version: nextVersion, expansion: '', tab: nextTab, resource: ''})
    if(nextPath === location.pathname)
      return
    setExpansions([])
    setSelectedExpansion(false)
    if(reload)
      setLoading(true)
    if(nextTab !== tab)
      setTab(nextTab)
    history.push(nextPath + (location.search || ''))
  }

  const onExpansionChange = expansion => {
    setSelectedExpansion(expansion)
    if(!expansion?.mnemonic)
      return
    replacePath({expansion: (expansion.default && !route.expansion) ? '' : expansion.mnemonic, resource: ''})
  }

  // Opening a version from the versions tab means "go look at this version", so it
  // lands on its content rather than back on the list it was picked from.
  const onExploreVersion = version => onVersionChange(version, true, 'concepts')

  // A tab carried over from a collection (references) must not stay selected on a
  // source, or it queries an endpoint that cannot exist there.
  React.useEffect(() => {
    if(!tabs?.length || !tab || tabs.some(item => item.key === tab))
      return
    setTab(tabs[0].key)
    if(RESOURCE_TABS.includes(route.tab))
      replacePath({tab: tabs[0].key, expansion: '', resource: ''})
  }, [tabs, tab])

  const onTabChange = (event, newTab) => {
    if(newTab) {
      setTab(newTab)
      history.push(buildRepoPath(route, {
        tab: newTab,
        expansion: ['concepts', 'mappings'].includes(newTab) ? route.expansion : '',
        resource: ''
      }))
    }
  }

  const onShowItem = item => {
    setConceptForm(false)
    setMappingForm(false)
    setSeedItem(item || false)
    replacePath({tab, resource: item?.id || ''})
  }

  const closeItem = () => {
    setSeedItem(false)
    replacePath({tab, resource: ''})
  }

  const onCreateConceptClick = () => {
    setVersionForm(false)
    closeItem()
    setMappingForm(false)
    setConceptForm(true)
  }

  const onCreateMappingClick = () => {
    setVersionForm(false)
    closeItem()
    setConceptForm(false)
    setMappingForm(true)
  }

  const onCreateMappingFromConceptsClick = concepts => {
    setVersionForm(false)
    closeItem()
    setConceptForm(false)
    setMappingForm({selectedConcepts: concepts})
  }

  const onCreateSimilarClick = item => {
    setVersionForm(false)
    closeItem()
    if(tab === 'mappings') {
      setConceptForm(false)
      setMappingForm({copyFrom: item})
    } else {
      setMappingForm(false)
      setConceptForm({copyFrom: item})
    }
  }

  const onCreateVersionClick = () => {
    closeItem()
    setConceptForm(false)
    setMappingForm(false)
    setVersionForm({edit: false, version: repo, expansions: []})
  }

  const onVersionFormClose = postUpsert => {
    if(postUpsert) {
      fetchVersions()
      setVersionsRefreshKey(key => key + 1)
    }
    setVersionForm(false)
  }

  const getTargetVersion = target => target || repo
  const isVersionObject = target => target?.version && target.version !== 'HEAD'
  const isVersion = isVersionObject(repo)

  const onDeleteRepo = () => {
    const target = getTargetVersion(deleteTarget)
    const deletingVersion = isVersionObject(target)
    const url = deletingVersion ? target.version_url : target.url
    if(!url)
      return
    setDeletingRepo(true)
    APIService.new().overrideURL(url).delete().then(response => {
      setDeletingRepo(false)
      if(!response || response?.status === 204) {
        setDeleteTarget(false)
        setAlert({severity: 'success', message: deletingVersion ? t('repo.success_delete_version') : t('repo.success_delete')})
        if(deletingVersion)
          setVersionsRefreshKey(key => key + 1)
        history.push(deletingVersion ? target.url : (owner?.url || repo.owner_url))
      }
      else if(response?.status === 202 || response?.detail === 'Already Queued') {
        setDeleteTarget(false)
        setAlert({severity: 'warning', message: deletingVersion ? t('repo.delete_accepted_version') : t('repo.delete_accepted')})
      }
      else
        setAlert({severity: 'error', message: response?.data?.detail || t('common.generic_error')})
    })
  }

  const onReleaseVersion = () => {
    const target = getTargetVersion(releaseTarget)
    APIService.new().overrideURL(target.version_url).put({released: !target.released}).then(response => {
      setReleaseTarget(false)
      if(response?.status === 200) {
        fetchVersions()
        setVersionsRefreshKey(key => key + 1)
        fetchRepo()
        setAlert({severity: 'success', message: t('common.success_update')})
      }
      else if(response?.status === 202 || response?.detail === 'Already Queued' || response?.__all__ === 'Already Queued') {
        setAlert({severity: 'warning', message: t('errors.already_queued')})
      } else {
        setAlert({severity: 'error', message: response?.data?.detail || t('common.generic_error')})
      }
    })
  }

  const onSaveAsDefaultFilters = appliedFilters => {
    if(!currentUserHasAccess())
      return
    let meta = {...repo?.meta, display: {...repo?.meta?.display, default_filter: appliedFilters}}
    APIService.new().overrideURL(repo.version_url || repo.url).patch({meta: meta}).then(() => {
      setRepo({...repo, meta: meta})
      setAlert({severity: 'success', message: t('common.success_update')})
    })
  }

  const isConceptURL = tab === 'concepts'
  const isMappingURL = tab === 'mappings'
  const isReferenceURL = tab === 'references'
  const requiresExpansionSelection = isCollection && ['concepts', 'mappings'].includes(tab)
  const processingTargets = React.useMemo(() => (repo?.url || repo?.version_url) ? [repo] : [], [repo])
  const { versions: [liveRepo] = [] } = useProcessingVersions(processingTargets)
  const currentRepo = liveRepo || repo

  const canRenderSearch = !requiresExpansionSelection || (!expansionsLoading && Boolean(selectedExpansion))
  const expansionURL = (isCollection && selectedExpansion?.url) ? selectedExpansion.url : false
  const toExpansionURL = (resourceType, id) => (expansionURL && id) ? `${expansionURL}${resourceType}/${encodeURIComponent(id)}/` : false
  const isExpansionReady = !requiresExpansionSelection || Boolean(expansionURL)
  const panelOpen = hasResourcePanel(route)
  const resourceReadURL = resourceType => toExpansionURL(resourceType, route.resource) || (getURL() + resourceType + '/' + encodeURIComponent(route.resource) + '/')
  const showConceptURL = (panelOpen && isConceptURL && isExpansionReady) ? resourceReadURL('concepts') : false
  const showMappingURL = (panelOpen && isMappingURL && isExpansionReady) ? resourceReadURL('mappings') : false
  const showReferenceURL = (panelOpen && isReferenceURL) ? (getURL() + 'references/' + encodeURIComponent(route.resource) + '/') : false
  const seed = (seedItem && String(seedItem.id) === String(route.resource)) ? seedItem : undefined
  const isSplitView = conceptForm || mappingForm || showConceptURL || showMappingURL || showReferenceURL || versionForm

  const onVersionEditClick = () => isVersion && setVersionForm({edit: true, version: repo, expansions: []})
  const onReleaseVersionClick = () => isVersion && setReleaseTarget(repo)
  // References are collection-only, so never query them on a source.
  const _canRenderSearch = repo?.id && ['concepts', 'mappings', 'references'].includes(tab) && (tab !== 'references' || isCollection) && canRenderSearch
  const showProcessingBanner = _canRenderSearch && isVersionProcessing(currentRepo)
  const heightTakenInProcessingBanner = showProcessingBanner ? 43 : 0
  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '10px'}}>
      <Paper component="div" className={isSplitView ? 'col-xs-7 split padding-0' : 'col-xs-12 split padding-0'} sx={{backgroundColor: 'white', borderRadius: '10px', boxShadow: 'none', p: 0, border: 'solid 0.3px', borderColor: 'surface.nv80'}}>
        {
          (repo?.id || loading) &&
            <React.Fragment>
              <RepoHeader
                isVersion={isVersion}
                owner={owner}
                repo={currentRepo}
                repoHref={'#' + dropVersion(currentRepo?.version_url || currentRepo?.url || '')}
                versions={versions}
                onVersionChange={onVersionChange}
                onCreateConceptClick={onCreateConceptClick}
                onCreateMappingClick={onCreateMappingClick}
                onCreateVersionClick={onCreateVersionClick}
                onDeleteRepoClick={() => setDeleteTarget(repo)}
                onVersionEditClick={() => onVersionEditClick()}
                onReleaseVersionClick={() => onReleaseVersionClick()}
              />
              <div className='padding-0 col-xs-12' style={{width: isSplitView ? '100%' : (showSummary ? 'calc(100% - 272px)' : 'calc(100% - 12px)')}}>
                <CommonTabs TABS={tabs} value={tab} onChange={onTabChange} />
                {
                  repo?.id && requiresExpansionSelection && !canRenderSearch &&
                    <div style={{padding: '12px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)', minHeight: '56px', display: 'flex', alignItems: 'center'}}>
                      <ExpansionDropDown
                        expansions={expansions}
                        loading={expansionsLoading}
                        selectedExpansion={selectedExpansion}
                        onChange={onExpansionChange}
                      />
                    </div>
                }
                {
                  showProcessingBanner &&
                    <ProcessingBanner version={currentRepo} resource={t(`search.${tab}`)} />
                }
                {
                  _canRenderSearch &&
                    <Search
                      key={`${tab}-${selectedExpansion?.mnemonic || ''}-${searchReloadKey}`}
                      loading={loading}
                      summary={repoSummary || repo?.summary}
                      resource={tab}
                      url={getSearchURL()}
                      defaultFiltersOpen={false}
                      nested
                      repo={repo}
                      noTabs
                      onSaveAsDefaultFilters={onSaveAsDefaultFilters}
                      repoDefaultFilters={(!tab || tab === 'concepts') ? repo?.meta?.display?.default_filter : {}}
                      onShowItem={onShowItem}
                      showItem={seed || false}
                      onSelectItem={setSelectedItem}
                      onCreateSimilarClick={!isCollection ? onCreateSimilarClick : undefined}
                      onCreateMappingClick={(!isCollection && !isVersion && tab === 'concepts') ? onCreateMappingFromConceptsClick : undefined}
                      filtersHeightToSubtract={268 + heightTakenInProcessingBanner}
                      resultContainerStyle={{height: `calc(100vh - 356px - ${heightTakenInProcessingBanner}px)`, overflow: 'auto', maxWidth: showSummary ? 'calc(100vw - 300px)' : 'calc(100vw - 40px)'}}
                      containerStyle={{padding: 0}}
                      properties={(!tab || tab === 'concepts') ? repo?.meta?.display?.concept_summary_properties : []}
                      propertyDefinition={(!tab || tab === 'concepts') ? repo?.properties : []}
                      propertyFilters={(!tab || tab === 'concepts') ? repo?.filters : []}
                      fixedLeftControls={
                        Boolean(isCollection && !selectedItem?.length && ['concepts', 'mappings'].includes(tab)) &&
                          <ExpansionDropDown
                            expansions={expansions}
                            loading={expansionsLoading}
                            selectedExpansion={selectedExpansion}
                            onChange={onExpansionChange}
                          />
                      }
                      extraBulkActions={
                        isCollection ?
                          <>
                            {
                              Boolean(!isVersion && tab === 'references') &&
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={() => setAddReferencesOpen(true)}
                                  sx={{textTransform: 'none', whiteSpace: 'nowrap', bgcolor: 'primary.60', color: '#fff', '&:hover': {bgcolor: 'primary.50'}}}
                                >
                                  {t('reference.add_references')}
                                </Button>
                            }
                          </> :
                        undefined
                      }
                    />
                }
                {
                  tab === 'versions' && isCollection && isRepoForRoute &&
                    <CollectionVersionsTab
                      repo={repo}
                      loading={loading}
                      refreshKey={versionsRefreshKey}
                      onVersionChange={onExploreVersion}
                      onEditVersion={version => setVersionForm({edit: true, version, expansions: []})}
                      onReleaseVersion={version => setReleaseTarget(version)}
                      onDeleteVersion={version => setDeleteTarget(version)}
                      onDataChange={() => {
                        fetchRepo()
                        fetchVersions()
                        setVersionsRefreshKey(key => key + 1)
                      }}
                    />
                }
                {
                  tab === 'versions' && !isCollection && isRepoForRoute &&
                    <SourceVersionsTab
                      repo={repo}
                      loading={loading}
                      refreshKey={versionsRefreshKey}
                      onVersionChange={onExploreVersion}
                      onEditVersion={version => setVersionForm({edit: true, version, expansions: []})}
                      onReleaseVersion={version => setReleaseTarget(version)}
                      onDeleteVersion={version => setDeleteTarget(version)}
                      onDataChange={() => {
                        fetchRepo()
                        fetchVersions()
                        setVersionsRefreshKey(key => key + 1)
                      }}
                    />
                }
                {
                  tab === 'about' &&
                    <RepoOverview repo={repo} height='calc(100vh - 300px)' />
                }
              </div>
              {
                !isSplitView &&
                  <Paper component="div" className='col-xs-12' sx={[{
                    backgroundColor: 'surface.main',
                    boxShadow: 'none',
                    borderLeft: 'solid 0.5px',
                    borderTop: 'solid 0.5px',
                    borderColor: 'surface.nv80',
                    height: 'calc(100vh - 218px)',
                    borderRadius: '0 0 10px 0'
                  }, showSummary ? {
                    padding: '16px !important'
                  } : {
                    padding: '0px !important'
                  }, showSummary ? {
                    width: '272px !important'
                  } : {
                    width: '12px !important'
                  }]}>
                    <RepoSummary repo={repo} summary={repoSummary} show={showSummary} onShow={() => setShowSummary(!showSummary)} />
                  </Paper>
              }
            </React.Fragment>
        }
        {
          !loading && status && <Error40X status={status} />
        }
      </Paper>
      <div className={'col-xs-5 padding-0' + (isSplitView ? ' split-appear' : '')} style={{marginLeft: '16px', width: isSplitView ? 'calc(41.66666667% - 16px)' : 0, backgroundColor: WHITE, borderRadius: '10px', height: isSplitView ? 'calc(100vh - 102px)' : 0, opacity: isSplitView ? 1 : 0, overflow: 'auto'}}>
        {
          Boolean(showConceptURL && !conceptForm) &&
            <ConceptHome repoSummary={repoSummary} repo={repo} url={showConceptURL} expansionURL={expansionURL} concept={seed} onClose={closeItem} repoVersions={versions} nested />
        }
        {
          Boolean(showMappingURL && !mappingForm) &&
            <MappingHome repoSummary={repoSummary} repo={repo} url={showMappingURL} expansionURL={expansionURL} mapping={seed} onClose={closeItem} repoVersions={versions} nested />
        }
        {
          showReferenceURL &&
            <ReferenceHome repoSummary={repoSummary} repo={repo} url={showReferenceURL} reference={seed} onClose={closeItem} onDelete={() => setSearchReloadKey(key => key + 1)} repoVersions={versions} nested />
        }
        {
          conceptForm &&
            <ConceptForm t={t} repoSummary={repoSummary} copyFrom={conceptForm?.copyFrom} source={repo} repo={repo} onClose={() => setConceptForm(false)} />
        }
        {
          mappingForm &&
            <MappingForm t={t} repoSummary={repoSummary} copyFrom={mappingForm?.copyFrom} selectedConcepts={mappingForm?.selectedConcepts} source={repo} repo={repo} onClose={() => setMappingForm(false)} />
        }
        {
          versionForm &&
            <VersionForm
              edit={Boolean(versionForm?.edit)}
              resource={isCollection ? 'collection' : 'source'}
              resourceType={isCollection ? 'collection' : 'source'}
              version={versionForm?.version || repo}
              expansions={versionForm?.expansions || []}
              onClose={(postUpsert) => onVersionFormClose(postUpsert)}
            />
        }
        {
          isCollection &&
            <AddReferencesDialog
              open={addReferencesOpen}
              onClose={() => setAddReferencesOpen(false)}
              collectionUrl={getURL()}
              onSuccess={() => setSearchReloadKey(k => k + 1)}
            />
        }
        {
        repo?.id &&
            <DeleteEntityDialog
              open={deleteTarget}
              onClose={() => setDeleteTarget(false)}
              onSubmit={onDeleteRepo}
              loading={deletingRepo}
              entityType={isVersionObject(getTargetVersion(deleteTarget)) ? getTargetVersion(deleteTarget).type : repo.type.replace(' Version', '')}
              entityId={isVersionObject(getTargetVersion(deleteTarget)) ? `${getTargetVersion(deleteTarget).short_code} [${getTargetVersion(deleteTarget).version}]` : (repo.short_code || repo.id)}
              relationship={isVersionObject(getTargetVersion(deleteTarget)) ? '' :  'versions, '}
              associationsLabel='concepts and mappings'
              warning={!isVersionObject(getTargetVersion(deleteTarget))}
            />
        }
        {
          Boolean(releaseTarget) &&
            <ReleaseVersion open={releaseTarget} onClose={() => setReleaseTarget(false)} repo={getTargetVersion(releaseTarget)} onSubmit={onReleaseVersion} />
        }
      </div>
    </div>
  );
}
export default RepoHome;
