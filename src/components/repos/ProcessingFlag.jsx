import React from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Tooltip } from '@mui/material';
import {
  ErrorOutlineOutlined as FailedIcon,
  Sync as ProcessingIcon
} from '@mui/icons-material';

import ProcessingStagesPopover from './ProcessingStagesPopover';
import { getProcessingProgress, hasProcessingStages, isProcessing as isEntityProcessing } from './processingStages';

// Sits next to the version id wherever a version is named; opens the stage breakdown.
const ProcessingFlag = ({ entity, processing, size = 'small', sx, showLabel = true, onClick }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  if(!(processing ?? isEntityProcessing(entity))) return null;

  const { completed, total, hasFailure } = getProcessingProgress(entity);
  const hasDetail = hasProcessingStages(entity);

  const openPopover = event => {
    event.stopPropagation();
    event.preventDefault();
    if(onClick) onClick(event);
    if(hasDetail) setAnchorEl(event.currentTarget);
  };

  const label = hasDetail && showLabel
    ? t('repo.processing_progress_short', { completed, total })
    : t('common.processing');

  return (
    <React.Fragment>
      <Tooltip title={hasDetail ? t('repo.processing_flag_tooltip') : t('common.processing')}>
        <Chip
          size={size}
          variant="outlined"
          color={hasFailure ? 'error' : 'warning'}
          icon={hasFailure
            ? <FailedIcon sx={{ fontSize: '14px !important' }} />
            : <ProcessingIcon sx={{ fontSize: '14px !important', animation: 'ocl-spin 1.6s linear infinite' }} />}
          label={label}
          onClick={openPopover}
          sx={[{ height: '22px', fontWeight: 600, cursor: hasDetail ? 'pointer' : 'default' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
        />
      </Tooltip>
      <ProcessingStagesPopover
        version={entity}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      />
    </React.Fragment>
  );
};

export default ProcessingFlag;
