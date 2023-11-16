import React from 'react';
import { useTranslation } from "react-i18next";
import { ListItemButton, Button } from '@mui/material'
import LanguageIcon from '@mui/icons-material/Language';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import PopperGrow from '../common/PopperGrow';

const Languages = props => {
  const { i18n } = useTranslation();
  const [locale, setLocale] = React.useState(i18n.language || 'en')
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef(null);
  const handleClick = _lang => {
    setLocale(_lang)
    i18n.changeLanguage(_lang)
    setOpen(false)
  };
  const toggleMenu = () => setOpen(!open)

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target))
      return;

    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button startIcon={<LanguageIcon fontSize='inherit'/>} endIcon={<DownIcon fontSize='inherit' />} onClick={toggleMenu} ref={anchorRef} color='inherit' {...props}>
        {locale.toUpperCase()}
      </Button>
      <PopperGrow open={open} anchorRef={anchorRef} handleClose={handleClose} minWidth="100px">
        <div>
          {
            [{locale: 'en', name: 'English'}, {locale: 'es', name: "Español"}].map(lang => (
              <ListItemButton selected={lang.locale === locale} key={lang.locale} onClick={() => handleClick(lang.locale)}>
                {lang.name} - {lang.locale.toUpperCase()}
              </ListItemButton>
            ))
          }
        </div>
      </PopperGrow>
    </React.Fragment>
  );
}

export default Languages;
