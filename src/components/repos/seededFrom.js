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

// The version details row for a seed, or undefined to leave the row out: with no value, the dialog
// would fall back to the raw seed object, which React can't render.
export const getSeededFromAttribute = (seededFrom, label, t) => {
  const value = getSeededFromLabel(seededFrom, t)
  return value ? { label, value } : undefined
}
