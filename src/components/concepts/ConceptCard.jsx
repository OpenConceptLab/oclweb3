import React from 'react';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

import { COLORS } from '../../common/colors';
import { isAtGlobalSearch } from '../../common/utils';
import Retired from '../common/Retired';
import ConceptSummaryProperties from './ConceptSummaryProperties'

const getBestSynonym = synonyms => {
  return synonyms
    .map(text => {
      const matches = [...text.matchAll(/<em>(.*?)<\/em>/g)];
      const longestMatch = matches.reduce((a, b) => (b[1].length > a.length ? b[1] : a), "");
      const startsWithMatch = text.indexOf(`<em>${longestMatch}</em>`) === 0;
      return { text, longestMatch, length: longestMatch.length, startsWithMatch };
    })
    .sort((a, b) => {
      if (b.length !== a.length) return b.length - a.length; // longest match first
      if (b.startsWithMatch !== a.startsWithMatch) return b.startsWithMatch ? 1 : -1; // prefer start
      return 0;
    })[0].text; // return best match's text
}

const ConceptCard = ({ concept, onSelect, isSelected, onCardClick, bgColor, isShown, firstChild }) => {
  const id = concept.version_url || concept.url || concept.id
  const isChecked = isSelected(id)
  const isSelectedToShow = isShown(id)
  const border = (isChecked || isSelectedToShow) ? `1px solid ${COLORS.primary.main}` : '0.3px solid rgba(0, 0, 0, 0.12)'

  let synonymPrefix = ''
  const highlights = concept?.search_meta?.search_highlight
  const synonymHighlight = highlights?.synonyms
  const nameHighlight = highlights?.name
  if(!nameHighlight?.length && synonymHighlight?.length) {
    const bestMatch = getBestSynonym(synonymHighlight) || synonymHighlight[0]
    synonymPrefix = bestMatch.replace('<em>', "<b className='searchable'>").replace('</em>', '</b>')
  }

  const getLabel = () => isAtGlobalSearch() ? `${concept.source || concept?.repo?.short_code || concept?.repo?.id}:${concept.id}` : concept.id

  return (
    <Card
      variant='outlined'
      className={'col-xs-12' + (isSelectedToShow ? ' show-item' : '')}
      sx={{
        padding: '4px 16px',
        border: border, borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        margin: firstChild ? '0 0 4px 0' : '4px 0',
        cursor: 'pointer',
        backgroundColor: isSelectedToShow ? 'primary.90' : bgColor,
        '&:hover': {
          backgroundColor: isSelectedToShow ? 'primary.90' : 'primary.95'
        }
      }}
      onClick={event => onCardClick(event, id)}
    >
      <div className='col-xs-1 padding-0' style={{maxWidth: '24px'}}>
        <Checkbox
          color="primary"
          checked={isChecked}
          style={{padding: 0}}
          onClick={event => onSelect(event, id)}
        />
      </div>
      <div className='col-xs-11' style={{width: 'calc(100% - 24px)'}}>
        <ListItem sx={{padding: 0}}>
          <ListItemText
            className='searchable'
            primary={
              <span>
                <span>
                  {getLabel()}
                  <span style={{marginLeft: '4px'}}>
                    {
                      synonymPrefix &&
                        <span>
                          <span dangerouslySetInnerHTML={{__html: synonymPrefix}} />
                          <span style={{margin: '0 5px'}}>&rarr;</span>
                        </span>
                    }
                    {concept.display_name}
                  </span>
                </span>
                {
                  concept.retired &&
                    <Retired size='small' style={{margin: '0 12px'}} />
                }
              </span>
            }
            secondary={<ConceptSummaryProperties concept={concept} />}
            sx={{margin: '2px 0', '.MuiListItemText-primary': {fontSize: '14px'}, '.MuiListItemText-secondary': {fontSize: '12px', overflow: 'scroll'}}}
          />
        </ListItem>
      </div>
    </Card>
  )
}

export default ConceptCard;
