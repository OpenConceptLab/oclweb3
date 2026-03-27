import React from 'react';
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import TablePagination from '@mui/material/TablePagination';
import Skeleton from '@mui/material/Skeleton';
import { isNumber, isNaN, flatten, values } from 'lodash'
import SearchControls from './SearchControls';
import NoResults from './NoResults';
import TableResults from './TableResults';
import CardResults from './CardResults';
import { SORT_ATTRS } from './ResultConstants'

const ResultsToolbar = props => {
  const { numSelected, title, onFiltersToggle, disabled, isFilterable, onDisplayChange, display, order, orderBy, onOrderByChange, sortableFields, noCardDisplay, toolbarControl, appliedFilters, openFilters } = props;
  const filtersCount = flatten(values(appliedFilters).map(v => values(v))).length
  return (
    <Toolbar
      sx={{
        bgcolor: '#FFF',
        borderRadius: 0,
        pl: { sm: 1 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
          alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
        borderBottom: (disabled || display === 'card') ? 'none': '1px solid rgba(224, 224, 224, 1)',
        minHeight: '48px !important',
      }}
    >
      {
        isFilterable &&
          <IconButton style={{marginRight: '4px', ...(filtersCount > 0 ? {backgroundColor: 'rgba(73, 69, 79, 0.12)'} : {})}} onClick={onFiltersToggle} disabled={Boolean(disabled)}>
            <Badge badgeContent={openFilters ? undefined : filtersCount} color='primary'>
              <FilterListIcon sx={{color: '#000'}} />
            </Badge>
        </IconButton>
      }
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%', marginLeft: isFilterable ? '8px' : 0 }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        title ?
          <Typography
            sx={{ flex: '1 1 100%', marginLeft: isFilterable ? '8px' : 0 }}
            variant="h7"
            id="tableTitle"
            component="div"
          >
            {title}
          </Typography> :
        <div style={{flex: '1 1 100%', marginLeft: isFilterable ? '8px' : 0}}>
          <Skeleton variant="text" sx={{ fontSize: '1rem', width: '15%' }} />
        </div>
      )}
      <SearchControls
        disabled={disabled}
        onDisplayChange={onDisplayChange}
        display={display}
        orderBy={orderBy}
        order={order}
        onOrderByChange={onOrderByChange}
        sortableFields={sortableFields}
        noCardDisplay={noCardDisplay}
        extraControls={toolbarControl}
      />
    </Toolbar>
  );
}

const SearchResults = props => {
  const { t } = useTranslation()
  const history = useHistory()
  const [display, setDisplay] = React.useState(props.display || 'table')
  const [cardDisplayAnimation, setCardDisplayAnimation] = React.useState('animation-disappear')
  const [tableDisplayAnimation, setTableDisplayAnimation] = React.useState('animation-appear')
  const [selected, setSelected] = React.useState(props.selected || []);
  const page = props.results?.page;
  const rowsPerPage = props.results?.pageSize;

  const rows = props.results?.results || []
  const onDisplayChange = async (newDisplay, ms) => {
    if(newDisplay === 'table') {
      setCardDisplayAnimation('animation-disappear')
      setTableDisplayAnimation('animation-appear')
    } else {
      setCardDisplayAnimation('animation-appear')
      setTableDisplayAnimation('animation-disappear')
    }
    await new Promise(r => setTimeout(r, ms))
    setDisplay(newDisplay)
    props.onDisplayChange()
  }

  const handleChangePage = (event, newPage) => {
    props.onPageChange(newPage + 1, rowsPerPage)
  };

  const handleChangeRowsPerPage = (event) => {
    const _pageSize = parseInt(event.target.value, 10)
    props.onPageChange(1, _pageSize)
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
    if(props.resource === 'references')
      return

    event.preventDefault()
    event.stopPropagation()
    const item = rows.find(row => id == (row.version_url || row.url || row.id)) || false
    if(['concepts', 'mappings'].includes(props.resource)) {
      props.onShowItemSelect(item)
    } else if (props.resource === 'repos') {
      history.push(item.url)
    } else if (['users', 'orgs'].includes(props.resource)) {
      history.push(item.version_url || item.url)
    }
    setTimeout(() => document.querySelector('.show-item')?.scrollIntoViewIfNeeded(), 100)
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;
  const showItem = props.selectedToShow
  const isItemShown = id => (showItem?.version_url || showItem?.url || showItem?.id) === id

  // Avoid a layout jump when reaching the last page with empty rows.
  const getTitle = () => {
    const { results, resource, title } = props
    if(title)
      return title
    if(props.isMatch)
      return 'Matched Candidates'
    const total = results?.total
    if(isNumber(total) && !isNaN(total)) {
      const isMore = total && total === 10000;
      return total.toLocaleString() + (isMore ? '+' : '') + ' ' + t(`search.${resource}`).toLowerCase()
    }
  }

  const sortableFields = (props.nested ? SORT_ATTRS.nested[props.resource] : SORT_ATTRS.global[props.resource]) || SORT_ATTRS.common[props.resource]

  const resultsProps = {
    handleClick: props.onSelect ? handleClick : false,
    handleRowClick: handleRowClick,
    handleSelectAllClick: props.onSelect ? handleSelectAllClick : false,
    selected: selected,
    results: props.results,
    resource: props.resource,
    isSelected: isSelected,
    isItemShown: isItemShown,
    bgColor: props.bgColor,
    onOrderByChange: props.onOrderByChange,
    isSplitView: Boolean(props.selectedToShow?.id),
    nested: props.nested,
    style: props.resultContainerStyle,
    order: props.order,
    orderBy: props.orderBy,
    selectedToShowItem: props.selectedToShow,
    size: props.resultSize,
    excludedColumns: props.excludedColumns,
    extraColumns: props.extraColumns,
    properties: props.properties,
    propertyFilters: props.propertyFilters,
    loading: props.loading
  }
  const noCardDisplay = props.resource !== 'concepts' || props.noCardDisplay

  const isCardDisplay = !noCardDisplay && display === 'card'

  React.useEffect(() => {
    setSelected(props.selected || [])
  }, [props.selected])


  const defaultLabelDisplayedRows = ({ from, to, count }) => `${from}–${to} of ${count !== -1 ? count?.toLocaleString() : (props.isMatch ? 'many' : `more than ${to?.toLocaleString()}`)}`

  return (
    <Box sx={{ width: '100%', background: 'inherit', height: '100%', ...props.sx }}>
      {
      !props.noToolbar &&
          <ResultsToolbar
            numSelected={selected.length}
            title={getTitle()}
            onFiltersToggle={props.onFiltersToggle}
            disabled={props.noResults}
            isFilterable={props.isFilterable}
            onDisplayChange={onDisplayChange}
            display={display}
            sortableFields={props.noSorting ? false : sortableFields}
            order={props.order}
            orderBy={props.orderBy}
            onOrderByChange={props.onOrderByChange}
            noCardDisplay={noCardDisplay}
            toolbarControl={props.toolbarControl}
            appliedFilters={props.appliedFilters}
          />
      }
      {
        props.noResults ?
          <NoResults searchedText={props.searchedText} height={props.height} /> :
        <React.Fragment>
          {
            isCardDisplay ?
              <CardResults {...resultsProps} className={cardDisplayAnimation} /> :
            <TableResults {...resultsProps} className={tableDisplayAnimation} />
          }
          {
          !props.noPagination &&
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={props.isMatch ? -1 : props.results?.total || 0}
                rowsPerPage={rowsPerPage || 25}
                page={(page || 1) - 1}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                showFirstButton
                showLastButton
                labelDisplayedRows={defaultLabelDisplayedRows}
                sx={{
                  width: '100%',
                  '.MuiToolbar-root': {
                    height: '40px',
                    minHeight: '40px'
                  },
                  '& .MuiTablePagination-actions svg': { color: 'surface.contrastText'},
                  '& .MuiTablePagination-actions .Mui-disabled.MuiIconButton-root svg': { color: 'rgba(0, 0, 0, 0.26)'}
                }}
              />
          }
        </React.Fragment>
      }
    </Box>
  );
}

export default SearchResults
