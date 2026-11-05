import { isSameRepoScope } from '../../common/repoRoute.js'

// A panel builds its requests from the repo it's given and loads once per URL. Back and Forward leave the previous
// route's repo in state until the route's own has loaded, and a panel opened on it would ask that version and keep the answer.
export const isPanelReady = ({route, repoRoute, versionPending, expansionRequired, expansionURL}) =>
  !versionPending && isSameRepoScope(repoRoute, route) && (!expansionRequired || Boolean(expansionURL))
