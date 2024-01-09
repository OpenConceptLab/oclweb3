import React from 'react';
import { useTranslation } from 'react-i18next';
import APIService from '../../services/APIService';
import ConceptHeader from './ConceptHeader';
import ConceptTabs from './ConceptTabs';
import Locales from './Locales'

const ConceptHome = props => {
  const { t } = useTranslation()
  const [concept, setConcept] = React.useState(props.concept || {})
  const [repo, setRepo] = React.useState(props.repo || {})
  const [tab, setTab] = React.useState('metadata')

  React.useEffect(() => {
    APIService.new().overrideURL(props.url).get().then(response => {
      const resource = response.data
      setConcept(resource)
      fetchRepo(resource)
    })
  }, [props.url])

  const fetchRepo = _concept => APIService.new().overrideURL(getRepoURL(_concept)).get().then(response => setRepo(response.data))

  const getRepoURL = _concept => {
    let url = _concept?.source_url || concept?.source_url
    const repoVersion = _concept?.latest_source_version || concept?.latest_source_version
    if(repoVersion)
      url += repoVersion + '/'
    return url
  }

  return (concept?.id && repo?.id) ? (
    <div className='col-xs-12' style={{padding: '12px 16px'}}>
      <div className='col-xs-12 padding-0' style={{marginBottom: '12px'}}>
        <ConceptHeader concept={concept} onClose={props.onClose} repoURL={getRepoURL()} />
      </div>
      <ConceptTabs tab={tab} onTabChange={(event, newTab) => setTab(newTab)} />
      {
        tab === 'metadata' &&
          <div className='col-xs-12' style={{padding: '16px 0', height: 'calc(100vh - 330px)', overflow: 'auto'}}>
            <div className='col-xs-12 padding-0'>
              <Locales concept={concept} locales={concept.names} title={t('concept.name_and_synonyms')} repo={repo} />
            </div>
            <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
              <Locales concept={concept} locales={concept.descriptions} title={t('concept.descriptions')} repo={repo} />
            </div>
          </div>
      }
    </div>
  ) : null
}


export default ConceptHome;
