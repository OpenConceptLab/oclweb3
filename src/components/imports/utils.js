import React from 'react';
import {
  Cancel as FailedIcon,
  CheckCircle as SuccessIcon,
  HourglassFull as PendingIcon,
  Replay as RetryIcon,
  PanTool as RevokedIcon,
  Timer as ReceivedIcon,
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { get } from 'lodash';

const COLORS = {
  failure: 'error', success: 'primary', pending: 'warning', retry: 'warning', started: 'success',
  revoked: 'default', received: 'warning'
};

const getIcon = (status, rest) => {
  if(!status)
    return;

  const state = status.toLowerCase();
  const color = COLORS[state];
  const width = get(rest, 'width', '20px');
  const height = get(rest, 'height', '20px');

  if(state === 'failure')
    return <FailedIcon sx={{color: color}} {...rest} />;
  if(state === 'success')
    return <SuccessIcon sx={{color: color}} {...rest} />;
  if(state === 'pending')
    return <PendingIcon sx={{color: color}} {...rest} />;
  if(state === 'retry')
    return <RetryIcon sx={{color: color}} {...rest} />;
  if(state === 'started')
    return <CircularProgress sx={{color: 'primary.main', width: width, height: height}}  {...rest} />;
  if(state === 'revoked')
    return <RevokedIcon sx={{color: color}} {...rest} />;
  if(state === 'received')
    return <ReceivedIcon sx={{color: color}} {...rest} />;
}


export const getTaskIconDetails = (status, rest) => {
  const icon = getIcon(status, rest);
  return {
    icon: icon,
    status: status,
    color: COLORS[status.toLowerCase()]
  }
}
