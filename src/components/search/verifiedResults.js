// Verified in search (ocl_issues#3028). Verified belongs to a repo version, so a result names the version it
// applies to (the repository's latest released version) and links to that version's Verification section.

export const VERIFIED_FACET = 'verified'

const isTrue = value => value === true || value === 'true'

// The facet counts both 'true' and 'false'; the filter offers one choice, Verified
export const getVerifiedFacetValues = values => (Array.isArray(values) ? values.filter(value => isTrue(value?.[0])) : [])

// An owner's Repositories tab with the Verified filter on, where its summary's verified count links
export const getVerifiedReposURL = ownerURL => `${ownerURL}repos?filters=${encodeURIComponent(JSON.stringify({[VERIFIED_FACET]: 'true'}))}`

// A result row whose repo version is verified: a repository's latest release, or the one a concept is in
export const isVerifiedResult = item => isTrue(item?.verified)

// The version a repository result is verified for, and the link to its Verification section; null when it isn't
export const getVerifiedVersion = item => {
  const version = typeof item?.latest_released_version === 'string' ? item.latest_released_version.trim() : ''
  if(!isTrue(item?.verified) || !version || typeof item?.url !== 'string' || !item.url)
    return null
  const repoURL = item.url.endsWith('/') ? item.url : `${item.url}/`
  return { version, to: `${repoURL}${encodeURIComponent(version)}/about#verification` }
}
