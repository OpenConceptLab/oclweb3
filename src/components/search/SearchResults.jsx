import React from 'react';
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import TablePagination from '@mui/material/TablePagination';
import Skeleton from '@mui/material/Skeleton';
import { isNumber, isNaN } from 'lodash'
import { TEXT_GRAY } from '../../common/constants';
import SearchControls from './SearchControls';
import NoResults from './NoResults';
import TableResults from './TableResults';
import CardResults from './CardResults';

const ResultsToolbar = props => {
  const { numSelected, title, onFiltersToggle, disabled, isFilterable, onDisplayChange, display } = props;
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
          alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
        borderBottom: (disabled || display === 'card') ? 'none': '1px solid rgba(224, 224, 224, 1)',
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

      <SearchControls disabled={disabled} onDisplayChange={onDisplayChange} display={display} />
      {
        isFilterable &&
          <IconButton style={{marginLeft: '5px'}} onClick={onFiltersToggle} disabled={Boolean(disabled)}>
            <FilterListIcon />
          </IconButton>
      }
    </Toolbar>
  );
}

const SearchResults = props => {
  const { t } = useTranslation()
  const history = useHistory()
  const [display, setDisplay] = React.useState(props.display || 'table')
  const [cardDisplayAnimation, setCardDisplayAnimation] = React.useState('animation-disappear')
  const [tableDisplayAnimation, setTableDisplayAnimation] = React.useState('animation-appear')
  const [selected, setSelected] = React.useState([]);
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('id');
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
    event.preventDefault()
    event.stopPropagation()
    const item = rows.find(row => id == (row.version_url || row.url || row.id)) || false
    if(props.resource === 'concepts') {
      props.onShowItemSelect(item)
    } else if (props.resource === 'repos') {
      history.push(item.version_url || item.url)
    }
    setTimeout(() => document.querySelector('.show-item')?.scrollIntoViewIfNeeded(), 100)
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;
  const showItem = props.selectedToShow
  const isItemShown = id => (showItem.version_url || showItem.url || showItem.id) === id

  // Avoid a layout jump when reaching the last page with empty rows.
  const getTitle = () => {
    const { results, resource } = props
    const total = results?.total
    if(isNumber(total) && !isNaN(total)) {
      const isMore = total && total === 10000;
      return total.toLocaleString() + (isMore ? '+' : '') + ' ' + t(`search.${resource}`).toLowerCase()
    }
  }

  const resultsProps = {
    handleClick: handleClick,
    handleRowClick: handleRowClick,
    handleSelectAllClick: handleSelectAllClick,
    selected: selected,
    results: props.results,
    resource: props.resource,
    isSelected: isSelected,
    isItemShown: isItemShown,
    bgColor: props.bgColor,
    order: order,
    orderBy: orderBy,
    setOrder: setOrder,
    setOrderBy: setOrderBy,
    isSplitView: Boolean(props.selectedToShow?.id),
    nested: props.nested,
    style: props.resultContainerStyle,
  }

  const isCardDisplay = display === 'card'

  return (
    <Box sx={{ width: '100%', background: 'inherit', height: '100%' }}>
      <ResultsToolbar
        numSelected={selected.length}
        title={getTitle()}
        onFiltersToggle={props.onFiltersToggle}
        disabled={props.noResults}
        isFilterable={props.isFilterable}
        onDisplayChange={onDisplayChange}
        display={display}
      />
      {
        props.noResults ?
          <NoResults searchedText={props.searchedText} height={props.height} /> :
        <React.Fragment>
          {
            isCardDisplay ?
              <CardResults {...resultsProps} className={cardDisplayAnimation} /> :
            <TableResults {...resultsProps} className={tableDisplayAnimation} />
          }
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={props.results?.total || 0}
            rowsPerPage={rowsPerPage || 25}
            page={(page || 1) - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showFirstButton
            showLastButton
            sx={{
              width: '100%',
              '& .MuiTablePagination-actions svg': { color: TEXT_GRAY},
              '& .MuiTablePagination-actions .Mui-disabled.MuiIconButton-root svg': { color: 'rgba(0, 0, 0, 0.26)'}
            }}
          />
        </React.Fragment>
      }
    </Box>
  );
}

export default SearchResults
