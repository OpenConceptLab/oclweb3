import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const i18next = (await import('i18next')).default
const { getKeptReferencesLabel } = await import('../referenceTransformUtils.js')
const { UNESCAPED } = await import('../referenceConversionUtils.js')

const LOCALES = ['en', 'es', 'pt-BR', 'zh']
const items = [
  { proposedExpression: '/orgs/O/sources/S/concepts/1/', reference: { id: 11, expression: '/orgs/O/sources/S/v1/concepts/1/' } },
  { proposedExpression: '/orgs/O/sources/S/concepts/2/', reference: { id: 12, expression: '/orgs/O/sources/S/v1/concepts/2/' } },
  { proposedExpression: '/orgs/O/sources/S/concepts/3/', reference: { id: 13, expression: '/orgs/O/sources/S/v1/concepts/3/' } },
]

const translator = async locale => {
  const translations = JSON.parse(
    readFileSync(new URL(`../../../i18n/locales/${locale}/translations.json`, import.meta.url)).toString())
  const i18n = i18next.createInstance()
  await i18n.init({ lng: locale, resources: { [locale]: { translation: translations } } })
  return i18n
}

test('the kept references are the originals of the replacements that resolved to nothing', () => {
  assert.equal(
    getKeptReferencesLabel(items, ['/orgs/O/sources/S/concepts/1/', '/orgs/O/sources/S/concepts/3/']),
    '/orgs/O/sources/S/v1/concepts/1/, /orgs/O/sources/S/v1/concepts/3/'
  )
  assert.equal(getKeptReferencesLabel(items, []), '')
  assert.equal(getKeptReferencesLabel(undefined, undefined), '')
})

test('a long kept list names the first five, then how many more, in each language', async () => {
  const many = Array.from({ length: 8 }, (_, index) => ({
    proposedExpression: `/orgs/O/sources/S/concepts/${index}/`,
    reference: { id: index, expression: `/orgs/O/sources/S/v1/concepts/${index}/` },
  }))
  const unresolved = many.map(item => item.proposedExpression)
  const shown = many.slice(0, 5).map(item => item.reference.expression).join(', ')
  for(const locale of LOCALES) {
    const i18n = await translator(locale)
    const t = i18n.t.bind(i18n)
    const label = getKeptReferencesLabel(many, unresolved, t)
    assert.ok(label.startsWith(shown), `${locale}: ${label}`)
    assert.ok(label.includes('3'), `${locale}: ${label}`)
    assert.equal(label.includes(many[5].reference.expression), false, `${locale}: ${label}`)
    assert.ok(!label.includes('{{'), `${locale}: ${label}`)
    assert.equal(getKeptReferencesLabel(many.slice(0, 5), unresolved, t), shown)
    if(locale === 'en')
      assert.equal(label, `${shown} and 3 more`)
  }
})

test('both Transform alerts name the kept references, slashes intact, in each language', async () => {
  const references = getKeptReferencesLabel(items, ['/orgs/O/sources/S/concepts/2/'])
  for(const locale of LOCALES) {
    const i18n = await translator(locale)
    const noneResolved = i18n.t('reference.transform_none_resolved', { count: 1, references, ...UNESCAPED })
    const partial = i18n.t(
      'reference.transform_partial_unresolved', { transformed: 2, failed: 1, unresolved: 1, references, ...UNESCAPED })
    assert.ok(noneResolved.includes(references), `${locale}: ${noneResolved}`)
    assert.ok(partial.includes(references), `${locale}: ${partial}`)
  }
})

test('the summary says a reference the parameters exclude added nothing, not that it resolved to nothing', async () => {
  for(const locale of LOCALES) {
    const i18n = await translator(locale)
    const summary = i18n.t('addToCollection.unresolved_count', { count: 1 })
    assert.ok(summary.startsWith('1'), `${locale}: ${summary}`)
    assert.equal(summary.includes('resolved to nothing'), false, `${locale}: ${summary}`)
  }
  assert.equal((await translator('en')).t('addToCollection.unresolved_count', { count: 2 }), '2 saved but added nothing')
})
