import React from 'react'
import * as XLSX from 'xlsx';
import moment from 'moment'

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
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';

import JoinRightIcon from '@mui/icons-material/JoinRight';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import UploadIcon from '@mui/icons-material/Upload';
import MatchingIcon from '@mui/icons-material/DeviceHub';
import EditIcon from '@mui/icons-material/EditOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import ConfirmedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import AutoMatchIcon from '@mui/icons-material/ChecklistRtl';
import MediumMatchIcon from '@mui/icons-material/Rule';
import LowMatchIcon from '@mui/icons-material/DynamicForm';
import NoMatchIcon from '@mui/icons-material/RemoveRoad';
import DownloadIcon from '@mui/icons-material/Download';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import orderBy from 'lodash/orderBy'
import filter from 'lodash/filter'
import map from 'lodash/map'
import forEach from 'lodash/forEach'
import snakeCase from 'lodash/snakeCase'
import startCase from 'lodash/startCase'
import values from 'lodash/values'
import find from 'lodash/find'
import without from 'lodash/without'
import has from 'lodash/has'
import compact from 'lodash/compact'
import chunk from 'lodash/chunk'
import get from 'lodash/get'
import countBy from 'lodash/countBy'
import sum from 'lodash/sum'
import omit from 'lodash/omit'
import reject from 'lodash/reject'
import uniq from 'lodash/uniq'
import uniqBy from 'lodash/uniqBy'

import APIService from '../../services/APIService';
import { highlightTexts } from '../../common/utils';
import { WHITE, SURFACE_COLORS, ERROR_COLORS } from '../../common/colors';

import CloseIconButton from '../common/CloseIconButton';
import SearchResults from '../search/SearchResults';
import SearchHighlightsDialog from '../search/SearchHighlightsDialog'
import ConceptHome from '../concepts/ConceptHome'
import RepoSearchAutocomplete from './RepoSearchAutocomplete'

const HEADERS = [
  {id: 'id', label: 'ID'},
  {id: 'name', label: 'Name'},
  {id: 'synonyms', label: 'Synonyms'},
  {id: 'concept_class', label: 'Concept Class'},
  {id: 'datatype', label: 'Datatype'},
  {id: 'same_as_map_codes', label: 'Same As Codes'},
  {id: 'other_map_codes', label: 'Concept Set'},
]

const ROW_STATES = ['readyForReview', 'mapped', 'unmapped']
const MATCH_TYPES = {
  very_high: {
    label: 'Auto Match',
    icon: <AutoMatchIcon fontSize='small' />,
    color: 'primary',
  },
  high: {
    label: 'High Match',
    icon: <MediumMatchIcon fontSize='small' />,
    color: 'warning',
  },
  low: {
    label: 'Low Match',
    icon: <LowMatchIcon fontSize='small' />,
    color: 'secondary',
  },
  no_match: {
    label: 'No Match',
    icon: <NoMatchIcon fontSize='small' />,
    color: 'error',
  },
}

const ALGOS = [
  {id: 'es', label: 'Generic Elastic Search Matching'},
  {id: 'llm', label: 'LLM Matching', disabled: true},
]
const DECISION_TABS = ['map', 'candidates', 'search', 'propose']
const UPDATED_COLOR = ERROR_COLORS['95']

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


const HeaderAutocomplete = ({isUpdatedValue, helperText, ...rest}) => {
  return (
    <Autocomplete
      autoHighlight
      autoComplete
      disableClearable
      disablePortal
      freeSolo
      fullWidth
      size='small'
      getOptionLabel={option => option?.label ? option.label : (find(HEADERS, {id: option})?.label || option)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id || option?.id === value || option === value}
      sx={{
        '.MuiOutlinedInput-root': {
          padding: '4px 10px'
        },
        '.MuiInputBase-input': {
          padding: '0 !important',
          fontSize: '14px',
        },
        '.MuiFormHelperText-root': {
          margin: '0 !important',
          padding: '2px 0 0 6px',
          backgroundColor: isUpdatedValue ? UPDATED_COLOR : undefined
        }
      }}
      renderInput={(params) => <TextField helperText={helperText} margin='dense' size='small' {...params} />}
      options={HEADERS}
      {...rest}
    />
  )
}


const MatchSummaryCard = ({id, icon, label, count, loading, color, selected, onClick }) => {
  const isSelected = id === selected
  return (
    <div className='col-xs-2' style={{padding: '0px 3px', minWidth: '130px', width: 'auto'}}>
      <Card variant={isSelected ? undefined : 'outlined'} sx={{borderColor: isSelected ? color : undefined, cursor: 'pointer', backgroundColor: isSelected ? 'rgba(72,54,255, 0.1)' : WHITE}} onClick={onClick}>
        <CardContent sx={{padding: '0px !important'}}>
          <ListItem sx={{padding: '4px 8px'}}>
            <ListItemAvatar sx={{minWidth: 'auto'}}>
              <Box sx={{ position: 'relative' }}>
                <Avatar sx={{backgroundColor: `${color}.main`, width: '24px', height: '24px'}}>
                  {icon}
                </Avatar>
                {loading && (
                  <CircularProgress
                    size={32}
                    sx={{
                      color: `${color}.main`,
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-16px',
                      marginLeft: '-16px',
                    }}
                  />
                )}
              </Box>
            </ListItemAvatar>
            <ListItemText
              primary={label}
              secondary={count?.toLocaleString()}
              sx={{
                paddingLeft: '12px',
                margin: 0,
                '.MuiListItemText-primary': {
                  fontSize: '10px',
                  color: 'rgba(0, 0, 0, 0.7)'
                },
                '.MuiListItemText-secondary': {
                  color: '#000',
                  fontSize: '14px',
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

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table {...props} stickyHeader size='small' sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
  ),
  TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
  TableRow,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

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


const Matching = () => {
  // project state
  const [name, setName] = React.useState('')
  const [file, setFile] = React.useState(false)
  const [data, setData] = React.useState(false)
  const [columns, setColumns] = React.useState([])
  const [rowStatuses, setRowStatuses] = React.useState({mapped: [], readyForReview: [], unmapped: []})
  const [matchTypes, setMatchTypes] = React.useState({very_high: 0, high: 0, low: 0, no_match: 0})
  const [matchedConcepts, setMatchedConcepts] = React.useState([]);
  const [otherMatchedConcepts, setOtherMatchedConcepts] = React.useState([]);
  const [algo, setAlgo] = React.useState('es')
  const [decisions, setDecisions] = React.useState({})
  const [startMatchingAt, setStartMatchingAt] = React.useState(false)
  const [endMatchingAt, setEndMatchingAt] = React.useState(false)

  const [row, setRow] = React.useState(false)
  const [loadingMatches, setLoadingMatches] = React.useState(false)
  const [edit, setEdit] = React.useState([]);
  const [selectedRowStatus, setSelectedRowStatus] = React.useState('all')
  const [selectedMatchBucket, setSelectedMatchBucket] = React.useState(false)
  const [editName, setEditName] = React.useState(false)
  const [decisionTab, setDecisionTab] = React.useState('map')
  const [algoMenuAnchorEl, setAlgoMenuAnchorEl] = React.useState(null)

  const [matchDialog, setMatchDialog] = React.useState(false)
  const [showHighlights, setShowHighlights] = React.useState(false)
  const [showItem, setShowItem] = React.useState(false)

  // repo state
  const [repo, setRepo] = React.useState(false)
  const [conceptCache, setConceptCache] = React.useState({})

  const rowIndex = row?.__index

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
    setData(prevData => map(prevData, row => (row.__index === index ? {...row, [`${columnKey}__updated`]: newValue} : row)))
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
      setData(map(jsonData, (data, index) => ({...data, __index: index})));
      setColumns(getColumns(jsonData[0]))
    };
    reader.readAsBinaryString(file);
  };

  const onAlgoButtonClick = event => setAlgoMenuAnchorEl(algoMenuAnchorEl ? null : event.currentTarget)

  const onAlgoSelect = newAlgo => {
    setAlgo(newAlgo)
    setAlgoMenuAnchorEl(null)
  }

  const fixedHeaderContent = () => {
    const isEditing = edit?.includes(-1)
    return columns?.length ? (
      <TableRow>
        <TableCell
          sx={{
            width: '16px',
            padding: '0px',
            backgroundColor: WHITE,
          }}
        />
        {
          map(columns, (column, position) => {
            const isUpdatedValue = column.label !== column.original
            const isValidColumn = !isEditing && isValidColumnValue(column.label)
            return (
              <TableCell
                key={column.dataKey}
                variant="head"
                sx={{
                  width: column.width || undefined,
                  padding: isEditing ? '0 8px': '6px',
                  backgroundColor: isUpdatedValue ? UPDATED_COLOR : WHITE
                }}
              >
                {
                  isEditing ?
                    <HeaderAutocomplete
                      isUpdatedValue={isUpdatedValue}
                      helperText={column.original}
                      value={column.label}
                      id={position.toString()}
                      onChange={(event, value) => updateColumn(position, value?.label || value)}
                    /> :
                    <b style={{display: 'flex', alignItems: 'center'}}>
                      {column.label} {isValidColumn ? <ConfirmedIcon sx={{fontSize: '14px', marginLeft: '4px'}} color='success' /> : <CancelOutlinedIcon sx={{fontSize: '14px', marginLeft: '4px'}} color='warning' />}
                    </b>
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
    const isEditing = edit?.includes(_row.__index)
    const bgColor = _row.__index === row.__index ? SURFACE_COLORS.main : WHITE
    const defaultMatchTypeColor = 'rgba(0, 0, 0, 0.05)'
    const matchType = get(find(matchedConcepts, c => c.row.__index === _row.__index), 'results[0].search_meta.match_type')
    const matchTypeColor = matchType ? MATCH_TYPES[matchType].color + '.main' : defaultMatchTypeColor
    return (
      <React.Fragment>
        <TableCell
          align='center'
          sx={{
            backgroundColor: defaultMatchTypeColor,
            ...(showMatchSummary && matchType ? {borderLeft: '2px solid', borderColor: matchTypeColor, borderBottom: '1px solid rgba(224, 224, 224, 1)'} : {}),
            padding: '0px',
            verticalAlign: 'baseline',
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: '10px'
          }}
        >
          {_row.__index + 1}
          </TableCell>
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
                onClick={() => onCSVRowSelect(_row)}
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
                      onChange={event => updateRow(_row.__index, column.dataKey, event.target.value)}
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
          onSave={() => setEdit(without(edit, _row.__index))}
          onEdit={() => setEdit([...edit, _row.__index])}
        />
      </React.Fragment>
    );
  }

  const getPayloadForMatching = (rows, _repo) => {
    return {
      rows: map(rows, row => prepareRow(row)),
      target_repo_url: _repo.version_url || _repo.url,
      target_repo: {
        'owner': _repo.owner,
        'owner_type': _repo.owner_type,
        'source_version': _repo.version || _repo.id,
        'source': _repo.short_code || _repo.id
      },
    }
  }


  const getRowsResults = async (rows) => {
    const CHUNK_SIZE = 300; // Number of rows per batch
    const MAX_CONCURRENT_REQUESTS = 4; // Number of parallel API requests allowed
    const rowChunks = chunk(rows, CHUNK_SIZE);

    // Function to process a single batch
    const processBatch = async (_repo, rowBatch) => {
      const payload = getPayloadForMatching(rowBatch, _repo)

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
    const processWithConcurrency = async (_repo) => {
      const queue = rowChunks.slice(); // Copy of all chunks to be processed
      const activeRequests = new Set();

      while (queue.length > 0 || activeRequests.size > 0) {
        // Fill activeRequests up to MAX_CONCURRENT_REQUESTS
        while (queue.length > 0 && activeRequests.size < MAX_CONCURRENT_REQUESTS) {
          const rowBatch = queue.shift();
          const promise = processBatch(_repo, rowBatch).then((data) => {
            let matchTypes = map(data, 'results.0.search_meta.match_type')
            let counts = countBy(matchTypes)
            setMatchTypes(prev => ({
              very_high: prev.very_high + (counts?.very_high || 0),
              high: prev.high + (counts?.high || 0),
              low: prev.low + (counts?.low || 0),
              no_match: prev.no_match + (sum(values(omit(counts, ['very_high', 'high', 'low']))) || 0)
            }));
            setRowStatuses(prev => {
              prev.readyForReview = [...prev.readyForReview, ...map(data, 'row.__index')]
              return prev
            })
            setMatchedConcepts(prev => [...prev, ...data]);
            activeRequests.delete(promise); // Remove from active set after completion
          });
          activeRequests.add(promise);
        }

        // Wait for at least one request to complete before continuing
        await Promise.race(activeRequests);
      }
    };

    const response = await APIService.new().overrideURL('/$resolveReference/').post({url: repo.version_url || repo.url})
    let _repo = get(response.data, '0.result.id') ? response.data[0].result : repo
    setRepo(_repo)
    await processWithConcurrency(_repo);
    setEndMatchingAt(moment())
    setLoadingMatches(false)
  };


  const prepareRow = csvRow => {
    let row = {}
    forEach(csvRow,  (value, key) => {
      if((value === 0 || value) && !has(csvRow, key + '__updated')) {
        key = find(columns, {original: key.replace('__updated', '')})?.label || key
        let newValue = value
        let newKey = key === '__index' ? key : snakeCase(key.toLowerCase())
        let isList = key === '__index' ? false : newValue.includes('\n')

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

  const isValidColumnValue = value => {
    if(!value)
      return false
    if(value.toLowerCase().includes('class'))
      return true
    if(find(HEADERS, val => val.label.toLowerCase() === value.toLowerCase()))
      return true
    return false
  }


  const onGetCandidates = event => {
    event.stopPropagation()
    event.preventDefault()
    setMatchDialog(true)
  }

  const onGetCandidatesSubmit = event => {
    event.stopPropagation()
    event.preventDefault()
    setStartMatchingAt(moment())
    setLoadingMatches(true)
    getRowsResults(data)
    setMatchDialog(false)
  }

  const showMatchSummary = Boolean(data?.length && (loadingMatches || matchedConcepts?.length))
  const getMatchingDuration = () => {
    let start = startMatchingAt
    let end = endMatchingAt
    if(!end)
      end = moment()
    if(!start)
      return false
    return `${moment.duration(end.diff(start)).as('minutes').toFixed(2)} mins`;
  }

  const getCandidatesButtonLabel = () => {
    const matchingDuration = getMatchingDuration()
    if(loadingMatches)
      return `Getting Candidates (${matchingDuration})`
    if(matchedConcepts?.length)
      return `Re-run? (last: ${matchingDuration})`
    return 'Get Candidates'
  }

  const onMatchTypeChange = bucket => {
    setSelectedMatchBucket(prev => prev === bucket ? false : bucket)
  }

  const getRows = () => {
    let rows = data?.length ? [...data] : []
    if(selectedRowStatus !== 'all')
      rows = filter(rows, r => rowStatuses[selectedRowStatus].includes(r.__index))
    if(selectedMatchBucket) {
      let getIndex = concept => {
        if(selectedMatchBucket === 'no_match')
          return (!concept?.results?.length || !['very_high', 'high', 'low'].includes(concept.results[0].search_meta.match_type)) ? concept.row.__index : null
        return (concept?.results?.length && concept.results[0].search_meta.match_type === selectedMatchBucket) ? concept.row.__index : null
      }
      const rowIndexes = map(matchedConcepts, getIndex)
      rows = filter(rows, r => rowIndexes.includes(r.__index))
    }
    return rows
  }

  const getStatusFromConceptAndRowIndex = (concept, index) => {
    if(isMappedInDecisions(concept, index))
      return 'Mapped'
    if(rowStatuses.unmapped.includes(index))
      return 'Unmapped'
    if(rowStatuses.readyForReview.includes(index))
      return 'Ready for Review'
    return 'No Decision'
  }

  const onDownloadClick = () => {
    const rows = map(data, row => {
      const index = row.__index
      let newRow = {...row, 'Concept ID': [], 'Concept URL': [], 'Match Score': [], 'Match Type': [], 'Decision': []}
      let matched = find(matchedConcepts, concept => concept.row.__index === index)
      let otherMatched = find(otherMatchedConcepts, concept => concept.row.__index === index)
      let matches = orderBy([...(matched?.results || []), ...(otherMatched?.results || [])], 'search_meta.search_score', 'desc')
      if(matches?.length) {
        forEach(matches, concept => {
          newRow['Concept ID'].push(concept.id)
          newRow['Concept URL'].push(concept.version_url)
          newRow['Match Score'].push(concept.search_meta.search_score)
          newRow['Match Type'].push(startCase(concept.search_meta.match_type))
          newRow['Decision'].push(getStatusFromConceptAndRowIndex(concept, index))
          // newRow = {...newRow, 'Concept ID': concept.id, 'Concept URL': concept.url, 'Match Score': concept.search_meta.search_score, 'Match Type': startCase(concept.search_meta.match_type), 'Decision': getStatusFromConceptAndRowIndex(concept, index)}
        })
      } else {
        newRow = {...newRow, 'Match Type': 'No Match'}
      }
      ['Concept ID', 'Concept URL', 'Match Score', 'Match Type', 'Decision'].forEach(col => {
        newRow[col] = newRow[col].join('\n')
      })
      newRow = {...newRow, 'Repo Version': repo.version || repo.id, 'Repo ID': repo.short_code || repo.id, 'Repo URL': repo.version_url || repo.url}
      delete newRow.__index
      return newRow
    })
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");
    XLSX.writeFile(workbook, `${name || 'Matched'}.${moment().format('YYYYMMDDHHmmss')}.csv`, { compression: true });
  }

  const onCSVRowSelect = csvRow => {
    if(edit?.length > 0)
      return

    const matched = get(find(matchedConcepts, concept => concept.row.__index === csvRow.__index), 'results.0')
    let url = matched?.version_url || matched?.url
    if(url)
      APIService
      .new()
      .overrideURL(url)
      .get(null, null, {includeMappings: true, mappingBrief: true, mapTypes: 'SAME-AS,SAME AS,SAME_AS', verbose: true})
      .then(response => {
        const res = {...response.data, search_meta: {...matched.search_meta}}
        setConceptCache({...conceptCache, [url]: res})
        setTimeout(() => {
          highlightTexts([res], null, true)
        }, 100)
      })
    setRow(csvRow)
    setDecisionTab('map')
  }

  const onCloseDecisions = () => {
    setRow(false)
    setShowHighlights(false)
  }

  const onMap = (event, concepts, unmap=false) => {
    event.preventDefault()
    event.stopPropagation()
    let newDecisions = {...(decisions[rowIndex] || {})}
    const conceptURLs = concepts.map(c => c.version_url)
    setRowStatuses(prev => {
      prev.readyForReview = without(prev.readyForReview, rowIndex)
      if(unmap) {
        newDecisions.mapped = reject(newDecisions.mapped, c => conceptURLs.includes(c.version_url))
        if(newDecisions.mapped?.length === 0) {
          prev.mapped = without(uniq(prev.mapped), rowIndex)
          prev.unmapped = uniq([...prev.unmapped, rowIndex])
        }
      }
      else {
        prev.mapped = uniq([...prev.mapped, rowIndex])
        prev.unmapped = without(uniq(prev.unmapped), rowIndex)
      }
      updateMatchTypeCounts(null, prev)
      return prev
    })
    setDecisions(prev => {
      let _decisions = prev[rowIndex] || {}
      _decisions.mapped = unmap ? newDecisions.mapped : uniqBy([...(_decisions.mapped || []), ...concepts], 'version_url')
      return {...prev, [rowIndex]: _decisions}
    })
    return false
  }

  const isMappedInDecisions = (concept, index) => Boolean(find(decisions[index || rowIndex]?.mapped, {version_url: concept.version_url}))

  const onStateTabChange = newValue => {
    setSelectedRowStatus(newValue)
    updateMatchTypeCounts(newValue)
  }

  const updateMatchTypeCounts = (newRowStatus, newRowStatuses) => {
    let rowStatus = newRowStatus || selectedRowStatus
    if(rowStatus === 'all')
      return
    let rows = filter(matchedConcepts, concept => (newRowStatuses || rowStatuses)[newRowStatus || selectedRowStatus].includes(concept.row.__index));
    let matchTypes = map(rows, 'results.0.search_meta.match_type')
    let counts = countBy(matchTypes)
    setMatchTypes({
      very_high: (counts?.very_high || 0),
      high: (counts?.high || 0),
      low: (counts?.low || 0),
      no_match: sum(values(omit(counts, ['very_high', 'high', 'low']))) || 0
    });
  }

  const onDecisionTabChange = (event, newValue) => {
    setShowItem(false)
    setDecisionTab(newValue)
    if(newValue === 'candidates') {
      if(!find(otherMatchedConcepts, c => c.row.__index === rowIndex)) {
        const payload = getPayloadForMatching([row], repo)
        APIService.concepts()
          .appendToUrl('$match/')
          .post(payload, null, null, {
            includeSearchMeta: true,
            includeMappings: true,
            mappingBrief: true,
            mapTypes: 'SAME-AS,SAME AS,SAME_AS',
            verbose: true,
            limit: 4,
            offset: 1
          }).then(response => {
            setOtherMatchedConcepts([...otherMatchedConcepts, ...response.data])
          });
      }
    }
  }


  const matchedResponse = find(matchedConcepts, concept => concept.row.__index === rowIndex)
  const matchedConcept = get(matchedResponse, 'results.0') ? conceptCache[matchedResponse.results[0].version_url || matchedResponse.results[0].url] || matchedResponse.results[0] : null
  const isSplitView = Boolean(matchedResponse?.row?.__index > -1 && rowIndex !== false)
  const rows = getRows()

  const getTitle = () => {
    let title = 'Mapping Project'
    if(!editName && name)
      title += ` - ${name}`
    return title
  }

  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '10px'}}>
      <Paper component="div" className={isSplitView ? 'col-xs-6 split padding-0' : 'col-xs-12 split padding-0'} sx={{boxShadow: 'none', p: 0, backgroundColor: 'white', borderRadius: '10px', border: 'solid 0.3px', borderColor: 'surface.nv80', minHeight: 'calc(100vh - 100px) !important'}}>
        <Paper component="div" className='col-xs-12' sx={{backgroundColor: 'surface.main', boxShadow: 'none', padding: '4px 16px 8px 16px', borderRadius: '10px 10px 0 0'}}>
          <Typography component='span' sx={{fontSize: '28px', color: 'surface.dark', fontWeight: 600, display: 'flex', alignItems: 'center'}}>
            {getTitle()}
            {
              editName ?
                <TextField
                  size='small'
                  sx={{marginLeft: '16px', width: '250px'}}
                  value={name}
                  onChange={event => setName(event.target.value || '')}
                  onBlur={() => setEditName(false)}
                /> :
              <EditIcon sx={{marginLeft: '16px'}} onClick={() => setEditName(true)} />
            }
          </Typography>

          <div className='col-xs-12' style={{backgroundColor: SURFACE_COLORS.main, marginLeft: '-5px', paddingBottom: '0px', paddingLeft: '0px', paddingTop: '0px'}}>
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
              {
                file?.name ? file.name : "Upload file"
              }
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
            <Button
              variant='contained'
              size='small'
              sx={{textTransform: 'none', margin: '5px'}}
              endIcon={<DoubleArrowIcon />}
              disabled={!rows?.length || loadingMatches}
              onClick={onGetCandidates}
            >
              {getCandidatesButtonLabel()}
            </Button>
            {
              showMatchSummary && !loadingMatches &&
                <Button
                  variant='contained'
                  color='secondary'
                  size='small'
                  sx={{textTransform: 'none', margin: '5px'}}
                  endIcon={<DownloadIcon />}
                  onClick={onDownloadClick}
                >
                  Download
                </Button>
            }
          </div>
        </Paper>
        {
          (Boolean(rows?.length) || selectedMatchBucket || ROW_STATES.includes(selectedRowStatus)) &&
            <div className='col-xs-12' style={{padding: '0', width: '100%', height: isSplitView ? 'calc(100vh - 245px)' : 'calc(100vh - 195px)'}}>
              <Tabs
                size='small'
                variant='fullWidth'
                value={selectedRowStatus}
                onChange={(event, newValue) => onStateTabChange(newValue)}
                sx={{minHeight: '38px', height: '38px'}}
              >
                <Tab
                  size='small'
                  label={`All (${data.length.toLocaleString()})`}
                  value='all'
                  sx={{padding: '2px 6px', minHeight: '38px', height: '38px', textTransform: 'none'}}
                />
                {
                  ROW_STATES.map(state => {
                    let count = rowStatuses[state].length
                    return (
                      <Tab
                        size='small'
                        sx={{padding: '2px 6px !important', minHeight: '38px', height: '38px', textTransform: 'none'}}
                        value={state}
                        key={state}
                        disabled={count === 0}
                        label={`${startCase(state)} (${count.toLocaleString()})`}
                      />
                    )
                  })
                }
              </Tabs>
              {
                showMatchSummary &&
                  <div className='col-xs-12' style={{padding: '8px'}}>
                    <MatchSummaryCard
                      id='very_high'
                      count={matchTypes.very_high || 0}
                      loading={loadingMatches}
                      selected={selectedMatchBucket}
                      onClick={() => onMatchTypeChange('very_high')}
                      {...MATCH_TYPES.very_high}
                    />
                    <MatchSummaryCard
                      count={matchTypes.high || 0}
                      loading={loadingMatches}
                      id='high'
                      selected={selectedMatchBucket}
                      onClick={() => onMatchTypeChange('high')}
                      {...MATCH_TYPES.high}
                    />
                    <MatchSummaryCard
                      count={matchTypes.low || 0}
                      loading={loadingMatches}
                      id='low'
                      selected={selectedMatchBucket}
                      onClick={() => onMatchTypeChange('low')}
                      {...MATCH_TYPES.low}
                    />
                    <MatchSummaryCard
                      count={matchTypes.no_match || 0}
                      loading={loadingMatches}
                      id='no_match'
                      selected={selectedMatchBucket}
                      onClick={() => onMatchTypeChange('no_match')}
                      {...MATCH_TYPES.no_match}
                    />
                  </div>
              }
              <TableVirtuoso
                style={{borderRadius: '10px', maxHeight: showMatchSummary ? isSplitView ? 'calc(100vh - 350px)' : 'calc(100vh - 305px)' : 'calc(100vh - 245px)'}}
                data={rows}
                components={VirtuosoTableComponents}
                fixedHeaderContent={fixedHeaderContent}
                itemContent={rowContent}
              />
            </div>
        }
        <Dialog
          disableEscapeKeyDown
          open={matchDialog}
          onClose={() => setMatchDialog(false)}
          scroll='paper'
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: '28px',
              minWidth: '312px',
              minHeight: '262px',
              padding: 0
            }
          }}
        >
          <DialogTitle sx={{padding: '12px 24px', color: 'surface.dark', fontSize: '22px', textAlign: 'left'}}>
            Auto Match
          </DialogTitle>
          <DialogContent sx={{paddingTop: '12px !important'}}>
            <RepoSearchAutocomplete label='Map Target' size='small' onChange={(id, item) => setRepo(item)} />
          </DialogContent>
          <DialogActions sx={{padding: '16px'}}>
            <Button
              color='default'
              variant='contained'
              size='small'
              sx={{textTransform: 'none'}}
              onClick={() => setMatchDialog(false)}
            >
              Close
            </Button>
            <Button
              variant='contained'
              size='small'
              sx={{textTransform: 'none', marginLeft: '12px'}}
              endIcon={<DoubleArrowIcon />}
              disabled={!repo?.url}
              onClick={onGetCandidatesSubmit}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
      <Paper component="div" className={isSplitView ? 'col-xs-6 split padding-0 split-appear' : 'col-xs-6 padding-0'} sx={{width: isSplitView ? 'calc(50% - 16px) !important' : 0, marginLeft: '16px', boxShadow: 'none', p: 0, backgroundColor: WHITE, borderRadius: '10px', border: 'solid 0.3px', borderColor: 'surface.nv80', opacity: isSplitView ? 1 : 0, minHeight: 'calc(100vh - 100px) !important'}}>
        <div className='col-xs-12' style={{padding: '8px 16px'}}>
          <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Typography component='span' sx={{fontSize: '20px', color: 'surface.dark', fontWeight: 600}}>Mapping Decisions</Typography>
            <CloseIconButton color='secondary' onClick={onCloseDecisions} />
          </div>
          <div className='col-xs-12 padding-0'>
            <Tabs
              variant='fullWidth'
              value={decisionTab}
              onChange={onDecisionTabChange}
            >
              {
                DECISION_TABS.map(_tab => {
                  return (
                    <Tab
                      sx={{padding: '2px 6px !important', textTransform: 'none'}}
                      value={_tab}
                      key={_tab}
                      label={startCase(_tab)}
                      disabled={['search', 'propose'].includes(_tab)}
                    />
                  )
                })
              }
            </Tabs>
          </div>
          {
            ['map', 'candidates'].includes(decisionTab) && isSplitView &&
              <div className='col-xs-12 padding-0'>
                <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center'}}>
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
                        padding: '2px 6px !important',
                        whiteSpace: 'normal'
                      },
                      '.MuiToolbar-root': {
                        borderRadius: '10px 10px 0 0',
                      }
                    }}
                    noCardDisplay
                    nested
                    results={{
                      results: orderBy(uniqBy(compact([matchedConcept, ...(decisions[rowIndex]?.mapped || []), ...(decisionTab === 'candidates' ? (find(otherMatchedConcepts, c => c.row.__index === rowIndex )?.results || []) : [])]), 'version_url'), 'search_meta.search_score', 'desc'),
                      total: 1
                    }}
                    resource='concepts'
                    noPagination
                    noSorting
                    noToolbar
                    resultContainerStyle={{height: decisionTab === 'candidates' ? (showItem ? 'calc(100vh - 550px)' : 'calc(100vh - 200px)') : 'auto'}}
                    onShowItemSelect={item => {
                      setShowItem(item)
                      setTimeout(() => {
                        highlightTexts([item], null, false)
                      }, 100)
                    }}
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
                        renderer: (concept) => {
                          return <Chip
                                   size='small'
                                   {...MATCH_TYPES[concept?.search_meta?.match_type || 'no_match']}
                                   label={`${parseFloat(concept?.search_meta?.search_score || 0).toFixed(2)}`}
                                   onClick={event => {
                                     event.preventDefault()
                                     event.stopPropagation()
                                     setShowHighlights(concept)
                                     return false
                                   }}
                                   disabled={!concept?.search_meta?.search_score}
                                 />
                        },
                      },
                      {
                        sortable: false,
                        id: 'map-control',
                        labelKey: '',
                        renderer: concept => {
                          const isMapped = isMappedInDecisions(concept)
                          return (
                          <Button size='small' sx={{textTransform: 'none', whiteSpace: 'nowrap'}} color={isMapped ? 'error' : 'primary'} variant={isMapped ? 'outlined' : 'contained'} onClick={event => onMap(event, [concept], isMapped)}>
                            {isMapped ? 'Un-Map' : 'Map'}
                          </Button>
                        )},
                      },
                    ]}
                  />
                </div>
              </div>
          }
        </div>
        <SearchHighlightsDialog
          open={Boolean(showHighlights)}
          onClose={() => setShowHighlights(false)}
          highlight={showHighlights?.search_meta?.search_highlight || []}
          score={parseFloat(showHighlights?.search_meta?.search_score || 0).toFixed(2)}
        />
        <div className={'col-xs-12 padding-0' + (showItem?.id ? ' split-appear' : '')} style={{width: showItem?.id ? '100%' : 0, backgroundColor: WHITE, borderRadius: '10px', height: showItem?.id ? 'calc(100vh - 420px)' : 0, opacity: showItem?.id ? 1 : 0}}>
          {
            showItem?.id &&
              <ConceptHome
                style={{borderRadius: 0, borderTop: 'solid 0.3px', borderColor: SURFACE_COLORS.nv80}}
                detailsStyle={{height: 'calc(100vh - 550px)'}}
                source={repo} repo={repo} url={showItem.url} concept={showItem} onClose={() => setShowItem(false)} nested />
          }
        </div>
      </Paper>
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

export default Matching;
