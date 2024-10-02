import React from 'react'
import { useHistory } from 'react-router-dom';
import RepoIcon from '@mui/icons-material/FolderOutlined';
import HTMLTooltip from '../common/HTMLTooltip'
import FollowActionButton from '../common/FollowActionButton'
import OwnerButton from '../common/OwnerButton'
import RepoVersionButton from './RepoVersionButton'
import { URIToOwnerParams } from '../../common/utils'
import DotSeparator from '../common/DotSeparator'

const TooltipTitle = ({ repo }) => {
  // only need --> repo = {url: '/orgs/MyOrg/sources/MySource/', id: 'MyOrg'}
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
              },
              '.MuiButton-startIcon': {
                marginRight: '4px',
                '.span': {
                  display: 'flex',
                  alignItems: 'center',
                }
              },
              '.owner-button-label': {
                maxWidth: '120px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }
            }}
          />
          <DotSeparator margin='0 8px' />
          <RepoVersionButton
            icon={<RepoIcon noTooltip sx={{width: '15px', height: '15px'}} />}
            repo={repoId}
            href={url}
            size='small'
            repoLabelStyle={{
              maxWidth: '120px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              display: 'inline-block'
            }}
          />
        </span>
        <FollowActionButton iconButton entity={repo} sx={{mr: 0, ml: 1.5}} size='small' />
      </div>
      <div style={{width: '100%', fontSize: '14px', marginTop: '6px'}}>
        <span style={{color: '#000', cursor: 'pointer'}} onClick={() => history.push(url)}>
          <b>{repo?.name}</b>
        </span>
      </div>
      {
        Boolean(repo?.description) &&
          <div style={{width: '100%', fontSize: '12px', marginTop: '4px'}} className='ellipsis-text-3'>
            {repo.description}
          </div>
      }
      <div style={{width: '100%', fontSize: '12px', marginTop: '6px', display: 'flex', justifyContent: 'space-between'}}>
        <span />
        {
          (repo?.type === 'Source Version' || repo?.type === 'Collection Version') &&
            <span style={{marginLeft: '8px', cursor: 'pointer'}} onClick={() => history.push(url)}>
              {repo?.version || repo?.id}
            </span>
        }
      </div>
    </React.Fragment>
  )
}

const RepoTooltip = ({ repo, children, spanStyle }) => {
  return (
    <HTMLTooltip
      title={
        <React.Fragment>
          <TooltipTitle repo={repo} />
        </React.Fragment>
      }
    >
      <span style={{display: 'flex', ...spanStyle}}>
        {children}
      </span>
    </HTMLTooltip>

  )
}

export default RepoTooltip;
