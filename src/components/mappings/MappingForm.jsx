import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField, IconButton, Tooltip } from '@mui/material';
import {
  SwapVert as SwapIcon,
} from '@mui/icons-material';
import {
  set, get, cloneDeep, isEmpty, map, isArray, compact, flatten, values, keys
} from 'lodash';
import APIService from '../../services/APIService';
import { arrayToObject } from '../../common/utils';
import { fetchMapTypes } from './utils';
import { OperationsContext } from '../app/LayoutContext';
import FormComponent, { CardSection } from '../common/FormComponent'
import { ID_REGEX, NUM_REGEX } from '../../common/constants'
import {
  required, matchPattern
} from '../../common/validators';
import Breadcrumbs from '../common/Breadcrumbs'
import CustomAttributesForm from '../common/CustomAttributesForm'
import CloseIconButton from '../common/CloseIconButton';
import Button from '../common/Button'

const ANCHOR_UNDERLINE_STYLES = {textDecoration: 'underline', cursor: 'pointer'}

class MappingForm extends FormComponent {
  static contextType = OperationsContext;

  constructor(props) {
    super(props);

    const mandatoryFieldStruct = this.getMandatoryFieldStruct()
    const fieldStruct = this.getFieldStruct()

    this.state = {
      manualMnemonic: false,
      manualExternalId: false,
      mapTypes: [],
      parent: null,
      fields: {
        id: {...mandatoryFieldStruct, validators: [required(), matchPattern(ID_REGEX)]},
        map_type: {...mandatoryFieldStruct},
        external_id: {...fieldStruct},
        from_concept_url: {...fieldStruct},
        from_concept_code: {...fieldStruct},
        from_concept_name: {...fieldStruct},
        from_source_url: {...fieldStruct},
        from_source_version: {...fieldStruct},
        to_concept_url: {...fieldStruct},
        to_concept_code: {...fieldStruct},
        to_concept_name: {...fieldStruct},
        to_source_url: {...fieldStruct},
        to_source_version: {...fieldStruct},
        comment: {...(props.edit ? mandatoryFieldStruct : fieldStruct)},
        extras: [],
        sort_weight: {...fieldStruct, validators: [matchPattern(NUM_REGEX)]}
      }
    }
  }

  componentDidMount() {
    fetchMapTypes(data => this.setState({mapTypes: data}))
    if((this.props.edit && this.props.mapping) || this.props.copyFrom)
      this.setFieldsForEdit()
    if(this.props.selectedConcepts)
      this.setFieldsFromSelectedConcepts()
    if(!this.props.edit)
      this.setState({parent: this.props.source})
  }

  setFieldsForEdit() {
    const { mapping, edit, copyFrom } = this.props;
    const instance = edit ? mapping : copyFrom
    const attrs = [
      'id', 'map_type',
      'from_concept_url', 'from_concept_name',
      'from_source_url', 'from_source_version',
      'to_concept_url', 'to_concept_name',
      'to_source_url', 'to_source_version', 'sort_weight'
    ]
    if(!copyFrom?.id) {
      attrs.push('external_id')
    }
    const newState = {...this.state}
    attrs.forEach(attr => set(newState.fields, `${attr}.value`, get(instance, attr, '') || ''))
    newState.fields.to_concept_code.value = instance.to_concept_code ? decodeURIComponent(instance.to_concept_code) : instance.to_concept_code
    newState.fields.from_concept_code.value = instance.from_concept_code ? decodeURIComponent(instance.from_concept_code) : instance.from_concept_code
    if(!edit)
      newState.fields.id.value = ''
    newState.fields.extras = isEmpty(instance.extras) ? newState.fields.extras : map(instance.extras, (v, k) => ({key: k, value: v}))

    this.setState(newState);
  }

  setFieldsFromSelectedConcepts() {
    const { selectedConcepts } = this.props;
    const fromConcept = get(selectedConcepts, '0')
    const toConcept = get(selectedConcepts, '1')
    const newState = {...this.state}

    if(fromConcept) {
      newState.fields.from_concept_url.value = fromConcept.url
      newState.fields.from_concept_name.value = fromConcept.display_name
    }
    if(toConcept) {
      newState.fields.to_concept_url.value = toConcept.url
      newState.fields.to_concept_name.value = toConcept.display_name
    }
    this.setState(newState)
  }

  swapConcepts = () => {
    const fields = cloneDeep(this.state.fields)
    const newState = {...this.state}

    newState.fields.from_concept_url.value = fields.to_concept_url.value
    newState.fields.from_concept_code.value = fields.to_concept_code.value
    newState.fields.from_concept_name.value = fields.to_concept_name.value
    newState.fields.from_source_url.value = fields.to_source_url.value
    newState.fields.from_source_version.value = fields.to_source_version.value

    newState.fields.to_concept_url.value = fields.from_concept_url.value
    newState.fields.to_concept_code.value = fields.from_concept_code.value
    newState.fields.to_concept_name.value = fields.from_concept_name.value
    newState.fields.to_source_url.value = fields.from_source_url.value
    newState.fields.to_source_version.value = fields.from_source_version.value

    this.setState(newState)
  }

  getIdHelperText() {
    const { parent, fields } = this.state
    const { edit, source } = this.props
    const id = fields.id.value || "[generated-mapping-id]"
    const parentURL = edit ? this.props.parentURL : get(parent, 'url');
    return (
      <span>
        {
          source.autoid_mapping_mnemonic &&
            <React.Fragment>
              <a onClick={this.toggleManualMnemonic} style={ANCHOR_UNDERLINE_STYLES}>Auto-assign</a><br/>
            </React.Fragment>
        }
        {
          source.autoid_mapping_mnemonic === 'sequential' &&
            <React.Fragment>
              <span>This is optional since the parent repository is set can to take care of generating the ID. The ID will be generated to next in sequence.</span><br/>
            </React.Fragment>
        }
        {
          source.autoid_mapping_mnemonic === 'uuid' &&
            <React.Fragment>
              <span>This is optional since the parent repository is set to take care of generating the ID. The ID will be generated in UUID format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.</span><br/>
            </React.Fragment>
        }
        <span>Alphanumeric characters, @, hyphens, periods, and underscores are allowed.</span>
        <br />
        {
          parentURL &&
            <span>
              <span>Your new mapping will live at: <br />
                { `${window.location.origin}/#${parentURL}mappings/` }
              </span>
              <span><b>{id}</b>/</span>
            </span>
        }
      </span>
    )
  }

  getExternalIdHelperText() {
    const { source } = this.props
    if(!source)
      return ''
    return (
      <span>
        {
          source.autoid_mapping_external_id &&
            <React.Fragment>
              <a onClick={this.toggleManualExternalId} style={ANCHOR_UNDERLINE_STYLES}>Auto-assign</a><br/>
            </React.Fragment>
        }
        {
          source.autoid_mapping_external_id === 'sequence' &&
            <span>This is optional since the parent repository is set to take care of generating the External ID. The External ID will be generated to next in sequence.</span>
        }
        {
          source.autoid_mapping_external_id === 'uuid' &&
            <span>This is optional since the parent repository is set to take care of generating the External ID. The External ID will be generated in UUID format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.</span>
        }
        {
          !source.autoid_mapping_external_id && ''
        }
      </span>
    )
  }

  onTextFieldChange = event => {
    this.setFieldValue(event.target.id, event.target.value)
  }

  onAutoCompleteChange = (id, item) => {
    this.setFieldValue(id, item?.id || '', true)
  }

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const { fields } = this.state;
    const { edit } = this.props

    const isValid = this.setAllFieldsErrors()

    if(isValid) {
      const payload = this.getValues()
      payload.extras = arrayToObject(fields.extras)
      if(edit)
        payload.update_comment = fields.comment.value
      if(!payload.sort_weight)
        delete payload.sort_weight

      let service = APIService.new().overrideURL(this.props.source.url).appendToUrl('mappings/')
      service = edit ? service.appendToUrl(this.state.fields.id.value + '/').put(payload) : service.post(payload)
      service.then(this.handleSubmitResponse)
    }
  }

  handleSubmitResponse = response => {
    const { edit, t, onClose } = this.props
    const { setAlert } = this.context;

    if(response.status === 201 || response.status === 200) { // success
      setAlert({duration: 2000, message: edit ? t('mapping.success_update') : t('mapping.success_create'), severity: 'success'})
      onClose(response.data);
      window.location.hash = response.data.url
    } else if (response?.status === 208) {
      let error = get(response?.data, '__all__.0') || t('common.already_exists')
      setAlert({duration: 10000, message: `${response.status}: ${error}`, severity: 'error'})
    } else { // error
      let error = compact(flatten(values(response)))
      let field = get(keys(response), 0)
      if(isArray(error) && error[0] && field)
        error = error[0]
      setAlert({duration: 10000, message: `${response.status || field || "Error"}: ${error || response.data?.error || response.data?.detail || (edit ? t("mapping.error_update") : t("mapping.error_create"))}`, severity: 'error'})
    }
  }

  toggleManualMnemonic = () => {
    const newManualMnemonic = !this.state.manualMnemonic
    const newState = {...this.state}
    if(!newManualMnemonic)
      newState.fields.id = ''
    newState.manualMnemonic = newManualMnemonic
    this.setState(newState)
  }

  toggleManualExternalId = () => {
    const newManualExternalId = !this.state.manualExternalId
    const newState = {...this.state}
    if(!newManualExternalId)
      newState.fields.external_id = ''
    newState.manualExternalId = newManualExternalId
    this.setState(newState)
  }

  render() {
    const { fields, mapTypes, manualMnemonic, manualExternalId, mapping } = this.state;
    const { onClose, edit, source, t, repo } = this.props;
    return (
      <div className='col-xs-12' style={{padding: '8px 16px 12px 16px', height: '100%', overflow: 'auto'}}>
        <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px'}}>
          <span>
            <Breadcrumbs
              ownerURL={repo.owner_url}
              owner={repo.owner}
              ownerType={repo.owner_type}
              repo={repo.id}
              repoType={repo.type}
              id={mapping?.id || fields.id.value || '[mapping-id]'}
              repoURL={repo?.url}
              mapping
            />
          </span>
          <span>
            <CloseIconButton color='secondary' onClick={onClose} />
          </span>
        </div>
        <CardSection title={t('mapping.form.mapping_details.header')} sx={{p: 2, marginTop: 0}}>
          <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
            {
              !edit &&
                <div style={{width: '100%'}}>
                  {
                    get(source, 'autoid_mapping_mnemonic') && !manualMnemonic ?
                      <span style={{fontWeight: '500', borderLeft: '3px solid lightgray', padding: '10px 5px'}}>
                        Mapping ID will be auto-assigned (<a style={ANCHOR_UNDERLINE_STYLES} onClick={this.toggleManualMnemonic}>click here</a> to override with manual entry)
                      </span> :
                    <TextField
                      error={Boolean(fields.id.errors[0])}
                      id="id"
                      label={t('mapping.form.id')}
                      helperText={fields.id.errors[0] || this.getIdHelperText()}
                      variant="outlined"
                      fullWidth
                      onChange={this.onTextFieldChange}
                      value={fields.id.value}
                      disabled={edit}
                    />
                  }
                </div>
            }
            <div className='col-xs-12 padding-0' style={{marginTop: '16px', width: '100%'}}>
              <Autocomplete
                disableClearable
                openOnFocus
                isOptionEqualToValue={(option, value) => option.id === value}
                value={fields.map_type.value}
                id="map_type"
                options={mapTypes}
                getOptionLabel={(option) => option?.name || option || ''}
                fullWidth
                required
                renderInput={
                  params => <TextField
                                {...params}
                                error={Boolean(fields.map_type.errors[0])}
                                required
                                label={t('mapping.map_type')}
                                variant="outlined"
                                fullWidth
           />
                }
                onChange={(event, item) => this.onAutoCompleteChange('map_type', item)}
              />
            </div>
            <div className='col-xs-12 padding-0' style={{marginTop: '16px', width: '100%'}}>
              {
                get(source, 'autoid_mapping_external_id') && !manualExternalId && !edit ?
                  <span style={{fontWeight: '500', borderLeft: '3px solid lightgray', padding: '10px 5px'}}>
                    Mapping External ID will be auto-assigned (<a style={ANCHOR_UNDERLINE_STYLES} onClick={this.toggleManualExternalId}>click here</a> to override with manual entry)
                  </span> :
                <TextField
                  id="external_id"
                  label={t('common.external_id')}
                  variant="outlined"
                  fullWidth
                  onChange={this.onTextFieldChange}
                  value={fields.external_id.value}
                  helperText={edit ? undefined : this.getExternalIdHelperText()}
                />
              }
            </div>
            <div className='col-xs-12 padding-0' style={{marginTop: '16px', width: '100%'}}>
              <TextField
                error={Boolean(fields.sort_weight.errors[0])}
                id="sort_weight"
                label={t('mapping.sort_weight')}
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.sort_weight.value}
                helperText={fields.sort_weight.errors[0]}
              />
            </div>
          </div>
        </CardSection>
        <CardSection title={t('mapping.form.from_concept.header')}>
          <div className='col-xs-12 padding-0' style={{marginTop: '24px', width: '100%'}}>
            <div className='col-xs-8 padding-left-0'>
              <TextField
                id="from_source_url"
                label={t('mapping.from_source_url')}
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.from_source_url.value}
              />
            </div>
            <div className='col-xs-4 padding-0'>
              <TextField
                id="from_source_version"
                label={t('mapping.from_source_version')}
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.from_source_version.value}
              />
            </div>
          </div>
          <div className='col-xs-12 padding-0' style={{marginTop: '16px', width: '100%'}}>
            <TextField
              id="from_concept_url"
              label={t('mapping.from_concept_url')}
              variant="outlined"
              fullWidth
              onChange={this.onTextFieldChange}
              value={fields.from_concept_url.value}
            />
          </div>
          <div className='col-xs-12 padding-0' style={{marginTop: '16px', width: '100%'}}>
            <div className='col-xs-8 padding-left-0'>
              <TextField
                id="from_concept_name"
                label={t('mapping.from_concept_name')}
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.from_concept_name.value}
              />
            </div>
            <div className='col-xs-4 padding-0'>
              <TextField
                id="from_concept_code"
                label={t('mapping.from_concept_code')}
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.from_concept_code.value}
              />
            </div>
          </div>
        </CardSection>
        <div className='col-xs-12 padding-0' style={{margin: '4px 0', width: '100%', textAlign: 'center'}}>
          <Tooltip arrow title="Swap From and To Concepts">
            <IconButton color="primary" onClick={this.swapConcepts} size="large">
              <SwapIcon />
            </IconButton>
          </Tooltip>
        </div>
        <CardSection title={t('mapping.form.to_concept.header')}>
          <div className='col-xs-12 padding-0' style={{marginTop: '24px', width: '100%'}}>
            <div className='col-xs-8 padding-left-0'>
              <TextField
                id="to_source_url"
                label={t('mapping.to_source_url')}
                placeholder="e.g. /orgs/IHTSDO/sources/SNOMED-CT/"
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.to_source_url.value}
              />
            </div>
            <div className='col-xs-4 padding-0'>
              <TextField
                id="to_source_version"
                label={t('mapping.to_source_version')}
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.to_source_version.value}
              />
            </div>
          </div>
          <div className='col-xs-12 padding-0' style={{marginTop: '16px', width: '100%'}}>
            <TextField
              id="to_concept_url"
              label={t('mapping.to_concept_url')}
              variant="outlined"
              fullWidth
              onChange={this.onTextFieldChange}
              value={fields.to_concept_url.value}
            />
          </div>
          <div className='col-xs-12 padding-0' style={{marginTop: '16px', width: '100%'}}>
            <div className='col-xs-8 padding-left-0'>
              <TextField
                id="to_concept_name"
                label={t('mapping.to_concept_name')}
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.to_concept_name.value}
              />
            </div>
            <div className='col-xs-4 padding-0'>
              <TextField
                id="to_concept_code"
                label={t('mapping.to_concept_code')}
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.to_concept_code.value}
              />
            </div>
          </div>
        </CardSection>
        <CardSection title={t('custom_attributes.label')}>
          <CustomAttributesForm extras={fields.extras} onChange={this.setExtrasValue} onAdd={this.onAddExtras} />
        </CardSection>

        {
          edit &&
            <CardSection title={t('common.update_comment')}>
              <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
                <TextField
                  id="comment"
                  label={t('common.comment')}
                  variant="outlined"
                  fullWidth
                  onChange={event => this.setFieldValue('comment', event.target.value || '')}
                  value={fields.comment.value}
                  required
                  rows={3}
                  maxRows={4}
                  multiline
                  helperText={fields.comment.errors[0]}
                  error={Boolean(fields.comment.errors[0])}
                />

              </div>
            </CardSection>
        }
        <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
          <Button label={t('common.submit')} sx={{backgroundColor: 'surface.s90'}} onClick={this.onSubmit} />
        </div>
      </div>
    );
  }
}

export default MappingForm;
