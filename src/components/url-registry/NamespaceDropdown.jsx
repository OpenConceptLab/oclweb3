import React from 'react';
import { useTranslation } from 'react-i18next'
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import GlobalIcon from '@mui/icons-material/Language';
import filter from 'lodash/filter';
import { getCurrentUser, getCurrentUserOrgs } from '../../common/utils';
import { WHITE } from '../../common/constants'
import UserIcon from '../users/UserIcon';
import OrgIcon from '../orgs/OrgIcon';


const OwnerOption = ({ option, selected, ...rest }) => {
  return (
    <ListItem id={option.id} selected={selected} {...rest}>
      <ListItemIcon>
        {option.icon}
      </ListItemIcon>
      <ListItemText primary={option.id} secondary={option.name} />
    </ListItem>
  )
}


const NamespaceDropdown = ({onChange, label, id, owner, backgroundColor}) => {
  const { t } = useTranslation()
  const user = getCurrentUser()
  const [ownerOptions, setOwnerOptions] = React.useState([])
  const prepareOwnerOptions = () => {
    let options = [
      {url: '/', id: t('url_registry.global_registry'), type: '', name: t('url_registry.global_registry'), icon: <GlobalIcon />, group: '' },
      {url: user?.url, id: user?.username, type: user?.type, name: user?.username, icon: <UserIcon authenticated user={user} logoClassName='user-img-xsmall' />, group: ''},
    ]
    getCurrentUserOrgs().forEach(org => {
      options.push({url: org.url, id: org.id, type: org.type, name: org.name, icon: <OrgIcon noLink strict logoClassName='user-img-xsmall' org={org} />, group: t('org.my')})
    })
    setOwnerOptions(options)
  }

  React.useEffect(() => {
    prepareOwnerOptions()
  }, [])

  const filterOptions = (options, { inputValue }) => inputValue ? filter(options, option => option.id.toLowerCase().includes(inputValue.toLowerCase()) || option.name.toLowerCase().includes(inputValue.toLowerCase())) : options;

  return (
    <Autocomplete
      filterOptions={filterOptions}
      fullWidth
      disableClearable
      blurOnSelect
      id={id}
      options={ownerOptions}
      value={ownerOptions.find(value => value?.url === owner) || ''}
      groupBy={option => option.group}
      getOptionLabel={option => option.id || ''}
      renderOption={(props, option, { selected }) => <OwnerOption key={option.id} option={option} {...props} selected={selected} />}
      renderInput={params => <TextField {...params} label={label} sx={{backgroundColor: backgroundColor || WHITE}} />}
      onChange={onChange}
    />
  )
}

export default NamespaceDropdown
