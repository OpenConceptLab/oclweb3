import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { getContrastRatio } from '@mui/material/styles'

// colors.jsx is plain JavaScript under a .jsx name, which node won't load, so import its source.
const source = readFileSync(new URL('../colors.jsx', import.meta.url), 'utf8') // eslint-disable-line spellcheck/spell-checker
const { COLORS } = await import(`data:text/javascript,${encodeURIComponent(source)}`) // eslint-disable-line spellcheck/spell-checker

// MUI fills a hovered contained button, and a hovered or focused clickable chip, with `dark` under `contrastText`.
const FILLED_PALETTES = ['primary', 'secondary', 'tertiary', 'error']

FILLED_PALETTES.forEach(name => {
  test(`${name}.dark keeps 4.5:1 under its contrastText`, () => {
    const { dark, contrastText } = COLORS[name]
    const ratio = getContrastRatio(dark, contrastText)
    assert.ok(ratio >= 4.5, `${contrastText} on ${dark} is ${ratio.toFixed(2)}:1`)
  })
})
