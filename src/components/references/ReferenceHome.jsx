import React from 'react'

import APIService from '../../services/APIService';

import ReferenceHeader from './ReferenceHeader'
import ReferenceDetails from './ReferenceDetails'
import ReferenceTabs from './ReferenceTabs'
import ReferenceExpansionResults from './ReferenceExpansionResults'

const ReferenceHome = props => {
  const { reference } = props
  const [loading, setLoading] = React.useState(false)
  const [tab, setTab] = React.useState('metadata')
  const [concepts, setConcepts] = React.useState(false)
  const [mappings, setMappings] = React.useState(false)

  const repoURL = props?.repo?.version_url || props?.repo?.url

  React.useEffect(() => {
    setConcepts(false)
    setMappings(false)
    if(tab === 'expansion')
      setTimeout(() => getResults(true), 100)
  }, [reference?.id])

  const onTabChange = newTab => {
    setTab(newTab)
    if(newTab === 'expansion')
      getResults()
  }
  const getResults = (force=false) => {
    if(reference.reference_type === 'mappings' && (force || !mappings?.length)) {
      fetchMappings()
    }
    else if (force || !concepts?.length) {
      fetchConcepts()
    }
  }
  const getRefService = () => APIService.new().overrideURL(repoURL).appendToUrl(`references/${reference.id}/`)

  const fetchConcepts = (page=1) => {
    let limit = 10
    let offset = limit * (page -1)
    setLoading(true)
    getRefService().appendToUrl('concepts/').get(null, null, {limit: limit, offset: offset, includeMappings: true, mappingBrief: true}).then(response => {
      setConcepts(page === 1 ? response.data : [...(concepts || []), ...response.data])
      setLoading(false)
    })
  }

  const fetchMappings = (page=1) => {
    let limit = 10
    let offset = limit * (page -1)
    setLoading(true)
    getRefService().appendToUrl('mappings/').get(null, null, {limit: limit, offset: offset}).then(response => {
      setMappings(page === 1 ? response.data : [...(mappings || []), ...response.data])
      setLoading(false)
    })
  }



  return (
    <div className='col-xs-12' style={{padding: '8px 16px 12px 16px'}}>
      <ReferenceHeader reference={reference} onClose={props.onClose} />
      <ReferenceTabs tab={tab} onTabChange={(event, newTab) => onTabChange(newTab)} loading={loading} />
      {
        tab === 'metadata' &&
        <ReferenceDetails reference={reference} />
      }
      {
        tab === 'expansion' &&
          <ReferenceExpansionResults reference={reference} loading={loading} concepts={concepts} mappings={mappings} />
      }
    </div>
  )
}

export default ReferenceHome
