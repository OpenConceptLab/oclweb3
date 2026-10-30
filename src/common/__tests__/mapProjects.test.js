import test from 'node:test'
import assert from 'node:assert/strict'

const { mergeProjects, projectCount, canSeeMapProjects, filterProjects } = await import('../mapProjects.js')

test('mergeProjects combines user and organization projects without duplicates', () => {
  const merged = mergeProjects(
    [{url: '/users/a/map-projects/1/'}, {url: '/users/a/map-projects/2/'}],
    [{url: '/orgs/o/map-projects/3/'}, {url: '/users/a/map-projects/2/'}]
  )
  assert.deepEqual(merged.map(p => p.url), ['/users/a/map-projects/1/', '/users/a/map-projects/2/', '/orgs/o/map-projects/3/'])
})

test('mergeProjects ignores failed or non-list responses', () => {
  assert.deepEqual(mergeProjects(undefined, null, {}, [{url: 'x'}]), [{url: 'x'}])
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
