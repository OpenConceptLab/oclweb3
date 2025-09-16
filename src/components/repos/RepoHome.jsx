import React from 'react';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import Paper from '@mui/material/Paper'
import orderBy from 'lodash/orderBy'
import filter from 'lodash/filter'

import APIService from '../../services/APIService';
import { dropVersion, toParentURI, toOwnerURI } from '../../common/utils';
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

const RepoHome = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const history = useHistory()
  const params = useParams()
  const TABS = [
    {key: 'concepts', label: t('concept.concepts')},
    {key: 'mappings', label: t('mapping.mappings')},
  ]
  const TAB_KEYS = TABS.map(tab => tab.key)
  const findTab = () => TAB_KEYS.includes(params?.tab || params?.repoVersion) ? params.tab || params.repoVersion : 'concepts'
  const versionFromURL = (TAB_KEYS.includes(params?.repoVersion) ? '' : params.repoVersion) || ''
  const [tab, setTab] = React.useState(findTab)
  const [status, setStatus] = React.useState(false)
  const [repo, setRepo] = React.useState(false)
  const [owner, setOwner] = React.useState(false)
  const [repoSummary, setRepoSummary] = React.useState(false)
  const [versions, setVersions] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [showItem, setShowItem] = React.useState(false)
  const [conceptForm, setConceptForm] = React.useState(false)
  const [mappingForm, setMappingForm] = React.useState(false)
  const [versionForm, setVersionForm] = React.useState(false)
  const [deleteRepo, setDeleteRepo] = React.useState(false)
  const [releaseVersion, setReleaseVersion] = React.useState(false)

  const { setAlert } = React.useContext(OperationsContext);

  const getURL = () => ((toParentURI(location.pathname) + '/').replace('//', '/') + versionFromURL + '/').replace('//', '/')
  const fetchRepo = () => {
    setLoading(true)
    setStatus(false)
    APIService.new().overrideURL(getURL()).get(null, null, {includeSummary: true}, true).then(response => {
      const newStatus = response?.status || response?.response.status
      setStatus(newStatus)
      setLoading(false)
      const _repo = response?.data || response?.response?.data || {}
      setRepo(_repo)
      fetchOwner()
      fetchRepoSummary()
      if(isConceptURL || isMappingURL)
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

  const fetchVersions = () => {
    APIService.new().overrideURL(dropVersion(getURL())).appendToUrl('versions/').get(null, null, {verbose:true, includeSummary: true, limit: 100}).then(response => {
      const _versions = response?.data || []
      setVersions(_versions)
      if(!repo.version_url && params.repoVersion !== 'HEAD' && !showConceptURL && !showMappingURL) {
        const releasedVersions = filter(_versions, {released: true})
        let version = orderBy(releasedVersions, 'created_on', ['desc'])[0] || orderBy(_versions, 'created_on', ['desc'])[0]
        if((version?.version_url || version?.url) != (repo?.version_url || repo?.url))
          onVersionChange(version, false)
      }
    })
  }

  React.useEffect(() => {
      if(toParentURI(location.pathname) === (repo?.version_url || repo.url)) {
          if(location.pathname.includes('/concepts'))
              setTab('concepts')
          if(location.pathname.includes('/mappings'))
              setTab('mappings')
      }
    fetchRepo()
    fetchVersions()
  }, [location.pathname])

  const onVersionChange = (version, reload=true) => {
    let url = version.version_url
    if(reload && version?.version === 'HEAD')
      url += 'HEAD/'
    history.push(url + tab)
  }

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

  const onCreateVersionClick = () => {
    setShowItem(false)
    setConceptForm(false)
    setMappingForm(false)
    setVersionForm(true)
  }

  const onVersionFormClose = postUpsert => {
    if(postUpsert) {
      fetchVersions()
    }
    setVersionForm(false)
  }

  const isVersion = repo?.version && repo.version !== 'HEAD'

  const onDeleteRepo = () => {
    const url = isVersion ? repo.version_url : repo.url
    if(!url)
      return
    APIService.new().overrideURL(url).delete().then(response => {
      if(!response || response?.status === 204) {
        setDeleteRepo(false)
        setAlert({severity: 'success', message: isVersion ? t('repo.success_delete_version') : t('repo.success_delete')})
        history.push(isVersion ? repo.url : (owner?.url || repo.owner_url))
      }
      else if(response?.status === 202 || response?.detail === 'Already Queued') {
        setDeleteRepo(false)
        setAlert({severity: 'warning', message: isVersion ? t('repo.delete_accepted_version') : t('repo.delete_accepted')})
      }
      else
        setAlert({severity: 'error', message: response?.data?.detail || t('common.generic_error')})
    })
  }

  const onReleaseVersion = () => {
    APIService.new().overrideURL(repo.version_url).put({released: !repo.released}).then(response => {
      setReleaseVersion(false)
      if(response?.status === 200) {
        fetchVersions()
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
    let meta = {...repo?.meta, display: {...repo?.meta?.display, default_filter: appliedFilters}}
    APIService.new().overrideURL(repo.version_url || repo.url).patch({meta: meta}).then(() => {
      setRepo({...repo, meta: meta})
      setAlert({severity: 'success', message: t('common.success_update')})
    })
  }

  const isConceptURL = tab === 'concepts'
  const isMappingURL = tab === 'mappings'
  const getConceptURLFromMainURL = () => (isConceptURL && params.resource) ? getURL() + 'concepts/' + params.resource + '/' : false
  const getMappingURLFromMainURL = () => (isMappingURL && params.resource) ? getURL() + 'mappings/' + params.resource + '/' : false
  const showConceptURL = ((showItem?.concept_class || params.resource) && isConceptURL) ? showItem?.version_url || showItem?.url || getConceptURLFromMainURL() : false
  const showMappingURL = ((showItem?.map_type || params.resource) && isMappingURL) ? showItem?.version_url || showItem?.url || getMappingURLFromMainURL() : false
  const isSplitView = conceptForm || mappingForm || showConceptURL || showMappingURL || versionForm

  const onVersionEditClick = () => isVersion && setVersionForm(true)
  const onReleaseVersionClick = () => isVersion && setReleaseVersion(true)

  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '10px'}}>
      <Paper component="div" className={isSplitView ? 'col-xs-7 split padding-0' : 'col-xs-12 split padding-0'} sx={{backgroundColor: 'white', borderRadius: '10px', boxShadow: 'none', p: 0, border: 'solid 0.3px', borderColor: 'surface.nv80'}}>
        {
          (repo?.id || loading) &&
            <React.Fragment>
              <RepoHeader
                isVersion={isVersion}
                owner={owner}
                repo={repo}
                versions={versions}
                onVersionChange={onVersionChange}
                onCreateConceptClick={onCreateConceptClick}
                onCreateMappingClick={onCreateMappingClick}
                onCreateVersionClick={onCreateVersionClick}
                onDeleteRepoClick={() => setDeleteRepo(true)}
                onVersionEditClick={() => onVersionEditClick()}
                onReleaseVersionClick={() => onReleaseVersionClick()}
              />
              <div className='padding-0 col-xs-12' style={{width: isSplitView ? '100%' : 'calc(100% - 272px)'}}>
                <CommonTabs TABS={TABS} value={tab} onChange={onTabChange} />
                {
                  repo?.id && ['concepts', 'mappings'].includes(tab) &&
                    <Search
                      loading={loading}
                      summary={repoSummary || repo?.summary}
                      resource={tab}
                      url={getURL() + tab + '/'}
                      defaultFiltersOpen={false}
                      nested
                      noTabs
                      onSaveAsDefaultFilters={onSaveAsDefaultFilters}
                      repoDefaultFilters={(!tab || tab === 'concepts') ? repo?.meta?.display?.default_filter : {}}
                      onShowItem={onShowItem}
                      showItem={showItem}
                      filtersHeight='calc(100vh - 300px)'
                      resultContainerStyle={{height: 'calc(100vh - 400px)', overflow: 'auto', maxWidth: 'calc(100vw - 300px)'}}
                      containerStyle={{padding: 0}}
                      properties={(!tab || tab === 'concepts') ? repo?.meta?.display?.concept_summary_properties : []}
                      propertyFilters={(!tab || tab === 'concepts') ? repo?.filters : []}
                    />
                }
                {
                  tab === 'about' &&
                    <RepoOverview repo={repo} height='calc(100vh - 300px)' />
                }
              </div>
              {
                !isSplitView &&
                  <Paper component="div" className='col-xs-12' sx={{backgroundColor: 'surface.main', boxShadow: 'none', padding: '16px', borderLeft: 'solid 0.5px', borderTop: 'solid 0.5px', borderColor: 'surface.nv80', width: '272px !important', height: 'calc(100vh - 250px)', borderRadius: '0 0 10px 0'}}>
                    <RepoSummary repo={repo} summary={repoSummary} />
                  </Paper>
              }
            </React.Fragment>
        }
        {
          !loading && status && <Error40X status={status} />
        }
      </Paper>
      <div className={'col-xs-5 padding-0' + (isSplitView ? ' split-appear' : '')} style={{marginLeft: '16px', width: isSplitView ? 'calc(41.66666667% - 16px)' : 0, backgroundColor: WHITE, borderRadius: '10px', height: isSplitView ? 'calc(100vh - 95px)' : 0, opacity: isSplitView ? 1 : 0, overflow: 'auto'}}>
        {
          Boolean(showConceptURL && !conceptForm) &&
            <ConceptHome repoSummary={repoSummary} source={repo} repo={repo} url={showConceptURL} concept={showItem} onClose={() => setShowItem(false)} nested />
        }
        {
          showMappingURL &&
            <MappingHome repoSummary={repoSummary} source={repo} repo={repo} url={showMappingURL} mapping={showItem} onClose={() => setShowItem(false)} nested />
        }
        {
          conceptForm &&
            <ConceptForm t={t} repoSummary={repoSummary} source={repo} repo={repo} onClose={() => setConceptForm(false)} />
        }
        {
          mappingForm &&
            <MappingForm t={t} repoSummary={repoSummary} source={repo} repo={repo} onClose={() => setMappingForm(false)} />
        }
        {
          versionForm &&
            <VersionForm edit={isVersion && repo?.version} resourceType={repo?.type?.toLowerCase()} version={repo} onClose={(postUpsert) => onVersionFormClose(postUpsert)} />
        }
        {
        repo?.id &&
            <DeleteEntityDialog
              open={deleteRepo}
              onClose={() => setDeleteRepo(false)}
              onSubmit={onDeleteRepo}
              entityType={isVersion ? repo.type : repo.type.replace(' Version', '')}
              entityId={isVersion ? `${repo.short_code} [${repo.version}]` : (repo.short_code || repo.id)}
              relationship={isVersion ? '' :  'versions, '}
              associationsLabel='concepts and mappings'
              warning={!isVersion}
            />
        }
        {
          isVersion &&
            <ReleaseVersion open={releaseVersion} onClose={() => setReleaseVersion(false)} repo={repo} onSubmit={onReleaseVersion} />
        }
      </div>
    </div>
  )
}

export default RepoHome;
