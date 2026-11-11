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
import Button from '@mui/material/Button';
import RightIcon from '@mui/icons-material/KeyboardArrowRight';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import { visuallyHidden } from '@mui/utils';
import { get, map, times } from 'lodash'
import APIService from '../../services/APIService';
import { SECONDARY_COLORS, ERROR_COLORS } from '../../common/colors';
import { resolveColumns, isSameSortField } from './columns';
import { CHILDREN_PAGE_SIZE, initialChildrenState, childrenReducer, needsFetchOnExpand, nextChildrenPage } from './childrenPaging';

// What screen readers announce for the select-all checkbox, per result type
const SELECT_ALL_LABEL_KEYS = {
  concepts: 'search.select_all_concepts',
  mappings: 'search.select_all_mappings',
  references: 'search.select_all_references',
  repos: 'search.select_all_repos',
  orgs: 'search.select_all_orgs',
  users: 'search.select_all_users',
}

const EnhancedTableHead = props => {
  const { t } = useTranslation()
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, columns, refTranslation, setRefTranslation, hierarchical, resource } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };
  return (
    <TableHead sx={{background: props.bgColor}}>
      <TableRow sx={{bgcolor: 'surface.s90'}}>
        {
          onSelectAllClick &&
            <TableCell padding="checkbox" sx={{background: 'inherit'}}>
              <Checkbox
                size={props.size || 'medium'}
                color="primary"
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                slotProps={{
                  input: {
                    'aria-label': t(SELECT_ALL_LABEL_KEYS[resource] || 'search.select_all'),
                  },
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
                sortDirection={isSameSortField(orderBy, headCell.id) ? order : false}
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
                    active={!hierarchical && isSameSortField(orderBy, headCell.id)}
                    direction={isSameSortField(orderBy, headCell.id) ? order : 'asc'}
                    hideSortIcon={hierarchical}
                    onClick={(headCell?.sortable === false || hierarchical) ? undefined : createSortHandler(headCell.sortBy ? headCell.sortBy : headCell.id)}
                  >
                    <b>{label}</b>
                    {
                      isSameSortField(orderBy, headCell.id) ? (
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
const ResultRow = ({row, index, columns, getValue, handleClick, handleRowClick, isSelected, isItemShown, size, hierarchical, level, baseURL, onRowsLoaded, hidden}) => {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [childrenState, dispatchChildren] = React.useReducer(childrenReducer, initialChildrenState)
  const {children, total: childrenTotal, hasMore: moreChildren, fetched, loading: loadingChildren, failed: childrenFailed} = childrenState
  const id = row.version_url || row.url || row.id
  const isItemSelected = isSelected(id)
  const isItemSelectedToShow = isItemShown(id)
  const labelId = `enhanced-table-checkbox-${index}`
  const color = row.retired ? SECONDARY_COLORS.main : 'none'
  let bgColor = isItemSelectedToShow ? 'primary.90' : ''
  const colSpan = columns.length + (handleClick ? 1 : 0) + 1
  // Children load a page at a time; a failed page can be retried without losing the pages already shown
  const fetchChildrenPage = page => {
    if(loadingChildren)
      return
    dispatchChildren({type: 'loading'})
    APIService.new().overrideURL(getChildrenURL(row, baseURL)).get(null, null, {limit: CHILDREN_PAGE_SIZE, page: page}).then(response => {
      if(Array.isArray(response?.data)) {
        dispatchChildren({type: 'loaded', page: page, rows: response.data, total: parseInt(response?.headers?.num_found) || 0, hasMore: Boolean(response?.headers?.next)})
        if(onRowsLoaded)
          onRowsLoaded(response.data)
      } else {
        dispatchChildren({type: 'failed'})
      }
    })
  }
  const fetchChildren = () => {
    if(needsFetchOnExpand(childrenState))
      fetchChildrenPage(1)
  }
  // "Show more" and "Try again" both load the page after the last one shown
  const onLoadNextChildren = event => {
    event.preventDefault()
    event.stopPropagation()
    fetchChildrenPage(nextChildrenPage(childrenState))
  }
  const showChildren = hierarchical && open && !hidden
  // up to 5 placeholder rows while a page loads, fewer when fewer children are left
  const skeletonRows = Math.max(Math.min(5, fetched ? childrenTotal - children.length : 5), 1)
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
      {
        // a hidden row renders nothing of its own but stays mounted, keeping its children and expansion
        !hidden &&
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
                    slotProps={{
                      input: {
                        'aria-labelledby': labelId,
                      },
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
      }
      {
        // fetched children stay mounted while collapsed, so they keep their own pages and expansions
        hierarchical && fetched &&
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
              hidden={!showChildren}
            />
          ))
      }
      {
        showChildren && loadingChildren &&
          times(skeletonRows, i => (
            <TableRow key={`skeleton-${i}`}>
              {handleClick && <TableCell padding="checkbox" />}
              <TableCell padding='none' />
              {
                columns.map((column, idx) => (
                  <TableCell key={idx}>
                    <Skeleton variant='text' />
                  </TableCell>
                ))
              }
            </TableRow>
          ))
      }
      {
        showChildren && !loadingChildren && (childrenFailed || moreChildren) &&
          <TableRow>
            <TableCell colSpan={colSpan} align='right' sx={{paddingTop: '2px', paddingBottom: '2px'}}>
              {
                childrenFailed ?
                  <span style={{color: ERROR_COLORS.main, marginRight: '8px'}}>{t('common.could_not_load')}</span> :
                  null
              }
              <Button size='small' onClick={onLoadNextChildren} sx={{textTransform: 'none'}}>
                {
                  childrenFailed ?
                    t('common.try_again') :
                    t('common.show_more_of', {shown: children.length.toLocaleString(), total: childrenTotal.toLocaleString()})
                }
              </Button>
            </TableCell>
          </TableRow>
      }
    </React.Fragment>
  );
}
const TableResults = ({selected, bgColor, handleClick, handleRowClick, handleSelectAllClick, results, resource, nested, isSelected, isItemShown, order, orderBy, className, style, onOrderByChange, selectedToShowItem, size, excludedColumns, extraColumns, properties, propertyDefinition, propertyFilters, loading, hierarchical, baseURL, onRowsLoaded}) => {
  const [refTranslation, setRefTranslation] = React.useState(true)
  const rows = results?.results || []
  const getValue = (row, column) => {
    let val = get(row, column.value) || get(row, column.id)
    if(column.formatter)
      return column.formatter(val)
    if(column.renderer)
      return column.translation ? column.renderer(row, refTranslation) : column.renderer(row, Boolean(selectedToShowItem), rows)
    return val
  }
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    onOrderByChange(property, isAsc ? 'desc' : 'asc')
  };
  let columns = resolveColumns({
    resource: resource, nested: nested, baseURL: baseURL,
    excludedColumns: excludedColumns, extraColumns: extraColumns,
    properties: properties, propertyDefinition: propertyDefinition, propertyFilters: propertyFilters
  })
  return (
    <React.Fragment>
    <TableContainer style={style || {height: 'calc(var(--app-height) - 263px)'}} className={className}>
      <Table
        stickyHeader
        size={size || 'small'}
        sx={{
          '.MuiTableCell-head': {lineHeight: '1.2rem', padding: '3px 16px', fontSize: '12px', borderBottom: 1, borderBottomColor: 'surface.nv80'},
          // The padding above is right for a small table's select-all box; a medium one
          // lines it up with each row's box below it
          '.MuiTableCell-head.MuiTableCell-paddingCheckbox.MuiTableCell-sizeMedium': {paddingLeft: '4px', paddingRight: 0}
        }}
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
