// Keyboard focus on a MUI Button (OpenConceptLab/ocl_issues#2970). MUI's focus ripple pulses the text color
// at 30% behind the label, which drops the label below 4.5:1, so buttons drop it and show a two-tone ring:
// the inner color sets the ring off from a filled button, the outer color from the page. The click ripple stays.
// Theme styleOverrides come after MUI's own styles, so the ring also replaces a contained button's focus shadow.
export const buttonFocus = ({ inner, outer }) => {
  const ring = { boxShadow: `0 0 0 2px ${inner}, 0 0 0 4px ${outer}` }
  return {
    defaultProps: {
      disableFocusRipple: true,
    },
    styleOverrides: {
      root: {
        '&.Mui-focusVisible': ring,
        // In a ButtonGroup the next button paints over the ring, and a contained group clears its buttons' shadow
        // with a selector as specific as the one above. Lift the focused button and restate the ring with one more class.
        '&.MuiButtonGroup-grouped.Mui-focusVisible': { ...ring, zIndex: 1 },
      },
    },
  }
}
