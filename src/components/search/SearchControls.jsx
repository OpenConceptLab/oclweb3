import React from 'react';
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button';
import DownIcon from '@mui/icons-material/ArrowDropDown';

const SearchControls = ({ disabled }) => {
  const { t } = useTranslation()
  return (
    <div className='col-xs-12 padding-0' style={{float: 'right', textAlign: 'right'}}>
      <Button disabled={Boolean(disabled)} variant='contained' color='default' size='small' style={{textTransform: 'none'}} endIcon={<DownIcon fontSize='inherit' />}>
        {t('search.sort_by')}
      </Button>
    </div>
  )
}


export default SearchControls;
