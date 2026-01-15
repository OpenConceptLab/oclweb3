import React from 'react'
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
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
import CopyIcon from '@mui/icons-material/ContentCopy';
import { Menu, ListItemButton, ListItemText, ListItemIcon } from '@mui/material'
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import MoreIcon from '@mui/icons-material/MoreVert';

import compact from 'lodash/compact'
import map from 'lodash/map'
import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'

import { copyURL, toFullAPIURL } from '../../common/utils';
import UserChip from '../users/UserChip'
import RepoChip from '../repos/RepoChip'

const VersionMenu = ({version, repoVersion, onClose, anchorEl, resource, icon}) => {
  const url = repoVersion.version_url + resource + '/' + version.id + '/'
  const { t } = useTranslation()
  const onClick = callback => {
    if(callback)
      callback()
    onClose()
  }
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      sx={{'.MuiPaper-root': {backgroundColor: 'surface.n94'}}}
    >
      <ListItemButton id='view_resource_version' href={`#${url}`} sx={{padding: '4px 10px', '&:hover': {color: 'inherit'}, '&:focus': {outline: 'none', textDecoration: 'none', color: 'inherit'}}} onClick={onClick}>
        <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
          {icon}
        </ListItemIcon>
        <ListItemText primary={t('common.view_resource_version')} />
      </ListItemButton>
      <ListItemButton id='copy_api_url' onClick={() => onClick(() => copyURL(toFullAPIURL(url)))} sx={{padding: '4px 10px', '&:hover': {color: 'inherit'}, '&:focus': {outline: 'none', textDecoration: 'none', color: 'inherit'}}}>
        <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
          <CopyIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText primary={t('common.copy_api_url')} />
      </ListItemButton>
      {
        version.checksums?.standard &&
          <ListItemButton id='copy_standard_checksum' onClick={() => onClick(copyURL(version.checksums.standard))} sx={{padding: '4px 10px', '&:hover': {color: 'inherit'}, '&:focus': {outline: 'none', textDecoration: 'none', color: 'inherit'}}}>
            <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
              <CopyIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary={t('common.copy_standard_checksum')} secondary={version.checksums.standard.slice(0, 8)} />
          </ListItemButton>
      }
      {
        version.checksums?.smart &&
          <ListItemButton id='copy_smart_checksum' onClick={() => onClick(copyURL(version.checksums.smart))} sx={{padding: '4px 10px', '&:hover': {color: 'inherit'}, '&:focus': {outline: 'none', textDecoration: 'none', color: 'inherit'}}}>
            <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
              <CopyIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary={t('common.copy_smart_checksum')} secondary={version.checksums.smart.slice(0, 8)} />
          </ListItemButton>
      }
    </Menu>
  )
}


const History = ({ versions, repoVersions, loading, icon, resource }) => {
  const { t } = useTranslation()
  const history = useHistory()

  const [selectedVersion, setSelectedVersion] = React.useState(false)
  const [selectedRepoVersion, setSelectedRepoVersion] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState(false)

  const onMenuClick = (event, version, repoVersion) => {
    event.preventDefault()
    event.stopPropagation()

    setSelectedVersion(version)
    setSelectedRepoVersion(repoVersion)
    setAnchorEl(event.currentTarget)
    return false
  }

  const onMenuClose = () => {
    setAnchorEl(false)
    setSelectedVersion(false)
    setSelectedRepoVersion(false)
  }

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
  const getVersions = () => {
    let result = []
    let traversed = []
    repoVersions.forEach(repoVersion => {
      const versionCreatedAt = moment(repoVersion.created_on || repoVersion.created_at)
      repoVersion.resourceVersions = []
      versions.forEach(version => {
        if(!traversed.includes(version.uuid)) {
          const resourceVersionCreatedAt = moment(version.version_created_on)
          if((version.source_versions.includes(repoVersion.version_url)) || (resourceVersionCreatedAt.isBefore(versionCreatedAt) && !version.source_versions.length)) {
            repoVersion.resourceVersions.push(version)
            traversed.push(version.uuid)
          }
        }
      })
      repoVersion.resourceVersions = sortResourceVersions(repoVersion.resourceVersions)
      result.push(repoVersion)
    })
    const headVersion = result[repoVersions.length - 1]
    if(traversed.length !== versions.length && headVersion?.id) {
      headVersion.resourceVersions = sortResourceVersions([...headVersion.resourceVersions, ...versions.filter(version => !traversed.includes(version.uuid))])
    }
    return compact([headVersion, ...result.filter(version=> version.id !== 'HEAD')])
  }
  const sortResourceVersions = resourceVersions => orderBy(uniqBy(resourceVersions, 'version_url'), version => moment(version.version_created_on), 'desc')
  let mergedVersions = getVersions()


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
            map(mergedVersions, (repoVersion, index) => {
              return (
                <TimelineItem key={repoVersion.version_url}>
                  <TimelineSeparator>
                    <TimelineDot variant='outlined' color='primary' sx={{cursor: 'pointer', padding: 0, border: 0}}>
                      <VersionIcon sx={{fontSize: '14px'}} />
                    </TimelineDot>
                    {
                      index !== (mergedVersions.length - 1) &&
                        <TimelineConnector />
                    }
                  </TimelineSeparator>
                  <TimelineContent sx={{padding: '4px 8px', marginBottom: '12px'}}>
                    <div className='col-xs-12 padding-0'>
                      <div className='col-xs-12 padding-0' style={{marginBottom: '8px'}}>
                        <span style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', fontSize: '12px'}}>
                          {t('repo.repo_version')}
                          <RepoChip hideType key={repoVersion} repo={repoVersion} size='small' sx={{padding: '4px', '.MuiChip-label': {padding: '0 2px 0 0'}, margin: '0 4px'}} />
                          {t('common.created_on').toLowerCase()} {moment(repoVersion.created_on).format('L')}
                        </span>
                      </div>
                      {
                        map(repoVersion.resourceVersions, (version, index) => {
                          const url = repoVersion.version_url + resource + '/' + version.id + '/'
                          const isLastChild = index == (repoVersion.resourceVersions.length - 1)
                          const cardBorderStyle = isLastChild ? {borderTopLeftRadius: 0, borderTopRightRadius: 0} : {borderBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}
                          return (
                            <Card key={version.version_url} variant="outlined" sx={{cursor: 'pointer', display: 'flex', ...cardBorderStyle}} onClick={event => {event.preventDefault(); event.stopPropagation(); history.push(url); return false;}}>
                              <CardContent sx={{display: 'inline-block', width: '100%', padding: '8px 12px !important'}}>
                                <div className='col-xs-12 padding-0' style={{display: 'flex'}}>
                                  <div className='col-xs-10 padding-left-0' style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'}}>
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
                                      {t('common.committed')} {moment(version.version_updated_on).fromNow()}
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
                                  <div className='col-xs-2 padding-0' style={{display: 'flex', alignItems: 'flex-end', flexDirection: 'column', justifyContent: 'center'}}>
                                    <IconButton size='small' onClick={event => onMenuClick(event, version, repoVersion)}><MoreIcon fontSize='inherit' /></IconButton>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })
                      }
                    </div>
                  </TimelineContent>
                </TimelineItem>
              )
            })
          }
        </>
      }
      <VersionMenu version={selectedVersion} anchorEl={anchorEl} onClose={onMenuClose} resource={resource} repoVersion={selectedRepoVersion} icon={icon} />
    </Timeline>
  )
}

export default History
