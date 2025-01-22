import React from 'react'
import { useHistory } from 'react-router-dom';
import RepoIcon from '@mui/icons-material/FolderOutlined';
import has from 'lodash/has'

import { URIToOwnerParams } from '../../common/utils'

import HTMLTooltip from '../common/HTMLTooltip'
import OwnerButton from '../common/OwnerButton'
import RepoVersionButton from '../repos/RepoVersionButton'
import APIService from '../../services/APIService'
import DotSeparator from '../common/DotSeparator'
import ConceptCell from '../mappings/ConceptCell';

const TooltipTitle = ({ concept, owner, repo }) => {
  const history = useHistory()
  const url = concept?.version_url || concept?.url
  const [entity, setEntity] = React.useState(concept || {})
  const shouldRefetch = () => Boolean(url && !has(entity, 'display_name'))
  const fetchEntity = () => {
    if(shouldRefetch())
      APIService.new().overrideURL(url).get().then(response => setEntity(response.data))
    else
      setEntity(concept)
  }

  React.useEffect(() => {
    fetchEntity()
  }, [concept?.version_url || concept?.url])

  let _owner = owner?.type ? owner : URIToOwnerParams(url)

  return (
    <React.Fragment>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-8px'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <OwnerButton
            noTooltip
            ownerType={_owner?.type}
            owner={_owner?.owner}
            ownerURL={_owner?.uri}
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
            repo={repo?.short_code || repo?.id}
            version={repo?.version || repo?.id}
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
          <DotSeparator margin='0 8px' />
    <ConceptCell noId concept={{...entity, display_name: entity.id}} />
        </span>
      </div>
      <div style={{width: '100%', fontSize: '14px', marginTop: '6px'}}>
        <span style={{color: '#000', cursor: 'pointer'}} onClick={() => history.push(url)}>
          <b>{entity?.display_name || '-'}</b>
        </span>
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
      <span style={{spanStyle}}>
        {children}
      </span>
    </HTMLTooltip>

  )
}

export default ConceptTooltip;
