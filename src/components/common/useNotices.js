import React from 'react'
import { useTranslation } from 'react-i18next'

import APIService from '../../services/APIService'
import { getCurrentUserUsername, isLoggedIn } from '../../common/utils'
import { getNotices } from './limitNoticePayload'
import { NOTICE_REFUSED_EVENT } from './LimitNotice'

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

const readCache = (username, lang) => {
  try {
    const cached = JSON.parse(window.sessionStorage.getItem(CACHE_KEY))
    return (cached?.username === username && cached?.lang === lang && Array.isArray(cached.notices)) ? cached.notices : null
  } catch(_) {
    return null
  }
}

const clearCache = () => {
  try {
    window.sessionStorage.removeItem(CACHE_KEY)
  } catch(_) {
    // storage unavailable: there's nothing to clear
  }
}

const writeCache = (username, lang, notices) => {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({username, lang, notices}))
  } catch(_) {
    // storage unavailable: the next page load asks again
  }
}

// Fetches again whenever a refusal carrying a notice is shown (takeRefusalNotice)
const useRefusalRefetch = load => React.useEffect(() => {
  window.addEventListener(NOTICE_REFUSED_EVENT, load)
  return () => window.removeEventListener(NOTICE_REFUSED_EVENT, load)
}, [load])

// Only the latest request a hook made may answer: one that's superseded (a newer one started, or the hook moved on to
// another resource or unmounted) is ignored
const useLatestRequest = () => {
  const latest = React.useRef(0)
  React.useEffect(() => () => {
    latest.current += 1
  }, [])
  return React.useCallback(() => {
    const id = ++latest.current
    return () => id === latest.current
  }, [])
}

// The signed-in person's account notices: asked once a session, and again after a refusal with a notice
export const useAccountNotices = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const username = isLoggedIn() ? getCurrentUserUsername() : null
  const [notices, setNotices] = React.useState(() => (username && readCache(username, lang)) || [])
  const startRequest = useLatestRequest()

  const load = React.useCallback(() => {
    const isLatest = startRequest()
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
  }, [username, lang, startRequest])

  React.useEffect(() => {
    const cached = username && readCache(username, lang)
    if(cached)
      setNotices(cached)
    else
      load()
  }, [load])

  useRefusalRefetch(load)

  return notices
}

// The notices for one repository, version or map project (its relative URL), with the locks they carry
export const useResourceNotices = resourceURL => {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const [state, setState] = React.useState({resourceURL: null, notices: []})
  const startRequest = useLatestRequest()

  const load = React.useCallback(() => {
    const isLatest = startRequest()
    if(!resourceURL || !isLoggedIn()) {
      setState({resourceURL, notices: []})
      return
    }
    fetchNotices({resource: resourceURL, lang}).then(({ notices }) => isLatest() && setState({resourceURL, notices}))
  }, [resourceURL, lang, startRequest])

  React.useEffect(() => {
    load()
  }, [load])
  useRefusalRefetch(load)

  // never the notices of the resource shown before
  return state.resourceURL === resourceURL ? state.notices : []
}
