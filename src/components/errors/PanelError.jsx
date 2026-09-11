import React from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Error40X from './Error40X';

const PanelError = ({ status, resourceType, onClose }) => {
  const { t } = useTranslation()
  const contextualKey = `errors.${resourceType}_${status}`
  const contextual = resourceType ? t(contextualKey) : ''

  return (
    <div className='col-xs-12 padding-0' style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      {
        Boolean(onClose) &&
          <div style={{display: 'flex', justifyContent: 'flex-end', padding: '8px 12px 0 0'}}>
            <IconButton size='small' onClick={() => onClose()}>
              <CloseIcon fontSize='small' />
            </IconButton>
          </div>
      }
      <div style={{flex: 1, minHeight: 0}}>
        <Error40X status={status} nested message={contextual === contextualKey ? '' : contextual} />
      </div>
    </div>
  )
}

export default PanelError;
