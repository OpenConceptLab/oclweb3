import React from 'react';
import { isNumber } from 'lodash';
import { PRIMARY_COLORS } from '../../common/colors'

const TabCountLabel = ({label, count}) => {
  if(!isNumber(count))
    return <span>{label}</span>;

  return (
    <span style={{display: 'flex'}}>
      <span style={{marginRight: '8px', display: 'flex', alignItems: 'center'}}><b>{label}</b></span>
      <span className="tag-count-label--count" style={{backgroundColor: PRIMARY_COLORS['90'], fontSize: '14px'}}>
        {count.toLocaleString()}
      </span>
    </span>
  )
}

export default TabCountLabel;
