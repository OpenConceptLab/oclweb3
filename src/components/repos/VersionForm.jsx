import React from 'react';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

import { TextField, FormControlLabel, Checkbox, Autocomplete } from '@mui/material';
import { set, get, startCase, isBoolean, isObject, values, map } from 'lodash';
import APIService from '../../services/APIService';
import FormComponent from '../common/FormComponent'
import { OperationsContext } from '../app/LayoutContext';
import {
  required, matchPattern
} from '../../common/validators';
import Button from '../common/Button'
import CloseIconButton from '../common/CloseIconButton';
import { ID_REGEX } from '../../common/constants'


class VersionForm extends FormComponent {
  static contextType = OperationsContext;

  constructor(props) {
    super(props);

    const mandatoryFieldStruct = this.getMandatoryFieldStruct()
    const fieldStruct = this.getFieldStruct()

    this.state = {
      fields: {
        id: {...mandatoryFieldStruct, validators: [required(), matchPattern(ID_REGEX)]},
        description: {...mandatoryFieldStruct},
        external_id: {...fieldStruct},
        released: {...fieldStruct, value: false},
        autoexpand: {...fieldStruct, value: true},
        expansion_url: {...fieldStruct},
        revision_date: {...fieldStruct},
      },
    }
  }

  componentDidMount() {
    if(this.props.edit && this.props.version)
      this.setFieldsForEdit()
  }

  setFieldsForEdit() {
    const { version } = this.props;
    const attrs = ['id', 'description', 'external_id', 'released', 'expansion_url', 'autoexpand']
    const newState = {...this.state}
    attrs.forEach(attr => set(newState.fields, `${attr}.value`, get(version, attr, '') || ''))
    if(version.revision_date)
      newState.fields.revision_date.value = moment(version.revision_date).format('YYYY-MM-DDTHH:mm')
    this.setState(newState);
  }

  onTextFieldChange = event => this.setFieldValue(event.target.id, event.target.value)

  onCheckboxChange = event => this.setFieldValue(event.target.name, event.target.checked)

  onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();
    const isValid = this.setAllFieldsErrors()
    if(isValid) {
      const { version, edit, resource, resourceType } = this.props
      if(version?.url) {
        const isCollectionVersion = (resource || resourceType) === 'collection'
        const payload = this.getValues()

        if(isBoolean(this.state.fields.released.value))
          payload.released = this.state.fields.released.value
        if(this.state.fields.revision_date.value)
          payload.revision_date = moment(payload.revision_date).utc().format('YYYY-MM-DD HH:mm:ss')
        else
          delete payload.revision_date

        if(isCollectionVersion) {
          payload.autoexpand = isBoolean(this.state.fields.autoexpand.value) ? this.state.fields.autoexpand.value : false
          payload.expansion_url = this.state.fields.expansion_url.value || null
        } else {
          delete payload.autoexpand
          delete payload.expansion_url
        }

        let service = APIService.new().overrideURL(version.url)
        service = edit ? service.put(payload) : service.appendToUrl('versions/').post(payload)
        service.then(response => this.handleSubmitResponse(response))
      }
    }
  }

  handleSubmitResponse(response) {
    const { edit, reloadOnSuccess, onClose } = this.props
      const { setAlert } = this.context;
    if(response.status === 201 || response.status === 200) { // success
      setAlert({duration: 2000, message: edit ? this.props.t('repo.success_version_update') : this.props.t('repo.success_version_create'), severity: 'success'})
      onClose(true);
      if(reloadOnSuccess)
        setTimeout(() => window.location.reload(), 1000)
    } else { // error
      const genericError = get(response, '__all__')
      if(genericError) {
        setAlert({duration: 2000, message: genericError.join('<br />'), severity: 'error'})
      } else if(get(response, 'detail')) {
        setAlert({duration: 2000, message: response.detail, severity: 'error'})
      } else if (isObject(response)) {
        setAlert({duration: 2000, message: values(response).join('\n'), severity: 'error'})
      } else {
        setAlert({duration: 2000, message: edit ? this.props.t('repo.error_version_update') : this.props.t('repo.error_version_create'), severity: 'error'})
      }
    }
  }

  render() {
    const { fields } = this.state;
    const { onClose, edit, version, resourceType, resource, t } = this.props;
    const idLabel = fields.id.value ? fields.id.value : 'version-id';
    const resourceTypeLabel = startCase(resourceType)
    const versionLabel = `${version.short_code} [${idLabel}]`;
    const header = edit ? `Edit ${resourceTypeLabel} Version: ${versionLabel}` : `New ${resourceTypeLabel} Version: ${versionLabel}`;
    return (
      <div className='col-xs-12' style={{marginBottom: '30px'}}>
          <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px'}}>
          <h2>{header}</h2>
            <span>
              <CloseIconButton color='secondary' onClick={onClose} />
            </span>
          </div>
        <div className='col-xs-12 padding-0'>
          <form>
            {
              !edit &&
              <div className='col-xs-12 padding-0' style={{width: '100%', marginTop: '15px'}}>
                <TextField
                  error={Boolean(fields.id.errors[0])}
                  id="id"
                  label={t('repo.version.form.id.label')}
                  variant="outlined"
                  fullWidth
                  required
                  onChange={this.onTextFieldChange}
                  value={fields.id.value}
                  disabled={edit}
                  helperText={t('repo.version.form.id.helper_text')}
                />
              </div>
            }
            <div className='col-xs-12 padding-0' style={{width: '100%', marginTop: '15px'}}>
              <TextField
                error={Boolean(fields.description.errors[0])}
                id="description"
                label={t('common.description')}
                variant="outlined"
                fullWidth
                required
                onChange={this.onTextFieldChange}
                value={fields.description.value}
                multiline
                rows={3}
              />
            </div>
            <div className='col-xs-12 padding-0' style={{width: '100%', marginTop: '15px'}}>
              <TextField
                error={Boolean(fields.external_id.errors[0])}
                id="external_id"
                label={t('common.external_id')}
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.external_id.value}
              />
            </div>
            <div className='col-xs-12 padding-0' style={{width: '100%', marginTop: '15px'}}>
              <TextField
                error={Boolean(fields.revision_date.errors[0])}
                id="revision_date"
                label={t('repo.revision_date')}
                variant="outlined"
                fullWidth
                onChange={this.onTextFieldChange}
                value={fields.revision_date.value || ''}
                type='datetime-local'
                InputLabelProps={{ shrink: true }}
              />
            </div>
            {
              resource === 'collection' && edit &&
              <div className='col-xs-12 padding-0' style={{width: '100%', marginTop: '15px'}}>
                <Autocomplete
                  disablePortal
                  id="expansion_url"
                  options={map(this.props.expansions, expansion => ({...expansion, label: `${expansion.mnemonic} (${expansion.url})`}))}
                  renderInput={params => <TextField {...params} label={t('repo.expansion_url')} />}
                  onChange={(event, value) => this.setFieldValue('expansion_url', get(value, 'url', ''))}
                  value={fields.expansion_url.value}
                  isOptionEqualToValue={(option, value) => value && option.url === value}
                />
              </div>
            }
            <div className='col-xs-12' style={{width: '100%', marginTop: '15px'}}>
              <FormControlLabel
                control={<Checkbox checked={Boolean(fields.released.value)} onChange={this.onCheckboxChange} name="released" />}
                label={t('common.release')}
              />
            </div>
            {
              resource === 'collection' &&
              <div className='col-xs-12' style={{width: '100%', marginTop: '15px'}}>
                <FormControlLabel
                  control={<Checkbox checked={Boolean(fields.autoexpand.value)} onChange={this.onCheckboxChange} name="autoexpand" />}
                  label={t('repo.autoexpand')}
                  disabled={edit}
                />
              </div>
            }
            <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
              <Button label={t('common.submit')} sx={{backgroundColor: 'surface.s90'}} onClick={this.onSubmit} />
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default withTranslation()(VersionForm);
