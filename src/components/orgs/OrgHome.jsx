import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useHistory } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import APIService from '../../services/APIService'
import GAService from '../../services/GAService'
import { getCurrentUser, getErrorDetail, isAdminUser, refreshCurrentUserCache } from '../../common/utils';
import { ROLE_ADMIN } from '../../common/orgRoles';
import usePins from '../../hooks/usePins';
import { OperationsContext } from '../app/LayoutContext';
import CommonTabs from '../common/CommonTabs';
import DeleteEntityDialog from '../common/DeleteEntityDialog'
import Search from '../search/Search';
import useDefaultFiltersOpen, { PROFILE_LIST_MIN_WIDTH } from '../../hooks/useDefaultFiltersOpen';
import Error40X from '../errors/Error40X';
import OrgOverview from './OrgOverview';
import OrgSummary from './OrgSummary';
import OrgHeader from './OrgHeader'
import LeaveOrgDialog from './LeaveOrgDialog'
import useProfileTabs from '../../hooks/useProfileTabs'
import ProfileTabContent from '../common/ProfileTabContent'

const OrgHome = () => {
  const { t } = useTranslation()
  const params = useParams()
  const history = useHistory()
  const user = getCurrentUser()
  const [org, setOrg] = React.useState({})
  const [status, setStatus] = React.useState(false)
  const [members, setMembers] = React.useState([])
  const [deleteOrg, setDeleteOrg] = React.useState(false)
  const [leaveOrg, setLeaveOrg] = React.useState(false)
  const [leaving, setLeaving] = React.useState(false)
  const [tab, setTab] = React.useState(findTab)
  const [defaultFiltersOpen, onFiltersOpenChange, listRef] = useDefaultFiltersOpen(PROFILE_LIST_MIN_WIDTH)
  const { setAlert } = React.useContext(OperationsContext);
  const { pins: bookmarks, canPin, deletePin } = usePins(params?.org ? {type: 'org', id: params.org} : false)

  const extraTabs = useProfileTabs('orgs', params?.org)
  const TABS = [
    {key: 'overview', label: t('common.overview')},
    {key: 'repos', label: t('repo.repos')},
    ...extraTabs.map(({key, label}) => ({key, label}))
  ]
  const TAB_KEYS = TABS.map(tab => tab.key)
  const findTab = () => TAB_KEYS.includes(params?.tab) ? params.tab : 'overview'
  // Resolves to whether the org came back
  const fetchOrgDetails = () => (
    APIService.orgs(params.org).get(null, null, {includeOverview: true}, true).then(response => {
      const newStatus = response?.status || response?.response?.status
      const data = response?.data || response?.response?.data || {}
      setStatus(newStatus)
      if(newStatus === 200 && data?.id) {
        setOrg(data)
        return true
      }
      return false
    })
  )
  const fetchOrg = () => fetchOrgDetails().then(found => found && fetchMembers())
  const fetchMembers = () => (
    APIService.orgs(params.org).appendToUrl('members/?verbose=true&limit=100').get().then(response => {
      if(Array.isArray(response?.data)) {
        setMembers(response.data)
        setOrg(prev => ({...prev, members: response.data.length}))
      }
    })
  )
  const onTabChange = (event, newTab) => {
    if(newTab) {
      setTab(newTab)
      let URL = org.url
      if(newTab !== 'overview') {
        URL += '/' + newTab
      }
      history.push(URL.replace('//', '/'))
    }
  }

  const canAdminister = isAdminUser() || org.user_role === ROLE_ADMIN
  const canDelete = org.id !== 'OCL' && canAdminister
  const onDelete = () => {
    if(!canDelete)
      return
    GAService.recordActionEvent('Organization', 'delete_organization', org.id, {
      organization: org.url
    })
    APIService.orgs(org.id).delete().then(response => {
      if([202, 409, 208].includes(response.status === 202) || response?.detail === 'Already Queued' || response?.__all__ === 'Already Queued') {
        setDeleteOrg(false)
        setAlert({severity: 'warning', message: t('org.delete_accepted')})
      }
      else if(response.status === 204) {
        setDeleteOrg(false)
        setAlert({severity: 'warning', message: t('org.success_delete')})
        history.push(user?.url || '/')
      }
      else
        setAlert({severity: 'error', message: response?.data?.detail || t('common.generic_error')})
    })
  }

  // Resolves once the cached user is fresh and the page is on its way to the user's profile
  const onLeft = () => new Promise(resolve => {
    const goToProfile = () => {
      setAlert({severity: 'success', message: t('org.success_leave')})
      history.push(user.url)
      resolve()
    }
    refreshCurrentUserCache(goToProfile, goToProfile)
  })

  const onLeave = () => {
    // The dialog's button stays clickable while it fades out after a refusal
    if(leaving || !leaveOrg)
      return
    setLeaving(true)
    APIService.orgs(org.id).appendToUrl(`members/${user.username}/`).delete(null, null, {}, null, true).then(response => {
      if(response?.status === 204)
        onLeft()
      else {
        setLeaving(false)
        setLeaveOrg(false)
        setAlert({severity: 'error', message: getErrorDetail(response) || t('common.generic_error')})
      }
    })
  }

  // After Edit Members saves: removing yourself there is leaving, adding yourself or changing your own role changes what
  // you can do here, and any other change only changes the members.
  const onMembersSaved = ({left, ownRoleChanged}) => {
    if(left)
      return onLeft()
    return Promise.all([fetchMembers(), ownRoleChanged && fetchOrgDetails()])
  }

  React.useEffect(() => { fetchOrg() }, [params.org])
  // A tab this viewer doesn't get (someone else's Mapping Projects) shows Overview instead
  React.useEffect(() => { setTab(findTab()) }, [params.tab, TAB_KEYS.join()])

  const height = 'calc(var(--app-height) - 300px)'

  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '10px'}}>
      <Paper component="div" className='col-xs-12 split padding-0' sx={{backgroundColor: 'info.contrastText', borderRadius: '10px', boxShadow: 'none', p: 0, border: 'solid 0.3px', borderColor: 'surface.nv80'}}>
        {
          org?.id &&
            <React.Fragment>
              <OrgHeader org={org} members={members} canAdminister={canAdminister} canDelete={canDelete} onDeleteClick={() => setDeleteOrg(true)} onLeaveClick={() => setLeaveOrg(true)} onMembersSaved={onMembersSaved} />
              <div ref={listRef} className='padding-0 col-xs-12' style={{width: 'calc(100% - 272px)'}}>
                <CommonTabs TABS={TABS} value={tab} onChange={onTabChange} />
                {
                  tab === 'repos' && defaultFiltersOpen !== null &&
                    <Search
                      resource={tab}
                      url={org.url + tab + '/'}
                      defaultFiltersOpen={defaultFiltersOpen}
                      onFiltersOpenChange={onFiltersOpenChange}
                      nested
                      noTabs
                      filtersHeightToSubtract={280}
                      resultContainerStyle={{height: 'calc(var(--app-height) - 368px)', overflow: 'auto'}}
                      containerStyle={{padding: 0}}
                      excludedColumns={['owner']}
                    />
                }
                {
                  extraTabs.filter(extra => extra.key === tab).map(extra => (
                    <ProfileTabContent key={extra.key} tab={extra} ownerType='orgs' owner={params.org} height='calc(var(--app-height) - 352px)' />
                  ))
                }
                {
                  tab === 'overview' && org?.id &&
                    <OrgOverview org={org} bookmarks={bookmarks} height={height} canPin={canPin} onBookmarkDelete={deletePin} />
                }
              </div>
              <Paper component='div' className='col-xs-12' sx={{height: 'calc(var(--app-height) - 228px)', width: '272px !important', borderLeft: '0.5px solid', borderTop: '0.5px solid', borderColor: 'surface.nv80', borderRadius: '0 0 10px 0', boxShadow: 'none', padding: '16px', overflow: 'auto', backgroundColor: 'default.main'}}>
                <OrgSummary org={org} members={members} />
              </Paper>
            </React.Fragment>
        }
        {
          !org?.id && status && status !== 200 && <Error40X status={status} />
        }
      </Paper>
      {
        org?.id &&
          <DeleteEntityDialog
            open={deleteOrg}
            onClose={() => setDeleteOrg(false)}
            onSubmit={onDelete}
            entityType={org.type}
            entityId={org.id}
            relationship={t('repo.repos').toLowerCase()}
            warning
          />
      }
      <LeaveOrgDialog open={leaveOrg} org={org} onClose={() => setLeaveOrg(false)} onSubmit={onLeave} pending={leaving} />
    </div>
  )
}

export default OrgHome;
