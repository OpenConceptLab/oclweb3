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
import ListItemIcon from '@mui/material/ListItemIcon'
import Avatar from '@mui/material/Avatar'
import CategoryIcon from '@mui/icons-material/Category';

import isArray from 'lodash/isArray'
import get from 'lodash/get'
import map from 'lodash/map'

import OCLLogo from '../common/OCLLogo'
import { WHITE } from '../../common/colors'
import { formatDate } from '../../common/utils'


const CommunityBlog = ({ sx }) => {
  const { t } = useTranslation()
  const [feed, setFeed] = React.useState(false)


  const fetchFeed = () => {
    fetch(window.location.href.includes('https://') ? 'https://openconceptlab.org/feed/' : '/api/feed/')
      .then(response => response.text())
      .then(res => rssParser.parse(res))
      .then(rss => setFeed(rss));
  }

  React.useEffect(() => {
    fetchFeed()
  }, [])

  return (
    <Card variant='outlined' sx={{height: '298px', borderRadius: '10px', display: 'inline-block', width: '100%', overflow: 'auto', ...sx}}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }} aria-label="recipe">
            <OCLLogo color={WHITE} width="30px" height="16px" />
          </Avatar>
        }
        title={t('dashboard.community_blog')}
        sx={{paddingBottom: 0, '.MuiCardHeader-title': {color: 'surface.dark', fontWeight: 'bold'}}}
      />
      <CardContent sx={{padding: '0px 16px 16px 16px'}}>
        {
          isArray(feed?.items) && feed?.items?.length > 0 &&
            <List dense sx={{padding: 0}}>
              {
                map(feed.items, (item, index) => (
                  <ListItem disablePadding key={index}>
                    <ListItemButton sx={{padding: '4px 8px'}} href={get(item, 'links.0.url') || 'undefined'} target='_blank' rel='noreferrer noopener'>
                      <ListItemIcon sx={{minWidth: '44px'}}>
                        <CategoryIcon />
                      </ListItemIcon>
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
