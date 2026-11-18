import test from 'node:test'
import assert from 'node:assert/strict'

import { getRequestedConceptId, getRequestedRepoVersion } from '../conceptPanelRequest.js'

const REPO = '/orgs/MyOrg/sources/MySource/'
const OTHER_REPO = '/orgs/OtherOrg/sources/OtherSource/'
const concept = {id: '162296', url: `${REPO}concepts/162296/`, latest_source_version: 'v2'}
const olderVersion = {...concept, latest_source_version: 'v1'}
const otherConcept = {id: '9499', url: `${OTHER_REPO}concepts/9499/`, latest_source_version: '1.8'}

test('a search result opened by its version URL asks for its own id, not the one shown before', () => {
  assert.equal(getRequestedConceptId(`${OTHER_REPO}concepts/9499/5437596/`, otherConcept, concept), '9499')
})

test('an id at the end of the URL is used as it is', () => {
  assert.equal(getRequestedConceptId(`${OTHER_REPO}concepts/9499/`, undefined, concept), '9499')
  assert.equal(getRequestedConceptId(`${OTHER_REPO}concepts/A%2FB/`, undefined, concept), 'A/B')
})

test('with no selection, the concept the panel has loaded gives the id', () => {
  assert.equal(getRequestedConceptId(`${REPO}concepts/162296/14308831/`, undefined, concept), '162296')
  assert.equal(getRequestedConceptId(`${REPO}concepts/162296/14308831/`, {}, concept), '162296')
})

test('two versions of one concept each open in their own repo version', () => {
  assert.equal(getRequestedRepoVersion(REPO, olderVersion, concept), 'v1')
  assert.equal(getRequestedRepoVersion(REPO, concept, olderVersion), 'v2')
})

test('a selection in another repo opens in its own repo version', () => {
  assert.equal(getRequestedRepoVersion(OTHER_REPO, otherConcept, concept), '1.8')
})

test('the version of a concept in another repo is never used', () => {
  assert.equal(getRequestedRepoVersion(OTHER_REPO, undefined, concept), undefined)
  assert.equal(getRequestedRepoVersion(OTHER_REPO, concept, otherConcept), undefined)
})

test('with no selection, the loaded concept of the same repo gives the version', () => {
  assert.equal(getRequestedRepoVersion(REPO, undefined, concept), 'v2')
})
