import React from 'react';
import { useTranslation } from 'react-i18next';
import has from 'lodash/has';
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIconButton from '../common/CloseIconButton';
import { toOwnerURI, currentUserHasAccess } from '../../common/utils';
import Breadcrumbs from '../common/Breadcrumbs'
import { BLACK, SECONDARY_COLORS } from '../../common/colors'
import ConceptManagementList from './ConceptManagementList'
import ExternalIdLabel from '../common/ExternalIdLabel';

const PropertyChip = ({name, property, sx}) => {
  const label = (
    <span style={{display: 'flex', alignItems: 'center'}}>
      <span style={{display: 'flex', alignItems: 'center'}}>
        {name}:
    </span>
      <span style={{fontWeight: 'bold', display: 'flex', alignItems: 'center', color: SECONDARY_COLORS.main, marginLeft: '4px'}}>
        {property}
      </span>
    </span>
  )
  return (
    <Chip label={label} variant='outlined' sx={{color: 'surface.contrastText', borderRadius: '8px', ...sx}} />
  )
}

const ConceptHeader = ({concept, repo, onClose, repoURL, onEdit, nested}) => {
  const { t } = useTranslation()
  const [menu, setMenu] = React.useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(false)
  const onMenuOpen = event => {
    setMenuAnchorEl(event.currentTarget)
    setMenu(true)
  }
  const onMenuClose = () => {
    setMenuAnchorEl(false)
    setMenu(false)
  }

  const onManageOptionClick = option => {
    onMenuClose()
    if(option === 'editConcept') {
      onEdit()
    }
  }

  return (
    <React.Fragment>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{width: 'calc(100% - 40px)'}}>
          <Breadcrumbs
            ownerURL={repoURL ? toOwnerURI(repoURL) : false}
            owner={concept.owner}
            ownerType={concept.owner_type}
            repo={concept.source}
            repoVersion={concept.latest_source_version}
            repoType='Source Version'
            version={concept.version}
            repoURL={repoURL}
            concept={concept}
            nested={nested}
          />
        </span>
        <span>
          <CloseIconButton color='secondary' onClick={onClose} />
        </span>
      </div>
      <div className='col-xs-12' style={{padding: '8px 0 16px 0'}}>
        <Typography sx={{fontSize: '22px', color: BLACK}} className='searchable'>{concept.display_name}</Typography>
      </div>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <PropertyChip name={t('concept.concept_class')} property={concept.concept_class} sx={{marginRight: '8px'}} />
          <PropertyChip name={t('concept.datatype')} property={concept.datatype} />
          {
            concept.external_id &&
              <ExternalIdLabel value={concept.external_id} style={{marginLeft: '8px'}} />
          }
        </span>
        {
          currentUserHasAccess() && repo?.version === 'HEAD' && has(repo, 'source_type') &&
            <span>
              <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}} onClick={onMenuOpen} id='concept-actions'>
                {t('common.actions')}
              </Button>
              <ConceptManagementList anchorEl={menuAnchorEl} open={menu} onClose={onMenuClose} id='concept-actions' onClick={onManageOptionClick} />
            </span>
        }
      </div>
    </React.Fragment>
  )
}

export default ConceptHeader;
