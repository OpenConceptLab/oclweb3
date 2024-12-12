import React from 'react';
import * as XLSX from 'xlsx';

import { useTranslation } from 'react-i18next'
import { useLocation, useHistory, useParams } from 'react-router-dom';

import { TableVirtuoso } from 'react-virtuoso';
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl, { useFormControl } from '@mui/material/FormControl';
import { styled } from '@mui/material/styles';
import JoinRightIcon from '@mui/icons-material/JoinRight';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import UploadIcon from '@mui/icons-material/Upload';
import MatchingIcon from '@mui/icons-material/DeviceHub';
import SearchIcon from '@mui/icons-material/Search';

import orderBy from 'lodash/orderBy'
import filter from 'lodash/filter'
import map from 'lodash/map'
import forEach from 'lodash/forEach'
import isEqual from 'lodash/isEqual'
import snakeCase from 'lodash/snakeCase'
import startCase from 'lodash/startCase'
import values from 'lodash/values'
import find from 'lodash/find'
import debounce from 'lodash/debounce'

import APIService from '../../services/APIService';
import { dropVersion, toParentURI, toOwnerURI, highlightTexts } from '../../common/utils';
import { WHITE, SURFACE_COLORS } from '../../common/colors';

import CloseIconButton from '../common/CloseIconButton';
import LoaderDialog from '../common/LoaderDialog';
import Link from '../common/Link'
import Error40X from '../errors/Error40X';
import SearchResults from '../search/SearchResults';
import ConceptHome from '../concepts/ConceptHome'

import RepoHeader from './RepoHeader';


const ALGOS = [
  {id: 'es', label: 'Generic Elastic Search Matching'},
  {id: 'llm', label: 'LLM Matching', disabled: true},
]


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer sx={{maxHeight: 'calc(100vh - 250px)'}} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table {...props} stickyHeader size='small' sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
  ),
  TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} sx={{'.MuiTableCell-head': {padding: '0px 8px'}}} />),
  TableRow,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} sx={{'.MuiTableCell-body': {padding: '2px 8px'}}} />),
};


const SearchField = ({onChange}) => {
  const [input, setInput] = React.useState('')
  const { focused } = useFormControl() || {};
  const _onChange = event => {
    const value = event.target.value
    setInput(value)
    onChange(value)
  }

  const comp = React.useMemo(() => {
    return Boolean(focused || input)
  }, [focused, input]);

  const style = comp ? {height: '31px', paddingLeft: '7px'} : {padding: 0, height: '31px', justifyContent: 'flex-start'}

  return <OutlinedInput
           color='primary'
           value={input}
           onChange={_onChange}
           startAdornment={
             <InputAdornment position="start">
               <SearchIcon color={comp || !focused ? 'primary' : undefined} fontSize='small' />
             </InputAdornment>
           }
           sx={{
             ...style,
             width: comp ? '200px' : '20px',
             '.MuiOutlinedInput-notchedOutline': comp ? {borderColor: 'primary.main'} : {display: 'none'},
             '.MuiInputBase-input': comp ? {marginLeft: '-4px'} : {marginLeft: '-30px'}
           }}
           size='small'
         />
}


const RepoConceptsMatch = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const history = useHistory()
  const params = useParams()

  const [file, setFile] = React.useState(false);
  const [data, setData] = React.useState(false);
  const [searchedRows, setSearchedRows] = React.useState(false);
  const [row, setRow] = React.useState(false)
  const [confidence, setConfidence] = React.useState(false)
  const [conceptsResponse, setConceptsResponse] = React.useState(false)
  const [showItem, setShowItem] = React.useState(false)
  const [status, setStatus] = React.useState(false)
  const [repo, setRepo] = React.useState(false)
  const [owner, setOwner] = React.useState(false)
  const [versions, setVersions] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [algo, setAlgo] = React.useState('es')
  const [algoMenuAnchorEl, setAlgoMenuAnchorEl] = React.useState(null)

  const onAlgoButtonClick = event => setAlgoMenuAnchorEl(algoMenuAnchorEl ? null : event.currentTarget)

  const onAlgoSelect = newAlgo => {
    setAlgo(newAlgo)
    setAlgoMenuAnchorEl(null)
  }

  const handleFileUpload = event => {
    const file = event.target.files[0];
    setFile(file)
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary', raw: true, cellText: true, codepage: 65001 });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' });
      setData(jsonData);
      setSearchedRows(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const getURL = () => ((toParentURI(location.pathname) + '/').replace('//', '/') + params.repoVersion + '/').replace('//', '/')
  const fetchRepo = () => {
    setLoading(true)
    setStatus(false)
    APIService.new().overrideURL(getURL()).get(null, null, {includeSummary: true}, true).then(response => {
      const newStatus = response?.status || response?.response.status
      setStatus(newStatus)
      setLoading(false)
      const _repo = response?.data || response?.response?.data || {}
      setRepo(_repo)
      fetchOwner()
    })
  }

  const fetchOwner = () => {
    APIService.new().overrideURL(toOwnerURI(getURL())).get().then(response => {
      setOwner(response?.data || {})
    })
  }

  const fetchVersions = () => {
    APIService.new().overrideURL(dropVersion(getURL())).appendToUrl('versions/').get(null, null, {verbose:true, includeSummary: true, limit: 100}).then(response => {
      const _versions = response?.data || []
      setVersions(_versions)
      if(!repo.version_url && params.repoVersion !== 'HEAD') {
        const releasedVersions = filter(_versions, {released: true})
        let version = orderBy(releasedVersions, 'created_on', ['desc'])[0] || orderBy(_versions, 'created_on', ['desc'])[0]
        if((version?.version_url || version?.url) != (repo?.version_url || repo?.url))
          onVersionChange(version)
      }
    })
  }

  React.useEffect(() => {
    fetchRepo()
    fetchVersions()
  }, [location.pathname])

  const onVersionChange = version => {
    history.push(version.version === 'HEAD' ? version.url + 'HEAD/concepts/$match' : version.version_url + 'concepts/$match')
  }

  const isSplitView = conceptsResponse !== false
  const getColumns = () => {
    let columns = []
    if(data?.length) {
      const row = data[0]
      columns = map(row, (value, key) => {
        let width;
        if(['id', 'code'].includes(key.toLowerCase()))
          width = '60px'
        if(['changed by', 'creator'].includes(key.toLowerCase()))
          width = '75px'
        else if(['class', 'concept class', 'datatype'].includes(key.toLowerCase()))
          width = '100px'
        return {label: key, dataKey: key, width: width }
      })
    }
    return columns
  }

  const fixedHeaderContent = () => {
    return (
      <TableRow>
        {
          getColumns().map(column => (
            <TableCell key={column.dataKey} variant="head" sx={{width: column.width || undefined}}>
              <b>{column.label}</b>
            </TableCell>
          ))}
      </TableRow>
    );
  }

  const onCSVRowSelect = csvRow => {
    setShowItem(false)
    setRow(csvRow)
    let data = {row: {}, target_repo_url: repo.version_url};
    forEach(csvRow,  (value, key) => {
      if(value) {
        let newValue = value
        let newKey = snakeCase(key.toLowerCase())
        let isList = newValue.includes('\n')

        if(isList)
          newValue = newValue.split('\n')
        if(newKey.includes('class'))
          newKey = 'concept_class'
        if(newKey === 'set_members')
          newKey = 'other_map_codes'
        if(newKey === 'same_as')
          newKey = 'same_as_map_codes'
        if(isList)
          data.row[newKey] = [...(data.row[newKey] || []), ...newValue]
        else
          data.row[newKey] = newValue
      }
    })
    APIService.concepts().appendToUrl('$match/').post(data, null, null, {includeSearchMeta: true, includeMappings: true, mappingBrief: true, mapTypes: 'SAME-AS,SAME AS,SAME_AS', verbose: true}).then(response => {
      setConceptsResponse(response)
      setTimeout(() => {
        highlightTexts(response?.data || [], null, true)
      }, 100)
    })
  }

  const rowContent = (_index, _row) => {
    return (
      <React.Fragment>
        {
          getColumns().map(column => (
            <TableCell
              sx={{cursor: 'pointer', backgroundColor: isEqual(_row, row) ? SURFACE_COLORS.main : WHITE}}
              onClick={() => onCSVRowSelect(_row)}
              key={column.dataKey}
            >
              {_row[column.dataKey]}
            </TableCell>
          ))
        }
      </React.Fragment>
    );
  }

  const getConfidenceNum = item => parseFloat(item.search_meta.search_confidence.match(/\d+(\.\d+)?/)[0])


  const getConfidenceColor = item => {
    const confidence = getConfidenceNum(item)
    let color = 'lightgreen'
    if(confidence < 30)
      color = 'red'
    else if(confidence < 60)
      color = 'lightpink'
    else if(confidence < 90)
      color = 'orange'
    return color
  }

  const onConfidenceClick = (event, item) => {
    event.preventDefault()
    event.stopPropagation()
    setConfidence(item)
    return false
  }

  const onCloseResults = () => {
    setRow(false)
    setConfidence(false)
    setConceptsResponse(false)
    setShowItem(false)
  }

  const searchRows = value => {
    let rows = data
    if(value)
      rows = filter(rows, row => find(values(row), v => v.toLowerCase().search(value.trim().toLowerCase()) > -1))
    setSearchedRows(rows)
  }

  const onSearchInputChange = debounce(value => {
    searchRows(value)
  }, 300)

  const formatMappings = item => {
    let same_as_mappings = []
    let other_mappings = {}
    forEach((item.mappings || []), mapping => {
      let mapType = mapping.map_type
      mapType = mapType.replace('_', '').replace('-', '').replace(' ', '').toLowerCase()
      if(mapType === 'sameas')
        same_as_mappings.push(mapping)
      else {
        other_mappings[mapType] = other_mappings[mapType] || []
        other_mappings[mapType].push(mapping)
      }
    })
    same_as_mappings = orderBy(same_as_mappings, ['cascade_target_source_name', 'to_concept_code', 'cascade_target_concept_name'])
    other_mappings = orderBy(other_mappings, ['map_type', 'cascade_target_source_name', 'to_concept_code', 'cascade_target_concept_name'])
    return (
      <List dense sx={{p: 0}}>
        {
          same_as_mappings.length > 1 &&
            <>
              {
                map(same_as_mappings, (mapping, i) => (
                  <ListItem disablePadding key={i}>
                    <ListItemText
                      primary={`${mapping.cascade_target_concept_name || '-'}`}
                      secondary={`${mapping.cascade_target_source_name}/${mapping.to_concept_code}`}
                      sx={{
                        marginTop: '2px',
                        marginBottom: '2px',
                        '.MuiListItemText-primary': {fontSize: '12px'},
                        '.MuiListItemText-secondary': {fontSize: '12px'}
                      }}
                    />
                  </ListItem>
                ))
              }
            </>
        }
        {
          map(other_mappings, (mappings, mapType) => (
            <React.Fragment key={mapType}>
              {
                map(mappings, (mapping, i) => (
                  <ListItem disablePadding key={i}>
                    <ListItemText
                      primary={`[${mapping.map_type}] ${mapping.cascade_target_concept_name || '-'}`}
                      secondary={`${mapping.cascade_target_source_name}/${mapping.to_concept_code}`}
                      sx={{
                        marginTop: '2px',
                        marginBottom: '2px',
                        '.MuiListItemText-primary': {fontSize: '12px'},
                        '.MuiListItemText-secondary': {fontSize: '12px'}
                      }}
                    />
                  </ListItem>
                ))
              }
            </React.Fragment>
          ))
        }
      </List>
    )
  }

  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '10px'}}>
      <LoaderDialog open={loading} />
      <Paper component="div" className={isSplitView ? 'col-xs-6 split padding-0' : 'col-xs-12 split padding-0'} sx={{boxShadow: 'none', p: 0, backgroundColor: 'white', borderRadius: '10px', border: 'solid 0.3px', borderColor: 'surface.nv80', minHeight: 'calc(100vh - 110px) !important'}}>
        {
          (repo?.id || loading) &&
            <React.Fragment>
              <RepoHeader
                owner={owner}
                repo={repo}
                versions={versions}
                onVersionChange={onVersionChange}
                essentials
              />
              <div className='col-xs-12' style={{backgroundColor: SURFACE_COLORS.main, marginTop: '-15px', paddingBottom: '10px', paddingLeft: '10px'}}>
                <Button
                  component="label"
                  role={undefined}
                  variant="outlined"
                  tabIndex={-1}
                  size='small'
                  sx={{textTransform: 'none', margin: '5px'}}
                  startIcon={<JoinRightIcon />}
                  endIcon={<UploadIcon />}
                >
                  {file?.name ? `${file.name} | Rows: ${data === false ? '...' : data?.length?.toLocaleString() || 0 }` : "Upload file"}
                  <VisuallyHiddenInput
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                  />
                </Button>
                <Button
                  component="label"
                  role={undefined}
                  variant="outlined"
                  tabIndex={-1}
                  size='small'
                  sx={{textTransform: 'none', margin: '5px'}}
                  startIcon={<MatchingIcon />}
                  endIcon={<DownIcon />}
                  onClick={onAlgoButtonClick}
                >
                  {ALGOS.find(_algo => _algo.id === algo).label}
                </Button>
                {
                  Boolean(data?.length) &&
                    <FormControl sx={{margin: '5px'}}>
                      <SearchField onChange={onSearchInputChange} />
                    </FormControl>
                }
              </div>
              <div className='col-xs-12' style={{padding: '0 12px 6px 12px', width: '100%', height: 'calc(100vh - 265px)'}}>
                <TableVirtuoso
                  data={searchedRows}
                  components={VirtuosoTableComponents}
                  fixedHeaderContent={fixedHeaderContent}
                  itemContent={rowContent}
                />
              </div>
            </React.Fragment>
        }
        {
          !loading && status && <Error40X status={status} />
        }
      </Paper>
      <Paper component="div" className={isSplitView ? 'col-xs-6 split padding-0 split-appear' : 'col-xs-6 padding-0'} sx={{width: isSplitView ? 'calc(50% - 16px) !important' : 0, marginLeft: '16px', boxShadow: 'none', p: 0, backgroundColor: WHITE, borderRadius: '10px', border: 'solid 0.3px', borderColor: 'surface.nv80', opacity: isSplitView ? 1 : 0, minHeight: 'calc(100vh - 100px) !important'}}>
        <SearchResults
          resultSize='small'
          sx={{
            borderRadius: '10px 10px 0 0',
            '.MuiTableCell-root': {
              padding: '2px 6px !important'
            },
            '.MuiTableCell-head': {
              padding: '2px 6px !important'
            },
            '.MuiToolbar-root': {
              borderRadius: '10px 10px 0 0',
            }
          }}
          title='Top Matches'
          noCardDisplay
          nested
          results={{results: conceptsResponse.data, total: conceptsResponse.data?.length}}
          resource='concepts'
          noPagination
          noSorting
          resultContainerStyle={{height: showItem?.id ? '25vh' : 'calc(100vh - 200px)'}}
          onShowItemSelect={item => setShowItem(item)}
          selectedToShow={showItem}
          extraColumns={[
            {
              sortable: false,
              id: 'mappings',
              labelKey: 'mapping.same_as_mappings',
              renderer: formatMappings,
            },
            {
              sortable: false,
              id: 'search_meta.search_score',
              labelKey: 'search.score',
              value: 'search_meta.search_score',
              renderer: item => (
                <span style={{display: 'flex'}} onClick={event => onConfidenceClick(event, item)}>
                  <span className='confidence-bar' style={{"--confidence-width": item.search_meta.search_confidence, "--confidence-color": getConfidenceColor(item)}}>
                    <span className="confidence-text">{parseFloat(item.search_meta.search_score).toFixed(2)}</span>
                  </span>
                </span>
              )
            },
            {
              sortable: false,
              id: 'search_meta.search_confidence',
              labelKey: 'search.confidence',
              value: 'search_meta.search_confidence',
              align: 'right'
            }
          ]}
          toolbarControl={<CloseIconButton color='secondary' onClick={onCloseResults}/>}
        />

        <div className={'col-xs-12 padding-0' + (showItem?.id ? ' split-appear' : '')} style={{width: showItem?.id ? '100%' : 0, backgroundColor: WHITE, borderRadius: '10px', height: showItem?.id ? 'calc(100vh - 475px)' : 0, opacity: showItem?.id ? 1 : 0}}>
          {
            showItem?.id &&
              <ConceptHome
                style={{borderRadius: 0, borderTop: 'solid 0.3px', borderColor: SURFACE_COLORS.nv80}}
                detailsStyle={{height: 'calc(100vh - 620px)'}}
                source={repo} repo={repo} url={showItem.url} concept={showItem} onClose={() => setShowItem(false)} nested />
          }
        </div>
      </Paper>
      {
        confidence?.search_meta?.search_confidence &&
          <Dialog
            open
            onClose={() => setConfidence(false)}
            scroll='paper'
            sx={{
              '& .MuiDialog-paper': {
                backgroundColor: 'surface.n92',
                borderRadius: '28px',
                minWidth: '312px',
                minHeight: '262px',
                padding: 0
              }
            }}
          >
            <DialogTitle sx={{p: 3, color: 'surface.dark', fontSize: '22px', textAlign: 'left'}}>
              {t('search.confidence')} - {getConfidenceNum(confidence)}%
            </DialogTitle>
            <DialogContent style={{padding: 0}}>
              <List dense sx={{ width: '100%', bgcolor: 'surface.n92', padding: '0 10px', maxHeight: 700 }}>
                {
                  map(confidence.search_meta.search_highlight, (values, key) => (
                    <React.Fragment key={key}>
                      <ListItem>
                        <ListItemText
                          sx={{
                            '.MuiListItemText-primary': {color: 'surface.dark', fontSize: '12px'},
                            '.MuiListItemText-secondary': {color: 'default.light', fontSize: '14px'}
                          }}
                          primary={startCase(key)}
                          secondary={
                            <React.Fragment>
                              {
                                map(values, value => {
                                  value = value.replaceAll('<em>', '<b>').replaceAll('</em>', '</b>').replaceAll(' ', '&nbsp;')
                                  return (
                                    <Typography
                                      key={value}
                                      component="span"
                                      sx={{ color: 'text.primary', display: 'flex' }}
                                      dangerouslySetInnerHTML={{__html: value}}
                                    />
                                  )})
                              }
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                }
                <ListItem>
                  <ListItemText
                    sx={{
                      '.MuiListItemText-primary': {color: 'surface.dark', fontSize: '12px'},
                      '.MuiListItemText-secondary': {color: 'default.light', fontSize: '14px'}
                    }}
                    primary='Search Score'
                    secondary={
                      <Typography
                        component="span"
                        sx={{ color: 'text.primary', display: 'flex', fontWeight: 'bold' }}
                      >
                        {confidence.search_meta.search_score}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions sx={{p: 3}}>
              <Link sx={{fontSize: '14px'}} label={t('common.close')} onClick={() => setConfidence(false)} />
            </DialogActions>
          </Dialog>
      }
      <Menu
        id="matching-algo"
        anchorEl={algoMenuAnchorEl}
        open={Boolean(algoMenuAnchorEl)}
        onClose={onAlgoButtonClick}
        MenuListProps={{
          'aria-labelledby': 'matching-algo',
          role: 'listbox',
        }}
      >
        {ALGOS.map(_algo => (
          <MenuItem
            key={_algo.id}
            disabled={_algo.disabled}
            selected={_algo.id === algo}
            onClick={() => onAlgoSelect(_algo.id)}
          >
            {_algo.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}

export default RepoConceptsMatch
