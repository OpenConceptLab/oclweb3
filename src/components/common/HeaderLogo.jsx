import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button'
import { Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, IconButton } from '@mui/material'
import { Edit as EditIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { last } from 'lodash';
import { currentUserHasAccess } from '../../common/utils';
import ImageUploader from './ImageUploader';
import './HeaderLogo.scss';

const HeaderLogo = ({ logoURL, onUpload, defaultIcon, isCircle, shrink, className, style }) => {
  const { t } = useTranslation()
  const hasAccess = currentUserHasAccess();
  const [base64, setBase64] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const onLogoUpload = (base64, name) => {
    setOpen(false);
    setBase64(base64)
    onUpload(base64, name)
  }
  const getExistingLogoName = () => {
    if(!logoURL)
      return

    return last(logoURL.split('/'))
  }

  let containerClasses = 'logo-container flex-vertical-center'
  if(className)
    containerClasses += ` ${className}`
  else if(shrink)
    containerClasses += ' small'

  const logo = base64 || logoURL

  return (
    <React.Fragment>
      <div className={containerClasses} style={style}>
        {
          logo ?
          <img className='header-logo' src={logo} /> :
          defaultIcon
        }
        {
          hasAccess &&
            <Tooltip arrow title={t('user.update_avatar')}>
            <IconButton
              onClick={() => setOpen(true)}
              className='logo-edit-button'
              color='secondary'
              size="large">
              {
                logoURL ?
                <EditIcon fontSize='small' color='secondary' /> :
                <UploadIcon color='secondary' fontSize='small' />
              }
            </IconButton>
          </Tooltip>
        }
      </div>
      <Dialog onClose={() => setOpen(false)} open={open} fullWidth>
        <DialogTitle>{t('user.update_avatar')}</DialogTitle>
        <DialogContent>
          <ImageUploader onUpload={onLogoUpload} defaultImg={logoURL} defaultName={getExistingLogoName()} isCircle={isCircle} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} label={t('common.cancel')} />
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default HeaderLogo;
