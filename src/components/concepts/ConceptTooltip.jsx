import React from 'react'
import { useHistory } from 'react-router-dom';
import RepoIcon from '@mui/icons-material/FolderOutlined';
import isNumber from 'lodash/isNumber';
import has from 'lodash/has'
import HTMLTooltip from '../common/HTMLTooltip'
import FollowActionButton from '../common/FollowActionButton'
import OwnerButton from '../common/OwnerButton'
import RepoVersionButton from '../repos/RepoVersionButton'
import APIService from '../../services/APIService'
import DotSeparator from '../common/DotSeparator'
import ConceptIcon from '../concepts/ConceptIcon'
import MappingIcon from '../mappings/MappingIcon'

const TooltipTitle = ({ concept, owner, repo }) => {
  const history = useHistory()
  const url = concept?.version_url || concept?.url
  const [entity, setEntity] = React.useState(concept || {})
  const shouldRefetch = () => Boolean(url && !has(entity, 'concept_class'))
  const fetchEntity = () => {
    if(shouldRefetch())
      APIService.new().overrideURL(url).get().then(response => setEntity(response.data))
    else
      setEntity(concept)
  }

  React.useEffect(() => {
    fetchEntity()
  }, [concept?.version_url || concept?.url])

  return (
    <React.Fragment>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-8px'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <OwnerButton
            ownerType={owner?.type}
            owner={owner?.owner}
            ownerURL={owner?.uri}
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
            repo={repo?.id}
            href={repo?.version_url || repo?.url}
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
        <span style={{display: 'flex', alignItems: 'center'}}>
        {
          isNumber(repo?.summary?.active_concepts) &&
            <span style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}} onClick={() => history.push(url + 'concepts/')}>
              <ConceptIcon fontSize='small' selected color='secondary' sx={{marginRight: '4px', width: '10px', height: '10px'}} />
              {repo.summary.active_concepts.toLocaleString()}
            </span>

        }
        {
          isNumber(repo?.summary?.active_mappings) &&
            <span style={{marginLeft: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center'}} onClick={() => history.push(url + 'mappings/')}>
              <MappingIcon fontSize='small' color='secondary' sx={{marginRight: '4px', width: '15px', height: '15px'}} />
              {repo.summary.active_mappings.toLocaleString()}
            </span>

        }
        </span>
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

const ConceptTooltip = ({ concept, repo, owner, children, spanStyle }) => {
  return (
    <HTMLTooltip
      sx={{
        '.MuiTooltip-tooltip': {
          maxWidth: 400
        }
      }}
      title={
        <React.Fragment>
          <TooltipTitle concept={concept} repo={repo} owner={owner} />
        </React.Fragment>
      }
    >
      <span style={{display: 'flex', ...spanStyle}}>
        {children}
      </span>
    </HTMLTooltip>

  )
}

export default ConceptTooltip;
