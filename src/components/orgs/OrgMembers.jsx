import React from 'react';
import { useTranslation } from 'react-i18next';
import {map, reject, filter, orderBy, chunk} from 'lodash';
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import UserIcon from '../users/UserIcon';

const Member = ({ member }) => {
  return (
    <Tooltip key={member.url} title={member.name}>
      <IconButton href={`#${member.url}`} sx={{marginRight: '4px'}}>
        <UserIcon user={member} sx={{width: '32px', height: '32px'}} />
      </IconButton>
    </Tooltip>
  )
}

const OrgMembers = ({ members }) => {
  const { t } = useTranslation()
  return members && members?.length ? (
    <div className='col-xs-12 padding-0' style={{margin: '16px 0 24px 0'}}>
      <Typography component='h3' sx={{marginBottom: '16px', fontWeight: 'bold'}}>
        {t('org.members')}
      </Typography>
      <div style={{display: 'flex', alignItems: 'flex-start', flexDirection: 'column'}}>
        {
          map(chunk([...orderBy(filter(members, 'logo_url'), 'name'), ...orderBy(reject(members, 'logo_url'), 'name')], 5), (_members, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', width: '100%'}}>
              {
                map(_members, member => (<Member key={member.url} member={member} />))
              }
            </div>
          ))
        }
      </div>
    </div>
  ) : null
}

export default OrgMembers;
