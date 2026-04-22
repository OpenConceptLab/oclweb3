import React from 'react'
import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DownIcon from '@mui/icons-material/ArrowDropDown';

import { BLACK } from '../../common/colors'
import { toFullAPIURL, copyURL } from '../../common/utils'
import Breadcrumbs from '../common/Breadcrumbs'
import CloseIconButton from '../common/CloseIconButton';
import ReferenceManagementList from './ReferenceManagementList'

const ReferenceHeader = ({ reference, onClose }) => {
  const { t } = useTranslation()
  const [menu, setMenu] = React.useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(false)
  const onMenuOpen = event => {
    setMenuAnchorEl(event.currentTarget)
    setMenu(true)
  }
  const onMenuClose = () => {
    setMenuAnchorEl(false)
    setMenu(false)
  }

  const onClick = option => {
    if(option === 'copyExpression')
      copyURL(toFullAPIURL(reference.expression))
    else if(option === 'copyURL')
      copyURL(toFullAPIURL(reference.uri))
    onMenuClose()
  }

  return (
    <div className='col-xs-12 padding-0' style={{marginBottom: '12px'}}>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{width: 'calc(100% - 40px)'}}>
          <Breadcrumbs reference={reference} nested />
        </span>
        <span>
          <CloseIconButton color='secondary' onClick={onClose} />
        </span>
      </div>
      <div className='col-xs-12' style={{padding: '0px'}}>
        <Typography sx={{fontSize: '22px', color: BLACK}} className='searchable'>
          {reference.expression}
        </Typography>
      </div>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{display: 'flex', alignItems: 'center'}} />
        <span>
          <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}} onClick={onMenuOpen} id='reference-actions'>
            {t('common.actions')}
          </Button>
          <ReferenceManagementList anchorEl={menuAnchorEl} open={menu} onClose={onMenuClose} id='reference-actions' onClick={onClick} reference={reference} />
        </span>
      </div>
    </div>
  )
}

export default ReferenceHeader;
