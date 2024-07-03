import React from 'react';
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom';
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import APIService from '../../services/APIService'
import { OperationsContext } from '../app/LayoutContext';
import { LANGUAGES } from '../../common/constants';
import { refreshCurrentUserCache, getCurrentUser, getResetPasswordURL } from '../../common/utils'
import Link from '../common/Link'
import Button from '../common/Button'

const UserForm = ({ user }) => {
  const sessionUser = getCurrentUser()
  const history = useHistory()
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);
  const [firstName, setFirstName] = React.useState(user.first_name || '')
  const [lastName, setLastName] = React.useState(user.last_name || '')
  const [email, setEmail] = React.useState(user.email)
  const [company, setCompany] = React.useState(user.company || '')
  const [location, setLocation] = React.useState(user.location || '')
  const [website, setWebsite] = React.useState(user.website || '')
  const [preferredLocale, setPreferredLocale] = React.useState(user.preferred_locale || 'en')

  const getPayload = () => ({
    first_name: firstName,
    last_name: lastName,
    company: company,
    location: location,
    website: website,
    preferred_locale: preferredLocale || 'en'
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
      <form id='user-form'>
        <div className='col-xs-12' style={{padding: '24px', borderRadius: '10px', border: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: '#FFF'}}>
          <Typography component='h3' sx={{fontSize: '16px', fontWeight: 'bold', lineHeight: 1.5, letterSpacing: '0.15px'}}>
            {t('user.name_and_description')}
          </Typography>
          <div className='col-xs-12' style={{padding: '24px 0 0 0', display: 'flex', alignItems: 'center'}}>
            <TextField
              required
              size='small'
              variant='outlined'
              label={t('user.first_name')}
              value={firstName}
              onChange={event => setFirstName(event.target.value || '')}
              sx={{width: '35%'}}
            />
            <TextField
              required
              size='small'
              variant='outlined'
              label={t('user.last_name')}
              value={lastName}
              onChange={event => setLastName(event.target.value || '')}
              sx={{width: '35%', marginLeft: '10px'}}
            />
            <Typography component="div" sx={{width: '30%', fontSize: '12px', marginLeft: '16px'}}>
              Your URL will be: {window.location.origin}/#/users/<b>{user.username}</b>/
            </Typography>
          </div>
          <div className='col-xs-12' style={{padding: '24px 0 0 0', display: 'flex', alignItems: 'center'}}>
            <TextField
              size='small'
              required
              disabled
              variant='outlined'
              label={t('user.email_address')}
              value={email}
              onChange={event => setEmail(event.target.value || '')}
              sx={{width: '70%'}}
            />
          </div>
          <div className='col-xs-12' style={{padding: '24px 0 0 0', display: 'flex', alignItems: 'center'}}>
            <TextField
              size='small'
              variant='outlined'
              label={t('user.company_name')}
              value={company}
              onChange={event => setCompany(event.target.value || '')}
              sx={{width: '35%'}}
            />
            <TextField
              size='small'
              variant='outlined'
              label={t('user.website')}
              value={website}
              onChange={event => setWebsite(event.target.value || '')}
              sx={{width: '35%', marginLeft: '10px'}}
              InputProps={{startAdornment: <InputAdornment position="start">{'https://'}</InputAdornment>}}
            />
          </div>
          <div className='col-xs-12' style={{padding: '24px 0 0 0', display: 'flex', alignItems: 'center'}}>
            <TextField
              size='small'
              variant='outlined'
              label={t('user.location')}
              value={location}
              onChange={event => setLocation(event.target.value || '')}
              sx={{width: '70%'}}
            />
          </div>
        </div>
        <div className='col-xs-12' style={{marginTop: '16px', padding: '24px', borderRadius: '10px', border: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: '#FFF'}}>
          <Typography component='h3' sx={{fontSize: '16px', fontWeight: 'bold', lineHeight: 1.5, letterSpacing: '0.15px'}}>
            {t('user.login_and_security')}
          </Typography>
          <div className='col-xs-12' style={{padding: '24px 0 0 0', display: 'flex', alignItems: 'center'}}>
            <TextField
              required
              size='small'
              variant='outlined'
              label={t('user.username')}
              value={sessionUser?.username}
              disabled
              sx={{width: '35%'}}
            />
          </div>
          <div className='col-xs-12' style={{padding: '24px 0 0 0', display: 'flex', alignItems: 'center'}}>
            <TextField
              required
              size='small'
              variant='outlined'
              label={t('user.password')}
              value='**********'
              type='password'
              disabled
              sx={{width: '35%'}}
            />
            <Link
              label={t('auth.update_password')}
              href={getResetPasswordURL()}
              sx={{marginLeft: '24px', fontWeight: 'bold', fontSize: 'inherit'}}
            />
          </div>
        </div>
        <div className='col-xs-12' style={{marginTop: '16px', padding: '24px', borderRadius: '10px', border: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: '#FFF'}}>
          <Typography component='h3' sx={{fontSize: '16px', fontWeight: 'bold', lineHeight: 1.5, letterSpacing: '0.15px'}}>
            {t('common.language')}
          </Typography>
          <div className='col-xs-12' style={{padding: '24px 0 0 0', display: 'flex', alignItems: 'center'}}>
            <TextField
              select
              label={t('common.language')}
              defaultValue={preferredLocale}
              value={preferredLocale}
              onChange={event => setPreferredLocale(event.target.value || 'en')}
              sx={{width: '35%'}}
            >
              {LANGUAGES.map(language => (
                <MenuItem key={language.locale} value={language.locale}>
                  {language.name}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </div>
        <Button onClick={onSubmit} label={t('common.save')} color='primary' sx={{margin: '16px 0 24px 0'}} />
      </form>
    </div>
  )
}

export default UserForm
