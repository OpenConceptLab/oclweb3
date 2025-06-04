import React from 'react'
import { useTranslation } from 'react-i18next'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
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

import SearchFilters from '../search/SearchFilters';
import { Repo } from '../mappings/FromAndTargetSource'
import ConceptIcon from '../concepts/ConceptIcon'

const diffOrder = ['new', 'changed_retired', 'changed_major', 'changed_minor', 'removed']
const sections = {
  "new": {label: 'New', tooltip: 'Resources added in newer version'},
  changed_retired: {label: 'Retired', tooltip: 'Resources retired in newer version'},
  changed_major: {label: 'Major Change', tooltip: 'Resources with "smart checksum" change between versions'},
  changed_minor: {label: 'Minor Change', tooltip: 'Resources with "standard checksum" change between versions'},
  removed: {tooltip: 'Resource removed in newer version'},
}

const VersionResourcesComparison = ({version1, version2, resource}) => {
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);
  const [response, setResponse] = React.useState(null)
  const [changelog, setChangelog] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [filters, setFilters] = React.useState({})
  const [selected, setSelected] = React.useState([])
  const [expanded, setExpanded] = React.useState([])

  const fetchChangelog = () => {
    if(loading)
      return
    setLoading(true)
    APIService.sources().appendToUrl('$changelog/').post({version1: version1.version_url, version2: version2.version_url, verbosity: 3}).then(res => {
      setResponse(res)
      if(isAccepted(res)) {
        setAlert({severity: 'warning', message: t('repo.version_changelog_request_accepted'), duration: 10000})
      } else if (res?.data?.meta) {
        setChangelog(res.data)
        const diffFields = get(res?.data?.meta?.diff, resource)
        let _filters = {}
        forEach(diffFields, (count, field) => _filters[field] = [[field, count, false]])
        setFilters(_filters)
        let defaultSelected = getDefaultSelected(_filters)
        setSelected(defaultSelected ? [defaultSelected] : [])
        setLoading(false)
      }
    })
  }

  const isAccepted = res => [202, 409].includes(res?.status_code) || res?.data?.task || res?.detail === 'Already Queued'

  React.useState(() => {
    fetchChangelog()
  }, [version1?.version_url, version2?.version_url])

  const getDefaultSelected = (_filters) => {
    if(!isEmpty(_filters))
      return diffOrder.find(field => get(_filters, `${field}.0.1`) !== 0)
    return undefined
  }

  const getChangeURL = entity => {
    let resourceURI = resource + '/' + entity.id + '/'
    return '/concepts/compare?lhs=' + (version1.version_url + resourceURI) + '&rhs=' + (version2.version_url + resourceURI)
  }

  const getViewURL = (entity, section) => {
    let resourceURI = resource + '/' + entity.id + '/'
    if(['removed', 'changed_retired'].includes(section))
      return version1.version_url + resourceURI

    return version2.version_url + resourceURI
  }

  const getApplied = () => {
    if(selected?.length) {
      let applied = {}
      selected.forEach(section => {
        applied[section] = {[section]: true}
      })
      return applied
    }
    return {}
  }

  return (
    <div className='col-xs-12 padding-0' style={{height: '100%'}}>
      <>
        <div className='col-xs-3 split' style={{width: '250px', padding: '0 8px', height: 'calc(100vh - 175px)', overflow: 'auto', borderRight: '0.3px solid', borderColor: COLORS.surface.n90}}>
          <SearchFilters
            resource={resource}
            filters={loading ? {} : filters}
            onChange={newApplied => setSelected(keys(newApplied))}
            fieldOrder={diffOrder}
            appliedFilters={getApplied()}
            filterDefinitions={sections}
            noSubheader
            disabledZero
          />
        </div>
        <div className='col-xs-9 split' style={{width: 'calc(100% - 250px)', paddingRight: 0, paddingLeft: 0, float: 'right', height: '100%'}}>
          {
            (loading || isAccepted(response)) ?
              <div className='col-xs-12' style={{padding: '16px'}}>
                <Skeleton variant="rectangular" width='100%' height={600} />
              </div> :
            <TableContainer sx={{height: 'calc(100vh - 320px)', overflow: 'auto'}}>
              <Table size='small' stickyHeader>
                <TableHead>
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
                </TableHead>
                <TableBody>
                  {
                    map(selected, section => {
                      return map(changelog[resource][section], (change, id) => {
                        const isExpanded = expanded?.includes(id)
                        const mappingChangesKeys = keys(change?.mappings || {})
                        const sectionDefinition = sections[section]
                        return (
                          <>
                            <TableRow key={id}>
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
                                  {sectionDefinition?.label || startCase(section)}
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
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
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
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </>
                        )
                      })

                    })
                  }
                </TableBody>
              </Table>
            </TableContainer>
          }
        </div>
      </>
    </div>
  )

}

export default VersionResourcesComparison;
