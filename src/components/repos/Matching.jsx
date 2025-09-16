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
import Checkbox from '@mui/material/Checkbox';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl, { useFormControl } from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Switch from '@mui/material/Switch';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

import JoinRightIcon from '@mui/icons-material/JoinRight';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import UploadIcon from '@mui/icons-material/Upload';
import MatchingIcon from '@mui/icons-material/DeviceHub';
import EditIcon from '@mui/icons-material/EditOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import ConfirmedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import MediumMatchIcon from '@mui/icons-material/Rule';
import LowMatchIcon from '@mui/icons-material/DynamicForm';
import NoMatchIcon from '@mui/icons-material/RemoveRoad';
import DownloadIcon from '@mui/icons-material/Download';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ListIcon from '@mui/icons-material/FormatListNumbered';
import UnMappedIcon from '@mui/icons-material/LinkOff';
import MappedIcon from '@mui/icons-material/Link';
import ReviewedIcon from '@mui/icons-material/FactCheckOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AutoMatchIcon from '@mui/icons-material/MotionPhotosAutoOutlined';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

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
import chunk from 'lodash/chunk'
import get from 'lodash/get'
import countBy from 'lodash/countBy'
import sum from 'lodash/sum'
import omit from 'lodash/omit'
import reject from 'lodash/reject'
import uniq from 'lodash/uniq'
import debounce from 'lodash/debounce'
import keys from 'lodash/keys'
import pickBy from 'lodash/pickBy'
import every from 'lodash/every'
import times from 'lodash/times'
import isEmpty from 'lodash/isEmpty'

import { OperationsContext } from '../app/LayoutContext';

import APIService from '../../services/APIService';
import { highlightTexts } from '../../common/utils';
import { WHITE, SURFACE_COLORS, ERROR_COLORS } from '../../common/colors';

import CloseIconButton from '../common/CloseIconButton';
import SearchResults from '../search/SearchResults';
import SearchHighlightsDialog from '../search/SearchHighlightsDialog'
import ConceptHome from '../concepts/ConceptHome'
import ConceptChip from '../concepts/ConceptChip'
import RepoSearchAutocomplete from './RepoSearchAutocomplete'

const HEADERS = [
  {id: 'id', label: 'ID'},
  {id: 'name', label: 'Name'},
  {id: 'synonyms', label: 'Synonyms'},
  {id: 'description', label: 'Description'},
  {id: 'concept_class', label: 'Concept Class'},
  {id: 'datatype', label: 'Datatype'},
  {id: 'same_as_map_codes', label: 'Same As Codes'},
  {id: 'other_map_codes', label: 'Concept Set'},
]

const ROW_STATES = ['unmapped', 'readyForReview', 'reviewed']
const VIEWS = {
  all: {
    label: 'All',
    icon: <ListIcon fontSize='small' />,
    color: 'grey',
  },
  unmapped: {
    label: 'Unmapped',
    icon: <UnMappedIcon fontSize='small' />,
    color: 'secondary',
  },
  readyForReview: {
    label: 'Proposed',
    icon: <MappedIcon fontSize='small' />,
    color: 'warning',
  },
  reviewed: {
    label: 'Approved',
    icon: <ReviewedIcon fontSize='small' />,
    color: 'primary',
  },
}

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

const DECISION_TABS = ['map_and_review', 'candidates', 'propose']
const UPDATED_COLOR = ERROR_COLORS['95']
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


const MatchSummaryCard = ({id, icon, label, count, loading, color, selected, onClick, size, isLast, dividerBgColor }) => {
  const isSelected = id === selected
  const isLarge = size === 'large'
  const _iconSize = (isLarge ? 32 : 24)
  const iconSize =  _iconSize + 'px'
  const isDisabled = count === '0' && id !== 'all'
  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
    <div className='col-xs-2' style={{padding: '0px 3px', minWidth: '160px', width: 'auto', marginRight: 0 }}>
      <Card variant={isSelected ? undefined : 'outlined'} sx={{borderColor: color + '.main', cursor: isDisabled ? 'not-allowed' : 'pointer', backgroundColor: isSelected ? 'rgba(72,54,255, 0.1)' : WHITE, opacity: isDisabled ? 0.5 : 1}} onClick={isDisabled ? undefined : onClick}>
        <CardContent sx={{padding: '0px !important'}}>
          <ListItem sx={{padding: '2px 8px'}}>
            <ListItemAvatar sx={{minWidth: 'auto'}}>
              <Box sx={{ position: 'relative' }}>
                <Avatar sx={{backgroundColor: `${color}.main`, width: iconSize, height: iconSize}}>
                  {icon}
                </Avatar>
                {loading && (
                  <CircularProgress
                    size={_iconSize + 8}
                    sx={{
                      color: `${color}.main`,
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-20px',
                      marginLeft: '-20px'
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
                  fontSize: isLarge ? '12px' : '10px',
                  color: 'rgba(0, 0, 0, 0.7)'
                },
                '.MuiListItemText-secondary': {
                  color: '#000',
                  fontSize: isLarge ? '16px' : '12px',
                  fontWeight: 'bold'
                }
              }}
            />
          </ListItem>
        </CardContent>
      </Card>
    </div>
      {
          !isLast &&
          <Divider sx={{width: '24px', margin: '0 2px', backgroundColor: dividerBgColor, height: '1px'}} />
        }
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
    <Table {...props} stickyHeader size='small' sx={{ borderCollapse: 'separate', tableLayout: 'fixed', '.MuiTableCell-root': {fontSize: '12px'} }} />
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
  const { toggles } = React.useContext(OperationsContext);
  // project state
  const [name, setName] = React.useState('')
  const [file, setFile] = React.useState(false)
  const [data, setData] = React.useState(false)
  const [columns, setColumns] = React.useState([])
  const [rowStatuses, setRowStatuses] = React.useState({reviewed: [], readyForReview: [], unmapped: []})
  const [decisions, setDecisions] = React.useState({})
  const [decisionFilters, setDecisionFilters] = React.useState([])
  const [matchTypes, setMatchTypes] = React.useState({very_high: 0, high: 0, low: 0, no_match: 0})
  const [matchedConcepts, setMatchedConcepts] = React.useState([]);
  const [otherMatchedConcepts, setOtherMatchedConcepts] = React.useState([]);
  const [algo, setAlgo] = React.useState('es')
  const [notes, setNotes] = React.useState({})
  const [proposed, setProposed] = React.useState({})
  const [mapSelected, setMapSelected] = React.useState({})
  const [startMatchingAt, setStartMatchingAt] = React.useState(false)
  const [endMatchingAt, setEndMatchingAt] = React.useState(false)

  const [row, setRow] = React.useState(false)
  const [loadingMatches, setLoadingMatches] = React.useState(false)
  const [edit, setEdit] = React.useState([]);
  const [selectedRowStatus, setSelectedRowStatus] = React.useState('all')
  const [selectedMatchBucket, setSelectedMatchBucket] = React.useState(false)
  const [editName, setEditName] = React.useState(false)
  const [decisionTab, setDecisionTab] = React.useState('map_and_review')
  const [algoMenuAnchorEl, setAlgoMenuAnchorEl] = React.useState(null)
  const [decisionAnchorEl, setDecisionAnchorEl] = React.useState(null)
  const [searchText, setSearchText] = React.useState('')
  const [attributes, setAttributes] = React.useState(1)

  const [matchDialog, setMatchDialog] = React.useState(false)
  const [showHighlights, setShowHighlights] = React.useState(false)
  const [showItem, setShowItem] = React.useState(false)
  const [autoMatchUnmappedOnly, setAutoMatchUnmappedOnly] = React.useState(true)

  // repo state
  const [repo, setRepo] = React.useState(false)
  const [conceptCache, setConceptCache] = React.useState({})

  const ALGOS = [
    {id: 'es', label: 'Generic Elastic Search Matching'},
    {id: 'llm', label: 'Semantic Search (all-MiniLM-L6-v2)', disabled: !toggles?.SEMANTIC_SEARCH_TOGGLE},
  ]

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
      let _data = []

      const reservedKeys = ['__Concept ID__', '__Concept URL__', '__Match Score__', '__Match Type__', '__Decision__', '__Note__', '__State__', '__Proposed__', '__Repo Version__', '__Repo ID__', '__Repo URL__']
      const optionalReservedKeys = ['__Concept Name__']
      let columns = keys(jsonData[0])
      let isResuming = every(reservedKeys, key => columns.includes(key))
      let _decisions = {}
      let _mapSelected = {}
      let _notes = {}
      let _proposed = {}
      let _repo = null
      let _states = {...rowStatuses}
      forEach(jsonData, (data, index) => {
        data.__index = index
        if(isResuming) {
          let repo = {id: data['__Repo ID__'], version: data['__Repo Version__'], url: data['__Repo URL__']}
          let concept = {id: data['__Concept ID__'], url: data['__Concept URL__'], search_meta: {search_score: data['__Match Score__'], match_type: snakeCase(data['__Match Type__'])}, repo: repo}
          if(concept?.id) {
            _mapSelected[index] = concept
            _repo = repo
          }
          let rowStateLabel = data['__State__']
          let state = keys(pickBy(VIEWS, info => info.label === rowStateLabel))[0]
          _states[state] = _states[state] || []
          _states[state].push(index)
          _decisions[index] = data['__Decision__'] === 'None' ? undefined : data['__Decision__']
          _notes[index] = data['__Note__']
          _proposed[index] = data['__Proposed__'] ? JSON.parse(data['__Proposed__']) : undefined
          data = omit(data, [...reservedKeys, ...optionalReservedKeys])
        }
        _data.push(data)
      })
      if(isResuming) {
        setNotes(_notes)
        setDecisions(_decisions)
        setMapSelected(_mapSelected)
        setRowStatuses(_states)
        setProposed(_proposed)
        if(_repo?.url)
          resolveRepo(_repo.url, _repo)
      }

      setData(_data);
      if(!isResuming)
        setRowStatuses(prev => {
          prev.unmapped = map(_data, '__index')
          return prev
        })

      setColumns(getColumns(omit(_data[0], ['__index'])))
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
    const state = getStateFromIndex(_row.__index)
    return (
      <React.Fragment>
        <TableCell
          align='center'
          sx={{
            backgroundColor: defaultMatchTypeColor,
            borderLeft: state ? '2px solid' : 'none',
            borderColor: state ? VIEWS[state].color + '.main' : 'none',
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
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
                  verticalAlign: 'baseline',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
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
    const CHUNK_SIZE = 50; // Number of rows per batch
    const MAX_CONCURRENT_REQUESTS = 2; // Number of parallel API requests allowed
    if(autoMatchUnmappedOnly)
      rows = filter(rows, row => rowStatuses.unmapped.includes(row.__index))
    const rowChunks = chunk(rows, CHUNK_SIZE);

    // Function to process a single batch
    const processBatch = async (_repo, rowBatch) => {
      const payload = getPayloadForMatching(rowBatch, _repo)

      try {
        const response = await APIService.concepts()
              .appendToUrl('$match/')
              .post(payload, null, null, {
                includeSearchMeta: true,
                semantic: algo === 'llm',
                bestMatch: true
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
              forEach(data, concept => {
                if(get(concept, 'results.0.search_meta.match_type') === 'very_high') {
                  setMapSelected(_prev => {
                    _prev[concept.row.__index] = {...concept.results[0], repo: _repo}
                    return _prev
                  })
                  prev.readyForReview = uniq([...prev.readyForReview, concept.row.__index])
                  setDecisions(prev => ({...prev, [concept.row.__index]: 'map'}))
                } else
                  prev.unmapped = uniq([...prev.unmapped, concept.row.__index])
              })
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

    setRowStatuses(prev => {
      prev.unmapped = []
      if(!autoMatchUnmappedOnly)
        prev.readyForReview = []
      return prev
    })

    const response = await APIService.new().overrideURL('/$resolveReference/').post({url: repo.version_url || repo.url})
    let _repo = get(response.data, '0.result.id') ? response.data[0].result : repo
    setRepo(_repo)
    await processWithConcurrency(_repo);
    setEndMatchingAt(moment())
    setLoadingMatches(false)
  };

  const resolveRepo = (url, _repo) => {
    APIService.new().overrideURL('/$resolveReference/').post({url: url}).then(response => {
      if(get(response.data, '0.result.id'))
        setRepo(response.data[0].result)
      else
        setRepo(_repo)
    })
  }

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
    if(loadingMatches || matchedConcepts?.length)
      return `Auto Match (${matchingDuration})`
    return 'Auto Match'
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
    if(searchText)
      rows = filter(rows, row => find(values(row), v => v?.toString().toLowerCase()?.search(searchText.trim().toLowerCase()) > -1))
    if(decisionFilters?.length > 0) {
      const hasNone = decisionFilters.includes('none')
      let indexes = keys(pickBy(decisions, value => (hasNone && !value) || decisionFilters.includes(value)))
      rows = filter(rows, row => indexes.includes(row.__index.toString()))
    }
    return rows
  }

  const getStateFromIndex = index => {
    if(rowStatuses.reviewed.includes(index))
      return 'reviewed'
    if(rowStatuses.readyForReview.includes(index))
      return 'readyForReview'
    return 'unmapped'
  }

  const onDownloadClick = () => {
    const rows = map(data, row => {
      const index = row.__index
      const rowState = getStateFromIndex(index)
      const rowStateLabel = VIEWS[rowState].label
      let concept = mapSelected[index]
      let _repo = concept?.repo
      let newRow = {
        ...row,
        '__Concept ID__': concept?.id,
        '__Concept Name__': concept?.display_name,
        '__Concept URL__': concept?.url,
        '__Match Score__': concept?.search_meta?.search_score,
        '__Match Type__': concept?.search_meta?.match_type ? startCase(concept.search_meta.match_type) : null,
        '__Decision__': decisions[index] || 'None',
        '__Note__': notes[index] || null,
        '__State__': rowStateLabel,
        '__Proposed__': isEmpty(proposed[index]) ? null : JSON.stringify(proposed[index]),
        '__Repo Version__': _repo?.version || _repo?.id,
        '__Repo ID__': _repo?.short_code || _repo?.id,
        '__Repo URL__': _repo?.version_url || _repo?.url
      }
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

    const matched = get(find(matchedConcepts, concept => concept.row.__index === csvRow.__index), 'results.0') || mapSelected[csvRow.__index]
    let url = matched?.url
    if(url && !conceptCache[url])
      APIService
      .new()
      .overrideURL(url)
      .get(null, null, {includeMappings: true, mappingBrief: true, mapTypes: 'SAME-AS,SAME AS,SAME_AS', verbose: true})
      .then(response => {
        const res = {...response.data, search_meta: {...matched.search_meta}, repo: {...matched.repo}}
        setConceptCache({...conceptCache, [url]: res})
      })
    setRow(csvRow)
    setDecisionTab('map_and_review')
  }

  const onCloseDecisions = () => {
    setRow(false)
    setShowHighlights(false)
  }

  const onMap = (event, concept, unmap=false) => {
    event.preventDefault()
    event.stopPropagation()
    _onMap(concept, unmap)
    setRowStatuses(prev => {
      prev.reviewed = without(prev.reviewed, rowIndex)
      if(unmap) {
        prev.readyForReview = without(prev.readyForReview, rowIndex)
        prev.unmapped = uniq([...prev.unmapped, rowIndex])
      } else {
        prev.readyForReview = uniq([...prev.readyForReview, rowIndex])
        prev.unmapped = without(prev.unmapped, rowIndex)
      }
      updateMatchTypeCounts(null, prev)
      return prev
    })
    return false
  }

  const _onMap = (concept, unmap=false) => {
    setMapSelected(prev => ({...prev, [rowIndex]: unmap ? null : {...concept, repo: repo}}))
    setDecisions(prev => ({...prev, [rowIndex]: unmap ? null : 'map'}))
  }

  const onReviewDone = () => {
    const newRowStatuses = {...rowStatuses, reviewed: uniq([...rowStatuses.reviewed, rowIndex]), readyForReview: without(rowStatuses.readyForReview, rowIndex), unmapped: without(rowStatuses.unmapped, rowIndex)}
    setRowStatuses(newRowStatuses)
    updateMatchTypeCounts('reviewed', newRowStatuses)
  }

  const isSelectedForMap = (concept, index) => mapSelected[index || rowIndex]?.url == concept.url

  const onStateTabChange = newValue => {
    setSelectedRowStatus(newValue)
    updateMatchTypeCounts(newValue)
    setDecisionFilters([])
    if(newValue === 'unmapped')
      setSelectedMatchBucket(false)
  }

  const updateMatchTypeCounts = (newRowStatus, newRowStatuses) => {
    let rowStatus = newRowStatus || selectedRowStatus
    let rows = rowStatus === 'all' ? matchedConcepts : filter(matchedConcepts, concept => (newRowStatuses || rowStatuses)[rowStatus].includes(concept.row.__index));
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
    if(newValue === 'candidates' && repo?.id) {
      fetchOtherCandidates()
    }
  }

  const onDecisionChange = (event, newValue) => {
    if(newValue !== 'map')
      _onMap(null, true)
    if(newValue != 'propose')
      setProposed(prev => ({...prev, [rowIndex]: undefined}))


    setDecisions(prev => ({...prev, [rowIndex]: newValue || undefined}))

    setRowStatuses(prev => {
      prev.reviewed = without(prev.reviewed, rowIndex)
      if(newValue) { // map or exclude or propose
        prev.readyForReview = uniq([...prev.readyForReview, rowIndex])
        prev.unmapped = without(prev.unmapped, rowIndex)
      } else {
        prev.readyForReview = without(prev.readyForReview, rowIndex)
        prev.unmapped = uniq([...prev.unmapped, rowIndex])
      }
      updateMatchTypeCounts(null, prev)
      return prev
    })

    setDecisionAnchorEl(null)
  }

  const fetchOtherCandidates = () => {
      const payload = getPayloadForMatching([row], repo)
      APIService.concepts()
        .appendToUrl('$match/')
        .post(payload, null, null, {
          includeSearchMeta: true,
          includeMappings: true,
          mappingBrief: true,
          mapTypes: 'SAME-AS,SAME AS,SAME_AS',
          verbose: true,
          limit: 5,
          semantic: algo === 'llm'
        }).then(response => {
          setOtherMatchedConcepts([...reject(otherMatchedConcepts, c => c.row.__index == row.__index), ...response.data])
          let items = get(response.data, '0.results') || []
          if(items.length > 0)
            setTimeout(() => highlightTexts(items, null, false), 100)
        });
  }

  const isSplitView = Boolean(rowIndex !== undefined)
  const rows = getRows()

  const getTitle = () => {
    let title = 'Mapping Project'
    if(!editName && name)
      title += ` - ${name}`
    return title
  }

  const getConcept = concept => concept?.url ? conceptCache[concept.url] || concept : concept
  const onProposedUpdate = event => {
    setProposed(prev => {
      return {...prev, [rowIndex]: {...(prev[rowIndex] || {}), [event.target.id]: event.target.value}}
    })
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
                  focused
                  autoFocus
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
              variant='contained'
              size='small'
              sx={{textTransform: 'none', margin: '5px'}}
              endIcon={<DoubleArrowIcon />}
              disabled={loadingMatches || matchedConcepts?.length > 0 || !file}
              onClick={onGetCandidates}
            >
              {getCandidatesButtonLabel()}
            </Button>
            {
              rows?.length > 0 && !loadingMatches &&
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
          (Boolean(rows?.length) || selectedMatchBucket || ROW_STATES.includes(selectedRowStatus) || searchText) &&
            <div className='col-xs-12' style={{padding: '0', width: '100%', height: isSplitView ? 'calc(100vh - 245px)' : 'calc(100vh - 195px)'}}>
              <div className='col-xs-12' style={{padding: '0 12px', display: 'flex', backgroundColor: SURFACE_COLORS.main}}>
              {
                map(VIEWS, (state, view) => {
                  const count = view === 'all' ? data.length : rowStatuses[view].length
                  const isLast = view === 'reviewed'
                  const getDividerBgColor = () => {
                    if(!selectedRowStatus || selectedRowStatus === 'all')
                      return undefined
                    if(selectedRowStatus === 'unmapped' && ['all'].includes(view))
                      return 'primary.main'
                    if(selectedRowStatus === 'readyForReview' && ['all', 'unmapped'].includes(view))
                      return 'primary.main'
                    if(selectedRowStatus === 'reviewed')
                      return 'primary.main'
                  }
                  return (
                    <MatchSummaryCard
                      size='large'
                      key={view}
                      id={view}
                      count={count.toLocaleString()}
                      loading={loadingMatches}
                      selected={selectedRowStatus}
                      onClick={() => onStateTabChange(view)}
                      {...VIEWS[view]}
                      isLast={isLast}
                      dividerBgColor={getDividerBgColor()}
                    />
                  )
                })
              }
              </div>
              <div className='col-xs-12' style={{padding: '8px 14px', display: 'flex', alignItems: 'center', backgroundColor: SURFACE_COLORS.main}}>
                <FormControl>
                  <SearchField onChange={debounce(val => setSearchText(val || ''))} />
                </FormControl>
                <FormControlLabel
                  sx={{
                    marginLeft: '10px',
                    '.MuiFormControlLabel-label': {fontSize: '0.875rem'}
                  }}
                  control={<Switch disabled={!showMatchSummary || selectedRowStatus === 'unmapped'} size="small" checked={selectedMatchBucket === 'very_high'} onChange={() => onMatchTypeChange('very_high')} />}
                  label={`Auto Match (${(matchTypes.very_high || 0).toLocaleString()})`}
                />
                {
                  ['reviewed', 'readyForReview'].includes(selectedRowStatus) &&
                    <React.Fragment>
                      {
                        ['map', 'exclude', 'none', 'propose'].map(_decision => {
                          const isApplied = decisionFilters.includes(_decision)
                          const isExclude = _decision == 'exclude'
                          const isNone = _decision == 'none'
                          const isPropose = _decision == 'propose'
                          const count = filter(keys(pickBy(decisions, value => isNone ? !value : value === _decision)), index => rowStatuses[selectedRowStatus].includes(parseInt(index))).length
                          return (
                            <Chip
                              key={_decision}
                              disabled={!count}
                              label={`${startCase(_decision)} (${count})`}
                              color={isExclude ? 'error' : (isNone ? 'secondary' : (isPropose ? 'warning' : 'primary'))}
                              size='small'
                              variant={isApplied ? 'contained' : 'outlined'}
                              icon={
                                isApplied ?
                                  <CloseIcon fontSize='inherit' /> :
                                  <DoneIcon fontSize='inherit' />
                              }
                              onClick={
                                () => setDecisionFilters(
                                  isApplied ?
                                    without(decisionFilters, _decision) :
                                    [...decisionFilters, _decision]
                                )
                              }
                              sx={{marginLeft: '10px'}}
                            />
                          )
                        })
                      }
                      </React.Fragment>
                }
              </div>
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
            <Button
              component="label"
              role={undefined}
              variant="outlined"
              tabIndex={-1}
              sx={{textTransform: 'none', margin: '0 0 10px 0', padding: '6.5px 15px', minWidth: '300px'}}
              startIcon={<MatchingIcon />}
              endIcon={<DownIcon />}
              onClick={onAlgoButtonClick}
            >
              {ALGOS.find(_algo => _algo.id === algo).label}
            </Button>
            <RepoSearchAutocomplete label='Map Target' size='small' onChange={(id, item) => setRepo(item)} value={repo} />
            <FormControlLabel sx={{marginTop: '8px'}} control={<Checkbox checked={autoMatchUnmappedOnly} onChange={event => setAutoMatchUnmappedOnly(event.target.checked)} />} label="Unmapped Only" />
            {!autoMatchUnmappedOnly && <FormHelperText sx={{marginTop: '-4px'}}>This will override existing matches</FormHelperText>}
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
                    />
                  )
                })
              }
            </Tabs>
          </div>
          {
            decisionTab === 'propose' && isSplitView &&
              <div className='col-xs-12 padding-0' style={{margin: '12px 0'}}>
                <div className='col-xs-12 padding-0'>
                  <TextField id='source' sx={{width: 'calc(50% - 12px)', margin: '4px 6px'}} label='Target Source' value={proposed[rowIndex]?.source || ''} onChange={onProposedUpdate}/>
                  <TextField id='id' sx={{width: 'calc(50% - 12px)', margin: '4px 6px'}} label='Concept ID' value={proposed[rowIndex]?.id || ''} onChange={onProposedUpdate}/>
                  <TextField id='name' sx={{width: 'calc(50% - 12px)', margin: '4px 6px',}} label='Name' value={proposed[rowIndex]?.name || ''} onChange={onProposedUpdate}/>
                  <Typography sx={{fontWeight: 'bold', margin: '10px 10px 4px'}}>Attributes</Typography>
                  {
                    times(attributes, i => {
                      return (
                        <div className='col-xs-12 padding-0' key={i}>
                          <TextField id={`attributes.${i}.name`} sx={{width: 'calc(50% - 12px)', margin: '4px 6px'}} label='Attribute Name' value={get(proposed[rowIndex], `attributes.${i}.name`) || ''} onChange={onProposedUpdate}/>
                          <TextField id={`attributes.${i}.value`} sx={{width: 'calc(50% - 12px)', margin: '4px 6px'}} label='Attribute Value' value={get(proposed[rowIndex], `attributes.${i}.value`) || ''} onChange={onProposedUpdate}/>
                        </div>
                      )
                    })
                  }
                  <Button sx={{marginLeft: '8px', textTransform: 'none'}} size='small' variant='text' onClick={() => setAttributes(attributes + 1)}>
                    Add more
                  </Button>
                </div>
                <div className='col-xs-12 padding-0' style={{margin: '16px 0'}}>
                  <TextField
                    fullWidth
                    id="note"
                    label="Proposal note"
                    multiline
                    rows={5}
                    value={proposed[rowIndex]?.note || ''}
                    onChange={onProposedUpdate}
                  />
                </div>
                <div className='col-xs-12 padding-0' style={{margin: '16px 0', display: 'flex', alignItems: 'center'}}>
                  <Button color='primary' onClick={event => onDecisionChange(event, 'propose')} variant='contained' sx={{textTransform: 'none'}}>
                    Propose
                  </Button>
                  <Button color='default' onClick={onCloseDecisions} variant='contained' sx={{textTransform: 'none', marginLeft: '16px'}}>
                    Close
                  </Button>
                </div>
                </div>
          }
          {
            decisionTab === 'candidates' && isSplitView &&
              <div className='col-xs-12 padding-0' style={{margin: '12px 0'}}>
                <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', margin: '16px 0'}}>
                  <Button
                    component="label"
                    role={undefined}
                    variant="outlined"
                    tabIndex={-1}
                    sx={{textTransform: 'none', margin: '0 10px 0 0px', padding: '6.5px 15px', minWidth: '315px'}}
                    startIcon={<MatchingIcon />}
                    endIcon={<DownIcon />}
                    onClick={onAlgoButtonClick}
                  >
                    {ALGOS.find(_algo => _algo.id === algo).label}
                  </Button>
                  <RepoSearchAutocomplete label='Map Target' size='small' onChange={(id, item) => setRepo(item)} value={repo} />
                  <Button
                    color='primary'
                    variant="contained"
                    sx={{textTransform: 'none', marginLeft: '10px'}}
                    disabled={!repo?.id}
                    onClick={fetchOtherCandidates}
                  >
                    Fetch
                  </Button>
                </div>
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
                      results: orderBy(find(otherMatchedConcepts, c => c.row.__index === rowIndex )?.results || [], 'search_meta.search_score', 'desc'),
                      total: 1
                    }}
                    resource='concepts'
                    noPagination
                    noSorting
                    noToolbar
                    resultContainerStyle={{height: decisionTab === 'candidates' ? (showItem ? '212px' : 'calc(100vh - 188px)') : 'auto'}}
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
                          const isMapped = isSelectedForMap(concept)
                          return (
                          <Button size='small' sx={{textTransform: 'none', whiteSpace: 'nowrap'}} color={isMapped ? 'error' : 'primary'} variant={isMapped ? 'outlined' : 'contained'} onClick={event => onMap(event, concept, isMapped)}>
                            {isMapped ? 'Un-Map' : 'Map'}
                          </Button>
                        )},
                      },
                    ]}
                  />
                </div>
              </div>
          }
          {
            decisionTab === 'map_and_review' && isSplitView &&
              <div className='col-xs-12' style={{padding: '8px'}}>
                <div className='col-xs-12 padding-0' style={{margin: '12px 0 8px', display: 'flex', alignItems: 'center'}}>
                  <div className='col-xs-2' style={{fontWeight: 'bold', fontSize: '16px'}}>
                    Status
                  </div>
                  <div className='col-xs-10'>
                    <Chip variant='outlined' label={startCase(getStateFromIndex(rowIndex))} {...VIEWS[getStateFromIndex(rowIndex)]} />
                  </div>
                </div>
                <div className='col-xs-12 padding-0' style={{margin: '0px 0 8px', display: 'flex', alignItems: 'center'}}>
                  <div className='col-xs-2' style={{fontWeight: 'bold', fontSize: '16px'}}>
                    Decision
                  </div>
                  <div className='col-xs-10'>
                    <Chip
                      onClick={event => setDecisionAnchorEl(event.currentTarget)}
                      onDelete={event => setDecisionAnchorEl(event.currentTarget)}
                      variant='outlined'
                      label={startCase(decisions[rowIndex] || 'none')}
                      color={decisions[rowIndex] === 'map' ? 'primary' : (decisions[rowIndex] === 'exclude' ? 'error' : (decisions[rowIndex] === 'propose' ? 'warning' : 'secondary'))}
                      deleteIcon={<DownIcon fontSize='inherit' />}
                    />
                    <Menu
                      id="decision-menu"
                      anchorEl={decisionAnchorEl}
                      open={Boolean(decisionAnchorEl)}
                      onClose={() => setDecisionAnchorEl(null)}
                      MenuListProps={{
                        'aria-labelledby': 'decision-menu',
                        role: 'listbox',
                      }}
                    >
                    <MenuList dense>
                      <MenuItem selected={!decisions[rowIndex]} onClick={event => onDecisionChange(event, undefined)}>
                        <ListItemText sx={{paddingLeft: 0}}>None</ListItemText>
                      </MenuItem>

                      <MenuItem disabled={!mapSelected[rowIndex]} selected={decisions[rowIndex] === 'map'} onClick={event => onDecisionChange(event, 'map')}>
                        <ListItemText sx={{paddingLeft: 0}}>Map</ListItemText>
                      </MenuItem>
                      <MenuItem selected={decisions[rowIndex] === 'exclude'} onClick={event => onDecisionChange(event, 'exclude')}>
                        <ListItemText sx={{paddingLeft: 0}}>Exclude</ListItemText>
                      </MenuItem>
                      <MenuItem disabled={!proposed[rowIndex]?.id} selected={decisions[rowIndex] === 'propose'} onClick={event => onDecisionChange(event, 'propose')}>
                        <ListItemText sx={{paddingLeft: 0}}>Propose</ListItemText>
                      </MenuItem>
                    </MenuList>
                      </Menu>
                  </div>
                </div>
                {
                  mapSelected[rowIndex]?.url &&
                      <div key={mapSelected[rowIndex].url} className='col-xs-12 padding-0' style={{margin: '4px 0', display: 'flex', alignItems: 'center'}}>
                        <div className='col-xs-2' style={{fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center'}}>
                          <Tooltip title={MATCH_TYPES[mapSelected[rowIndex].search_meta.match_type].label}>
                                <Button
                                  sx={{
                                    '.MuiButton-startIcon': {marginRight: '4px'}
                                  }}
                                  size='small'
                                  variant='text'
                                  color={MATCH_TYPES[mapSelected[rowIndex].search_meta.match_type].color}
                                  startIcon={MATCH_TYPES[mapSelected[rowIndex].search_meta.match_type].icon}
                                  onClick={event => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    setShowHighlights(mapSelected[rowIndex])
                                    return false
                                  }}
                                >
                                  {parseFloat(mapSelected[rowIndex].search_meta.search_score || 0).toFixed(2)}
                                </Button>
                              </Tooltip>
                        </div>
                        <div className='col-xs-10'>
                          <ConceptChip
                            repoVersionPreferred
                            concept={getConcept(mapSelected[rowIndex])}
                                repo={repo}
                                filled
                                iconColor='primary'
                                target='_blank'
                                rel='noreferrer noopener'
                                sx={{
                                  '.MuiSvgIcon-root': {
                                    color: 'primary'
                                  }
                                }}
                          />
                          <Tooltip title='Un-map'>
                          <IconButton sx={{marginLeft: '10px'}} color='error' onClick={event => onMap(event, mapSelected[rowIndex], true)}>
                            <CloseIcon />
                          </IconButton>
                            </Tooltip>
                        </div>
                      </div>
                }
                <div className='col-xs-12 padding-0' style={{margin: '16px 0', display: 'flex', alignItems: 'center'}}>
                  <TextField
                    fullWidth
                    id="review-note"
                    label="Review note"
                    multiline
                    value={notes[rowIndex] || ''}
                    onChange={event => setNotes({...notes, [rowIndex]: event.target.value || ''})}
                    rows={5}
                  />
                </div>
                <div className='col-xs-12 padding-0' style={{margin: '16px 0', display: 'flex', alignItems: 'center'}}>
                  <Button disabled={rowStatuses.reviewed.includes(rowIndex)} color='primary' onClick={() => onReviewDone()} variant='contained' sx={{textTransform: 'none'}}>
                    Approve
                  </Button>
                  <Button color='default' onClick={onCloseDecisions} variant='contained' sx={{textTransform: 'none', marginLeft: '16px'}}>
                    Close
                  </Button>
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
