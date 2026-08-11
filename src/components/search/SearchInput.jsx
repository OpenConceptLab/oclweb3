import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchInputText from './SearchInputText';
import SearchInputDrawer from './SearchInputDrawer';
import { BROWSE_CONFIG, FACET_FILTER_CONFIG } from './browseConfig';


const SearchInput = props => {
  const { t } = useTranslation()
  const [input, setInput] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [activeFilterType, setActiveFilterType] = React.useState(null)
  const [activeFilterValue, setActiveFilterValue] = React.useState(null)
  const history = useHistory();
  const location = useLocation()

  const getActiveFilterLabelKey = () => BROWSE_CONFIG[activeFilterType]?.labelKey || FACET_FILTER_CONFIG[activeFilterType]?.labelKey

  const onRemoveFilter = event => {
    event?.stopPropagation?.()
    setActiveFilterType(null)
    setActiveFilterValue(null)
  }

  // Class/Map Type filters can involve a full page reload (see SearchInputDrawer's
  // navigateToFacetFilter), which discards all component state. Re-derive both the active
  // facet chip AND the typed term from the URL itself so they survive that reload, matching
  // how org/repo/user selections already persist across a soft navigation. This subsumes the
  // old mount-only "read q" and "clear input off /search/" effects - both are folded in here
  // so there's a single source of truth for `input` instead of two effects fighting over it.
  React.useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const filtersParam = queryParams.get('filters')
    let urlFacetType = null
    let urlFacetTerm = null
    if(filtersParam) {
      try {
        const parsed = JSON.parse(filtersParam)
        if(parsed.conceptClass) {
          urlFacetType = 'conceptClass'
          urlFacetTerm = parsed.conceptClass
        } else if(parsed.mapType) {
          urlFacetType = 'mapType'
          urlFacetTerm = parsed.mapType
        }
      } catch(e) { /* malformed filters param, ignore */ }
    }

    if(urlFacetType) {
      setActiveFilterType(urlFacetType)
      setActiveFilterValue(urlFacetTerm || null)
    } else if(activeFilterType === 'conceptClass' || activeFilterType === 'mapType') {
      setActiveFilterType(null)
      setActiveFilterValue(null)
    }

    // The typed term always mirrors whatever `q` is in the current URL - true for the global
    // search results page, a plain repo-context keyword search, and a facet-filtered search
    // alike. Restricting this to only the `/search/` page used to wipe a repo-context search
    // term back to empty right after applying it.
    setInput(queryParams.get('q') || '')
  }, [location.pathname, location.search])

  const handleInputChange = event => {
    const value = event.target.value
    setInput(value)

    if(props.onChange)
      props.onChange(value)
  }

  const handleKeyPress = event => {
    event.persist()

    if (event.key === 'Enter') {
      initiateSearch(event)
    }

    return false
  }

  const initiateSearch = (event, global, isMatch, forcedType) => {
    performSearch(event, input, global, isMatch, forcedType)
    setOpen(false)
    setTimeout(blurInput, 1000)
  }

  const performSearch = (event, value, global, isMatch, forcedType) => {
    event.preventDefault()
    event.stopPropagation()

    props.onSearch ? props.onSearch(value) : moveToSearchPage(value, global, isMatch, forcedType)
  }

  const blurInput = () => {
    const el = getInputElement()
    if(el)
      el.blur()
  }

  const getInputElement = () => document.getElementById('search-input')

  const clearSearch = event => {
    event.persist()
    setInput('')
  }

  const applyURLRules = URL => {
    if((URL.startsWith('/orgs/') || URL.startsWith('/users/')) && !URL.includes('/sources/') && !URL.includes('/collections/') && !URL.includes('/repos/') && !URL.endsWith('/repos')) {
      if(URL.includes('/edit'))
        URL = URL.replace('/edit', '/repos')
      else
        URL += 'repos/'
    }
    return URL
  }

  const moveToSearchPage = (value, global, isMatch, forcedType) => {
    if(!props.nested || global) {
      let _input = value || '';
      const queryParams = new URLSearchParams(location.search)
      const resourceType = forcedType || queryParams.get('type') || 'concepts'
      const isGlobal = (location.pathname === '/' || global)
      let URL = applyURLRules(isGlobal ? '/search/' : location.pathname)
      // A facet filter (Class/Map Type) from a prior Searchlight search is unrelated to
      // this new query - drop it so it doesn't silently carry over.
      queryParams.delete('filters')
      if(isMatch)
        queryParams.set('$match', true)
      else
        queryParams.delete('$match')
      if(_input) {
        queryParams.set('q', _input)
        if(isGlobal)
          queryParams.set('type', resourceType)
        URL += `?${queryParams.toString()}`
      } else if(isGlobal || queryParams.get('type')) {
        URL += `?type=${resourceType}`
      }

      history.push(URL.replace('?&', '?'));
    }
  }

  React.useEffect(() => {
    if(props.nested)
      return

    const onGlobalKeyDown = event => {
      if((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', onGlobalKeyDown)
    return () => document.removeEventListener('keydown', onGlobalKeyDown)
  }, [props.nested])

  const inputProps = {
    input: input || '',
    clearSearch: clearSearch,
    handleInputChange: handleInputChange,
    handleKeyPress: handleKeyPress,
    ...props
  }

  const onClose = () => {
    setOpen(false)
    setTimeout(blurInput, 50)
  }

  const checkIsMatchOp = () => new URLSearchParams(location.search).get('$match') === 'true'
  const isMatchOp = checkIsMatchOp()

  return (
    <React.Fragment>
      <SearchInputText
        id='search-input'
        onClick={() => setOpen(true)}
        isMatchOp={isMatchOp}
        {...inputProps}
        filterChip={activeFilterType ? {label: activeFilterValue ? `${t(getActiveFilterLabelKey())}: ${activeFilterValue}` : t(getActiveFilterLabelKey()), onRemove: onRemoveFilter} : undefined}
      />
      <SearchInputDrawer
        open={open}
        onClose={onClose}
        input={input || ''}
        initiateSearch={initiateSearch}
        inputProps={inputProps}
        isMatchOp={isMatchOp}
        activeFilterType={activeFilterType}
        setActiveFilterType={setActiveFilterType}
        activeFilterValue={activeFilterValue}
        setActiveFilterValue={setActiveFilterValue}
        setInput={setInput}
      />
    </React.Fragment>
  )
}

export default SearchInput;
