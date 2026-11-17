import { parseRepoPath } from './repoRoute.js'

const OFFICIAL_ORIGIN = /^https:\/\/app\.(v3\.)?([a-z]+\.)*openconceptlab\.org$/

// TBv3 is at app.v3.<env> and TBv2 at app.v2.<env> (OpenConceptLab/ocl_online#236); app.<env> serves one of them.
// Every one of those hosts shares its environment's API at api.<env>.
export const toAPIOrigin = origin => origin.replace(/:\/\/app\.(v[23]\.)?/, '://api.')

// A configured URL wins. Otherwise an official host links to the same environment's sibling app, and any
// other deployment has none.
const resolveSiblingURL = (configured, origin, host) => {
  const url = (configured || '').trim().replace(/\/+$/, '')
  if(url)
    return url
  if(OFFICIAL_ORIGIN.test(origin || ''))
    return origin.replace(/\/\/app\.(v3\.)?/, `//${host}.`)
  return ''
}

export const resolveMapperURL = (configured, origin) => resolveSiblingURL(configured, origin, 'map')

// app.v2.<env> rather than app.<env>, which serves TBv3 once it becomes the default Term Browser.
export const resolveTBv2URL = (configured, origin) => resolveSiblingURL(configured, origin, 'app.v2')

/*
 * TBv2 serves most TBv3 pages at the same path, so moving across is a host swap. Where TBv2 lacks the page,
 * toTBv2Path walks up to the nearest page it has: repository (or version), then owner, then home.
 */

// ID_REGEX in constants.js, which this file can't import: its tests run under plain node.
const ROUTE_ID = /^[a-zA-Z0-9._@-]+$/
const isRouteId = segment => Boolean(segment) && ROUTE_ID.test(segment)

const SHARED_ROOT_PATHS = ['/search', '/imports', '/concepts/compare', '/mappings/compare']
const SHARED_OWNER_PATHS = {users: ['settings'], orgs: ['edit']}
const TBV3_ONLY_OWNER_IDS = ['new']
const TBV3_ONLY_REPO_PAGES = ['edit', 'compare-versions']
const TBV2_REPO_TABS = {
  sources: ['concepts', 'mappings', 'versions', 'about', 'summary'],
  collections: ['concepts', 'mappings', 'references', 'versions', 'about'],
}
const TBV2_RESOURCE_TABS = ['concepts', 'mappings']

export const toTBv2Path = path => {
  const pathname = (path || '').split(/[?#]/)[0]
  const segments = pathname.split('/').filter(Boolean)
  const fullPath = '/' + segments.join('/')

  if(SHARED_ROOT_PATHS.includes(fullPath))
    return fullPath

  const [ownerType, owner, repoType, repo] = segments

  if(!['users', 'orgs'].includes(ownerType) || !isRouteId(owner) || TBV3_ONLY_OWNER_IDS.includes(owner))
    return '/'

  const ownerHome = `/${ownerType}/${owner}`

  if(segments.length === 3 && SHARED_OWNER_PATHS[ownerType].includes(repoType))
    return fullPath

  if(!['sources', 'collections'].includes(repoType) || !isRouteId(repo))
    return ownerHome

  const route = parseRepoPath(pathname)
  const repoHome = `${ownerHome}/${repoType}/${repo}`

  if(TBV3_ONLY_REPO_PAGES.includes(route.version) || (route.version && !isRouteId(route.version)))
    return repoHome

  const base = route.version ? `${repoHome}/${route.version}` : repoHome

  if(!TBV2_REPO_TABS[repoType].includes(route.tab))
    return base

  if(!TBV2_RESOURCE_TABS.includes(route.tab))
    return `${base}/${route.tab}`

  const scope = isRouteId(route.expansion) ? `${route.version ? base : `${repoHome}/HEAD`}/expansions/${route.expansion}` : base
  const tabPath = `${scope}/${route.tab}`

  return isRouteId(route.resource) ? `${tabPath}/${route.resource}` : tabPath
}
