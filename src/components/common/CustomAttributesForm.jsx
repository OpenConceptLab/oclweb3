import React from 'react'
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import map from 'lodash/map'
import get from 'lodash/get'

const CustomAttributesForm = ({ id, extras, onChange, onAdd }) => {
  const { t } = useTranslation()

  return (
    <div id={id || 'custom-attributes'} className='col-xs-12 padding-0' style={{maxHeight: '500px', overflow: 'auto'}}>
      {
        map(extras, (extra, index) => {
          return (
            <React.Fragment key={index}>
              <div className='col-xs-6' style={{padding: '0 8px 0 0', marginTop: '24px'}}>
                <TextField
                  fullWidth
                  id={`extras.${index}.key`}
                  value={get(extras, `${index}.key`)}
                  label={t('custom_attributes.key')}
                  variant='outlined'
                  required
                  size='small'
                  onChange={event => onChange(index, 'key', event.target.value || '')}
                />
              </div>
              <div className='col-xs-6' style={{padding: '0 0 0 8px', marginTop: '24px'}}>
                <TextField
                  fullWidth
                  id={`extras.${index}.value`}
                  value={get(extras, `${index}.value`)}
                  label={t('custom_attributes.value')}
                  variant='outlined'
                  required
                  size='small'
                  onChange={event => onChange(index, 'value', event.target.value || '')}
                />
              </div>
            </React.Fragment>
          )})
      }
      <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
        <Button sx={{textTransform: 'none'}} variant='text' size='small' onClick={onAdd} startIcon={<AddIcon fontSize='inherit' />}>
          {t('custom_attributes.add')}
          </Button>
      </div>
    </div>
  )
}

export default CustomAttributesForm
