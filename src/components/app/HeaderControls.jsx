import React from 'react';
import { useTranslation } from 'react-i18next'
import { getLoginURL, isLoggedIn } from '../../common/utils';
import Languages from './Languages';
import Button from '../common/Button';
import UserMenu from '../users/UserMenu';
import UserProfileButton from '../users/UserProfileButton';


const HeaderControls = () => {
  const { t } = useTranslation()
  const [userMenu, setUserMenu] = React.useState(false)
  const authenticated = isLoggedIn()
  return (
    <div className='col-xs-3 padding-0' style={{textAlign: 'right'}}>
      <Languages />
      {
        authenticated ?
          <UserProfileButton onClick={() => setUserMenu(true)} /> :
        <Button className='default-button-styles' label={t('auth.sign_in')} color='primary' style={{marginLeft: '8px'}} href={getLoginURL()} component='a' />
      }
      {
        authenticated &&
          <UserMenu isOpen={userMenu} onClose={() => setUserMenu(false)} />
      }
    </div>
  )
}

export default HeaderControls;
