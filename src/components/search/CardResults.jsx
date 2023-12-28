import React from 'react';
import { map } from 'lodash';
import ConceptCard from '../concepts/ConceptCard';

const CardResults = ({bgColor, handleClick, handleRowClick, results, resource, isSelected, isItemShown, className, isSplitView, style}) => {
  const rows = results?.results || []
  return (
    <div className={'col-xs-12 padding-0 ' + (className || '')} style={style || {height: 'calc(100vh - 275px)', overflowX: 'auto'}}>
      {
        resource === 'concepts' && map(rows, (row, index) => {
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
      }
    </div>
  )
}

export default CardResults;
