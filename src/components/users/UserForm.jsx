import React from 'react';
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom';
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import APIService from '../../services/APIService'
import CommonTextField from '../common/CommonTextField';
import { OperationsContext } from '../app/LayoutContext';
import { refreshCurrentUserCache, getCurrentUser } from '../../common/utils'

const UserForm = ({ user }) => {
  const sessionUser = getCurrentUser()
  const history = useHistory()
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);
  const [firstName, setFirstName] = React.useState(user.first_name)
  const [lastName, setLastName] = React.useState(user.last_name)
  const [email, setEmail] = React.useState(user.email)
  const [company, setCompany] = React.useState(user.company)
  const [location, setLocation] = React.useState(user.location)
  const [website, setWebsite] = React.useState(user.website)

  const getPayload = () => ({
    first_name: firstName,
    last_name: lastName,
    company: company,
    location: location,
    website: website
  })

  const onSubmit = () => {
    const form = document.getElementById('user-form')
    const isValid = form.reportValidity()
    if(isValid) {
      APIService.users(user.username).put(getPayload()).then(response => {
        if(response.status === 200) {
          const callback = () => {
            history.push(user.url)
            setAlert({duration: 2000, message: t('user.profile_update_success'), severity: 'success'})
          }
          if(sessionUser.username === user.username)
            refreshCurrentUserCache(() => {})
          callback()
        } else
          setAlert({duration: 2000, message: t('user.profile_update_failure'), severity: 'error'})
      })
    }
  }

  return (
    <div className='col-xs-12' style={{padding: '16px'}}>
      <Box className='col-xs-12 padding-0' sx={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
        <Typography component='h1' sx={{display: 'inline-block', fontSize: '28px', lineHeight: 1.29, letterSpacing: 'normal', color: 'surface.dark' }}>
        {t('user.edit_my_profile')}
      </Typography>
        <Button onClick={onSubmit} variant='contained' color='primary' sx={{textTransform: 'none'}}>
          {t('common.save')}
        </Button>
        </Box>
      <form id='user-form'>
        <div className='col-xs-12' style={{marginTop: '24px', padding: '16px', borderRadius: '10px', border: '1px solid rgba(0, 0, 0, 0.12)'}}>
          <Typography component='h3' sx={{fontSize: '16px', fontWeight: 'bold', lineHeight: 1.5, letterSpacing: '0.15px', color: ''}}>
            {t('user.name_and_description')}
          </Typography>
          <div className='col-xs-12' style={{padding: '16px', display: 'flex', alignItems: 'center'}}>
            <CommonTextField
              required
              variant='standard'
              label={t('user.first_name')}
              value={firstName}
              onChange={event => setFirstName(event.target.value || '')}
              sx={{width: '30%', maxWidth: '210px'}}
            />
            <CommonTextField
              required
              variant='standard'
              label={t('user.last_name')}
              value={lastName}
              onChange={event => setLastName(event.target.value || '')}
              sx={{width: '30%', maxWidth: '210px', marginLeft: '16px'}}
            />
            <Typography component="div" sx={{width: '20%', maxWidth: '200px', fontSize: '12px', marginLeft: '16px'}}>
              Your URL will be: /users/<b>{user.username}</b>/
            </Typography>
          </div>
          <div className='col-xs-12' style={{padding: '16px', display: 'flex', alignItems: 'center'}}>
            <CommonTextField
              required
              disabled
              variant='standard'
              label={t('user.email_address')}
              value={email}
              onChange={event => setEmail(event.target.value || '')}
              sx={{width: '70%', maxWidth: '460px'}}
            />
          </div>
          <div className='col-xs-12' style={{padding: '16px', display: 'flex', alignItems: 'center'}}>
            <CommonTextField
              variant='standard'
              label={t('user.company')}
              value={company}
              onChange={event => setCompany(event.target.value || '')}
              sx={{width: '30%', maxWidth: '210px'}}
            />
            <CommonTextField
              variant='standard'
              label={t('user.location')}
              value={location}
              onChange={event => setLocation(event.target.value || '')}
              sx={{width: '30%', maxWidth: '210px', marginLeft: '16px'}}
            />
            <CommonTextField
              variant='standard'
              label={t('user.website')}
              value={website}
              onChange={event => setWebsite(event.target.value || '')}
              sx={{width: '30%', maxWidth: '210px', marginLeft: '16px'}}
              type='url'
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default UserForm
