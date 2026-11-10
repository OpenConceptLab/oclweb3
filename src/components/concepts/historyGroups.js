// Groups a concept's or mapping's versions under the repo versions of its own source, for the History tab.
// The API leaves HEAD out of a version's source_versions, and a repo version list can be a single page, of
// another repo, or missing HEAD, so nothing here relies on the list being complete or on where HEAD sits in it.

const HEAD = 'HEAD'

// /orgs/CIEL/sources/CIEL/concepts/1/2/ and /orgs/CIEL/sources/CIEL/v1/ both belong to /orgs/CIEL/sources/CIEL/
const repoOf = uri => uri.split('/').slice(0, 5).join('/') + '/'

export const createdOn = repoVersion => repoVersion?.created_on || repoVersion?.created_at

const timeOf = date => (date ? Date.parse(date) : NaN)

export const isHead = repoVersion => (repoVersion?.version || repoVersion?.id) === HEAD

// A repo version known only by its URL, e.g. /orgs/CIEL/sources/CIEL/v1/
export const toRepoVersion = uri => {
  const [ownerType, owner, type, id, version] = uri.split('/').filter(Boolean)
  return {
    ownerType,
    owner,
    type: type === 'sources' ? 'Source Version' : (type === 'collections' ? 'Collection Version' : type),
    id,
    version,
    uri,
    version_url: uri
  }
}

// Repo versions newest first, HEAD at the top, each with the resource versions listed under it:
// - a version goes under the newest repo version that contains it;
// - the latest version, if no repo version contains it, goes under HEAD;
// - an earlier version no repo version contains goes under the first repo version created after it, else HEAD.
// Repo versions with nothing under them are left out.
export const groupVersionsByRepoVersion = (versions, repoVersions) => {
  if(!versions?.length)
    return []

  const repoURI = repoOf(versions[0].version_url)
  const known = (repoVersions || []).filter(repoVersion => repoVersion?.version_url && repoOf(repoVersion.version_url) === repoURI)
  const head = known.find(isHead) || {...toRepoVersion(repoURI), version: HEAD}
  const byURL = new Map(known.map(repoVersion => [repoVersion.version_url, repoVersion]))
  byURL.set(head.version_url, head)
  const datedOldestFirst = known
    .filter(repoVersion => !isHead(repoVersion) && !isNaN(timeOf(createdOn(repoVersion))))
    .sort((a, b) => timeOf(createdOn(a)) - timeOf(createdOn(b)))

  // the API lists source_versions oldest first, so that order stands in for dates the list doesn't have
  const newestOf = urls => {
    const times = urls.map(url => timeOf(createdOn(byURL.get(url))))
    return times.some(isNaN) ? urls[urls.length - 1] : urls[times.indexOf(Math.max(...times))]
  }

  const groups = new Map()
  const add = (uri, version) => {
    if(!groups.has(uri))
      groups.set(uri, {...(byURL.get(uri) || toRepoVersion(uri)), resourceVersions: []})
    groups.get(uri).resourceVersions.push(version)
  }

  versions.forEach(version => {
    const containing = version.source_versions || []
    if(containing.length)
      add(newestOf(containing), version)
    else if(version.is_latest_version)
      add(head.version_url, version)
    else {
      const versionCreatedAt = timeOf(version.version_created_on)
      const next = datedOldestFirst.find(repoVersion => timeOf(createdOn(repoVersion)) > versionCreatedAt)
      add((next || head).version_url, version)
    }
  })

  const newestFirst = resourceVersions => [...resourceVersions].sort(
    (a, b) => timeOf(b.version_created_on) - timeOf(a.version_created_on)
  )
  const sortTime = group => {
    const time = timeOf(createdOn(group))
    return isNaN(time) ? Math.max(...group.resourceVersions.map(version => timeOf(version.version_created_on))) : time
  }
  return [...groups.values()]
    .map(group => ({...group, resourceVersions: newestFirst(group.resourceVersions)}))
    .sort((a, b) => (Number(isHead(b)) - Number(isHead(a))) || (sortTime(b) - sortTime(a)))
}
