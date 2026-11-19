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
import { getCurrentUserUsername, getErrorDetail } from '../../common/utils';
import { ROLES, getMemberChanges, getMemberRole, getRoleLabel } from '../../common/orgRoles';


const EditMembers = ({onClose, org, members, onSaved}) => {
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);

  const [input, setInput] = React.useState('')
  const [fetched, setFetched] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [users, setUsers] = React.useState([])
  const [selectedMembers, setSelectedMembers] = React.useState(() => members || [])
  const [saving, setSaving] = React.useState(false)
  const username = React.useMemo(getCurrentUserUsername, [])

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
    const memberName = (member.name || '').trim()
    if(memberName && !['- -', '-'].includes(memberName))
      name += ` (${memberName})`
    return name
  }

  const changes = getMemberChanges(members, selectedMembers, username).flat()
  const newMembers = changes.filter(({action}) => action === 'add').map(({member}) => member)
  const deletedMembers = changes.filter(({action}) => action === 'remove').map(({member}) => member)

  const updateMember = async ({member, action, role}) => {
    try {
      const response = await APIService.new()
        .overrideURL(org.url)
        .appendToUrl(`members/${member.username}/`)
        [action === 'remove' ? 'delete' : 'put'](role ? {role} : null, null, {}, null, true)
      // Only a 2xx made the change: a refusal, or an error with no response at all, didn't
      const done = response?.status >= 200 && response?.status < 300
      return {member, action, error: done ? null : getErrorDetail(response) || t('common.generic_error')}
    } catch(error) {
      return {member, action, error: getErrorDetail(error) || t('common.generic_error')}
    }
  }

  const onSubmit = async () => {
    if(saving)
      return
    setSaving(true)
    const results = []
    // One request at a time, in order, so that the API's last-admin check sees each change before the next. A change can
    // rely on the ones before it, so a failure stops the rest, and saving again retries them.
    for(const change of changes) {
      const result = await updateMember(change)
      results.push(result)
      if(result.error)
        break
    }
    const failures = results.filter(({error}) => error).map(({member, action, error}) => (
      t(`org.member_${action}_failed`, {user: member.username, detail: error})
    ))

    if(failures.length) {
      setAlert({message: failures.join('\n'), severity: 'error', duration: 5000})
    } else if(results.length) {
      setAlert({message: t('org.updated_members'), severity: 'success', duration: 1000})
    }

    const own = results.filter(({member}) => member.username === username)
    // The dialog stays up, with Submit off, until the members are fetched again, so that neither saving again nor
    // reopening it starts from a list the API has moved past
    if(results.length)
      await onSaved({
        left: own.some(({action, error}) => !error && action === 'remove'),
        // Tried, not only done: a request that lost its response may still have changed the role
        ownRoleChanged: own.some(({action}) => action !== 'remove')
      })
    setSaving(false)
    if(!failures.length)
      onClose()
  }

  return (
    <Dialog
      open
      onClose={saving ? undefined : onClose}
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
          disabled={saving}
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
            selectedMembers.map(member => {
              const memberRole = getMemberRole(member, members)
              return (
                <ListItem key={member.username} disableGutters>
                  <ListItemText primary={getMemberDisplayName(member)} />
                  <Select
                    size='small'
                    variant='standard'
                    sx={{width: '112px', fontSize: '14px'}}
                    inputProps={{'aria-label': `${t('org.role')}: ${member.username}`}}
                    disabled={saving}
                    value={memberRole}
                    onChange={event => setSelectedMembers(prev => prev.map(
                      selected => selected.username === member.username ? {...selected, role: event.target.value} : selected
                    ))}
                  >
                    {
                      // A role this app doesn't know yet shows, but can't be picked
                      !ROLES.includes(memberRole) &&
                        <MenuItem disabled value={memberRole}>{getRoleLabel(memberRole, t)}</MenuItem>
                    }
                    {ROLES.map(role => <MenuItem key={role} value={role}>{getRoleLabel(role, t)}</MenuItem>)}
                  </Select>
                </ListItem>
              )
            })
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
        <Link sx={{fontSize: '14px'}} label={t('common.submit')} onClick={onSubmit} disabled={saving} />
        </DialogActions>
    </Dialog>
  )
}
export default EditMembers
