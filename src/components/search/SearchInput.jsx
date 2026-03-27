import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import SearchInputText from './SearchInputText';
import SearchInputDrawer from './SearchInputDrawer';


const SearchInput = props => {
  const [input, setInput] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const history = useHistory();
  const location = useLocation()

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

  const initiateSearch = (event, global, isMatch) => {
    performSearch(event, input, global, isMatch)
    setOpen(false)
    setTimeout(blurInput, 1000)
  }

  const performSearch = (event, value, global, isMatch) => {
    event.preventDefault()
    event.stopPropagation()

    props.onSearch ? props.onSearch(value) : moveToSearchPage(value, global, isMatch)
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

  const moveToSearchPage = (value, global, isMatch) => {
    if(!props.nested || global) {
      let _input = value || '';
      const queryParams = new URLSearchParams(location.search)
      const resourceType = queryParams.get('type') || 'concepts'
      const isGlobal = (location.pathname === '/' || global)
      let URL = applyURLRules(isGlobal ? '/search/' : location.pathname)
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
    const queryParams = new URLSearchParams(location.search)
    setInput(queryParams.get('q') || '')
  }, [])

  React.useEffect(() => {
    if(location.pathname !== '/search/')
      setInput('')
  }, [location.pathname])


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
      />
      <SearchInputDrawer
        open={open}
        onClose={onClose}
        input={input || ''}
        initiateSearch={initiateSearch}
        inputProps={inputProps}
        isMatchOp={isMatchOp}
      />
    </React.Fragment>
  )
}

export default SearchInput;
