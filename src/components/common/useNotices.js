import React from 'react'
import { useTranslation } from 'react-i18next'

import APIService from '../../services/APIService'
import { getCurrentUserUsername, isLoggedIn } from '../../common/utils'
import { createRequestGuard, getNotices } from './limitNoticePayload'
import { NOTICES_CHANGED_EVENT, refreshNotices } from './LimitNotice'
import { watchTask } from '../repos/taskState'

// GET /capabilities/notices/ is served by a connected service on oclapi2 (OpenConceptLab/ocl_online#702). Where it
// isn't (a self-hosted OCL: 404), or the request fails, there are no notices and nothing is said.
const NOTICES_URL = '/capabilities/notices/'
const CACHE_KEY = 'limitNotices'

// APIService.request, not get: its errors come back as they are, so a 401 here can't sign the person out
const fetchNotices = query => APIService.new()
  .overrideURL(NOTICES_URL)
  .request('GET', null, null, {query, timeout: 10000})
  .then(response => ({status: response?.status, notices: getNotices(response?.data)}))
  .catch(error => ({status: error?.response?.status, notices: []}))

// With storage unavailable (or a cache it can't read) nothing is cached, and the next page load asks again
const safely = fn => {
  try {
    return fn()
  } catch(_) {
    return null
  }
}

const readCache = (username, lang) => safely(() => {
  const cached = JSON.parse(window.sessionStorage.getItem(CACHE_KEY))
  return (cached?.username === username && cached?.lang === lang && Array.isArray(cached.notices)) ? cached.notices : null
})
const clearCache = () => safely(() => window.sessionStorage.removeItem(CACHE_KEY))
const writeCache = (username, lang, notices) => safely(() => window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({username, lang, notices})))

// A write the API queued (a repository's deletion, say) changes the notices only once its task has ended, so they're
// fetched again then. The watch outlives the page that started it: the account strips are on every page.
export const refreshNoticesWhenTaskEnds = taskId => watchTask(
  () => APIService.new().overrideURL(`/tasks/${taskId}/`).get(null, null, null, true)
    .then(response => (response?.status === 200 && response.data?.state) || null),
  refreshNotices,
)

// Fetches again whenever the notices may have changed (refreshNotices): a refusal carrying a notice was shown, or a
// write that can change them succeeded
const useRefetchOnChange = load => React.useEffect(() => {
  window.addEventListener(NOTICES_CHANGED_EVENT, load)
  return () => window.removeEventListener(NOTICES_CHANGED_EVENT, load)
}, [load])

// Only the latest request a hook made may answer (createRequestGuard): one superseded by a newer one, a cache hit, a
// change of user, language or resource, or an unmount is ignored
const useRequestGuard = () => {
  const guard = React.useMemo(createRequestGuard, [])
  React.useEffect(() => guard.invalidate, [guard])
  return guard
}

// The signed-in person's account notices: asked once a session, and again whenever they may have changed
export const useAccountNotices = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const username = isLoggedIn() ? getCurrentUserUsername() : null
  const [notices, setNotices] = React.useState(() => (username && readCache(username, lang)) || [])
  const guard = useRequestGuard()

  const load = React.useCallback(() => {
    const isLatest = guard.start()
    if(!username) {
      setNotices([])
      return
    }
    fetchNotices({lang}).then(({ status, notices }) => {
      if(!isLatest())
        return
      // an answer, or a server with no such route, holds for the session; after a failed request nothing is kept, so
      // the next page load asks again
      if([200, 404].includes(status))
        writeCache(username, lang, notices)
      else
        clearCache()
      setNotices(notices)
    })
  }, [username, lang, guard])

  // On a change of user or language, the cache answers if it can; either way a request still in flight is stale
  React.useEffect(() => {
    const cached = username && readCache(username, lang)
    if(cached) {
      guard.invalidate()
      setNotices(cached)
    } else
      load()
  }, [load, guard])

  useRefetchOnChange(load)

  return notices
}

// The notices for one repository, version or map project (its relative URL), with the locks they carry
export const useResourceNotices = resourceURL => {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const [state, setState] = React.useState({resourceURL: null, notices: []})
  const guard = useRequestGuard()

  const load = React.useCallback(() => {
    const isLatest = guard.start()
    if(!resourceURL || !isLoggedIn()) {
      setState({resourceURL, notices: []})
      return
    }
    fetchNotices({resource: resourceURL, lang}).then(({ notices }) => isLatest() && setState({resourceURL, notices}))
  }, [resourceURL, lang, guard])

  React.useEffect(() => {
    load()
  }, [load])
  useRefetchOnChange(load)

  // never the notices of the resource shown before
  return state.resourceURL === resourceURL ? state.notices : []
}
