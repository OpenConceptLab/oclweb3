import React from 'react';
import has from 'lodash/has'
import { useTranslation } from 'react-i18next';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import Button from '@mui/material/Button';
import CloseIconButton from '../common/CloseIconButton';
import { toOwnerURI, currentUserHasAccess } from '../../common/utils';
import Breadcrumbs from '../common/Breadcrumbs'
import MappingManagementList from './MappingManagementList'

const MappingHeader = ({mapping, onClose, repoURL, nested, onEdit, onRetire, repo}) => {
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
    if(option === 'editMapping') {
      onEdit()
    }
    if(option === 'retireMapping') {
      onRetire()
    }
  }

  return (
    <React.Fragment>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{width: 'calc(100% - 40px)'}}>
          <Breadcrumbs
            ownerURL={repoURL ? toOwnerURI(repoURL) : false}
            owner={mapping.owner}
            ownerType={mapping.owner_type}
            repo={mapping.source}
            repoVersion={mapping.latest_source_version}
            repoType={mapping.source?.type}
            version={mapping.version}
            repoURL={repoURL}
            mapping={mapping}
            nested={nested}
          />
        </span>
        <span>
          <CloseIconButton color='secondary' onClick={onClose} />
        </span>
      </div>
      {
        currentUserHasAccess() && repo?.version === 'HEAD' && has(repo, 'source_type') &&
          <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <span style={{display: 'flex', alignItems: 'center'}} />
            <span>
              <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}} onClick={onMenuOpen} id='mapping-actions'>
                {t('common.actions')}
              </Button>
              <MappingManagementList anchorEl={menuAnchorEl} open={menu} onClose={onMenuClose} id='mapping-actions' onClick={onManageOptionClick} mapping={mapping} />
            </span>
          </div>
      }
    </React.Fragment>
  )
}

export default MappingHeader;
