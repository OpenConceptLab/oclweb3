import React from 'react'
import { useTranslation } from 'react-i18next';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import CopyIcon from '@mui/icons-material/ContentCopy';
import PreferredIcon from '@mui/icons-material/FlagOutlined';
import { groupBy, forEach, has, compact, without, keys, orderBy, map } from 'lodash'
import { toFullAPIURL, copyURL } from '../../common/utils';
import TagCountLabel from '../common/TagCountLabel';
import { OperationsContext } from '../app/LayoutContext';

const borderColor = 'rgba(0, 0, 0, 0.12)'

const LocalePrimary = ({ locale }) => {
  const locale_type = locale.name_type || locale.description_type
  return (
    <React.Fragment>
      <Typography component="span" sx={{fontSize: '12px', color: '#000000de'}}>
        {locale.name || locale.description}
      </Typography>
      {
        Boolean(locale_type) &&
          <Chip
            label={locale_type}
            size='small'
            sx={{
              height: '20px',
              borderRadius: '4px',
              backgroundColor: '#e4e1ec',
              fontSize: '12px',
              color: 'surface.dark',
              marginLeft: '8px',
              '.MuiChip-label': {
                padding: '0 6px',
                fontSize: '12px'
              }
            }}
          />
      }
      {
        locale.locale_preferred &&
          <PreferredIcon fontSize='small' sx={{color: 'surface.contrastText', marginLeft: '8px', height: '16px'}}/>
      }
      </React.Fragment>
  )
}

const LocaleItem = ({ locale, url }) => {
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);

  const externalID = (locale?.external_id && locale.external_id.toLowerCase() !== 'none') ? locale.external_id : undefined
  const isName = Boolean(locale?.name)
  const urlAttr = isName ? 'names' : 'descriptions'

  const onCopyClick = () => {
    copyURL(toFullAPIURL(url + urlAttr + '/' + locale.uuid + '/'))
    const message = isName ? t('concept.copied_name') : t('concept.copied_description')
    setAlert({message: message, severity: 'success', duration: 2000})
  }

  return (
    <React.Fragment>
      <ListItem
        sx={{color: 'surface.contrastText', paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: '24px' }}
        secondaryAction={
          <IconButton edge="end" aria-label="copy" sx={{color: 'surface.contrastText'}} onClick={onCopyClick} size='small'>
            <CopyIcon fontSize='inherit' />
          </IconButton>
        }
      >
        <ListItemText
          primary={<LocalePrimary locale={locale} />}
          secondary={externalID}
          sx={{
            margin: '2px 0',
            '.MuiListItemText-primary': {
              display: 'flex'
            }
          }}
        />
      </ListItem>
      <Divider component="li" />
    </React.Fragment>
  )
}


const LocaleList = ({url, lang, locales}) => {
  return (
    <React.Fragment key={lang}>
      <ListItem sx={{color: 'surface.contrastText', paddingRight: 0, position: 'relative'}}>
        <ListItemAvatar sx={{color: 'surface.contrastText', position: 'absolute', height: 'calc(100% - 10px)'}}>
          {lang.toUpperCase()}
        </ListItemAvatar>
        <List
          dense
          sx={{
            p: 0,
            width: '100%',
            marginLeft: '56px',
            '.MuiDivider-root:last-child': {display: 'none'},
            '.MuiListItemText-secondary': {fontSize: '0.675rem'},
          }}
        >
          {
            locales.map(
              locale => <LocaleItem key={locale.uuid} locale={locale} url={url} />
            )
          }
        </List>
      </ListItem>
      <Divider component="li" />
    </React.Fragment>
  )

}

const Locales = ({ concept, locales, title, repo }) => {
  const url = concept?.version_url || concept?.url
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
      <Typography component='span' sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between'}}>
        <TagCountLabel label={title} count={locales?.length}/>
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
            (_locales, lang) => <LocaleList key={lang} url={url} lang={lang} locales={getOrdered(_locales)} />
          )
        }
        {
          map(
            grouped.supportedLocales,
            (_locales, lang) => <LocaleList key={lang} url={url} lang={lang} locales={getOrdered(_locales)} />
          )
        }
        {
          map(
            grouped.rest,
            (_locales, lang) => <LocaleList key={lang} url={url} lang={lang} locales={getOrdered(_locales)} />
          )
        }
      </List>
    </Paper>

  )
}

export default Locales;
