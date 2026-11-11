// State for one hierarchy row's children, loaded a page at a time
export const CHILDREN_PAGE_SIZE = 25

export const initialChildrenState = {children: [], page: 0, total: 0, hasMore: false, fetched: false, loading: false, failed: false}

const childKey = child => child.version_url || child.url || child.uuid

// A child can come back on two pages if the list changes between requests
export const mergeChildren = (loaded, incoming) => {
  const seen = new Set(loaded.map(childKey))
  const added = incoming.filter(child => {
    const key = childKey(child)
    if(key && seen.has(key))
      return false
    seen.add(key)
    return true
  })
  return [...loaded, ...added]
}

export const childrenReducer = (state, action) => {
  switch(action.type) {
  case 'loading':
    return {...state, loading: true, failed: false}
  case 'loaded':
    return {
      ...state,
      loading: false,
      failed: false,
      fetched: true,
      page: action.page,
      total: action.total,
      hasMore: action.hasMore,
      children: mergeChildren(action.page === 1 ? [] : state.children, action.rows),
    }
  case 'failed':
    return {...state, loading: false, failed: true}
  default:
    return state
  }
}

export const nextChildrenPage = state => state.page + 1

export const needsFetchOnExpand = state => !state.fetched && !state.loading
