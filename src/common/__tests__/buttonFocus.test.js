import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement, useContext } from 'react'
import { renderToString } from 'react-dom/server'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Button from '@mui/material/Button'
import ButtonGroup, { ButtonGroupContext } from '@mui/material/ButtonGroup'

import { buttonFocus } from '../buttonFocus.js'

// index.jsx passes WHITE and COLORS.primary['30'] from colors.jsx, which Node can't import.
const theme = createTheme(createTheme(), {components: buttonFocus({inner: '#FFF', outer: '#2d00e5'})})
const RING = '0 0 0 2px #FFF,0 0 0 4px #2d00e5'

// Server-renders with the theme: the HTML, with the CSS MUI generates for it.
const render = element => renderToString(createElement(ThemeProvider, {theme}, element))

// The box-shadows a button's CSS gives it under .Mui-focusVisible, in cascade order: the last one is what a keyboard-focused button shows.
const focusShadows = button => {
  const html = render(button)
  const [, buttonClass] = html.match(/<button class="[^"]* (css-[\w-]+)"/)
  return [...html.matchAll(new RegExp(`\\.${buttonClass}\\.Mui-focusVisible\\{[^}]*?box-shadow:([^;}]*)`, 'g'))].map(([, shadow]) => shadow)
}

test('a focused contained, outlined or text button shows the two-tone ring in place of its own focus shadow', () => {
  [{variant: 'contained'}, {variant: 'contained', color: 'error'}, {variant: 'outlined'}, {variant: 'text'}].forEach(props => {
    assert.equal(focusShadows(createElement(Button, props, 'Save')).at(-1), RING, JSON.stringify(props))
  })
})

test('a focused button in a ButtonGroup keeps the ring over the group\'s own button shadows and is drawn above its neighbors', () => {
  ['contained', 'outlined'].forEach(variant => {
    const html = render(createElement(ButtonGroup, {variant}, createElement(Button, null, 'Save'), createElement(Button, null, 'More')))
    const [, groupClass, groupCSS] = html.match(/<style data-emotion="css ([\w-]+-MuiButtonGroup-root)">([^<]*)/)
    // The group sets its buttons' shadow (and, when contained, clears it on hover too) under selectors at least as specific as the ring's.
    // The ring wins by coming after them in the group's own CSS.
    const grouped = `.css-${groupClass} .MuiButtonGroup-grouped`
    const ring = groupCSS.lastIndexOf(`${grouped}.Mui-focusVisible{box-shadow:${RING};z-index:1;}`)
    assert.ok(ring > -1, variant)
    assert.ok(ring > groupCSS.lastIndexOf(`${grouped}:hover{box-shadow:`) && ring > groupCSS.lastIndexOf(`${grouped}{box-shadow:`), variant)
  })
})

test('a contained link-button keeps its text color, with no underline, under Bootstrap\'s a:hover and a:focus', () => {
  // public/index.html loads Bootstrap 3, whose a:hover, a:focus (0,1,1) beats MUI's contained color (0,1,0).
  const html = render(createElement(Button, {variant: 'contained', href: '/search/'}, 'Create similar'))
  const [, linkClass] = html.match(/<a class="[^"]* (css-[\w-]+)"/)
  ;['hover', 'focus'].forEach(state => {
    const [, declarations = ''] = html.match(new RegExp(`a\\.${linkClass}\\.MuiButton-contained:${state}[^{]*\\{([^}]*)\\}`)) || []
    const style = Object.fromEntries(declarations.split(';').filter(Boolean).map(declaration => declaration.split(':')))
    assert.equal(style.color, 'var(--variant-containedColor)', state)
    assert.equal(style['text-decoration'], 'none', state)
  })
})

test('buttons have no focus ripple, in a ButtonGroup too', () => {
  assert.equal(theme.components.MuiButton?.defaultProps?.disableFocusRipple, true)
  // A Button takes a ButtonGroup's context over the theme's defaults, so the group must leave disableFocusRipple unset.
  let context
  const ReadContext = () => { context = useContext(ButtonGroupContext); return null }
  render(createElement(ButtonGroup, null, createElement(ReadContext)))
  assert.equal(context.disableFocusRipple, undefined)
})
