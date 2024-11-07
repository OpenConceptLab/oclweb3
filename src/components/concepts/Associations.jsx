import React from 'react';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableContainer from '@mui/material/TableContainer'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import { get, isEmpty, forEach, map, find, compact, flatten, values } from 'lodash';
import ConceptIcon from './ConceptIcon'
import { generateRandomString, dropVersion } from '../../common/utils'
import TagCountLabel from '../common/TagCountLabel'

const groupMappings = (orderedMappings, concept, mappings, forward) => {
  forEach(mappings, resource => {
    if(!(find(mappings, mapping => dropVersion(mapping.cascade_target_concept_url) === dropVersion(resource.url)))) {
      let mapType = resource.map_type
      const isMapping = Boolean(mapType)
      if(!mapType)
        mapType = forward ? 'children' : 'parent';
      orderedMappings[mapType] = orderedMappings[mapType] || {order: null, direct: [], indirect: [], unknown: [], hierarchy: [], reverseHierarchy: [], self: []}
      const isSelfMapping = isMapping && dropVersion(concept.url) === dropVersion(resource.cascade_target_concept_url)
      let _resource = isMapping ? {...resource, isSelf: isSelfMapping, cascade_target_concept_name: resource.cascade_target_concept_name || get(find(mappings, m => dropVersion(m.url) === dropVersion(resource.cascade_target_concept_url)), 'display_name')} : {...resource, cascade_target_concept_name: resource.display_name}
      if(isSelfMapping) {
        if(!map(orderedMappings[mapType].self, 'id').includes(resource.id))
          orderedMappings[mapType].self.push(_resource)
      } else {
        if(isMapping)
          forward ? orderedMappings[mapType].direct.push(_resource) : orderedMappings[mapType].indirect.push(_resource)
        else
          forward ? orderedMappings[mapType].hierarchy.push(_resource) : orderedMappings[mapType].reverseHierarchy.push(_resource)
      }
    }
  })
}


const MappingCells = ({mapping, isIndirect}) => {
  const { t } = useTranslation()
  const conceptCodeAttr = 'cascade_target_concept_code'
  const conceptCodeName = 'cascade_target_concept_name'
  const sourceAttr = 'cascade_target_source_name';
  const getConceptName = (mapping, attr) => {
    let name = get(mapping, attr) || get(mapping, `${attr}_resolved`);
    if(name) return name;
    return get(mapping, `${attr.split('_name')}.0.display_name`)
  }
  const isDefinedInOCL = Boolean(mapping.cascade_target_concept_url)
  const getTitle = () => {
    return isDefinedInOCL ?
      (isIndirect ? t('mapping.from_concept_defined') : t('mapping.to_concept_defined')) :
      (isIndirect ? t('mapping.from_concept_not_defined') : t('mapping.to_concept_not_defined'))
  }

  return (
    <React.Fragment>
      <TableCell>
        <span style={{display: 'flex'}}>
          <Tooltip title={getTitle()}>
            <span>
              <ConceptIcon selected={isDefinedInOCL} sx={{width: '10px', height: '10px', marginRight: '12px'}} />
            </span>
          </Tooltip>
          { mapping[conceptCodeAttr] }
        </span>
      </TableCell>
      <TableCell>
        { getConceptName(mapping, conceptCodeName) }
      </TableCell>
      <TableCell align='left'>
        {get(mapping, sourceAttr)}
      </TableCell>
    </React.Fragment>
  )
}


const AssociationRow = ({mappings, id, mapType, isSelf, isIndirect}) => {
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <TableRow id={id || mapType}>
        <TableCell className='sticky-col' rowSpan={mappings?.length} align='left' sx={{verticalAlign: 'top', width: '10%', paddingLeft: '8px', top: '37px', zIndex: 1}}>
          <span className='flex-vertical-center'>
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
                style={{border: 'none'}}
              />
            </Tooltip>
          </span>
        </TableCell>
        {
          !isEmpty(get(mappings, 0)) &&
            <MappingCells mapping={get(mappings, 0)} isIndirect={isIndirect} />
        }
      </TableRow>
      {
        map(mappings?.slice(1), (mapping, index) => {
          return (!mapping || isEmpty(mapping)) ? null : (
            <TableRow key={index}>
              <MappingCells mapping={mapping} isIndirect={isIndirect} />
            </TableRow>
          )
        })
      }
    </React.Fragment>
  )
}


const borderColor = 'rgba(0, 0, 0, 0.12)'
const Associations = ({concept, mappings, reverseMappings}) => {
  const [orderedMappings, setOrderedMappings] = React.useState({});
  const { t } = useTranslation()
  const getMappings = () => {
    let _mappings = {}
    groupMappings(_mappings, concept, mappings, true)
    groupMappings(_mappings, concept, reverseMappings, false)
    return _mappings
  }

  const count = flatten(compact(flatten(map(values(orderedMappings), mapping => values(mapping))))).length

  React.useEffect(() => setOrderedMappings(getMappings()), [mappings, reverseMappings])

  return (
    <Paper className='col-xs-12 padding-0' sx={{boxShadow: 'none', border: '1px solid', borderColor: borderColor, borderRadius: '10px'}}>
      <Typography component="span" sx={{borderBottom: count > 0 ? '1px solid' : '0', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between'}}>
        <TagCountLabel label={t('concept.associations')} count={count}/>
      </Typography>
      {
        count > 0 &&
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{width: '10%', zIndex: 3}} className='sticky-col'><b>{t('mapping.relationship')}</b></TableCell>
                  <TableCell sx={{width: '20%'}}><b>{t('mapping.code')}</b></TableCell>
                  <TableCell sx={{width: '40%'}}><b>{t('common.name')}</b></TableCell>
                  <TableCell sx={{width: '20%'}}><b>{t('repo.source')}</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ '.MuiTableRow-root': {'&:last-child td': {border: 0, borderRadius: '10px'}} }}>
                {
                  map(orderedMappings, (oMappings, mapType) => {
                    const key = generateRandomString()
                    const hasSelfMappings = !isEmpty(oMappings.self)
                    return hasSelfMappings &&
                      <React.Fragment key={key}>
                        <AssociationRow
                          key={mapType}
                          mapType='SAME-AS'
                          mappings={oMappings.self}
                          isSelf
                        />
                      </React.Fragment>
                  })
                }
                {
                  !isEmpty(orderedMappings?.children?.hierarchy) &&
                    <AssociationRow
                      mappings={orderedMappings?.children?.hierarchy}
                      id='has-child'
                      mapType='Has child'
                      isHierarchy
                    />
                }
                {
                  !isEmpty(orderedMappings?.parent?.reverseHierarchy) &&
                    <AssociationRow
                      mappings={orderedMappings?.parent?.reverseHierarchy}
                      id='has-parent'
                      mapType='Has parent'
                      isHierarchy
                      isIndirect
                    />
                }
                {
                  map(orderedMappings, (oMappings, mapType) => {
                    const key = generateRandomString()
                    const hasDirectMappings = !isEmpty(oMappings.direct)
                    return (
                      <React.Fragment key={key}>
                        {
                          hasDirectMappings &&
                            <AssociationRow
                              key={mapType}
                              mapType={mapType}
                              mappings={oMappings.direct}
                            />
                        }
                      </React.Fragment>
                    )
                  })
                }
                {
                  map(orderedMappings, (oMappings, mapType) => {
                    const key = generateRandomString()
                    const hasMappings = !isEmpty(oMappings.indirect)
                    return (
                      <React.Fragment key={key}>
                        {
                          hasMappings &&
                            <AssociationRow
                              key={mapType}
                              mappings={oMappings.indirect}
                              mapType={mapType}
                              isIndirect
                            />
                        }
                      </React.Fragment>
                    )
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
      }
    </Paper>
  )
}

export default Associations;
