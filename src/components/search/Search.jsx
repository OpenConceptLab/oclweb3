import React from 'react';
import get from 'lodash/get'
import { useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { forEach, keys, pickBy, isEmpty, find, uniq, has, orderBy, uniqBy, omit } from 'lodash';
import { WHITE, LIGHT_GRAY } from '../../common/constants';
import { highlightTexts } from '../../common/utils';
import APIService from '../../services/APIService';
import RepoIcon from '../repos/RepoIcon';
import ConceptIcon from '../concepts/ConceptIcon';
import ConceptHome from '../concepts/ConceptHome';
import OrgIcon from '@mui/icons-material/AccountBalance';
import ResultsTable from './ResultsTable';
import SearchFilters from './SearchFilters'
import LoaderDialog from '../common/LoaderDialog';

const DEFAULT_LIMIT = 25;
const FILTERS_WIDTH = 250

const Search = () => {
  const { t } = useTranslation()
  const history = useHistory();
  const location = useLocation();

  const [loading, setLoading] = React.useState(true)
  const [openFilters, setOpenFilters] = React.useState(true)
  const [input, setInput] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(DEFAULT_LIMIT);
  const [resource, setResource] = React.useState(false)
  const [result, setResult] = React.useState({})
  const [filters, setFilters] = React.useState({})
  const [selected, setSelected] = React.useState([])
  const [showItem, setShowItem] = React.useState(false)
  const didMount = React.useRef(false);

  React.useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    if((queryParams.get('q') !== input) || (!queryParams.get('q') && !input)) {
      setQueryParamsInState()
    }
  }, [location.search])

  React.useEffect(() => {
    highlight()
  }, [result])

  React.useEffect(() => {
    if(!location.search && !input){
      fetchResults(getQueryParams(input, page, pageSize, filters))
    }
  }, [])

  React.useEffect(() => {
    if(didMount.current)
      fetchResults(getQueryParams(input, page, pageSize, filters), true)
    else
      didMount.current = true
  }, [filters, resource])

  const getCurrentLayoutURL = params => {
    /*eslint no-unused-vars: 0*/
    const { q, page, limit, includeSearchMeta, ...filters} = params
    let _resource = resource || 'concepts'
    if(_resource === 'organizations')
      _resource = 'orgs'
    let url = '/search/'
    url += `?q=${q || ''}`
    if(_resource !== 'concepts')
      url += `&type=${_resource}`
    if(pageSize !== DEFAULT_LIMIT)
      url += `&limit=${limit}`
    if(page && page > 1)
      url += `&page=${(page || 1) - 1}`
    if(!isEmpty(filters)){
      url += `&filters=${JSON.stringify(omit(filters, 'includeRetired'))}`
    }

    return window.location.hash.replace('#', '').split('?')[0] + '?' + url.split('?')[1];
  }

  const setQueryParamsInState = () => {
    const queryParams = new URLSearchParams(window.location.hash.split('?')[1])
    const value = queryParams.get('q') || ''
    const isDiffFromPrevInput = value !== input
    const _page = parseInt(queryParams.get('page') || 0)
    const _pageSize = parseInt(queryParams.get('pageSize') || 25)
    const _resource = queryParams.get('type') || 'concepts'
    let _fetch = false
    if(isDiffFromPrevInput) {
      setInput(value)
      _fetch = true
    }
    if(_resource !== resource) {
      setResource(_resource)
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
      fetchResults(getQueryParams(value, _page, _pageSize, filters), isDiffFromPrevInput)
  }

  const getFacetQueryParam = filters => {
    const queryParam = {}
    forEach(
      filters, (value, field) => {
        queryParam[field] = keys(pickBy(value, Boolean)).join(',')
      }
    )

    if(queryParam?.retired === 'true,false' || queryParam?.retired === 'false,true')
      queryParam['includeRetired'] = true

    return queryParam
  }


  const getQueryParams = (_input, _page, _pageSize, _filters) => {
    return {q: _input, page: (_page || 0) + 1, limit: _pageSize, includeSearchMeta: true, ...getFacetQueryParam(_filters || {})}
  }

  const handleResourceChange = (event, newTab) => {
    event.preventDefault()
    event.stopPropagation()

    setResource(newTab)
  }

  const fetchResults = (params, facets=true) => {
    if(!resource)
      return
    setLoading(true)
    APIService.new().overrideURL(`/${resource}/`).get(null, null, params).then(response => {
      const resourceResult = {total: parseInt(response?.headers?.num_found), pageSize: parseInt(response?.headers?.num_returned), page: parseInt(response?.headers?.page_number), pages: parseInt(response?.headers?.pages), results: response?.data || [], facets: result[resource]?.facets || {}}
      setResult({[resource]: resourceResult})
      setLoading(false)
      history.push(getCurrentLayoutURL(params))
      if(facets)
        fetchFacets(params, resourceResult)
    })
  }

  const fetchFacets = (params, otherResults) => {
    APIService.new().overrideURL(`/${resource}/`).get(null, null, {...params, facetsOnly: true}).then(response => {
      setResult({[resource]: {...get(result, resource, {}), ...(otherResults || {}), facets: prepareFacets(response?.data?.facets?.fields || {})}})
    })
  }

  const prepareFacets = newFacets => {
    // 1. If no facets are applied then just replace with new facets
    // 2. If facet(s) are applied then do not change anything in the applied field list
    // 3. If facet(s) are applied then new facets will be added and enabled but old facets that are not present in new facets will be disabled with count 0
    // 4. If facet(s) are applied then anything that is existing in both new and old will only have count updated
    let existingFacets = result[resource]?.facets
    if(isEmpty(existingFacets))
      return newFacets

    let appliedFacets = {...filters}
    const doNotRemoveFacets = keys(appliedFacets)
    let mergedFacets = {}
    forEach(uniq([...keys(newFacets), ...keys(existingFacets)]), field => {
      mergedFacets[field] = mergedFacets[field] || []
      if(doNotRemoveFacets.includes(field)) {
        const facets = uniq([...(existingFacets[field].map(facet => facet[0]) || []), ...(newFacets[field].map(facet => facet[0]) || [])])
        forEach(facets, facet => {
          const newFacet = find(get(newFacets, field), f => f[0] === facet)
          const existingFacet = find(get(existingFacets, field), f => f[0] === facet)
          if(newFacet)
            mergedFacets[field].push(newFacet)
          else if (existingFacet)
            mergedFacets[field].push(existingFacet)
        })
      } else if (!has(existingFacets, field)) {
        mergedFacets[field] = newFacets[field]
      } else {
        forEach(existingFacets[field], facet => {
          const val = facet[0]
          let newFacet = find(newFacets[field], newFacet => newFacet[0] === val)
          if(newFacet) {
            mergedFacets[field].push(newFacet)
          } else {
            mergedFacets[field].push([facet[0], 0, false, true])
          }
        })
        mergedFacets[field] = uniqBy([...(mergedFacets[field] || []), ...(newFacets[field] || [])], facet => facet[0])
      }

      mergedFacets[field] = orderBy(mergedFacets[field], facet => facet[1], 'desc')
    })

    return mergedFacets
  }

  const onPageChange = (_page, _pageSize) => fetchResults(getQueryParams(input, _page, _pageSize, filters), isEmpty(filters))

  const highlight = item => highlightTexts(item?.id ? [item] : result[resource]?.results || [], null, true)

  const onFiltersChange = newFilters => {
    setFilters(newFilters)
  }

  const TAB_STYLES = {textTransform: 'none'}
  const searchBgColor = selected.length ? '#fcf8fd' : WHITE
  const getLastSelectedURL = () => {
    let URL = showItem?.version_url || showItem?.url
    if(showItem && ['concepts', 'mappings'].includes(resource)) {
      const item = find(result[resource].results, {version_url: showItem})
      if(item?.uuid && (parseInt(item?.versioned_object_id) === parseInt(item?.uuid) || item.is_latest_version)) {
        URL = item.url
      }
    }
    return URL
  }

  const noResults = !loading && input && !(result[resource]?.results || []).length
  const showFilters = openFilters && !noResults && ['concepts', 'mappings', 'repos', 'sources', 'collections'].includes(resource)

  const getResultsTableWidth = () => {
    let toSubtract = 0;
    if(showFilters)
      toSubtract = FILTERS_WIDTH
    return toSubtract ? `calc(100% - ${toSubtract}px)` : '100%'
  }

  return (
    <div className='col-xs-12 padding-0' style={{overflow: 'auto'}}>
      <LoaderDialog open={loading} message={t('search.loading')} />
      <div className={showItem?.id ? 'col-xs-7 split' : 'col-xs-12 split'} style={{backgroundColor: searchBgColor, borderRadius: '10px', height: '86vh'}}>
        <div className='col-xs-12 padding-0' style={{borderBottom: `1px solid ${LIGHT_GRAY}`}}>
          <Tabs value={resource} onChange={handleResourceChange} aria-label="search tabs" TabIndicatorProps={{style: {height: '3px'}}}>
            <Tab value='concepts' icon={<ConceptIcon selected={resource == 'concepts'} fontSize='small' />} label={t('concept.concepts')} style={TAB_STYLES} />
            <Tab value='repos' icon={<RepoIcon selected={resource == 'repos'} fontSize='small' />} label={t('repo.repos')} style={TAB_STYLES} />
            <Tab value='orgs' icon={<OrgIcon color={resource === 'orgs' ? 'primary' : 'secondary'} fontSize='small' />} label={t('org.orgs')} style={TAB_STYLES} />
          </Tabs>
        </div>
        <div className='col-xs-12 padding-0'>
          <div className='col-xs-12 padding-0'>
            <div className='col-xs-3 split' style={{width: showFilters ? `${FILTERS_WIDTH}px` : 0, padding: showFilters ? '0 8px' : 0, height: '75vh', overflow: 'auto'}}>
              <SearchFilters
                resource={resource}
                filters={result[resource]?.facets || {}}
                onChange={onFiltersChange}
                bgColor={searchBgColor}
                appliedFilters={filters}
              />
            </div>
            <div className='col-xs-9 split' style={{width: getResultsTableWidth(), paddingRight: 0, paddingLeft: showFilters ? '15px' : 0, float: 'right'}}>
              <div className='col-xs-12 padding-0'>
                <ResultsTable
                  noResults={noResults}
                  searchedText={input}
                  bgColor={searchBgColor}
                  results={result[resource]}
                  resource={resource}
                  onPageChange={onPageChange}
                  onSelect={newSelected => setSelected(newSelected)}
                  selectedToShow={showItem}
                  onShowItemSelect={item => setShowItem(item || false)}
                  onFiltersToggle={() => setOpenFilters(!openFilters)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={'col-xs-5 padding-0' + (showItem ? ' split-appear' : '')} style={{marginLeft: '16px', width: showItem ? 'calc(41.66666667% - 16px)' : 0, backgroundColor: WHITE, borderRadius: '10px', height: showItem ? '86vh' : 0, opacity: showItem ? 1 : 0}}>
        {
          showItem &&
            <ConceptHome url={getLastSelectedURL()} onClose={() => setShowItem(false)} />
        }
      </div>
    </div>
  )
}
export default Search;
