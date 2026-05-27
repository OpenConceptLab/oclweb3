import React from 'react'
import { useTranslation } from 'react-i18next'

import APIService from '../../services/APIService';
import { dropVersion } from '../../common/utils'

import { OperationsContext } from '../app/LayoutContext';
import ReferenceHeader from './ReferenceHeader'
import ReferenceDetails from './ReferenceDetails'
import ReferenceTabs from './ReferenceTabs'
import ReferenceExpansionResults from './ReferenceExpansionResults'
import DeleteReferencesDialog from '../collections/DeleteReferencesDialog'

const ReferenceHome = props => {
  const { t } = useTranslation()
  const { reference } = props
  const [loading, setLoading] = React.useState(false)
  const [deleteDialog, setDeleteDialog] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [tab, setTab] = React.useState('metadata')
  const [concepts, setConcepts] = React.useState(false)
  const [conceptHeaders, setConceptHeaders] = React.useState(false)
  const [mappings, setMappings] = React.useState(false)
  const [mappingHeaders, setMappingHeaders] = React.useState(false)
  const activeReferenceIdRef = React.useRef(reference?.id)
  const { setAlert } = React.useContext(OperationsContext);

  const repoURL = props?.repo?.version_url || props?.repo?.url
  const isHeadReferenceUrl = url => {
    const normalizedUrl = (url || '').replace(/\/$/, '')
    return normalizedUrl.includes('/HEAD/') || Boolean(normalizedUrl.match(/\/collections\/[^/]+\/references\/[^/]+$/))
  }
  const isHead = isHeadReferenceUrl(props.url) || isHeadReferenceUrl(repoURL)

  const resetExpansionState = () => {
    setLoading(false)
    setConcepts(false)
    setMappings(false)
    setConceptHeaders(false)
    setMappingHeaders(false)
  }

  React.useEffect(() => {
    activeReferenceIdRef.current = reference?.id
    resetExpansionState()
  }, [reference?.id])

  React.useEffect(() => {
    if(tab === 'expansion')
      getResults({ force: true, reset: true, currentReferenceId: reference?.id })
  }, [reference?.id, tab])

  const onTabChange = newTab => {
    setTab(newTab)
  }

  const getResults = ({ force=false, reset=false, currentReferenceId=reference?.id } = {}) => {
    if(reference.reference_type === 'mappings' && (force || !mappings?.length)) {
      fetchMappings({ reset, currentReferenceId })
    }
    else if (force || !concepts?.length) {
      fetchConcepts({ reset, currentReferenceId })
    }
  }
  const getRefService = () => APIService.new().overrideURL(repoURL).appendToUrl(`references/${reference.id}/`)
  const getReferenceId = () => reference?.id || decodeURIComponent((props.url || '').replace(/\/$/, '').split('/').pop())

  const fetchConcepts = ({ reset=false, currentReferenceId=reference?.id } = {}) => {
    const { limit, page } = getLimits(reset ? false : conceptHeaders)
    if(limit === 0)
      return

    setLoading(true)
    getRefService().appendToUrl('concepts/').get(null, null, {limit: limit, page: page, includeMappings: true, mappingBrief: true}).then(response => {
      if(activeReferenceIdRef.current !== currentReferenceId)
        return

      setConcepts(currentConcepts => (page === 1 ? response.data : [...(currentConcepts || []), ...response.data]))
      setConceptHeaders(response.headers)
      setLoading(false)
    })
  }

  const fetchMappings = ({ reset=false, currentReferenceId=reference?.id } = {}) => {
    const { limit, page } = getLimits(reset ? false : mappingHeaders)
    if(limit === 0)
      return

    setLoading(true)
    getRefService().appendToUrl('mappings/').get(null, null, {limit: limit, page: page}).then(response => {
      if(activeReferenceIdRef.current !== currentReferenceId)
        return

      setMappings(currentMappings => (page === 1 ? response.data : [...(currentMappings || []), ...response.data]))
      setMappingHeaders(response.headers)
      setLoading(false)
    })
  }

  const getLimits = headers => {
    if(headers?.page_number && !headers?.next)
      return { limit: 0, page: 0 }

    return {
      limit: 10,
      page: (parseInt(headers?.page_number || 0, 10)) + 1
    }
  }

  const onLoadMore = (resource) => {
    if(resource === 'concepts')
      fetchConcepts()
    else if (resource === 'mappings')
      fetchMappings()
  }

  const onDeleteReference = deleteBody => {
    const body = deleteBody || { ids: [getReferenceId()].filter(Boolean) }
    setDeleting(true)
    APIService.new().overrideURL(dropVersion(repoURL)).appendToUrl('references/').delete(body).then(response => {
      setDeleting(false)
      if(response?.status === 204 || response?.status === 200) {
        setDeleteDialog(false)
        setAlert({ severity: 'success', message: t('reference.remove_success') })
        props.onDelete && props.onDelete()
        props.onClose && props.onClose()
      } else {
        setAlert({ severity: 'error', message: response?.data?.detail || t('common.generic_error') })
      }
    })
  }



  return (
    <div className='col-xs-12' style={{padding: '8px 16px 12px 16px'}}>
      <ReferenceHeader reference={reference} onClose={props.onClose} onDelete={() => setDeleteDialog(true)} canDelete={isHead} deleteDisabledReason={isHead ? '' : t('reference.not_available_in_version')} />
      <ReferenceTabs tab={tab} onTabChange={(event, newTab) => onTabChange(newTab)} loading={loading} />
      {
        tab === 'metadata' &&
        <ReferenceDetails reference={reference} />
      }
      {
        tab === 'expansion' &&
          <ReferenceExpansionResults reference={reference} loading={loading} concepts={concepts} mappings={mappings} conceptHeaders={conceptHeaders} mappingHeaders={mappingHeaders} onLoadMore={onLoadMore} />
      }
      <DeleteReferencesDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={onDeleteReference}
        references={[{...reference, id: getReferenceId()}]}
        loading={deleting}
      />
    </div>
  )
}

export default ReferenceHome
