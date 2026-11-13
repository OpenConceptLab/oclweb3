// A version's seed for display: HEAD, the version id it was seeded from, or the import that seeded it.
export const getSeededFromLabel = (seededFrom, t) => {
  if(!seededFrom?.type)
    return undefined
  if(seededFrom.type === 'import')
    return t('repo.seeded_from_import')
  if(seededFrom.type === 'repo_version' && seededFrom.url)
    return seededFrom.url.replace(/\/+$/, '').split('/').pop()
  return undefined
}
