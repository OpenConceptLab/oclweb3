import React from 'react';
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import Fade from '@mui/material/Fade';

import APIService from '../../services/APIService';
import { toParentURI, dropVersion, getResourceIdFromUrl, latestResolvedRepoVersion } from '../../common/utils'

import { OperationsContext } from '../app/LayoutContext';
import RetireConfirmDialog from '../common/RetireConfirmDialog'
import RemoveFromCollectionDialog from '../collections/RemoveFromCollectionDialog'
import PanelError from '../errors/PanelError';
import MappingHeader from './MappingHeader';
import MappingTabs from './MappingTabs';
import MappingDetails from './MappingDetails'
import MappingForm from './MappingForm'
import MappingIcon from './MappingIcon'
import History from '../concepts/History'

const MappingHome = props => {
  const { t } = useTranslation()
  const history = useHistory()

  const [mapping, setMapping] = React.useState(props.mapping || {})
  const [versions, setVersions] = React.useState([])
  const [repo, setRepo] = React.useState(props.repo || {})
  const [repoVersions, setRepoVersions] = React.useState(props.repoVersions || [])
  const [tab, setTab] = React.useState('metadata')
  const [edit, setEdit] = React.useState(false)
  const [createSimilar, setCreateSimilar] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errorStatus, setErrorStatus] = React.useState(false)
  const [detailsLoaded, setDetailsLoaded] = React.useState(false)

  const [retireDialog, setRetireDialog] = React.useState(false)
  const [removeFromCollectionDialog, setRemoveFromCollectionDialog] = React.useState(false)
  const [removingFromCollection, setRemovingFromCollection] = React.useState(false)
  const { setAlert } = React.useContext(OperationsContext);

  const isInCollection = Boolean(props.repo?.type?.includes('Collection') || props.url?.includes('/collections/'))

  const getActiveMappingId = () => getResourceIdFromUrl(props.url, 'mappings') || mapping?.id

  React.useEffect(() => {
    setLoading(true)
    setDetailsLoaded(false)
    setErrorStatus(false)
    setMapping(props.mapping || {})
    setVersions([])
    const queryParams = isInCollection ? { includeReferences: true, includeResolvedRepoVersions: true } : {}
    getService().get(null, null, queryParams, true).then(response => {
      const status = response?.status || response?.response?.status
      if(status && status !== 200) {
        setErrorStatus(status)
        setLoading(false)
        return
      }
      const resource = response?.data
      setMapping(resource)
      setDetailsLoaded(true)
      props.repo?.id ? setRepo(props.repo) : fetchRepo(resource)
      if(tab === 'history')
        fetchVersions(resource?.url)
      else
        setLoading(false)
    })
  }, [props.mapping?.id, props.url])

  const fetchRepo = _mapping => props?.repo?.id ? setRepo(props.repo) : APIService.new().overrideURL(getRepoURL(_mapping)).get().then(response => setRepo(response.data))

  const getRepoURL = _mapping => {
    if(isInCollection)
      return latestResolvedRepoVersion(mapping)?.version_url ||
             toParentURI((props.mapping?.id ? props.mapping : mapping)?.url || '')
    if(props?.repo?.id)
      return props?.repo?.version_url || props?.repo?.url
    let url = toParentURI(_mapping?.version_url || _mapping?.url || props?.url || '')
    const repoVersion = _mapping?.latest_source_version || mapping?.latest_source_version
    if(repoVersion)
      url += repoVersion + '/'
    return url
  }

  const getFetchParentURL = () => isInCollection ?
                                (props.expansionURL || props.repo?.version_url || props.repo?.url || '') :
                                getRepoURL()

  const getService = () => {
    let _mapping = props.mapping?.id ? props.mapping : mapping
    let url = _mapping?.version_url || _mapping.url || props.url
    const parentURL = getFetchParentURL()
    const mappingId = getActiveMappingId()
    if(parentURL && mappingId)
      url = `${parentURL}mappings/${encodeURIComponent(mappingId)}/`

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
        if(!repoVersions?.length)
          fetchRepoVersions(_url)
        else
          setLoading(false)
      })
    }
  }

  const fetchRepoVersions = url => {
    if(repoVersions.length === 0 && url) {
      APIService.new().overrideURL(dropVersion(toParentURI(url))).appendToUrl('versions/').get().then(response => {
        setRepoVersions(response.data || [])
        setLoading(false)
      })
    } else setLoading(false)
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

  const onRemoveFromCollection = deleteBody => {
    const collectionUrl = dropVersion(props.repo?.version_url || props.repo?.url)
    const body = deleteBody || { ids: (mapping.references || []).map(r => r.id).filter(Boolean) }
    setRemovingFromCollection(true)
    APIService.new().overrideURL(collectionUrl).appendToUrl('references/').delete(body).then(response => {
      setRemovingFromCollection(false)
      if(response?.status === 204 || response?.status === 200) {
        setRemoveFromCollectionDialog(false)
        setAlert({ severity: 'success', message: t('reference.remove_success') })
        props.onClose && props.onClose()
      } else {
        setAlert({ severity: 'error', message: response?.data?.detail || t('common.generic_error') })
      }
    })
  }

  if(errorStatus)
    return <PanelError status={errorStatus} resourceType='mapping' onClose={props.onClose} />

  return (mapping?.id && repo?.id) ? (
    <>
      <Fade in={edit || createSimilar}>
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
          {
            createSimilar &&
              <MappingForm
                t={t}
                repoSummary={props.repoSummary}
                copyFrom={mapping}
                source={repo}
                repo={repo}
                onClose={() => setCreateSimilar(false)}
              />
          }
        </div>
      </Fade>
      <Fade in={!edit && !createSimilar}>
        <div className='col-xs-12' style={{padding: '8px 16px 12px 16px'}}>
          <div className='col-xs-12 padding-0' style={{marginBottom: '12px'}}>
            <MappingHeader mapping={mapping} detailsLoaded={detailsLoaded} onClose={props.onClose} repoURL={getRepoURL()} repo={repo} nested={props.nested} onEdit={() => setEdit(true)} onCreateSimilar={() => setCreateSimilar(true)} onRetire={() => setRetireDialog(true)} isInCollection={isInCollection} onRemoveFromCollection={() => setRemoveFromCollectionDialog(true)} />
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
                repoVersions={repoVersions}
              />
          }
          <RetireConfirmDialog
            open={retireDialog}
            onClose={() => setRetireDialog(false)}
            title={`${t('common.retire')} ${t('mapping.mapping')}`}
            onSubmit={toggleRetire}
          />
          <RemoveFromCollectionDialog
            open={removeFromCollectionDialog}
            onClose={() => setRemoveFromCollectionDialog(false)}
            onConfirm={onRemoveFromCollection}
            resources={[mapping]}
            collectionUrl={dropVersion(props.repo?.version_url || props.repo?.url)}
            lookupCollectionUrl={props.repo?.version_url || props.repo?.url}
            loading={removingFromCollection}
          />
        </div>
      </Fade>
    </>
  ) : null
}


export default MappingHome;
