import test from 'node:test'
import assert from 'node:assert/strict'

const {
  shouldAskForExpansion, shouldShowAutoexpand, getExpansionChoices, getDefaultExpansion, getExpansionPayload
} = await import('../versionExpansion.js')

const create = {edit: false, isCollection: true}
const head = '/orgs/MyOrg/collections/MyCollection/HEAD/expansions/autoexpand-HEAD/'

test('with the lock toggle off, creating a version keeps the autoexpand checkbox and asks nothing', () => {
  const args = {...create, lockToggle: false, headExpansionURL: head}
  assert.equal(shouldAskForExpansion(args), false)
  assert.equal(shouldShowAutoexpand(args), true)
  assert.deepEqual(getExpansionPayload(undefined), {})
})

test('with the lock toggle on and no HEAD expansion, the choices are latest and none, latest first', () => {
  const args = {...create, lockToggle: true, headExpansionURL: null}
  assert.equal(shouldAskForExpansion(args), true)
  assert.equal(shouldShowAutoexpand(args), false)
  assert.deepEqual(getExpansionChoices(args), ['latest', 'none'])
  assert.equal(getDefaultExpansion(args), 'latest')
})

test('with the lock toggle on and a HEAD expansion, lock is offered and is the default', () => {
  const args = {...create, lockToggle: true, headExpansionURL: head}
  assert.deepEqual(getExpansionChoices(args), ['lock', 'latest', 'none'])
  assert.equal(getDefaultExpansion(args), 'lock')
})

test('editing a version asks nothing and shows the checkbox, whatever the toggle', () => {
  for(const lockToggle of [true, false]) {
    const args = {edit: true, isCollection: true, lockToggle, headExpansionURL: head}
    assert.equal(shouldAskForExpansion(args), false)
    assert.equal(shouldShowAutoexpand(args), true)
  }
})

test('source versions get neither the popup nor the checkbox', () => {
  const args = {edit: false, isCollection: false, lockToggle: true, headExpansionURL: head}
  assert.equal(shouldAskForExpansion(args), false)
  assert.equal(shouldShowAutoexpand(args), false)
})

test('each choice maps to its expansion and autoexpand pair', () => {
  assert.deepEqual(getExpansionPayload('lock'), {expansion: 'lock', autoexpand: true})
  assert.deepEqual(getExpansionPayload('latest'), {expansion: 'latest', autoexpand: true})
  assert.deepEqual(getExpansionPayload('none'), {expansion: 'none', autoexpand: false})
})
