import React from 'react';
import { useTranslation } from 'react-i18next';
import {map, reject, filter, orderBy} from 'lodash';
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import UserIcon from '../users/UserIcon';
import Link from '../common/Link';

const DEFAULT_MEMBERS_TO_SHOW = 12

const Member = ({ member }) => {
  return (
    <Tooltip key={member.url} title={member.name}>
      <IconButton href={`#${member.url}`} sx={{marginRight: '10px', padding: 0, marginBottom: '10px'}}>
        <UserIcon user={member} sx={{width: '32px', height: '32px'}} />
      </IconButton>
    </Tooltip>
  )
}

const OrgMembers = ({ members }) => {
  const { t } = useTranslation()
  const [more, setMore] = React.useState(false)
  const ordered = [...orderBy(filter(members, 'logo_url'), 'name'), ...orderBy(reject(members, 'logo_url'), 'name')]
  const isMore = ordered.length > DEFAULT_MEMBERS_TO_SHOW
  const getMembers = () => isMore ? (more ? ordered : ordered.slice(0, DEFAULT_MEMBERS_TO_SHOW)) : ordered
  return members && members?.length ? (
    <div className='col-xs-12 padding-0' style={{margin: '16px 0 24px 0'}}>
      <Typography component='h3' sx={{marginBottom: '16px', fontWeight: 'bold'}}>
        {t('org.members')}
      </Typography>
      <div className='col-xs-12 col-md-12 col-sm-12 padding-0'>
        {
          map(getMembers(), member => (<Member key={member.url} member={member} />))
        }
        {
          isMore && !more && <Link label={`+${members.length - DEFAULT_MEMBERS_TO_SHOW} ${t('common.more')}`} onClick={() => setMore(!more)} sx={{fontSize: '12px'}} />
        }
      </div>
    </div>
  ) : null
}

export default OrgMembers;
