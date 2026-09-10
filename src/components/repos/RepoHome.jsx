import React from 'react';
import { useLocation, useHistory, useParams } from 'react-router-dom';
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
import { dropVersion, toParentURI, toOwnerURI, currentUserHasAccess, isSameResourceNavigation } from '../../common/utils';
import { WHITE } from '../../common/colors';
import { RESERVED_ROUTE_KEYWORDS } from '../../common/constants';

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
  const params = useParams()
  const TABS = [
    {key: 'concepts', label: t('concept.concepts')},
    {key: 'mappings', label: t('mapping.mappings')},
  ]
  const isCollection = params.repoType === 'collections'
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

  const routeRepoURL = `/${params.ownerType}/${params.owner}/${params.repoType}/${params.repo}/`
  const isRepoForRoute = Boolean(repo?.url) && repo.url.toLowerCase() === routeRepoURL.toLowerCase()
  const [showItem, setShowItem] = React.useState(false)
  const [dismissedResource, setDismissedResource] = React.useState(null)
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
  const isInitialMount = React.useRef(true)
  const prevLocationRef = React.useRef(location)

  const TAB_KEYS = tabs.map(tab => tab.key)
  const isVersionSegment = segment => Boolean(segment) && !TAB_KEYS.includes(segment) && !RESERVED_ROUTE_KEYWORDS.includes(segment)
  const findTab = () => TAB_KEYS.includes(params?.tab || params?.repoVersion) ? params.tab || params.repoVersion : 'concepts'
  const versionFromURL = (isVersionSegment(params?.repoVersion) ? params.repoVersion : '') || ''

  const [tab, setTab] = React.useState(findTab)
  const { setAlert, setContextRepo } = React.useContext(OperationsContext);

  const getURL = () => ((toParentURI(location.pathname) + '/').replace('//', '/') + versionFromURL + '/').replace('//', '/')
  const getSearchURL = () => {
    let url = getURL()
    if(isCollection && selectedExpansion?.mnemonic && ['concepts', 'mappings'].includes(tab)) {
      if(repo.version === 'HEAD' && !url.includes('/HEAD/')) {
        url += 'HEAD/'
      }
      return `${url}expansions/${selectedExpansion.mnemonic}/${tab}/`
    }
    return getURL() + tab + '/'
  }

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
      setSelectedExpansion(() =>
        find(versionExpansions, {url: version?.expansion_url}) ||
        false
      )
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

      if(versionFromURL && (newStatus !== 200 || !_repo?.url)) {
        isInitialMount.current = true
        history.replace(`/${params.ownerType}/${params.owner}/${params.repoType}/${params.repo}`)
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

      if(isConceptURL || isMappingURL || isReferenceURL)
        setShowItem(true)
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
      if(!repo.version_url && !versionFromURL && !showConceptURL && !showMappingURL) {
        const releasedVersions = filter(_versions, {released: true})
        let version = orderBy(releasedVersions, 'created_on', ['desc'])[0] || orderBy(_versions, 'created_on', ['desc'])[0]
        if((version?.version_url || version?.url) != (repo?.version_url || repo?.url))
          onVersionChange(version, false)
      }
    })
  }

  React.useEffect(() => {
    const skipRefetch = !isInitialMount.current && isSameResourceNavigation(prevLocationRef.current, location)
    isInitialMount.current = false
    prevLocationRef.current = location
    if(skipRefetch)
      return
    if(location.pathname.includes('/concepts'))
      setTab('concepts')
    if(location.pathname.includes('/mappings'))
      setTab('mappings')
    if(location.pathname.includes('/versions'))
      setTab('versions')
    if(location.pathname.includes('/references'))
      setTab('references')
    fetchRepo()
    fetchVersions()
  }, [location.pathname])

  React.useEffect(() => {
    return () => {
      // runs on unmount
      setContextRepo(false);
    };
  }, []);


  const onVersionChange = (version, reload=true, targetTab=null) => {
    let url = version.version_url
    if(reload && version?.version === 'HEAD')
      url += 'HEAD/'
    const nextTab = targetTab || findTab()
    const nextPath = url + nextTab + '/'
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

  // Opening a version from the versions tab means "go look at this version", so it
  // lands on its content rather than back on the list it was picked from.
  const onExploreVersion = version => onVersionChange(version, true, 'concepts')

  // A tab carried over from a collection (references) must not stay selected on a
  // source, or it queries an endpoint that cannot exist there.
  React.useEffect(() => {
    if(tabs?.length && tab && !tabs.some(item => item.key === tab))
      setTab(tabs[0].key)
  }, [tabs, tab])

  const onTabChange = (event, newTab) => {
    if(newTab) {
      setTab(newTab)
      history.push((getURL() + '/' + newTab).replace('//', '/'))
    }
  }

  const onShowItem = item => {
    setShowItem(item)
    setConceptForm(false)
    setMappingForm(false)
  }

  const closeItem = options => {
    setShowItem(false)
    if(!options?.navigated)
      setDismissedResource(params.resource || null)
  }

  const onCreateConceptClick = () => {
    setVersionForm(false)
    setShowItem(false)
    setMappingForm(false)
    setConceptForm(true)
  }

  const onCreateMappingClick = () => {
    setVersionForm(false)
    setShowItem(false)
    setConceptForm(false)
    setMappingForm(true)
  }

  const onCreateMappingFromConceptsClick = concepts => {
    setVersionForm(false)
    setShowItem(false)
    setConceptForm(false)
    setMappingForm({selectedConcepts: concepts})
  }

  const onCreateSimilarClick = item => {
    setVersionForm(false)
    setShowItem(false)
    if(tab === 'mappings') {
      setConceptForm(false)
      setMappingForm({copyFrom: item})
    } else {
      setMappingForm(false)
      setConceptForm({copyFrom: item})
    }
  }

  const onCreateVersionClick = () => {
    setShowItem(false)
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
  const getConceptURLFromMainURL = () => (isConceptURL && params.resource) ? (toExpansionURL('concepts', params.resource) || getURL() + 'concepts/' + params.resource + '/') : false
  const getMappingURLFromMainURL = () => (isMappingURL && params.resource) ? (toExpansionURL('mappings', params.resource) || getURL() + 'mappings/' + params.resource + '/') : false
  const getReferenceURLFromMainURL = () => (isReferenceURL && params.resource) ? getURL() + 'references/' + params.resource + '/' : false
  const resourceFallbackActive = Boolean(params.resource) && params.resource !== dismissedResource
  // URL-named resource id wins over a stale showItem selected via list click
  const showItemMatchesURLResource = !params.resource || String(showItem?.id) === String(params.resource)
  const showConceptURL = (isExpansionReady && (showItem?.concept_class || resourceFallbackActive) && isConceptURL) ? (showItemMatchesURLResource && (toExpansionURL('concepts', showItem?.id) || showItem?.version_url || showItem?.url)) || getConceptURLFromMainURL() : false
  const showMappingURL = (isExpansionReady && (showItem?.map_type || resourceFallbackActive) && isMappingURL) ? (showItemMatchesURLResource && (toExpansionURL('mappings', showItem?.id) || showItem?.version_url || showItem?.url)) || getMappingURLFromMainURL() : false
  const showReferenceURL = ((showItem?.expression || resourceFallbackActive) && isReferenceURL) ? (showItemMatchesURLResource && showItem?.uri) || getReferenceURLFromMainURL() : false
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
                        onChange={setSelectedExpansion}
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
                      key={`${tab}-${searchReloadKey}`}
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
                      showItem={showItem}
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
                            onChange={setSelectedExpansion}
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
            <ConceptHome repoSummary={repoSummary} repo={repo} url={showConceptURL} expansionURL={expansionURL} concept={showItem} onClose={closeItem} repoVersions={versions} nested />
        }
        {
          Boolean(showMappingURL && !mappingForm) &&
            <MappingHome repoSummary={repoSummary} repo={repo} url={showMappingURL} expansionURL={expansionURL} mapping={showItem} onClose={closeItem} repoVersions={versions} nested />
        }
        {
          showReferenceURL &&
            <ReferenceHome repoSummary={repoSummary} repo={repo} url={showReferenceURL} reference={showItem} onClose={closeItem} onDelete={() => setSearchReloadKey(key => key + 1)} repoVersions={versions} nested />
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
