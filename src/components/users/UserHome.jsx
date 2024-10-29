import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useHistory } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import { getCurrentUser } from '../../common/utils'
import { COLORS } from '../../common/colors'
import APIService from '../../services/APIService'
import CommonTabs from '../common/CommonTabs';
import Search from '../search/Search';
import UserOverview from './UserOverview';
import UserSummary from './UserSummary'
import UserProfile from './UserProfile'


const UserHome = () => {
  const { t } = useTranslation()
  const params = useParams()
  const history = useHistory()
  const [tab, setTab] = React.useState(findTab || 'overview')
  const [user, setUser] = React.useState({})
  const [bookmarks, setBookmarks] = React.useState(false)
  const [events, setEvents] = React.useState(false)
  const [eventsPage, setEventsPage] = React.useState(0)
  const [haveMoreEvents, setHaveMoreEvents] = React.useState(false)
  const height = 'calc(100vh - 95px)'
  const TABS = [
    {key: 'overview', label: t('common.overview')},
    {key: 'repos', label: t('repo.repos')},
  ]
  const TAB_KEYS = TABS.map(tab => tab.key)
  const findTab = () => TAB_KEYS.includes(params?.tab) ? params.tab : 'overview'
  const currentUser = getCurrentUser()
  const isCurrentUser = Boolean(currentUser?.username && currentUser?.username == params.user)

  const reset = () => {
    setBookmarks(false)
    setEvents(false)
    setEventsPage(0)
    setUser({})
    fetchUser(true)
  }

  const fetchUser = reset => {
    if(isCurrentUser) {
      setUser(getCurrentUser())
      fetchEvents(reset)
      fetchBookmarks()
    } else {
      APIService.users(params.user).get(null, null, {includeSubscribedOrgs: true, includeFollowing: true}).then(response => {
        if(response.status === 200) {
          setUser(response.data)
          fetchEvents(reset)
          fetchBookmarks()
        }
        else if(response.status)
          window.location.hash = '#/' + response.status
        else if(response.detail === 'Not found.')
          window.location.hash = '#/404/'
      })
    }
  }

  const fetchBookmarks = () => {
    if(params?.user) {
      APIService.users(params?.user).appendToUrl('pins/').get().then(response => {
        setBookmarks(response?.data?.length ? response.data : [])
      })
    }
  }

  const fetchEvents = reset => {
    if(params?.user) {
      const isReset = reset === true
      APIService.users(params?.user).appendToUrl('events/').get(null, null, {limit: 5, page: isReset ? 1 : (eventsPage + 1)}).then(response => {
        setEvents([...(isReset ? [] : events || []), ...(response?.data?.length ? response.data : [])])
        setEventsPage(response?.headers?.page_number ? parseInt(response.headers.page_number) : 0)
        setHaveMoreEvents(Boolean(response?.headers?.next))
        setTimeout(() => {
          const el = document.getElementById('events-timeline')
          if(el) {
            el.scrollTop = el.scrollHeight
          }
        }, 50)
      })
    }
  }

  const onTabChange = (event, newTab) => {
    if(newTab) {
      setTab(newTab)
      let URL = user.url
      if(newTab !== 'overview') {
        URL += '/' + newTab
      }
      history.push(URL.replace('//', '/'))
    }
  }



  React.useEffect(
    () => {
      reset()
    }, [params.user]
  )
  React.useEffect(() => { setTab(params.tab || 'overview') }, [params.tab])

  const baseHeightToDeduct = 150
  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-3' style={{height: height, padding: '24px 24px 24px 8px', maxWidth: '20%', overflow: 'auto'}}>
        <UserProfile user={user} />
      </div>
      <div className='col-xs-10 padding-0' style={{backgroundColor: COLORS.primary.contrastText, borderRadius: '10px', height: height, maxWidth: '80%', border: `1px solid ${COLORS.surface.nv80}`, borderTop: 'none'}}>
        <div className='padding-0 col-xs-12' style={{width: 'calc(100% - 272px)'}}>
          <CommonTabs TABS={TABS} value={tab} onChange={onTabChange} sx={{borderTopLeftRadius: '10px'}} />
          {
            user?.url && tab === 'repos' &&
              <Search
                resource='repos'
                url={user?.url + 'repos/'}
                nested
                noTabs
                filtersHeight={`calc(100vh - ${baseHeightToDeduct}px)`}
                resultContainerStyle={{height: `calc(100vh - ${baseHeightToDeduct}px - 100px)`, overflow: 'auto'}}
                containerStyle={{padding: 0}}
                defaultFiltersOpen={false}
                resultSize='medium'
                excludedColumns={['owner']}
              />
          }
          {
            tab === 'overview' && user?.url &&
              <UserOverview user={user} bookmarks={bookmarks} events={events} height={height} onLoadMoreEvents={haveMoreEvents ? fetchEvents : false} />
          }
        </div>

        <Paper component='div' className='col-xs-12' sx={{height: 'calc(100vh - 96px)', width: '272px !important', borderLeft: '0.5px solid', borderTop: '0.5px solid', borderColor: 'surface.nv80', borderRadius: '0 10px 10px 0', boxShadow: 'none', padding: '16px', overflow: 'auto', backgroundColor: 'default.main'}}>
          <UserSummary user={user} />
        </Paper>
      </div>
    </div>
  )
}

export default UserHome
