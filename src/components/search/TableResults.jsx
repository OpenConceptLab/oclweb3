import React from 'react';
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import RightIcon from '@mui/icons-material/KeyboardArrowRight';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import { visuallyHidden } from '@mui/utils';
import { filter, reject, get, sortBy, without, startCase, find, keys, map, times } from 'lodash'
import APIService from '../../services/APIService';
import { SECONDARY_COLORS } from '../../common/colors';
import { ALL_COLUMNS } from './ResultConstants';

const EnhancedTableHead = props => {
  const { t } = useTranslation()
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, columns, refTranslation, setRefTranslation, hierarchical } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };
  return (
    <TableHead sx={{background: props.bgColor}}>
      <TableRow sx={{background: '#FFF'}}>
        {
          onSelectAllClick &&
            <TableCell padding="checkbox" sx={{background: 'inherit'}}>
              <Checkbox
                size={props.size || 'medium'}
                color="primary"
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                inputProps={{
                  'aria-label': 'select all desserts',
                }}
              />
            </TableCell>
        }
        {
          hierarchical &&
            <TableCell padding='none' sx={{background: 'inherit', width: '40px'}} />
        }
        {
          map(columns, (headCell, idx) => {
            let label = '';
            if(headCell.label)
              label += headCell.label || ''
            else if(headCell.labelKey)
              label += t(headCell.labelKey)
            return (
              <TableCell
                key={idx}
                align={headCell.align || 'left'}
                padding='normal'
                sortDirection={orderBy === headCell.id ? order : false}
                sx={{background: 'inherit', ...headCell.sx}}
              >
                {
                  headCell?.translation ?
                    <span>
                                    <span><b>{label}</b></span>
                                    <span style={{marginLeft: '16px'}}>
                                      <FormControlLabel
                                        size='small'
                                        control={
                                          <Switch
                                            color="primary"
                                            size='small'
                                            checked={refTranslation}
                                            onChange={event => setRefTranslation(event.target.checked)} />
                                        }
                                        label={
                                          <span style={{fontSize: '12px', marginLeft: '5px'}}>
                                            {refTranslation ? t('reference.raw') : t('reference.translation')}
                                          </span>
                                        }
                                      />
                                    </span>
                    </span> :
                  <TableSortLabel
                    active={!hierarchical && orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    hideSortIcon={hierarchical}
                    onClick={(headCell?.sortable === false || hierarchical) ? undefined : createSortHandler(headCell.sortBy ? headCell.sortBy : headCell.id)}
                  >
                    <b>{label}</b>
                    {
                      orderBy === headCell.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null
                    }
                  </TableSortLabel>
                }
              </TableCell>
            )
          })}
      </TableRow>
    </TableHead>
  );
}
// baseURL is the (possibly version-scoped) concepts listing URL, e.g. /orgs/Foo/sources/Bar/v1.0/concepts/
// row.url is always version-less, e.g. /orgs/Foo/sources/Bar/concepts/123/
const getChildrenURL = (row, baseURL) => {
  if(!baseURL)
    return row.url + 'children/'
  const conceptSuffix = row.url.replace(/^.*\/concepts\//, 'concepts/').replace(/\/$/, '')
  return baseURL.replace(/concepts\/.*$/, '') + conceptSuffix + '/children/';
}
const ResultRow = ({row, index, columns, getValue, handleClick, handleRowClick, isSelected, isItemShown, size, hierarchical, level, baseURL, onRowsLoaded}) => {
  const [open, setOpen] = React.useState(false)
  const [children, setChildren] = React.useState([])
  const [fetched, setFetched] = React.useState(false)
  const [loadingChildren, setLoadingChildren] = React.useState(false)
  const id = row.version_url || row.url || row.id
  const isItemSelected = isSelected(id)
  const isItemSelectedToShow = isItemShown(id)
  const labelId = `enhanced-table-checkbox-${index}`
  const color = row.retired ? SECONDARY_COLORS.main : 'none'
  let bgColor = isItemSelectedToShow ? 'primary.90' : ''
  const colSpan = columns.length + (handleClick ? 1 : 0) + 1
  const fetchChildren = () => {
    if(fetched)
      return
    setLoadingChildren(true)
    APIService.new().overrideURL(getChildrenURL(row, baseURL)).get().then(response => {
      setLoadingChildren(false)
      if(Array.isArray(response?.data)) {
        setChildren(response.data)
        setFetched(true)
        if(onRowsLoaded)
          onRowsLoaded(response.data)
      }
    })
  }
  const onExpandClick = event => {
    event.preventDefault()
    event.stopPropagation()
    const newOpen = !open
    if(newOpen)
      fetchChildren()
    setOpen(newOpen)
  }
  return (
    <React.Fragment>
      <TableRow
        hover
        role="checkbox"
        aria-checked={isItemSelectedToShow}
        tabIndex={-1}
        onClick={event => handleRowClick(event, id)}
        selected={isItemSelectedToShow}
        className={isItemSelectedToShow ? 'show-item' : ''}
        sx={[{
          cursor: 'pointer',
          backgroundColor: '#FFF',
          '&.Mui-selected': {
            backgroundColor: bgColor
          }
        }, isItemSelectedToShow ? {
          '&.MuiTableRow-hover:hover': {
            backgroundColor: bgColor
          }
        } : {
          '&.MuiTableRow-hover:hover': {
            backgroundColor: 'primary.95'
          }
        }]}
      >
        {
          handleClick &&
            <TableCell padding="checkbox" onClick={event => handleClick(event, id)} style={{color: color}}>
              <Checkbox
                size={size || 'medium'}
                color="primary"
                checked={isItemSelected}
                inputProps={{
                  'aria-labelledby': labelId,
                }}
              />
            </TableCell>
        }
        {
          hierarchical &&
            <TableCell padding='none' sx={{width: '40px', paddingLeft: `${4 + (level * 24)}px`, whiteSpace: 'nowrap'}}>
              {
                row.has_children ?
                  <IconButton size='small' onClick={onExpandClick}>
                    { open ? <DownIcon fontSize='inherit' /> : <RightIcon fontSize='inherit' /> }
                  </IconButton> :
                null
              }
            </TableCell>
        }
        {
          columns.map((column, idx) => {
            const value = getValue(row, column)
            return idx === 0  ?
              <TableCell
                key={idx}
                component="th"
                id={labelId}
                scope="row"
                padding="normal"
                className={column.className}
                sx={{color: color, ...column.sx}}
              >
                {value}
              </TableCell>:
            <TableCell key={idx} align={column.align || "left"} className={column.className} sx={{color: color, ...column.sx}}>
              {value}
            </TableCell>
          })
        }
      </TableRow>
      {
        hierarchical && open && loadingChildren &&
          <TableRow>
            <TableCell colSpan={colSpan} sx={{paddingLeft: `${28 + (level * 24)}px`}}>
              <CircularProgress size={16} />
            </TableCell>
          </TableRow>
      }
      {
        hierarchical && open && !loadingChildren &&
          children.map((child, i) => (
            <ResultRow
              key={child.version_url || child.url || child.uuid || i}
              row={child}
              index={`${index}-${i}`}
              columns={columns}
              getValue={getValue}
              handleClick={handleClick}
              handleRowClick={handleRowClick}
              isSelected={isSelected}
              isItemShown={isItemShown}
              size={size}
              hierarchical
              level={level + 1}
              baseURL={baseURL}
              onRowsLoaded={onRowsLoaded}
            />
          ))
      }
    </React.Fragment>
  );
}
const TableResults = ({selected, bgColor, handleClick, handleRowClick, handleSelectAllClick, results, resource, nested, isSelected, isItemShown, order, orderBy, className, style, onOrderByChange, selectedToShowItem, size, excludedColumns, extraColumns, properties, propertyFilters, loading, hierarchical, baseURL, onRowsLoaded}) => {
  const [refTranslation, setRefTranslation] = React.useState(true)
  const rows = results?.results || []
  const getValue = (row, column) => {
    let val = get(row, column.value)
    if(column.formatter)
      return column.formatter(val)
    if(column.renderer)
      return column.translation ? column.renderer(row, refTranslation) : column.renderer(row, Boolean(selectedToShowItem))
    return val
  }
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    onOrderByChange(property, isAsc ? 'desc' : 'asc')
  };
  let columns = filter(
    ALL_COLUMNS[resource] || [],
    column => nested ? column.nested !== false : column.global !== false
  );
  if(extraColumns?.length)
    columns = [...columns, ...extraColumns]
  columns = excludedColumns?.length ? reject(columns, column => excludedColumns?.includes(column.id)) : columns
  if(properties?.length) {
    columns = reject(columns, {property: true})
    const variableColumnIds = columns.map(col => col.id)
    let customProperties = reject(properties, property => variableColumnIds.includes(property))
    customProperties.forEach(property => {
      columns.push({
        id: property,
        label: startCase(property),
        className: 'searchable',
        sortable: Boolean(find(propertyFilters, {code: property})),
        sortBy: `properties.${property}.keyword`,
        renderer: item => {
          let prop = find(item.property, {code: property})
          if(prop) {
            let k = get(without(keys(prop), 'code'), '0')
            return get(prop, k)
          }
          return undefined
        }
      })
    })
    columns = sortBy(columns, column => {
      const idx = properties.indexOf(column.id);
      if(idx === -1)
        return properties.length
      column.isProperty = true
      return idx
    });
    columns = [...filter(columns, {permanent: true}), ...reject(columns, {permanent: true})]
  } else {
    columns = columns.map(column => {
      column.isProperty = false
      return column
    })
  }
  return (
    <React.Fragment>
    <TableContainer style={style || {height: 'calc(100vh - 263px)'}} className={className}>
      <Table
        stickyHeader
        size={size || 'small'}
        sx={{'.MuiTableCell-head': {lineHeight: '1.2rem', padding: '3px 16px', fontSize: '12px'}}}
      >
        <EnhancedTableHead
          size={size}
          bgColor={bgColor}
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={handleSelectAllClick}
          onRequestSort={handleRequestSort}
          rowCount={rows.length || 0}
          resource={resource}
          columns={columns}
          refTranslation={refTranslation}
          setRefTranslation={setRefTranslation}
          hierarchical={hierarchical}
        />
        <TableBody>
          {
            loading ?
              times(25, i => (
                <TableRow key={i}>
                  {
                    handleClick &&
                      <TableCell>
                        <Skeleton height={33} sx={{'WebkitTransform': 'none', 'transform': 'none'}} />
                      </TableCell>
                  }
                  {
                    hierarchical &&
                      <TableCell padding='none'>
                        <Skeleton height={33} sx={{'WebkitTransform': 'none', 'transform': 'none'}} />
                      </TableCell>
                  }
                  {
                    columns.map((col, idx) => (
                      <TableCell key={idx}>
                        <Skeleton height={33} sx={{'WebkitTransform': 'none', 'transform': 'none'}} />
                      </TableCell>
                    ))
                  }
                </TableRow>
              )) :
              (
                rows.map((row, index) => (
                  <ResultRow
                    key={row.version_url || row.url || row.id}
                    row={row}
                    index={index}
                    columns={columns}
                    getValue={getValue}
                    handleClick={handleClick}
                    handleRowClick={handleRowClick}
                    isSelected={isSelected}
                    isItemShown={isItemShown}
                    size={size}
                    hierarchical={hierarchical}
                    level={0}
                    baseURL={baseURL}
                    onRowsLoaded={onRowsLoaded}
                  />
                ))
              )
          }
        </TableBody>
      </Table>
    </TableContainer>
    </React.Fragment>
  )
}
export default TableResults;