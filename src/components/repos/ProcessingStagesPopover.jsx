import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Popover, Stack, Tooltip, Typography } from '@mui/material';
import {
  CheckCircle as DoneIcon,
  ContentCopy as CopyIcon,
  ErrorOutlineOutlined as FailedIcon,
  RadioButtonUnchecked as PendingIcon,
  Sync as RunningIcon
} from '@mui/icons-material';

import { copyToClipboard } from '../../common/utils';
import { OperationsContext } from '../app/LayoutContext';
import {
  STAGE_STATUS,
  formatRuntime,
  getProcessingProgress,
  truncateTaskId
} from './processingStages';

const STATUS_ICON = {
  [STAGE_STATUS.DONE]: { Icon: DoneIcon, color: 'success.main' },
  [STAGE_STATUS.FAILED]: { Icon: FailedIcon, color: 'error.main' },
  [STAGE_STATUS.RUNNING]: { Icon: RunningIcon, color: 'warning.main' },
  [STAGE_STATUS.PENDING]: { Icon: PendingIcon, color: 'text.disabled' },
  [STAGE_STATUS.NOT_STARTED]: { Icon: PendingIcon, color: 'text.disabled' }
};

const StageRow = ({ stage, onCopy }) => {
  const { t } = useTranslation();
  const { Icon, color } = STATUS_ICON[stage.status] || STATUS_ICON[STAGE_STATUS.NOT_STARTED];
  const runtime = formatRuntime(stage.runtime);
  const isRunning = stage.status === STAGE_STATUS.RUNNING;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        py: 0.75,
        borderTop: '1px dashed',
        borderColor: 'surface.nv80',
        '&:first-of-type': { borderTop: 'none' }
      }}
    >
      <Icon
        sx={{
          width: 15,
          height: 15,
          color,
          flex: '0 0 auto',
          ...(isRunning ? { animation: 'ocl-spin 1.6s linear infinite' } : {})
        }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontSize: '12.5px', lineHeight: 1.3 }}>
          {t(stage.labelKey)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10.5px' }}>
          {stage.state}
          {runtime ? ` · ${runtime}` : ''}
        </Typography>
      </Box>
      {stage.taskId ? (
        <Tooltip title={t('repo.copy_task_id')}>
          <IconButton
            size="small"
            onClick={() => onCopy(stage.taskId)}
            sx={{ p: 0.25 }}
          >
            <Typography
              component="span"
              sx={{ fontFamily: 'monospace', fontSize: '10px', color: 'text.secondary', mr: 0.5 }}
            >
              {truncateTaskId(stage.taskId)}
            </Typography>
            <CopyIcon sx={{ width: 13, height: 13 }} />
          </IconButton>
        </Tooltip>
      ) : (
        <Typography component="span" sx={{ fontSize: '10px', color: 'text.disabled' }}>—</Typography>
      )}
    </Stack>
  );
};

const ProcessingStagesPopover = ({ version, anchorEl, open, onClose }) => {
  const { t } = useTranslation();
  const { setAlert } = React.useContext(OperationsContext);
  const { recordedStages, completed, total, hasFailure } = getProcessingProgress(version);

  const onCopy = taskId => {
    copyToClipboard(taskId);
    setAlert({ severity: 'success', message: t('repo.copied_task_id') });
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: {
            p: 1.5,
            minWidth: 320,
            maxWidth: 400,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'surface.nv80',
            boxShadow: 'none'
          }
        }
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontWeight: 700,
          color: hasFailure ? 'error.main' : 'text.secondary',
          mb: 0.5
        }}
      >
        {hasFailure
          ? t('repo.processing_failed_summary', { completed, total })
          : t('repo.processing_summary', { completed, total })}
      </Typography>
      {recordedStages.map(stage => <StageRow key={stage.key} stage={stage} onCopy={onCopy} />)}
    </Popover>
  );
};

export default ProcessingStagesPopover;
