import React from 'react';
import {LinearProgress, Typography, Box} from '@mui/material';

const LinearProgressWithLabel = props => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center"
      }}>
      <Box
        sx={{
          width: "100%",
          mr: 1
        }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{
        minWidth: 35
      }}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}
const LinearWithValueLabel = ({ progress }) => {
  return (
    <Box sx={{width: '100%'}}>
      <LinearProgressWithLabel value={progress || 0} />
    </Box>
  );
}
export default LinearWithValueLabel;