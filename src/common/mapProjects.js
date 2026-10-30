export const mergeProjects = (...lists) => {
  const byUrl = new Map()
  lists.forEach(list => {
    if(Array.isArray(list))
      list.forEach(project => { if(!byUrl.has(project.url)) byUrl.set(project.url, project) })
  })
  return [...byUrl.values()]
}

export const projectCount = (...responses) => responses.reduce(
  (total, response) => total + (parseInt(response?.headers?.num_found) || 0),
  0
)
