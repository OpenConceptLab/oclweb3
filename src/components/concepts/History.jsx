import React from 'react'
import { useHistory } from 'react-router-dom';
import moment from 'moment'
import Skeleton from '@mui/material/Skeleton';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CopyIcon from '@mui/icons-material/ContentCopy';

import compact from 'lodash/compact'
import map from 'lodash/map'

import { copyURL } from '../../common/utils';
import UserChip from '../users/UserChip'
import RepoChip from '../repos/RepoChip'

const History = ({ versions, loading, icon, resource }) => {
  const history = useHistory()
  const getRepoDetails = uri => {
    const parts = compact(uri.split('/'))
    return {
      ownerType: parts[0],
      owner: parts[1],
      type: parts[2] === 'sources' ? 'Source Version' : (parts[2] === 'collections' ? 'Collection Version' : parts[2]),
      id: parts[3],
      version: parts[4],
      uri: uri,
      version_url: uri
    }
  }
  return (
    <Timeline
      sx={{
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {
        loading ?
          <>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot sx={{border: 0, padding: 0, background: 'none', boxShadow: 'none'}}>
                  <Skeleton variant="circular" width={20} height={20} />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Skeleton variant='text' sx={{marginTop: '-20px', height: '100px'}} />
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot sx={{border: 0, padding: 0, background: 'none', boxShadow: 'none'}}>
                  <Skeleton variant="circular" width={20} height={20} />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Skeleton variant='text' sx={{marginTop: '-20px', height: '100px'}} />
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot sx={{border: 0, padding: 0, background: 'none', boxShadow: 'none'}}>
                  <Skeleton variant="circular" width={20} height={20} />
                </TimelineDot>
              </TimelineSeparator>
              <TimelineContent>
                <Skeleton variant='text' sx={{marginTop: '-20px', height: '100px'}} />
              </TimelineContent>
            </TimelineItem>
          </> :
        <>
          {
            map(versions, (version, index) => {
              const primaryRepo = getRepoDetails(version.url)
              const url = version.source_versions?.length > 0 ? version.source_versions[0] + resource + '/' + version.id + '/' : `${version.owner_url}sources/${primaryRepo.id}/HEAD/concepts/${version.id}/`
              return (
                <TimelineItem key={version.version_url}>
                  <TimelineSeparator>
                    <TimelineDot variant='outlined' color='primary' sx={{cursor: 'pointer', padding: 0, border: 0}}>
                      <Button variant='text' color='primary' href={`#${url}`} sx={{margin: 0, padding: 0, fontSize: '12px', textTransform: 'none', minWidth: 'auto'}}>
                        {icon}
                      </Button>
                    </TimelineDot>
                    {
                      index !== (versions.length - 1) &&
                        <TimelineConnector />
                    }
                  </TimelineSeparator>
                  <TimelineContent>
                    <Card variant="outlined" sx={{cursor: 'pointer'}} onClick={event => {event.preventDefault(); event.stopPropagation(); history.push(url); return false;}}>
                      <CardContent sx={{padding: '4px 12px !important'}}>
                        <div className='col-xs-12 padding-0' style={{display: 'flex'}}>
                          <div className='col-xs-8 padding-left-0'>
                            {
                              version.update_comment &&
                                <Button variant='text' color='primary' href={`#${version.version_url}`} sx={{margin: 0, padding: 0, fontSize: '12px', textTransform: 'none', minWidth: 'auto'}}>
                                  <Typography sx={{fontSize: '16px'}} component="div">
                                    {version.update_comment}
                                  </Typography>
                                </Button>
                            }
                            <Typography sx={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center' }} color="text.secondary" component='span'>
                <UserChip size='small' hideType user={{username: version.version_updated_by, type: 'User', url: `/users/${version.version_updated_by}`}} sx={{'.MuiChip-label': {padding: 0}, marginRight: '4px', border: 0, padding: 0, minWidth: 'auto', '.MuiAvatar-root': {margin: '0 4px 0 0', width: '16px', height: '16px', background: 'transparent'}}} />
                               updated {moment(version.version_updated_on).fromNow()}
                            </Typography>
                            {
                              version.source_versions?.length > 0 ?
                                <div className='col-xs-12 padding-0'>
                                  <Typography sx={{ fontSize: '12px' }} color="text.secondary" component='span'>
                                    Source Versions:
                                  </Typography>
                                  {
                                    map(version.source_versions, repoVersion => {
                                      const repo = getRepoDetails(repoVersion)
                                      return (
                                        <RepoChip hideType key={repoVersion} repo={repo} size='small' sx={{padding: '4px', '.MuiChip-label': {padding: '0 2px 0 0'}, margin: '2px 0'}} />
                                      )
                                    })
                                  }
                                </div> : null
                            }
                            {
                              version.collection_versions?.length > 0 ?
                                <div className='col-xs-12 padding-0'>
                                  <Typography sx={{ fontSize: '12px' }} color="text.secondary" component='span'>
                                    Collection Versions:
                                  </Typography>
                                  {
                                    map(version.collection_versions, repoVersion => {
                                      const repo = getRepoDetails(repoVersion)
                                      return (
                                        <RepoChip hideType key={repoVersion} repo={repo} size='small' sx={{padding: '4px', '.MuiChip-label': {padding: '0 2px 0 0'}, margin: '2px 0'}} />
                                      )
                                    })
                                  }
                                </div> : null
                            }
                          </div>
                          <div className='col-xs-4 padding-0' style={{textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                            <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                              <Tooltip title='Standard Checksum' placement='left'>
                                  <Typography sx={{ fontSize: '12px' }} color="text.secondary">
                                    {version.checksums?.standard?.slice(0, 8)}
                                  </Typography>
                              </Tooltip>
                              <IconButton size='small' onClick={() => copyURL(version.checksums?.standard)}>
                                <CopyIcon sx={{fontSize: '16px'}} />
                              </IconButton>
                            </div>
                            <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                              <Tooltip title='Smart Checksum' placement='left'>
                              <Typography sx={{ fontSize: '12px' }} color="text.secondary">
                                {version.checksums?.smart?.slice(0, 8)}
                              </Typography>
                                </Tooltip>
                              <IconButton size='small' onClick={() => copyURL(version.checksums?.smart)}>
                                <CopyIcon sx={{fontSize: '16px'}} />
                              </IconButton>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              )
            })
          }
        </>
      }
    </Timeline>
  )
}

export default History
