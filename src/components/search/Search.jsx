import React from 'react';
import get from 'lodash/get'
import { useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import OrgIcon from '@mui/icons-material/AccountBalance';
import UserIcon from '@mui/icons-material/Person';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import TransformIcon from '@mui/icons-material/Transform';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import { forEach, keys, pick, pickBy, isEmpty, find, has, omit, max, isEqual, isBoolean } from 'lodash';
import { COLORS } from '../../common/colors';
import { dropVersion, highlightTexts, isLoggedIn } from '../../common/utils';
import APIService from '../../services/APIService';
import RepoIcon from '../repos/RepoIcon';
import ConceptIcon from '../concepts/ConceptIcon';
import ConceptHome from '../concepts/ConceptHome';
import SearchResults from './SearchResults';
import SearchFilters from './SearchFilters'
import ReleaseSearchInfo from './ReleaseSearchInfo'
import { isReleaseOnlySearch } from './releaseOnlySearch'
import { getOwnerScopeFilters } from './ownerScopeFilters'
import { hasRetiredControl, isCollectionSearchURL, getRetiredRequestParams, getIncludeRetired, getRetiredCount, URL_PARAM as INCLUDE_RETIRED_URL_PARAM } from './retiredControl'
import { mergeFacets } from './facetMerge'
import { OperationsContext } from '../app/LayoutContext';
import ReferenceFilters from '../repos/ReferenceFilters'
import { EXCLUDE_FILTER_KEY } from './ResultConstants'
import DeleteReferencesDialog from '../collections/DeleteReferencesDialog'
import RemoveFromCollectionDialog from '../collections/RemoveFromCollectionDialog'
import TransformReferencesDialog from '../collections/TransformReferencesDialog'
import ConvertReferencesDialog from '../collections/ConvertReferencesDialog'
import { getTransformAddGroups, getTransformOutcome, getKeptReferencesLabel } from '../collections/referenceTransformUtils'
import { UNESCAPED } from '../collections/referenceConversionUtils'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined'
import GAService from '../../services/GAService'
import QuotaDialog from '../common/QuotaDialog'
import { getQuotaError } from '../common/quotaErrors'

const DEFAULT_LIMIT = 25;
const FILTERS_WIDTH = 250
const FILTERABLE_RESOURCES = ['concepts', 'mappings', 'repos', 'sources', 'collections', 'references']
const HIERARCHY_QUERY_PARAMS = ['q', 'page', 'limit', 'includeSearchMeta', 'onlyHierarchyRoot']

// Facet filters force the API onto the search-index path, which ignores onlyHierarchyRoot.
const toRequestParams = params => params.onlyHierarchyRoot ? pick(params, HIERARCHY_QUERY_PARAMS) : params

const getBaseCollectionUrl = url => {
  const match = (url || '').match(/^(.*\/collections\/[^/]+\/)(?:[^/]+\/)?(?:concepts|mappings|references)\/?$/)
  return match ? match[1] : dropVersion(url)
}

const getCollectionLookupUrl = url => (url || '').replace(/\/(concepts|mappings|references)\/?$/, '/')


const Search = props => {
  const { setAlert, contextRepo } = React.useContext(OperationsContext);
  const { t } = useTranslation()
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading] = React.useState(true)
  const [quotaError, setQuotaError] = React.useState(null)
  const [loadingFacets, setLoadingFacets] = React.useState(true)
  const [openFilters, setOpenFilters] = React.useState(has(props, 'defaultFiltersOpen') ? props.defaultFiltersOpen : true)
  const [input, setInput] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(DEFAULT_LIMIT);
  const [resource, setResource] = React.useState(false)
  const isHierarchySupported = Boolean(props.nested && props.repo?.hierarchy_root_url && (resource || props.resource) === 'concepts')
  const getDefaultDisplay = () => {
    if(!props.nested || !props.repo || (resource || props.resource) !== 'concepts')
      return undefined
    const savedDisplay = props.repo.meta?.display?.default_view
    const queryParams = new URLSearchParams(window.location.search)
    if(savedDisplay === 'hierarchy' && isHierarchySupported && !queryParams.has('filters') && !queryParams.has(INCLUDE_RETIRED_URL_PARAM) && !queryParams.get('q'))
      return 'hierarchy'
    if(savedDisplay === 'card' && !props.noCardDisplay)
      return 'card'
    return 'table'
  }
  const [defaultDisplay] = React.useState(getDefaultDisplay)
  const [result, setResult] = React.useState({})
  const [filters, setFilters] = React.useState({})
  const [selected, setSelected] = React.useState([])
  const [showItem, setShowItem] = React.useState(false)
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('score');
  const [isMatchOp, setIsMatchOp] = React.useState(false)
  const [deleteReferencesOpen, setDeleteReferencesOpen] = React.useState(false)
  const [deletingReferences, setDeletingReferences] = React.useState(false)
  const [referenceActionsAnchor, setReferenceActionsAnchor] = React.useState(null)
  const [transformReferencesOpen, setTransformReferencesOpen] = React.useState(false)
  const [convertReferencesOpen, setConvertReferencesOpen] = React.useState(false)
  const [transformingReferences, setTransformingReferences] = React.useState(false)
  const [bulkRemoveOpen, setBulkRemoveOpen] = React.useState(false)
  const [bulkRemoving, setBulkRemoving] = React.useState(false)
  const [hierarchy, setHierarchy] = React.useState(defaultDisplay === 'hierarchy')
  const defaultIncludeRetired = isCollectionSearchURL(props.url)
  const [includeRetired, setIncludeRetired] = React.useState(defaultIncludeRetired)
  // The latest list request and the latest facet request: an answer to an earlier one is dropped,
  // so a slow answer for the switch's previous setting can't overwrite the current counts
  const latestListRequest = React.useRef(0)
  const latestFacetRequest = React.useRef(0)
  // Set while a list request that should refresh the filter counts is waiting: if a newer one
  // (say a page-size change) replaces it before it answers, the newer one refreshes them instead
  const facetsDue = React.useRef(false)

  const didMount = React.useRef(false);
  const pendingRepoDefaultFilters = React.useRef(false)
  const isFilterable = _resource => FILTERABLE_RESOURCES.includes(_resource)
  const isHierarchyView = isHierarchySupported && hierarchy

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

  // A page that sizes the filter panel to its space (useDefaultFiltersOpen) changes this
  // as the window is resized, until the person opens or closes the panel themselves
  React.useEffect(() => {
    if(has(props, 'defaultFiltersOpen'))
      setOpenFilters(props.defaultFiltersOpen)
  }, [props.defaultFiltersOpen])

  const onDisplayChange = newDisplay => {
    if(isHierarchySupported) {
      const newHierarchy = newDisplay === 'hierarchy'
      if(newHierarchy !== hierarchy) {
        setHierarchy(newHierarchy)
        setPage(1)
        // defaults that held only a Retired filter leave no filters to write, so fetch as is
        const repoDefaultFilters = getRepoDefaultFilters(resource)
        const applyRepoDefaultFilters = !newHierarchy && pendingRepoDefaultFilters.current && !getFiltersFromQueryParams() && !isEmpty(repoDefaultFilters)
        if(!newHierarchy)
          pendingRepoDefaultFilters.current = false
        if(applyRepoDefaultFilters)
          history.replace(getCurrentLayoutURL(getQueryParams(input, 1, pageSize, repoDefaultFilters, orderBy, order, false)))
        else
          fetchResults(getQueryParams(input, 1, pageSize, filters, orderBy, order, newHierarchy), true)
      }
    }
    input && setTimeout(highlight, 100)
  }

  // _includeRetired: the switch's setting for this URL, the current one when not given
  const getCurrentLayoutURL = (params, _resource, _includeRetired) => {
    /*eslint no-unused-vars: 0*/
    const { q, page, limit, includeSearchMeta, sortAsc, sortDesc, onlyHierarchyRoot, ...filters} = params
    const isMatch = params['$match']
    delete filters['$match']
    _resource = _resource || resource || 'concepts'
    if(_resource === 'organizations')
      _resource = 'orgs'
    let url = '/search/?'
    if(q)
      url += `&q=${encodeURIComponent(q || '')}`
    if(_resource !== 'concepts')
      url += `&type=${_resource}`
    if(limit !== DEFAULT_LIMIT)
      url += `&limit=${limit}`
    if(page && page > 1)
      url += `&page=${page}`
    if(isMatch)
      url += '&$match=true'
    if(!isEmpty(filters)){
      if(_resource === 'references')
        url += Object.entries(filters)
        .map(([key, value]) => `&${key}=${String(value)}`)
        .join('');
      else
        url += `&filters=${encodeURIComponent(JSON.stringify(omit(filters, 'includeRetired')))}`
    }
    const __includeRetired = _includeRetired === undefined ? includeRetired : _includeRetired
    if(hasRetiredControl(_resource) && __includeRetired !== defaultIncludeRetired)
      url += `&${INCLUDE_RETIRED_URL_PARAM}=${__includeRetired}`
    if(sortDesc)
      url += `&sortDesc=${sortDesc}`
    else if(sortAsc)
      url += `&sortAsc=${sortAsc}`


    let queryStr = url.replace('?&', '?').split('?')[1]
    queryStr = queryStr ? '?' + queryStr : ''

    return window.location.pathname + queryStr;
  }


  const getFiltersFromQueryParams = () => {
    const queryParams = new URLSearchParams(window.location.search)
    let _filters = false
    if(resource === 'references') {
      _filters = {};
      ['cascade', 'versioning', 'repo_version', 'definition_type', 'inclusion_type'].forEach(param => {
        if(queryParams.has(param))
          _filters[param] = queryParams.get(param)
      })
    } else {
      _filters = queryParams.get('filters') || false
      if(_filters)
        _filters = JSON.parse(_filters)
      if(_filters) {
        try {
          _filters = getAppliedFacetFromQueryParam(_filters)
        } catch {
          _filters = {}
        }
      }
    }
    return _filters
  }

  const setQueryParamsInState = (mustFetch, includeRepoDefaultFilters) => {
    const queryParams = new URLSearchParams(window.location.search)
    const value = queryParams.get('q') || ''
    const isMatch = queryParams.get('$match') === 'true'
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
      _orderBy = _resource === 'users' ? 'username' : ''
      _order = 'asc'
    }
    let _fetch = mustFetch || false
    let _fetchFacets = mustFetch || isDiffFromPrevInput
    let _filters = getFiltersFromQueryParams()
    const _hasRetiredControl = hasRetiredControl(_resource)
    // The panel's Retired control replaces the Retired filter: one left in an old URL sets it instead
    let _includeRetired = _hasRetiredControl ? getIncludeRetired(window.location.search, _filters?.retired, defaultIncludeRetired) : includeRetired
    if(_hasRetiredControl && _filters?.retired) {
      // into the URL's own setting, which a new keyword or Searchlight link keeps where they drop `filters`
      const params = {...getQueryParams(value, _page, _pageSize, omit(_filters, 'retired'), _orderBy, _order), ...(isMatch ? {'$match': true} : {})}
      history.replace(getCurrentLayoutURL(params, _resource, _includeRetired))
      return
    }
    if(_filters) {
      _fetch = true
      _fetchFacets = true
    }
    // The saved defaults are list filters: opening in Hierarchy leaves them for the first switch to Table or Card.
    if(includeRepoDefaultFilters && !_filters && !isEmpty(props.repoDefaultFilters) && isHierarchyView)
      pendingRepoDefaultFilters.current = true
    else if(includeRepoDefaultFilters && !_filters && !isEmpty(props.repoDefaultFilters)) {
      // Write the defaults into the URL so it stays the single source of truth --
      // otherwise the next location.search-driven sync sees no `filters` param and
      // wipes these back out (e.g. as soon as the user performs a search).
      // The Retired control replaces a saved Retired filter (getRepoDefaultFilters leaves it out),
      // so defaults that held only that leave nothing to write.
      const repoDefaultFilters = getRepoDefaultFilters(_resource)
      if(!isEmpty(repoDefaultFilters)) {
        history.replace(getCurrentLayoutURL(getQueryParams(value, _page, _pageSize, repoDefaultFilters, _orderBy, _order), _resource, _includeRetired))
        return
      }
    }
    if(_hasRetiredControl && _includeRetired !== includeRetired) {
      setIncludeRetired(_includeRetired)
      _fetch = true
      _fetchFacets = true
    }
    if(!isEqual(isMatch, isMatchOp)) {
      setIsMatchOp(isMatch)
      _fetch = true
      // back from Matched Candidates the keyword may differ from the counts shown
      _fetchFacets = !isMatch
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

    if(_fetch) {
      if(isMatch)
        fetchMatchResults(getQueryParams(value, _page, _pageSize, _filters, _orderBy, _order), _includeRetired)
      else
        fetchResults(getQueryParams(value, _page, _pageSize, _filters, _orderBy, _order), _fetchFacets, _resource, _includeRetired)
    }
  }

  // A repository's saved default filters, less a Retired filter where the Retired control stands in
  // for it
  const getRepoDefaultFilters = _resource => {
    const repoDefaultFilters = getAppliedFacetFromQueryParam(props.repoDefaultFilters || {})
    return hasRetiredControl(_resource) ? omit(repoDefaultFilters, 'retired') : repoDefaultFilters
  }

  // The Retired control's setting goes on the list request and the facet request alike (see
  // getRetiredRequestParams). The hierarchy view sends no filters (see toRequestParams), so it
  // sends no setting either.
  const addRetiredParams = (params, _resource, _includeRetired) => {
    if(params.onlyHierarchyRoot || !hasRetiredControl(_resource))
      return params
    return {...params, ...getRetiredRequestParams(_includeRetired === undefined ? includeRetired : _includeRetired, isCollectionSearchURL(props.url))}
  }

  const getAppliedFacetFromQueryParam = filters => {
    const applied = {}
    forEach(filters, (value, field) => {
      applied[field] = {}
      if(isBoolean(value)) {
        applied[field][value.toString()] = true
      } else {
        let _value = value
        if(typeof _value === 'string' && _value.startsWith('!')) {
          applied[field][EXCLUDE_FILTER_KEY] = true
          _value = _value.slice(1)
        }
        forEach(_value.split(','), val => applied[field][val] = true)
      }
    })
    return applied
  }

  const getFacetQueryParam = filters => {
    if(resource === 'references')
      return filters
    const queryParam = {}
    forEach(
      filters, (value, field) => {
        const excluded = Boolean(value?.[EXCLUDE_FILTER_KEY])
        const joined = keys(pickBy(omit(value, EXCLUDE_FILTER_KEY), Boolean)).join(',')
        queryParam[field] = joined && excluded ? `!${joined}` : joined
      }
    )

    if(queryParam?.retired === 'true,false' || queryParam?.retired === 'false,true')
      queryParam['includeRetired'] = true

    return queryParam
  }


  const getQueryParams = (_input, _page, _pageSize, _filters, _orderBy, _order, _hierarchy) => {
    let params = {q: _input, page: _page || 1, limit: _pageSize, includeSearchMeta: true, ...getFacetQueryParam(_filters || {})}
    if(_orderBy) {
      if(_order === 'desc')
        params.sortDesc = _orderBy
      else
        params.sortAsc = _orderBy
    } else if(!_input) {
      params.sortAsc = ''
    }
    if(isMatchOp)
      params['$match'] = true
    if(isHierarchySupported && (_hierarchy === undefined ? hierarchy : _hierarchy)) {
      params.onlyHierarchyRoot = true
      // sort params force the API onto the search-index path, which ignores
      // onlyHierarchyRoot and doesn't return has_children
      delete params.sortAsc
      delete params.sortDesc
    }
    return params
  }

  const isSearchIndexQuery = () => {
    // Global concept and mapping searches always go to the search index, a keyword or not, so
    // they keep its 10,000-result window
    if(!props.nested && ['concepts', 'mappings'].includes(resource))
      return true
    // includeRetired (the Retired control) isn't a filter: it keeps the database path
    const params = omit(
      addRetiredParams(toRequestParams(getQueryParams(input, page, pageSize, filters, orderBy, order)), resource),
      ['page', 'limit', 'includeSearchMeta', 'onlyHierarchyRoot', 'includeRetired']
    )
    return Object.values(params).some(Boolean)
  }

  const handleResourceChange = (event, newTab) => {
    event.preventDefault()
    event.stopPropagation()
    const ownerScope = getAppliedFacetFromQueryParam(getOwnerScopeFilters(location.search, newTab))
    setFilters(ownerScope)

    history.push(getCurrentLayoutURL(getQueryParams(input, page, pageSize, ownerScope), newTab))
  }

  const getURL = __resource => {
    if(props.nested && props.url)
      return props.url
    return `/${__resource}/`
  }

  const recordSearchEvent = (__resource, params) => {
    GAService.recordActionEvent('Search', `search_${__resource}`, undefined, {
      term: params?.q || '',
      resource: __resource,
      page: params?.page || 1,
      page_size: params?.limit || DEFAULT_LIMIT,
      has_filters: !isEmpty(omit(params || {}, ['q', 'page', 'limit', 'includeSearchMeta', 'verbose', 'sortAsc', 'sortDesc', ...(hasRetiredControl(__resource) ? ['retired', 'includeRetired'] : [])]))
    })
  }

  const fetchResults = (params, facets=true, _resource=undefined, _includeRetired=undefined) => {
    params = toRequestParams(params)
    let __resource = _resource || resource
    if(!__resource)
      return
    params = addRetiredParams(params, __resource, _includeRetired)
    const requestId = ++latestListRequest.current
    // a search that changes the counts also drops a counts answer still on its way for the last one
    if(facets) {
      facetsDue.current = true
      ++latestFacetRequest.current
    }
    recordSearchEvent(__resource, params)
    setLoading(true)
    setResult(prev => {
      return {...prev, [__resource]: {...prev[__resource], results: []}}
    })
    if(['users', 'orgs', 'references'].includes(__resource))
      params.verbose = true
    if(__resource === 'references')
      params.includeResolvedRepoVersions = true
    if(__resource === 'repos') {
      // fills the latest version and content summary columns
      params.includeLatestReleasedVersion = true
      params.includeSummary = true
    }
    if(!params.sortAsc)
      delete params.sortAsc
    if(!params.sortDesc)
      delete params.sortDesc
    APIService.new().overrideURL(getURL(__resource)).get(null, null, params).then(response => {
      if(requestId !== latestListRequest.current)
        return
      if(response?.detail) {
        setAlert({message: response.detail, severity: 'error', duration: 5000})
        setLoading(false)
        // no counts come for this search, and the answer still on its way is for an earlier one
        if(facets || facetsDue.current) {
          facetsDue.current = false
          setLoadingFacets(false)
        }
        return
      }
      let total = parseInt(response?.headers?.num_found)
      const summaryCount = get(props.summary, `active_${__resource}`) || get(props.summary, `${__resource}.active`) || 0
      if(!params.q && props?.summary && props.nested && (total < summaryCount && total === 10000) && keys(params).every(el => ['includeSearchMeta', 'q', 'limit', 'page', 'pageSize', 'offset', 'sortAsc', 'sortDesc', 'display', 'type'].includes(el)))
        total = summaryCount
      const resourceResult = {total: total, pageSize: max([parseInt(response?.headers?.num_returned), params?.limit]), page: parseInt(response?.headers?.page_number), pages: parseInt(response?.headers?.pages), results: response?.data || []}
      // the filter counts stay the latest ones, which may have come in after this request went out
      setResult(prev => {
        return {...prev, [__resource]: {facets: {}, ...prev[__resource], ...resourceResult}}
      })
      setLoading(false)
      const fetchCounts = facets || facetsDue.current
      facetsDue.current = false
      if(fetchCounts && !params.onlyHierarchyRoot && isFilterable(__resource) && __resource !== 'references')
        fetchFacets(params, resourceResult, __resource)
    })
  }


  // _includeRetired: the Retired control's setting for this search, the current one when not given
  const fetchMatchResults = (params, _includeRetired=undefined) => {
    let __resource = 'concepts'
    // retired candidates only when the control is on: $match leaves them out without includeRetired
    if(_includeRetired === undefined ? includeRetired : _includeRetired)
      params = {...params, includeRetired: true}
    const requestId = ++latestListRequest.current
    recordSearchEvent(__resource, params)
    setLoading(true)
    setResult(prev => {
      return {...prev, [__resource]: {...prev[__resource], results: []}}
    })
    let _filters = omit(params, ['q', 'page', 'page_number', 'page_size', 'limit', 'offset', 'includeSearchMeta', 'verbose', 'order', 'orderBy', 'sortAsc', 'sortDesc', 'display', 'type', 'onlyHierarchyRoot', 'includeRetired'])
    const payload = {rows: [{name: params.q}], target_repo_url: contextRepo?.version_url, filter: _filters || {}}
    APIService.new().overrideURL('/concepts/$match/').post(payload, null, null, {verbose: true, includeSearchMeta: true, semantic: true, reranker: true, ...params}).then(response => {
      if(requestId !== latestListRequest.current)
        return
      const limitError = getQuotaError(response)
      if(limitError) {
        setQuotaError(limitError)
        setLoading(false)
        return
      }
      if(response?.detail) {
        setAlert({message: response.detail, severity: 'error', duration: 5000})
        setLoading(false)
        return
      }
      let __results = get(response, 'data.0.results') || []
      let total = __results.length + 10
      const resourceResult = {total: total, pageSize: params?.limit || 10, page: params?.page || params?.page_number || 1, pages: 2, results: __results || []}
      // the filter counts stay the latest ones, which may have come in after this request went out
      setResult(prev => {
        return {...prev, [__resource]: {facets: {}, ...prev[__resource], ...resourceResult}}
      })
      setLoading(false)
    })
  }

  const fetchFacets = (params, otherResults, _resource=undefined) => {
    setLoadingFacets(true)
    const __resource = _resource || resource
    const requestId = ++latestFacetRequest.current
    APIService.new().overrideURL(getURL(__resource)).get(null, null, {...omit(params, ['includeLatestReleasedVersion', 'includeSummary', 'includeReferences', 'includeResolvedRepoVersions']), facetsOnly: true}).then(response => {
      if(requestId !== latestFacetRequest.current)
        return
      const fields = response?.data?.facets?.fields || {}
      const appliedFilters = getFiltersFromQueryParams()
      // the counts keep the Retired setting (includeRetired sent) they were counted under
      const retiredScope = String(params.includeRetired)
      setResult(prev => {
        const previous = prev[__resource] || otherResults
        const facets = mergeFacets(previous?.facets, fields, appliedFilters, previous?.facetsRetiredScope === retiredScope)
        return {...prev, [__resource]: {...previous, facets, retiredCount: getRetiredCount(fields), facetsRetiredScope: retiredScope}}
      })
      setLoadingFacets(false)
    })
  }

  const onPageChange = (_page, _pageSize) => {
    history.push(getCurrentLayoutURL(getQueryParams(input, _page, _pageSize, filters, orderBy, order)))
  }

  const highlight = item => highlightTexts(item?.id ? [item] : result[resource]?.results || [], null, true)

  // newIncludeRetired: the Retired control's setting, applied with the filters (SearchFilters)
  const onFiltersChange = (newFilters, newIncludeRetired) => {
    // A new filter means a different result set -- the current page number is meaningless
    // against it (and may not even exist), so start over from the first page.
    history.push(getCurrentLayoutURL(getQueryParams(input, 1, pageSize, newFilters, orderBy, order), undefined, newIncludeRetired))
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
  // The Retired control stands in for the Retired filter. Kept as one object while the facets don't
  // change, as SearchFilters resets its unapplied choices when its filters prop changes.
  const facets = result[resource]?.facets
  const panelFacets = React.useMemo(() => (hasRetiredControl(resource) && facets) ? omit(facets, 'retired') : (facets || {}), [facets, resource])
  // With no results, a search with the Retired control keeps its panel (and its Filters button):
  // turning the control on, or taking a filter off, may bring some back
  const keepFiltersOnNoResults = hasRetiredControl(resource)
  const showFilters = openFilters && (!noResults || keepFiltersOnNoResults) && isFilterable(resource) && !isHierarchyView
  // Matched Candidates fetches no counts, so the control shows none there
  const retiredControl = hasRetiredControl(resource) ? {checked: includeRetired, defaultChecked: defaultIncludeRetired, count: isMatchOp ? undefined : result[resource]?.retiredCount} : undefined

  const getSearchResultsWidth = () => {
    let toSubtract = 0;
    if(showFilters)
      toSubtract = FILTERS_WIDTH
    return toSubtract ? `calc(100% - ${toSubtract}px)` : '100%'
  }

  const onSelectItem = value => {
    setSelected(value)
    props.onSelectItem ? props.onSelectItem(value) : null
  }

  const onShowItemSelect = item => {
    onSelectItem([])
    setShowItem(item || false)
    props.onShowItem && props.onShowItem(item || false)
  }

  const onOrderByChange = (newOrderByField, newOrder) => {
    history.push(getCurrentLayoutURL(getQueryParams(input, page, pageSize, filters, newOrderByField, newOrder)))
  }

  const isHead = props.nested ? props.repo?.version === 'HEAD' : false
  const isInCollection = props.url?.includes('/collections/')
  const collectionUrl = isInCollection ? getBaseCollectionUrl(props.url) : null
  const collectionLookupUrl = isInCollection ? getCollectionLookupUrl(props.url) : null

  const selectedReferenceObjects = resource === 'references' && selected.length > 0
    ? (result['references']?.results || []).filter(r => selected.includes(r.version_url || r.url || r.id))
    : []

  const onDeleteReferences = deleteBody => {
    const body = deleteBody || { ids: selectedReferenceObjects.map(r => r.id).filter(Boolean) }
    const deleteUrl = isInCollection ? `${collectionUrl}references/` : props.url
    setDeletingReferences(true)
    APIService.new().overrideURL(deleteUrl).delete(body).then(response => {
      setDeletingReferences(false)
      if(response?.status === 204 || response?.status === 200) {
        setDeleteReferencesOpen(false)
        onSelectItem([])
        setAlert({ severity: 'success', message: t('reference.remove_success') })
        fetchResults(getQueryParams(input, page, pageSize, filters, orderBy, order))
      } else {
        setAlert({ severity: 'error', message: response?.data?.detail || t('common.generic_error') })
      }
    })
  }

  const addTransformedReferences = group => {
    const data = {
      expressions: group.items.map(item => item.proposedExpression),
      include: group.include,
    }
    const body = { data }
    if(group.cascade) {
      data.cascade = group.cascade
      body.cascade = typeof group.cascade === 'string' ? group.cascade : group.cascade?.method || ''
    }

    return APIService.new().overrideURL(collectionUrl).appendToUrl('references/').put(body)
  }

  const onConvertedReferences = outcome => {
    setConvertReferencesOpen(false)
    onSelectItem([])
    if(outcome.queued) {
      setAlert({ severity: 'info', message: t('reference.convert_queued') })
      return
    }
    const failed = outcome.not_converted + outcome.rolled_back
    const message = failed ?
      t('reference.convert_partial', { converted: outcome.changed, failed }) :
      t('reference.convert_success', { count: outcome.changed })
    // references the API can't convert were never sent, so the count of them comes from the preview
    const unsupported = outcome.unsupported ? ` ${t('reference.convert_unsupported_note', { count: outcome.unsupported })}` : ''
    // the reasons are the API's text, translated where known: React escapes it, so i18next mustn't as well
    const reasons = outcome.reasons ?
      ` ${t('reference.convert_not_converted_reasons', { reasons: outcome.reasons, interpolation: { escapeValue: false } })}` :
      ''
    setAlert({
      severity: failed || outcome.unsupported ? 'warning' : 'success', message: message + reasons + unsupported,
    })
    fetchResults(getQueryParams(input, page, pageSize, filters, orderBy, order))
  }

  const onTransformReferences = async transformItems => {
    const groups = getTransformAddGroups(transformItems)
    setTransformingReferences(true)

    const addResults = await Promise.all(groups.map(group => addTransformedReferences(group).then(response => ({ group, response }))))
    const outcomes = addResults.map(({ group, response }) => ({ group, ...getTransformOutcome(response, group.items) }))
    const addedItems = outcomes.reduce((items, outcome) => [...items, ...outcome.addedItems], [])
    const addFailures = outcomes.reduce((count, outcome) => count + outcome.group.items.length - outcome.addedItems.length, 0)
    const unresolvedExpressions = outcomes.reduce((expressions, outcome) => [...expressions, ...outcome.unresolvedExpressions], [])
    // each group's own items, so an include and an exclude proposing one expression aren't confused
    const keptItems = outcomes.flatMap(outcome => outcome.group.items.filter(
      item => outcome.unresolvedExpressions.includes(item.proposedExpression)))
    // the expressions are the API's: React escapes them, so i18next mustn't as well
    const kept = { references: getKeptReferencesLabel(keptItems, unresolvedExpressions, t), ...UNESCAPED }

    if(unresolvedExpressions.length) {
      // Replacements saved but resolved to nothing are removed, so their originals stay as they were
      const rollbackResponse = await APIService.new()
        .overrideURL(collectionUrl)
        .appendToUrl('references/')
        .delete({ expressions: unresolvedExpressions })
      if(![200, 204].includes(rollbackResponse?.status)) {
        setTransformingReferences(false)
        setAlert({ severity: 'warning', message: t('reference.transform_rollback_failed', { count: unresolvedExpressions.length }) })
        fetchResults(getQueryParams(input, page, pageSize, filters, orderBy, order))
        return
      }
    }

    if(!addedItems.length) {
      setTransformingReferences(false)
      if(unresolvedExpressions.length) {
        // nothing was lost: the replacements were removed and every original kept
        setTransformReferencesOpen(false)
        onSelectItem([])
        setAlert({
          severity: 'warning',
          message: t('reference.transform_none_resolved', { count: unresolvedExpressions.length, ...kept }),
        })
        return
      }
      setAlert({ severity: 'error', message: t('reference.transform_no_references_changed') })
      return
    }

    const deleteResponse = await APIService.new()
      .overrideURL(collectionUrl)
      .appendToUrl('references/')
      .delete({ ids: addedItems.map(item => item.reference.id).filter(Boolean) })

    setTransformingReferences(false)
    const deleteSucceeded = [200, 204].includes(deleteResponse?.status)
    if(deleteSucceeded) {
      setTransformReferencesOpen(false)
      onSelectItem([])
      const transformedCount = addedItems.length
      setAlert({
        severity: addFailures ? 'warning' : 'success',
        message: addFailures ?
          t(
            unresolvedExpressions.length ? 'reference.transform_partial_unresolved' : 'reference.transform_partial_success',
            { transformed: transformedCount, failed: addFailures, unresolved: unresolvedExpressions.length, ...kept }
          ) :
          t('reference.transform_success', { count: transformedCount }),
      })
      fetchResults(getQueryParams(input, page, pageSize, filters, orderBy, order))
    } else {
      setAlert({
        severity: 'warning',
        message: t('reference.transform_delete_failed', { count: addedItems.length }),
      })
      fetchResults(getQueryParams(input, page, pageSize, filters, orderBy, order))
    }
  }

  const selectedRows = (result[resource]?.results || []).filter(r => selected.includes(r.version_url || r.url || r.id))

  const onBulkRemoveFromCollection = deleteBody => {
    const body = deleteBody || { ids: [] }
    setBulkRemoving(true)
    APIService.new().overrideURL(collectionUrl).appendToUrl('references/').delete(body).then(response => {
      setBulkRemoving(false)
      if(response?.status === 204 || response?.status === 200) {
        setBulkRemoveOpen(false)
        onSelectItem([])
        setAlert({ severity: 'success', message: t('reference.remove_success') })
        fetchResults(getQueryParams(input, page, pageSize, filters, orderBy, order))
      } else {
        setAlert({ severity: 'error', message: response?.data?.detail || t('common.generic_error') })
      }
    })
  }

  const bulkRemoveFromCollectionAction = isInCollection && isHead && ['concepts', 'mappings'].includes(resource) && isLoggedIn() && selected.length > 0 ? (
    <Button
      startIcon={<RemoveCircleOutlineIcon fontSize='inherit' />}
      variant='contained'
      size='small'
      color='error'
      sx={{textTransform: 'none', whiteSpace: 'nowrap', marginLeft: '8px'}}
      onClick={() => setBulkRemoveOpen(true)}
    >
      {t('reference.remove_from_collection')}
    </Button>
  ) : null

  const closeReferenceActions = () => setReferenceActionsAnchor(null)

  const referenceActionsControl = resource === 'references' && isLoggedIn() && selected.length > 0 ? (
    <Tooltip title={!isHead ? t('reference.not_available_in_version') : ''}>
      <span>
        <Button
          endIcon={<DownIcon fontSize='inherit' />}
          variant='contained'
          size='small'
          disabled={!isHead}
          sx={{textTransform: 'none', whiteSpace: 'nowrap'}}
          onClick={event => {setReferenceActionsAnchor(event.currentTarget)}}
        >
          {t('reference.actions')}
        </Button>
      </span>
    </Tooltip>
  ) : null

  React.useEffect(() => {
    setShowItem(props.showItem || false)
  }, [props.showItem])

  React.useEffect(() => {
    if(!props.nested)
      setShowItem(false)
  }, [location.search])

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
              {
                resource === 'references' ?
                  <ReferenceFilters
                    open={showFilters}
                    filters={result[resource]?.facets || {}}
                    onChange={onFiltersChange}
                    bgColor={searchBgColor}
                    appliedFilters={filters}
                    nested={props.nested}
                    heightToSubtract={props.filtersHeightToSubtract || 175}
                  />:
                  <SearchFilters
                    open={showFilters}
                    // Matched Candidates fetches no counts, so none are on their way
                    loading={loadingFacets && !isMatchOp}
                    allowExclude
                    resource={resource}
                    filters={panelFacets}
                    onChange={onFiltersChange}
                    bgColor={searchBgColor}
                    appliedFilters={filters}
                    nested={props.nested}
                    onSaveAsDefaultFilters={props.onSaveAsDefaultFilters ? filters => props.onSaveAsDefaultFilters(hasRetiredControl(resource) ? omit(getFacetQueryParam(filters), ['retired', 'includeRetired']) : getFacetQueryParam(filters)) : false}
                    repoDefaultFilters={getRepoDefaultFilters(resource)}
                    propertyFilters={props.propertyFilters}
                    propertyDefinition={props.propertyDefinition}
                    heightToSubtract={props.filtersHeightToSubtract || 175}
                    retiredControl={retiredControl}
                  />
              }
            </div>
            <div className='col-xs-9 split' style={{width: getSearchResultsWidth(), paddingRight: 0, paddingLeft: 0, float: 'right', height: '100%'}}>
              <div className='col-xs-12 padding-0' style={{height: '100%'}}>
                <SearchResults
                  display={defaultDisplay}
                  loading={loading}
                  noCardDisplay={props.noCardDisplay}
                  order={order}
                  orderBy={orderBy}
                  onOrderByChange={onOrderByChange}
                  nested={props.nested}
                  openFilters={showFilters}
                  appliedFilters={filters}
                  isFilterable={isFilterable(resource) && !isHierarchyView}
                  noResults={noResults}
                  searchedText={input}
                  bgColor={searchBgColor}
                  results={result[resource]}
                  resource={resource}
                  titleInfo={isReleaseOnlySearch({nested: props.nested, resource, isMatch: isMatchOp}) && <ReleaseSearchInfo />}
                  onPageChange={onPageChange}
                  selected={selected}
                  onSelect={newSelected => onSelectItem(newSelected)}
                  selectedToShow={showItem}
                  onShowItemSelect={onShowItemSelect}
                  onFiltersToggle={() => {
                    setOpenFilters(!openFilters)
                    props.onFiltersOpenChange?.(!openFilters)
                  }}
                  onDisplayChange={onDisplayChange}
                  resultContainerStyle={props.resultContainerStyle}
                  resultSize={props.resultSize}
                  excludedColumns={props.excludedColumns}
                  extraColumns={props.extraColumns}
                  properties={props.properties}
                  propertyDefinition={props.propertyDefinition}
                  propertyFilters={props.propertyFilters}
                  isMatch={isMatchOp}
                  retiredFilterApplied={Boolean(retiredControl) && includeRetired !== defaultIncludeRetired}
                  filtersAlwaysEnabled={keepFiltersOnNoResults}
                  searchIndexQuery={isSearchIndexQuery()}
                  hierarchySupported={isHierarchySupported}
                  baseURL={props.url}
                  toolbarControl={<>{props.toolbarControl}{referenceActionsControl}</>}
                  extraBulkActions={[bulkRemoveFromCollectionAction, props.extraBulkActions]}
                  onCreateSimilarClick={props.onCreateSimilarClick}
                  onCreateMappingClick={props.onCreateMappingClick}
                  fixedLeftControls={[props.fixedLeftControls]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        !props.nested &&
          <div className={'col-xs-5 padding-0' + (showItem ? ' split-appear' : '')} style={{marginLeft: '16px', width: showItem ? 'calc(41.66666667% - 16px)' : 0, backgroundColor: COLORS.primary.contrastText, borderRadius: '10px', height: showItem ? 'calc(var(--app-height) - 100px)' : 0, opacity: showItem ? 1 : 0}}>
            {
              showItem &&
                <ConceptHome concept={showItem} url={getLastSelectedURL()} onClose={() => setShowItem(false)} />
            }
          </div>
      }
      <Menu
        anchorEl={referenceActionsAnchor}
        open={Boolean(referenceActionsAnchor)}
        onClose={closeReferenceActions}
      >
        <MenuItem
          onClick={() => {
            closeReferenceActions()
            setTransformReferencesOpen(true)
          }}
        >
          <ListItemIcon>
            <TransformIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>{t('reference.transform_to_non_versioned')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeReferenceActions()
            setConvertReferencesOpen(true)
          }}
        >
          <ListItemIcon>
            <TransformIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>{t('reference.convert_resource_versioned')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeReferenceActions()
            setDeleteReferencesOpen(true)
          }}
        >
          <ListItemIcon>
            <DeleteForeverIcon fontSize='small' color='error' />
          </ListItemIcon>
          <ListItemText>{t('common.remove')}</ListItemText>
        </MenuItem>
      </Menu>
      <TransformReferencesDialog
        open={transformReferencesOpen}
        onClose={() => setTransformReferencesOpen(false)}
        onConfirm={onTransformReferences}
        references={selectedReferenceObjects}
        loading={transformingReferences}
      />
      {
        convertReferencesOpen &&
          <ConvertReferencesDialog
            open={convertReferencesOpen}
            onClose={() => setConvertReferencesOpen(false)}
            onConverted={onConvertedReferences}
            references={selectedReferenceObjects}
            collectionUrl={collectionUrl}
          />
      }
      <DeleteReferencesDialog
        open={deleteReferencesOpen}
        onClose={() => setDeleteReferencesOpen(false)}
        onConfirm={onDeleteReferences}
        references={selectedReferenceObjects}
        loading={deletingReferences}
      />
      <RemoveFromCollectionDialog
        open={bulkRemoveOpen}
        onClose={() => setBulkRemoveOpen(false)}
        onConfirm={onBulkRemoveFromCollection}
        resources={selectedRows}
        collectionUrl={collectionUrl}
        lookupCollectionUrl={collectionLookupUrl}
        loading={bulkRemoving}
      />
      <QuotaDialog
        open={Boolean(quotaError)}
        onClose={() => setQuotaError(null)}
        errorCode={quotaError?.errorCode}
        meter={quotaError?.meter}
        surface='tbv3_match'
      />
    </div>
  )
}
export default Search;
