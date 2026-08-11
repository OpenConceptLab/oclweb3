import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import flatMap from 'lodash/flatMap';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import EntityIcon from '../common/EntityIcon';
import { BROWSE_CONFIG } from './browseConfig';

const SectionHeader = ({ label }) => (
  <div style={{padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', color: '#5e5c71'}}>
    {label}
  </div>
)

const getSubtitle = (config, item) => config.getSubtitle ? config.getSubtitle(item) : item.id

const EntityBrowseList = React.forwardRef(({ type, onNavigate }, ref) => {
  const { t } = useTranslation()
  const history = useHistory()
  const [focus, setFocus] = React.useState(0)
  const [sections, setSections] = React.useState(null) // null while loading
  const config = BROWSE_CONFIG[type]
  const itemRefs = React.useRef([])

  React.useEffect(() => {
    let canceled = false
    setSections(null)
    setFocus(0)
    itemRefs.current = []

    Promise.all(
      (config?.sections || []).map(section => (
        Promise.resolve(section.getItems()).then(items => ({ ...section, items: items || [] }))
      ))
    ).then(resolved => {
      if(!canceled)
        setSections(resolved.filter(section => section.items.length))
    })

    return () => { canceled = true }
  }, [type])

  const flatItems = flatMap(sections || [], section => section.items)

  React.useEffect(() => {
    itemRefs.current[focus]?.scrollIntoView({block: 'nearest'})
  }, [focus, sections])

  const navigate = url => {
    if(url) {
      history.push(url)
      onNavigate()
    }
  }

  React.useImperativeHandle(ref, () => ({
    onKeyDown: event => {
      if(!flatItems.length)
        return
      if(event.key === 'ArrowDown') {
        event.preventDefault()
        setFocus(prev => (prev + 1) % flatItems.length)
      } else if(event.key === 'ArrowUp') {
        event.preventDefault()
        setFocus(prev => (prev - 1 + flatItems.length) % flatItems.length)
      } else if(event.key === 'Enter') {
        event.preventDefault()
        navigate(flatItems[focus]?.url)
      }
    }
  }))

  if(!config)
    return null

  if(sections === null)
    return <SectionHeader label={t('common.loading')} />

  if(!flatItems.length)
    return <SectionHeader label={t(config.emptyMessageKey)} />

  let index = -1

  return (
    <React.Fragment>
      {
        sections.map(section => (
          <React.Fragment key={section.key}>
            <SectionHeader label={t(section.titleKey)} />
            {
              section.items.map(item => {
                index += 1
                const itemIndex = index
                return (
                  <ListItemButton
                    key={item.url || item.id}
                    ref={el => { itemRefs.current[itemIndex] = el }}
                    sx={{padding: '12px'}}
                    selected={focus === itemIndex}
                    onClick={() => navigate(item.url)}
                  >
                    <ListItemAvatar sx={{minWidth: '40px'}}>
                      <EntityIcon entity={item} noTooltip noLink strict fontSize='small' />
                    </ListItemAvatar>
                    <div>
                      <div style={{fontSize: '11px', color: '#5e5c71'}}>{getSubtitle(config, item)}</div>
                      <div style={{fontWeight: 'bold'}}>{item.name || item.username || item.id}</div>
                    </div>
                  </ListItemButton>
                )
              })
            }
          </React.Fragment>
        ))
      }
    </React.Fragment>
  )
})

EntityBrowseList.displayName = 'EntityBrowseList'

export default EntityBrowseList
