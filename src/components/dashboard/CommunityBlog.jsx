import React from 'react';
import { useTranslation } from 'react-i18next'
import * as rssParser from 'react-native-rss-parser';
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'

import isArray from 'lodash/isArray'
import get from 'lodash/get'
import map from 'lodash/map'
import find from 'lodash/find'

import OCLLogo from '../common/OCLLogo'
import ItemSkeletons from '../common/ItemSkeletons'
import { WHITE } from '../../common/colors'
import { formatDate } from '../../common/utils'


// The site's feed carries each post's card image as an enclosure. A post
// without one, or whose image fails to load, shows the Avatar's fallback:
// the OCL mark on the brand color, like the site's own default card.
const getImage = item => find(item.enclosures, enclosure => enclosure.mimeType?.startsWith('image/'))?.url

// Fills what the dashboard column has left, scrolling its list inside; the
// column is a flex column, so the card ends on the column's bottom line.
const CommunityBlog = ({ sx }) => {
  const { t } = useTranslation()
  const [feed, setFeed] = React.useState(false)
  const [loading, setLoading] = React.useState(true)


  const fetchFeed = () => {
    fetch(window.location.href.includes('https://') ? 'https://openconceptlab.org/feed/' : '/api/feed/')
      .then(response => response.ok ? response.text() : Promise.reject(response.status))
      .then(res => rssParser.parse(res))
      .then(rss => setFeed(rss))
      .catch(() => setFeed(false))
      .finally(() => setLoading(false));
  }

  React.useEffect(() => {
    fetchFeed()
  }, [])

  return (
    <Card variant='outlined' sx={{borderRadius: '10px', borderColor: 'surface.nv80', display: 'flex', flexDirection: 'column', width: '100%', minHeight: '160px', overflow: 'hidden', ...sx}}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main', width: '40px', height: '40px' }} aria-label="recipe">
            <OCLLogo color={WHITE} width="30px" height="16px" />
          </Avatar>
        }
        title={t('dashboard.community_blog')}
        sx={{paddingBottom: 0, flexShrink: 0, '.MuiCardHeader-avatar': {marginRight: '16px'}, '.MuiCardHeader-title': {color: 'surface.dark', fontWeight: 'bold'}}}
      />
      <CardContent sx={{padding: '0px 16px', flex: 1, minHeight: 0, overflow: 'auto', '&:last-child': {paddingBottom: 0}}}>
        {
          loading &&
            <Box sx={{paddingBottom: '16px'}}>
              <ItemSkeletons count={3} circleSize={24} lines={3} sx={{padding: '8px 8px 8px 10px'}} />
            </Box>
        }
        {
          isArray(feed?.items) && feed?.items?.length > 0 &&
            <List dense sx={{padding: '0 0 16px 0'}}>
              {
                map(feed.items, (item, index) => (
                  <ListItem disablePadding key={index}>
                    <ListItemButton sx={{padding: '4px 8px', alignItems: 'flex-start'}} href={get(item, 'links.0.url') || 'undefined'} target='_blank' rel='noreferrer noopener'>
                      <ListItemAvatar sx={{minWidth: '84px', marginTop: '6px'}}>
                        <Avatar variant='rounded' src={getImage(item)} alt='' sx={{width: '72px', height: '40px', borderRadius: '6px', bgcolor: 'primary.main'}}>
                          <OCLLogo noLink color={WHITE} width="36px" height="14px" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.title}
                        secondary={formatDate(item.published)}
                        sx={{'.MuiListItemText-primary': { fontSize: '14px'}, '.MuiListItemText-secondary': { fontSize: '12px'}}}
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              }
            </List>
        }
      </CardContent>
    </Card>
  )
}
export default CommunityBlog
