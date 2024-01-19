import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import Drawer from '@mui/material/Drawer'
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import EnterIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import UpIcon from '@mui/icons-material/ArrowUpward';
import DownIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import SearchInputText from './SearchInputText'

const Icon = ({ icon, style }) => (
  <span style={{display: 'flex', padding: '4px', background: '#FFF', color: '#47464f', boxShadow: '0 0 5px 0 rgba(120, 118, 128, 0.6)', borderRadius: '4px', ...(style || {})}}>
    {icon}
  </span>
)

const Suggestion = ({ placeholder }) => (
  <ListItem sx={{padding: '12px'}}>
    <ListItemText primary={placeholder} />
  </ListItem>
)


const Option = ({ placeholder, selected, onClick, nested, onKeyDown }) => {
  const { t } = useTranslation()
  return (
    <ListItemButton sx={{padding: '12px'}} selected={selected} onClick={event => onClick(event, nested)} onKeyDown={onKeyDown}>
      <ListItemAvatar sx={{minWidth: '32px'}}>
        <SearchIcon color={selected ? 'primary' : undefined } />
      </ListItemAvatar>
      <ListItemText primary={placeholder} />
      <span style={{display: 'flex', alignItems: 'center', color: '#47464f', fontSize: '12px'}}>
        {
          selected &&
            <Icon
              icon={<EnterIcon style={{fontSize: '12px'}}/>} style={{marginRight: '8px', color: 'inherit'}}
            />

        }
        <span style={{display: 'flex'}}>
          {
            nested ? t('search.search_this_repository') : t('search.search_all_concepts')
          }
        </span>
      </span>
    </ListItemButton>
  )
}

const SearchInputDrawer = ({open, onClose, input, initiateSearch, inputProps}) => {
  const { t } = useTranslation()
  const inputRef = React.createRef()
  const location = useLocation()
  const [, ownerType, owner, repoType, repo,] = location.pathname.split('/');
  const isNested = Boolean(location.pathname !== '/search/' && location.pathname !== '/' && ownerType && owner && repoType && repo)
  const [focus, setFocus] = React.useState(1);
  const lastIndex = isNested ? 2 : 1
  const inputPlaceholder = input || '...'
  const onClickOption = (event, nested) => {
    event.persist()
    initiateSearch(event, !nested)
  }
  const onKeyPress = event => {
    event.persist()
    if(event.key === 'Enter') {
      inputRef.current.blur()
      if(focus == 1)
        inputProps.handleKeyPress(event)
      else
        initiateSearch(event, true)
    }
    else if(event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      onItemKeyDown(event, focus)
    }
    else if(event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      onItemKeyDown(event, focus)
    }
  }

  const onItemKeyDown = (event, index) => {
    if(event.key === 'ArrowUp') {
      if(index === 1) {
        setFocus(1)
        inputRef.current.focus()
      } else {
        setFocus(index - 1)
      }
    } else if (event.key === 'ArrowDown') {
      if(index === lastIndex) {
        setFocus(1)
        inputRef.current.focus()
      } else {
        setFocus(index + 1)
      }
    }
  }

  const _onClose = () => {
    setFocus(1)
    onClose()
  }

  return (
    <Drawer
      transitionDuration={0}
      ModalProps={{keepMounted: false}}
      sx={{
        zIndex: '1202',
        '& .MuiDrawer-paper': {
          borderRadius: '20px',
          padding: 0,
          top: '10px',
          width: '600px',
          margin: '0 auto',

        },
      }}
      anchor='top'
      open={open}
      onClose={_onClose}
    >
      <SearchInputText id='search-input-drawer' autoFocus {...inputProps} handleKeyPress={onKeyPress} ref={inputRef} />
      {
        isNested &&
          <Option
            nested
            index={1}
            placeholder={<span>Search <b>{repo}</b> for <b>"{inputPlaceholder}"</b></span>}
            icon
            selected={focus == 1}
            onClick={onClickOption}
            onKeyDown={event => onItemKeyDown(event, 1)}
          />
      }
      <Option
        index={2}
        placeholder={<span>{t('search.search_all_site')}<b>"{inputPlaceholder}"</b></span>}
        selected={focus ===  (isNested ? 2 : 1)}
        icon
        onClick={onClickOption}
        onKeyDown={event => onItemKeyDown(event, isNested ? 2 :1)}
      />
      <Suggestion
        placeholder={
          <span style={{display: 'flex', alignItems: 'center', fontSize: '12px', color: '#5e5c71', marginLeft: '4px'}}>
            <Icon icon={<UpIcon style={{fontSize: '12px'}} />} style={{marginRight: '8px'}} />
            <Icon icon={<DownIcon style={{fontSize: '12px'}} />} style={{marginRight: '8px'}} />
            {t('common.navigate')}
            <Icon icon={<EnterIcon style={{fontSize: '12px'}} />} style={{margin: '0 8px'}} />
            {t('common.select')}
          </span>
        }
      />
    </Drawer>
  )
}

export default SearchInputDrawer;
