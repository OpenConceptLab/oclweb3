import React from 'react';
import { Trans, withTranslation } from 'react-i18next';
import {
  Tooltip, Button, ButtonGroup, TextField, FormControlLabel, Checkbox, CircularProgress,
  FormHelperText
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Http as URLIcon,
  Description as DocIcon
} from '@mui/icons-material';
import { Alert } from '@mui/material';
import { cloneDeep, get } from 'lodash';
import APIService from '../../services/APIService';
import JSONIcon from '../common/JSONIcon';
import FileUploader from '../common/FileUploader';
import { OperationsContext } from '../app/LayoutContext';
import NamespaceDropdown from '../url-registry/NamespaceDropdown'

class NewImport extends React.Component {
  static contextType = OperationsContext;

  constructor(props) {
    super(props);
    this.defaultState = {
      queue: '',
      parallel: true,
      hierarchy: false,
      workers: 2,
      file: null,
      fileURL: '',
      owner: {type: 'User'},
      npmPackageName: '',
      npmPackageVersion: '',
      json: '',
      type: 'upload',
      update_if_exists: true,
      isUploading: false,
    };
    this.state = cloneDeep(this.defaultState)
  }

  reset = () => this.setState(cloneDeep({...this.defaultState, type: this.state.type}))

  onTypeClick = type => this.setState({type: type})

  getButton = (type, icon, tooltip) => {
    const isSelected = this.state.type === type;
    const variant = isSelected ? 'contained' : 'outlined';
    return (
      <Tooltip arrow title={tooltip}>
        <Button variant={variant} onClick={() => this.onTypeClick(type)}>
          {icon}
        </Button>
      </Tooltip>
    )
  }

  setFieldValue = (id, value) => this.setState({[id]: value})

  canUpload() {
    const { type, fileURL, npmPackageName, npmPackageVersion, json, file } = this.state
    if(type === 'upload')
      return Boolean(file)
    if(type === 'url')
      return Boolean(fileURL)
    if(type === 'npm')
      return (Boolean(npmPackageName) && Boolean(npmPackageVersion)) || Boolean(file)
    if(type === 'json')
      return Boolean(json)

    return false
  }

  getPayload() {
    const { type, fileURL, npmPackageName, npmPackageVersion, owner, json, file, workers, hierarchy } = this.state
    const eligibleWorkers = hierarchy ? 1 : workers
    if(type === 'upload'){
      const formData = new FormData()
      formData.append('file', file)
      formData.append('parallel', eligibleWorkers)
      return formData
    }
    if(type === 'url') {
      const formData = new FormData()
      formData.append('file_url', fileURL)
      formData.append('parallel', eligibleWorkers)
      return formData
    }
    if(type === 'json') {
      const formData = new FormData()
      formData.append('parallel', eligibleWorkers)
      formData.append('data', json)
      return formData
    }
    if(type === 'npm') {
      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      } else {
        formData.append('file_url', 'https://packages.simplifier.net/' + npmPackageName + '/' +
                        npmPackageVersion)
      }
      formData.append('import_type', 'npm')
      formData.append('owner_type', owner.type)
      if(owner.type === 'User') {
        formData.append('owner', owner.username)
      } else {
        formData.append('owner', owner.id)
      }

      return formData
    }
  }

  getService() {
    let service = APIService.new().overrideURL('/importers/bulk-import-parallel-inline/')
    if (this.state.type === 'npm') {
      service = APIService.new().overrideURL('/importers/bulk-import/')
    }
    if(this.state.queue)
      service.appendToUrl(`${this.state.queue}/`)
    return service
  }

  getHeaders() {
    const { type } = this.state
    if(type !== 'json')
      return {"Content-Type": "multipart/form-data"}

    return {}
  }

  onUpload = () => {
    const { setAlert } = this.context;
    const { t } = this.props
    this.setState({isUploading: true}, () => {
      this.getService().post(this.getPayload(), null, this.getHeaders()).then(res => {
        this.setState({isUploading: false}, () => {
          setTimeout(this.props.onUploadSuccess, 2500)
          if(res.status === 202) {
            this.reset()
            setAlert({severity: 'success', message: t('success.queued')})
          }
          else
            setAlert({severity: 'error', message: get(res, 'exception') || t('errors.generic')})
        })
      })
    })
  }

  render() {
    const { type, queue, fileURL, npmPackageName, npmPackageVersion,
            json, update_if_exists, isUploading, hierarchy } = this.state;
    const { t } = this.props
    const isUpload = type === 'upload';
    const isURL = type === 'url';
    const isJSON = type === 'json';
    const isNPM = type === 'npm';
    const canUpload = this.canUpload();

    return (
      <React.Fragment>
        <h3 style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span>
            New Import
          </span>
          <span>
            <ButtonGroup color='primary' size='small' disabled={isUploading}>
              { this.getButton('upload', <UploadIcon />, t('import.upload_file_tooltip')) }
              { this.getButton('json', <JSONIcon />, t('import.json_data_tooltip')) }
              { this.getButton('url', <URLIcon />, t('import.url_tooltip')) }
              { this.getButton('npm', <div>NPM</div>, t('import.npm_tooltip'))}
            </ButtonGroup>
          </span>
        </h3>
        {
          isUploading ?
            <div className='col-xs-12 padding-0' style={{textAlign: 'center'}}>
              <CircularProgress style={{margin: '50px'}} />
            </div> :
          <div className='col-xs-12 padding-0'>
            <div className='col-xs-12 padding-0'>
              <TextField
                fullWidth
                size='small'
                id='queue'
                variant='outlined'
                label={t('import.queue_id_label')}
                placeholder={t('import.queue_id_placeholder')}
                value={queue}
                onChange={event => this.setFieldValue('queue', event.target.value)}
              />
              <FormHelperText style={{marginLeft: '2px'}}>
                {t('import.queue_id_helper_text')}
              </FormHelperText>
            </div>
            {
              !isNPM &&
                <div className='col-xs-6 padding-0'>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={update_if_exists}
                        onChange={event => this.setFieldValue('update_if_exists', event.target.checked)}
                        name='update_if_exists'
                      />
                    }
                    label={t('import.update_if_exists_label')}
                  />
                  <FormHelperText style={{marginTop: '-5px', marginLeft: '2px'}}>
                    {t('import.update_if_exists_helper_text')}
                  </FormHelperText>
                </div>
            }
            {
              !isNPM &&
                <div className='col-xs-6 padding-0'>
                  <div className='col-xs-12 padding-0'>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={hierarchy}
                          onChange={event => this.setFieldValue('hierarchy', event.target.checked)}
                          name='hierarchy'
                        />
                      }
                      label={t('common.hierarchy')}
                    />
                    <FormHelperText style={{marginTop: '-5px', marginLeft: '2px'}}>
                      {t('import.hierarchy_helper_text')}
                    </FormHelperText>
                  </div>
                </div>
            }
            <div className='col-xs-12 padding-0' style={{margin: '10px 0'}}>
              {
                isUpload &&
                  <FileUploader
                    uploadButton={false}
                    onUpload={uploadedFile => this.setFieldValue('file', uploadedFile)}
                    onLoading={() => this.setFieldValue('file', null)}
                    accept='application/json, application/JSON, .csv, text/comma-separated-values, text/csv, application/csv, application/zip, text/zip, .zip'
                  />
              }
              {
                isURL &&
                  <TextField
                    fullWidth
                    size='small'
                    id='fileURL'
                    type='url'
                    required
                    variant='outlined'
                    label={t('import.file_url_label')}
                    value={fileURL}
                    onChange={event => this.setFieldValue('fileURL', event.target.value)}
                  />
              }
              {
                isNPM && <div>
                           <div className='col-xs-12 padding-0'>
                             <NamespaceDropdown
                               asOwner
                               size='small'
                               label={t('common.owner')}
                               id='import.owner'
                               onChange={(event, item) => this.setFieldValue('owner', item)}
                             />
                             <FormHelperText style={{marginLeft: '2px'}}>
                               {t('import.owner_helper_text')}
                             </FormHelperText>
                           </div>
                           <div className='col-xs-12 padding-0' style={{marginTop: '10px'}}>
                             <Trans
                               i18nKey='import.provide_npm_name_and_version'
                               components={[<a key='https://registry.fhir.org' className='link' rel='noreferrer noopener' target='_blank' href='https://registry.fhir.org' />]}
                             />

                           </div>
                           <div className='col-xs-12 padding-0 flex-vertical-center' style={{margin: '10px 0'}}>
                             <div className='col-xs-6 padding-left-0'>
                               <TextField
                                 fullWidth
                                 size='small'
                                 id='npmPackageName'
                                 type='text'
                                 variant='outlined'
                                 label={t('import.npm_package_name')}
                                 value={npmPackageName}
                                 onChange={event => this.setFieldValue('npmPackageName', event.target.value)}
                               />
                             </div>
                             <div className='col-xs-6 padding-left-0'>
                               <TextField
                                 fullWidth
                                 size='small'
                                 id='npmPackageVersion'
                                 type='text'
                                 variant='outlined'
                                 label={t('import.npm_package_version')}
                                 value={npmPackageVersion}
                                 onChange={event => this.setFieldValue('npmPackageVersion', event.target.value)}
                               />
                             </div>
                           </div>
                           <div className='col-xs-12 padding-0' style={{marginBottom: '10px'}}>
                             {t('import.or_upload_package_file')}
                           </div>
                           <div className='col-xs-12 padding-0'>
                             <FileUploader
                               uploadButton={false}
                               onUpload={uploadedFile => this.setFieldValue('file', uploadedFile)}
                               onLoading={() => this.setFieldValue('file', null)}
                               accept='application/zip, text/zip, .zip, application/gzip, application/tar+gzip, .tar.gz, .tgz'
                             />
                           </div>
                         </div>
              }
              {
                isJSON &&
                  <TextField
                    multiline
                    rows={12}
                    fullWidth
                    size='small'
                    id='json'
                    type='url'
                    required
                    variant='outlined'
                    label={t('import.json_data_label')}
                    value={json}
                    onChange={event => this.setFieldValue('json', event.target.value)}
                  />
              }
            </div>
          </div>
        }
        <div className='col-xs-12 padding-0' style={{textAlign: 'right'}}>
          <Button
            size='small'
            color='primary'
            variant='outlined'
            startIcon={<UploadIcon fontSize='inherit' />}
            disabled={!canUpload || isUploading}
            onClick={this.onUpload}
          >
            Upload
          </Button>
        </div>
        <div className='col-xs-12 padding-0' style={{marginTop: '10px'}}>
          <Alert icon={<DocIcon fontSize='small' />} severity="info" className='flex-vertical-center'>
            <span>
              <Trans
                i18nKey='import.new_import_footer'
                components={[<a key='https://docs.openconceptlab.org/en/latest/oclapi/apireference/bulkimporting.html' className='link' rel='noreferrer noopener' target='_blank' href='https://docs.openconceptlab.org/en/latest/oclapi/apireference/bulkimporting.html' />]}
              />
            </span>
          </Alert>
        </div>
      </React.Fragment>
  )
}
}

export default withTranslation()(NewImport)
