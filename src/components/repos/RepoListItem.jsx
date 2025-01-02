import React from 'react';
import { ListItem, ListItemText } from '@mui/material';
import RepoChip from './RepoChip'

const RepoListItem = ({ option, listItemProps, style }) => {
  return (
    <ListItem
      {...listItemProps}
      alignItems="flex-start"
      sx={{alignItems: 'flex-start', ...style}}
    >
      <ListItemText primary={<RepoChip noLink filled repo={option} />} />
    </ListItem>

  )
}

export default RepoListItem;
