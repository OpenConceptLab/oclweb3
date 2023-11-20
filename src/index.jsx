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
import { PRIMARY, PRIMARY_LIGHT, SECONDARY, WHITE, BG_GRAY, TEXT_GRAY } from './common/constants';
import './i18n/config';

const theme = createTheme();
const v5Theme = createTheme(theme, {
  palette: {
    primary: {
      main: PRIMARY,
      dark: PRIMARY,
      light: PRIMARY_LIGHT,
      contrastText: WHITE,
    },
    secondary: {
      main: SECONDARY,
      dark: SECONDARY,
      light: SECONDARY,
      contrastText: WHITE,
    },
    "default": {
      main: BG_GRAY,
      dark: BG_GRAY
    },
    success: {
      main: PRIMARY,
      dark: PRIMARY,
      light: PRIMARY_LIGHT,
      contrastText: WHITE,
    },
    info: {
      main: SECONDARY,
      dark: SECONDARY,
      light: SECONDARY,
      contrastText: WHITE,
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
      styleOverrides: {
        root: {
          background: WHITE,
        },
      },
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
