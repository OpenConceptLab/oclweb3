import React from 'react'
import { useHistory } from 'react-router-dom';
import RepoIcon from '@mui/icons-material/FolderOutlined';
import isNumber from 'lodash/isNumber';
import has from 'lodash/has'
import HTMLTooltip from '../common/HTMLTooltip'
import FollowActionButton from '../common/FollowActionButton'
import OwnerButton from '../common/OwnerButton'
import RepoVersionButton from './RepoVersionButton'
import { URIToOwnerParams } from '../../common/utils'
import DotSeparator from '../common/DotSeparator'
import ConceptIcon from '../concepts/ConceptIcon'
import MappingIcon from '../mappings/MappingIcon'
import APIService from '../../services/APIService'

const TooltipTitle = ({ repo }) => {
  // only need --> repo = {url: '/orgs/MyOrg/sources/MySource/', id: 'MyOrg'}
  const url = repo?.version_url || repo?.url
  const owner = URIToOwnerParams(url)
  const repoId = repo?.short_code || repo?.id

  const [entity, setEntity] = React.useState(repo || {})
  const shouldRefetch = () => Boolean(url && !has(entity, 'summary'))
  const fetchEntity = () => {
    if(shouldRefetch())
      APIService.new().overrideURL(url).get(null, null, {includeSummary: true}).then(response => setEntity(response.data))
    else
      setEntity(repo)
  }

  React.useEffect(() => {
    fetchEntity()
  }, [repo?.version_url || repo?.url])

  const history = useHistory()

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
            icon={<RepoIcon sx={{width: '15px', height: '15px'}} />}
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
        <FollowActionButton iconButton entity={entity} sx={{mr: 0, ml: 1.5}} size='small' />
      </div>
      <div style={{width: '100%', fontSize: '14px', marginTop: '6px'}}>
        <span style={{color: '#000', cursor: 'pointer'}} onClick={() => history.push(url)}>
          <b>{entity?.name}</b>
        </span>
      </div>
      {
        Boolean(entity?.description) &&
          <div style={{width: '100%', fontSize: '12px', marginTop: '4px'}} className='ellipsis-text-3'>
            {entity.description}
          </div>
      }
      <div style={{width: '100%', fontSize: '12px', marginTop: '6px', display: 'flex', justifyContent: 'space-between'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          {
            isNumber(entity?.summary?.active_concepts) &&
              <span style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}} onClick={() => history.push(url + 'concepts/')}>
                <ConceptIcon fontSize='small' selected color='secondary' sx={{marginRight: '4px', width: '10px', height: '10px'}} />
                {entity.summary.active_concepts.toLocaleString()}
              </span>
          }
          {
            isNumber(repo?.summary?.active_mappings) &&
              <span style={{marginLeft: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center'}} onClick={() => history.push(url + 'mappings/')}>
                <MappingIcon fontSize='small' color='secondary' sx={{marginRight: '4px', width: '15px', height: '15px'}} />
                {entity.summary.active_mappings.toLocaleString()}
              </span>
          }
        </span>
        <span style={{marginLeft: '8px', cursor: 'pointer'}} onClick={() => history.push(url)}>
          {
            (entity?.type === 'Source Version' || entity?.type === 'Collection Version') ?
              (entity?.version || entity?.id):
              'HEAD'
          }
        </span>
      </div>
    </React.Fragment>
  )
}

const RepoTooltip = ({ repo, children, spanStyle }) => {
  return (
    <HTMLTooltip
      sx={{
        '.MuiTooltip-tooltip': {
          maxWidth: 400
        }
      }}
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
