import React from 'react';
import Typography from '@mui/material/Typography'
import OCLEmptyGraphic from './OCLEmptyGraphic'

const EmptyOverview = ({ label }) => {
  return (
    <>
      <OCLEmptyGraphic />
      <Typography sx={{fontSize: '14px', color: 'default.light', marginTop: '16px'}}>
        {label}
      </Typography>
    </>
  )
}

export default EmptyOverview
