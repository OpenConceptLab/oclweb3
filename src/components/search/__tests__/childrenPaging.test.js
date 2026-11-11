import test from 'node:test'
import assert from 'node:assert/strict'

const {
  CHILDREN_PAGE_SIZE, initialChildrenState, childrenReducer, mergeChildren, needsFetchOnExpand, nextChildrenPage
} = await import('../childrenPaging.js')

const rows = (from, count) => Array.from({length: count}, (_, i) => ({url: `/concepts/c${from + i}/`}))
const load = (state, page, pageRows, total, hasMore = false) =>
  childrenReducer(childrenReducer(state, {type: 'loading'}), {type: 'loaded', page, rows: pageRows, total, hasMore})
const fail = state => childrenReducer(childrenReducer(state, {type: 'loading'}), {type: 'failed'})

test('page 2 is appended after page 1', () => {
  const firstPage = load(initialChildrenState, 1, rows(0, CHILDREN_PAGE_SIZE), 30, true)
  assert.equal(firstPage.children.length, CHILDREN_PAGE_SIZE)
  assert.equal(firstPage.hasMore, true)
  assert.equal(nextChildrenPage(firstPage), 2)

  const secondPage = load(firstPage, 2, rows(CHILDREN_PAGE_SIZE, 5), 30)
  assert.deepEqual(secondPage.children.map(child => child.url), rows(0, 30).map(child => child.url))
  assert.equal(secondPage.hasMore, false)
})

test('a failed page keeps what is loaded and retrying asks for the same page once', () => {
  const firstPage = load(initialChildrenState, 1, rows(0, CHILDREN_PAGE_SIZE), 30)
  const failed = fail(firstPage)
  assert.equal(failed.failed, true)
  assert.equal(failed.children.length, CHILDREN_PAGE_SIZE)
  assert.equal(nextChildrenPage(failed), 2)

  const retried = load(failed, nextChildrenPage(failed), rows(CHILDREN_PAGE_SIZE, 5), 30)
  assert.equal(retried.failed, false)
  assert.equal(retried.children.length, 30)
  assert.equal(new Set(retried.children.map(child => child.url)).size, 30)
})

test('collapsing and expanding again does not refetch loaded children', () => {
  assert.equal(needsFetchOnExpand(initialChildrenState), true)
  const loaded = load(initialChildrenState, 1, rows(0, 3), 3)
  assert.equal(needsFetchOnExpand(loaded), false)
})

test('expanding again retries a first page that failed, but not one still loading', () => {
  assert.equal(needsFetchOnExpand(fail(initialChildrenState)), true)
  assert.equal(needsFetchOnExpand(childrenReducer(initialChildrenState, {type: 'loading'})), false)
})

test('a child returned on two pages is shown once and Show more still ends', () => {
  const firstPage = load(initialChildrenState, 1, rows(0, CHILDREN_PAGE_SIZE), 30)
  const secondPage = load(firstPage, 2, rows(CHILDREN_PAGE_SIZE - 1, 5), 30)
  assert.equal(secondPage.children.length, 29)
  assert.equal(new Set(secondPage.children.map(child => child.url)).size, 29)
  assert.equal(secondPage.hasMore, false)
})

test('Show more follows the API even when it serves fewer rows than asked', () => {
  const firstPage = load(initialChildrenState, 1, rows(0, 10), 40, true)
  const secondPage = load(firstPage, 2, rows(10, 10), 40, true)
  assert.equal(secondPage.hasMore, true)
  assert.equal(nextChildrenPage(secondPage), 3)
})

test('mergeChildren keeps a versioned child apart from another version of it', () => {
  const merged = mergeChildren([{version_url: '/concepts/a/1/', url: '/concepts/a/'}], [{version_url: '/concepts/a/2/', url: '/concepts/a/'}])
  assert.equal(merged.length, 2)
})
