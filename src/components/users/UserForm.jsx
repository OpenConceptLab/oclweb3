import React from 'react';
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom';
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import merge from 'lodash/merge'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'
import forEach from 'lodash/forEach'
import get from 'lodash/get'
import pullAt from 'lodash/pullAt'
import APIService from '../../services/APIService'
import { OperationsContext } from '../app/LayoutContext';
import { LANGUAGES } from '../../common/constants';
import { refreshCurrentUserCache, getCurrentUser, getResetPasswordURL } from '../../common/utils'
import Link from '../common/Link'
import Button from '../common/Button'
import HeaderLogo from '../common/HeaderLogo'
import UserIcon from './UserIcon';
import DeleteIconButton from '../common/DeleteIconButton'

const UserForm = ({ user }) => {
  const sessionUser = getCurrentUser()
  const history = useHistory()
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);
  const [custom, setCustom] = React.useState(!isEmpty(user?.extras))

  //form fields
  const [firstName, setFirstName] = React.useState(user.first_name || '')
  const [lastName, setLastName] = React.useState(user.last_name || '')
  const [email, setEmail] = React.useState(user.email)
  const [company, setCompany] = React.useState(user.company || '')
  const [location, setLocation] = React.useState(user.location || '')
  const [website, setWebsite] = React.useState(user.website || '')
  const [preferredLocale, setPreferredLocale] = React.useState(user.preferred_locale || 'en')
  const [isLogoUpdated, setIsLogoUpdated] = React.useState(false)
  const [extras, setExtras] = React.useState(isEmpty(user?.extras) ? [{key: '', value: ''}] : map(user.extras, (v, k) => ({key: k, value: v})))

  const getExtrasPayload = () => {
    let newExtras = {}
    forEach(extras, ({value, key}) => newExtras[key] = value)
    if(isEmpty(newExtras))
      newExtras = null
    return newExtras
  }

  const getPayload = () => ({
    first_name: firstName,
    last_name: lastName,
    company: company,
    location: location,
    website: website,
    preferred_locale: preferredLocale || 'en',
    extras: getExtrasPayload()
  })

  const onSubmit = () => {
    const form = document.getElementById('user-form')
    const isValid = form.reportValidity()
    if(isValid) {
      APIService.users(user.username).put(getPayload()).then(response => {
        if(response?.status === 200) {
          const callback = () => {
            history.push(user.url)
            setAlert({duration: 2000, message: t('user.profile_update_success'), severity: 'success'})

            if(isLogoUpdated)
              window.location.reload()
          }
          if(sessionUser.username === user.username)
            refreshCurrentUserCache(() => {})
          callback()
        } else
          setAlert({duration: 2000, message: t('user.profile_update_failure'), severity: 'error'})
      })
    }
  }

  const onCancel = () => history.push(user.url)

  const onLogoUpload = (base64, name) => {
    APIService.new().overrideURL(user.url).appendToUrl('logo/')
      .post({base64: base64, name: name})
      .then(response => {
        if(response?.status === 200){
          setIsLogoUpdated(true)
          const url = response?.data?.logo_url || user.logo_url
          localStorage.setItem(
            'user',
            JSON.stringify(merge(JSON.parse(localStorage.user), {logo_url: url}))
          )
        }
      })
  }

  const setExtrasValue = (index, key, value) => {
    const newExtras = [...extras]
    newExtras[index][key] = value
    setExtras(newExtras)
  }

  const onAddExtras = () => setExtras([...extras, {key: "", value: ""}])
  const onDeleteExtras = index => {
    const newExtras = [...extras]
    pullAt(newExtras, index)
    setExtras(newExtras)
  }

  return (
    <div className='col-xs-12' style={{display: 'flex', justifyContent: 'center'}}>
      <form id='user-form' style={{width: '85%'}}>
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
            <Typography component="div" sx={{width: 'calc(30% - 10px - 16px)', fontSize: '12px', marginLeft: '16px'}}>
              <span style={{opacity: 0.7}}>Your URL will be:</span><br />
              <span>{window.location.origin}/#/users/<b>{user.username}</b>/</span>
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
              sx={{width: 'calc(70% + 10px)'}}
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
              sx={{width: 'calc(70% + 10px)'}}
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
        <div className='col-xs-12' style={{marginTop: '16px', padding: '24px', borderRadius: '10px', border: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: '#FFF'}}>
          <Typography component='h3' sx={{fontSize: '16px', fontWeight: 'bold', lineHeight: 1.5, letterSpacing: '0.15px'}}>
            {t('user.avatar')}
          </Typography>
          <div className='col-xs-12' style={{padding: '24px 0 0 0', display: 'flex', alignItems: 'center'}}>
            <HeaderLogo
              isCircle
              logoURL={user.logo_url}
              onUpload={onLogoUpload}
              defaultIcon={<UserIcon user={user} color='secondary' sx={{fontSize: '100px'}} logoClassName='user-img-medium' />}
            />
          </div>
        </div>
        <div className='col-xs-12' style={{marginTop: '16px', padding: '24px', borderRadius: '10px', border: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: '#FFF'}}>
          <Typography component='h3' sx={{fontSize: '16px', fontWeight: 'bold', lineHeight: 1.5, letterSpacing: '0.15px'}}>
            <span>{t('common.custom_attributes')}</span>
            <span style={{marginLeft: '8px'}}>
              <Switch color="primary" checked={custom} onChange={() => setCustom(!custom)} />
            </span>
          </Typography>
          {
            custom &&
              <div className='col-xs-12' style={{padding: 0}}>
                {
                  map(extras, (extra, index) => {
                    return (
                      <div key={index} className='col-xs-12' style={{padding: '24px 0 0 0', display: 'flex', alignItems: 'center'}}>
                        <TextField
                          fullWidth
                          id={`extras.${index}.key`}
                          value={get(extras, `${index}.key`)}
                          label={t('custom_attributes.key')}
                          variant='outlined'
                          required
                          size='small'
                          onChange={event => setExtrasValue(index, 'key', event.target.value || '')}
                          sx={{width: '35%'}}
                        />
                        <TextField
                          fullWidth
                          id={`extras.${index}.value`}
                          value={get(extras, `${index}.value`)}
                          label={t('custom_attributes.value')}
                          variant='outlined'
                          required
                          size='small'
                          onChange={event => setExtrasValue(index, 'value', event.target.value || '')}
                          sx={{width: '35%', marginLeft: '10px'}}
                        />
                        <DeleteIconButton sx={{marginLeft: '16px'}} onClick={() => onDeleteExtras(index)} />
                      </div>
                    )
                  })
                }
                <div className='col-xs-12' style={{padding: '0 8px 0 0'}}>
                  <Link onClick={onAddExtras} label={t('custom_attributes.add')} sx={{margin: '16px 16px 24px 16px', fontSize: '0.8125rem'}} />
                </div>
              </div>
          }
        </div>
        <Button onClick={onSubmit} label={t('common.save')} color='primary' sx={{margin: '16px 0 24px 0'}} />
        <Link onClick={onCancel} label={t('common.cancel')} sx={{margin: '16px 16px 24px 16px', fontSize: '0.8125rem'}} />
      </form>
    </div>
  )
}

export default UserForm
