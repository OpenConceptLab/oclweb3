import React from 'react';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import RepoIcon from '../repos/RepoIcon';
import OwnerIcon from '../common/OwnerIcon';
import { COLORS } from '../../common/colors';
import { formatDateTime } from '../../common/utils';
import DotSeparator from '../common/DotSeparator'
import ConceptIcon from './ConceptIcon';
import PropertyChip from '../common/PropertyChip';
import Retired from '../common/Retired';
import RepoVersionLabel from '../repos/RepoVersionLabel'


const ConceptCard = ({ concept, onSelect, isSelected, onCardClick, bgColor, isShown, firstChild, isSplitView }) => {
  const id = concept.version_url || concept.url || concept.id
  const isChecked = isSelected(id)
  const isSelectedToShow = isShown(id)
  const border = (isChecked || isSelectedToShow) ? `1px solid ${COLORS.primary.main}` : '0.3px solid rgba(0, 0, 0, 0.12)'
  return (
    <Card variant='outlined' className={'col-xs-12' + (isSelectedToShow ? ' show-item' : '')} sx={{padding: '16px', border: border, borderRadius: '10px', display: 'flex', alignItems: 'center', margin: firstChild ? '0 0 4px 0' : '4px 0', cursor: 'pointer', backgroundColor: isSelectedToShow ? COLORS.primary.contrastText : bgColor}} onClick={event => onCardClick(event, id)}>
      <div className='col-xs-1 padding-0' style={{maxWidth: '24px'}}>
        <Checkbox
          color="primary"
          checked={isChecked}
          style={{padding: 0}}
          onClick={event => onSelect(event, id)}
        />
      </div>
      <div className='col-xs-11' style={{width: 'calc(100% - 24px)'}}>
        <div className='col-xs-12' style={{display: 'flex', alignItems: 'center'}}>
          <span className='searchable' style={{color: COLORS.surface.contrastText, fontSize: '16px'}}>
            {concept.retired && <Retired style={{marginRight: '8px'}}/>} {concept.display_name}
          </span>
          <span className='searchable' style={{display: 'flex', marginLeft: '16px'}}>
            <PropertyChip label={concept.concept_class} color='surface.dark' />
          </span>
        </div>
        <div className='col-xs-12' style={{marginTop: '16px', display: 'flex', alignItems: 'center'}}>
          <div className={(isSplitView ? 'col-xs-12' : 'col-xs-6') + ' padding-0'} style={{display: 'flex', alignItems: 'center'}}>
            <span style={{display: 'flex', alignItems: 'center', fontSize: '14px', color: COLORS.secondary['40']}}>
              <OwnerIcon fontSize='inherit' style={{marginRight: '8px'}} ownerType={concept.owner_type} /> {concept.owner}
            </span>
            <DotSeparator />
            <span style={{display: 'flex', alignItems: 'center', fontSize: '14px', color: COLORS.secondary['40']}}>
              <RepoIcon fontSize='inherit' style={{marginRight: '8px'}} />
              <RepoVersionLabel repo={concept.source} version={concept.latest_source_version}/>
            </span>
            <DotSeparator />
            <span className='searchable' style={{display: 'flex', alignItems: 'center', fontSize: '14px', color: COLORS.secondary['40']}}>
              <ConceptIcon fontSize='inherit' style={{marginRight: '8px'}} selected color='secondary' /> {concept.id}
            </span>
          </div>
          {
            !isSplitView &&
              <div className='col-xs-6 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'right'}}>
                <span style={{display: 'flex', alignItems: 'center', fontSize: '14px', color: COLORS.secondary['40']}}>
                  Data type: {concept.datatype}
                </span>
                <DotSeparator />
                <span style={{display: 'flex', alignItems: 'center', fontSize: '14px', color: COLORS.secondary['40']}}>
                  Updated By: {concept.version_updated_by}
                </span>
                <DotSeparator />
                <span style={{display: 'flex', alignItems: 'center', fontSize: '14px', color: COLORS.secondary['40']}}>
                  Updated On: {formatDateTime(concept.version_updated_on)}
                </span>
              </div>
          }
        </div>
      </div>
    </Card>
  )
}

export default ConceptCard;
