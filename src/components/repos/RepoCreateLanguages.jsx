import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import LocaleAutoComplete from '../concepts/LocaleAutoComplete'

const RepoCreateLanguages = ({ locales, defaultLocale, supportedLocales, onChange }) => {
  const { t } = useTranslation()

  const onSupportedLocalesChange = (id, value) => onChange(id, value?.map(val => val?.id))
  return (
    <>
      <div className='col-xs-12 padding-0'>
        <Typography sx={{fontSize: '16px', fontWeight: 'bold'}}>
          {t('common.languages')}
        </Typography>
      </div>
      <div className='col-xs-12 padding-0' style={{marginTop: '24px', textAlign: 'left'}}>
        <div className='col-xs-5 padding-0'>
          <LocaleAutoComplete
            id='defaultLocale'
            label={t('repo.default_locale')}
            required
            size='medium'
            cachedLocales={locales}
            value={defaultLocale || ''}
            onChange={onChange}
          />
        </div>
        <div className='col-xs-7' style={{padding: '0 0 0 10px'}}>
          <LocaleAutoComplete
            multiple
            id='supportedLocales'
            size='medium'
            label={t('repo.supported_locales')}
            cachedLocales={locales}
            value={supportedLocales || ''}
            onChange={onSupportedLocalesChange}
          />
        </div>
      </div>
    </>
  )
}
export default RepoCreateLanguages;
