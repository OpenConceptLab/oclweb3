import React from 'react';
import { useTranslation } from 'react-i18next'
import PersonIcon from '@mui/icons-material/Face2';
import IconButton from '@mui/material/IconButton';
import { getLoginURL, isLoggedIn } from '../../common/utils';
import Languages from './Languages';
import Button from '../common/Button';

const HeaderControls = () => {
  const { t } = useTranslation()
  return (
    <div className='col-xs-3 padding-0' style={{textAlign: 'right'}}>
      <Languages />
      {
        isLoggedIn() ?
          <IconButton color='primary'>
            <PersonIcon fontSize='inherit'/>
          </IconButton>:
        <Button className='default-button-styles' label={t('auth.sign_in')} color='primary' style={{marginLeft: '8px'}} href={getLoginURL()} component='a' />
      }
    </div>
  )
}

export default HeaderControls;
