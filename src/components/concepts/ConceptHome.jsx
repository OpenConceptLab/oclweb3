import React from 'react';
import { useLocation } from 'react-router-dom'
import APIService from '../../services/APIService';
import { toParentURI } from '../../common/utils'
import ConceptHeader from './ConceptHeader';
import ConceptTabs from './ConceptTabs';
import ConceptForm from './ConceptForm'
import Fade from '@mui/material/Fade';
import ConceptDetails from './ConceptDetails'

const ConceptHome = props => {
  const location = useLocation()
  const isInitialMount = React.useRef(true);

  const [concept, setConcept] = React.useState(props.concept || {})
  const [mappings, setMappings] = React.useState([])
  const [reverseMappings, setReverseMappings] = React.useState([])
  const [repo, setRepo] = React.useState(props.repo || {})
  const [tab, setTab] = React.useState('metadata')
  const [edit, setEdit] = React.useState(false)

  React.useEffect(() => {
    getService().get().then(response => {
      const resource = response.data
      setConcept(resource)
      props.repo?.id ? setRepo(repo) : fetchRepo(resource)
      getMappings(resource)
    })
  }, [props.url])

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      props?.onClose()
    }
  }, [location])

  const fetchRepo = _concept => props?.repo?.id ? setRepo(props.repo) : APIService.new().overrideURL(getRepoURL(_concept)).get().then(response => setRepo(response.data))

  const getRepoURL = _concept => {
    if(props?.repo?.id)
      return props?.repo?.version_url || props?.repo?.url
    let url = toParentURI(_concept?.version_url || concept?.url)
    const repoVersion = _concept?.latest_source_version || concept?.latest_source_version
    if(repoVersion)
      url += repoVersion + '/'
    return url
  }

  const onEdit = () => setEdit(true)

  const getService = () => {
    let url = props.url
    const parentURL = getRepoURL()
    if(parentURL && concept?.id)
      url = `${parentURL}concepts/${encodeURIComponent(concept.id)}/`

    return APIService.new().overrideURL(encodeURI(url))
  }

  const getMappings = (concept, directOnly) => {
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
        }
      )
      .then(response => {
        setMappings(response?.data?.entry?.entries || [])
        !directOnly && getInverseMappings(concept)
      })
  }

  const getInverseMappings = concept => {
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
        })
      .then(response => {
        setReverseMappings(response?.data?.entry?.entries || [])
      })
  }

  return (concept?.id && repo?.id) ? (
    <>
      <Fade in={edit}>
        <div className='col-xs-12 padding-0'>
          {
            edit &&
              <ConceptForm
                edit
                repoSummary={props.repoSummary}
                concept={concept}
                source={repo}
                repo={repo}
                onClose={() => setEdit(false)}
              />
          }
        </div>
      </Fade>
      <Fade in={!edit}>
        <div className='col-xs-12' style={{padding: '8px 16px 12px 16px'}}>
          {
            !edit &&
              <>
                <div className='col-xs-12 padding-0' style={{marginBottom: '12px'}}>
                  <ConceptHeader concept={concept} onClose={props.onClose} repoURL={getRepoURL()} onEdit={onEdit} repo={repo} nested={props.nested} />
                </div>
                <ConceptTabs tab={tab} onTabChange={(event, newTab) => setTab(newTab)} />
                {
                  tab === 'metadata' &&
                    <ConceptDetails concept={concept} repo={repo} mappings={mappings} reverseMappings={reverseMappings} />
                }
              </>
          }
        </div>
      </Fade>
    </>
  ) : null
}


export default ConceptHome;
