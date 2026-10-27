import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'

import { buttonFocus } from '../buttonFocus.js'

// index.jsx passes WHITE and COLORS.primary['30'] from colors.jsx, which Node can't import.
const theme = createTheme(createTheme(), {components: {MuiButton: buttonFocus({inner: '#FFF', outer: '#2d00e5'})}})
const RING = '0 0 0 2px #FFF,0 0 0 4px #2d00e5'

// Server-renders with the theme and returns the HTML, with the CSS MUI generates for it, and the first button's style class.
const render = element => {
  const html = renderToString(createElement(ThemeProvider, {theme}, element))
  const [, buttonClass] = html.match(/<button class="[^"]* (css-[\w-]+)"/)
  return {html, buttonClass}
}

// The box-shadows a button's CSS gives it under .Mui-focusVisible, in cascade order: the last one is what a keyboard-focused button shows.
const focusShadows = button => {
  const {html, buttonClass} = render(button)
  return [...html.matchAll(new RegExp(`\\.${buttonClass}\\.Mui-focusVisible\\{[^}]*?box-shadow:([^;}]*)`, 'g'))].map(([, shadow]) => shadow)
}

test('a focused contained, outlined or text button shows the two-tone ring in place of its own focus shadow', () => {
  [{variant: 'contained'}, {variant: 'contained', color: 'error'}, {variant: 'outlined'}, {variant: 'text'}].forEach(props => {
    assert.equal(focusShadows(createElement(Button, props, 'Save')).at(-1), RING, JSON.stringify(props))
  })
})

test('a focused button in a ButtonGroup keeps the ring and is drawn above its neighbors', () => {
  // A contained group sets its buttons' shadow with a selector as specific as .Mui-focusVisible, so the ring needs one more class.
  const {html, buttonClass} = render(createElement(ButtonGroup, {variant: 'contained'}, createElement(Button, null, 'Save'), createElement(Button, null, 'More')))
  assert.ok(html.includes(`.${buttonClass}.MuiButtonGroup-grouped.Mui-focusVisible{box-shadow:${RING};z-index:1;}`))
})

test('buttons have no focus ripple', () => {
  assert.equal(theme.components.MuiButton?.defaultProps?.disableFocusRipple, true)
})
