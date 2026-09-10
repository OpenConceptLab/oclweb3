import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import ListItemText from '@mui/material/ListItemText'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

import { AUTO_ID_NONE, AUTO_ID_SEQUENTIAL, AUTO_ID_UUID } from '../../common/constants'

const OPTION_TEXT_STYLE = {
  fontSize: '12px',
  whiteSpace: 'normal',
  display: 'block',
}

const valueOf = (value, fallback) => value === undefined ? fallback : (value || AUTO_ID_NONE)
const startFromOf = value => value === undefined ? 1 : (value || 1)

const AutoIDField = ({id, startFromId, label, helperText, defaultValue, uuidOnly, selected, startFrom, onChange}) => {
  const { t } = useTranslation()
  const value = valueOf(selected, defaultValue)
  const onSelect = event => onChange(id, event.target.value === AUTO_ID_NONE ? null : event.target.value)
  return (
    <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
      <FormControl variant='outlined' fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select label={label} value={value} onChange={onSelect}>
          <MenuItem value={AUTO_ID_NONE}>
            <ListItemText
              primary={t('repo.auto_id_manual')}
              secondary={<span style={OPTION_TEXT_STYLE}>{t('repo.auto_id_manual_description')}</span>}
            />
          </MenuItem>
          <MenuItem value={AUTO_ID_UUID}>
            <ListItemText
              primary={t('repo.auto_id_uuid')}
              secondary={<span style={OPTION_TEXT_STYLE}>{t('repo.auto_id_uuid_description')}</span>}
            />
          </MenuItem>
          {
            !uuidOnly &&
              <MenuItem value={AUTO_ID_SEQUENTIAL}>
                <ListItemText
                  primary={t('repo.auto_id_sequential')}
                  secondary={<span style={OPTION_TEXT_STYLE}>{t('repo.auto_id_sequential_description')}</span>}
                />
              </MenuItem>
          }
        </Select>
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
      {
        value === AUTO_ID_SEQUENTIAL && startFromId &&
          <div className='col-xs-6 padding-0' style={{marginTop: '16px'}}>
            <TextField
              fullWidth
              type='number'
              label={t('repo.auto_id_start_from')}
              value={startFromOf(startFrom)}
              onChange={event => onChange(startFromId, parseInt(event.target.value, 10) || 1)}
              slotProps={{htmlInput: {min: 1, step: 1}}}
            />
          </div>
      }
    </div>
  )
}

const RepoCreateIDAutoAssignment = ({ onChange, ...rest }) => {
  const { t } = useTranslation()
  const [hint, setHint] = React.useState(true)

  const fieldProps = (id, startFromId) => ({id, startFromId, onChange, selected: rest[id], startFrom: startFromId ? rest[startFromId] : undefined})

  return (
    <>
      <div className='col-xs-12 padding-0'>
        <Typography sx={{fontSize: '16px', fontWeight: 'bold'}}>
          {t('repo.id_auto_assignment')}
        </Typography>
        <Typography sx={{fontSize: '14px', color: 'secondary.40', marginTop: '8px'}}>
          {t('repo.id_auto_assignment_description')}
        </Typography>
        <Collapse in={hint}>
          <Alert
            severity='info'
            action={
              <IconButton color='inherit' size='small' onClick={() => setHint(false)}>
                <CloseIcon fontSize='inherit' />
              </IconButton>
            }
            sx={{marginTop: '16px'}}
          >
            {t('repo.id_auto_assignment_openmrs_hint')}
          </Alert>
        </Collapse>
        <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
          <Typography sx={{fontSize: '14px', fontWeight: 'bold', color: 'secondary.40'}}>
            {t('repo.ids')}
          </Typography>
          <AutoIDField
            {...fieldProps('autoidConceptMnemonic', 'autoidConceptMnemonicStartFrom')}
            defaultValue={AUTO_ID_NONE}
            label={t('repo.autoid_concept_mnemonic')}
            helperText={t('repo.autoid_concept_mnemonic_help')}
          />
          <AutoIDField
            {...fieldProps('autoidMappingMnemonic', 'autoidMappingMnemonicStartFrom')}
            defaultValue={AUTO_ID_SEQUENTIAL}
            label={t('repo.autoid_mapping_mnemonic')}
            helperText={t('repo.autoid_mapping_mnemonic_help')}
          />
        </div>
        <div className='col-xs-12 padding-0' style={{marginTop: '32px'}}>
          <Typography sx={{fontSize: '14px', fontWeight: 'bold', color: 'secondary.40'}}>
            {t('repo.external_ids')}
          </Typography>
          <AutoIDField
            {...fieldProps('autoidConceptExternalID', 'autoidConceptExternalIDStartFrom')}
            defaultValue={AUTO_ID_NONE}
            label={t('repo.autoid_concept_external_id')}
            helperText={t('repo.autoid_concept_external_id_help')}
          />
          <AutoIDField
            {...fieldProps('autoidMappingExternalID', 'autoidMappingExternalIDStartFrom')}
            defaultValue={AUTO_ID_NONE}
            label={t('repo.autoid_mapping_external_id')}
            helperText={t('repo.autoid_mapping_external_id_help')}
          />
          <AutoIDField
            uuidOnly
            {...fieldProps('autoidConceptNameExternalID')}
            defaultValue={AUTO_ID_NONE}
            label={t('repo.autoid_concept_name_external_id')}
            helperText={t('repo.autoid_concept_name_external_id_help')}
          />
          <AutoIDField
            uuidOnly
            {...fieldProps('autoidConceptDescriptionExternalID')}
            defaultValue={AUTO_ID_NONE}
            label={t('repo.autoid_concept_description_external_id')}
            helperText={t('repo.autoid_concept_description_external_id_help')}
          />
        </div>
      </div>
    </>
  )
}

export default RepoCreateIDAutoAssignment;
