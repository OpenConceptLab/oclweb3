import React from 'react';
import { useTranslation } from 'react-i18next'
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import GlobalIcon from '@mui/icons-material/Language';
import debounce from 'lodash/debounce';
import filter from 'lodash/filter';
import map from 'lodash/map';
import reject from 'lodash/reject';
import { getCurrentUser, getCurrentUserOrgs } from '../../common/utils';
import APIService from '../../services/APIService';
import UserIcon from '../users/UserIcon';
import OrgIcon from '../orgs/OrgIcon';


const ORG_SEARCH_MIN_LENGTH = 2


const OwnerOption = ({ option, selected, ...rest }) => {
  return (
    <ListItem id={option.id} selected={selected} {...rest}>
      <ListItemIcon sx={{minWidth: 'auto', marginRight: '16px'}}>
        {option.icon}
      </ListItemIcon>
      <ListItemText primary={option.id} secondary={option.name} />
    </ListItem>
  )
}


const NamespaceDropdown = ({onChange, label, id, owner, backgroundColor, asOwner, forURLRegistry, size, disabled}) => {
  const { t } = useTranslation()
  const user = getCurrentUser()
  const [ownerOptions, setOwnerOptions] = React.useState([])
  const [searchedOrgs, setSearchedOrgs] = React.useState([])
  const [selectedSearchedOrg, setSelectedSearchedOrg] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const prepareOwnerOptions = () => {
      const global = {url: '/', id: t('url_registry.global_registry'), type: '', name: t('url_registry.global_registry'), icon: <GlobalIcon />, group: '' }
    let options = [
      {url: user?.url, id: user?.username, type: user?.type, name: user?.username, icon: <UserIcon authenticated user={user} logoClassName='user-img-xsmall' />, group: ''},
    ]
    if(!asOwner)
      options = [global, ...options]
    getCurrentUserOrgs().forEach(org => {
      options.push({url: org.url, id: org.id, type: org.type, name: org.name, icon: <OrgIcon noLink strict logoClassName='user-img-xsmall' org={org} />, group: t('org.my')})
    })
    setOwnerOptions(options)
  }

  React.useEffect(() => {
    prepareOwnerOptions()
  }, [])

  const toOrgOption = (org, searched) => ({
    url: org.url,
    id: org.id,
    type: org.type,
    name: org.name,
    icon: <OrgIcon noLink strict logoClassName='user-img-xsmall' org={org} />,
    group: t('org.orgs'),
    searched: searched
  })

  const searchOrgs = React.useMemo(
    () => debounce(searchStr => {
      APIService.orgs().get(null, null, {q: searchStr, limit: 25}).then(response => {
        setLoading(false)
        setSearchedOrgs(Array.isArray(response?.data) ? response.data : [])
      })
    }, 300),
    []
  )

  React.useEffect(() => () => searchOrgs.cancel(), [searchOrgs])

  const onInputChange = (event, value, reason) => {
    if(!forURLRegistry)
      return
    // 'reset'/'clear'/'blur' are MUI echoing the selected value back into the input (incl. on mount) -- not a user query
    if(reason !== 'input') {
      searchOrgs.cancel()
      setLoading(false)
      setSearchedOrgs([])
      return
    }
    if(value && value.length >= ORG_SEARCH_MIN_LENGTH) {
      setLoading(true)
      searchOrgs(value)
    } else {
      searchOrgs.cancel()
      setLoading(false)
      setSearchedOrgs([])
    }
  }

  // "My Organizations" (and the user/global entries) always win over a search hit for the same namespace
  const options = React.useMemo(() => {
    if(!forURLRegistry)
      return ownerOptions
    const pinned = selectedSearchedOrg ? [...ownerOptions, selectedSearchedOrg] : ownerOptions
    const pinnedURLs = map(pinned, 'url')
    return [...pinned, ...map(reject(searchedOrgs, org => pinnedURLs.includes(org.url)), org => toOrgOption(org, true))]
  }, [ownerOptions, searchedOrgs, selectedSearchedOrg, forURLRegistry])

  const filterOptions = (options, { inputValue }) => inputValue ? filter(options, option => option.searched || option.id?.toLowerCase()?.includes(inputValue.toLowerCase()) || option.name?.toLowerCase()?.includes(inputValue.toLowerCase())) : options;
  const selectedOption = options.find(value => value?.url === owner) || ''

  const handleChange = (event, item, ...rest) => {
    if(forURLRegistry && item?.searched)
      setSelectedSearchedOrg({...item, searched: false})
    onChange(event, item, ...rest)
  }

  return (
    <Autocomplete
      disabled={disabled}
      size={size || 'medium'}
      filterOptions={filterOptions}
      fullWidth
      disableClearable
      blurOnSelect
      id={id}
      options={options}
      value={selectedOption}
      loading={loading}
      onInputChange={onInputChange}
      groupBy={option => option.group}
      getOptionLabel={option => option.id || ''}
      isOptionEqualToValue={(option, value) => option?.url === value?.url}
      renderOption={(props, option, { selected }) => <OwnerOption key={option.url} option={option} dense={size === 'small'} {...props} selected={selected} />}
      onChange={handleChange}
      renderInput={
        params => (
          <TextField
            {...params}
            label={label}
            size={size || 'medium'}
            sx={{backgroundColor: backgroundColor || 'primary.contrastText'}}
            slotProps={ (selectedOption?.icon || loading) ? {
              ...params.slotProps,
              input: {
                ...params.slotProps?.input,
                startAdornment: selectedOption?.icon ? (
                  <InputAdornment position="start">
                    {selectedOption.icon}
                  </InputAdornment>
                ) : params.slotProps?.input?.startAdornment,
                endAdornment: (
                  <React.Fragment>
                    {loading ? <CircularProgress color="inherit" size={16} /> : null}
                    {params.slotProps?.input?.endAdornment}
                  </React.Fragment>
                )
              }
            } : params.slotProps}
          />
        )
      }
    />
  )
}

export default NamespaceDropdown
