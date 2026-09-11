import { RESERVED_ROUTE_KEYWORDS } from './constants';

export const REPO_TABS = ['concepts', 'mappings', 'versions', 'summary', 'about', 'references']

export const RESOURCE_TABS = ['concepts', 'mappings', 'references']

const TAB_PATTERN = REPO_TABS.join('|')
const OWNER_PREFIX = '/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo'

export const REPO_ROUTE_PATHS = [
  OWNER_PREFIX,
  `${OWNER_PREFIX}/:repoVersion`,
  `${OWNER_PREFIX}/expansions/:expansion/:tab(${TAB_PATTERN})/:resource?`,
  `${OWNER_PREFIX}/:repoVersion/expansions/:expansion/:tab(${TAB_PATTERN})/:resource?`,
  `${OWNER_PREFIX}/:tab(${TAB_PATTERN})/:resource?`,
  `${OWNER_PREFIX}/:repoVersion/:tab(${TAB_PATTERN})/:resource?`,
]

const decode = value => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export const parseRepoPath = pathname => {
  const segments = (pathname || '').split('/').filter(Boolean)
  const [ownerType, owner, repoType, repo, ...rest] = segments
  const route = {
    ownerType: ownerType || '',
    owner: owner || '',
    repoType: repoType || '',
    repo: repo || '',
    version: '',
    expansion: '',
    tab: '',
    resource: '',
  }

  let index = 0
  if(rest[index] && !RESERVED_ROUTE_KEYWORDS.includes(rest[index])) {
    route.version = rest[index]
    index += 1
  }
  if(rest[index] === 'expansions' && rest[index + 1]) {
    route.expansion = decode(rest[index + 1])
    index += 2
  }
  if(rest[index] && REPO_TABS.includes(rest[index])) {
    route.tab = rest[index]
    index += 1
  }
  if(rest[index])
    route.resource = decode(rest[index])

  return route
}

export const buildRepoPath = (route, overrides = {}) => {
  const merged = {...route, ...overrides}
  const segments = [merged.ownerType, merged.owner, merged.repoType, merged.repo]
  if(merged.version)
    segments.push(merged.version)
  if(merged.expansion)
    segments.push('expansions', encodeURIComponent(merged.expansion))
  if(merged.tab)
    segments.push(merged.tab)
  if(merged.tab && merged.resource)
    segments.push(encodeURIComponent(merged.resource))

  return '/' + segments.filter(Boolean).join('/')
}

export const buildRepoApiUrl = route => {
  const segments = [route.ownerType, route.owner, route.repoType, route.repo]
  if(route.version)
    segments.push(route.version)

  return '/' + segments.filter(Boolean).join('/') + '/'
}

export const isSameRepoScope = (prev, next) => Boolean(prev) && Boolean(next) &&
  prev.ownerType === next.ownerType &&
  prev.owner === next.owner &&
  prev.repoType === next.repoType &&
  prev.repo === next.repo &&
  prev.version === next.version

export const hasResourcePanel = route => Boolean(route?.resource) && RESOURCE_TABS.includes(route?.tab)
