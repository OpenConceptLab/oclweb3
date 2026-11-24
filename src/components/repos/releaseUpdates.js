import { dropVersion } from '../../common/uri.js'
import { getHealthReasons } from './expansionHealth.js'

// Why a recorded repo version has a newer release, as the "New releases are available" panel says it
export const UPDATE_CASES = {
  head: 'repo.release_updates.case_head',
  retired: 'repo.release_updates.case_retired',
  unreleased: 'repo.release_updates.case_unreleased',
  newer: 'repo.release_updates.case_newer',
}

const EXPLICIT_RELATIONS = ['explicit_source_versions', 'explicit_collection_versions']
const EVALUATED_RELATIONS = ['evaluated_source_versions', 'evaluated_collection_versions']

const byURL = (expansion, relations) => {
  const versions = {}
  relations.forEach(relation => (expansion?.[relation] || []).forEach(version => {
    if(version?.version_url) versions[version.version_url] = version
  }))
  return versions
}

// HEAD's URL has no version segment: /orgs/O/sources/S/
const isHeadURL = url => Boolean(url) && (dropVersion(url) === url || url.replace(/\/$/, '').endsWith('/HEAD'))

// resolved-repo-updates gives the newest unretired release, else HEAD, so its target isn't always newer
const getCase = (oldURL, newURL, recorded) => {
  if(recorded?.version === 'HEAD' || isHeadURL(oldURL)) return 'head'
  if(recorded ? !recorded.released : isHeadURL(newURL)) return 'unreleased'
  if(recorded?.retired) return 'retired'
  return 'newer'
}

// system-version entries are url|version, the url canonical or relative
const getSystemVersionEntries = expansion => {
  const value = expansion?.parameters?.['system-version']
  return (typeof value === 'string' ? value.split(',') : []).map(entry => entry.trim()).filter(Boolean)
}

const trimSlash = url => (url || '').replace(/\/$/, '')

// a canonical URL only a URL registry maps to the repository isn't matched
const isNamedInSystemVersion = (entries, oldURL, recorded) => entries.some(entry => {
  const index = entry.lastIndexOf('|')
  // an entry can also be a repository version's own URL; a repository's bare URL resolves again
  if(index < 0) return !isHeadURL(`${trimSlash(entry)}/`) && trimSlash(entry) === trimSlash(oldURL)
  const [url, version] = [entry.slice(0, index), entry.slice(index + 1)]
  const urls = [dropVersion(oldURL), recorded?.canonical_url, recorded?.url].filter(Boolean)
  return Boolean(recorded?.version) && version === recorded.version && urls.some(candidate => trimSlash(candidate) === trimSlash(url))
})

// [{oldURL, newURL, case, pinned}] from resolved-repo-updates ({recorded URL: latest URL}), HEAD and retired first.
// pinned says what keeps it on a rebuild: a reference, system-version, or a lock-built expansion's value-set lock
export const getReleaseUpdates = (expansion, repoUpdates) => {
  const explicit = byURL(expansion, EXPLICIT_RELATIONS)
  const evaluated = byURL(expansion, EVALUATED_RELATIONS)
  const systemVersions = getSystemVersionEntries(expansion)
  // version create's lock keeps its value-set locks through a rebuild
  const keptValueSets = expansion?.built_with === 'lock' ? byURL(expansion, ['evaluated_collection_versions']) : {}
  const order = Object.keys(UPDATE_CASES)
  return Object.entries(repoUpdates || {})
    .map(([oldURL, newURL]) => {
      const recorded = evaluated[oldURL] || explicit[oldURL]
      let pinned = null
      if(explicit[oldURL] && !evaluated[oldURL]) pinned = 'reference'
      else if(isNamedInSystemVersion(systemVersions, oldURL, recorded)) pinned = 'system_version'
      else if(keptValueSets[oldURL]) pinned = 'lock'
      return {oldURL, newURL, case: getCase(oldURL, newURL, recorded), pinned}
    })
    .sort((a, b) => order.indexOf(a.case) - order.indexOf(b.case))
}

// Updates a rebuild would act on
export const getMovableUpdates = (expansion, repoUpdates) =>
  getReleaseUpdates(expansion, repoUpdates).filter(update => !update.pinned)

// The locked versions deleted since the expansion was built, from its stored health: a default expansion's only
export const getDeletedLocks = expansion => {
  if(!expansion?.default) return null
  const reason = getHealthReasons(expansion?.health).find(item => item.code === 'locked_version_deleted')
  return reason ? {count: reason.count, urls: reason.urls, hiddenCount: reason.hiddenCount} : null
}

// A released collection version is better left as it is, with a fixed version made from HEAD
export const isReleasedCollectionVersion = version => Boolean(version?.released) && version?.version !== 'HEAD' && version?.id !== 'HEAD'

// The newest other expansion of the same version, made after this one: what a Create similar produced
export const getComparableExpansion = (expansion, expansions = []) => {
  const createdAt = new Date(expansion?.created_on || 0).getTime()
  return expansions
    // one still being built has nothing to compare yet
    .filter(other => other?.url && other.url !== expansion?.url && !other.is_processing && new Date(other.created_on || 0).getTime() >= createdAt)
    .sort((a, b) => new Date(b.created_on || 0) - new Date(a.created_on || 0))[0] || null
}

// The compare page for two expansions of one collection version
export const getCompareExpansionsURL = (versionURL, expansion, other) => {
  if(!versionURL || !expansion?.url || !other?.url) return null
  const params = new URLSearchParams({
    version1: versionURL, version2: versionURL, expansion1: expansion.url, expansion2: other.url,
  })
  return `${dropVersion(versionURL)}compare-versions?${params.toString()}`
}

// Which listed expansion the compare page opens on a side: its own URL parameter, then the other's, then the default
export const pickExpansion = (expansions, preferredURLs = [], defaultURL) => {
  for(const url of [...preferredURLs, defaultURL]) {
    const match = url ? (expansions || []).find(expansion => expansion?.url === url) : null
    if(match) return match
  }
  return false
}
