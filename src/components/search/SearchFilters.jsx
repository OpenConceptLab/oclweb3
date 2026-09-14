import React from 'react';
import { useTranslation } from 'react-i18next';
import {omit, omitBy, isEmpty, isObject, has, map, startCase, includes, get, without, forEach, flatten, values, pickBy, pick, isEqual, filter, reject, cloneDeep, keys, find, snakeCase} from 'lodash';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import UpIcon from '@mui/icons-material/ArrowDropUp';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import { URIToParentParams, currentUserHasAccess, toCamelCase } from '../../common/utils'
import { FACET_ORDER, EXCLUDE_FILTER_KEY } from './ResultConstants';

const SearchFilters = ({filters, resource, onChange, kwargs, bgColor, appliedFilters, fieldOrder, noSubheader, disabledZero, filterDefinitions, nested, onSaveAsDefaultFilters, loading, repoDefaultFilters, propertyFilters, propertyDefinition, heightToSubtract, open, allowExclude}) => {
  const { t } = useTranslation()
  const [applied, setApplied] = React.useState({});
  const [expanded, setExpanded] = React.useState([])
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null)
  const shouldShowActionBar = open !== undefined

  const filterOrder = fieldOrder || FACET_ORDER[resource]
  let blacklisted = ['is_active', 'is_latest_version', 'is_in_latest_source_version'];
  const isConcept = resource === 'concepts'
  const isMapping = resource === 'mappings'
  const isSourceChild = isConcept || isMapping
  let propertyFacets = {}
  const hasValidKwargs = !isEmpty(kwargs) && isObject(kwargs);
  if(hasValidKwargs) {
    if(kwargs.user || kwargs.org)
      blacklisted = [...blacklisted, 'owner', 'ownerType']
    if(kwargs.source)
      blacklisted = [...blacklisted, 'source']
    if(kwargs.collection)
      blacklisted = [...blacklisted, 'collection']
    if(isSourceChild)
      blacklisted = [...blacklisted, 'concept', 'conceptOwner', 'conceptOwnerType', 'conceptSource', 'expansion']
  }

  let uiFilters = omit(omitBy(filters, isEmpty), blacklisted)
  if(isSourceChild)
    uiFilters = omit(uiFilters, ['expansion'])
  if(isObject(kwargs) && !kwargs.collection && isSourceChild && !isEmpty(uiFilters) && !isEmpty(uiFilters.collection)){
    uiFilters['collection_membership'] = uiFilters.collection
    delete uiFilters.collection
  }

  if(has(uiFilters, 'experimental'))
    uiFilters.experimental = [[(uiFilters.experimental[0][0] === 1).toString(), uiFilters.experimental[0][1], uiFilters.experimental[0][2]]]

  if((!isEmpty(filterOrder) || !isEmpty(propertyFilters)) && !isEmpty(uiFilters)) {
    const orderedUIFilters = {}
    const keysTraversed = []
    let ordered = filterOrder?.length ? filterOrder : propertyFilters?.map(prop => prop?.code)
    forEach(ordered, attr => {
      let key;
      if(has(uiFilters, attr))
        key = attr
      if(has(uiFilters, toCamelCase(attr)))
        key = toCamelCase(attr)
      if(has(uiFilters, `properties__${attr}`))
        key = `properties__${attr}`
      if(key) {
        orderedUIFilters[key] = uiFilters[key]
        keysTraversed.push(attr)
      }
    })
    if(isConcept) {
      let orderedKeys = keys(uiFilters).sort()
      orderedKeys.forEach(key => {
        if(!keysTraversed.includes(keys))
          orderedUIFilters[key] = uiFilters[key]
      })
    }
    uiFilters = orderedUIFilters
  }
  if(isConcept){
    propertyFacets = pickBy(filters, (values, field) => field.startsWith('properties__') && !isEmpty(values))
    if(!isEmpty(propertyFacets)) {
      uiFilters = omit(uiFilters, ['conceptClass', 'datatype', ...keys(propertyFacets)])
    }
  }
  const formattedName = (field, name) => {
    let label;
    if(includes(['locale', 'version', 'source_version', 'nameTypes', 'expansion'], field))
      label = name
    else if(includes(['owner', 'source', 'collection', 'collection_membership'], field))
      label = name.replaceAll('_', '-').toUpperCase()
    else if (field === 'targetRepo') {
      const params = URIToParentParams(name)
      return `${params.owner}:${params.repo}`
    }
    else if(name) {
      name = name.trim()
      if(name === 'n/a')
        label = name.toUpperCase()
      else
        label = get(filterDefinitions, name)?.label || name
    }
    if(!label)
      label = 'None'
    if(isUnApplied(field, [name]))
      label += '*'
    return label
  }

  const formattedListSubheader = field => {
    if(isConcept) {
      let prop = find(propertyDefinition, def => [field, snakeCase(field), field.replace('properties__', '')].includes(def.code) && def.display)
      if(prop?.code)
        return prop.display
    }

    if(field.startsWith('properties__')){
      const fields = field.split('__')
      return startCase(fields[1])
    } else if (isFixedConceptField(field)) {
      return startCase(field)
    }
    return startCase(field)
  }

  const computeCount = obj => flatten(values(pick(obj, keys(filters))).map(v => values(omit(v, EXCLUDE_FILTER_KEY)))).length
  const count = computeCount(applied)

  const handleToggle = (field, value) => () => {
    const checked = !isApplied(field, value)
    let newApplied = {...cloneDeep(applied)}
    if(checked) {
      newApplied[field] = newApplied[field] || {}
      newApplied[field][value[0]] = checked
    }
    else {
      newApplied[field] = omit(newApplied[field], value[0])
    }
    if(isEmpty(omit(newApplied[field], EXCLUDE_FILTER_KEY)))
      newApplied = omit(newApplied, field)
    setApplied(newApplied)
  };

  const isFieldExcluded = field => Boolean(get(applied[field], EXCLUDE_FILTER_KEY))
  const isRowExcluded = (field, value) => isFieldExcluded(field) && isApplied(field, value)

  const toggleFieldExclude = (field, value) => e => {
    e.stopPropagation()
    const isIncludeAction = isRowExcluded(field, value)
    let newApplied = {...cloneDeep(applied)}
    newApplied[field] = newApplied[field] || {}
    if(isIncludeAction) {
      newApplied[field] = omit(newApplied[field], EXCLUDE_FILTER_KEY)
    } else {
      newApplied[field][EXCLUDE_FILTER_KEY] = true
      newApplied[field][value[0]] = true
    }
    if(isEmpty(omit(newApplied[field], EXCLUDE_FILTER_KEY)))
      newApplied = omit(newApplied, field)
    setApplied(newApplied)
  };

  const onClear = () => {
    setApplied({})
    if(onSaveAsDefaultFilters)
      onSaveAsDefaultFilters({})
    onChange({})
  }

  const onApply = () => {
    onChange(applied)
  }

  const isApplied = (field, value) => Boolean(get(applied[field], value[0]))
  const isUnApplied = (field, value) => isApplied(field, value) && !get(appliedFilters[field], value[0])
  const availableFilterFields = keys(filters)
  const canClear = !isEmpty(pick(applied, availableFilterFields)) || !isEmpty(pick(appliedFilters, availableFilterFields))
  const canResetToDefaultFilters = !isEmpty(repoDefaultFilters) && !isEqual(applied, repoDefaultFilters)

  React.useEffect(() => {
    setApplied(appliedFilters)
  }, [filters, appliedFilters])

  React.useEffect(() => {
    if(!shouldShowActionBar && !isEqual(applied, appliedFilters))
      onChange(applied)
  }, [applied, appliedFilters, onChange, shouldShowActionBar])

  const getFieldFilters = (field, fieldFilters) => {
    let ordered = [
      ...filter(fieldFilters, _filter => get(appliedFilters, `${field}.${_filter[0]}`)),
      ...reject(fieldFilters, _filter => get(appliedFilters, `${field}.${_filter[0]}`)),
    ]
    if(expanded.includes(field))
      return ordered
    return ordered.slice(0, 5)
  }

  const toggleExpanded = field => {
    if(expanded.includes(field))
      setExpanded(without(expanded, field))
    else
      setExpanded([...expanded, field])
  }

  const unapplied = (!isEmpty(applied) || !isEmpty(appliedFilters)) && !isEqual(applied, appliedFilters)

  const onSetDefaultFilters = () => {
    if(unapplied)
      onChange(applied)
    onSaveAsDefaultFilters(applied)
  }

  const onResetDefaultFilters = () => {
    setApplied(repoDefaultFilters)
    onChange(repoDefaultFilters)
  }

  const getFilterList = (fieldFilters, field) => {
    const shouldShowExpand = fieldFilters.length > 5
    const isExpanded = expanded.includes(field)
    const excluded = allowExclude && isFieldExcluded(field)
    return (
      <ListItem key={field} sx={{padding: 0, flexDirection: 'column'}}>
        <List
          dense
          sx={{
            width: '100%',
            position: 'relative',
            padding: 0,
            display: 'inline-block',
          }}
        >
          {
            !noSubheader &&
              <ListSubheader sx={{padding: '0 8px', fontWeight: 'bold', backgroundColor: bgColor, lineHeight: '30px'}}>
                {formattedListSubheader(field)}
                {
                  excluded &&
                    <span style={{color: '#d32f2f', fontWeight: 'normal', fontSize: '0.7rem', marginLeft: '6px'}}>
                      ({t('common.excluded')})
                    </span>
                }
              </ListSubheader>
          }
          {
            map(getFieldFilters(field, fieldFilters), value => {
              const labelId = `checkbox-list-label-${value[0]}`;
              const key = `${field}-${value[0]}`
              const rowExcluded = allowExclude && isRowExcluded(field, value)

              return (
                <ListItemButton key={key} onClick={handleToggle(field, value)} sx={{p: '0 12px', ...(allowExclude ? {'&:hover .filter-exclude-toggle': {opacity: 1}} : {})}} disabled={value[3] === true || (disabledZero && value[1] === 0)}>
                  <ListItemIcon sx={{minWidth: '25px'}}>
                    <Checkbox
                      size="small"
                      edge="start"
                      checked={isApplied(field, value)}
                      color={rowExcluded ? 'error' : 'primary'}
                      tabIndex={-1}
                      disableRipple
                      slotProps={{ input: { 'aria-labelledby': labelId } }}
                      sx={{padding: '0px 8px', '.MuiSvgIcon-root': {fontSize: '1.1rem'}}}
                      disabled={(disabledZero && value[1] === 0)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    id={labelId}
                    primary={
                      <span style={{display: 'flex', alignItems: 'center'}}>
                        {formattedName(field, value[0])}
                        {
                          get(filterDefinitions, value[0])?.tooltip &&
                            <Tooltip title={filterDefinitions[value[0]].tooltip}>
                              <InfoIcon sx={{marginLeft: '4px', fontSize: '1rem'}} color='primary' />
                            </Tooltip>
                        }
                      </span>
                    }
                    slotProps={{primary: {style: {fontSize: '0.875rem'}}}} style={{margin: 0}} />
                  {
                    allowExclude &&
                      <Button
                        className='filter-exclude-toggle'
                        size='small'
                        onClick={toggleFieldExclude(field, value)}
                        sx={{
                          opacity: 0,
                          transition: 'opacity 0.1s',
                          textTransform: 'none',
                          minWidth: 'auto',
                          lineHeight: 1,
                          padding: '2px 6px',
                          fontSize: '0.65rem',
                          marginRight: '4px',
                        }}
                        color={rowExcluded ? 'primary' : 'error'}
                      >
                        {rowExcluded ? t('common.include') : t('common.exclude')}
                      </Button>
                  }
                  <span style={{fontSize: '0.7rem'}}>{value[1].toLocaleString()}</span>
                </ListItemButton>
              );
            })}

        </List>
        {
          shouldShowExpand &&
            <ListItem sx={{padding: '4px 4px 0px 4px'}}>
              <Button size='small' onClick={() => toggleExpanded(field)} sx={{textTransform: 'none', fontSize: '11px', padding: '0px 5px 2px 5px'}} color='secondary' startIcon={isExpanded ? <UpIcon fontSize='inherit'/> : <DownIcon fontSize='inherit'/>}>
                {isExpanded ? t('common.hide') : `${t('common.show')} ${fieldFilters.length - 5} ${t('common.more').toLowerCase()}`}
              </Button>
            </ListItem>
        }
      </ListItem>
    )
  }


  const isFixedConceptField = field => isConcept && ['conceptClass', 'datatype'].includes(field)
  const canUpdateDefaultFilters = nested && onSaveAsDefaultFilters && currentUserHasAccess()
  const topBarHeight = shouldShowActionBar ? 36 : 0
  let totalFilters = {...propertyFacets, ...uiFilters}

  return (
    <div className='col-xs-12 padding-0'>
      {
        shouldShowActionBar &&
          <div className='col-xs-12' style={{zIndex: 2, padding: '0px', position: open ? 'absolute' : undefined, top: 0, display: open ? undefined : 'none'}}>
            <div className='col-xs-12' style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', flexWrap: 'nowrap'}}>
              <Badge badgeContent={count} color='primary' sx={{'.MuiBadge-badge': {top: '10px', left: '36px'}}}>
                <b>{t('search.filters')}</b>
              </Badge>
              <span>
                <Tooltip title={t('common.apply')}>
                  <span>
                    <IconButton size='small' color='primary' onClick={onApply} disabled={!unapplied}>
                      <CheckIcon fontSize='small' />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    !isEmpty(repoDefaultFilters) && canUpdateDefaultFilters ?
                      t('search.clear_filters_with_defaults_tooltip') :
                      t('search.clear_filters_tooltip')
                  }
                >
                  <span>
                    <IconButton size='small' color='error' onClick={onClear} disabled={!canClear}>
                      <ClearIcon fontSize='small' />
                    </IconButton>
                  </span>
                </Tooltip>
                {
                  canUpdateDefaultFilters &&
                    <Tooltip title={t('search.default_filters_menu_tooltip')}>
                      <IconButton size='small' onClick={e => setMenuAnchorEl(e.currentTarget)}>
                        <MoreVertIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                }
                {
                  canUpdateDefaultFilters &&
                    <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={() => setMenuAnchorEl(null)}>
                      <Tooltip title={t('search.save_default_filters')} placement='right' disableInteractive>
                        <span>
                          <MenuItem
                            dense
                            disabled={isEmpty(applied) || isEqual(applied, repoDefaultFilters)}
                            onClick={() => { setMenuAnchorEl(null); onSetDefaultFilters() }}
                          >
                            {t('search.save_default_filters')}
                          </MenuItem>
                        </span>
                      </Tooltip>
                      <Tooltip title={t('search.reset_default_filters_tooltip')} placement='right' disableInteractive>
                        <span>
                          <MenuItem
                            dense
                            disabled={!canResetToDefaultFilters}
                            onClick={() => { setMenuAnchorEl(null); onResetDefaultFilters() }}
                            sx={{color: 'error.main'}}
                          >
                            {t('search.reset_default_filters')}
                          </MenuItem>
                        </span>
                      </Tooltip>
                    </Menu>
                }
              </span>
            </div>
          </div>
      }
      <div className='col-xs-12 padding-0' style={{marginTop: `${topBarHeight}px`, height: `calc(100vh - ${heightToSubtract || 0}px - ${topBarHeight}px)`, overflowY: 'auto'}}>
        {
          loading && isEmpty(totalFilters) &&
            <div className='col-xs-12' style={{textAlign: 'center', padding: '16px'}}>
              <CircularProgress />
            </div>
        }
        {
          !isEmpty(propertyFacets) &&
            <List
              dense
              sx={{
                width: '100%',
                position: 'relative',
                padding: 0,
                display: 'inline-block',
                marginTop: '8px'
              }}>
              <ListSubheader sx={{padding: '0 8px', fontWeight: 'bold', backgroundColor: bgColor, lineHeight: 'normal', color: '#000'}}>
                {t('repo.properties_filters_subheader')}
              </ListSubheader>
              {
                map(propertyFilters.map(prop => prop.code), code => {
                  let field = `properties__${code}`
                  let __filters = propertyFacets[field]
                  if(!__filters){
                    field = code
                    __filters = propertyFacets[field]
                  }
                  if(__filters)
                    return getFilterList(__filters, field)
                })
              }
            </List>
        }
        {
          !isEmpty(uiFilters) &&
            <List
              dense
              sx={{
                width: '100%',
                position: 'relative',
                padding: 0,
                display: 'inline-block',
                marginTop: isEmpty(propertyFacets) ? 0 : '14px'
              }}
            >
              {
                !isEmpty(propertyFacets) &&
                  <ListSubheader sx={{padding: '0 8px', fontWeight: 'bold', backgroundColor: bgColor, lineHeight: 'normal', color: '#000'}}>
                    {t('repo.additional_metadata_filters_subheader')}
                  </ListSubheader>
              }
              {map(uiFilters, getFilterList)}
            </List>
        }
      </div>
    </div>
  )
}

export default SearchFilters;
