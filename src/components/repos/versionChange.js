// Where picking a version takes a repo page. HEAD is named in the route only when the pick reloads.
// RepoHome loads the repo again only when the route's version changes, so `reloads` is false for a pick
// that just switches the tab, and nothing must wait on a reload then.
export const getVersionChange = (route, version, {reload = true, tab = null} = {}) => {
  const versionId = version?.version || version?.id || ''
  const nextVersion = versionId === 'HEAD' ? (reload ? 'HEAD' : '') : versionId
  return {version: nextVersion, tab: tab || route.tab || 'concepts', reloads: nextVersion !== route.version}
}
