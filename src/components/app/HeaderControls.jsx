import React from 'react';
import { useTranslation } from 'react-i18next'
import PersonIcon from '@mui/icons-material/Face2';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { getLoginURL, isLoggedIn } from '../../common/utils';
import Languages from './Languages';

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
        <Chip label={t('auth.sign_in')} color='primary' style={{height: '40px', borderRadius: '100px', marginLeft: '8px'}} href={getLoginURL()} component='a' />
      }
    </div>
  )
}

export default HeaderControls;
