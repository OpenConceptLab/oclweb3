import React from 'react'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import CopyIcon from '@mui/icons-material/ContentCopy';
import { groupBy, forEach, has, compact, without, keys, orderBy, map } from 'lodash'

const borderColor = 'rgba(0, 0, 0, 0.12)'

const LocaleItem = ({ locale }) => {
  const externalID = (locale?.external_id && locale.external_id.toLowerCase() !== 'none') ? locale.external_id : undefined
  return (
    <React.Fragment>
      <ListItem
        sx={{color: 'surface.contrastText', p: 0 }}
        secondaryAction={
          <IconButton edge="end" aria-label="copy" sx={{color: 'surface.contrastText'}}>
            <CopyIcon />
          </IconButton>
        }
      >
        <ListItemText primary={locale.name || locale.description} secondary={externalID} />
      </ListItem>
      <Divider component="li" />
    </React.Fragment>
  )
}


const LocaleList = ({lang, locales}) => {
  return (
    <React.Fragment key={lang}>
      <ListItem sx={{color: 'surface.contrastText'}}>
        <ListItemAvatar sx={{color: 'surface.contrastText'}}>
          {lang.toUpperCase()}
        </ListItemAvatar>
        <List
          dense
          sx={{
            p: 0,
            width: '100%',
            '.MuiDivider-root:last-child': {display: 'none'},
            '.MuiListItemText-secondary': {fontSize: '0.675rem'},
          }}
        >
          {
            locales.map(
              locale => <LocaleItem key={locale.uuid} locale={locale} />
            )
          }
        </List>
      </ListItem>
      <Divider component="li" />
    </React.Fragment>
  )

}

const Locales = ({ locales, title, repo }) => {
  const groupLocales = (locales, repo) => {
    const groupedByRepo = {defaultLocales: {}, supportedLocales: {}, rest: {}}
    const grouped = groupBy(locales, 'locale')
    const supportedLocales = repo?.supported_locales || []

    if(grouped[repo.default_locale])
      groupedByRepo.defaultLocales[repo.default_locale] = grouped[repo.default_locale]

    forEach(supportedLocales, locale => {
      if(locale !== repo.default_locale && has(grouped, locale))
        groupedByRepo.supportedLocales[locale] = grouped[locale]
    })

    forEach(
      without(keys(grouped), ...compact([repo?.default_locale, ...supportedLocales])),
      locale => {
        if(has(grouped, locale))
          groupedByRepo.rest[locale] = grouped[locale]
      }
    )

    return groupedByRepo
  }

  const grouped = groupLocales(locales, repo)
  const getOrdered = _locales => orderBy(_locales, ['locale_preferred', 'name_type', 'description_type', 'name'], ['desc', 'asc', 'asc'])

  return (
    <Paper className='col-xs-12 padding-0' sx={{boxShadow: 'none', border: '1px solid', borderColor: borderColor}}>
      <Typography sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between'}}>
        <span>{title}</span>
        <span>{locales?.length}</span>
      </Typography>
      <List
        dense
        sx={{
          p: 0,
          '.MuiDivider-root:last-child': {display: 'none'},
          '.MuiListItemText-secondary': {fontSize: '0.675rem'},
        }}
      >
        {
          map(
            grouped.defaultLocales,
            (_locales, lang) => <LocaleList key={lang} lang={lang} locales={getOrdered(_locales)} />
          )
        }
        {
          map(
            grouped.supportedLocales,
            (_locales, lang) => <LocaleList key={lang} lang={lang} locales={getOrdered(_locales)} />
          )
        }
        {
          map(
            grouped.rest,
            _locales => getOrdered(_locales).map(
              locale => <LocaleItem key={locale.uuid} locale={locale} />
            )
          )
        }
      </List>
    </Paper>

  )
}

export default Locales;
