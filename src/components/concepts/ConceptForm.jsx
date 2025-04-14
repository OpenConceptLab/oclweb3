import React from 'react';
import { withTranslation } from 'react-i18next';
import { compact, map, isEmpty } from 'lodash';
import TextField from '@mui/material/TextField'
import CloseIconButton from '../common/CloseIconButton';
import APIService from '../../services/APIService'
import FormComponent, { CardSection } from '../common/FormComponent'
import { sortValuesBySourceSummary } from '../repos/utils';
import {
  fetchDatatypes, fetchNameTypes, fetchDescriptionTypes, fetchConceptClasses, fetchLocales
} from './utils';
import { toParentURI } from '../../common/utils'
import Button from '../common/Button'
import AutocompleteGroupByRepoSummary from '../common/AutocompleteGroupByRepoSummary'
import LocaleForm from './LocaleForm'
import Breadcrumbs from '../common/Breadcrumbs'
import CustomAttributesForm from '../common/CustomAttributesForm'


class ConceptForm extends FormComponent  {
  constructor(props) {
    super(props);
    const mandatoryFieldStruct = this.getMandatoryFieldStruct()
    const fieldStruct = this.getFieldStruct()
    this.state = {
      locales: [],
      conceptClasses: [],
      datatypes: [],
      nameTypes: [],
      descriptionTypes: [],
      usedExtras: [],
      parent: null,
      selected_concept_class: null,
      selected_datatype: null,
      manualMnemonic: false,
      manualExternalId: false,
      fields: {
        id: {...mandatoryFieldStruct},
        concept_class: {...mandatoryFieldStruct},
        datatype: {...mandatoryFieldStruct},
        external_id: {...fieldStruct},
        extras: [],
        comment: '',
        parent_concept_urls: [],
        names: [
          this.getNameStruct(true)
        ],
        descriptions: [
        ]
      }
    }
  }

  getNameStruct = (preferred=false) => {
    const mandatoryFieldStruct = this.getMandatoryFieldStruct()
    const fieldStruct = this.getFieldStruct()

    return {
      locale: {...mandatoryFieldStruct},
      name_type: {...mandatoryFieldStruct},
      name: {...mandatoryFieldStruct},
      external_id: {...fieldStruct},
      locale_preferred: {...this.getFieldStruct(preferred)}
    }
  }

  getDescriptionStruct = () => {
    const mandatoryFieldStruct = this.getMandatoryFieldStruct()
    const fieldStruct = this.getFieldStruct()

    return {
      locale: {...mandatoryFieldStruct},
      description_type: {...mandatoryFieldStruct},
      description: {...mandatoryFieldStruct},
      external_id: {...fieldStruct},
      locale_preferred: {...this.getFieldStruct(false)}
    }
  }

  componentDidMount() {
    this.fetchExtrasUsed()
    fetchDatatypes(data => this.setState({datatypes: sortValuesBySourceSummary(data, this.props.repoSummary, 'concepts.datatype')}))
    fetchConceptClasses(data => this.setState({conceptClasses: sortValuesBySourceSummary(data, this.props.repoSummary, 'concepts.concept_class')}))
    fetchNameTypes(data => this.setState({nameTypes: sortValuesBySourceSummary(data, this.props.repoSummary, 'concepts.name_type')}))
    fetchDescriptionTypes(data => this.setState({descriptionTypes: data}))
    fetchLocales(this.prepareLocales, true)
    if(this.props.edit && this.props.concept)
      this.setFieldsForEdit(this.props.concept)
    if(this.props.copyFrom)
      this.fetchConceptToCreate()
    if(!this.props.edit)
      this.setState({parent: this.props.source})
    else
      this.fetchParent()
  }

  setFieldsForEdit = instance => {
    const { edit, copyFrom } = this.props;
    const newState = {...this.state}
    if(edit)
      newState.fields.id.value = instance.id

    newState.fields.concept_class.value = instance.concept_class
    newState.fields.datatype.value = instance.datatype
    newState.fields.external_id.value = copyFrom?.id ? '' : (instance.external_id || '')
    let nameLocaleFields = ['locale', 'name_type', 'locale_preferred', 'name']
    let descriptionLocaleFields = ['locale', 'description_type', 'locale_preferred', 'description']
    if(!copyFrom?.id) {
      nameLocaleFields.push('external_id')
      descriptionLocaleFields.push('external_id')
    }
    if(!isEmpty(instance.names)) {
      newState.fields.names = []
      instance.names?.forEach(name => {
        newState.fields.names.push({
          locale: this.getMandatoryFieldStruct(name.locale),
          name_type: this.getMandatoryFieldStruct(name.name_type),
          locale_preferred: this.getFieldStruct(name.locale_preferred || false),
          name: this.getMandatoryFieldStruct(name.name),
          external_id: this.getFieldStruct(name.external_id || ''),
        })
      })
    }
    if(!isEmpty(instance.descriptions)) {
      newState.fields.descriptions = []
      instance.descriptions?.forEach(desc => {
        newState.fields.descriptions.push({
          locale: this.getMandatoryFieldStruct(desc.locale),
          description_type: this.getMandatoryFieldStruct(desc.description_type),
          locale_preferred: this.getFieldStruct(desc.locale_preferred || false),
          description: this.getMandatoryFieldStruct(desc.description),
          external_id: this.getFieldStruct(desc.external_id || ''),
        })
      })
    }

    newState.fields.extras = isEmpty(instance.extras) ? newState.fields.extras : map(instance.extras, (v, k) => ({key: k, value: v}))
    newState.fields.parent_concept_urls = instance.parent_concept_urls || []
    this.setState(newState);
  }


  prepareLocales = _locales => {
    this.setState({
      locales: sortValuesBySourceSummary(compact(_locales), this.props.repoSummary, 'concepts.locale', true)
    })
  }

  fetchExtrasUsed = () => {
    let URL;
    if(this.props.source)
      URL = this.props.source.url
    else if(this.props.concept)
      URL = toParentURI(this.props.concept.url)

    if(URL)
      APIService.new().overrideURL(URL).appendToUrl('summary/').get(null, null, {verbose: true, distribution: 'concepts_extras'}).then(response => this.setState({usedExtras: response.data?.distribution?.concepts_extras || []}))
  }

  fetchParent = () => {
    if(!this.props.source && this.props.concept) {
      APIService.new().overrideURL(toParentURI(this.props.concept.url)).get().then(response => this.setState({parent: response.data}))
    }
  }

  onAddNameLocale = () => {
    const newState = {...this.state}
    newState.fields.names.push(this.getNameStruct())
    this.setState(newState, () => {
      const el = document.getElementById('locales-names')
      el.scrollTop = el.scrollHeight
    })
  }

  onAddDescriptionLocale = () => {
    this.setState({fields: {...this.state.fields, descriptions: [...this.state.fields.descriptions, this.getDescriptionStruct()]}}, () => {
      const el = document.getElementById('locales-descriptions')
      el.scrollTop = el.scrollHeight
    })
  }

  onAddExtras = () => this.setState({fields: {...this.state.fields, extras: [...this.state.fields.extras, {key: '', value: ''}]}})

  onChange = (id, value) => this.setFieldValue(id, value)

  handleSubmit = event => {
    event.preventDefault()
    event.stopPropagation()
    this.setAllFieldsErrors()
  }


  render() {
    const { t, edit, repoSummary, repo, concept, onClose } = this.props
    const { conceptClasses, datatypes, locales, nameTypes, descriptionTypes, fields } = this.state
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
              id={concept?.id || fields.id.value || '[concept-id]'}
              repoURL={repo?.url}
              concept
            />
          </span>
          <span>
            <CloseIconButton color='secondary' onClick={onClose} />
          </span>
        </div>

        <CardSection title={t('concept.form.concept_details.header')} sx={{p: 2, marginTop: 0}}>
          <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
            <TextField
              fullWidth
              id='id'
              label={t('concept.form.id')}
              variant='outlined'
              required
              size='small'
              onChange={event => this.setFieldValue('id', event.target.value || '')}
              value={fields.id.value}
              disabled={edit}
              error={Boolean(fields.id.errors.length)}
              helperText={fields.id.errors[0]}
            />
          </div>
          <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
            <div className='col-xs-6' style={{padding: '0 8px 0 0'}}>
              <AutocompleteGroupByRepoSummary
                freeSolo={repo?.custom_validation_schema !== "OpenMRS"}
                id="concept_class"
                options={conceptClasses}
                label={t('concept.form.concept_class')}
                onChange={this.setFieldValue}
                value={fields.concept_class.value}
                edit={edit}
                required
                error={Boolean(fields.concept_class.errors.length)}
                helperText={fields.concept_class.errors[0]}
              />
            </div>
            <div className='col-xs-6' style={{padding: '0 0 0 8px'}}>
              <AutocompleteGroupByRepoSummary
                freeSolo={repo?.custom_validation_schema !== "OpenMRS"}
                id="datatype"
                options={datatypes}
                label={t('concept.form.datatype')}
                onChange={this.setFieldValue}
                value={fields.datatype.value}
                edit={edit}
                required
                error={Boolean(fields.datatype.errors.length)}
                helperText={fields.datatype.errors[0]}
              />
            </div>
          </div>
          <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
            <TextField
              fullWidth
              id='id'
              label={t('concept.form.external_id')}
              variant='outlined'
              size='small'
              onChange={event => this.setFieldValue('external_id', event.target.value || '')}
            />
          </div>
        </CardSection>
        <CardSection title={t('concept.form.names.header')}>
          <div id='locales-names' className='col-xs-12 padding-0' style={{maxHeight: '500px', overflow: 'auto'}}>
            {
              map(fields.names, (name, index) => {
                return (
                  <LocaleForm
                    locales={locales}
                    key={index}
                    index={index}
                    localeType='name'
                    field={name}
                    idPrefix={`names.${index}`}
                    localeTypes={nameTypes}
                    onChange={(id, value) => this.setFieldValue(id, value || '')}
                    repoSummary={repoSummary}
                  />
                )})
            }
          </div>
          <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
            <Button label={t('common.add')} sx={{backgroundColor: 'surface.s90'}} onClick={this.onAddNameLocale} />
          </div>
        </CardSection>
        <CardSection title={t('concept.form.descriptions.header')}>
          <div id='locales-descriptions' className='col-xs-12 padding-0' style={{maxHeight: '500px', overflow: 'auto'}}>
            {
              map(fields.descriptions, (description, index) => {
                return (
                  <LocaleForm
                    locales={locales}
                    key={index}
                    index={index}
                    localeType='description'
                    field={description}
                    idPrefix={`descriptions.${index}`}
                    localeTypes={descriptionTypes}
                    onChange={(id, value) => this.setFieldValue(id, value || '')}
                    repoSummary={repoSummary}
                  />
                )})
            }
          </div>
          <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
            <Button label={t('common.add')} sx={{backgroundColor: 'surface.s90'}} onClick={this.onAddDescriptionLocale} />
          </div>
        </CardSection>
        <CardSection title={t('custom_attributes.label')}>
          <CustomAttributesForm extras={fields.extras} onChange={this.setExtrasValue} onAdd={this.onAddExtras} />
        </CardSection>
        <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
          <Button label={t('common.submit')} sx={{backgroundColor: 'surface.s90'}} onClick={this.handleSubmit} />
        </div>
      </div>
    )
  }
}

export default withTranslation()(ConceptForm);
