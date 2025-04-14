import React from 'react'
import { useHistory, useParams, useLocation } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next';

import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'

import orderBy from 'lodash/orderBy'
import map from 'lodash/map'
import fromPairs from 'lodash/fromPairs'
import isObject from 'lodash/isObject'
import isEmpty from 'lodash/isEmpty'
import forEach from 'lodash/forEach'
import snakeCase from 'lodash/snakeCase'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'
import values from 'lodash/values'
import isArray from 'lodash/isArray'
import keys from 'lodash/keys'
import get from 'lodash/get'

import APIService from '../../services/APIService'
import { WHITE, BLACK } from '../../common/colors'
import { SOURCE_TYPES, COLLECTION_TYPES } from '../../common/constants'
import { fetchLocales } from '../concepts/utils'
import Button from '../common/Button'
import RTEditor from '../common/RTEditor'
import CustomAttributesForm from '../common/CustomAttributesForm'
import { OperationsContext } from '../app/LayoutContext';

import RepoCreateFormHeader from './RepoCreateFormHeader'
import RepoCreateNameDescription from './RepoCreateNameDescription'
import RepoCreateLanguages from './RepoCreateLanguages'
import RepoCreateAdditionalMetadata from './RepoCreateAdditionalMetadata'
import RepoCreatePublisher from './RepoCreatePublisher'

const TabPanel = props => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tab-panel"
      hidden={value !== index}
      id={`vertical-tab-panel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FormSection = ({children, sx}) => (
  <Box
    sx={{ padding: '24px', flexGrow: 1, bgcolor: 'background.paper', display: 'flex', width: 750, borderRadius: '10px', backgroundColor: WHITE, margin: '0 auto', border: '1px solid', borderColor: 'surface.nv80', flexDirection: 'column', ...sx }}
  >
    {children}
  </Box>
)

const RepoCreate = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const params = useParams()
  const location = useLocation()
  const [step, setStep] = React.useState(params.repo ? 1 : 0)
  const [tab, setTab] = React.useState(0)
  const [locales, setLocales] = React.useState([])
  const [ownerURL, setOwnerURL] = React.useState(params?.ownerType ? `/${params.ownerType}/${params.owner}/` : undefined)
  const [model, setModel] = React.useState({publicAccess: 'View', extras: [{key: '', value: ''}]})
  const [repo, setRepo] = React.useState(null)
  const isEdit = Boolean(params.repo)

  const { setAlert } = React.useContext(OperationsContext);

  const TABS = [
    {
      index: 0,
      id: 'source',
      label: t('repo.source'),
      description: t('repo.create_source_subtext'),
      content: {
        description: t('repo.create_source_description'),
        fields: [
          {'id': 'contentType', required: false, label: t('repo.content_type'), type: 'text'},
          {'id': 'caseSensitive', required: true, label: t('repo.case_sensitive'), type: 'boolean'},
          {'id': 'compositional', required: true, label: t('repo.compositional'), type: 'boolean'},
          {'id': 'versionNeeded', required: true, label: t('repo.version_needed'), type: 'boolean'},
        ]
      },
      types: orderBy(map(SOURCE_TYPES, t => ({id: t, name: t})), 'name')
    },
    {
      index: 1,
      id: 'collection',
      label: t('repo.collection'),
      description: t('repo.create_collection_subtext'),
      content: {
        description: t('repo.create_collection_description'),
        fields: [
          {'id': 'immutable', required: true, label: t('repo.immutable'), type: 'boolean'},
          {'id': 'lockedDate', required: false, label: t('repo.locked_date'), type: 'date'},
          {'id': 'autoexpandHEAD', required: true, label: t('repo.autoexpand_head'), type: 'boolean'},
        ]
      },
      types: orderBy(map(COLLECTION_TYPES, t => ({id: t, name: t})), 'name')
    },
    {
      index: 2,
      id: 'code_system',
      label: t('repo.code_system'),
      description: t('repo.create_code_system_subtext'),
      content: {
        description: t('repo.create_code_system_description'),
        fields: []
      },
      disabled: true
    },
    {
      index: 3,
      id: 'value_set',
      label: t('repo.valueset'),
      description: t('repo.create_valueset_subtext'),
      content: {
        description: t('repo.create_value_set_description'),
        fields: []
      },
      disabled: true
    },
    {
      index: 4,
      id: 'concept_map',
      label: t('repo.concept_map'),
      description: t('repo.create_concept_map_subtext'),
      content: {
        description: t('repo.create_concept_map_description'),
        fields: []
      },
      disabled: true
    },
  ]

  const selectedTab = TABS.find(_tab => _tab.index === tab)

  const REPO_MORE_LINK = 'https://docs.openconceptlab.org/en/latest/oclapi/apireference/sources.html'

  const getRepoURL = () => model?.id ? ownerURL + selectedTab.id + 's' + '/' + model?.id + '/' : false

  const onOwnerChange = (event, item) => setOwnerURL(prev => item?.url || prev)

  const onChange = (id, value) => setModel({...model, [id]: value?.id ? value?.id : value})

  const onAddExtras = () => setModel({...model, extras: [...model.extras, {key: '', value: ''}]})

  const onChangeExtras = (index, field, value) => {
    const newExtras = [...model.extras];
    newExtras[index][field] = value;
    onChange('extras', newExtras)
  }

  const extrasToAPIExtras = () => fromPairs(model.extras.filter(ex => ex?.key).map(({ key, value }) => [key, value]))

  const apiExtrasToExtras = extras => map(extras, (value, key) => ({ key, value }))

  const objToValue = val => isObject(val) && !isEmpty(val) ? JSON.stringify(val) : ''

  const onSubmit = () => {
    const payload = {}
    forEach(model, (value, field) => {
      if('externalID' === field)
        field = 'external_id'
      else if('extras' === field)
        value = extrasToAPIExtras()
      else if('auto' === field)
        value = extrasToAPIExtras()
      else if('type' === field && value)
        field = selectedTab?.id + '_type'
      else
        field = snakeCase(field)
      payload[field] = [true, false].includes(value) ? value : value || null
    })
    let service = getService()
    service = isEdit ? service.put(payload) : service.post(payload)
    service.then(response => {
      if([200, 201].includes(response.status)) {
        setAlert({duration: 2000, message: isEdit ? t('repo.success_update') : t('repo.success_create'), severity: 'success'})
        history.push(response.data.url)
      }
      else {
        let error = compact(flatten(values(response)))
        let field = get(keys(response), 0)
        if(isArray(error) && error[0] && field)
          error = error[0]
        setAlert({duration: 10000, message: `${response.status || field || "Error"}: ${error || response.data?.error || response.data?.detail || (isEdit ? t("repo.error_update") : t("repo.error_create"))}`, severity: 'error'})
      }
    })
  }

  const getService = () => {
    let service = APIService.new().overrideURL(ownerURL)
    if(isEdit)
      service = service.appendToUrl(`${params.repoType}/${params.repo}/`)
    else
      service = service.appendToUrl(selectedTab.id + 's/')
    return service
  }

  const fetchRepo = () => {
    if(params.repo && ownerURL)
      getService().get().then(response => {
        onStepChange(1)
        setRepo(response.data)
        setModelForEdit(response.data)
      })
  }

  const setModelForEdit = data => {
    if(isEdit) {
      data = data || repo
      setModel({id: data.id, fullName: data.full_name, name: data.name, canonicalURL: data.canonical_url, description: data.description, defaultLocale: data.default_locale, supportedLocales: data.supported_locales, type: data?.source_type || data?.collection_type, publicAccess: data.public_access, publisher: data.publisher, purpose: data.purpose, revisionDate: data.revision_date, customValidationSchema: data.custom_validation_schema, externalID: data.external_id, jurisdiction: objToValue(data.jurisdiction), copyright: data.copyright, identifier: objToValue(data.identifier), contact: objToValue(data.contact), contentType: data.content_type, meta: data.meta, experimental: data.experimental, caseSensitive: data.case_sensitive, compositional: data.compositional, versionNeeded: data.version_needed, text: data.text, extras: apiExtrasToExtras(data.extras), website: data.website, autoexpandHEAD: data.autoexpand_head})
    }
  }

  React.useEffect(() => {
    setTab(() => TABS.find(_tab => _tab.id + 's' === params.repoType)?.index || 0)
    fetchRepo()
    fetchLocales(setLocales)
  }, [])

  React.useEffect(() => {
    if(!params.step || params.step === '0')
      setStep(0)
  }, [params])

  const onStepChange = newStep => {
    const isOnStep1 = location.pathname.endsWith('/1/') || location.pathname.endsWith('/1')
    if(newStep == 1){
      if(!isEdit && selectedTab.id === 'collection' && !model.autoexpandHEAD)
        setModel(prev => ({...prev, autoexpandHEAD: true}))
      if(!isOnStep1 && !isEdit) {
        let pathname = location.pathname + '/1'
        history.push(pathname.replace('/1/1', '/').replace('//', '/'))
      }
    } else if(isOnStep1) {
      history.push(location.pathname.replace('/1', '').replace('//', '/'))
    }
    setStep(newStep)
  }

  return (
    <Paper component="div" className='col-xs-12' sx={{borderRadius: '10px', boxShadow: 'none', p: 2, backgroundColor: 'primary.99', height: 'calc(100vh - 100px)', overflow: 'auto'}}>
      {
        step === 1 &&
          <RepoCreateFormHeader
            isEdit={isEdit}
            repoTypeLabel={isEdit ? t('repo.edit_repo') : selectedTab.label}
            onBack={isEdit ? false : () => onStepChange(0)}
          />
      }
      {
        step === 0 &&
          <RepoCreateFormHeader
            repoTypeDescriptionNode={
              <Trans
                i18nKey='repo.create_a_repo_description'
                components={[<a key={REPO_MORE_LINK} className='link' rel='noreferrer noopener' target='_blank' href={REPO_MORE_LINK} />]}
              />
            }
          />
      }
      {
        step == 0 &&
          <Box
            sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', width: 750, borderRadius: '10px', backgroundColor: WHITE, margin: '0 auto', border: '1px solid', borderColor: 'surface.nv80' }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={tab}
              onChange={(event, value) => setTab(value)}
              sx={{
                '.MuiTabs-indicator': {
                  display: 'none'
                }
              }}
            >
              {
                TABS.map(_tab => {
                  const isSelected = _tab.index === tab
                  return(
                    <Tab
                      disabled={_tab.disabled}
                      key={_tab.index}
                      label={
                        <ListItemText
                          primary={_tab.label}
                          secondary={_tab.description}
                          sx={{
                            textAlign: 'left',
                            '.MuiListItemText-primary': {fontSize: '14px', fontWeight: 'bold'},
                            '.MuiListItemText-secondary': {fontSize: '12px', color: 'secondary.60'}
                          }}
                        />
                      }
                      id={`vertical-tab-${_tab.index}`}
                      aria-controls={`vertical-tab-panel-${_tab.index}`}
                      sx={{
                        width: '320px',
                        alignItems: 'flex-start',
                        borderBottom: _tab.index === 4 ? '0' : '1px solid',
                        borderRight: isSelected ? '0' : '1px solid',
                        borderColor: 'surface.nv80',
                        textTransform: 'none',
                        color: isSelected ? `${BLACK} !important` : 'secondary.light'
                      }}
                    />
                  )
                })
              }
            </Tabs>
            {
              TABS.map(_tab => (
                <TabPanel key={_tab.index} value={tab} index={_tab.index}>
                  <Typography sx={{color: 'secondary.40', fontSize: '14px'}}>
                    {_tab.content.description}
                  </Typography>
                  <Button sx={{margin: '24px 0', '.MuiChip-label': {fontWeight: 'bold'}}} label={t('common.create')} variant='outlined' color='primary' onClick={() => onStepChange(1)} />
                </TabPanel>
              ))
            }
          </Box>
      }
      {
        step === 1 &&
          <>
            <FormSection>
              <RepoCreateNameDescription isEdit={isEdit} url={getRepoURL()} ownerURL={ownerURL} onOwnerChange={onOwnerChange} onChange={onChange} config={selectedTab.content} {...model} />
            </FormSection>
            <FormSection sx={{marginTop: '16px'}}>
              <RepoCreateLanguages isEdit={isEdit} locales={locales} onChange={onChange} config={selectedTab.content} {...model} />
            </FormSection>
            <FormSection sx={{marginTop: '16px'}}>
              <RepoCreateAdditionalMetadata isEdit={isEdit} typeLabel={t(`repo.${selectedTab.id}_type`)} types={selectedTab.types} onChange={onChange} config={selectedTab.content} {...model} />
            </FormSection>
            <FormSection sx={{marginTop: '16px'}}>
              <RepoCreatePublisher isEdit={isEdit} onChange={onChange} config={selectedTab.content} {...model} />
            </FormSection>
            <FormSection sx={{marginTop: '16px'}}>
              <div className='col-xs-12 padding-0' style={{marginBottom: '24px'}}>
                <Typography sx={{fontSize: '16px', fontWeight: 'bold'}}>
                  {t('common.about_page')}
                </Typography>
              </div>
              <RTEditor defaultValue={model.text || ''} onChange={value => onChange('text', value)} />
            </FormSection>
            <FormSection sx={{marginTop: '16px'}}>
              <div className='col-xs-12 padding-0'>
                <Typography sx={{fontSize: '16px', fontWeight: 'bold'}}>
                  {t('common.custom_attributes')}
                </Typography>
        </div>
        <CustomAttributesForm extras={model.extras || []} onChange={onChangeExtras} onAdd={onAddExtras} />
            </FormSection>
            <Box
              sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', width: 750, borderRadius: '10px', backgroundColor: WHITE, margin: '0 auto', flexDirection: 'column' }}
            >

        <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
          <Button onClick={onSubmit} color='primary' label={isEdit ? t('common.update') : t('common.create')}/>
              </div>
            </Box>
          </>
      }
    </Paper>
  )
}


export default RepoCreate
