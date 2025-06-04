import React from 'react';
import { useTranslation } from 'react-i18next';
import {omit, omitBy, isEmpty, isObject, has, map, startCase, includes, get, without, forEach, flatten, values} from 'lodash';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import ClearIcon from '@mui/icons-material/Clear';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import UpIcon from '@mui/icons-material/ArrowDropUp';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import { FACET_ORDER } from './ResultConstants';


const SearchFilters = ({filters, resource, onChange, kwargs, bgColor, appliedFilters, fieldOrder, noSubheader, disabledZero, filterDefinitions}) => {
  const { t } = useTranslation()
  const [applied, setApplied] = React.useState({});
  const [count, setCount] = React.useState(0);
  const [expanded, setExpanded] = React.useState([])

  const filterOrder = fieldOrder || FACET_ORDER[resource]
  let blacklisted = ['is_active', 'is_latest_version', 'is_in_latest_source_version'];
  const isSourceChild = ['concepts', 'mappings'].includes(resource)
  const hasValidKwargs = !isEmpty(kwargs) && isObject(kwargs);
  if(hasValidKwargs) {
    if(kwargs.user || kwargs.org)
      blacklisted = [...blacklisted, 'owner', 'ownerType']
    if(kwargs.source)
      blacklisted = [...blacklisted, 'source']
    if(kwargs.collection)
      blacklisted = [...blacklisted, 'collection']
    if(isSourceChild)
      blacklisted = [...blacklisted, 'concept', 'conceptOwner', 'conceptOwnerType', 'conceptSource']
  }

  let uiFilters = omit(omitBy(filters, isEmpty), blacklisted)
  if(isObject(kwargs) && !kwargs.collection && isSourceChild && !isEmpty(uiFilters) && !isEmpty(uiFilters.collection)){
    uiFilters['collection_membership'] = uiFilters.collection
    delete uiFilters.collection
  }

  if(has(uiFilters, 'experimental'))
    uiFilters.experimental = [[(uiFilters.experimental[0][0] === 1).toString(), uiFilters.experimental[0][1], uiFilters.experimental[0][2]]]

  if(!isEmpty(filterOrder) && !isEmpty(uiFilters)) {
    const orderedUIFilters = {}
    forEach(filterOrder, attr => {
      if(has(uiFilters, attr))
        orderedUIFilters[attr] = uiFilters[attr]
    })
    uiFilters = orderedUIFilters
  }

  const formattedName = (field, name) => {
    if(includes(['locale', 'version', 'source_version', 'nameTypes', 'expansion'], field))
      return name
    if(includes(['owner', 'source', 'collection', 'collection_membership'], field))
      return name.replaceAll('_', '-').toUpperCase()
    if(name) {
      name = name.trim()
      if(name === 'n/a')
        return name.toUpperCase()

      return get(filterDefinitions, name)?.label || startCase(name)
    }
  }

  const handleToggle = (field, value) => () => {
    const checked = !isApplied(field, value)
    let newApplied = {...applied}
    let newCount = count
    if(checked) {
      newApplied[field] = newApplied[field] || {}
      newApplied[field][value[0]] = checked
      newCount += 1
    }
    else {
      newApplied[field] = omit(newApplied[field], value[0])
      newCount -= 1
    }
    if(isEmpty(newApplied[field]))
      newApplied = omit(newApplied, field)
    setCount(newCount)
    setApplied(newApplied)
    onChange(newApplied)
  };

  const onClear = () => {
    setApplied({})
    setCount(0)
    onChange({})
  }

  const isApplied = (field, value) => Boolean(get(applied[field], value[0]))

  const getClearButtonText = () => {
    let text = t('common.clear')
    if(count)
      text += ` ${count} ${t('search.filters').toLowerCase()}`
    return text
  }

  React.useEffect(() => {
    setCount(flatten(values(appliedFilters).map(v => values(v))).length)
    setApplied(appliedFilters)
  }, [filters])

  const getFieldFilters = (field, fieldFilters) => {
    if(expanded.includes(field))
      return fieldFilters
    return fieldFilters.slice(0, 4)
  }

  const toggleExpanded = field => {
    if(expanded.includes(field))
      setExpanded(without(expanded, field))
    else
      setExpanded([...expanded, field])
  }

  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-12' style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2, padding: '14px 0 0 0'}}>
        <span>
          <b>{t('search.filters')}</b>
        </span>
        <span>
          <Button variant='text' startIcon={<ClearIcon style={{color: 'inherit'}} fontSize='inherit' />} style={{textTransform: 'none'}} onClick={onClear} disabled={!count}>
            {getClearButtonText()}
          </Button>
        </span>
      </div>
      {
        map(uiFilters, (fieldFilters, field) => {
          const shouldShowExpand = fieldFilters.length > 4
          const isExpanded = expanded.includes(field)
          return (
            <React.Fragment key={field}>
              <List
                dense
                sx={{
                  width: '100%',
                  position: 'relative',
                  padding: '2px 0 4px 0',
                }}
              >
                {
                !noSubheader &&
                    <ListSubheader sx={{p: 0, fontWeight: 'bold', background: bgColor, lineHeight: '30px'}}>{startCase(field)}</ListSubheader>
                }
                {
                  getFieldFilters(field, fieldFilters).map(value => {
                    const labelId = `checkbox-list-label-${value[0]}`;
                    const key = `${field}-${value[0]}`

                    return (
                      <ListItemButton key={key} onClick={handleToggle(field, value)} sx={{p: '0 12px 0 4px'}} disabled={value[3] === true || (disabledZero && value[1] === 0)}>
                        <ListItemIcon sx={{minWidth: '25px'}}>
                          <Checkbox
                            size="small"
                            edge="start"
                            checked={isApplied(field, value)}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ 'aria-labelledby': labelId }}
                            style={{padding: '4px 8px'}}
                            disabled={(disabledZero && value[1] === 0)}
                          />
                        </ListItemIcon>
                        <ListItemText
                          id={labelId}
                          primary={
                            <span style={{display: 'flex', alignItems: 'center'}}>
                              {formattedName(field, value[0]) || 'None'}
                            {
                              get(filterDefinitions, value[0])?.tooltip &&
                                <Tooltip title={filterDefinitions[value[0]].tooltip}>
                                  <InfoIcon sx={{marginLeft: '4px', fontSize: '1rem'}} color='primary' />
                              </Tooltip>
                            }
                            </span>
                          }
                          primaryTypographyProps={{style: {fontSize: '0.875rem'}}} style={{margin: 0}} />
                        <span style={{fontSize: '0.7rem'}}>{value[1].toLocaleString()}</span>
                      </ListItemButton>
                    );
                  })}
              </List>
              {
                shouldShowExpand &&
                  <Button size='small' onClick={() => toggleExpanded(field)} style={{textTransform: 'none'}} color='secondary' startIcon={isExpanded ? <UpIcon fontSize='inherit'/> : <DownIcon fontSize='inherit'/>}>
                    {isExpanded ? t('common.hide') : `${t('common.show')} ${fieldFilters.length - 4} ${t('common.more').toLowerCase()}`}
                  </Button>
              }
            {
              !noSubheader &&
              <Divider />
            }
            </React.Fragment>
          )
        })
      }
    </div>
  )
}

export default SearchFilters;
