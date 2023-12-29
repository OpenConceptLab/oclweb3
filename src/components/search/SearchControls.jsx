import React from 'react';
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import DisplayMenu from './DisplayMenu';
import SortMenu from './SortMenu';

const SearchControls = ({ disabled, onDisplayChange, display, order, orderBy, onOrderByChange, sortableFields }) => {
  const { t } = useTranslation()
  const [displayAnchorEl, setDisplayAnchorEl] = React.useState(null);
  const [sortAnchorEl, setSortAnchorEl] = React.useState(null);
  const onDisplayClick = event => setDisplayAnchorEl(event.currentTarget)
  const onDisplayMenuClose = () => setDisplayAnchorEl(null);
  const onSortClick = event => setSortAnchorEl(event.currentTarget)
  const onSortMenuClose = () => setSortAnchorEl(null);

  return (
    <div className='col-xs-12 padding-0' style={{float: 'right', textAlign: 'right'}}>
      <Button disabled={Boolean(disabled)} variant='contained' color='default' size='small' style={{textTransform: 'none'}} endIcon={<DownIcon fontSize='inherit' />} onClick={onSortClick}>
        {t('search.sort_by')}
      </Button>
      <Button id="display-menu" disabled={Boolean(disabled)} variant='contained' color='default' size='small' style={{textTransform: 'none', marginLeft: '8px'}} endIcon={<DownIcon fontSize='inherit' />} onClick={onDisplayClick}>
        {t('search.display')}
      </Button>
      <DisplayMenu
        labelId="display-menu"
        anchorEl={displayAnchorEl}
        onClose={onDisplayMenuClose}
        onSelect={onDisplayChange}
        selected={display}
      />
      <SortMenu
        labelId="sort-menu"
        anchorEl={sortAnchorEl}
        onClose={onSortMenuClose}
        onChange={onOrderByChange}
        order={order}
        orderBy={orderBy}
        fields={sortableFields}
      />
    </div>
  )
}


export default SearchControls;
