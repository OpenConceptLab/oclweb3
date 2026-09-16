import React from 'react'
import moment from 'moment'
import { useLocation, useHistory } from 'react-router-dom';
import ReactDiffViewer from 'react-diff-viewer'
import find from 'lodash/find'
import { useTranslation } from 'react-i18next';

import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { toParentURI, toOwnerURI } from '../../common/utils';
import APIService from '../../services/APIService';
import LoaderDialog from '../common/LoaderDialog';
import Error404 from '../errors/Error404'
import RepoHeader from './RepoHeader';
import CompareToolbar from './CompareToolbar';
import VersionStats from './VersionStats'
import VersionMeta from './VersionMeta'
import VersionResourcesComparison from './VersionResourcesComparison'
import { getVersionURL, isSameVersion } from './versionsTab.styles'

const CompareVersions = () => {
  const location = useLocation()
  const history = useHistory()
  const { t } = useTranslation()

  const [loading, setLoading] = React.useState(false)
  const [status, setStatus] = React.useState(false)
  const [repo, setRepo] = React.useState(false)
  const [owner, setOwner] = React.useState(false)
  const [versions, setVersions] = React.useState(false)
  const [version1, setVersion1] = React.useState()
  const [version2, setVersion2] = React.useState()
  const [metric, setMetric] = React.useState(() => new URLSearchParams(location.search).get('metric') || 'stats')
  const [expansion1, setExpansion1] = React.useState(false)
  const [expansion2, setExpansion2] = React.useState(false)
  const [expansions1, setExpansions1] = React.useState([])
  const [expansions2, setExpansions2] = React.useState([])
  const [expansions1Loading, setExpansions1Loading] = React.useState(false)
  const [expansions2Loading, setExpansions2Loading] = React.useState(false)

  const isCollection = location.pathname.includes('/collections/')

  const isHeadVersion = version => (version?.version || version?.id) === 'HEAD'
  const getVersionURLKey = version => decodeURIComponent(version?.version_url || version?.url || '')

  const isNewerVersion = (a, b) => {
    const aIsHead = isHeadVersion(a)
    const bIsHead = isHeadVersion(b)
    if(aIsHead && !bIsHead)
      return true
    if(bIsHead && !aIsHead)
      return false
    return moment(a?.created_on).isAfter(b?.created_on)
  }

  const fetchMissingVersion = url =>
    APIService.new().overrideURL(url).get(null, null, {includeSummary: true, verbose: true}, true).then(response => {
      let data = response?.data || response?.response?.data
      if(!data?.id) return null
      if(isHeadVersion(data) && data.id !== 'HEAD')
        data = {...data, id: 'HEAD', version_url: data.url || data.version_url}
      setVersions(prev => {
        const list = Array.isArray(prev) ? prev : []
        return find(list, version => getVersionURLKey(version) === getVersionURLKey(data)) ? list : [...list, data]
      })
      return data
    })

  const resolveVersion = (url, repoVersions, fallback) => {
    if(!url) return Promise.resolve(fallback)
    const found = repoVersions?.find(version => getVersionURLKey(version) === url)
    return found ? Promise.resolve(found) : fetchMissingVersion(url)
  }

  const setVersionsFromURL = repoVersions => {
    const queryParams = new URLSearchParams(location.search)
    const version1URL = queryParams.get('version1')
    const version2URL = queryParams.get('version2')
    const headVersion = find(repoVersions, isHeadVersion)

    Promise.all([
      resolveVersion(version1URL, repoVersions, headVersion),
      resolveVersion(version2URL, repoVersions, headVersion)
    ]).then(([_version1, _version2]) => {
      if(_version1?.id && _version2?.id && isNewerVersion(_version1, _version2)) {
        setVersion2(_version1)
        fetchVerboseSummary(_version1, setVersion2)
        setVersion1(_version2)
        fetchVerboseSummary(_version2, setVersion1)
      } else {
        setVersion2(_version2)
        fetchVerboseSummary(_version2, setVersion2)
        setVersion1(_version1)
        fetchVerboseSummary(_version1, setVersion1)
      }
    })
  }

  const getURL = () => (toParentURI(location.pathname) + '/').replace('//', '/')

  const fetchRepo = () => {
    setLoading(true)
    APIService.new().overrideURL(getURL()).get(null, null, {}, true).then(response => {
      setStatus(response?.status || response?.response.status)
      setLoading(false)
      const repoData = response?.data || response?.response?.data || {}
      setRepo(repoData)
      fetchOwner()
      fetchVersions(repoData)
    })
  }

  const fetchOwner = () => {
    APIService.new().overrideURL(toOwnerURI(getURL())).get().then(response => {
      setOwner(response.data || {})
    })
  }

  const fetchVersions = headRepo => {
    APIService.new().overrideURL(getURL()).appendToUrl('versions/').get(null, null, {verbose:true, includeSummary: true}).then(response => {
      const repoVersions = Array.isArray(response?.data) ? response.data : []
      const normalizedHead = headRepo?.id && !find(repoVersions, isHeadVersion) ? {
        ...headRepo,
        id: 'HEAD',
        version: 'HEAD',
        version_url: headRepo.url || headRepo.version_url
      } : null
      const allVersions = normalizedHead ? [normalizedHead, ...repoVersions] : repoVersions
      setVersions(allVersions)
      setVersionsFromURL(allVersions)
    })
  }

  React.useEffect(() => {
    fetchRepo()
  }, [location.pathname])


  const onMetricChange = newMetric => {
    setMetric(newMetric)
    const params = new URLSearchParams(location.search)
    if(newMetric === 'stats')
      params.delete('metric')
    else
      params.set('metric', newMetric)
    history.replace({pathname: location.pathname, search: params.toString()})
  }

  const onVersionChange = (versionType, version) => {
    if(!versionType || !version?.id)
      return
    if(versionType === 'version1'){
      setExpansion1(false)
      setVersion1(version)
      fetchVerboseSummary(version, setVersion1)
    }
    else if(versionType === 'version2') {
      setExpansion2(false)
      setVersion2(version)
      fetchVerboseSummary(version, setVersion2)
    }
  }

  const fetchVerboseSummary = (version, setter) => {
    if(version?.id)
      APIService.new().overrideURL(version.url + version.id + '/summary/').get(null, null, {verbose: true}).then(response => {
        setter({...version, summary: {...version.summary, ...response.data}})
      })
  }

  const fetchExpansions = (version, setExpansions, setExpansion, setExpansionsLoading) => {
    setExpansions([])
    setExpansion(false)
    if(!isCollection || !version?.id) {
      setExpansionsLoading(false)
      return
    }
    setExpansionsLoading(true)
    APIService.new().overrideURL(getVersionURL(version)).appendToUrl('expansions/').get(null, null, {includeSummary: true, verbose: true}).then(response => {
      const list = Array.isArray(response?.data) ? response.data : []
      setExpansions(list)
      setExpansion(find(list, {url: version?.expansion_url}) || false)
      setExpansionsLoading(false)
    })
  }

  React.useEffect(() => {
    fetchExpansions(version1, setExpansions1, setExpansion1, setExpansions1Loading)
  }, [version1?.id, isCollection])

  React.useEffect(() => {
    fetchExpansions(version2, setExpansions2, setExpansion2, setExpansions2Loading)
  }, [version2?.id, isCollection])

  React.useEffect(() => {
    if(isCollection && isSameVersion(version1, version2) && expansion1?.url && expansion2?.url === expansion1.url)
      setExpansion2(false)
  }, [isCollection, version1, version2, expansion1, expansion2])

  const identicalSelection = isSameVersion(version1, version2) &&
    (!isCollection || Boolean(expansion1?.url && expansion2?.url && expansion1.url === expansion2.url))

  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '8px'}}>
      <LoaderDialog open={loading} />
      <Paper component="div" className='col-xs-12 split padding-0' sx={{backgroundColor: 'info.contrastText', borderRadius: '10px', boxShadow: 'none', p: 0, border: 'solid 0.3px', borderColor: 'surface.n90'}}>
        {
          (repo?.id || loading) &&
            <React.Fragment>
              <RepoHeader repo={repo} owner={owner} versions={versions} hideActions />
            </React.Fragment>
        }
        {
          !loading && status === 404 &&
            <Error404 />
        }
        <CompareToolbar
          version1={version1}
          version2={version2}
          versions={versions}
          onVersionChange={onVersionChange}
          metric={metric}
          onMetricChange={onMetricChange}
          isCollection={isCollection}
          expansion1={expansion1}
          expansion2={expansion2}
          expansions1={expansions1}
          expansions2={expansions2}
          expansions1Loading={expansions1Loading}
          expansions2Loading={expansions2Loading}
          onExpansionChange={(expansionType, expansion) => expansionType === 'expansion1' ? setExpansion1(expansion) : setExpansion2(expansion)}
        />
        {
          identicalSelection ?
            <div className='col-xs-12 padding-0' style={{height: 'calc(100vh - 270px)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Typography variant='body1' color='text.secondary'>
                {t('repo.select_different_version_or_expansion')}
              </Typography>
            </div> :
          <React.Fragment>
            {
              metric === 'stats' &&
                <VersionStats version1={version1} version2={version2} />
            }
            {
              metric === 'meta' &&
                <VersionMeta version1={version1} version2={version2} isCollection={isCollection} expansion1={expansion1} expansion2={expansion2} />
            }
            {
              metric === 'content' &&
                <VersionResourcesComparison version1={version1} version2={version2} isCollection={isCollection} expansion1={expansion1} expansion2={expansion2} resource='concepts' />
            }
            {
              metric === 'mappings' &&
                <VersionResourcesComparison version1={version1} version2={version2} isCollection={isCollection} expansion1={expansion1} expansion2={expansion2} resource='mappings' />
            }
            {
              metric === 'json' &&
                <div style={{height: 'calc(100vh - 270px)', overflow: 'auto', display: 'inline-block', width: '100%'}}>
                  <ReactDiffViewer
                    oldValue={JSON.stringify(isCollection && expansion1 ? {...version1, expansion: expansion1} : version1, undefined, 2)}
                    newValue={JSON.stringify(isCollection && expansion2 ? {...version2, expansion: expansion2} : version2, undefined, 2)}
                    compareMethod='diffSentences'
                    splitView={true}
                  />
                </div>
            }
          </React.Fragment>
        }
      </Paper>
    </div>
  )
}

export default CompareVersions
