import React from 'react';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import Paper from '@mui/material/Paper'
import APIService from '../../services/APIService';
import LoaderDialog from '../common/LoaderDialog';
import RepoHeader from './RepoHeader';
import RepoTabs from './RepoTabs';
import Search from '../search/Search';
import { dropVersion, toParentURI } from '../../common/utils';
import { WHITE } from '../../common/constants';
import ConceptHome from '../concepts/ConceptHome';
import Error404 from '../errors/Error404';

const RepoHome = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const history = useHistory()
  const params = useParams()

  const TABS = [
    {key: 'concepts', label: t('concept.concepts')},
    {key: 'mappings', label: t('mapping.mappings')},
    {key: 'versions', label: t('common.versions')},
    {key: 'summary', label: t('common.summary')},
    {key: 'about', label: t('common.about')}
  ]
  const TAB_KEYS = TABS.map(tab => tab.key)
  const findTab = () => TAB_KEYS.includes(params?.tab) ? params.tab : 'concepts'
  const versionFromURL = TAB_KEYS.includes(params?.repoVersion) ? '' : params.repoVersion

  const [tab, setTab] = React.useState(findTab)
  const [status, setStatus] = React.useState(false)
  const [repo, setRepo] = React.useState(false)
  const [versions, setVersions] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [showItem, setShowItem] = React.useState(false)

  const bgColor = showItem ? 'surface.light' : 'info.contrastText'
  const getURL = () => ((toParentURI(location.pathname) + '/').replace('//', '/') + versionFromURL + '/').replace('//', '/')
  const fetchRepo = () => {
    setLoading(true)
    APIService.new().overrideURL(getURL()).get(null, null, {includeSummary: true}, true).then(response => {
      setStatus(response?.status || response?.response.status)
      setLoading(false)
      const _repo = response?.data || response?.response?.data || {}
      setRepo(_repo)
    })
  }

  const fetchVersions = () => {
    APIService.new().overrideURL(dropVersion(getURL())).appendToUrl('versions/').get().then(response => {
      setVersions(response?.data || [])
    })
  }

  React.useEffect(() => {
    fetchRepo()
    if(versions === false)
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

  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '8px'}}>
      <LoaderDialog open={loading} />
      <Paper component="div" className={showItem?.id ? 'col-xs-7 split padding-0' : 'col-xs-12 split padding-0'} sx={{backgroundColor: bgColor, borderRadius: '10px', boxShadow: 'none', p: 0, border: 'solid 0.3px', borderColor: 'surface.n90'}}>
        {
          (repo?.id || loading) &&
            <React.Fragment>
              <RepoHeader repo={repo} versions={versions} onVersionChange={onVersionChange} />
              <RepoTabs TABS={TABS} value={tab} onChange={onTabChange} />
              {
                repo?.id && ['concepts', 'mappings'].includes(tab) &&
                  <Search
                    resource={tab}
                    url={getURL() + tab + '/'}
                    defaultFiltersOpen={false}
                    nested
                    noTabs
                    onShowItem={setShowItem}
                    showItem={showItem}
                    filtersHeight='calc(100vh - 300px)'
                    resultContainerStyle={{height: 'calc(100vh - 400px)', overflow: 'auto'}}
                  />
              }
            </React.Fragment>
        }
        {
          !loading && status === 404 &&
            <Error404 />
        }
      </Paper>
      <div className={'col-xs-5 padding-0' + (showItem ? ' split-appear' : '')} style={{marginLeft: '16px', width: showItem ? 'calc(41.66666667% - 16px)' : 0, backgroundColor: WHITE, borderRadius: '10px', height: showItem ? 'calc(100vh - 100px)' : 0, opacity: showItem ? 1 : 0}}>
        {
          showItem &&
            <ConceptHome url={showItem?.version_url || showItem?.url} onClose={() => setShowItem(false)} />
        }
      </div>
    </div>
  )
}

export default RepoHome;
