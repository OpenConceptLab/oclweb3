import React from 'react';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import { has } from 'lodash'
import RepoVersionChip from './RepoVersionChip';
import RepoChip from './RepoChip'
import OwnerChip from '../common/OwnerChip';
import { currentUserHasAccess } from '../../common/utils';
import RepoManagementList from './RepoManagementList';
import FollowActionButton from '../common/FollowActionButton'

const RepoHeader = ({repo, owner, versions, onVersionChange, onCreateConceptClick, onCreateMappingClick, onVersionEditClick, onCreateVersionClick, onDeleteRepoClick, isVersion, onReleaseVersionClick}) => {
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
    if(option === 'addConcept')
      onCreateConceptClick()
    if(option === 'addMapping')
      onCreateMappingClick()
    else if (option === 'createVersion')
      onCreateVersionClick()
    else if (option === 'delete')
      onDeleteRepoClick()
    else if (option === 'editVersion')
      onVersionEditClick()
    else if (option === 'release')
      onReleaseVersionClick()
  }

  const hasAccess = currentUserHasAccess()

  return (
    <Paper component="div" className='col-xs-12' sx={{backgroundColor: 'surface.main', boxShadow: 'none', padding: '16px', borderRadius: '10px 10px 0 0'}}>
      <div className='col-xs-12 padding-0' style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'auto'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <OwnerChip owner={owner} sx={{background: 'transparent', borderColor: 'surface.light'}} hideType />
          <RepoChip repo={{...repo, type: repo?.type?.replace(' Version', '')}} sx={{marginLeft: '12px', background: 'transparent', borderColor: 'surface.light'}} onChange={onVersionChange}  />
          {
            onVersionChange &&
              <RepoVersionChip checkbox version={repo} versions={versions} sx={{marginLeft: '8px', borderRadius: '4px'}} onChange={onVersionChange} />
          }
        </span>
        <span style={{display: 'flex', alignItems: 'center', marginLeft: '16px'}}>
          <FollowActionButton iconButton entity={repo} />
          {
            Boolean(hasAccess && (has(repo, 'source_type') || has(repo, 'collection_type'))) &&
              <React.Fragment>
                <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}} onClick={onMenuOpen} id='repo-manage'>
                  {t('repo.manage')}
                </Button>
                <RepoManagementList isVersion={isVersion} anchorEl={menuAnchorEl} open={menu} onClose={onMenuClose} id='repo-manage' onClick={onManageOptionClick} repo={repo} />
              </React.Fragment>
          }
        </span>
      </div>
      <div className='col-xs-12 padding-0' style={{margin: '8px 0 -8px 0'}}>
        <Typography component='span' sx={{fontSize: '28px', color: 'surface.dark', fontWeight: 600}}>{repo.name}</Typography>
        {
          repo?.canonical_url &&
            <Typography component='span' sx={{marginLeft: '8px', fontSize: '14px', color: 'secondary.main'}}>{repo.canonical_url}</Typography>
        }
      </div>
    </Paper>
  )
}

export default RepoHeader;
