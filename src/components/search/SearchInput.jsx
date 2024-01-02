import React from 'react';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/CancelOutlined';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { useHistory, useLocation } from 'react-router-dom';


const SearchInput = props => {
  const [input, setInput] = React.useState('')
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

    if (event.key === 'Enter')
      performSearch(event, input)

    return false
  }

  const performSearch = (event, value) => {
    event.preventDefault()
    event.stopPropagation()

    props.onSearch ? props.onSearch(value) : moveToSearchPage(value)
  }

  const clearSearch = event => {
    event.persist()
    setInput('')
    performSearch(event, '')
  }

  const moveToSearchPage = value => {
    if(!props.nested) {
      let _input = value || '';
      const queryParams = new URLSearchParams(location.search)
      const resourceType = queryParams.get('type') || 'concepts'
      let URL = location.pathname === '/' ? '/search/' : location.pathname
      if(_input) {
        queryParams.set('q', _input)
        queryParams.set('type', resourceType)
        URL += `?${queryParams.toString()}`
      } else {
        URL += `?type=${resourceType}`
      }
      history.push(URL.replace('?&', '?'));
    }
  }

  React.useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    setInput(queryParams.get('q') || '')
  }, [])

  return (
    <TextField
      className='rounded-input'
      value={input || ''}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          input &&
            <InputAdornment position="end">
              <IconButton size='small' onClick={clearSearch}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
        )
      }}
      {...props}
      onChange={handleInputChange}
      onKeyPress={handleKeyPress}
      sx={{
        '& .Mui-focused': {
          boxShadow: '0 1px 1px 0 rgba(65,69,73,0.3), 0 1px 3px 1px rgba(65,69,73, 0.15)'
        }
      }}
    />
  )
}

export default SearchInput;
