import React from 'react';
import { createRoot } from 'react-dom/client';
import Fade from '@mui/material/Fade';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider, StyledEngineProvider, createTheme, alpha } from '@mui/material/styles';
import StylesProvider from '@mui/styles/StylesProvider';
import App from './components/app/App';
import LayoutContext from './components/app/LayoutContext';
import './index.scss';
import { PRIMARY, SECONDARY, WHITE, BG_GRAY, TEXT_GRAY, PRIMARY_DARK, SECONDARY_DARK, TERTIARY, TERTIARY_DARK, ERROR, ERROR_DARK, SURFACE, PRIMARY_95, PRIMARY_80, PRIMARY_90, SURFACE_DARK, SURFACE_LIGHT, LIGHT_GRAY, SECONDARY_50, NV_80, N_92, S_90, VERY_LIGH_GRAY } from './common/constants';
import './i18n/config';

const theme = createTheme();
const v5Theme = createTheme(theme, {
  palette: {
    primary: {
      main: PRIMARY,
      light: PRIMARY,
      dark: PRIMARY_DARK,
      "95": PRIMARY_95,
      "90": PRIMARY_90,
      "80": PRIMARY_80,
      contrastText: WHITE,
    },
    secondary: {
      main: SECONDARY,
      light: SECONDARY,
      dark: SECONDARY_DARK,
      contrastText: WHITE,
      s50: SECONDARY_50,
    },
    tertiary: {
      main: TERTIARY,
      light: TERTIARY,
      dark: TERTIARY_DARK,
      contrastText: WHITE,
    },
    "default": {
      main: BG_GRAY,
      dark: BG_GRAY,
      light: VERY_LIGH_GRAY
    },
    error: {
      main: ERROR,
      light: ERROR,
      dark: ERROR_DARK,
      contrastText: WHITE,
    },
    success: {
      main: PRIMARY,
      dark: PRIMARY_DARK,
      light: PRIMARY,
      contrastText: WHITE,
    },
    info: {
      main: SECONDARY,
      dark: SECONDARY,
      light: SECONDARY,
      contrastText: WHITE,
    },
    surface: {
      main: SURFACE,
      light: SURFACE_LIGHT,
      dark: SURFACE_DARK,
      n90: LIGHT_GRAY,
      n92: N_92,
      contrastText: TEXT_GRAY,
      nv80: NV_80,
      s90: S_90
    }
  },
  components: {
    MuiTooltip: {
      defaultProps: {
        arrow: true,
        leaveDelay: 300,
        TransitionComponent: Fade,
        TransitionProps: { timeout: 300 }
      }
    },
    MuiTextField: {
      defaultProps: {
        size: 'small'
      },
      styleOverrides: {
        root: {
          background: WHITE,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: TEXT_GRAY
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: TEXT_GRAY
        }
      }
    },
    MuiButton: {
      variants: [
        {
          props: { variant: "contained", color: BG_GRAY },
          style: {
            color: theme.palette.getContrastText(BG_GRAY)
          }
        },
        {
          props: { variant: "outlined", color: BG_GRAY },
          style: {
            color: theme.palette.text.primary,
            borderColor:
                    theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.23)"
                    : "rgba(255, 255, 255, 0.23)",
            "&.Mui-disabled": {
              border: `1px solid ${theme.palette.action.disabledBackground}`
            },
            "&:hover": {
              borderColor:
                      theme.palette.mode === "light"
                      ? "rgba(0, 0, 0, 0.23)"
                      : "rgba(255, 255, 255, 0.23)",
              backgroundColor: alpha(
                theme.palette.text.primary,
                theme.palette.action.hoverOpacity
              )
            }
          }
        },
        {
          props: { color: TEXT_GRAY, variant: "text" },
          style: {
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: alpha(
                theme.palette.text.primary,
                theme.palette.action.hoverOpacity
              )
            }
          }
        }
      ]
    }
  }
})


const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <HashRouter>
    <StylesProvider injectFirst>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={v5Theme}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <LayoutContext subPages ={(<App />)} />
          </LocalizationProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </StylesProvider>
  </HashRouter>
);
