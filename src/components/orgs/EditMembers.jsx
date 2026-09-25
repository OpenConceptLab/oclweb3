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

import Link from '../common/Link'
import { OperationsContext } from '../app/LayoutContext';

import { debounce } from 'lodash'
import APIService from '../../services/APIService';


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

const EditMembers = ({onClose, org, members, fetchMembers}) => {
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);

  const [input, setInput] = React.useState('')
  const [fetched, setFetched] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [users, setUsers] = React.useState([])
  const [selectedMembers, setSelectedMembers] = React.useState([])

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


  const newMembers = selectedMembers.filter(member => !members.map(user => user.username).includes(member.username))
  const deletedMembers = members.filter(member => !selectedMembers.map(user => user.username).includes(member.username))

  const updateMember = async (member, method) => {
    try {
      const response = await APIService.new()
        .overrideURL(org.url)
        .appendToUrl(`members/${member.username}/`)
        [method](null, null, {}, null, true)
      const error = response?.response || !response ? getErrorDetail(response) || t('common.generic_error') : null
      return {member, error}
    } catch(error) {
      return {member, error: getErrorDetail(error) || t('common.generic_error')}
    }
  }

  const getMemberError = (member, action, detail) => (
    t(`org.member_${action}_failed`, {user: member.username, detail})
  )

  const onSubmit = async () => {
    const failures = []

    const addResults = await Promise.all(newMembers.map(member => updateMember(member, 'put')))
    addResults.forEach(({member, error}) => {
      if(error)
        failures.push(getMemberError(member, 'add', error))
    })

    const removeResults = await Promise.all(deletedMembers.map(member => updateMember(member, 'delete')))
    removeResults.forEach(({member, error}) => {
      if(error)
        failures.push(getMemberError(member, 'remove', error))
    })

    if(failures.length) {
      setAlert({message: failures.join('\n'), severity: 'error', duration: 5000})
    } else if(newMembers.length || deletedMembers.length) {
      setAlert({message: t('org.updated_members'), severity: 'success', duration: 1000})
    }

    fetchMembers()
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
