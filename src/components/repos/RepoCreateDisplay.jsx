import React from 'react'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import ListItemText from '@mui/material/ListItemText'
import { isBlankJSONString, jsonToString, stringToJSON } from '../common/JSONTextField'

const RepoCreateDisplay = ({ isSource, meta, hierarchyRootURL, onChange }) => {
  const { t } = useTranslation()
  const parsed = isBlankJSONString(meta) ? {} : stringToJSON(meta)
  const usable = Boolean(parsed && typeof parsed === 'object' && !Array.isArray(parsed))
  const options = isSource ? ['table', 'card', 'hierarchy'] : ['table', 'card']
  const savedView = parsed?.display?.default_view
  const value = options.includes(savedView) ? savedView : 'table'
  const defaultFilters = Object.entries(parsed?.display?.default_filter || {})
  const helperText = !usable ? 'repo.default_view_invalid_meta' :
    value === 'hierarchy' && !hierarchyRootURL ? 'repo.default_view_needs_root' : 'repo.default_view_help'
  const onSelect = event => onChange('meta', jsonToString({...parsed, display: {...(parsed.display || {}), default_view: event.target.value}}))

  return (
    <div className='col-xs-12 padding-0'>
      <Typography sx={{fontSize: '16px', fontWeight: 'bold'}}>
        {t('repo.display')}
      </Typography>
      <Typography sx={{fontSize: '14px', color: 'secondary.40', marginTop: '8px'}}>
        {t('repo.display_description')}
      </Typography>
      <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
        <FormControl variant='outlined' fullWidth disabled={!usable}>
          <InputLabel id='default-view-label'>{t('repo.default_view')}</InputLabel>
          <Select labelId='default-view-label' label={t('repo.default_view')} value={value} onChange={onSelect}>
            {
              options.map(option => (
                <MenuItem key={option} value={option} disabled={option === 'hierarchy' && !hierarchyRootURL}>
                  <ListItemText
                    primary={t(`search.${option}`)}
                    secondary={<span style={{fontSize: '12px', whiteSpace: 'normal', display: 'block'}}>{t(`repo.default_view_${option}_description`)}</span>}
                  />
                </MenuItem>
              ))
            }
          </Select>
          <FormHelperText>{t(helperText)}</FormHelperText>
        </FormControl>
      </div>
      {
        isSource &&
          <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
            <Typography sx={{fontSize: '14px', fontWeight: 'bold', color: 'secondary.40'}}>
              {t('repo.default_filters')}
            </Typography>
            {
              defaultFilters.length ? defaultFilters.map(([key, value]) => (
                <Typography key={key} sx={{fontSize: '14px'}}>
                  {key.replace(/^properties__/, '')}{String(value).startsWith('!') ? ` ≠ ${String(value).slice(1)}` : `: ${value}`}
                </Typography>
              )) : (
                <Typography sx={{fontSize: '14px', color: 'secondary.40'}}>
                  {t('repo.default_filters_none')}
                </Typography>
              )
            }
            <Typography sx={{fontSize: '14px', color: 'secondary.40', marginTop: '8px'}}>
              {t('repo.default_filters_help')}
            </Typography>
          </div>
      }
    </div>
  )
}

export default RepoCreateDisplay
