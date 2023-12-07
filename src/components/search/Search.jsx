import React from 'react';
import get from 'lodash/get'
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { forEach, keys, pickBy, isEmpty } from 'lodash';
import RepoIcon from '../repos/RepoIcon';
import ConceptIcon from '../concepts/ConceptIcon';
import { WHITE, LIGHT_GRAY } from '../../common/constants';
import { highlightTexts } from '../../common/utils';
import APIService from '../../services/APIService';
import ResultsTable from './ResultsTable';
import SearchFilters from './SearchFilters'

const Search = () => {
  const [input, setInput] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(25);
  const [resource, setResource] = React.useState('concepts')
  const [result, setResult] = React.useState({})
  const [filters, setFilters] = React.useState({})
  const location = useLocation();
  const { t } = useTranslation()

  React.useEffect(() => {
    setQueryParamsInState()
  }, [location.search, input])

  React.useEffect(() => {
    highlight()
  }, [result])

  React.useEffect(() => {
    if(!location.search && !input)
      fetchResults(getQueryParams(input, page, pageSize, filters))
  }, [])

  const setQueryParamsInState = () => {
    const queryParams = new URLSearchParams(window.location.hash.split('?')[1])
    const value = queryParams.get('q') || ''
    const _page = queryParams.get('page') || 0
    const _pageSize = queryParams.get('pageSize') || 25
    let _fetch = false
    if(value !== input) {
      setInput(value)
      _fetch = true
    }
    if(_page !== page) {
      setPage(_page)
      _fetch = true
    }
    if(_pageSize !== pageSize) {
      setPageSize(_pageSize)
      _fetch = true
    }

    if(_fetch)
      fetchResults(getQueryParams(value, _page, _pageSize, filters), !value || isEmpty(filters))
  }

  const getFacetQueryParam = filters => {
    const queryParam = {}
    forEach(
      filters, (value, field) => {
        queryParam[field] = keys(pickBy(value, Boolean)).join(',')
      }
    )

    return queryParam
  }


  const getQueryParams = (_input, _page, _pageSize, _filters) => {
    return {q: _input, page: (_page || 0) + 1, pageSize: _pageSize, includeSearchMeta: true, ...getFacetQueryParam(_filters || {})}
  }

  const handleResourceChange = (event, newTab) => {
    event.preventDefault()
    event.stopPropagation()

    setResource(newTab)
  }

  const fetchResults = (params, facets=true) => {
    APIService.new().overrideURL(`/${resource}/`).get(null, null, params).then(response => {
      const resourceResult = {total: parseInt(response?.headers?.num_found), pageSize: parseInt(response?.headers?.num_returned), page: parseInt(response?.headers?.page_number), pages: parseInt(response?.headers?.pages), results: response?.data || []}
      if(!facets)
        resourceResult.facets = result[resource].facets
      setResult({[resource]: resourceResult})
      if(facets)
        fetchFacets(params, resourceResult)
    })
  }

  const fetchFacets = (params, otherResults) => {
    APIService.new().overrideURL(`/${resource}/`).get(null, null, {...params, facetsOnly: true}).then(response => {
      setResult({[resource]: {...get(result, resource, {}), ...(otherResults || {}), facets: response?.data?.facets}})
    })
  }

  const onPageChange = (_page, _pageSize) => fetchResults(getQueryParams(input, _page, _pageSize, filters), isEmpty(filters))

  const highlight = item => highlightTexts(item?.id ? [item] : result[resource]?.results || [], null, true)

  const onFiltersChange = newFilters => {
    setFilters(newFilters)
    fetchResults(getQueryParams(input, page, pageSize, newFilters), false)
  }

  const TAB_STYLES = {textTransform: 'none'}

  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-12' style={{backgroundColor: WHITE, borderRadius: '10px'}}>

        <div className='col-xs-12 padding-0' style={{borderBottom: `1px solid ${LIGHT_GRAY}`}}>
          <Tabs value={resource} onChange={handleResourceChange} aria-label="search tabs" TabIndicatorProps={{style: {height: '3px'}}}>
            <Tab value='concepts' icon={<ConceptIcon selected={resource == 'concepts'} fontSize='small' />} label={t('concept.concepts')} style={TAB_STYLES} />
            <Tab value='repos' icon={<RepoIcon selected={resource == 'repos'} fontSize='small' />} label={t('repo.repos')} style={TAB_STYLES} />
          </Tabs>
        </div>

        <div className='col-xs-12 padding-0'>
          <div className='col-xs-12 padding-0'>
            <div className='col-xs-3' style={{maxWidth: '250px', padding: '0 8px', height: '75vh', overflow: 'auto'}}>
              <SearchFilters filters={result[resource]?.facets?.fields || {}} onChange={onFiltersChange} />
            </div>

            <div className='col-xs-9' style={{width: 'calc(100% - 250px)'}}>
              <div className='col-xs-12 padding-0'>
                <ResultsTable results={result[resource]} resource={resource} onPageChange={onPageChange} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
export default Search;