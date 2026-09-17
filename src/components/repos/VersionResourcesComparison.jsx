import React from 'react'
import { useTranslation } from 'react-i18next'
import { TableVirtuoso } from 'react-virtuoso'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import UpIcon from '@mui/icons-material/KeyboardArrowUp';
import DiffIcon from '@mui/icons-material/Difference';

import get from 'lodash/get'
import forEach from 'lodash/forEach'
import isEmpty from 'lodash/isEmpty'
import startCase from 'lodash/startCase'
import map from 'lodash/map'
import keys from 'lodash/keys'
import without from 'lodash/without'

import APIService from '../../services/APIService'
import { OperationsContext } from '../app/LayoutContext';
import { COLORS } from '../../common/colors'

import DiffFilterList from './DiffFilterList';
import { Repo } from '../mappings/FromAndTargetSource'
import ConceptIcon from '../concepts/ConceptIcon'

const diffOrder = ['new', 'changed_retired', 'changed_major', 'changed_minor', 'changed_mappings_only', 'removed']
const sections = {
  "new": {label: 'New', tooltip: 'Resources added in newer version'},
  changed_retired: {label: 'Retired', tooltip: 'Resources retired in newer version'},
  changed_major: {label: 'Major Change', tooltip: 'Resources with "smart checksum" change between versions'},
  changed_minor: {label: 'Minor Change', tooltip: 'Resources with "standard checksum" change between versions'},
  changed_mappings_only: {label: 'Mappings Changed', tooltip: 'Concepts whose only change is in their mappings'},
  removed: {label: "Removed", tooltip: 'Resource removed in newer version'},
}

const MAPPING_ONLY_CHANGE_LABELS = {
  new: 'Mappings Added',
  removed: 'Mappings Removed',
  changed_retired: 'Mappings Retired',
  changed_major: 'Mappings Changed (Major)',
  changed_minor: 'Mappings Changed (Minor)',
}

const getChangedMappingsOnlyLabel = mappingChangesKeys => (
  mappingChangesKeys.length === 1 ? MAPPING_ONLY_CHANGE_LABELS[mappingChangesKeys[0]] : null
) || sections.changed_mappings_only.label

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer {...props} ref={ref} sx={{overflow: 'auto'}} />
  )),
  Table: props => (
    <Table {...props} size='small' stickyHeader sx={{borderCollapse: 'separate'}} />
  ),
  TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
  TableRow,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
}

const VersionResourcesComparison = ({version1, version2, resource, isCollection, expansion1, expansion2}) => {
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);
  const [response, setResponse] = React.useState(null)
  const [changelog, setChangelog] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [filters, setFilters] = React.useState({})
  const [selected, setSelected] = React.useState([])
  const [expanded, setExpanded] = React.useState([])

  const versionsMissing = !isCollection && (!version1?.version_url || !version2?.version_url)
  const expansionsMissing = isCollection && (!expansion1?.url || !expansion2?.url)
  const selectionIncomplete = versionsMissing || expansionsMissing
  const fetchedKeyRef = React.useRef(null)

  const fetchChangelog = () => {
    if(loading || selectionIncomplete)
      return
    setLoading(true)
    const request = isCollection ?
      APIService.collections().appendToUrl('expansions/$changelog/').post({expansion1: expansion1.url, expansion2: expansion2.url, verbosity: 3}) :
      APIService.sources().appendToUrl('$changelog/').post({version1: version1.version_url, version2: version2.version_url, verbosity: 3})
    request.then(res => {
      setResponse(res)
      if(isAccepted(res)) {
        setAlert({severity: 'warning', message: t('repo.version_changelog_request_accepted'), duration: 10000})
      } else if (res?.data?.meta) {
        setChangelog(res.data)
        const diffFields = get(res?.data?.meta?.diff, resource)
        let _filters = {}
        forEach(diffFields, (count, field) => field !== 'changed_total' ? _filters[field] = count : null)
        if(resource === 'concepts')
          _filters.changed_mappings_only = keys(get(res, 'data.concepts.changed_mappings_only')).length
        setFilters(_filters)
        let defaultSelected = getDefaultSelected(_filters)
        setSelected(defaultSelected ? [defaultSelected] : [])
        setLoading(false)
      }
    })
  }

  const isAccepted = res => [202, 409].includes(res?.status_code) || res?.data?.task || res?.detail === 'Already Queued'

  React.useEffect(() => {
    if(selectionIncomplete) {
      fetchedKeyRef.current = null
      setChangelog(false)
      setFilters({})
      setSelected([])
      return
    }
    const key = [version1?.version_url, version2?.version_url, expansion1?.url, expansion2?.url, resource].join('|')
    if(fetchedKeyRef.current === key)
      return
    fetchedKeyRef.current = key
    fetchChangelog()
  }, [version1?.version_url, version2?.version_url, expansion1?.url, expansion2?.url, isCollection])

  const getDefaultSelected = (_filters) => {
    if(!isEmpty(_filters))
      return diffOrder.find(field => get(_filters, field) !== 0)
    return undefined
  }

  const getBaseURL1 = () => isCollection ? expansion1?.url : version1?.version_url
  const getBaseURL2 = () => isCollection ? expansion2?.url : version2?.version_url

  const getChangeURL = entity => {
    let resourceURI = resource + '/' + entity.id + '/'
    return '/concepts/compare?lhs=' + (getBaseURL1() + resourceURI) + '&rhs=' + (getBaseURL2() + resourceURI)
  }

  const getViewURL = (entity, section) => {
    let resourceURI = resource + '/' + entity.id + '/'
    if(['removed', 'changed_retired'].includes(section))
      return getBaseURL1() + resourceURI

    return getBaseURL2() + resourceURI
  }

  const flatItems = React.useMemo(() => {
    if(!changelog || !resource)
      return []
    let items = []
    map(selected, section => {
      map(changelog[resource]?.[section], (change, id) => {
        const mappingChangesKeys = keys(change?.mappings || {})
        items.push({type: 'main', id, section, change, mappingChangesKeys})
        if(expanded?.includes(id) && mappingChangesKeys.length > 0)
          items.push({type: 'detail', id, section, change, mappingChangesKeys})
      })
    })
    return items
  }, [selected, changelog, expanded, resource])

  const fixedHeaderContent = () => (
    <TableRow>
      <TableCell />
      <TableCell>
        <b>{t('common.id')}</b>
      </TableCell>
      <TableCell>
        <b>{t('common.name')}</b>
      </TableCell>
      <TableCell>
        <b>{t('common.type_of_change')}</b>
      </TableCell>
      <TableCell />
    </TableRow>
  )

  const itemContent = (_index, item) => {
    const { type, id, section, change, mappingChangesKeys } = item
    const sectionDefinition = sections[section]

    if(type === 'detail') {
      return (
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Box sx={{ margin: 1 }}>
            <Typography variant="h6" gutterBottom component="div" sx={{display: 'flex', alignItems: 'center'}}>
              <DiffIcon fontSize='inherit' sx={{marginRight: '8px'}} color='warning' />
              {t('mapping.mappings')}
            </Typography>
            <Table size="small" aria-label="purchases">
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.id')}</TableCell>
                  <TableCell>{t('mapping.map_type')}</TableCell>
                  <TableCell>{t('mapping.target_source')}</TableCell>
                  <TableCell>{t('mapping.toConcept')}</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  mappingChangesKeys.map(key => {
                    let mappings = change.mappings[key]
                    return map(mappings, mapping => {
                      return (
                        <TableRow key={mapping.id}>
                          <TableCell component="th" scope="row">
                            {mapping.id}
                          </TableCell>
                          <TableCell>{mapping.map_type}</TableCell>
                          <TableCell><Repo mapping={mapping} direction='to' present /></TableCell>
                          <TableCell>{mapping.to_concept}</TableCell>
                          <TableCell>{sections[key]?.label || startCase(key)}</TableCell>
                        </TableRow>
                      )
                    })
                  })
                }
              </TableBody>
            </Table>
          </Box>
        </TableCell>
      )
    }

    const isExpanded = expanded?.includes(id)
    return (
      <React.Fragment>
        <TableCell>
          {
            mappingChangesKeys.length > 0 &&
              <IconButton size='small' onClick={() => setExpanded(isExpanded ? without(expanded, id) : [...expanded, id])}>
                {isExpanded ? <UpIcon fontSize='inherit' /> : <DownIcon fontSize='inherit' />}
              </IconButton>
          }
        </TableCell>
        <TableCell>{change.id}</TableCell>
        <TableCell>{change.display_name}</TableCell>
        <TableCell>
            {section === 'changed_mappings_only'
              ? getChangedMappingsOnlyLabel(mappingChangesKeys)
              : sectionDefinition?.label || startCase(section)}
        </TableCell>
        <TableCell>
          <Button type='text' href={'#' + getViewURL(change, section)} size='small' startIcon={<ConceptIcon selected noTooltip fontSize='inherit' />} target='_blank' sx={{textTransform: 'none'}}>
            View
          </Button>
          {
            ['changed_retired', 'changed_major', 'changed_minor'].includes(section) &&
              <Button color='warning' type='text' href={'#' + getChangeURL(change)} size='small' startIcon={<DiffIcon fontSize='inherit' />} target='_blank' sx={{textTransform: 'none', marginLeft: '12px'}}>
                Compare
              </Button>
          }
        </TableCell>
      </React.Fragment>
    )
  }

  if(versionsMissing) {
    return (
      <div className='col-xs-12' style={{padding: '16px'}}>
        <Skeleton variant="rectangular" width='100%' height={600} />
      </div>
    )
  }

  if(expansionsMissing) {
    return (
      <div className='col-xs-12 padding-0' style={{height: 'calc(100vh - 270px)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Typography variant='body1' color='text.secondary'>
          {t('repo.select_expansions_to_compare')}
        </Typography>
      </div>
    )
  }

  return (
    <div className='col-xs-12 padding-0' style={{height: 'calc(100vh - 270px)'}}>
      <>
        <div className='col-xs-3 split' style={{width: '250px', padding: '0 8px', height: 'calc(100vh - 175px)', overflow: 'auto', borderRight: '0.3px solid', borderColor: COLORS.surface.n90}}>
          <DiffFilterList
            fieldOrder={diffOrder}
            filterDefinitions={sections}
            counts={filters}
            selected={selected}
            onChange={setSelected}
          />
        </div>
        <div className='col-xs-9 split' style={{width: 'calc(100% - 250px)', paddingRight: 0, paddingLeft: 0, float: 'right', height: '100%'}}>
          {
            (loading || isAccepted(response)) ?
              <div className='col-xs-12' style={{padding: '16px'}}>
                <Skeleton variant="rectangular" width='100%' height={600} />
              </div> :
            <TableVirtuoso
              style={{height: 'calc(100vh - 320px)'}}
              data={flatItems}
              components={VirtuosoTableComponents}
              fixedHeaderContent={fixedHeaderContent}
              itemContent={itemContent}
              computeItemKey={(_index, item) => `${item.section}-${item.id}-${item.type}`}
            />
          }
        </div>
      </>
    </div>
  )

}

export default VersionResourcesComparison;
