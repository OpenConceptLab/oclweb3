// Keyboard focus on a MUI Button (OpenConceptLab/ocl_issues#2970). MUI's focus ripple pulses the text color
// at 30% behind the label, which drops the label below 4.5:1, so buttons drop it and show a two-tone ring:
// the inner color sets the ring off from a filled button, the outer color from the page. The click ripple stays.
// Theme styleOverrides come after a component's own styles, so the ring also replaces a contained button's focus shadow.
// Returns theme components: { MuiButton, MuiButtonGroup }.
export const buttonFocus = ({ inner, outer }) => {
  const ring = { boxShadow: `0 0 0 2px ${inner}, 0 0 0 4px ${outer}` }
  return {
    MuiButton: {
      defaultProps: {
        disableFocusRipple: true,
      },
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': ring,
        },
      },
    },
    // A ButtonGroup sets its buttons' shadow (and, when contained, clears it on hover too), and the next button paints over
    // the ring. Restate the ring in the group's own overrides, which come after those, and lift the focused button.
    MuiButtonGroup: {
      styleOverrides: {
        grouped: {
          '&.Mui-focusVisible': { ...ring, zIndex: 1 },
        },
      },
    },
  }
}
