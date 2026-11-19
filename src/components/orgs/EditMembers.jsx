import React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddMemberIcon from '@mui/icons-material/PersonAddOutlined';
import RemoveMemberIcon from '@mui/icons-material/PersonRemoveOutlined';

import Button from '../common/Button'
import Link from '../common/Link'
import UserIcon from '../users/UserIcon'
import { OperationsContext } from '../app/LayoutContext';
import LeaveOrgDialog from './LeaveOrgDialog'
import RemoveMemberDialog from './RemoveMemberDialog'

import { debounce } from 'lodash'
import APIService from '../../services/APIService';
import { getCurrentUserUsername, getErrorDetail } from '../../common/utils';
import { ROLES, ROLE_MEMBER, getRoleLabel, getRoleOptions, withoutMembers } from '../../common/orgRoles';


const RoleSelect = ({ value, options, label, disabled, onChange }) => {
  const { t } = useTranslation()
  return (
    <Select
      size='small'
      value={value}
      disabled={disabled}
      onChange={event => onChange(event.target.value)}
      inputProps={{'aria-label': label}}
      sx={{minWidth: '120px', fontSize: '14px', backgroundColor: 'surface.n92'}}
    >
      {
        options.map(role => (
          <MenuItem key={role} value={role} disabled={!ROLES.includes(role)} sx={{fontSize: '14px'}}>
            {getRoleLabel(role, t)}
          </MenuItem>
        ))
      }
    </Select>
  )
}

const EditMembers = ({onClose, org, members, onSaved}) => {
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);

  const [input, setInput] = React.useState('')
  const [fetched, setFetched] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [users, setUsers] = React.useState([])
  const [adding, setAdding] = React.useState(false)
  const [newMember, setNewMember] = React.useState(null)
  const [newRole, setNewRole] = React.useState(ROLE_MEMBER)
  const [removing, setRemoving] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const busy = React.useRef(false)
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

  const getMemberName = member => {
    const name = (member.name || '').trim()
    return ['- -', '-'].includes(name) ? '' : name
  }
  const getMemberDisplayName = member => getMemberName(member) ? `${member.username} (${getMemberName(member)})` : member.username

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

  // Each change goes to the API as soon as it's made, one at a time. Until the org and its members are fetched again,
  // every control is off, so that the next change doesn't start from a list the API has moved past. onDone runs with
  // whether the change was made, just before the controls come back on.
  const apply = async (change, onDone) => {
    if(busy.current)
      return
    busy.current = true
    setSaving(true)
    const { member, action, error } = await updateMember(change)
    if(error)
      setAlert({message: t(`org.member_${action}_failed`, {user: member.username, detail: error}), severity: 'error', duration: 5000})
    else
      setAlert({message: t('org.updated_members'), severity: 'success', duration: 1000})
    await onSaved({left: !error && action === 'remove' && member.username === username})
    onDone?.(!error)
    busy.current = false
    setSaving(false)
  }

  const onRoleChange = (member, role) => {
    if(role !== (member.role || ROLE_MEMBER))
      apply({member, action: 'role', role})
  }

  // A user picked to add who has since become a member, by this dialog or anyone else, is no longer picked: adding them
  // again would change their role
  const picked = withoutMembers(newMember ? [newMember] : [], members)[0] || null

  const closeAdd = () => {
    setAdding(false)
    setNewMember(null)
    setNewRole(ROLE_MEMBER)
  }
  const onAdd = () => picked && apply({member: picked, action: 'add', role: newRole}, done => done && closeAdd())

  const onRemove = () => removing && apply({member: removing, action: 'remove'}, () => setRemoving(null))

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
      <DialogTitle sx={{p: 3, color: 'surface.dark', fontSize: '22px', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span>{t('org.edit_members')} {t('common.of')} <b>{org.name}</b></span>
        {
          !adding &&
            <Button
              color='primary'
              icon={<AddMemberIcon fontSize='small' />}
              label={t('org.add_member')}
              onClick={() => setAdding(true)}
              disabled={saving}
              sx={{ml: 2, flexShrink: 0}}
            />
        }
      </DialogTitle>
      <DialogContent sx={{p: 0}}>
        {
          adding &&
            <Box sx={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, px: {xs: 2, sm: 3}, pt: 1, pb: 2}}>
              <Autocomplete
                openOnFocus
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                isOptionEqualToValue={(option, value) => option.username === value?.username}
                value={picked}
                options={withoutMembers(users, members)}
                loading={loading}
                loadingText={loading ? 'Loading...' : `Type atleast ${minLength} characters to search`}
                noOptionsText={(isSearchable && !loading) ? "No results" : 'Start typing...'}
                getOptionLabel={getMemberDisplayName}
                size='small'
                disabled={saving}
                onInputChange={(event, value, reason) => {
                  // Typing a new search drops the user picked before it, so that Add never sends someone the search no longer shows
                  if(reason === 'input')
                    setNewMember(null)
                  handleInputChange(event, value)
                }}
                onChange={(event, user) => setNewMember(user)}
                renderInput={
                  params => <TextField
                              {...params}
                              autoFocus
                              label={t('org.search_users')}
                              variant="outlined"
                              id='org-members-input'
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
                sx={{flex: '1 1 240px', '.MuiInputBase-root': {backgroundColor: 'surface.n92'}}}
              />
              <RoleSelect value={newRole} options={ROLES} label={t('org.role')} disabled={saving} onChange={setNewRole} />
              <Button color='primary' label={t('common.add')} onClick={onAdd} disabled={saving || !picked} />
              <Link sx={{fontSize: '14px', minWidth: 0}} label={t('common.cancel')} onClick={closeAdd} disabled={saving} />
            </Box>
        }
        <List sx={{p: 0}}>
          {
            (members || []).map(member => (
              <ListItem key={member.username} divider sx={{px: {xs: 2, sm: 3}, py: 1}}>
                <ListItemAvatar sx={{minWidth: 'auto', mr: 2, display: {xs: 'none', sm: 'block'}}}>
                  <UserIcon user={member} sx={{width: '40px', height: '40px'}} />
                </ListItemAvatar>
                <ListItemText
                  primary={getMemberName(member) || member.username}
                  secondary={getMemberName(member) ? member.username : undefined}
                  sx={{
                    '.MuiListItemText-primary': {color: 'surface.dark', fontSize: '14px'},
                    '.MuiListItemText-secondary': {color: 'default.light', fontSize: '12px'}
                  }}
                />
                <RoleSelect
                  value={member.role || ROLE_MEMBER}
                  options={getRoleOptions(member.role)}
                  label={`${t('org.role')}: ${member.username}`}
                  disabled={saving}
                  onChange={role => onRoleChange(member, role)}
                />
                <Tooltip title={t('org.remove_member')}>
                  <span>
                    <IconButton
                      aria-label={`${t('org.remove_member')}: ${member.username}`}
                      disabled={saving}
                      onClick={() => setRemoving(member)}
                      sx={{ml: 1}}
                    >
                      <RemoveMemberIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </ListItem>
            ))
          }
        </List>
      </DialogContent>
      <DialogActions sx={{px: 3, py: 2}}>
        <Link sx={{fontSize: '14px'}} label={t('common.close')} onClick={onClose} disabled={saving} />
      </DialogActions>
      {
        removing?.username === username ?
          <LeaveOrgDialog open org={org} onSubmit={onRemove} onClose={() => setRemoving(null)} pending={saving} /> :
          <RemoveMemberDialog member={removing} org={org} onSubmit={onRemove} onClose={() => setRemoving(null)} pending={saving} />
      }
    </Dialog>
  )
}
export default EditMembers
