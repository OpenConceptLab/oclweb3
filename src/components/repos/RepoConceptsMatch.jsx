import React from 'react';
import * as XLSX from 'xlsx';
import moment from 'moment'

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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment';
import FormControl, { useFormControl } from '@mui/material/FormControl';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import JoinRightIcon from '@mui/icons-material/JoinRight';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import UploadIcon from '@mui/icons-material/Upload';
import MatchingIcon from '@mui/icons-material/DeviceHub';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/EditOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import AutoMatchIcon from '@mui/icons-material/ChecklistRtl';
import MediumMatchIcon from '@mui/icons-material/Rule';
import LowMatchIcon from '@mui/icons-material/DynamicForm';
import NoMatchIcon from '@mui/icons-material/RemoveRoad';

import orderBy from 'lodash/orderBy'
import filter from 'lodash/filter'
import map from 'lodash/map'
import forEach from 'lodash/forEach'
import isEqual from 'lodash/isEqual'
import snakeCase from 'lodash/snakeCase'
import values from 'lodash/values'
import find from 'lodash/find'
import debounce from 'lodash/debounce'
import without from 'lodash/without'
import has from 'lodash/has'
import chunk from 'lodash/chunk'
import countBy from 'lodash/countBy'
import sum from 'lodash/sum'
import omit from 'lodash/omit'

import APIService from '../../services/APIService';
import { dropVersion, toParentURI, toOwnerURI, highlightTexts } from '../../common/utils';
import { WHITE, SURFACE_COLORS } from '../../common/colors';

import CloseIconButton from '../common/CloseIconButton';
import LoaderDialog from '../common/LoaderDialog';
import Error40X from '../errors/Error40X';
import SearchResults from '../search/SearchResults';
import ConceptHome from '../concepts/ConceptHome'
import SearchHighlightsDialog from '../search/SearchHighlightsDialog'

import RepoHeader from './RepoHeader';


const UPDATED_COLOR = 'rgba(255, 167, 38, 0.1)'
const CONFIRMED_COLOR = 'rgba(208, 226, 211, 0.5)'
const CONFIRMED_SELECTED_COLOR = 'rgba(208, 226, 211, 1)'

const ALGOS = [
  {id: 'es', label: 'Generic Elastic Search Matching'},
  {id: 'llm', label: 'LLM Matching', disabled: true},
]


const MatchSummaryCard = ({id, icon, title, count, loading, color, selected, onClick }) => {
  const isSelected = id === selected
  return (
    <div className='col-xs-2' style={{paddingLeft: '2px', paddingRight: '12px'}}>
      <Card variant='outlined' sx={{borderColor: isSelected ? color : undefined, cursor: 'pointer'}} onClick={onClick}>
        <CardContent sx={{padding: '4px !important'}}>
          <ListItem sx={{padding: '0 8px'}}>
            <ListItemAvatar>
              <Box sx={{ m: 1, position: 'relative' }}>
                <Avatar sx={{backgroundColor: color}}>
                  {icon}
                </Avatar>
                {loading && (
                  <CircularProgress
                    size={52}
                    sx={{
                      color: color,
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-26px',
                      marginLeft: '-26px',
                    }}
                  />
                )}
              </Box>
            </ListItemAvatar>
            <ListItemText
              primary={title}
              secondary={count?.toLocaleString()}
              sx={{
                paddingLeft: '8px',
                '.MuiListItemText-primary': {
                  fontSize: '12px',
                  color: 'rgba(0, 0, 0, 0.7)'
                },
                '.MuiListItemText-secondary': {
                  color: '#000',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }
              }}
            />
          </ListItem>
        </CardContent>
      </Card>
    </div>
  )
}

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
  TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
  TableRow,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
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

const TableCellAction = ({ isEditing, onEdit, onSave, sx }) => {
  return (
    <TableCell align='center' sx={{width: '40px', padding: 0, ...sx}}>
      {
        isEditing ?
          <IconButton size='small' color='primary' onClick={onSave}>
            <SaveIcon fontSize='inherit' />
          </IconButton> :
        <IconButton size='small' color='primary' onClick={onEdit}>
          <EditIcon fontSize='inherit' />
        </IconButton>
      }
    </TableCell>
  )
}

const RepoConceptsMatch = () => {
  const location = useLocation()
  const history = useHistory()
  const params = useParams()

  const [edit, setEdit] = React.useState([]);
  const [file, setFile] = React.useState(false);
  const [data, setData] = React.useState(false);
  const [columns, setColumns] = React.useState([]);
  const [searchedRows, setSearchedRows] = React.useState(false);
  const [matchedConcepts, setMatchedConcepts] = React.useState([]);
  const [autoMatchCount, setAutoMatchCount] = React.useState(0);
  const [highMatchCount, setHighMatchCount] = React.useState(0);
  const [lowMatchCount, setLowMatchCount] = React.useState(0);
  const [noMatchCount, setNoMatchCount] = React.useState(0);
  const [loadingMatches, setLoadingMatches] = React.useState(false)
  const [startMatchingAt, setStartMatchingAt] = React.useState(false)
  const [endMatchingAt, setEndMatchingAt] = React.useState(false)
  const [selectedMatchBucket, setSelectedMatchBucket] = React.useState(false)
  const [row, setRow] = React.useState(false)
  const [rowIndex, setRowIndex] = React.useState(false)
  const [decisions, setDecisions] = React.useState({})
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
      setColumns(getColumns(jsonData[0]))
    };
    reader.readAsBinaryString(file);
  };


  const onGetCandidates = event => {
    event.stopPropagation()
    event.preventDefault()
    setStartMatchingAt(moment())
    setLoadingMatches(true)
    getRowsResults(searchedRows)
  }

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
  const getColumns = row => {
    let _columns = []
    if(row) {
      _columns = map(row, (value, key) => {
        let width;
        if(['id', 'code'].includes(key.toLowerCase()))
          width = '60px'
        if(['changed by', 'creator'].includes(key.toLowerCase()))
          width = '75px'
        else if(['class', 'concept class', 'datatype'].includes(key.toLowerCase()))
          width = '100px'
        return {label: key, dataKey: key, width: width, original: key }
      })
    }
    return _columns
  }

  const updateColumn = (position, newValue) => {
    setColumns(prev => {
      prev[position].label = newValue
      return prev
    })
  }

  const updateRow = (index, columnKey, newValue) => {
    setSearchedRows(prevData => {
      return map(prevData, (row, i) => (i === index ? {...row, [`${columnKey}__updated`]: newValue} : row))
    })
  }

  const fixedHeaderContent = () => {
    const isEditing = edit?.includes(-1)
    return columns?.length ? (
      <TableRow>
        {
          map(columns, (column, position) => {
            const isUpdatedValue = column.label !== column.original
            return (
              <TableCell
                key={column.dataKey}
                variant="head"
                sx={{
                  width: column.width || undefined,
                  padding: isEditing ? '8px': '0px 8px',
                  backgroundColor: isUpdatedValue ? UPDATED_COLOR : WHITE
                }}
              >
                {
                  isEditing ?
                    <TextField
                      margin="dense"
                      onChange={event => updateColumn(position, event.target.value)}
                      size='small'
                      fullWidth
                      defaultValue={column.label}
                      helperText={column.original}
                      sx={{'.MuiOutlinedInput-root': {padding: '4px 10px'}, '.MuiInputBase-input': {padding: 0}, '.MuiFormHelperText-root': {margin: 0, padding: '2px 0 0 10px', backgroundColor: isUpdatedValue ? UPDATED_COLOR : undefined}}}
                    /> :
                  <b>{column.label}</b>
                }
              </TableCell>
            )
          })
        }
        <TableCellAction
          isEditing={isEditing}
          onSave={() => setEdit(without(edit, -1))}
          onEdit={() => setEdit([...edit, -1])}
        />
      </TableRow>
    ) : null;
  }

  const rowContent = (_index, _row) => {
    const isEditing = edit?.includes(_index)
    const isConfirmed = Boolean(decisions[_index]?.length)
    const bgColor = isEqual(_row, row) ? (isConfirmed ? CONFIRMED_SELECTED_COLOR : SURFACE_COLORS.main) : (isConfirmed ? CONFIRMED_COLOR : WHITE)
    return (
      <React.Fragment>
        {
          map(columns, column => {
            const defaultValue = _row[column.dataKey]
            const value = has(_row, column.dataKey + '__updated') ? _row[column.dataKey + '__updated'] : defaultValue
            const isUpdatedValue = defaultValue !== value
            return (
              <TableCell
                sx={{
                  cursor: 'pointer',
                  backgroundColor: isUpdatedValue ? UPDATED_COLOR : bgColor,
                  padding: isEditing ? '8px' : '6px',
                  verticalAlign: 'baseline'
                }}
                onClick={() => onCSVRowSelect(_row, _index)}
                key={column.dataKey}
              >
                {
                  isEditing ?
                    <TextField
                      margin="dense"
                      multiline
                      size='small'
                      fullWidth
                      defaultValue={value}
                      helperText={defaultValue}
                      onChange={event => updateRow(_index, column.dataKey, event.target.value)}
                      sx={{'.MuiOutlinedInput-root': {padding: '4px 10px'}, '.MuiFormHelperText-root': {margin: 0, padding: '2px 0 0 10px', whiteSpace: 'pre-line', backgroundColor: isUpdatedValue ? UPDATED_COLOR : undefined}}}
                    /> :
                  <span style={{whiteSpace: 'pre-line'}}>{value}</span>
                }
              </TableCell>
            )
          })
        }
        <TableCellAction
          sx={{backgroundColor: bgColor, verticalAlign: 'baseline'}}
          isEditing={isEditing}
          onSave={() => setEdit(without(edit, _index))}
          onEdit={() => setEdit([...edit, _index])}
        />
      </React.Fragment>
    );
  }


  const getRowsResults = async (rows) => {
    const CHUNK_SIZE = 100; // Number of rows per batch
    const MAX_CONCURRENT_REQUESTS = 5; // Number of parallel API requests allowed
    const rowChunks = chunk(rows, CHUNK_SIZE);

    // Function to process a single batch
    const processBatch = async (rowBatch, chunkIndex) => {
      const payload = {
        rows: map(rowBatch, (row, i) => ({ ...prepareRow(row), index: i + chunkIndex * CHUNK_SIZE })),
        target_repo_url: repo.version_url,
        target_repo: {
          'owner': repo.owner,
          'owner_type': repo.owner_type,
          'source_version': repo.version || repo.id,
          'source': repo.short_code || repo.id
        },
      };

      try {
        const response = await APIService.concepts()
              .appendToUrl('$match/')
              .post(payload, null, null, {
                includeSearchMeta: true,
              });

        return response.data || [];
      } catch {
        return [];
      }
    };

    // Function to handle concurrency
    const processWithConcurrency = async () => {
      const queue = rowChunks.slice(); // Copy of all chunks to be processed
      const activeRequests = new Set();

      while (queue.length > 0 || activeRequests.size > 0) {
        // Fill activeRequests up to MAX_CONCURRENT_REQUESTS
        while (queue.length > 0 && activeRequests.size < MAX_CONCURRENT_REQUESTS) {
          const chunkIndex = rowChunks.length - queue.length;
          const rowBatch = queue.shift();
          const promise = processBatch(rowBatch, chunkIndex).then((data) => {
            let matchTypes = map(data, 'results.0.search_meta.match_type')
            let counts = countBy(matchTypes)
            setAutoMatchCount((prev) => prev + (counts?.very_high || 0));
            setHighMatchCount((prev) => prev + (counts?.high || 0));
            setLowMatchCount((prev) => prev + (counts?.low || 0));
            setNoMatchCount((prev) => prev + (sum(values(omit(counts, ['very_high', 'high', 'low']))) || 0));
            setMatchedConcepts((prev) => [...prev, ...data]);
            activeRequests.delete(promise); // Remove from active set after completion
          });
          activeRequests.add(promise);
        }

        // Wait for at least one request to complete before continuing
        await Promise.race(activeRequests);
      }
    };

    await processWithConcurrency();
    setEndMatchingAt(moment())
    setLoadingMatches(false)
  };



  const onCSVRowSelect = (csvRow, index) => {
    if(edit?.length > 0)
      return

    setShowItem(false)
    setRow(csvRow)
    setRowIndex(index)

    let data = {rows: [prepareRow(csvRow)], target_repo_url: repo.version_url};
    APIService.concepts().appendToUrl('$match/').post(data, null, null, {includeSearchMeta: true, includeMappings: true, mappingBrief: true, mapTypes: 'SAME-AS,SAME AS,SAME_AS', verbose: true}).then(response => {
      setConceptsResponse({data: response.data?.results || []})
      setTimeout(() => {
        highlightTexts(response?.data || [], null, true)
      }, 100)
    })
  }

  const prepareRow = csvRow => {
    let row = {}
    forEach(csvRow,  (value, key) => {
      if(value && !has(csvRow, key + '__updated')) {
        key = find(columns, {original: key.replace('__updated', '')})?.label || key
        let newValue = value
        let newKey = snakeCase(key.toLowerCase())
        let isList = newValue.includes('\n')

        if(isList)
          newValue = newValue.split('\n')
        if(key.includes('__updated'))
          newKey = key.replace('__updated', '')
        if(newKey.includes('class'))
          newKey = 'concept_class'
        if(newKey === 'set_members')
          newKey = 'other_map_codes'
        if(newKey === 'same_as')
          newKey = 'same_as_map_codes'
        if(isList)
          row[newKey] = [...(row[newKey] || []), ...newValue]
        else
          row[newKey] = newValue
      }
    })
    return row
  }

  const onConceptSelect = item => {
    setDecisions(prev => {
      prev[rowIndex] = item
      return prev
    })
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
    setRowIndex(false)
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
      <List dense sx={{p: 0, listStyleType: 'disc'}}>
        {
          same_as_mappings.length > 1 &&
            <>
              {
                map(same_as_mappings, (mapping, i) => (
                  <ListItem disablePadding key={i} sx={{display: 'list-item'}}>
                    <ListItemText
                      primary={
                        <>
                          <Typography component='span' sx={{fontSize: '12px', color: 'rgba(0, 0, 0, 0.7)'}}>
                            {`${mapping.cascade_target_source_name}:${mapping.to_concept_code}`}
                          </Typography>
                          <Typography component='span' sx={{fontSize: '13px', marginLeft: '4px'}}>
                            {mapping.cascade_target_concept_name}
                          </Typography>
                        </>
                      }
                      sx={{
                        marginTop: '2px',
                        marginBottom: '2px',
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
                  <ListItem disablePadding key={i} sx={{display: 'list-item'}}>
                    <ListItemText
                      primary={
                        <>
                          <Typography component='span' sx={{fontSize: '12px', color: 'rgba(0, 0, 0, 0.7)'}}>
                            {`${mapping.cascade_target_source_name}:${mapping.to_concept_code}`}
                          </Typography>
                          <Typography component='span' sx={{fontSize: '13px', marginLeft: '4px'}}>
                            {mapping.cascade_target_concept_name}
                          </Typography>
                        </>
                      }
                      sx={{
                        marginTop: '2px',
                        marginBottom: '2px',
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

  const showMatchSummary = Boolean(data?.length && (loadingMatches || matchedConcepts?.length))
  const getMatchingDuration = () => {
    let start = startMatchingAt
    let end = endMatchingAt
    if(!end)
      end = moment()
    if(!start)
      return false
    return `${moment.duration(end.diff(start)).as('minutes').toFixed(2)} minutes`;
  }

  const matchingDuration = getMatchingDuration()

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
                <Button
                  variant='contained'
                  size='small'
                  sx={{textTransform: 'none', margin: '5px'}}
                  endIcon={<DoubleArrowIcon />}
                  disabled={!data?.length}
                  onClick={onGetCandidates}
                >
                  Get Candidates
                </Button>
              </div>
              {
               showMatchSummary &&
                  <div className='col-xs-12' style={{padding: '0 12px 6px 12px', width: '100%'}}>
                    <MatchSummaryCard
                      icon={<AutoMatchIcon />}
                      title="Auto Match"
                      count={autoMatchCount}
                      color='primary.main'
                      loading={loadingMatches}
                      id='very_high'
                      selected={selectedMatchBucket}
                      onClick={() => setSelectedMatchBucket('very_high')}
                    />
                    <MatchSummaryCard
                      icon={<MediumMatchIcon />}
                      title="High Match"
                      count={highMatchCount}
                      color='warning.main'
                      loading={loadingMatches}
                      id='high'
                      selected={selectedMatchBucket}
                      onClick={() => setSelectedMatchBucket('high')}
                    />
                    <MatchSummaryCard
                      icon={<LowMatchIcon />}
                      title="Low Match"
                      count={lowMatchCount}
                      color='secondary.main'
                      loading={loadingMatches}
                      id='low'
                      selected={selectedMatchBucket}
                      onClick={() => setSelectedMatchBucket('low')}
                    />
                    <MatchSummaryCard
                      icon={<NoMatchIcon />}
                      title="No Match"
                      color='error.main'
                      count={noMatchCount}
                      loading={loadingMatches}
                      id='no_match'
                      selected={selectedMatchBucket}
                      onClick={() => setSelectedMatchBucket('no_match')}
                    />
                    {
                      Boolean(matchingDuration) &&
                        <span style={{fontSize: '12px', fontStyle: 'italic'}}>{matchingDuration}</span>
                    }
                  </div>
              }
              <div className='col-xs-12' style={{padding: '0 12px 6px 12px', width: '100%', height: 'calc(100vh - 465px)'}}>
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
          id={rowIndex}
          resultSize='small'
          sx={{
            borderRadius: '10px 10px 0 0',
            '.MuiTableCell-root': {
              padding: '6px !important',
              verticalAlign: 'baseline',
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
          onShowItemSelect={item => {
            setShowItem(item)
            setTimeout(() => {
              highlightTexts([item], null, false)
            }, 100)
          }}
          onSelect={onConceptSelect}
          selected={decisions[rowIndex] || []}
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
          <SearchHighlightsDialog
            open={confidence?.search_meta?.search_confidence}
            onClose={() => setConfidence(false)}
            highlight={confidence.search_meta.search_highlight}
            score={confidence.search_meta.search_score}
          />
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
