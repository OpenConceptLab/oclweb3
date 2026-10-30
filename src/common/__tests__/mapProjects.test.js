import test from 'node:test'
import assert from 'node:assert/strict'

const { mergeProjects, projectCount, canSeeMapProjects, filterProjects, fetchAllPages } = await import('../mapProjects.js')

test('mergeProjects combines user and organization projects without duplicates', () => {
  const merged = mergeProjects(
    [{url: '/users/a/map-projects/1/'}, {url: '/users/a/map-projects/2/'}],
    [{url: '/orgs/o/map-projects/3/'}, {url: '/users/a/map-projects/2/'}]
  )
  assert.deepEqual(merged.map(p => p.url), ['/users/a/map-projects/1/', '/users/a/map-projects/2/', '/orgs/o/map-projects/3/'])
})

test('projectCount sums num_found across user and organization lists', () => {
  assert.equal(projectCount({headers: {num_found: '4'}}, {headers: {num_found: '3'}}), 7)
  assert.equal(projectCount({headers: {}}, undefined), 0)
})

test('canSeeMapProjects shows a user their own projects, not anyone else\'s', () => {
  const member = {username: 'member', subscribed_orgs: [{id: 'CIEL'}]}
  assert.equal(canSeeMapProjects(member, 'users', 'member'), true)
  assert.equal(canSeeMapProjects(member, 'users', 'stranger'), false)
})

test('canSeeMapProjects shows an organization\'s projects to its members only', () => {
  const member = {username: 'member', subscribed_orgs: [{id: 'CIEL'}]}
  assert.equal(canSeeMapProjects(member, 'orgs', 'CIEL'), true)
  assert.equal(canSeeMapProjects(member, 'orgs', 'WHO'), false)
  assert.equal(canSeeMapProjects({username: 'member'}, 'orgs', 'CIEL'), false)
})

test('canSeeMapProjects shows staff every profile\'s projects', () => {
  const staff = {username: 'admin', is_staff: true}
  assert.equal(canSeeMapProjects(staff, 'users', 'stranger'), true)
  assert.equal(canSeeMapProjects(staff, 'orgs', 'WHO'), true)
})

test('canSeeMapProjects hides projects when signed out', () => {
  assert.equal(canSeeMapProjects(null, 'users', 'member'), false)
  assert.equal(canSeeMapProjects({}, 'orgs', 'CIEL'), false)
})

test('filterProjects matches name or ID, ignoring case and spaces around the term', () => {
  const projects = [{id: 181, name: 'Malaria labs'}, {id: 182, name: 'Kenya HIV'}, {id: 1818, name: 'Other'}]
  assert.deepEqual(filterProjects(projects, ' malaria ').map(p => p.id), [181])
  assert.deepEqual(filterProjects(projects, '181').map(p => p.id), [181, 1818])
  assert.equal(filterProjects(projects, ''), projects)
  assert.equal(filterProjects(null, 'x'), null)
})

const page = (data, next) => ({status: 200, data, headers: next ? {next: 'yes'} : {}})

test('fetchAllPages loads every page until there is no next one', async () => {
  const pages = {1: page([{url: 'a'}], true), 2: page([{url: 'b'}], true), 3: page([{url: 'c'}])}
  const all = await fetchAllPages(n => Promise.resolve(pages[n]), 20)
  assert.deepEqual(all.map(p => p.url), ['a', 'b', 'c'])
})

test('fetchAllPages rejects when any page fails, so a partial list never looks complete', async () => {
  // APIService resolves a failed request with the error body, not a response
  const pages = {1: page([{url: 'a'}], true), 2: {detail: 'Server error'}}
  await assert.rejects(fetchAllPages(n => Promise.resolve(pages[n]), 20))
  await assert.rejects(fetchAllPages(() => Promise.resolve(undefined), 20))
})

test('fetchAllPages stops at maxPages', async () => {
  const requested = []
  const all = await fetchAllPages(n => { requested.push(n); return Promise.resolve(page([{url: String(n)}], true)) }, 2)
  assert.deepEqual(requested, [1, 2])
  assert.equal(all.length, 2)
})
