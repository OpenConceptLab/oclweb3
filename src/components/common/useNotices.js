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

// The signed-in person's account notices: asked once a session, and again after a refusal with a notice
export const useAccountNotices = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const username = isLoggedIn() ? getCurrentUserUsername() : null
  const [notices, setNotices] = React.useState(() => (username && readCache(username, lang)) || [])

  const load = React.useCallback(() => {
    if(!username) {
      setNotices([])
      return undefined
    }
    let current = true
    fetchNotices({lang}).then(({ status, notices }) => {
      // an answer, or a server with no such route, holds for the session; a failed request is asked again next time
      if([200, 404].includes(status))
        writeCache(username, lang, notices)
      if(current)
        setNotices(notices)
    })
    return () => {
      current = false
    }
  }, [username, lang])

  React.useEffect(() => {
    const cached = username && readCache(username, lang)
    if(cached) {
      setNotices(cached)
      return undefined
    }
    return load()
  }, [load])

  useRefusalRefetch(load)

  return notices
}

// The notices for one repository or map project (its relative URL), with the locks they carry
export const useResourceNotices = resourceURL => {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const [state, setState] = React.useState({resourceURL: null, notices: []})

  const load = React.useCallback(() => {
    if(!resourceURL || !isLoggedIn()) {
      setState({resourceURL, notices: []})
      return undefined
    }
    let current = true
    fetchNotices({resource: resourceURL, lang}).then(({ notices }) => current && setState({resourceURL, notices}))
    return () => {
      current = false
    }
  }, [resourceURL, lang])

  React.useEffect(load, [load])
  useRefusalRefetch(load)

  // never the notices of the resource shown before
  return state.resourceURL === resourceURL ? state.notices : []
}
