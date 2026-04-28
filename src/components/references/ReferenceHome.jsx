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
  const [conceptHeaders, setConceptHeaders] = React.useState(false)
  const [mappings, setMappings] = React.useState(false)
  const [mappingHeaders, setMappingHeaders] = React.useState(false)

  const repoURL = props?.repo?.version_url || props?.repo?.url

  React.useEffect(() => {
    setConcepts(false)
    setMappings(false)
    setConceptHeaders(false)
    setMappingHeaders(false)
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

  const fetchConcepts = () => {
    const { limit, page } = getLimits(conceptHeaders)
    if(limit === 0)
      return

    setLoading(true)
    getRefService().appendToUrl('concepts/').get(null, null, {limit: limit, page: page, includeMappings: true, mappingBrief: true}).then(response => {
      setConcepts(page === 1 ? response.data : [...(concepts || []), ...response.data])
      setConceptHeaders(response.headers)
      setLoading(false)
    })
  }

  const fetchMappings = () => {
    const { limit, page } = getLimits(mappingHeaders)
    if(limit === 0)
      return

    setLoading(true)
    getRefService().appendToUrl('mappings/').get(null, null, {limit: limit, page: page}).then(response => {
      setMappings(page === 1 ? response.data : [...(mappings || []), ...response.data])
      setMappingHeaders(response.headers)
      setLoading(false)
    })
  }

  const getLimits = headers => {
    if(headers?.page_number && !headers?.next)
      return { limit: 0, page: 0 }

    return {
      limit: 10,
      page: (parseInt(headers?.page_number || 0, 10)) + 1
    }
  }

  const onLoadMore = (resource) => {
    if(resource === 'concepts')
      fetchConcepts()
    else if (resource === 'mappings')
      fetchMappings()
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
          <ReferenceExpansionResults reference={reference} loading={loading} concepts={concepts} mappings={mappings} conceptHeaders={conceptHeaders} mappingHeaders={mappingHeaders} onLoadMore={onLoadMore} />
      }
    </div>
  )
}

export default ReferenceHome
