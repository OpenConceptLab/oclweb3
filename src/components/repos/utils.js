import {
  isEmpty, compact, map, find, reject, orderBy, uniqBy, filter, get, keys, isEqual
} from 'lodash';

import {
  getAPIURL, getCurrentUserUsername, isCurrentUserMemberOf, originOf, toAPIOrigin, toParentURI
} from '../../common/utils';
import { OWNER_TYPES, REPO_TYPES } from '../../common/constants';

export const sortValuesBySourceSummary = (data, summary, summaryField, isLocale) => {
  if(isEmpty(compact(data)) || !summary)
    return data
  let _data = compact(data).map(d => {
    d.resultType = 'Ordered'
    return d
  })
  const summaryValues = get(summary, summaryField)
  let suggested = []
  if(summaryValues) {
    const usedValues = map(summaryValues, value => value[0])
    usedValues.forEach(used => {
      const _used = find(_data, _d => {
        const id = _d?.id?.toLowerCase()?.replace('-', '')?.replace('_', '')?.replace(' ', '')
        const _used = used?.toLowerCase()?.replace('-', '')?.replace('_', '')?.replace(' ', '')
        return _used === id
      })
      if(_used) {
        suggested.push({..._used, resultType: 'Suggested'})
        _data = reject(_data, {id: _used?.id})
      }
    })
  }

  let values = [...suggested, ...orderBy(_data, 'name', 'asc')]

  if(isLocale) {
    values = uniqBy(
      [
        {...find(values, {id: summary.default_locale}), resultType: 'Suggested'},
        ...filter(
            values,
            val => (summary.supported_locales || []).includes(val.id)
        ).map(val => ({...val, resultType: 'Suggested'})),
        ...values
      ],
      'id'
    )
  }

  return reject(values, value => isEqual(keys(value), ['resultType']))
}

export const parseRepoURL = url => {
  if(!url || typeof url !== 'string')
    return false

  let value = url.trim()
  if(!value)
    return false

  let origin = ''
  if(/^https?:\/\//i.test(value)) {
    let parsed
    try {
      parsed = new URL(value)
    } catch {
      return false
    }
    origin = parsed.origin
    value = parsed.hash ? parsed.hash.replace(/^#/, '') : parsed.pathname
  } else if(value.includes('://')) {
    return false
  } else {
    value = value.replace(/^#/, '')
  }

  value = value.split(/[?#]/)[0]
  if(!value.startsWith('/'))
    value = '/' + value

  const uri = toParentURI(value)
  const [, ownerType, owner, repoType, repo] = uri.split('/')
  if(!OWNER_TYPES.includes(ownerType) || !REPO_TYPES.includes(repoType) || !owner || !repo)
    return false

  const external = isExternalOrigin(origin)

  return {
    ownerType,
    owner,
    repoType,
    repo,
    uri,
    isExternal: external,
    fetchURL: external ? toAPIOrigin(origin) + uri : uri
  }
}

const isExternalOrigin = origin => {
  if(!origin)
    return false
  const ours = compact([window.location.origin, originOf(getAPIURL())]).map(toAPIOrigin)
  return !ours.includes(toAPIOrigin(origin))
}

export const createSimilarRepoHref = repo => {
  const username = getCurrentUserUsername()
  if(!username || !repo?.url)
    return false
  const isOrg = repo?.owner_type === 'Organization'
  const canUseRepoOwner = isOrg ? isCurrentUserMemberOf(repo?.owner) : repo?.owner === username
  const ownerURL = canUseRepoOwner ?
                   (repo?.owner_url || `/${isOrg ? 'orgs' : 'users'}/${repo.owner}/`) :
                   `/users/${username}/`
  return `#${ownerURL}repos/new?copyFrom=${encodeURIComponent(repo.url)}`
}
