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
const SHARED_REPO_TABS = ['concepts', 'mappings', 'references', 'versions', 'about']
// The only tabs TBv2 opens a resource in, and the only ones it scopes to a (versioned) expansion.
const RESOURCE_TABS = ['concepts', 'mappings']
// What TBv3 may put right after a repository. Anything else there is a version.
const REPO_KEYWORDS = [...SHARED_REPO_TABS, 'summary', 'edit', 'compare-versions', 'expansions']

export const toTBv2Path = path => {
  const segments = (path || '').split(/[?#]/)[0].split('/').filter(Boolean)
  const fullPath = '/' + segments.join('/')

  if(SHARED_ROOT_PATHS.includes(fullPath))
    return fullPath

  const [ownerType, owner, repoType, repo, ...rest] = segments

  if(!['users', 'orgs'].includes(ownerType) || !isRouteId(owner))
    return '/'

  const ownerHome = `/${ownerType}/${owner}`

  if(segments.length === 3 && SHARED_OWNER_PATHS[ownerType].includes(repoType))
    return fullPath

  if(!['sources', 'collections'].includes(repoType) || !isRouteId(repo))
    return ownerHome

  let base = `${ownerHome}/${repoType}/${repo}`
  let index = 0

  const version = rest[index] && !REPO_KEYWORDS.includes(rest[index]) ? rest[index] : ''
  if(version) {
    if(!isRouteId(version))
      return base
    base = `${base}/${version}`
    index += 1
  }

  let expansion = ''
  if(rest[index] === 'expansions') {
    expansion = rest[index + 1]
    index += 2
  }

  const tab = rest[index]
  if(!SHARED_REPO_TABS.includes(tab))
    return base

  if(!RESOURCE_TABS.includes(tab))
    return `${base}/${tab}`

  const tabPath = version && isRouteId(expansion) ? `${base}/expansions/${expansion}/${tab}` : `${base}/${tab}`
  const resource = rest[index + 1]

  return isRouteId(resource) ? `${tabPath}/${resource}` : tabPath
}
