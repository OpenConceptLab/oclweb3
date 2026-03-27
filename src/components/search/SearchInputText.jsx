import React from 'react';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/CancelOutlined';
import CloseIcon from '@mui/icons-material/Close';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

const SearchInputText = React.forwardRef(({ id, input, clearSearch, onClick, handleInputChange, handleKeyPress, autoFocus, isMatchOp, ...rest }, ref) => {
  return (
    <TextField
      id={id}
      autoFocus={autoFocus}
      className='rounded-input'
      value={input || ''}
      autoComplete="off"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            { isMatchOp ? <i className="fa-solid fa-diagram-project"></i> : <SearchIcon /> }
          </InputAdornment>
        ),
        endAdornment: (
          input &&
            <InputAdornment position="end">
              <IconButton size='small' onClick={clearSearch}>
                {autoFocus ? <CloseIcon style={{color: '#000'}} /> : <ClearIcon />}
              </IconButton>
            </InputAdornment>
        )
      }}
      {...rest}
      onClick={onClick}
      onChange={handleInputChange}
      onKeyDown={handleKeyPress}
      sx={
        autoFocus ?
          {
            padding: '12px',
            height: '60px',
            '.MuiInputBase-root': {
              padding: 0
            }
          } :
        {
          '& .Mui-focused': {
            boxShadow: '0 1px 1px 0 rgba(65,69,73,0.3), 0 1px 3px 1px rgba(65,69,73, 0.15)'
          }
        }
      }
      inputRef={ref}
    />
  )
})

export default SearchInputText
