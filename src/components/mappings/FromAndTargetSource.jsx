import React from 'react';

import Typography from '@mui/material/Typography'
import RightIcon from '@mui/icons-material/ChevronRight';

import get from 'lodash/get'

import { URIToParentParams } from '../../common/utils'
import DotSeparator from '../common/DotSeparator'
import RepoTooltip from '../repos/RepoTooltip'
import RepoIcon from '../repos/RepoIcon'

const SourceIcon = ({ selected }) => {
  return (
    <RepoIcon noTooltip selected={selected} fontSize='small' />
  )
}

const Repo = ({mapping, direction, sx}) => {
  const repoName = get(mapping, `${direction}_source_name`)
  const repoURL = get(mapping, `${direction}_source_url`)
  const repo = URIToParentParams(repoURL)
  const isPresent = Boolean(repoName)
  return (
    <RepoTooltip basicTooltip={!isPresent} repo={{...repo, url: repoURL, id: repo?.repo || repoURL}}>
      <span style={{maxWidth: '175px', textAlign: 'left', ...sx}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'left'}}>
          <SourceIcon selected={isPresent} />
          <Typography className='overflow-ellipsis' component='span' sx={{maxWidth: '150px', fontSize: '14px', color: 'rgba(0, 0, 0, 0.87)', marginLeft: '8px'}}>
            {get(mapping, `${direction}_source_url`) || get(mapping, `${direction}_source_name`)}
          </Typography>
          <span/>
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'left'}}>
          <Typography component='span' sx={{fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px'}}>
            {repo?.repo}
          </Typography>
          <DotSeparator margin='0 6px' />
          <Typography component='span' sx={{fontSize: '12px', color: 'secondary.main'}}>
            {repo?.repoType}
          </Typography>
        </div>
      </span>
    </RepoTooltip>
  )
}

const FromAndTargetSource = ({ mapping }) => {
  return (
    <span style={{display: 'flex', alignItem: 'center'}}>
      <Repo mapping={mapping} direction='from' />
      <RightIcon sx={{margin: '0 8px'}} color='secondary' />
      <Repo mapping={mapping} direction='to' />
    </span>
  )
}

export default FromAndTargetSource
