import React from 'react'
import { useHistory } from 'react-router-dom';
import OrganizationIcon from '@mui/icons-material/AccountBalance';
import HTMLTooltip from '../common/HTMLTooltip'
import FollowActionButton from '../common/FollowActionButton'

const TooltipTitle = ({ org }) => {
  const history = useHistory()
  return (
    <React.Fragment>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {
          org?.logo_url ?
            <img src={org.logo_url} style={{width: '48px', height: '48px', border-radius: '50%', objectFit: 'cover'}} /> :
          <OrganizationIcon sx={{width: '30px', height: '30px'}} />
        }
        <FollowActionButton iconButton entity={org} sx={{mr: 0, ml: 1.5}} size='small' />
      </div>
      <div style={{width: '100%', fontSize: '14px', marginTop: '6px'}}>
        {
          org?.name &&
            <span style={{color: '#000', cursor: 'pointer'}} onClick={() => history.push(org?.url)}>
              <b>{org?.name}</b>
            </span>
        }
        <span style={{marginLeft: '8px', cursor: 'pointer'}} onClick={() => history.push(org?.url)}>
          {org?.id}
        </span>
      </div>
      {
        Boolean(org?.description) &&
          <div style={{width: '100%', fontSize: '12px', marginTop: '4px'}} className='ellipsis-text-3'>
            {org.description}
          </div>
      }
    </React.Fragment>
  )
}

const OrgTooltip = ({ org, children, spanStyle }) => {
  return (
    <HTMLTooltip
      title={
        <React.Fragment>
          <TooltipTitle org={org} />
        </React.Fragment>
      }
    >
      <span style={{display: 'flex', ...spanStyle}}>
        {children}
      </span>
    </HTMLTooltip>
  )
}

export default OrgTooltip;
