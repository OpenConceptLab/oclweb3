import React from 'react';
import { useLocation } from 'react-router-dom'
import Fade from '@mui/material/Fade';
import APIService from '../../services/APIService';
import { toParentURI } from '../../common/utils'
import MappingHeader from './MappingHeader';
import MappingTabs from './MappingTabs';
import MappingDetails from './MappingDetails'

const MappingHome = props => {
  const location = useLocation()
  const isInitialMount = React.useRef(true);

  const [mapping, setMapping] = React.useState(props.mapping || {})
  const [repo, setRepo] = React.useState(props.repo || {})
  const [tab, setTab] = React.useState('metadata')

  React.useEffect(() => {
    getService().get().then(response => {
      const resource = response.data
      setMapping(resource)
      props.repo?.id ? setRepo(props.repo) : fetchRepo(resource)
    })
  }, [props.url])

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      props?.onClose()
    }
  }, [location])

  const fetchRepo = _mapping => APIService.new().overrideURL(getRepoURL(_mapping)).get().then(response => setRepo(response.data))

  const getRepoURL = _mapping => {
    let url = toParentURI(_mapping?.version_url || mapping?.url)
    const repoVersion = _mapping?.latest_source_version || mapping?.latest_source_version
    if(repoVersion)
      url += repoVersion + '/'
    return url
  }

  const getService = () => {
    let url = props.url
    if(props.scoped === 'collection' && props.parentURL && mapping?.id)
      url = `${props.parentURL}mappings/${encodeURIComponent(mapping.id)}/`

    return APIService.new().overrideURL(encodeURI(url))
  }

  return (mapping?.id && repo?.id) ? (
    <>
      <Fade in={true}>
        <div className='col-xs-12' style={{padding: '8px 16px 12px 16px'}}>
                <div className='col-xs-12 padding-0' style={{marginBottom: '12px'}}>
                  <MappingHeader mapping={mapping} onClose={props.onClose} repoURL={getRepoURL()} repo={repo} nested={props.nested} />
                </div>
                <MappingTabs tab={tab} onTabChange={(event, newTab) => setTab(newTab)} />
                {
                  tab === 'metadata' &&
                    <div className='col-xs-12' style={{padding: '16px 0', height: 'calc(100vh - 330px)', overflow: 'auto'}}>
                      <MappingDetails mapping={mapping} />
                    </div>
                }
        </div>
      </Fade>
    </>
  ) : null
}


export default MappingHome;
