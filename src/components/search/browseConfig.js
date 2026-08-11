import filter from 'lodash/filter'
import isArray from 'lodash/isArray'
import { getCurrentUser, getCurrentUserOrgs, getCurrentUserUsername } from '../../common/utils'
import APIService from '../../services/APIService'

const isOrg = resource => resource?.type === 'Organization'
const isRepo = resource => ['Source', 'Collection', 'Source Version', 'Collection Version'].includes(resource?.type)
const isUser = resource => resource?.type === 'User'

const getData = response => isArray(response?.data) ? response.data : []

const fetchMyRepos = () => {
  const username = getCurrentUserUsername()
  if(!username)
    return Promise.resolve([])

  return Promise.all([
    APIService.users(username).sources().get(null, null, {limit: 100}),
    APIService.users(username).collections().get(null, null, {limit: 100}),
    APIService.users(username).orgs().appendToUrl('sources/').get(null, null, {limit: 100}),
    APIService.users(username).orgs().appendToUrl('collections/').get(null, null, {limit: 100}),
  ]).then(responses => responses.flatMap(getData))
}

export const BROWSE_CONFIG = {
  orgs: {
    labelKey: 'org.org',
    emptyMessageKey: 'search.no_organizations_found',
    sections: [
      {
        key: 'my',
        titleKey: 'user.my_organizations',
        getItems: () => getCurrentUserOrgs(),
      },
      {
        key: 'bookmarked',
        titleKey: 'search.bookmarked_organizations',
        getItems: () => filter(getCurrentUser()?.pins, pin => isOrg(pin.resource)).map(pin => pin.resource),
      },
      {
        key: 'following',
        titleKey: 'search.following_organizations',
        getItems: () => filter(getCurrentUser()?.following, following => isOrg(following.object)).map(following => following.object),
      },
    ],
  },
  repos: {
    labelKey: 'repo.repo',
    emptyMessageKey: 'search.no_repositories_found',
    getSubtitle: item => item.owner ? `${item.owner} / ${item.id}` : item.id,
    sections: [
      {
        key: 'my',
        titleKey: 'user.my_repositories',
        getItems: fetchMyRepos,
      },
      {
        key: 'bookmarked',
        titleKey: 'search.bookmarked_repositories',
        getItems: () => filter(getCurrentUser()?.pins, pin => isRepo(pin.resource)).map(pin => pin.resource),
      },
      {
        key: 'following',
        titleKey: 'search.following_repositories',
        getItems: () => filter(getCurrentUser()?.following, following => isRepo(following.object)).map(following => following.object),
      },
    ],
  },
  users: {
    labelKey: 'user.user',
    emptyMessageKey: 'search.no_users_found',
    getSubtitle: item => item.username,
    sections: [
      {
        key: 'bookmarked',
        titleKey: 'search.bookmarked_users',
        getItems: () => filter(getCurrentUser()?.pins, pin => isUser(pin.resource)).map(pin => pin.resource),
      },
      {
        key: 'following',
        titleKey: 'search.following_users',
        getItems: () => filter(getCurrentUser()?.following, following => isUser(following.object)).map(following => following.object),
      },
    ],
  },
}

// Attribute filters: no browse list, typed term maps straight to a facet on the search results page.
export const FACET_FILTER_CONFIG = {
  conceptClass: {
    labelKey: 'search.class',
    resourceType: 'concepts',
    resourceLabelKey: 'search.concepts',
    facetField: 'conceptClass',
  },
  mapType: {
    labelKey: 'search.map_type',
    resourceType: 'mappings',
    resourceLabelKey: 'search.mappings',
    facetField: 'mapType',
  },
}

const REPO_RESOURCE_SEGMENTS = ['concepts', 'mappings', 'references']

export const getFacetFilterURL = (facetConfig, term, repoPathname, q) => {
  const filtersParam = encodeURIComponent(JSON.stringify({[facetConfig.facetField]: term}))
  const qParam = q ? `&q=${encodeURIComponent(q)}` : ''

  if(repoPathname) {
    const parts = repoPathname.split('/').filter(Boolean)
    const lastPart = parts[parts.length - 1]
    const base = REPO_RESOURCE_SEGMENTS.includes(lastPart) ? parts.slice(0, -1) : parts
    return `/${[...base, facetConfig.resourceType].join('/')}/?filters=${filtersParam}${qParam}`
  }

  return `/search/?type=${facetConfig.resourceType}&filters=${filtersParam}${qParam}`
}
