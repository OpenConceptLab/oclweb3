import React from 'react'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import map from 'lodash/map'

const SHORT_LINE_WIDTH = '40%'
const LINE_WIDTHS = ['90%', '75%']

const ItemSkeletons = ({ count = 3, circleSize = 40, lines = 3, sx }) => (
  <>
    {
      map(Array.from({length: count}), (_, index) => (
        <Box key={index} sx={{display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '8px 0', ...sx}}>
          <Skeleton variant='circular' width={circleSize} height={circleSize} sx={{flexShrink: 0}} />
          <Box sx={{flex: 1, minWidth: 0}}>
            {
              map(Array.from({length: lines}), (_, lineIndex) => (
                <Skeleton key={lineIndex} variant='text' width={lineIndex === lines - 1 ? SHORT_LINE_WIDTH : LINE_WIDTHS[lineIndex]} sx={{fontSize: lineIndex === lines - 1 ? '12px' : '14px'}} />
              ))
            }
          </Box>
        </Box>
      ))
    }
  </>
)

export default ItemSkeletons
