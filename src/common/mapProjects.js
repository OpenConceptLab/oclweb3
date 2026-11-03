export const projectCount = (...responses) => responses.reduce(
  (total, response) => total + (parseInt(response?.headers?.num_found) || 0),
  0
)

// Mapping projects are private: only their owner, members of the owning
// organization and staff can see them, so only they get the profile tab.
export const canSeeMapProjects = (currentUser, ownerType, owner) => {
  if(!currentUser?.username || !owner)
    return false
  if(currentUser.is_staff)
    return true
  if(ownerType === 'users')
    return currentUser.username === owner
  if(ownerType === 'orgs')
    return Boolean(currentUser.subscribed_orgs?.some(org => org?.id === owner))
  return false
}

const ensureOK = response => {
  if(!(response?.status >= 200 && response.status < 300))
    throw new Error('Mapping projects could not be loaded')
  return response
}

const totalOf = response => parseInt(response.headers?.num_found) || 0

// Loads one page of the projects from the given list endpoints, treating them as a single list
// (first source first). A source is (page, limit) => Promise<response>.
export const fetchProjectsPage = async (sources, page, size) => {
  if(sources.length === 1) {
    const response = ensureOK(await sources[0](page, size))
    return {projects: Array.isArray(response.data) ? response.data : [], total: totalOf(response)}
  }
  const totals = (await Promise.all(sources.map(source => source(1, 1)))).map(response => totalOf(ensureOK(response)))
  const start = (page - 1) * size
  const end = start + size
  let offset = 0
  const requests = sources.map((source, i) => {
    const from = Math.max(start, offset) - offset
    const to = Math.min(end, offset + totals[i]) - offset
    offset += totals[i]
    if(to <= from)
      return Promise.resolve([])
    const firstPage = Math.floor(from / size) + 1
    const lastPage = Math.floor((to - 1) / size) + 1
    const pages = []
    for(let n = firstPage; n <= lastPage; n++)
      pages.push(source(n, size))
    const base = (firstPage - 1) * size
    return Promise.all(pages).then(responses => responses.flatMap(response => {
      const data = ensureOK(response).data
      return Array.isArray(data) ? data : []
    }).slice(from - base, to - base))
  })
  const projects = (await Promise.all(requests)).flat()
  return {projects, total: totals.reduce((sum, count) => sum + count, 0)}
}
