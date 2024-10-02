import React from 'react';
import { useTranslation } from 'react-i18next';
import {map, reject, filter, orderBy} from 'lodash';
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton';
import EntityIcon from '../common/EntityIcon';
import Link from '../common/Link';

const DEFAULT_MEMBERS_TO_SHOW = 12

const Followed = ({ object }) => {
  return (
    <IconButton href={`#${object.url}`} sx={{marginRight: '10px', padding: 0, marginBottom: '10px'}}>
      <EntityIcon noLink strict entity={object} isVersion={(object?.short_code && object?.version_url)} sx={{width: '32px', height: '32px'}} />
    </IconButton>
  )
}

const Following = ({ following, title }) => {
  const { t } = useTranslation()
  const [more, setMore] = React.useState(false)
  const ordered = [
    ...orderBy(filter(following, 'object.logo_url'), 'object.name'), ...orderBy(reject(following, 'object.logo_url'), 'object.name'),
  ]
  const isMore = ordered.length > DEFAULT_MEMBERS_TO_SHOW
  const getFollowed = () => isMore ? (more ? ordered : ordered.slice(0, DEFAULT_MEMBERS_TO_SHOW)) : ordered
  return following && following?.length ? (
    <div className='col-xs-12 padding-0' style={{margin: '16px 0 24px 0'}}>
      <Typography component='h3' sx={{marginBottom: '16px', fontWeight: 'bold'}}>
        {title}
      </Typography>
      <div className='col-xs-12 col-md-12 col-sm-12 padding-0'>
        {
          map(getFollowed(), followed => (<Followed key={followed.url} object={followed.object} />))
        }
        {
          isMore && !more &&
            <Link
              label={`+${following.length - DEFAULT_MEMBERS_TO_SHOW} ${t('common.more')}`}
              onClick={() => setMore(!more)}
              sx={{fontSize: '12px'}}
            />
        }
        {
          isMore && more &&
            <Link
              label={t('common.less')}
              onClick={() => setMore(!more)}
              sx={{fontSize: '12px'}}
            />
        }
      </div>
    </div>
  ) : null
}

export default Following;
