import React from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { sortValuesBySourceSummary } from '../../common/utils'
import Button from '../common/Button'
import GroupHeader from '../common/GroupHeader'
import GroupItems from '../common/GroupItems'
import SourceSearchAutocomplete from '../common/SourceSearchAutocomplete'
import ConceptSearchAutocomplete from '../common/ConceptSearchAutocomplete'
import { fetchMapTypes } from './utils'

const MappingInlineForm = ({ concept, defaultMapType, isDirect, suggested, repoSummary, onSubmit, onClose }) => {
  const { t } = useTranslation()
  const [mapTypes, setMapTypes] = React.useState([])
  const [mapType, setMapType] = React.useState(defaultMapType ? {id: defaultMapType, name: defaultMapType} : null)
  const [source, setSource] = React.useState(null)
  const [targetConcept, setTargetConcept] = React.useState(null)
  const [targetConceptCode, setTargetConceptCode] = React.useState('')
  const [targetConceptName, setTargetConceptName] = React.useState('')

  React.useEffect(() => {
    if(!defaultMapType)
      fetchMapTypes(data => setMapTypes(sortValuesBySourceSummary(data, repoSummary, 'mappings.map_type')))
  }, [repoSummary])

  const isUnknownConcept = () => Boolean(targetConcept?.url ? targetConcept.id !== targetConceptCode : targetConceptCode)

  const getPayload = () => {
    const prefix = isDirect ? 'to' : 'from'
    const payload = {map_type: mapType?.id}
    payload[isDirect ? 'from_concept_url' : 'to_concept_url'] = concept.url
    if(isUnknownConcept()) {
      payload[`${prefix}_source_url`] = source?.url
      payload[`${prefix}_concept_code`] = targetConceptCode
      payload[`${prefix}_concept_name`] = targetConceptName
    } else {
      payload[`${prefix}_concept_url`] = targetConcept?.url
    }
    return payload
  }

  const _onSubmit = () => {
    const form = document.getElementById('mapping-inline-form')
    if(form.reportValidity())
      onSubmit(getPayload(), targetConcept, isDirect)
  }

  return (
    <form id='mapping-inline-form' style={{width: '100%', padding: '8px 0'}}>
      <Typography component='div' sx={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px'}}>
        {t('mapping.add_a_mapping')}
      </Typography>
      {
        !defaultMapType &&
          <div style={{marginBottom: '16px'}}>
            <Autocomplete
              openOnFocus
              id='mapType'
              size='small'
              value={mapType}
              options={mapTypes}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              getOptionLabel={option => option?.name || ''}
              groupBy={option => option.resultType}
              renderGroup={params => (
                <li style={{listStyle: 'none'}} key={params.group || 'none'}>
                  <GroupHeader>{params.group}</GroupHeader>
                  <GroupItems>{params.children}</GroupItems>
                </li>
              )}
              fullWidth
              onChange={(event, item) => setMapType(item)}
              renderInput={params => <TextField {...params} required size='small' label={t('mapping.relationship_type')} variant='outlined' fullWidth />}
            />
          </div>
      }
      <div style={{marginBottom: '16px'}}>
        <SourceSearchAutocomplete
          required
          size='small'
          suggested={suggested}
          onChange={(id, item) => { setSource(item || null); setTargetConcept(null) }}
        />
      </div>
      <div style={{marginBottom: '16px'}}>
        <ConceptSearchAutocomplete
          freeSolo
          required
          size='small'
          disabled={!source}
          parentURI={source?.url}
          value={targetConcept}
          onChange={(id, item) => setTargetConcept(item || null)}
          onInputChange={(id, value) => setTargetConceptCode(value || '')}
        />
      </div>
      {
        isUnknownConcept() &&
          <div style={{marginBottom: '16px'}}>
            <TextField
              size='small'
              fullWidth
              label={t('common.name')}
              value={targetConceptName}
              onChange={event => setTargetConceptName(event.target.value || '')}
            />
          </div>
      }
      <div>
        <Button color='primary' label={t('common.save')} sx={{marginRight: '16px'}} onClick={_onSubmit} />
        <Button variant='outlined' color='secondary' label={t('common.cancel')} onClick={onClose} />
      </div>
    </form>
  )
}

export default MappingInlineForm;
