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

  const initiateSearch = (event, global) => {
    performSearch(event, input, global)
      setOpen(false)
      setTimeout(blurInput, 1000)
  }

  const performSearch = (event, value, global) => {
    event.preventDefault()
    event.stopPropagation()

    props.onSearch ? props.onSearch(value) : moveToSearchPage(value, global)
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

  const moveToSearchPage = (value, global) => {
    if(!props.nested || global) {
      let _input = value || '';
      const queryParams = new URLSearchParams(location.search)
      const resourceType = queryParams.get('type') || 'concepts'
      const isGlobal = (location.pathname === '/' || global)
      let URL = isGlobal ? '/search/' : location.pathname
      if(_input) {
        queryParams.set('q', _input)
        if(isGlobal)
          queryParams.set('type', resourceType)
        URL += `?${queryParams.toString()}`
      } else if(isGlobal) {
        URL += `?type=${resourceType}`
      }
      history.push(URL.replace('?&', '?'));
    }
  }

  React.useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    setInput(queryParams.get('q') || '')
  }, [])


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

  return (
    <React.Fragment>
      <SearchInputText
        id='search-input'
        onClick={() => setOpen(true)}
        {...inputProps}
      />
      <SearchInputDrawer
        open={open}
        onClose={onClose}
        input={input || ''}
        initiateSearch={initiateSearch}
        inputProps={inputProps}
      />
    </React.Fragment>
  )
}

export default SearchInput;
