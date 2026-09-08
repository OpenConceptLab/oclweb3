import React from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Badge from '@mui/material/Badge'

import DragIcon from '@mui/icons-material/DragIndicator'
import SortIcon from '@mui/icons-material/ImportExport'
import UpIcon from '@mui/icons-material/ArrowUpward'
import DownIcon from '@mui/icons-material/ArrowDownward'
import WarningIcon from '@mui/icons-material/WarningAmber'
import { map, get, forEach, orderBy, filter, find, isNumber, has, some, maxBy } from 'lodash';

import { toParentURI, getSiblings } from '../../common/utils'
import AssociationMappingCells from './AssociationMappingCells'
import AssociationRowOptions from './AssociationRowOptions'

const DEFAULT_ORDER_BY = ['sort_weight', 'cascade_target_source_name', 'cascade_target_concept_name']
const ORDER_BY = ['_sort_weight', 'cascade_target_source_name', 'cascade_target_concept_name']
const order = (mappings, isDefault) => orderBy(mappings, isDefault ? DEFAULT_ORDER_BY : ORDER_BY)
const CELL_WIDTHS = ['22%', '20%', '38%', '20%']

const SortableAssociationRow = ({ concept, mappings, mapType, isSelf, isIndirect, canAct, canSort, onSortEnd, onAddNewClick, onAssignSortWeight, onClearSortWeight, onRetireMapping }) => {
  const { t } = useTranslation()
  const [oMappings, setMappings] = React.useState([])

  const getOrderedMappings = () => {
    if(find(mappings, mapping => has(mapping, '_sort_weight')) && !some(mappings, mapping => mapping._sort_weight === undefined))
      return order(mappings)
    const parentURL = toParentURI(concept?.url || concept?.version_url)
    const sameParent = []
    const differentParent = []
    forEach(mappings, mapping => {
      if(mapping.cascade_target_concept_url && toParentURI(mapping.cascade_target_concept_url) === parentURL)
        sameParent.push(mapping)
      else
        differentParent.push(mapping)
    })
    let prevMapping
    return order(map(order([...sameParent, ...differentParent], true), (mapping, index) => {
      mapping._sort_weight = mapping._sort_weight || mapping.sort_weight
      mapping._initial_assigned_sort_weight = mapping._initial_assigned_sort_weight || mapping.sort_weight
      if(!isNumber(mapping._sort_weight)) {
        const newWeight = isNumber(prevMapping?._sort_weight) ? prevMapping._sort_weight + 1 : index + 1
        mapping._sort_weight = newWeight
        mapping._initial_assigned_sort_weight = newWeight
      }
      mapping._original_position = mapping._original_position || index
      prevMapping = mapping
      return mapping
    }))
  }

  React.useEffect(() => setMappings(getOrderedMappings()), [mappings])

  const reorderMappings = (from, to) => {
    const newMappings = [...oMappings]
    const [moved] = newMappings.splice(from, 1)
    newMappings.splice(to, 0, moved)
    forEach(newMappings, (mapping, index) => { mapping._sort_weight = index + 1 })
    const ordered = order(newMappings)
    setMappings(ordered)
    return ordered
  }

  const toggleSiblings = disable => {
    const thisRow = document.getElementById(mapType)
    forEach(thisRow ? getSiblings(thisRow) : [], sibling => disable ?
            sibling.classList.add('droppable-disabled') :
            sibling.classList.remove('droppable-disabled'))
  }

  const onDragEnd = result => {
    toggleSiblings(false)
    if(!result.destination || result.source.index === result.destination.index)
      return
    const newMappings = reorderMappings(result.source.index, result.destination.index)
    onSortEnd(find(newMappings, mapping => mapping.sort_weight !== mapping._sort_weight && mapping._sort_weight !== mapping._initial_assigned_sort_weight) ? newMappings : [])
  }

  const sortedCount = oMappings.length > 1 ? filter(oMappings, mapping => isNumber(mapping.sort_weight)).length : 0
  const allSorted = oMappings.length === sortedCount
  const isAnyUpdatedButUnsaved = Boolean(find(oMappings, mapping => mapping._sort_weight !== mapping._initial_assigned_sort_weight))
  const isSortable = Boolean(canSort && onSortEnd) && oMappings.length > 1
  const sortTooltip = allSorted ?
                    t('mapping.custom_sorting_applied') :
                    (sortedCount ? t('mapping.custom_sorting_applied_partial', {total: sortedCount}) : '')

  const getBadgeProps = (mapping, index) => {
    const isUpdated = mapping._sort_weight !== mapping._initial_assigned_sort_weight
    const props = {anchorOrigin: {horizontal: 'left', vertical: 'top'}}
    if(!isUpdated)
      return props
    if(index < mapping._original_position)
      return {...props, badgeContent: <UpIcon style={{fontSize: '10px'}} color='success' />, style: {background: 'transparent'}}
    if(index > mapping._original_position)
      return {...props, badgeContent: <DownIcon style={{fontSize: '10px'}} color='error' />, style: {background: 'transparent'}}
    return props
  }

  const assignSortWeight = mapping => {
    const maxSortWeight = maxBy(oMappings, 'sort_weight')?.sort_weight
    onAssignSortWeight(mapping, isNumber(maxSortWeight) ? maxSortWeight + 1 : 1)
  }

  return (
    <TableRow id={mapType}>
      <TableCell colSpan={4} sx={{padding: 0}}>
        <DragDropContext onDragEnd={onDragEnd} onDragStart={() => toggleSiblings(true)}>
          <Droppable droppableId={`droppable-${mapType}`}>
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {
                  map(oMappings, (mapping, index) => {
                    const targetURL = get(mapping, 'cascade_target_concept_url')
                    const isUpdated = mapping._sort_weight !== mapping._initial_assigned_sort_weight
                    const isLast = index === oMappings.length - 1
                    const cellSx = {
                      borderBottom: isLast ? 'none' : '1px solid rgba(224, 224, 224, 1)',
                      backgroundColor: isUpdated ? 'rgba(51, 115, 170, 0.2)' : undefined
                    }
                    return (
                      <Draggable key={mapping.url} draggableId={mapping.url} index={index} isDragDisabled={!isSortable}>
                        {draggable => (
                          <Table
                            size='small'
                            sx={{width: '100%', tableLayout: 'fixed'}}
                            ref={draggable.innerRef}
                            {...draggable.draggableProps}
                          >
                            <colgroup>
                              {map(CELL_WIDTHS, (width, idx) => <col key={idx} style={{width: width}} />)}
                            </colgroup>
                            <TableBody>
                              <TableRow
                                hover
                                sx={{cursor: targetURL ? 'pointer' : 'default'}}
                                onClick={() => { if(targetURL) window.location.hash = targetURL }}
                              >
                                <TableCell align='left' sx={{...cellSx, verticalAlign: 'top', paddingLeft: '8px'}}>
                                  {
                                    index === 0 &&
                                      <span style={{display: 'flex', alignItems: 'center', gap: '2px'}}>
                                        <Tooltip placement='left' title={isIndirect ? t('mapping.inverse_mappings') : (isSelf ? t('mapping.self_mappings') : t('mapping.direct_mappings'))}>
                                          <Chip
                                            size='small'
                                            variant='outlined'
                                            color='default'
                                            label={
                                              <span>
                                                <span>{mapType}</span>
                                                {isIndirect && <sup>-1</sup>}
                                                {isSelf && <sup>∞</sup>}
                                              </span>
                                            }
                                            sx={{
                                              border: 'none',
                                              height: 'auto',
                                              minHeight: '24px',
                                              maxWidth: '100%',
                                              '.MuiChip-label': {whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', padding: '2px 8px'}
                                            }}
                                          />
                                        </Tooltip>
                                        {
                                          Boolean(sortTooltip) &&
                                            <Tooltip title={sortTooltip}>
                                              <Badge color='warning' badgeContent={allSorted ? undefined : sortedCount} sx={{flexShrink: 0}}>
                                                <SortIcon fontSize='small' sx={{color: 'rgba(0, 0, 0, 0.54)'}} />
                                              </Badge>
                                            </Tooltip>
                                        }
                                      </span>
                                  }
                                </TableCell>
                                <AssociationMappingCells
                                  mapping={mapping}
                                  isIndirect={isIndirect}
                                  cellSx={cellSx}
                                  prefix={
                                    <React.Fragment>
                                      {
                                        isSortable &&
                                          <span style={{display: 'flex', marginRight: '4px'}} {...draggable.dragHandleProps}>
                                            <Badge {...getBadgeProps(mapping, index)}>
                                              <DragIcon fontSize='small' sx={{color: 'rgba(0, 0, 0, 0.54)'}} />
                                            </Badge>
                                          </span>
                                      }
                                      {
                                        Boolean(isSortable && !isNumber(mapping.sort_weight) && !isUpdated && sortedCount) &&
                                          <Tooltip title={t('mapping.no_sort_weight')}>
                                            <WarningIcon fontSize='small' sx={{marginRight: '4px'}} />
                                          </Tooltip>
                                      }
                                    </React.Fragment>
                                  }
                                  suffix={
                                    (canAct || isSortable || !isIndirect) &&
                                      <AssociationRowOptions
                                        mapping={mapping}
                                        concept={concept}
                                        isIndirect={isIndirect}
                                        canAct={canAct}
                                        canSort={isSortable && Boolean(onAssignSortWeight)}
                                        disabled={isAnyUpdatedButUnsaved}
                                        onAddNewClick={onAddNewClick}
                                        onAssignSortWeight={assignSortWeight}
                                        onClearSortWeight={onClearSortWeight}
                                        onRetireClick={onRetireMapping ? mapping => onRetireMapping(mapping, !isIndirect) : undefined}
                                      />
                                  }
                                />
                              </TableRow>
                            </TableBody>
                          </Table>
                        )}
                      </Draggable>
                    )
                  })
                }
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </TableCell>
    </TableRow>
  )
}

export default SortableAssociationRow;
