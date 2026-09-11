import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import LocaleSelect from '../common/LocaleSelect'

const RepoCreateLanguages = ({ locales, defaultLocale, supportedLocales, onChange, validationErrors }) => {
  const { t } = useTranslation()

  return (
    <>
      <div className='col-xs-12 padding-0'>
        <Typography sx={{fontSize: '16px', fontWeight: 'bold'}}>
          {t('common.languages')}
        </Typography>
      </div>
      <div className='col-xs-12 padding-0' style={{marginTop: '24px', textAlign: 'left'}}>
        <div className='col-xs-5 padding-0'>
          <LocaleSelect
            id='defaultLocale'
            label={t('repo.default_locale')}
            required
            size='medium'
            locales={locales}
            value={defaultLocale || ''}
            focusOnSelect='supportedLocales'
            onChange={onChange}
            error={Boolean(validationErrors?.defaultLocale)}
            helperText={validationErrors?.defaultLocale || ''}
          />
        </div>
        <div className='col-xs-7' style={{padding: '0 0 0 10px'}}>
          <LocaleSelect
            multiple
            id='supportedLocales'
            size='medium'
            label={t('repo.supported_locales')}
            locales={locales}
            value={supportedLocales || []}
            onChange={onChange}
          />
        </div>
      </div>
    </>
  )
}
export default RepoCreateLanguages;
