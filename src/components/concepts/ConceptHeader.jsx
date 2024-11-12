import React from 'react';
import { useTranslation } from 'react-i18next';
import has from 'lodash/has';
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIconButton from '../common/CloseIconButton';
import { toOwnerURI, currentUserHasAccess } from '../../common/utils';
import Breadcrumbs from '../common/Breadcrumbs'
import { BLACK } from '../../common/colors'
import ConceptManagementList from './ConceptManagementList'

const ConceptHeader = ({concept, repo, onClose, repoURL, onEdit, nested, loading}) => {
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
          {
            loading ?
              <Skeleton variant='text' sx={{fontSize: '22px', width: '50px'}} />:
            <Breadcrumbs
              ownerURL={repoURL ? toOwnerURI(repoURL) : false}
              owner={concept.owner}
              ownerType={concept.owner_type}
              repo={concept.source}
              repoVersion={concept.latest_source_version}
              repoType={concept.source?.type}
              version={concept.version}
              repoURL={repoURL}
              concept={concept}
              nested={nested}
            />
          }
        </span>
        <span>
          <CloseIconButton color='secondary' onClick={onClose} />
        </span>
      </div>
    <div className='col-xs-12' style={{padding: '0px'}}>
    {
      loading ?
        <Skeleton variant='text' sx={{fontSize: '22px', width: '150px'}} />:
      <Typography sx={{fontSize: '22px', color: BLACK}} className='searchable'>
      {concept.display_name}
      </Typography>
    }
    </div>
    {
          currentUserHasAccess() && repo?.version === 'HEAD' && has(repo, 'source_type') && !loading &&
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{display: 'flex', alignItems: 'center'}} />
            <span>
              <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}} onClick={onMenuOpen} id='concept-actions'>
                {t('common.actions')}
              </Button>
              <ConceptManagementList anchorEl={menuAnchorEl} open={menu} onClose={onMenuClose} id='concept-actions' onClick={onManageOptionClick} />
            </span>
      </div>
        }
    </React.Fragment>
  )
}

export default ConceptHeader;
