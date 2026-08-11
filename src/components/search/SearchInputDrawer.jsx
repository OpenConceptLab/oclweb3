import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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
import LeftIcon from '@mui/icons-material/ArrowBack';
import RightIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import { PRIMARY_COLORS } from '../../common/colors'
import { getCurrentUser, hasAuthGroup } from '../../common/utils'
import { OperationsContext } from '../app/LayoutContext';
import SearchInputText from './SearchInputText'
import FilterTypeChips from './FilterTypeChips'
import EntityBrowseList from './EntityBrowseList'
import { BROWSE_CONFIG, FACET_FILTER_CONFIG, getFacetFilterURL } from './browseConfig'

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

const SearchInputDrawer = ({open, onClose, input, initiateSearch, inputProps, isMatchOp, activeFilterType, setActiveFilterType, activeFilterValue, setActiveFilterValue, setInput}) => {
  const { t } = useTranslation()
  const inputRef = React.createRef()
  const location = useLocation()
  const history = useHistory()
  const { contextRepo } = React.useContext(OperationsContext);
  let [, ownerType, owner, repoType, repo, version, resource,] = location.pathname.split('/');
  if(repoType === 'edit')
    repoType = undefined
  if(repo === 'edit')
    repo = undefined
  const isURLRegistry = location?.pathname?.endsWith('/url-registry') || location?.pathname?.endsWith('/settings')
  const isNested = Boolean(location.pathname !== '/search/' && location.pathname !== '/' && owner && ownerType) || isURLRegistry
  const isRepoContext = Boolean(repoType && repo)
  const [focus, setFocus] = React.useState(1);
  const [mode, setMode] = React.useState(activeFilterType ? 'typeBrowse' : 'query'); // 'query' | 'typeSelect' | 'typeBrowse'
  const chipsRef = React.useRef();
  const browseRef = React.useRef();

  // Only auto-advance mode when a filter becomes active from outside this component (e.g.
  // re-derived from the URL after a hard reload). Clearing activeFilterType is handled
  // explicitly wherever it happens, each picking its own target mode (see onKeyPress's
  // backspace handling below, which steps back to 'typeSelect' rather than straight to 'query').
  React.useEffect(() => {
    if(activeFilterType && mode === 'query')
      setMode('typeBrowse')
  }, [activeFilterType])

  const user = getCurrentUser()
  const canMatchSemantic = Boolean(isNested && (contextRepo?.version || version) !== 'HEAD' && contextRepo?.match_algorithms?.includes('llm') && user?.username && (!resource || resource === 'concepts')) && hasAuthGroup(user, 'mapper-approved') && hasAuthGroup(user, 'core_user')

  let lastIndex = isNested ? 2 : 1
  if (canMatchSemantic)
    lastIndex += 1
  const inputPlaceholder = input || '...'
  const onClickOption = (event, nested) => {
    event.persist()
    initiateSearch(event, !nested, event?.currentTarget?.id === 'match_repo' && canMatchSemantic)
  }
  const onRemoveFilter = () => {
    setActiveFilterType(null)
    setActiveFilterValue(null)
    setMode('query')
  }

  const onFilterSelect = type => {
    setActiveFilterType(type)
    setMode('typeBrowse')
  }

  const getActiveFilterLabelKey = () => BROWSE_CONFIG[activeFilterType]?.labelKey || FACET_FILTER_CONFIG[activeFilterType]?.labelKey

  // Only switching the repo page's active resource tab (e.g. Concepts -> Mappings) needs a
  // full reload - the tab doesn't reliably switch on soft navigation alone. Staying on the
  // same tab (or the global search page) can update in place: the search results component
  // already re-fetches whenever the URL changes, no reload needed.
  const navigateToFacetFilter = (facetConfig, term, q, options = {}) => {
    const { closeAfter = true } = options
    const url = getFacetFilterURL(facetConfig, term, isRepoContext ? location.pathname : null, q)

    if(isRepoContext && facetConfig.resourceType !== (resource || 'concepts')) {
      inputRef.current?.blur()
      history.push(url)
      // The filter chip survives the reload because SearchInput re-derives it from the URL
      // on mount.
      window.location.reload()
      return
    }

    history.push(url)
    // Keep activeFilterType as-is (matches org/repo/user's free-text search, which also
    // doesn't clear the chip).
    if(closeAfter) {
      inputRef.current?.blur()
      _onClose()
    }
  }

  // Before a value is committed, typed text is the facet's own term (e.g. which Map Type).
  // Committing it applies the filter immediately but leaves the drawer open on the same
  // matching tab - so the user can keep typing a keyword right after, with no reload
  // interrupting the flow. Once committed, the chip carries that term and typed text becomes
  // a keyword search layered on top of it, which does close the drawer (a real submit).
  const applyFacetInput = facetConfig => {
    if(activeFilterValue)
      navigateToFacetFilter(facetConfig, activeFilterValue, input)
    else {
      const value = input
      setActiveFilterValue(value)
      // Clear synchronously in the same batch as committing the value, rather than waiting
      // on the URL round-trip (soft nav -> location change -> re-derive effect) to do it -
      // that round-trip is a render or two behind and can flash the same text in both the
      // chip and the input before it catches up.
      setInput('')
      navigateToFacetFilter(facetConfig, value, null, {closeAfter: false})
    }
  }

  const onKeyPress = event => {
    event.persist()

    if(mode === 'query' && event.key === '/' && !input) {
      event.preventDefault()
      setMode('typeSelect')
      return
    }

    if(event.key === 'Escape' && mode !== 'query') {
      event.preventDefault()
      event.stopPropagation()
      onRemoveFilter()
      return
    }

    if(mode === 'typeSelect') {
      if(event.key === 'Backspace' && !input) {
        event.preventDefault()
        setMode('query')
        return
      }
      if(event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter')
        chipsRef.current?.onKeyDown(event)
      return
    }

    if(mode === 'typeBrowse') {
      const facetConfig = FACET_FILTER_CONFIG[activeFilterType]

      if(event.key === 'Backspace' && !input) {
        event.preventDefault()
        setActiveFilterType(null)
        setActiveFilterValue(null)
        setMode('typeSelect')
        return
      }

      if(event.key === 'Enter' && input) {
        event.preventDefault()
        if(facetConfig) {
          applyFacetInput(facetConfig)
        } else {
          inputRef.current.blur()
          initiateSearch(event, true, false, activeFilterType)
        }
        return
      }
      if(!facetConfig && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter'))
        browseRef.current?.onKeyDown(event)
      return
    }

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
    if(!activeFilterType)
      setMode('query')
    onClose()
  }

  const resetAndClose = () => {
    setFocus(1)
    setMode('query')
    setActiveFilterType(null)
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
      <SearchInputText
        id='search-input-drawer'
        autoFocus
        {...inputProps}
        handleKeyPress={onKeyPress}
        ref={inputRef}
        isMatchOp={isMatchOp}
        placeholder={mode === 'typeSelect' ? t('search.select_a_filter') : t('search.input_placeholder_drawer')}
        filterChip={activeFilterType ? {label: activeFilterValue ? `${t(getActiveFilterLabelKey())}: ${activeFilterValue}` : t(getActiveFilterLabelKey()), onRemove: onRemoveFilter} : undefined}
      />
      {
        mode === 'typeSelect' &&
          <React.Fragment>
            <FilterTypeChips ref={chipsRef} onSelect={onFilterSelect} isNested={isRepoContext} resource={resource} />
            <Divider />
          </React.Fragment>
      }
      {
        mode === 'typeBrowse' && !input && !FACET_FILTER_CONFIG[activeFilterType] &&
          <React.Fragment>
            <div style={{maxHeight: '340px', overflowY: 'auto'}}>
              <EntityBrowseList ref={browseRef} type={activeFilterType} onNavigate={resetAndClose} />
            </div>
            <Divider />
          </React.Fragment>
      }
      {
        mode === 'typeBrowse' && input &&
          <React.Fragment>
            <Option
              id='search_type_filtered'
              index={1}
              placeholder={
                FACET_FILTER_CONFIG[activeFilterType] ?
                  (
                    activeFilterValue ?
                      <span>{t('common.search')} <b>{t(FACET_FILTER_CONFIG[activeFilterType].resourceLabelKey)}</b> {t('search.filtered_by')} <b>{t(FACET_FILTER_CONFIG[activeFilterType].labelKey)}</b> "<b>{activeFilterValue}</b>" {t('common.for')} "<b>{inputPlaceholder}</b>"</span> :
                      <span>{t('search.filter')} <b>{t(FACET_FILTER_CONFIG[activeFilterType].resourceLabelKey)}</b> {t('common.by')} <b>{t(FACET_FILTER_CONFIG[activeFilterType].labelKey)}</b> "<b>{inputPlaceholder}</b>"</span>
                  ) :
                  <span>{t('common.search')} <b>{t(BROWSE_CONFIG[activeFilterType]?.labelKey)}</b> {t('common.for')} "<b>{inputPlaceholder}</b>"</span>
              }
              icon
              selected
              onClick={event => {
                event.persist()
                const facetConfig = FACET_FILTER_CONFIG[activeFilterType]
                if(facetConfig)
                  applyFacetInput(facetConfig)
                else
                  initiateSearch(event, true, false, activeFilterType)
              }}
              onKeyDown={() => {}}
            />
            <Divider />
          </React.Fragment>
      }
      {
        mode === 'query' && input &&
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
            {
              mode === 'typeSelect' ?
                <React.Fragment>
                  <Icon icon={<LeftIcon style={{fontSize: '12px'}} />} style={{marginRight: '8px'}} />
                  <Icon icon={<RightIcon style={{fontSize: '12px'}} />} style={{marginRight: '8px'}} />
                </React.Fragment> :
                <React.Fragment>
                  <Icon icon={<UpIcon style={{fontSize: '12px'}} />} style={{marginRight: '8px'}} />
                  <Icon icon={<DownIcon style={{fontSize: '12px'}} />} style={{marginRight: '8px'}} />
                </React.Fragment>
            }
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
