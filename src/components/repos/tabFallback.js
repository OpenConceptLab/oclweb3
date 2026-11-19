import { isSameRepoScope } from '../../common/repoRoute.js'

// The tab to fall back to when the selected one is not among the repo's tabs, or null when it should stay.
// `tabs` is built from the loaded version (About only exists for a version with content), so the decision waits
// until the repo in state is the one the route points at: opening a release while HEAD is still loaded would
// otherwise drop /<release>/about before the release arrives.
export const getFallbackTab = ({ tabs, tab, route, repoRoute }) => {
  if(!isSameRepoScope(repoRoute, route) || !tabs?.length || !tab || tabs.some(item => item.key === tab))
    return null
  return tabs[0].key
}
