import React from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import MenuIcon from '@mui/icons-material/MoreVert'
import AddIcon from '@mui/icons-material/Add'
import SortIcon from '@mui/icons-material/ImportExport'
import OpenIcon from '@mui/icons-material/OpenInBrowser'
import CompareIcon from '@mui/icons-material/CompareArrows'
import RetireIcon from '@mui/icons-material/Delete'
import compact from 'lodash/compact'
import isNumber from 'lodash/isNumber'
import { dropVersion } from '../../common/utils'

const AssociationRowOptions = ({ mapping, concept, isIndirect, canAct, canSort, disabled, onAddNewClick, onAssignSortWeight, onClearSortWeight, onRetireClick }) => {
  const { t } = useTranslation()
  const anchorRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)
  const mapTypeLabel = isIndirect ? `${mapping.map_type}⁻¹` : mapping.map_type
  const conceptURL = concept?.url
  const fromConceptURL = mapping.from_concept_url || (mapping.to_concept_url ? conceptURL : undefined)
  const toConceptURL = mapping.to_concept_url || (mapping.from_concept_url ? conceptURL : undefined)

  const navigate = href => () => { window.location.hash = href }

  const options = compact([
    {label: t('mapping.open_mapping_details'), icon: <OpenIcon fontSize='small' />, onClick: navigate(dropVersion(mapping.url))},
    fromConceptURL && fromConceptURL !== conceptURL && {label: t('mapping.open_from_concept'), icon: <OpenIcon fontSize='small' />, onClick: navigate(fromConceptURL)},
    toConceptURL && toConceptURL !== conceptURL && {label: t('mapping.open_to_concept'), icon: <OpenIcon fontSize='small' />, onClick: navigate(toConceptURL)},
    fromConceptURL && toConceptURL && {label: t('mapping.compare_concepts'), icon: <CompareIcon fontSize='small' />, divider: true, onClick: navigate(`/concepts/compare?lhs=${fromConceptURL}&rhs=${toConceptURL}`)},
    canAct && onAddNewClick && {label: t('mapping.add_new_map_type_mapping', {mapType: mapTypeLabel}), icon: <AddIcon fontSize='small' />, divider: true, onClick: () => onAddNewClick(mapping.map_type)},
    canSort && (
      isNumber(mapping.sort_weight) ?
        {label: t('mapping.clear_sort_weight'), icon: <SortIcon fontSize='small' color='error' />, divider: true, onClick: () => onClearSortWeight(mapping)} :
        {label: t('mapping.assign_sort_weight'), icon: <SortIcon fontSize='small' />, divider: true, onClick: () => onAssignSortWeight(mapping)}
    ),
    canAct && onRetireClick && {
      label: mapping.retired ? t('mapping.reactivate_mapping') : t('mapping.retire_mapping'),
      icon: <RetireIcon fontSize='small' color='error' />,
      divider: true,
      error: true,
      onClick: () => onRetireClick(mapping)
    }
  ])

  const onOptionClick = (event, option) => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(false)
    option.onClick()
  }

  return (
    <React.Fragment>
      <IconButton size='small' ref={anchorRef} disabled={disabled} onClick={event => { event.stopPropagation(); setOpen(!open) }}>
        <MenuIcon fontSize='inherit' />
      </IconButton>
      <Menu open={open} anchorEl={anchorRef.current} onClose={() => setOpen(false)}>
        {
          options.map((option, index) => ([
            option.divider ? <Divider key={`divider-${index}`} /> : null,
            <MenuItem key={index} onClick={event => onOptionClick(event, option)} sx={option.error ? {color: 'error.main'} : undefined}>
              <ListItemIcon>{option.icon}</ListItemIcon>
              <ListItemText>{option.label}</ListItemText>
            </MenuItem>
          ]))
        }
      </Menu>
    </React.Fragment>
  )
}

export default AssociationRowOptions;
