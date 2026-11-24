import { dropVersion } from '../../common/uri.js'
import { getHealthReasons } from './expansionHealth.js'

// Why a recorded repo version has a newer release, as the "New releases are available" panel says it
export const UPDATE_CASES = {
  head: 'repo.release_updates.case_head',
  retired: 'repo.release_updates.case_retired',
  newer: 'repo.release_updates.case_newer',
}

const getRecordedVersions = expansion => [
  ...(expansion?.explicit_source_versions || []),
  ...(expansion?.explicit_collection_versions || []),
  ...(expansion?.evaluated_source_versions || []),
  ...(expansion?.evaluated_collection_versions || []),
]

// HEAD's URL has no version segment: /orgs/O/sources/S/
const isHeadURL = url => Boolean(url) && (dropVersion(url) === url || url.replace(/\/$/, '').endsWith('/HEAD'))

const getCase = (url, recorded) => {
  if(recorded?.version === 'HEAD' || isHeadURL(url)) return 'head'
  if(recorded?.retired) return 'retired'
  return 'newer'
}

// [{oldURL, newURL, case}] from resolved-repo-updates ({recorded URL: latest release URL}); HEAD and retired first
export const getReleaseUpdates = (expansion, repoUpdates) => {
  const recorded = {}
  getRecordedVersions(expansion).forEach(version => {
    if(version?.version_url) recorded[version.version_url] = version
  })
  const order = Object.keys(UPDATE_CASES)
  return Object.entries(repoUpdates || {})
    .map(([oldURL, newURL]) => ({oldURL, newURL, case: getCase(oldURL, recorded[oldURL])}))
    .sort((a, b) => order.indexOf(a.case) - order.indexOf(b.case))
}

// The locked versions deleted since the expansion was built, from its stored health
export const getDeletedLocks = expansion => {
  const reason = getHealthReasons(expansion?.health).find(item => item.code === 'locked_version_deleted')
  return reason ? {count: reason.count, urls: reason.urls, hiddenCount: reason.hiddenCount} : null
}

// A released collection version is better left as it is, with a fixed version made from HEAD
export const isReleasedCollectionVersion = version => Boolean(version?.released) && version?.version !== 'HEAD' && version?.id !== 'HEAD'

// The newest other expansion of the same version, made after this one: what a Create similar produced
export const getComparableExpansion = (expansion, expansions = []) => {
  const createdAt = new Date(expansion?.created_on || 0).getTime()
  return expansions
    .filter(other => other?.url && other.url !== expansion?.url && new Date(other.created_on || 0).getTime() >= createdAt)
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
