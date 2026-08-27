import React from 'react';
import { useTranslation } from 'react-i18next';
import has from 'lodash/has';
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import AddIcon from '@mui/icons-material/PlaylistAddOutlined';
import RepeatIcon from '@mui/icons-material/Repeat';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIconButton from '../common/CloseIconButton';
import { toOwnerURI, toFullURL, currentUserHasAccess } from '../../common/utils';
import Breadcrumbs from '../common/Breadcrumbs'
import { BLACK } from '../../common/colors'
import ConceptManagementList from './ConceptManagementList'
import AddToCollectionDialog from '../common/AddToCollectionDialog'
import Retired from '../common/Retired'

const ConceptHeader = ({concept, repo, onClose, repoURL, onEdit, onRetire, onCreateSimilar, nested, loading, isInCollection}) => {
  const { t } = useTranslation()
  const [menu, setMenu] = React.useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(false)
  const [addToCollectionOpen, setAddToCollectionOpen] = React.useState(false)
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
              repoVersion={concept.latest_source_version}
              repoType={concept.source?.type}
              version={concept.version}
              repoURL={repoURL}
              concept={concept}
              nested={nested}
              trailing={nested && isInCollection && concept?.url && (
                <Button
                  endIcon={<OpenInNewIcon fontSize='inherit' />}
                  variant='text'
                  size='small'
                  color='primary'
                  sx={{textTransform: 'none', whiteSpace: 'nowrap'}}
                  href={`#/${concept.url}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    window.open(toFullURL(concept.url), '_blank', 'noopener,noreferrer')
                  }}
                >
                  {t('common.go_to_source')}
                </Button>
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
          {currentUserHasAccess() && (
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
              <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}} onClick={onMenuOpen} id='concept-actions'>
                {t('common.actions')}
              </Button>
              <ConceptManagementList anchorEl={menuAnchorEl} open={menu} onClose={onMenuClose} id='concept-actions' onClick={onManageOptionClick} concept={concept} />
            </span>
          )}
      </div>
        }
      <AddToCollectionDialog
        open={addToCollectionOpen}
        onClose={() => setAddToCollectionOpen(false)}
        concept={concept}
      />
    </React.Fragment>
  )
}

export default ConceptHeader;
