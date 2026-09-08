import React from 'react';
import { useTranslation } from 'react-i18next';
import TableCell from '@mui/material/TableCell'
import Tooltip from '@mui/material/Tooltip'
import { get, has } from 'lodash';

import { URIToParentParams } from '../../common/utils'
import Retired from '../common/Retired'
import ConceptIcon from '../concepts/ConceptIcon'

const CONCEPT_CODE_ATTR = 'cascade_target_concept_code'
const CONCEPT_NAME_ATTR = 'cascade_target_concept_name'
const SOURCE_ATTR = 'cascade_target_source_name'

const getConceptName = (mapping, attr) => {
  const name = get(mapping, attr) || get(mapping, `${attr}_resolved`)
  if(name) return name
  return get(mapping, `${attr.split('_name')}.0.display_name`)
}

const AssociationMappingCells = ({ mapping, isIndirect, cellSx, prefix, suffix }) => {
  const { t } = useTranslation()
  const isDefinedInOCL = Boolean(mapping?.type === 'Mapping' ? mapping.cascade_target_concept_url : mapping.url)
  const getTitle = () => isDefinedInOCL ?
                       (isIndirect ? t('mapping.from_concept_defined') : t('mapping.to_concept_defined')) :
                       (isIndirect ? t('mapping.from_concept_not_defined') : t('mapping.to_concept_not_defined'))

  return (
    <React.Fragment>
      <TableCell sx={cellSx}>
        <span style={{display: 'flex', alignItems: 'center'}} className='searchable'>
          {prefix}
          <Tooltip title={getTitle()}>
            <span style={{display: 'flex'}}>
              <ConceptIcon selected={isDefinedInOCL} sx={{width: '1rem', height: '1rem', marginRight: '4px'}} />
            </span>
          </Tooltip>
          { has(mapping, CONCEPT_CODE_ATTR) ? mapping[CONCEPT_CODE_ATTR] : mapping?.id }
        </span>
      </TableCell>
      <TableCell sx={cellSx}>
        {mapping?.retired && <Retired size='small' style={{marginRight: '8px'}} />}
        { getConceptName(mapping, CONCEPT_NAME_ATTR) }
      </TableCell>
      <TableCell align='left' sx={cellSx}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <span style={{flexGrow: 1, minWidth: 0}}>
            {has(mapping, SOURCE_ATTR) ? get(mapping, SOURCE_ATTR) : URIToParentParams(mapping.url)?.repo}
          </span>
          {suffix}
        </span>
      </TableCell>
    </React.Fragment>
  )
}

export default AssociationMappingCells;
