import React from 'react';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { useHistory } from 'react-router-dom';


const SearchInput = props => {
  const [input, setInput] = React.useState('')
  const history = useHistory();

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
      const urlParts = window.location.hash.split('?')
      const queryString = urlParts[1]
      const pathName = urlParts[0].replace('#', '')
      const queryParams = new URLSearchParams(queryString)
      const resourceType = queryParams.get('type')
      let URL = '/search/'
      if(!_input) {
        if(resourceType)
          URL += `?type=${resourceType}`
      } else {
        if(pathName === '/search/') {
          queryParams.set('q', _input)
          URL += `?${queryParams.toString()}`
        } else {
          URL +=`?q=${_input}`;
          if(resourceType)
            URL += `&type=${resourceType}`
        }
      }
      history.push(URL);
    }
  }

  React.useEffect(() => {
    const urlParts = window.location.hash.split('?')
    const queryString = urlParts[1]
    const queryParams = new URLSearchParams(queryString)
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
    />
  )
}

export default SearchInput;
