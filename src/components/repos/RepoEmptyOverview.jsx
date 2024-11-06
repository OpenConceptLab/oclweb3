import React from 'react';
import Typography from '@mui/material/Typography'
import RepoOverviewEmptyGraphic from './RepoOverviewEmptyGraphic'

const RepoEmptyOverview = ({ label, action }) => {
  return (
    <>
      <RepoOverviewEmptyGraphic />
      <Typography sx={{fontSize: '16px', color: 'default.light', marginTop: '16px'}}>
        {label}
      </Typography>
      {action}
    </>
  )
}

export default RepoEmptyOverview
