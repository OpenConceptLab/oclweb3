// A versioned URI ends <resource type>/<id>/<version>/, e.g. /orgs/CIEL/sources/CIEL/v1/. Its version is
// cut by position: a version's id can repeat an earlier segment, as in /orgs/CIEL/collections/C1/C1/.
export const dropVersion = uri => {
  if(!uri)
    return uri

  const parts = uri.split('/')

  if (parts.length <= 4)
    return uri

  const [resource, name, version] = parts.slice(-4, -1)
  if (['concepts', 'mappings', 'sources', 'collections'].includes(resource) && name && version)
    return parts.slice(0, -2).join('/') + '/'

  return uri

}

// A concept's or mapping's URI in the source version being browsed: /orgs/CIEL/sources/CIEL/concepts/123/ in
// /orgs/CIEL/sources/CIEL/v1/ is /orgs/CIEL/sources/CIEL/v1/concepts/123/. It stays version-less on HEAD, with no
// repo, and when the repo isn't the resource's own source.
export const toRepoVersionURI = (uri, repo) => {
  const resourceURI = dropVersion(uri)
  if(!resourceURI || !repo?.version_url || repo.version === 'HEAD')
    return resourceURI

  const repoURI = dropVersion(repo.version_url)
  return resourceURI.startsWith(repoURI) ? repo.version_url + resourceURI.slice(repoURI.length) : resourceURI
}
