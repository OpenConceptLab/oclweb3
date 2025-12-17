import React from 'react';
import get from 'lodash/get'
import { useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import OrgIcon from '@mui/icons-material/AccountBalance';
import UserIcon from '@mui/icons-material/Person';
import { forEach, keys, pickBy, isEmpty, find, uniq, has, orderBy as sortBy, uniqBy, omit, max, isEqual, isBoolean } from 'lodash';
import { COLORS } from '../../common/colors';
import { highlightTexts } from '../../common/utils';
import APIService from '../../services/APIService';
import RepoIcon from '../repos/RepoIcon';
import ConceptIcon from '../concepts/ConceptIcon';
import ConceptHome from '../concepts/ConceptHome';
import SearchResults from './SearchResults';
import SearchFilters from './SearchFilters'
import { OperationsContext } from '../app/LayoutContext';

const DEFAULT_LIMIT = 25;
const FILTERS_WIDTH = 250
const FILTERABLE_RESOURCES = ['concepts', 'mappings', 'repos', 'sources', 'collections']

const Search = props => {
  const { setAlert } = React.useContext(OperationsContext);
  const { t } = useTranslation()
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading] = React.useState(true)
  const [loadingFacets, setLoadingFacets] = React.useState(true)
  const [openFilters, setOpenFilters] = React.useState(has(props, 'defaultFiltersOpen') ? props.defaultFiltersOpen : true)
  const [input, setInput] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(DEFAULT_LIMIT);
  const [resource, setResource] = React.useState(false)
  const [result, setResult] = React.useState({})
  const [filters, setFilters] = React.useState({})
  const [selected, setSelected] = React.useState([])
  const [showItem, setShowItem] = React.useState(false)
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('score');
  const didMount = React.useRef(false);
  const isFilterable = _resource => FILTERABLE_RESOURCES.includes(_resource)

  React.useEffect(() => {
    if(!props.url)
      setQueryParamsInState(true)
  }, [])

  React.useEffect(() => {
    if(props.url && !props.loading)
      setQueryParamsInState(true, true)
  }, [props.url, props.loading])

  React.useEffect(() => {
    if(didMount.current)
      setQueryParamsInState()
    else
      didMount.current = true
  }, [decodeURIComponent(location.search)])

  React.useEffect(() => {
    highlight()
  }, [result])

  const onDisplayChange = () => input && setTimeout(highlight, 100)

  const getCurrentLayoutURL = (params, _resource) => {
    /*eslint no-unused-vars: 0*/
    const { q, page, limit, includeSearchMeta, sortAsc, sortDesc, ...filters} = params
    _resource = _resource || resource || 'concepts'
    if(_resource === 'organizations')
      _resource = 'orgs'
    let url = '/search/?'
    if(q)
      url += `&q=${q || ''}`
    if(_resource !== 'concepts')
      url += `&type=${_resource}`
    if(limit !== DEFAULT_LIMIT)
      url += `&limit=${limit}`
    if(page && page > 1)
      url += `&page=${page}`
    if(!isEmpty(filters)){
      url += `&filters=${encodeURIComponent(JSON.stringify(omit(filters, 'includeRetired')))}`
    }
    if(sortDesc)
      url += `&sortDesc=${sortDesc}`
    else if(sortAsc)
      url += `&sortAsc=${sortAsc}`


    let queryStr = url.replace('?&', '?').split('?')[1]
    queryStr = queryStr ? '?' + queryStr : ''

    return window.location.hash.replace('#', '').split('?')[0] + queryStr;
  }


  const getFiltersFromQueryParams = () => {
    const queryParams = new URLSearchParams(window.location.hash.split('?')[1])
    let _filters = queryParams.get('filters') || false
    if(_filters)
      _filters = JSON.parse(_filters)
    if(_filters) {
      try {
        _filters = getAppliedFacetFromQueryParam(_filters)
      } catch {
        _filters = {}
      }
    }
    return _filters
  }

  const setQueryParamsInState = (mustFetch, includeRepoDefaultFilters) => {
    const queryParams = new URLSearchParams(window.location.hash.split('?')[1])
    const value = queryParams.get('q') || ''
    const isDiffFromPrevInput = value !== input
    const _page = parseInt(queryParams.get('page') || 1)
    const _pageSize = parseInt(queryParams.get('limit') || 25)
    const _resource = queryParams.get('type') || props.resource || 'concepts'
    let _orderBy, _order;
    const sortAsc = queryParams.get('sortAsc')
    const sortDesc = queryParams.get('sortDesc')
    if(sortAsc) {
      _orderBy = sortAsc
      _order = 'asc'
    } else if (sortDesc) {
      _orderBy = sortDesc
      _order = 'desc'
    } else if(!value) {
      _orderBy = _resource === 'users' ? 'username' : 'id'
      _order = 'asc'
    }
    let _fetch = mustFetch || false
    let _fetchFacets = mustFetch || isDiffFromPrevInput
    let _filters = getFiltersFromQueryParams()
    if(_filters) {
      _fetch = true
      _fetchFacets = true
    }
    if(includeRepoDefaultFilters && !_filters && props.repoDefaultFilters) {
      _filters = getAppliedFacetFromQueryParam(props.repoDefaultFilters)
    }
    if(!isEqual(filters, _filters)) {
      setFilters(_filters)
      _fetchFacets = true
      _fetch = true
    }
    if(isDiffFromPrevInput) {
      setInput(value)
      _fetch = true
    }
    if(_resource !== resource) {
      setResource(_resource)
      _fetch = true
      _fetchFacets = true
    }
    if(_page !== page) {
      setPage(_page)
      _fetch = true
    }
    if(_pageSize !== pageSize) {
      setPageSize(_pageSize)
      _fetch = true
    }
    if(_orderBy !== orderBy || _order !== order) {
      setOrderBy(_orderBy)
      setOrder(_order)
      _fetch = true
    }

    if(_fetch)
      fetchResults(getQueryParams(value, _page, _pageSize, _filters, _orderBy, _order), _fetchFacets, _resource)
  }

  const getAppliedFacetFromQueryParam = filters => {
    const applied = {}
    forEach(filters, (value, field) => {
      applied[field] = {}
      if(isBoolean(value)) {
        applied[field][value.toString()] = true
      } else
        forEach(value.split(','), val => applied[field][val] = true)
    })
    return applied
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


  const getQueryParams = (_input, _page, _pageSize, _filters, _orderBy, _order) => {
    let params = {q: _input, page: _page || 1, limit: _pageSize, includeSearchMeta: true, ...getFacetQueryParam(_filters || {})}
    if(_orderBy) {
      if(_order === 'desc')
        params.sortDesc = _orderBy
      else
        params.sortAsc = _orderBy
    } else if(!_input) {
      params.sortAsc = 'id'
    }
    return params
  }

  const handleResourceChange = (event, newTab) => {
    event.preventDefault()
    event.stopPropagation()
    setFilters({})

    history.push(getCurrentLayoutURL(getQueryParams(input, page, pageSize, {}), newTab))
  }

  const getURL = __resource => {
    if(props.nested && props.url)
      return props.url
    return `/${__resource}/`
  }

  const fetchResults = (params, facets=true, _resource=undefined) => {
    let __resource = _resource || resource
    if(!__resource)
      return
    setLoading(true)
    setResult(prev => {
      return {...prev, [__resource]: {...result[__resource], results: []}}
    })
    if(['users', 'orgs', 'references'].includes(__resource))
      params.verbose = true
    APIService.new().overrideURL(getURL(__resource)).get(null, null, params).then(response => {
      if(response?.detail) {
        setAlert({message: response.detail, severity: 'error', duration: 5000})
        setLoading(false)
        return
      }
      let total = parseInt(response?.headers?.num_found)
      const summaryCount = get(props.summary, `active_${__resource}`) || get(props.summary, `${__resource}.active`) || 0
      if(!params.q && props?.summary && props.nested && (total < summaryCount && total === 10000) && keys(params).every(el => ['includeSearchMeta', 'q', 'limit', 'page', 'pageSize', 'offset', 'sortAsc', 'sortDesc', 'display', 'type'].includes(el)))
        total = summaryCount
      const resourceResult = {total: total, pageSize: max([parseInt(response?.headers?.num_returned), params?.limit]), page: parseInt(response?.headers?.page_number), pages: parseInt(response?.headers?.pages), results: response?.data || [], facets: result[__resource]?.facets || {}}
      setResult(prev => {
        return {...result, [__resource]: resourceResult}
      })
      setLoading(false)
      if(facets && isFilterable(__resource))
        fetchFacets(params, resourceResult, __resource)
    })
  }

  const fetchFacets = (params, otherResults, _resource=undefined) => {
    setLoadingFacets(true)
    const __resource = _resource || resource
    APIService.new().overrideURL(getURL(__resource)).get(null, null, {...params, facetsOnly: true}).then(response => {
      setResult(prev => {
        return {...prev, [__resource]: {...otherResults, facets: prepareFacets(response?.data?.facets?.fields || {}, __resource)}}
      })
      setLoadingFacets(false)
    })
  }

  const prepareFacets = (newFacets, _resource) => {
    // 1. If no facets are applied then just replace with new facets
    // 2. If facet(s) are applied then do not change anything in the applied field list
    // 3. If facet(s) are applied then new facets will be added and enabled but old facets that are not present in new facets will be disabled with count 0
    // 4. If facet(s) are applied then anything that is existing in both new and old will only have count updated
    let existingFacets = result[_resource]?.facets
    if(isEmpty(existingFacets))
      return newFacets

    let appliedFacets = getFiltersFromQueryParams()
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

      mergedFacets[field] = sortBy(mergedFacets[field], facet => facet[1], 'desc')
    })

    return mergedFacets
  }

  const onPageChange = (_page, _pageSize) => {
    history.push(getCurrentLayoutURL(getQueryParams(input, _page, _pageSize, filters, orderBy, order)))
  }

  const highlight = item => highlightTexts(item?.id ? [item] : result[resource]?.results || [], null, true)

  const onFiltersChange = newFilters => {
    history.push(getCurrentLayoutURL(getQueryParams(input, page, pageSize, newFilters, orderBy, order)))
  }

  const TAB_STYLES = {textTransform: 'none'}
  const searchBgColor = showItem ? COLORS.surface.main : COLORS.primary.contrastText
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
  const showFilters = openFilters && !noResults && isFilterable(resource)

  const getSearchResultsWidth = () => {
    let toSubtract = 0;
    if(showFilters)
      toSubtract = FILTERS_WIDTH
    return toSubtract ? `calc(100% - ${toSubtract}px)` : '100%'
  }

  const onShowItemSelect = item => {
    setSelected([])
    setShowItem(item || false)
    props.onShowItem && props.onShowItem(item || false)
  }

  const onOrderByChange = (newOrderByField, newOrder) => {
    history.push(getCurrentLayoutURL(getQueryParams(input, page, pageSize, filters, newOrderByField, newOrder)))
  }


  React.useEffect(() => {
    setShowItem(props.showItem || false)
  }, [props.showItem])

  return (
    <div className='col-xs-12 padding-0'>
      <div className={!props.nested && showItem?.id ? 'col-xs-7 split' : 'col-xs-12 split'} style={{backgroundColor: searchBgColor, borderRadius: '10px', height: '100%', ...(props.containerStyle || {})}}>
        {
          !props.noTabs &&
            <div className='col-xs-12 padding-0' style={{borderBottom: `1px solid ${COLORS.surface.n90}`}}>
              <Tabs value={resource} onChange={handleResourceChange} aria-label="search tabs" TabIndicatorProps={{style: {height: '3px'}}}>
                <Tab value='concepts' icon={<ConceptIcon selected={resource == 'concepts'} fontSize='small' />} label={t('concept.concepts')} style={TAB_STYLES} />
                <Tab value='repos' icon={<RepoIcon noTooltip selected={resource == 'repos'} fontSize='small' />} label={t('repo.repos')} style={TAB_STYLES} />
                <Tab value='orgs' icon={<OrgIcon color={resource === 'orgs' ? 'primary' : 'secondary'} fontSize='small' />} label={t('org.orgs')} style={TAB_STYLES} />
                <Tab value='users' icon={<UserIcon color={resource === 'users' ? 'primary' : 'secondary'} fontSize='small' />} label={t('user.users')} style={TAB_STYLES} />
              </Tabs>
            </div>
        }
        <div className='col-xs-12 padding-0' style={{height: '100%'}}>
          <div className='col-xs-12 padding-0' style={{height: '100%'}}>
            <div className='col-xs-3 split padding-0' style={{width: showFilters ? `${FILTERS_WIDTH}px` : 0, padding: showFilters ? '0 8px' : 0, ...(showFilters ? {borderRight: '0.3px solid', borderColor: COLORS.surface.n90} : {})}}>
              <SearchFilters
                open={showFilters}
                loading={loadingFacets}
                resource={resource}
                filters={result[resource]?.facets || {}}
                onChange={onFiltersChange}
                bgColor={searchBgColor}
                appliedFilters={filters}
                nested={props.nested}
                onSaveAsDefaultFilters={props.onSaveAsDefaultFilters ? filters => props.onSaveAsDefaultFilters(getFacetQueryParam(filters)) : false}
                repoDefaultFilters={getAppliedFacetFromQueryParam(props.repoDefaultFilters || {})}
                propertyFilters={props.propertyFilters}
                heightToSubtract={props.filtersHeightToSubtract || 175}
              />
            </div>
            <div className='col-xs-9 split' style={{width: getSearchResultsWidth(), paddingRight: 0, paddingLeft: 0, float: 'right', height: '100%'}}>
              <div className='col-xs-12 padding-0' style={{height: '100%'}}>
                <SearchResults
                  loading={loading}
                  noCardDisplay={props.noCardDisplay}
                  order={order}
                  orderBy={orderBy}
                  onOrderByChange={onOrderByChange}
                  nested={props.nested}
                  openFilters={showFilters}
                  appliedFilters={filters}
                  isFilterable={isFilterable(resource)}
                  noResults={noResults}
                  searchedText={input}
                  bgColor={searchBgColor}
                  results={result[resource]}
                  resource={resource}
                  onPageChange={onPageChange}
                  selected={selected}
                  onSelect={newSelected => setSelected(newSelected)}
                  selectedToShow={showItem}
                  onShowItemSelect={onShowItemSelect}
                  onFiltersToggle={() => setOpenFilters(!openFilters)}
                  onDisplayChange={onDisplayChange}
                  resultContainerStyle={props.resultContainerStyle}
                  resultSize={props.resultSize}
                  excludedColumns={props.excludedColumns}
                  properties={props.properties}
                  propertyFilters={props.propertyFilters}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        !props.nested &&
          <div className={'col-xs-5 padding-0' + (showItem ? ' split-appear' : '')} style={{marginLeft: '16px', width: showItem ? 'calc(41.66666667% - 16px)' : 0, backgroundColor: COLORS.primary.contrastText, borderRadius: '10px', height: showItem ? 'calc(100vh - 100px)' : 0, opacity: showItem ? 1 : 0}}>
            {
              showItem &&
                <ConceptHome concept={showItem} url={getLastSelectedURL()} onClose={() => setShowItem(false)} />
            }
          </div>
      }
    </div>
  )
}
export default Search;
