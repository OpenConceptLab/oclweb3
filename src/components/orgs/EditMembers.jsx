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

  const onSubmit = () => {
    let totalCount = newMembers.length + deletedMembers.length
    let updated = 0
    newMembers.forEach(member => {
      APIService.new().overrideURL(org.url).appendToUrl(`members/${member.username}/`).put().then(() => {
        updated += 1
        if(updated === totalCount) {
          setAlert({message: t('org.updated_members'), severity: 'success', duration: 1000})
          fetchMembers()
        }
      })
    })
    deletedMembers.forEach(member => {
      APIService.new().overrideURL(org.url).appendToUrl(`members/${member.username}/`).delete().then(() => {
        updated += 1
        if(updated === totalCount) {
          setAlert({message: t('org.updated_members'), severity: 'success', duration: 1000})
          fetchMembers()
        }
      })
    })
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
