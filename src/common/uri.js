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
