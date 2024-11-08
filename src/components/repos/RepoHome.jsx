import React from 'react';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import Paper from '@mui/material/Paper'
import APIService from '../../services/APIService';
import LoaderDialog from '../common/LoaderDialog';
import RepoHeader from './RepoHeader';
import CommonTabs from '../common/CommonTabs';
import Search from '../search/Search';
import { dropVersion, toParentURI, toOwnerURI } from '../../common/utils';
import { WHITE } from '../../common/colors';
import ConceptHome from '../concepts/ConceptHome';
import MappingHome from '../mappings/MappingHome';
import ConceptForm from '../concepts/ConceptForm';
import Error40X from '../errors/Error40X';
import RepoSummary from './RepoSummary'
import RepoOverview from './RepoOverview'

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
      if(isConceptURL)
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
      setVersions(response?.data || [])
    })
  }

  React.useEffect(() => {
    fetchRepo()
    fetchVersions()
  }, [location.pathname])

  const onVersionChange = version => {
    history.push(version.version_url)
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
  }

  const onCreateConceptClick = () => {
    setShowItem(false)
    setConceptForm(true)
  }

  const isConceptURL = tab === 'concepts'
  const isMappingURL = tab === 'mappings'
  const getConceptURLFromMainURL = () => (isConceptURL && params.resource) ? getURL() + 'concepts/' + params.resource + '/' : false
  const getMappingURLFromMainURL = () => (isMappingURL && params.resource) ? getURL() + 'mappings/' + params.resource + '/' : false
  const showConceptURL = ((showItem?.concept_class || params.resource) && isConceptURL) ? showItem?.version_url || showItem?.url || getConceptURLFromMainURL() : false
  const showMappingURL = ((showItem?.map_type || params.resource) && isMappingURL) ? showItem?.version_url || showItem?.url || getMappingURLFromMainURL() : false
  const isSplitView = conceptForm || showConceptURL || showMappingURL

  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '10px'}}>
      <LoaderDialog open={loading} />
      <Paper component="div" className={isSplitView ? 'col-xs-7 split padding-0' : 'col-xs-12 split padding-0'} sx={{backgroundColor: 'white', borderRadius: '10px', boxShadow: 'none', p: 0, border: 'solid 0.3px', borderColor: 'surface.nv80'}}>
        {
          (repo?.id || loading) &&
            <React.Fragment>
              <RepoHeader owner={owner} repo={repo} versions={versions} onVersionChange={onVersionChange} onCreateConceptClick={onCreateConceptClick} onCloseConceptForm={() => setConceptForm(false)} />
              <div className='padding-0 col-xs-12' style={{width: 'calc(100% - 272px)'}}>
                <CommonTabs TABS={TABS} value={tab} onChange={onTabChange} />
                {
                  repo?.id && ['concepts', 'mappings'].includes(tab) &&
                    <Search
                      summary={repoSummary || repo?.summary}
                      resource={tab}
                      url={getURL() + tab + '/'}
                      defaultFiltersOpen={false}
                      nested
                      noTabs
                      onShowItem={onShowItem}
                      showItem={showItem}
                      filtersHeight='calc(100vh - 300px)'
                      resultContainerStyle={{height: isSplitView ? 'calc(100vh - 440px)' : 'calc(100vh - 400px)', overflow: 'auto'}}
                      containerStyle={{padding: 0}}
                    />
                }
                {
                  tab === 'about' &&
                    <RepoOverview repo={repo} height='calc(100vh - 300px)' />
                }
              </div>
              <Paper component="div" className='col-xs-12' sx={{backgroundColor: 'surface.main', boxShadow: 'none', padding: '16px', borderLeft: 'solid 0.5px', borderTop: 'solid 0.5px', borderColor: 'surface.nv80', width: '272px !important', height: 'calc(100vh - 250px)', borderRadius: '0 0 10px 0'}}>
                <RepoSummary repo={repo} summary={repoSummary} />
              </Paper>
            </React.Fragment>
        }
        {
          !loading && status && <Error40X status={status} />
        }
      </Paper>
      <div className={'col-xs-5 padding-0' + (isSplitView ? ' split-appear' : '')} style={{marginLeft: '16px', width: isSplitView ? 'calc(41.66666667% - 16px)' : 0, backgroundColor: WHITE, borderRadius: '10px', height: isSplitView ? 'calc(100vh - 100px)' : 0, opacity: isSplitView ? 1 : 0}}>
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
            <ConceptForm repoSummary={repoSummary} source={repo} repo={repo} onClose={() => setConceptForm(false)} />
        }
      </div>
    </div>
  )
}

export default RepoHome;
