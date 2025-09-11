import React from 'react';
import { map, times } from 'lodash';
import ConceptCard from '../concepts/ConceptCard';
import Skeleton from '@mui/material/Skeleton'

const CardResults = ({bgColor, handleClick, handleRowClick, results, resource, isSelected, isItemShown, className, isSplitView, style, loading}) => {
  const rows = results?.results || []
  return (
    <div className={'col-xs-12 padding-0 ' + (className || '')} style={style || {height: 'calc(100vh - 275px)', overflowX: 'auto'}}>
      {
        resource === 'concepts' && (
          loading ?
            times(25, i => (
              <Skeleton key={i} height={130} sx={{'-webkit-transform': 'none', 'transform': 'none', margin: '16px'}} />
            )) :
            map(rows, (row, index) => {
              return (
                <ConceptCard
                  firstChild={index === 0}
                  isSelected={isSelected}
                  isShown={isItemShown}
                  bgColor={bgColor}
                  key={row.version_url || row.url}
                  concept={row}
                  onSelect={handleClick}
                  onCardClick={handleRowClick}
                  isSplitView={isSplitView}
                />
              )
            })
        )
      }
    </div>
  )
}

export default CardResults;
