import React from 'react'
import moment from 'moment'
import { useLocation } from 'react-router-dom';
import Paper from '@mui/material/Paper'
import { toParentURI } from '../../common/utils';
import APIService from '../../services/APIService';
import LoaderDialog from '../common/LoaderDialog';
import Error404 from '../errors/Error404'
import RepoHeader from './RepoHeader';
import CompareToolbar from './CompareToolbar';
import VersionStats from './VersionStats'
import VersionMeta from './VersionMeta'

const CompareVersions = () => {
  const location = useLocation()

  const [loading, setLoading] = React.useState(false)
  const [status, setStatus] = React.useState(false)
  const [repo, setRepo] = React.useState(false)
  const [versions, setVersions] = React.useState(false)
  const [version1, setVersion1] = React.useState()
  const [version2, setVersion2] = React.useState()
  const [metric, setMetric] = React.useState('stats')

  const setVersionsFromURL = repoVersions => {
    const queryParams = new URLSearchParams(location.search)
    const version1URL = queryParams.get('version1')
    const version2URL = queryParams.get('version2')
    let _version1, _version2;
    if(version1URL)
      _version1 = repoVersions?.find(version => (version.version_url || version.url) === version1URL)
    if(version2URL)
      _version2 = repoVersions?.find(version => (version.version_url || version.url) === version2URL)
    if(_version1?.id && _version2?.id && moment(_version1.created_on).isAfter(_version2.created_on)) {
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
  }

  const getURL = () => (toParentURI(location.pathname) + '/').replace('//', '/')

  const fetchRepo = () => {
    setLoading(true)
    APIService.new().overrideURL(getURL()).get(null, null, {}, true).then(response => {
      setStatus(response?.status || response?.response.status)
      setLoading(false)
      setRepo(response?.data || response?.response?.data || {})
      fetchVersions()
    })
  }

  const fetchVersions = () => {
    APIService.new().overrideURL(getURL()).appendToUrl('versions/').get(null, null, {verbose:true, includeSummary: true}).then(response => {
      const repoVersions = response?.data || []
      setVersions(repoVersions)
      setVersionsFromURL(repoVersions)
    })
  }

  React.useEffect(() => {
    fetchRepo()
  }, [location.pathname])


  const onVersionChange = (versionType, version) => {
    if(!versionType || !version?.id)
      return
    if(versionType === 'version1'){
      setVersion1(version)
      fetchVerboseSummary(version, setVersion1)
    }
    else if(versionType === 'version2') {
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


  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '8px'}}>
      <LoaderDialog open={loading} />
      <Paper component="div" className='col-xs-12 split padding-0' sx={{backgroundColor: 'info.contrastText', borderRadius: '10px', boxShadow: 'none', p: 0, border: 'solid 0.3px', borderColor: 'surface.n90'}}>
        {
          (repo?.id || loading) &&
            <React.Fragment>
              <RepoHeader repo={repo} versions={versions} />
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
          onMetricChange={setMetric}
        />
        {
          metric === 'stats' &&
            <VersionStats version1={version1} version2={version2} />
        }
        {
          metric === 'meta' &&
            <VersionMeta version1={version1} version2={version2} />
        }
      </Paper>
    </div>
  )
}

export default CompareVersions
