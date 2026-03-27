import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import EnterIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import UpIcon from '@mui/icons-material/ArrowUpward';
import DownIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import { PRIMARY_COLORS } from '../../common/colors'
import { getCurrentUser, hasAuthGroup } from '../../common/utils'
import { OperationsContext } from '../app/LayoutContext';
import SearchInputText from './SearchInputText'

const Icon = ({ icon, style }) => (
  <span style={{display: 'flex', padding: '4px', background: '#FFF', color: '#47464f', boxShadow: '0 0 5px 0 rgba(120, 118, 128, 0.6)', borderRadius: '4px', ...(style || {})}}>
    {icon}
  </span>
)

const Suggestion = ({ placeholder }) => (
  <ListItem sx={{padding: '12px', backgroundColor: '#fffbff'}}>
    <ListItemText primary={placeholder} />
  </ListItem>
)


const Option = ({ placeholder, selected, onClick, nested, onKeyDown, text, id, isMatchOp }) => {
  const { t } = useTranslation()
  return (
    <ListItemButton id={id} sx={{padding: '12px'}} selected={selected} onClick={event => onClick(event, nested)} onKeyDown={onKeyDown}>
      <ListItemAvatar sx={{minWidth: '32px'}}>
        {
          isMatchOp ?
            <i className="fa-solid fa-diagram-project" style={selected ? {color: PRIMARY_COLORS.main} : {}}></i> :
            <SearchIcon color={selected ? 'primary' : undefined } />
        }
      </ListItemAvatar>
      <ListItemText primary={placeholder} sx={{paddingRight: '4px'}} />
      <span style={{display: 'flex', alignItems: 'center', color: '#47464f', fontSize: '12px', textAlign: 'right'}}>
        {
          selected &&
            <Icon
              icon={<EnterIcon style={{fontSize: '12px'}}/>} style={{marginRight: '8px', color: 'inherit'}}
            />

        }
        <span style={{display: 'flex'}}>
          {
            text ?
              text :
              (
                nested ? t('search.search_this_repository') : t('search.search_all_concepts')
              )
          }
        </span>
      </span>
    </ListItemButton>
  )
}

const SearchInputDrawer = ({open, onClose, input, initiateSearch, inputProps, isMatchOp}) => {
  const { t } = useTranslation()
  const inputRef = React.createRef()
  const location = useLocation()
  const { contextRepo } = React.useContext(OperationsContext);
  let [, ownerType, owner, repoType, repo, version, resource,] = location.pathname.split('/');
  if(repoType === 'edit')
    repoType = undefined
  if(repo === 'edit')
    repo = undefined
  const isURLRegistry = location?.pathname?.endsWith('/url-registry') || location?.pathname?.endsWith('/settings')
  const isNested = Boolean(location.pathname !== '/search/' && location.pathname !== '/' && owner && ownerType) || isURLRegistry
  const [focus, setFocus] = React.useState(1);

  const user = getCurrentUser()
  const canMatchSemantic = Boolean(isNested && (contextRepo?.version || version) !== 'HEAD' && contextRepo?.match_algorithms?.includes('llm') && user?.username && (!resource || resource === 'concepts')) && hasAuthGroup(user, 'mapper-approved') && hasAuthGroup(user, 'staff_user')

  let lastIndex = isNested ? 2 : 1
  if (canMatchSemantic)
    lastIndex += 1
  const inputPlaceholder = input || '...'
  const onClickOption = (event, nested) => {
    event.persist()
    initiateSearch(event, !nested, event?.currentTarget?.id === 'match_repo' && canMatchSemantic)
  }
  const onKeyPress = event => {
    event.persist()
    if(event.key === 'Enter') {
      inputRef.current.blur()
      if(focus === 1)
        inputProps.handleKeyPress(event)
      else if(focus === 3 && canMatchSemantic) {
        initiateSearch(event, false, true)
      }
      else {
        setFocus(1)
        initiateSearch(event, true)
      }
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
          top: '14px',
          width: '600px',
          margin: '0 auto',
          minHeight: '64px'
        },
      }}
      anchor='top'
      open={open}
      onClose={_onClose}
    >
      <SearchInputText id='search-input-drawer' autoFocus {...inputProps} handleKeyPress={onKeyPress} ref={inputRef} isMatchOp={isMatchOp} />
      {
        input &&
          <React.Fragment>
            {
              isNested && repoType && repo && !isURLRegistry &&
                <Option
                  id='search_repo'
                  nested
                  index={1}
                  placeholder={<span>{t('common.search')} <b>{repo}</b> {t('common.for')} "<b>{inputPlaceholder}</b>"</span>}
                  icon
                  selected={focus == 1}
                  onClick={onClickOption}
                  onKeyDown={event => onItemKeyDown(event, 1)}
                />
            }
            {
              isNested && !repo && !isURLRegistry &&
                <Option
                  id='search_owner'
                  nested
                  index={1}
                  placeholder={<span>{t('common.search')} <b>{owner}</b> {repoType} {t('common.for')} "<b>{inputPlaceholder}</b>"</span>}
                  icon
                  selected={focus == 1}
                  onClick={onClickOption}
                  onKeyDown={event => onItemKeyDown(event, 1)}
                />
            }
            {
              isURLRegistry &&
                <Option
                  id='search'
                  nested
                  index={1}
                  placeholder={<span>{t('search.search_this_url_registry')}"<b>{inputPlaceholder}</b>"</span>}
                  icon
                  selected={focus == 1}
                  onClick={onClickOption}
                  onKeyDown={event => onItemKeyDown(event, 1)}
                />
            }
            <Option
              id='search_global'
              index={2}
              placeholder={<span>{t('search.search_all_site')}"<b>{inputPlaceholder}</b>"</span>}
              selected={focus ===  (isNested ? 2 : 1)}
              icon
              onClick={onClickOption}
              onKeyDown={event => onItemKeyDown(event, isNested ? 2 :1)}
            />
            {
              isNested && repoType && repo && !isURLRegistry && canMatchSemantic &&
                <Option
                  id='match_repo'
                  nested
                  index={3}
                  placeholder={<span>{t('common.match')} "<b>{inputPlaceholder}</b>" {t('common.to_concepts_in')} <b>{repo}</b></span>}
                  selected={focus == 3}
                  onClick={onClickOption}
                  onKeyDown={event => onItemKeyDown(event, 3)}
                  text={t('common.run_match')}
                  isMatchOp
                />
            }
            <Divider />
          </React.Fragment>

      }
      <Suggestion
        placeholder={
          <span style={{display: 'flex', alignItems: 'center', fontSize: '12px', color: '#5e5c71', marginLeft: '4px'}}>
            <Icon icon={<UpIcon style={{fontSize: '12px'}} />} style={{marginRight: '8px'}} />
            <Icon icon={<DownIcon style={{fontSize: '12px'}} />} style={{marginRight: '8px'}} />
            {t('common.navigate')}
            <Icon icon={<EnterIcon style={{fontSize: '12px'}} />} style={{margin: '0 8px 0 16px'}} />
            {t('common.select')}
          </span>
        }
      />
    </Drawer>
  )
}

export default SearchInputDrawer;
