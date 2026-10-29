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
import ItemSkeletons from '../common/ItemSkeletons'
import { WHITE } from '../../common/colors'
import { formatDate } from '../../common/utils'


const FOOTER_HEIGHT = 30

const CommunityBlog = ({ sx }) => {
  const { t } = useTranslation()
  const [feed, setFeed] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [available, setAvailable] = React.useState(null)
  const cardRef = React.useRef(null)


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

  React.useLayoutEffect(() => {
    const measure = () => {
      if(!cardRef.current)
        return
      const footerExtra = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--footer-extra-height')) || 0
      setAvailable(Math.max(window.innerHeight - cardRef.current.getBoundingClientRect().top - FOOTER_HEIGHT - footerExtra - 8, 160))
    }
    measure()
    window.addEventListener('resize', measure)
    const observer = new ResizeObserver(measure)
    observer.observe(cardRef.current.parentElement)
    return () => {
      window.removeEventListener('resize', measure)
      observer.disconnect()
    }
  }, [feed])

  return (
    <Card ref={cardRef} variant='outlined' sx={{maxHeight: available === null ? 'none' : `${available}px`, borderRadius: '10px', display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden', ...sx}}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main', width: '40px', height: '40px' }} aria-label="recipe">
            <OCLLogo color={WHITE} width="30px" height="16px" />
          </Avatar>
        }
        title={t('dashboard.community_blog')}
        sx={{paddingBottom: 0, flexShrink: 0, '.MuiCardHeader-avatar': {marginRight: '16px'}, '.MuiCardHeader-title': {color: 'surface.dark', fontWeight: 'bold'}}}
      />
      <CardContent sx={{padding: '0px 16px', margin: '0 0 16px 0', flex: 1, minHeight: 0, overflow: 'auto', '&:last-child': {paddingBottom: 0}}}>
        {
          loading &&
            <ItemSkeletons count={3} circleSize={24} lines={3} sx={{padding: '8px 8px 8px 10px'}} />
        }
        {
          isArray(feed?.items) && feed?.items?.length > 0 &&
            <List dense sx={{padding: 0}}>
              {
                map(feed.items, (item, index) => (
                  <ListItem disablePadding key={index}>
                    <ListItemButton sx={{padding: '4px 8px', alignItems: 'flex-start'}} href={get(item, 'links.0.url') || 'undefined'} target='_blank' rel='noreferrer noopener'>
                      <ListItemIcon sx={{minWidth: '44px', marginTop: '8px'}}>
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