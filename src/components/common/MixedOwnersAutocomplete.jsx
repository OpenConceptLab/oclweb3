import React from 'react';
import { TextField, CircularProgress } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { get, debounce, map, orderBy, isEmpty } from 'lodash'
import APIService from '../../services/APIService';
import { getCurrentUser } from '../../common/utils';
import OwnerIcon from './OwnerIcon'

const MixedOwnersAutocomplete = ({onChange, label, id, required, minCharactersForSearch, scope}) => {
  const minLength = minCharactersForSearch || 2;
  const [input, setInput] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [fetched, setFetched] = React.useState(false)
  const [owners, setOwners] = React.useState([])
  const [selected, setSelected] = React.useState(undefined)
  const isSearchable = input && input.length >= minLength;
  const loading = Boolean(open && !fetched && isSearchable && isEmpty(owners))
  const user = getCurrentUser()

  const handleInputChange = debounce((event, value) => {
    setInput(value || '')
    setFetched(false)
    if(value && value.length >= minLength)
      fetchOwners(value)
  }, 500)

  const handleChange = (id, item) => {
    setSelected(item)
    onChange(id, item)
  }

  const getOwners = queryParams => APIService
        .user()
        .orgs()
        .get(null, null, queryParams || {})
        .then(response => {
          setOwners([
            {username: user.username, type: 'User', url: user.url, ownerType: 'user', name: user.username},
            ...map(response.data, org => ({id: org.id, type: org.type, url: org.url, ownerType: 'org', name: org.id}))
          ])
          setFetched(true)
        })

  const fetchOwners = searchStr => {
    const searchQuery = searchStr ? searchStr.replace(' (org)', '').replace(' (user)', '') : searchStr;
    const query = {limit: 1000, q: searchQuery}
    if(scope === 'user')
      getOwners(query)
    else {
      APIService.orgs().get(null, null, query).then(response => {
        const orgs = orderBy(
          map(response.data, org => ({...org, ownerType: 'org', name: org.id})),
          ['name']
        )
        APIService.users().get(null, null, query).then(response => {
          const users = orderBy(
            map(response.data, user => ({...user, ownerType: 'user', name: user.username})),
            'name'
          )
          setOwners(() => [...orgs, ...users])
          setFetched(true)
        })
      })
    }
  }

  return (
    <Autocomplete
      openOnFocus
      blurOnSelect
      open={open}
      onOpen={() => {
          setOpen(true);
      }}
      onClose={() => {
          setOpen(false);
      }}
      isOptionEqualToValue={(option, value) => option.id === get(value, 'id')}
      value={selected}
      id={id || 'owner'}
      options={owners}
      loading={loading}
      loadingText={loading ? 'Loading...' : `Type atleast ${minLength} characters to search`}
      noOptionsText={(isSearchable && !loading) ? "No results" : 'Start typing...'}
      getOptionLabel={option => option ? `${option.name} (${option.ownerType})` : ''}
      fullWidth
      required={required}
      onInputChange={handleInputChange}
      onChange={(event, item) => handleChange(id || 'owner', item)}
      renderInput={
        params => (
          <TextField
            {...params}
            value={input}
                  required
                  label={label || "Organization/User"}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
          />
        )
      }
      renderOption={
        (props, option) => (
          <li {...props} key={`${option.ownerType}-${option.name}`}>
            <span className='flex-vertical-center'>
              <span style={{marginRight: '8px', display: 'flex', alignItems: 'center', textAlign: 'left'}}>
                <OwnerIcon sx={{fontSize: '1rem'}} size='small' noTooltip {...option} />
              </span>
              {option.name}
            </span>
          </li>
        )
      }
    />
  );
}

export default MixedOwnersAutocomplete;
