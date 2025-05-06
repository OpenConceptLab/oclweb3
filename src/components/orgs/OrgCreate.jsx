import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next';

import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import map from 'lodash/map'
import fromPairs from 'lodash/fromPairs'
import forEach from 'lodash/forEach'
import snakeCase from 'lodash/snakeCase'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'
import values from 'lodash/values'
import isArray from 'lodash/isArray'
import keys from 'lodash/keys'
import get from 'lodash/get'

import APIService from '../../services/APIService'
import { WHITE } from '../../common/colors'
import { OperationsContext } from '../app/LayoutContext';
import Button from '../common/Button'
import RTEditor from '../common/RTEditor'
import CustomAttributesForm from '../common/CustomAttributesForm'
import HeaderLogo from '../common/HeaderLogo'

import RepoCreateFormHeader from '../repos/RepoCreateFormHeader'
import OrgIcon from './OrgIcon'
import OrgCreateNameAndDescription from './OrgCreateNameAndDescription'

const ORG_DOCS_LINK = 'https://docs.openconceptlab.org/en/latest/oclapi/apireference/orgs.html'

const FormSection = ({children, sx}) => (
  <Box
    sx={{ padding: '24px', flexGrow: 1, bgcolor: 'background.paper', display: 'flex', width: 900, borderRadius: '10px', backgroundColor: WHITE, margin: '0 auto', border: '1px solid', borderColor: 'surface.nv80', flexDirection: 'column', ...sx }}
  >
    {children}
  </Box>
)

const OrgCreate = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const params = useParams()
  const baseModel = {publicAccess: 'View', extras: [{key: '', value: ''}]}
  const [model, setModel] = React.useState({...baseModel})
  const [org, setOrg] = React.useState(null)
  const isEdit = Boolean(params.org)

  const { setAlert } = React.useContext(OperationsContext);

  const onChange = (id, value) => setModel({...model, [id]: value?.id ? value?.id : value})

  const onAddExtras = () => setModel({...model, extras: [...model.extras, {key: '', value: ''}]})

  const onChangeExtras = (index, field, value) => {
    const newExtras = [...model.extras];
    newExtras[index][field] = value;
    onChange('extras', newExtras)
  }

  const extrasToAPIExtras = () => fromPairs(model.extras.filter(ex => ex?.key).map(({ key, value }) => [key, value]))

  const apiExtrasToExtras = extras => map(extras, (value, key) => ({ key, value }))

  const onSubmit = () => {
    const payload = {}
    forEach(model, (value, field) => {
      if('externalID' === field)
        field = 'external_id'
      else if('extras' === field)
        value = extrasToAPIExtras()
      else if('auto' === field)
        value = extrasToAPIExtras()
      else
        field = snakeCase(field)
      if(value)
        payload[field] = [true, false].includes(value) ? value : value || null
    })
    delete payload.logo
    let service = getService()
    service = isEdit ? service.put(payload) : service.post(payload)
    service.then(response => {
      if([200, 201].includes(response.status)) {
        const successCallback = () => {
          setAlert({duration: 2000, message: isEdit ? t('org.success_update') : t('org.success_create'), severity: 'success'})
          history.push(response.data.url)
        }
        model?.logo?.base64 && model?.logo?.name ? getService().post(model.logo).then(successCallback) : successCallback()
      }
      else {
        let error = compact(flatten(values(response)))
        let field = get(keys(response), 0)
        if(isArray(error) && error[0] && field)
          error = error[0]
        setAlert({duration: 10000, message: `${response.status || field || "Error"}: ${error || response.data?.error || response.data?.detail || (isEdit ? t("org.error_update") : t("org.error_create"))}`, severity: 'error'})
      }
    })
  }

  const getService = () => {
    let service = APIService.orgs()
    if(isEdit)
      service = service.appendToUrl(`${params.org}/`)
    return service
  }

  const fetchOrg = () => {
    if(params.org)
      getService().get().then(response => {
        setOrg(response.data)
        setModelForEdit(response.data)
      })
  }

  const setModelForEdit = data => {
    data = data || org
    setModel({id: data.id, name: data.name, description: data.description, website: data.website, company: data.company, location: data.location, text: data.text, extras: apiExtrasToExtras(data.extras)})
  }

  React.useEffect(() => {
    fetchOrg()
  }, [])

  return (
    <Paper component="div" className='col-xs-12' sx={{borderRadius: '10px', boxShadow: 'none', p: 2, backgroundColor: 'primary.99', height: 'calc(100vh - 100px)', overflow: 'auto'}}>
      <RepoCreateFormHeader
        isEdit={isEdit}
        icon={<OrgIcon strict noTooltip noLink sx={{color: 'primary.main'}} />}
        header={isEdit ? t('org.edit_org') : t('org.create_an_org')}
        repoTypeDescriptionNode={
          <Trans
            i18nKey='org.create_an_org_description'
            components={[<a key={ORG_DOCS_LINK} className='link' rel='noreferrer noopener' target='_blank' href={ORG_DOCS_LINK} />]}
          />
        }
      />
      <>
        <FormSection sx={{marginTop: '16px'}}>
          <OrgCreateNameAndDescription isEdit={isEdit} onChange={onChange} {...model} />
        </FormSection>
        <FormSection sx={{marginTop: '16px'}}>
          <div className='col-xs-12 padding-0' style={{marginBottom: '24px'}}>
            <Typography sx={{fontSize: '16px', fontWeight: 'bold'}}>
              {t('common.logo')}
            </Typography>
          </div>
          <div className='col-xs-12' style={{padding: '0', display: 'flex', alignItems: 'center'}}>
            <HeaderLogo
              isCircle
              style={{background: '#bdbdbd', height: '100px', width: '100px', borderRadius: '50%'}}
              logoURL={org?.logo_url}
              onUpload={(base64, name) => onChange('logo', {base64: base64, name: name})}
              defaultIcon={<OrgIcon noLink strict noTooltip sx={{color: WHITE}} logoClassName='user-img-medium' />}
            />
          </div>
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
          sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', width: 900, borderRadius: '10px', backgroundColor: WHITE, margin: '0 auto', flexDirection: 'column' }}
        >
          <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
            <Button onClick={onSubmit} color='primary' label={isEdit ? t('common.update') : t('common.create')}/>
          </div>
        </Box>
      </>
    </Paper>
  )
}


export default OrgCreate
