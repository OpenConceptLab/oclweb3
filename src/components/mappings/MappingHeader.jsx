import React from 'react';
import has from 'lodash/has'
import { useTranslation } from 'react-i18next';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import RepeatIcon from '@mui/icons-material/Repeat';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import CloseIconButton from '../common/CloseIconButton';
import { toOwnerURI, toFullURL, currentUserHasAccess, latestResolvedRepoVersion } from '../../common/utils';
import Breadcrumbs from '../common/Breadcrumbs'
import MappingManagementList from './MappingManagementList'

const MappingHeader = ({mapping, onClose, repoURL, nested, onEdit, onRetire, onCreateSimilar, repo, isInCollection, detailsLoaded}) => {
  const { t } = useTranslation()
  const [menu, setMenu] = React.useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(false)
  const getRepoVersion = () => {
    if(!isInCollection)
      return mapping.latest_source_version
    if(!detailsLoaded)
      return (
        <Fade in style={{transitionDelay: '500ms'}}>
          <Skeleton variant='text' sx={{width: '100px'}} />
        </Fade>
      )
    const version = latestResolvedRepoVersion(mapping)?.version
    return version === 'HEAD' ? undefined : version
  }
  const mappingSourceURL = (repoURL && mapping?.id) ? `${repoURL}mappings/${encodeURIComponent(mapping.id)}/` : mapping?.url

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
            repoVersion={getRepoVersion()}
            repoType={mapping.source?.type}
            version={mapping.version}
            repoURL={repoURL}
            mapping={mapping}
            nested={nested && !isInCollection}
            trailing={nested && isInCollection && mappingSourceURL && (
              <Tooltip title={t('mapping.view_in_source')}>
                <IconButton
                  size='small'
                  color='primary'
                  disabled={!detailsLoaded}
                  href={detailsLoaded ? `#${mappingSourceURL}` : undefined}
                  target='_blank'
                  rel='noopener noreferrer'
                  onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    window.open(toFullURL(mappingSourceURL), '_blank', 'noopener,noreferrer')
                  }}
                >
                  <OpenInNewIcon fontSize='inherit' />
                </IconButton>
              </Tooltip>
            )}
          />
        </span>
        <span>
          <CloseIconButton color='secondary' onClick={onClose} />
        </span>
      </div>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          {currentUserHasAccess() && has(repo, 'source_type') && (
            <Button
              startIcon={<RepeatIcon fontSize='inherit' />}
              variant='text'
              size='small'
              color='primary'
              sx={{textTransform: 'none'}}
              onClick={onCreateSimilar}
            >
              {t('repo.create_similar')}
            </Button>
          )}
        </span>
        {currentUserHasAccess() && repo?.version === 'HEAD' && has(repo, 'source_type') && (
          <span>
            <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}} onClick={onMenuOpen} id='mapping-actions'>
              {t('common.actions')}
            </Button>
            <MappingManagementList anchorEl={menuAnchorEl} open={menu} onClose={onMenuClose} id='mapping-actions' onClick={onManageOptionClick} mapping={mapping} />
          </span>
        )}
      </div>
    </React.Fragment>
  )
}

export default MappingHeader;
