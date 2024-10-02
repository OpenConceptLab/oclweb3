import React from 'react'
import { useHistory } from 'react-router-dom';
import RepoIcon from '@mui/icons-material/FolderOutlined';
import HTMLTooltip from '../common/HTMLTooltip'
import FollowActionButton from '../common/FollowActionButton'
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import OwnerButton from '../common/OwnerButton'
import RepoVersionButton from './RepoVersionButton'
import { URIToOwnerParams, dropVersion } from '../../common/utils'
import DotSeparator from '../common/DotSeparator'

const TooltipTitle = ({ repo }) => {
  const history = useHistory()
  const url = repo?.version_url || repo?.url
  const owner = URIToOwnerParams(url)
  const repoId = repo?.short_code || repo?.id
  return (
    <React.Fragment>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-8px'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <OwnerButton
            ownerType={owner.ownerType}
            owner={owner.owner}
            ownerURL={owner.uri}
            sx={{
              '.MuiSvgIcon-root': {
                width: '15px',
                height: '15px'
              }
            }}
          />
          <DotSeparator margin='0 8px' />
          <RepoVersionButton
            icon={<RepoIcon sx={{width: '15px', height: '15px'}} />}
            repo={repoId}
            href={dropVersion(url)}
            size='small'
          />
          <DotSeparator margin='0 8px' />
          <RepoVersionButton
            icon={<VersionIcon sx={{width: '15px', height: '15px'}} />}
            repo={repo?.version || repo?.id}
            href={url}
            size='small'
          />
          </span>
        <FollowActionButton iconButton entity={repo} sx={{mr: 0, ml: 1.5}} size='small' />
      </div>
      <div style={{width: '100%', fontSize: '14px', marginTop: '6px'}}>
        <span style={{color: '#000', cursor: 'pointer'}} onClick={() => history.push(url)}>
          <b>{repo.name}</b>
        </span>
      </div>
      {
        Boolean(repo?.description) &&
          <div style={{width: '100%', fontSize: '12px', marginTop: '4px'}} className='ellipsis-text-3'>
            {repo.description}
          </div>
      }
    </React.Fragment>
  )
}

const RepoTooltip = ({ repo, children }) => {
  return (
    <HTMLTooltip
      title={
        <React.Fragment>
          <TooltipTitle repo={repo} />
        </React.Fragment>
      }
    >
      <span>
        {children}
      </span>
    </HTMLTooltip>

  )
}

export default RepoTooltip;
