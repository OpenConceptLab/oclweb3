import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Collapse, LinearProgress, Stack, Typography } from '@mui/material';

import ProcessingStagesPopover from './ProcessingStagesPopover';
import { getProcessingProgress, hasProcessingStages, isVersionProcessing } from './processingStages';

// Without this, a half-seeded list reads as "this repo has no content".
const ProcessingBanner = ({ version, resource }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const processing = isVersionProcessing(version);
  const { completed, total, percent, current, hasFailure } = getProcessingProgress(version);
  const hasDetail = hasProcessingStages(version);

  return (
    <Collapse in={processing} unmountOnExit>
      <Alert
        severity={hasFailure ? 'error' : 'warning'}
        icon={false}
        sx={{ borderRadius: 0, py: 0.5, alignItems: 'center', '& .MuiAlert-message': { width: '100%', py: 0.5 } }}
        action={hasDetail ? (
          <Button size="small" color="inherit" onClick={event => setAnchorEl(event.currentTarget)} sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>
            {t('repo.view_processing_details')}
          </Button>
        ) : undefined}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: '13px' }}>
            {hasFailure
              ? t('repo.processing_listing_failed', { resource })
              : t('repo.processing_listing_warning', { resource })}
          </Typography>
          {hasDetail && (
            <Box sx={{ minWidth: 140 }}>
              <LinearProgress
                variant="determinate"
                value={percent}
                color={hasFailure ? 'error' : 'warning'}
                sx={{ height: 5, borderRadius: '100px' }}
              />
              <Typography variant="caption" sx={{ fontSize: '10.5px' }}>
                {current
                  ? t('repo.processing_stage_caption', { stage: t(current.labelKey), completed, total })
                  : t('repo.processing_summary', { completed, total })}
              </Typography>
            </Box>
          )}
        </Stack>
      </Alert>
      <ProcessingStagesPopover
        version={version}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      />
    </Collapse>
  );
};

export default ProcessingBanner;
