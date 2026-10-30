import test from 'node:test'
import assert from 'node:assert/strict'

const { mergeProjects, projectCount } = await import('../mapProjects.js')

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
