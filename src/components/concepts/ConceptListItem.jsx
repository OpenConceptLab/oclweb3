import React from 'react';
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'

import { BLACK } from '../../common/colors'
import Retired from '../common/Retired'
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

export const getConceptSourceLabel = concept => concept?.source || concept?.repo?.short_code || concept?.repo?.id || ''

const getSynonymPrefix = concept => {
  const highlights = concept?.search_meta?.search_highlight
  const nameHighlight = highlights?.name
  const synonymHighlight = highlights?.synonyms
  if(nameHighlight?.length || !synonymHighlight?.length)
    return ''
  const bestMatch = getBestSynonym(synonymHighlight) || synonymHighlight[0]
  return bestMatch.replace('<em>', "<b className='searchable'>").replace('</em>', '</b>')
}

const ConceptListItem = ({ concept, showSource, sx, ...listItemProps }) => {
  const source = showSource ? getConceptSourceLabel(concept) : ''
  const hasProperties = Boolean(concept?.property?.length || concept?.concept_class || concept?.datatype)
  const synonymPrefix = getSynonymPrefix(concept)

  return (
    <ListItem {...listItemProps} sx={[{alignItems: 'flex-start'}, ...(Array.isArray(sx) ? sx : [sx])]}>
      <ListItemText
        className='searchable'
        primary={
          <span>
            <span>
              <Typography component='span' sx={{color: 'secondary.main', fontSize: 'inherit'}}>
                {source && `${source}:`}<b>{concept?.id}</b>
              </Typography>
              <span style={{marginLeft: '4px', color: BLACK}}>
                {
                  synonymPrefix &&
                    <span>
                      <span dangerouslySetInnerHTML={{__html: synonymPrefix}} />
                      <span style={{margin: '0 5px'}}>&rarr;</span>
                    </span>
                }
                {concept?.display_name}
              </span>
            </span>
            {
              concept?.retired &&
                <Retired size='small' style={{margin: '0 12px'}} />
            }
          </span>
        }
        secondary={hasProperties ? <ConceptSummaryProperties concept={concept} /> : undefined}
        sx={{
          margin: '2px 0',
          '.MuiListItemText-primary': {fontSize: '14px'},
          '.MuiListItemText-secondary': {fontSize: '12px', color: 'secondary.main', overflow: 'hidden', textOverflow: 'ellipsis'}
        }}
      />
    </ListItem>
  )
}

export default ConceptListItem;
