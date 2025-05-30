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

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import UpIcon from '@mui/icons-material/KeyboardArrowUp';

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

const diffOrder = ['new', 'changed_retired', 'changed_major', 'changed_minor', 'removed']

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

  const getChangeURL = (entity, section) => {
    let resourceURI = resource + '/' + entity.id + '/'
    if(section === 'new')
      return version2.version_url + resourceURI
    if(section === 'removed')
      return version1.version_url + resourceURI
    return '/concepts/compare?lhs=' + (version1.version_url + resourceURI) + '&rhs=' + (version2.version_url + resourceURI)
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
                      <b>{t('common.change')}</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    map(selected, section => {
                      return map(changelog[resource][section], (change, id) => {
                        const isExpanded = expanded?.includes(id)
                        const mappingChangesKeys = keys(change?.mappings || {})
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
                                <Button type='text' href={'#' + getChangeURL(change, section)} size='small' endIcon={<OpenInNewIcon fontSize='inherit' />} target='_blank' sx={{textTransform: 'none'}}>
                                  {startCase(section)}
                                </Button>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <Box sx={{ margin: 1 }}>
                                    <Typography variant="h6" gutterBottom component="div">
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
                                                  <TableCell>{startCase(key)}</TableCell>
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
