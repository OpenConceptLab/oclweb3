import React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import Link from '../common/Link'
import { OperationsContext } from '../app/LayoutContext';

import { debounce } from 'lodash'
import APIService from '../../services/APIService';
import { getCurrentUser } from '../../common/utils';
import { ROLE_ADMIN, ROLE_MEMBER, getMemberChanges, getMemberRole } from '../../common/orgRoles';


const normalizeErrorDetail = detail => {
  if(Array.isArray(detail))
    return detail.join(' ')
  if(detail && typeof detail === 'object')
    return Object.values(detail).flat().join(' ')
  return detail
}

const getErrorDetail = response => normalizeErrorDetail(
  response?.response?.data?.detail ||
  response?.response?.data?.error ||
  response?.response?.data?.__all__ ||
  response?.response?.data ||
  response?.message
)

const EditMembers = ({onClose, org, members, fetchOrg}) => {
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);

  const [input, setInput] = React.useState('')
  const [fetched, setFetched] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [users, setUsers] = React.useState([])
  const [selectedMembers, setSelectedMembers] = React.useState([])
  const [roles, setRoles] = React.useState({})

  const minLength = 2
  const isSearchable = input && input.length >= minLength;
  const loading = Boolean(open && !fetched && isSearchable && !users?.length)
  const handleInputChange = debounce((event, value) => {
    setInput(value || '')
    setFetched(false)
    if(value && value.length >= minLength)
      fetchUsers(value)
  }, 300)

  const fetchUsers = searchStr => {
    APIService.users()
      .get(null, null, {q: searchStr})
      .then(response => setUsers(response.data))
  }

  const getMemberDisplayName = member => {
    let name = member.username
    const memberName = member.name.trim()
    if(memberName && !['- -', '-'].includes(memberName))
      name += ` (${memberName})`
    return name
  }

  React.useEffect(() => {
    setSelectedMembers(members || [])
  }, [])


  const batches = getMemberChanges(members, selectedMembers, roles, getCurrentUser()?.username)
  const changes = batches.flat()
  const newMembers = changes.filter(({action}) => action === 'add').map(({member}) => member)
  const deletedMembers = changes.filter(({action}) => action === 'remove').map(({member}) => member)

  const updateMember = async ({member, action, role}) => {
    const send = data => APIService.new()
      .overrideURL(org.url)
      .appendToUrl(`members/${member.username}/`)
      [action === 'remove' ? 'delete' : 'put'](data, null, {}, null, true)
    try {
      const response = await send(role ? {role} : null)
      const error = response?.response || !response ? getErrorDetail(response) || t('common.generic_error') : null
      return {member, action, error}
    } catch(error) {
      return {member, action, error: getErrorDetail(error) || t('common.generic_error')}
    }
  }

  const getMemberError = (member, action, detail) => (
    t(`org.member_${action}_failed`, {user: member.username, detail})
  )

  const onSubmit = async () => {
    const results = []
    for(const batch of batches) {
      // A batch can rely on the ones before it, so a failure stops the rest, and saving again retries them.
      if(!results.some(({error}) => error))
        results.push(...await Promise.all(batch.map(updateMember)))
    }
    const failures = results.filter(({error}) => error).map(({member, action, error}) => getMemberError(member, action, error))

    if(failures.length) {
      setAlert({message: failures.join('\n'), severity: 'error', duration: 5000})
    } else if(results.length) {
      setAlert({message: t('org.updated_members'), severity: 'success', duration: 1000})
    }

    fetchOrg()
    if(!failures.length)
      onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      scroll='paper'
      maxWidth="lg"
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'surface.n92',
          borderRadius: '28px',
          width: '650px',
          minHeight: '400px',
          p: 0
        }
      }}
    >
      <DialogTitle sx={{p: 3, color: 'surface.dark', fontSize: '22px', textAlign: 'left'}}>
        {t('org.edit_members')} {t('common.of')} <b>{org.name}</b>
      </DialogTitle>
      <DialogContent style={{padding: '12px'}}>
        <Autocomplete
          multiple
          openOnFocus
          blurOnSelect
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          isOptionEqualToValue={(option, value) => option.username === value?.username}
          value={selectedMembers}
          options={users}
          loading={loading}
          loadingText={loading ? 'Loading...' : `Type atleast ${minLength} characters to search`}
          noOptionsText={(isSearchable && !loading) ? "No results" : 'Start typing...'}
          getOptionLabel={getMemberDisplayName}
          fullWidth
          onInputChange={handleInputChange}
          onChange={(event, items) => setSelectedMembers(items)}
          renderInput={
            params => <TextField
                        {...params}
                        label="Organization Members"
                        variant="outlined"
                        id='org-members-input'
                        fullWidth
                        slotProps={{
                          ...params.slotProps,
                          input: {
                            ...params.slotProps?.input,
                            endAdornment: (
                              <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.slotProps?.input?.endAdornment}
                              </React.Fragment>
                            ),
                          },
                        }}

                      />
          }
          sx={{'.MuiInputBase-root': {backgroundColor: 'surface.n92'}, marginBottom: '8px'}}
        />
        <List dense sx={{p: 0}}>
          {
            selectedMembers.map(member => (
              <ListItem
                key={member.username}
                disableGutters
                sx={{paddingRight: '128px !important'}}
                secondaryAction={
                  <Select
                    size='small'
                    variant='standard'
                    sx={{width: '112px', fontSize: '14px'}}
                    inputProps={{'aria-label': `${t('org.role')}: ${member.username}`}}
                    value={getMemberRole(member, members, roles)}
                    onChange={event => setRoles(prev => ({...prev, [member.username]: event.target.value}))}
                  >
                    <MenuItem value={ROLE_ADMIN}>{t('org.admin')}</MenuItem>
                    <MenuItem value={ROLE_MEMBER}>{t('org.member')}</MenuItem>
                  </Select>
                }
              >
                <ListItemText primary={getMemberDisplayName(member)} />
              </ListItem>
            ))
          }
        </List>
        {
          newMembers?.length > 0 &&
            <div className='col-xs-12' style={{marginTop: '4px'}}>
              {
                newMembers.map(member => (
                  <FormHelperText sx={{color: 'success.main'}} key={member.username}>
                    + {t('common.add')} {member.username}
                  </FormHelperText>
                ))
              }
          </div>
        }
        {
          deletedMembers?.length > 0 &&
            <div className='col-xs-12' style={{marginTop: '4px'}}>
              {
                deletedMembers.map(member => (
                  <FormHelperText sx={{color: 'error.main'}} key={member.username}>
                    - {t('common.remove')} {member.username}
                  </FormHelperText>
                ))
              }
            </div>
        }
      </DialogContent>
      <DialogActions>
        <Link sx={{fontSize: '14px'}} label={t('common.submit')} onClick={onSubmit} />
        </DialogActions>
    </Dialog>
  )
}
export default EditMembers
