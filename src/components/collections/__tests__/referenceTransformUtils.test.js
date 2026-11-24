import test from 'node:test'
import assert from 'node:assert/strict'

const { getTransformOutcome, getReferenceTransformPreview } = await import('../referenceTransformUtils.js')

const items = [
  { proposedExpression: '/orgs/O/sources/S/concepts/1/', reference: { id: 11 } },
  { proposedExpression: '/orgs/O/sources/S/concepts/2/', reference: { id: 12 } },
  { proposedExpression: '/orgs/O/sources/S/concepts/3/', reference: { id: 13 } },
]

test('only replacements that joined the collection count as transformed', () => {
  const response = {
    status: 200,
    data: [
      { added: true, expression: '/orgs/O/sources/S/concepts/1/' },
      { added: true, resolved: false, expression: '/orgs/O/sources/S/concepts/2/' },
      { added: false, expression: '/orgs/O/sources/S/concepts/3/' },
    ]
  }

  assert.deepEqual(getTransformOutcome(response, items), {
    addedItems: [items[0]],
    unresolvedExpressions: ['/orgs/O/sources/S/concepts/2/'],
  })
})

test('a failed request transforms nothing', () => {
  assert.deepEqual(getTransformOutcome({ status: 400 }, items), { addedItems: [], unresolvedExpressions: [] })
})

test('a success without a result list keeps the previous behaviour', () => {
  assert.deepEqual(getTransformOutcome({ status: 201 }, items), { addedItems: items, unresolvedExpressions: [] })
})

test('a resource-versioned reference is left to the server-side conversion', () => {
  const reference = {
    id: 21, expression: '/orgs/O/sources/S/concepts/1/7/', resource_version: '7',
  }

  assert.deepEqual(getReferenceTransformPreview(reference), {
    reference, eligible: false, reasonKey: 'reference.use_convert_resource_versioned',
  })
})

test('a repo-versioned reference is still transformed here', () => {
  const reference = { id: 22, expression: '/orgs/O/sources/S/v1/concepts/1/', version: 'v1' }

  assert.equal(getReferenceTransformPreview(reference).proposedExpression, '/orgs/O/sources/S/concepts/1/')
})
