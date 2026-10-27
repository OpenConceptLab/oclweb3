import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { isReleaseOnlySearch } from '../releaseOnlySearch.js'

const LOCALES = ['en', 'es', 'pt-BR', 'zh']
const INFO_KEYS = ['release_search_tooltip', 'release_search_tooltip_label']

test('global concept and mapping searches are release-only', () => {
  assert.equal(isReleaseOnlySearch({resource: 'concepts'}), true)
  assert.equal(isReleaseOnlySearch({resource: 'mappings'}), true)
})

test('repo, org and user searches, searches inside a repo, and $match are not', () => {
  ['repos', 'orgs', 'users'].forEach(resource => assert.equal(isReleaseOnlySearch({resource}), false, resource))
  assert.equal(isReleaseOnlySearch({resource: 'concepts', nested: true}), false)
  assert.equal(isReleaseOnlySearch({resource: 'concepts', isMatch: true}), false)
})

LOCALES.forEach(locale => {
  test(`${locale} has the info icon's tooltip and label`, () => {
    const { search } = JSON.parse(readFileSync(new URL(`../../../i18n/locales/${locale}/translations.json`, import.meta.url)))
    INFO_KEYS.forEach(key => assert.ok(search[key]?.trim(), `search.${key}`))
  })
})
