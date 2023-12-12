import React from 'react';
import { useTranslation } from 'react-i18next'
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import { filter, isNumber } from 'lodash'
import Skeleton from '@mui/material/Skeleton';
import SearchControls from './SearchControls';
import { ALL_COLUMNS } from './ResultConstants';

const EnhancedTableHead = props => {
  const { t } = useTranslation()
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, columns } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };
  return (
    <TableHead sx={{background: props.bgColor}}>
      <TableRow sx={{background: 'inherit'}}>
        <TableCell padding="checkbox" sx={{background: 'inherit'}}>
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {columns.map((headCell) => (
          <TableCell
            key={headCell.id}
            align='left'
            padding='normal'
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{background: 'inherit'}}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              <b>{t(headCell.labelKey)}</b>
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const EnhancedTableToolbar = props => {
  const { numSelected, title } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
        minHeight: '48px !important'
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        title ?
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h7"
            id="tableTitle"
            component="div"
          >
            {title}
          </Typography> :
        <div style={{flex: '1 1 100%'}}>
          <Skeleton variant="text" sx={{ fontSize: '1rem', width: '15%' }} />
        </div>
      )}

      <SearchControls />
      <IconButton style={{marginLeft: '5px'}}>
        <FilterListIcon />
      </IconButton>
    </Toolbar>
  );
}

const ResultsTable = props => {
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('id');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState((props?.results?.page|| 1) - 1);
  const [rowsPerPage, setRowsPerPage] = React.useState(props?.results?.pageSize || 25);
  const { t } = useTranslation()
  const rows = props?.results?.results || []

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.version_url || n.url || n.id);
      setSelected(newSelected);
      props.onSelect(newSelected)
      return;
    }
    setSelected([]);
    props.onSelect([])
  };

  const handleClick = (event, id) => {
    event.preventDefault()
    event.stopPropagation()

    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
    props.onSelect(newSelected)
  };

  const handleRowClick = (event, id) => {
    event.preventDefault()
    event.stopPropagation()

    const row = rows.find(row => id == (row.version_url || row.url || row.id)) || false
    props.onShowItemSelect(row)
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    props.onPageChange(newPage, rowsPerPage)
  };

  const handleChangeRowsPerPage = (event) => {
    const _pageSize = parseInt(event.target.value, 10)
    setRowsPerPage(_pageSize);
    setPage(0);
    props.onPageChange(0, _pageSize)
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;
  const showItem = props.selectedToShow
  const isItemShown = id => (showItem.version_url || showItem.url || showItem.id) === id

  // Avoid a layout jump when reaching the last page with empty rows.
  const getTitle = () => {
    const { results, resource } = props
    const total = results?.total
    if(isNumber(total))
      return total.toLocaleString() + ' ' + t(`search.${resource}`).toLowerCase()
  }

  const columns = filter(
    ALL_COLUMNS[props.resource] || [],
    column => props.nested ? column.nested !== false : column.global !== false
  )

  const getValue = (row, column) => {
    let val = row[column.value]
    if(column.formatter)
      return column.formatter(val)
    if(column.renderer)
      return column.renderer(row)
    return val
  }

  return (
    <Box sx={{ width: '100%', background: 'inherit' }}>
      <EnhancedTableToolbar numSelected={selected.length} title={getTitle()} />
      <TableContainer style={{maxHeight: '64vh'}}>
          <Table
            stickyHeader
            sx={{ minWidth: 750 }}
            size='small'
          >
            <EnhancedTableHead
              bgColor={props.bgColor}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={props?.results?.results?.length || 0}
              resource={props.resource}
              columns={columns}
            />
            <TableBody>
              {rows.map((row, index) => {
                const id = row.version_url || row.url || row.id
                const isItemSelected = isSelected(id);
                const isItemSelectedToShow = isItemShown(id)
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelectedToShow}
                    tabIndex={-1}
                    key={id}
                    onClick={event => handleRowClick(event, id)}
                    selected={isItemSelectedToShow}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox" onClick={event => handleClick(event, id)}>
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
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
                          >
                            {value}
                          </TableCell>:
                        <TableCell key={idx} align="left" className={column.className}>
                          {value}
                        </TableCell>
                      })
                    }
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={props?.results?.total || 25}
          rowsPerPage={rowsPerPage}
          page={(page || 1) - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </Box>
  );
}

export default ResultsTable
