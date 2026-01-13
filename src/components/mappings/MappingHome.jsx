import React from 'react';
import { useTranslation } from 'react-i18next'
import { useLocation, useHistory } from 'react-router-dom'

import Fade from '@mui/material/Fade';

import APIService from '../../services/APIService';
import { toParentURI } from '../../common/utils'

import { OperationsContext } from '../app/LayoutContext';
import RetireConfirmDialog from '../common/RetireConfirmDialog'
import MappingHeader from './MappingHeader';
import MappingTabs from './MappingTabs';
import MappingDetails from './MappingDetails'
import MappingForm from './MappingForm'
import MappingIcon from './MappingIcon'
import History from '../concepts/History'

const MappingHome = props => {
  const { t } = useTranslation()
  const location = useLocation()
  const history = useHistory()
  const isInitialMount = React.useRef(true);

  const [mapping, setMapping] = React.useState(props.mapping || {})
  const [versions, setVersions] = React.useState([])
  const [repo, setRepo] = React.useState(props.repo || {})
  const [tab, setTab] = React.useState('metadata')
  const [edit, setEdit] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const [retireDialog, setRetireDialog] = React.useState(false)
  const { setAlert } = React.useContext(OperationsContext);

  React.useEffect(() => {
    setLoading(true)
    setMapping(props.mapping || {})
    setVersions([])
    getService().get().then(response => {
      const resource = response.data
      setMapping(resource)
      props.repo?.id ? setRepo(props.repo) : fetchRepo(resource)
      if(tab === 'history')
        fetchVersions(resource?.url)
      else
        setLoading(false)
    })
  }, [props.mapping?.id, props.url])

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      props?.onClose()
    }
  }, [location])

  const fetchRepo = _mapping => props?.repo?.id ? setRepo(props.repo) : APIService.new().overrideURL(getRepoURL(_mapping)).get().then(response => setRepo(response.data))

  const getRepoURL = _mapping => {
    if(props?.repo?.id)
      return props?.repo?.version_url || props?.repo?.url
    let url = toParentURI(_mapping?.version_url || _mapping?.url || props?.url || '')
    const repoVersion = _mapping?.latest_source_version || mapping?.latest_source_version
    if(repoVersion)
      url += repoVersion + '/'
    return url
  }

  const getService = () => {
    let _mapping = props.mapping?.id ? props.mapping : mapping
    let url = _mapping?.version_url || _mapping.url || props.url
    const parentURL = getRepoURL()
    if(parentURL && _mapping?.id)
      url = `${parentURL}mappings/${encodeURIComponent(_mapping.id)}/`

    return APIService.new().overrideURL(encodeURI(url))
  }

  const fetchVersions = url => {
    if(versions?.length === 0 || url) {
      let _url = url || (props.mapping?.id ? props.mapping : mapping)?.url
      if(!_url)
        return
      setLoading(true)
      const service = APIService.new().overrideURL(_url)
      service.appendToUrl('versions/').get(null, null, {includeCollectionVersions: true, includeSourceVersions: true}).then(response => {
        setVersions(response.data || [])
        setLoading(false)
      })
    }
  }

  const onTabChange = newTab => {
    setTab(newTab)
    if(newTab === 'history')
      fetchVersions()
  }

  const toggleRetire = reason => {
    setRetireDialog(false)
    const isRetired = mapping.retired
    let service = APIService.new().overrideURL(mapping.url)
    service = mapping.retired ? service.appendToUrl('reactivate/').put({comment: reason}) : service.delete({comment: reason})
    service.then(response => {
      if(response?.status === 204) {
        setAlert({severity: 'success', message: isRetired ? t('mapping.success_unretired') : t('mapping.success_retired')})
        history.push(mapping.url)
        setTimeout(() => window.location.reload(), 1000)
      }
      else {
        let error = response?.data?.__all__ || t('mapping.error_update')
        setAlert({severity: 'error', message: error})
      }
    })
  }

  return (mapping?.id && repo?.id) ? (
    <>
      <Fade in={edit}>
        <div className='col-xs-12 padding-0'>
          {
            edit &&
              <MappingForm
                edit
                t={t}
                repoSummary={props.repoSummary}
                mapping={mapping}
                source={repo}
                repo={repo}
                onClose={(updated) => {
                  if(updated?.id)
                    setMapping(updated)
                  setEdit(false)
                }}
              />
          }
        </div>
      </Fade>
      <Fade in={!edit}>
        <div className='col-xs-12' style={{padding: '8px 16px 12px 16px'}}>
          <div className='col-xs-12 padding-0' style={{marginBottom: '12px'}}>
            <MappingHeader mapping={mapping} onClose={props.onClose} repoURL={getRepoURL()} repo={repo} nested={props.nested} onEdit={() => setEdit(true)} onRetire={() => setRetireDialog(true)} />
          </div>
          <MappingTabs tab={tab} onTabChange={(event, newTab) => onTabChange(newTab)} />
          {
            tab === 'metadata' &&
              <div className='col-xs-12' style={{padding: '16px 0', height: 'calc(100vh - 330px)', overflow: 'auto'}}>
                <MappingDetails mapping={mapping} />
              </div>
          }
          {
            tab === 'history' &&
              <History
                versions={versions}
                loading={loading}
                resource='mappings'
                icon={<MappingIcon color='primary' fontSize='small' />}
              />
          }
          <RetireConfirmDialog
            open={retireDialog}
            onClose={() => setRetireDialog(false)}
            title={`${t('common.retire')} ${t('mapping.mapping')}`}
            onSubmit={toggleRetire}
          />
        </div>
      </Fade>
    </>
  ) : null
}


export default MappingHome;
