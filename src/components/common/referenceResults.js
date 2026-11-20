// An add-references response, split into what joined the collection, what the API saved
// but reports as resolved to nothing (`resolved: false`), and what failed
export const groupReferenceResults = results => {
  const list = Array.isArray(results) ? results : []
  return {
    added: list.filter(result => result.added && result.resolved !== false),
    unresolved: list.filter(result => result.added && result.resolved === false),
    failed: list.filter(result => !result.added),
  }
}
