import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, LinearProgress, Tooltip, Typography } from '@mui/material';

import ProcessingStagesPopover from './ProcessingStagesPopover';
import { getProcessingProgress, hasProcessingStages, isVersionProcessing } from './processingStages';

const ProcessingProgress = ({ version, width = 120, sx }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  if(!isVersionProcessing(version)) return null;

  const { completed, total, percent, current, hasFailure } = getProcessingProgress(version);
  const hasDetail = hasProcessingStages(version);

  const openPopover = event => {
    event.stopPropagation();
    if(hasDetail) setAnchorEl(event.currentTarget);
  };

  // Naming a stage with no records behind it would be a guess.
  const caption = hasDetail && current
    ? t('repo.processing_stage_caption', { stage: t(current.labelKey), completed, total })
    : t('common.processing');

  return (
    <React.Fragment>
      <Box
        onClick={openPopover}
        sx={[{ mt: 0.5, cursor: hasDetail ? 'pointer' : 'default', maxWidth: width }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      >
        <Tooltip title={hasDetail ? t('repo.processing_flag_tooltip') : t('common.processing')}>
          <LinearProgress
            variant={hasDetail ? 'determinate' : 'indeterminate'}
            value={percent}
            color={hasFailure ? 'error' : 'warning'}
            sx={{ height: 5, borderRadius: '100px', width }}
          />
        </Tooltip>
        <Typography
          variant="caption"
          sx={{ display: 'block', color: hasFailure ? 'error.main' : 'text.secondary', fontSize: '10.5px', lineHeight: 1.4 }}
        >
          {caption}
        </Typography>
      </Box>
      <ProcessingStagesPopover
        version={version}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      />
    </React.Fragment>
  );
};

export default ProcessingProgress;
