import React from 'react';
import { useTranslation } from 'react-i18next';
import has from 'lodash/has';
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import AddIcon from '@mui/icons-material/PlaylistAddOutlined';
import RepeatIcon from '@mui/icons-material/Repeat';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIconButton from '../common/CloseIconButton';
import { toOwnerURI, toFullURL, currentUserHasAccess, isLoggedIn, sourceVersionOf } from '../../common/utils';
import Breadcrumbs from '../common/Breadcrumbs'
import { BLACK } from '../../common/colors'
import ConceptManagementList from './ConceptManagementList'
import AddToCollectionDialog from '../common/AddToCollectionDialog'
import CloneToSourceDialog from '../repos/CloneToSourceDialog'
import Retired from '../common/Retired'

const ConceptHeader = ({concept, repo, onClose, repoURL, onEdit, onRetire, onCreateSimilar, nested, loading, isInCollection, detailsLoaded}) => {
  const { t } = useTranslation()
  const [menu, setMenu] = React.useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(false)
  const [addToCollectionOpen, setAddToCollectionOpen] = React.useState(false)
  const [cloneToSourceOpen, setCloneToSourceOpen] = React.useState(false)
  const hasAccess = currentUserHasAccess()
  const isSource = has(repo, 'source_type')
  const canClone = isLoggedIn() && isSource
  const canManage = hasAccess && repo?.version === 'HEAD' && isSource
  const getRepoVersion = () => {
    if(!isInCollection)
      return concept.latest_source_version
    if(!detailsLoaded)
      return (
        <Fade in style={{transitionDelay: '500ms'}}>
          <Skeleton variant='text' sx={{width: '100px'}} />
        </Fade>
      )
    return sourceVersionOf(concept)
  }
  const conceptSourceURL = (repoURL && concept?.id) ? `${repoURL}concepts/${encodeURIComponent(concept.id)}/` : concept?.url

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
    if(option === 'retireConcept') {
      onRetire()
    }
    if(option === 'cloneToSource') {
      setCloneToSourceOpen(true)
    }
  }

  return (
    <React.Fragment>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{width: 'calc(100% - 40px)'}}>
          {
            !concept?.source ?
              <Skeleton variant='text' sx={{fontSize: '22px', width: '50px'}} />:
            <Breadcrumbs
              ownerURL={repoURL ? toOwnerURI(repoURL) : false}
              owner={concept.owner}
              ownerType={concept.owner_type}
              repo={concept.source}
              repoVersion={getRepoVersion()}
              repoType={concept.source?.type}
              version={concept.version}
              repoURL={repoURL}
              concept={concept}
              nested={nested && !isInCollection}
              trailing={nested && isInCollection && conceptSourceURL && (
                <Tooltip title={t('concept.view_in_source')}>
                  <IconButton
                    size='small'
                    color='primary'
                    disabled={!detailsLoaded}
                    href={detailsLoaded ? `#${conceptSourceURL}` : undefined}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      window.open(toFullURL(conceptSourceURL), '_blank', 'noopener,noreferrer')
                    }}
                  >
                    <OpenInNewIcon fontSize='inherit' />
                  </IconButton>
                </Tooltip>
              )}
            />
          }
        </span>
        <span>
          <CloseIconButton color='secondary' onClick={onClose} />
        </span>
      </div>
      <div className='col-xs-12' style={{padding: '0px', display: 'flex', alignItems: 'center'}}>
    {
      !concept?.id ?
        <Skeleton variant='text' sx={{fontSize: '22px', width: '150px'}} />:
      <>
      <Typography sx={{fontSize: '22px', color: BLACK}} className='searchable'>
        {concept.display_name}
      </Typography>
        {
          concept.retired ? <Retired size='small' style={{marginLeft: '12px'}} /> : null
        }
      </>
    }
    </div>
    {
      !loading &&
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          {hasAccess && (
            <Button
              startIcon={<AddIcon fontSize='inherit' />}
              variant='text'
              size='small'
              color='primary'
              sx={{textTransform: 'none'}}
              onClick={() => setAddToCollectionOpen(true)}
            >
              Add to Collection
            </Button>
          )}
          {hasAccess && isSource && (
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
        {(canManage || canClone) && (
            <span>
              <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}} onClick={onMenuOpen} id='concept-actions'>
                {t('common.actions')}
              </Button>
              <ConceptManagementList anchorEl={menuAnchorEl} open={menu} onClose={onMenuClose} id='concept-actions' onClick={onManageOptionClick} concept={concept} hasAccess={canManage} canClone={canClone} />
            </span>
          )}
      </div>
        }
      <AddToCollectionDialog
        open={addToCollectionOpen}
        onClose={() => setAddToCollectionOpen(false)}
        concept={concept}
      />
      <CloneToSourceDialog
        open={cloneToSourceOpen}
        onClose={() => setCloneToSourceOpen(false)}
        concept={concept}
      />
    </React.Fragment>
  )
}

export default ConceptHeader;
