import React from 'react';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import RepoVersionChip from './RepoVersionChip';
import RepoChip from './RepoChip'
import DotSeparator from '../common/DotSeparator';
import OwnerChip from '../common/OwnerChip';
import { PRIMARY_COLORS } from '../../common/colors';
import { formatDate } from '../../common/utils';
import RepoManagementList from './RepoManagementList';
import FollowActionButton from '../common/FollowActionButton'

const RepoHeader = ({repo, owner, versions, onVersionChange, onCreateConceptClick}) => {
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
    if(option === 'addConcept') {
      onCreateConceptClick()
    }
  }

  return (
    <Paper component="div" className='col-xs-12' sx={{backgroundColor: 'surface.main', boxShadow: 'none', padding: '16px', borderRadius: '8px 8px 0 0'}}>
      <div className='col-xs-9 padding-0' style={{display: 'flex'}}>
        <OwnerChip owner={owner} sx={{background: 'transparent', borderColor: 'surface.light'}} hideType />
        <RepoChip repo={repo} sx={{marginLeft: '12px', background: 'transparent', borderColor: 'surface.light'}} onChange={onVersionChange} checkbox version={repo} versions={versions}  />
        {
          onVersionChange &&
            <RepoVersionChip checkbox version={repo} versions={versions} sx={{marginLeft: '8px', borderRadius: '4px'}} onChange={onVersionChange} />
        }
      </div>
      <div className='col-xs-3 padding-0' style={{textAlign: 'right'}}>
        <FollowActionButton iconButton entity={repo} />
        <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}} onClick={onMenuOpen} id='repo-manage'>
          {t('repo.manage')}
        </Button>
        <RepoManagementList anchorEl={menuAnchorEl} open={menu} onClose={onMenuClose} id='repo-manage' onClick={onManageOptionClick} />
      </div>
      <div className='col-xs-12 padding-0' style={{margin: '8px 0'}}>
        <Typography sx={{fontSize: '28px', color: 'surface.dark', fontWeight: 600}}>{repo.name}</Typography>
      </div>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', fontSize: '16px'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <a style={{color: PRIMARY_COLORS.main}} className='no-anchor-styles'>{t('common.view_all_attributes')}</a>
        </span>
        <DotSeparator margin="0 6px" />
        <span style={{display: 'flex', alignItems: 'center', opacity: 0.7}}>
          {t('common.updated_on')} {formatDate(repo.updated_on)}
        </span>
      </div>
    </Paper>
  )
}

export default RepoHeader;
