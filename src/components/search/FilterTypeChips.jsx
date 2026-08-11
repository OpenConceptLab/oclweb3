import React from 'react';
import { useTranslation } from 'react-i18next';
import Chip from '@mui/material/Chip';

const ORG_TYPE = { type: 'orgs', labelKey: 'org.org', enabled: true }
const REPO_TYPE = { type: 'repos', labelKey: 'repo.repo', enabled: true }
const USER_TYPE = { type: 'users', labelKey: 'user.user', enabled: true }
const CONCEPT_CLASS_TYPE = { type: 'conceptClass', labelKey: 'search.class', enabled: true }
const MAP_TYPE_TYPE = { type: 'mapType', labelKey: 'search.map_type', enabled: true }

const GENERIC_TYPES = [ORG_TYPE, REPO_TYPE, USER_TYPE]

const getFilterTypes = (isNested, resource) => {
  if(!isNested)
    return GENERIC_TYPES

  // Map Type only applies to mappings and Class only to concepts - only offer the one that
  // matches the current tab, rather than the other one that'd need a tab switch to apply.
  const primary = resource === 'mappings' ? MAP_TYPE_TYPE : CONCEPT_CLASS_TYPE
  return [primary, ...GENERIC_TYPES]
}

const FilterTypeChips = React.forwardRef(({ onSelect, isNested, resource }, ref) => {
  const { t } = useTranslation()
  const [focus, setFocus] = React.useState(0)
  const filterTypes = getFilterTypes(isNested, resource)

  React.useImperativeHandle(ref, () => ({
    onKeyDown: event => {
      if(event.key === 'ArrowRight') {
        event.preventDefault()
        setFocus(prev => (prev + 1) % filterTypes.length)
      } else if(event.key === 'ArrowLeft') {
        event.preventDefault()
        setFocus(prev => (prev - 1 + filterTypes.length) % filterTypes.length)
      } else if(event.key === 'Enter') {
        event.preventDefault()
        const selected = filterTypes[focus]
        if(selected?.enabled)
          onSelect(selected.type)
      }
    }
  }))

  return (
    <div style={{display: 'flex', gap: '8px', padding: '12px 16px', flexWrap: 'wrap'}}>
      {
        filterTypes.map((filterType, index) => (
          <Chip
            key={filterType.type}
            label={t(filterType.labelKey)}
            variant='outlined'
            disabled={!filterType.enabled}
            onClick={() => filterType.enabled && onSelect(filterType.type)}
            sx={{
              fontWeight: 'bold',
              ...(
                focus === index && filterType.enabled ?
                  {backgroundColor: 'primary.90', borderColor: 'primary.main', color: 'primary.main'} :
                  {}
              )
            }}
          />
        ))
      }
    </div>
  )
})

FilterTypeChips.displayName = 'FilterTypeChips'

export default FilterTypeChips
