const RESOURCE_SEGMENTS = ['concepts', 'mappings']
const REPO_SEGMENTS = ['sources', 'collections']

const hasRepoPin = reference => Boolean(reference?.version && String(reference.version).toUpperCase() !== 'HEAD')

const hasResourcePin = reference => Boolean(reference?.resource_version)

const splitExpression = expression => {
  const parts = String(expression || '').split('?')
  return {
    path: parts[0],
    query: parts.length > 1 ? parts.slice(1).join('?') : '',
  }
}

const getRelativePathParts = path => {
  const match = String(path || '').match(/^(.*?)(\/(?:orgs|users)\/.*)$/)
  if(!match)
    return null

  return {
    prefix: match[1],
    parts: match[2].split('/').filter(Boolean),
  }
}

export const buildNonVersionedReferenceExpression = reference => {
  const expression = reference?.expression
  if(!expression)
    return null

  const { path, query } = splitExpression(expression)
  const parsed = getRelativePathParts(path)
  if(!parsed)
    return null
  if(parsed.prefix)
    return null

  const parts = [...parsed.parts]
  const repoTypeIndex = parts.findIndex(part => REPO_SEGMENTS.includes(part))
  if(repoTypeIndex === -1)
    return null

  const afterRepoIndex = repoTypeIndex + 2
  if(hasRepoPin(reference) && parts[afterRepoIndex] && !RESOURCE_SEGMENTS.includes(parts[afterRepoIndex]))
    parts.splice(afterRepoIndex, 1)

  const resourceTypeIndex = parts.findIndex(part => RESOURCE_SEGMENTS.includes(part))
  const resourceVersionIndex = resourceTypeIndex + 2
  if(hasResourcePin(reference) && resourceTypeIndex !== -1 && parts[resourceVersionIndex])
    parts.splice(resourceVersionIndex, 1)

  const proposedPath = `${parsed.prefix}/${parts.join('/')}/`
  return query ? `${proposedPath}?${query}` : proposedPath
}

export const getReferenceTransformPreview = reference => {
  if(!reference?.id)
    return { reference, eligible: false, reasonKey: 'reference.unsupported_transform' }

  if(!hasRepoPin(reference) && !hasResourcePin(reference))
    return { reference, eligible: false, reasonKey: 'reference.already_non_versioned' }

  const proposedExpression = buildNonVersionedReferenceExpression(reference)
  if(!proposedExpression || proposedExpression === reference.expression)
    return { reference, eligible: false, reasonKey: 'reference.unsupported_transform' }

  return {
    reference,
    eligible: true,
    proposedExpression,
  }
}

export const getTransformPreviewItems = references => (references || []).map(getReferenceTransformPreview)

export const getTransformAddGroups = previewItems => {
  const groups = {}
  previewItems.filter(item => item.eligible).forEach(item => {
    const reference = item.reference
    const include = reference.include !== false
    const key = JSON.stringify({
      reference_type: reference.reference_type,
      include,
      cascade: reference.cascade || null,
    })
    if(!groups[key]) {
      groups[key] = {
        include,
        cascade: reference.cascade || null,
        items: [],
      }
    }
    groups[key].items.push(item)
  })
  return Object.values(groups)
}
