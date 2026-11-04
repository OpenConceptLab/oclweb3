import { isSameRepoScope } from '../../common/repoRoute.js'

// Whether a repo page's concept, mapping or reference panel may load. A panel builds its requests from the repo
// it's given and loads once per URL, so opening it on the repo the previous route left in state asks that version
// and keeps showing its answer. Back and Forward leave that repo in state until the route's own has loaded.
export const isPanelReady = ({route, repoRoute, versionPending, expansionRequired, expansionURL}) =>
  !versionPending && isSameRepoScope(repoRoute, route) && (!expansionRequired || Boolean(expansionURL))
