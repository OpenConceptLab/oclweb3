// APIService sends INCLUDESEARCHLATEST on every request, and the API applies it to global searches of
// source content: these return only what is in each source's latest release, so a source with no
// release never appears. Repo, org and user searches, searches inside a repo, and $match (which
// searches its target repo) aren't affected.
const RELEASE_ONLY_RESOURCES = ['concepts', 'mappings']

export const isReleaseOnlySearch = ({nested, resource, isMatch}) =>
  !nested && !isMatch && RELEASE_ONLY_RESOURCES.includes(resource)
