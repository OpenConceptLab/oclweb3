import React from 'react';
import { Collapse, Chip } from '@mui/material'
import {ArrowRight as RightIcon, ArrowDropDown as DownIcon} from '@mui/icons-material'
import { get, isObject } from 'lodash';
import { useTranslation } from 'react-i18next'
import { BLACK, COLORS, PRIMARY_COLORS } from '../../common/colors';

const ErrorUI = ({message, error, errorInfo}) => {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const icon = open ?
               <DownIcon color='error' sx={{color: 'error'}} /> :
               <RightIcon color='error' sx={{color: 'error'}} />;
  const errorDetails = get(errorInfo, 'componentStack') ? errorInfo.componentStack : JSON.stringify(errorInfo, undefined, 2);
  const errorMsg = isObject(error) ? error.toString() : error;
  return (
    <div style={{display: 'flex', height: 'calc(100vh - 100px)', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flexDirection: 'column', overflow: 'auto'}}>
      <div className='col-xs-12'>
        <p style={{color: '#000', fontSize: '24px', margin: '16px 0'}}>
          {message || t('common.generic_error')}
        </p>
      </div>
      <div className='col-xs-12'>
        <p style={{color: BLACK, fontSize: '16px', margin: 0}}>
          {t('common.please')} <a className='no-anchor-styles' onClick={() => window.location.reload()} style={{cursor: 'pointer', color: PRIMARY_COLORS.main}}>{t('common.refresh')}</a> {t('common.or')} {t('common.go_to_your')} <a href='/' className='no-anchor-styles' style={{color: PRIMARY_COLORS.main}}>{t('dashboard.name')}</a>.
        </p>
      </div>
      {
        errorMsg &&
          <div className='col-xs-12' style={{marginTop: '24px', maxWidth: '900px'}}>
            <Chip
              variant='outlined'
              icon={icon}
              label={t('common.error_details')}
              onClick={() => setOpen(!open)}
              sx={{color: COLORS.error.main}}
            />
            <Collapse in={open} timeout='auto'>
              <div style={{background: 'rgba(244,67,54, 0.1)', padding: '16px', textAlign: 'left', marginTop: '12px', borderRadius: '8px', maxHeight: '40vh', overflow: 'auto'}}>
                <h4 style={{margin: '0 0 8px 0', color: COLORS.error.main}}>{errorMsg}</h4>
                <pre style={{whiteSpace: 'pre-wrap', margin: 0, fontSize: '12px'}}>
                  {errorDetails}
                </pre>
              </div>
            </Collapse>
          </div>
      }
    </div>
  )
}

export default ErrorUI;
