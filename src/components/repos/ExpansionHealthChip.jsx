import React from 'react';
import { Box, Chip, Stack, Tooltip } from '@mui/material';
import {
  CheckCircleOutlined as HealthyIcon,
  ErrorOutlineOutlined as UnhealthyIcon,
  InfoOutlined as HeadResolvedIcon,
  RadioButtonUnchecked as EmptyIcon,
  Sync as PendingIcon,
  History as NotCurrentIcon
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';

import { FRESHNESS_KEYS, getStateConfig } from './expansionHealth';

const STATE_ICONS = {
  healthy: HealthyIcon,
  head_resolved: HeadResolvedIcon,
  unhealthy: UnhealthyIcon,
  empty: EmptyIcon
};

// A stored health state, marked when it's out of date; nothing when health was never computed
const ExpansionHealthChip = ({ status, onClick }) => {
  const { t } = useTranslation();
  if (!status) return null;

  const config = getStateConfig(status.state);
  const label = config ? t(config.labelKey) : (status.state || t('repo.expansion_health.state_checking'));
  const StateIcon = STATE_ICONS[status.state] || (status.state ? HeadResolvedIcon : PendingIcon);
  // a state still being checked for the first time says so in its label already
  const freshness = status.state && FRESHNESS_KEYS[status.freshness] ? t(FRESHNESS_KEYS[status.freshness]) : null;
  const FreshnessIcon = status.freshness === 'pending' ? PendingIcon : NotCurrentIcon;
  const tooltip = [freshness, onClick ? t('repo.expansion_health.view_details') : null].filter(Boolean).join(' · ');

  return (
    <Tooltip title={tooltip}>
      <Chip
        size="small"
        variant="outlined"
        color={config?.color || 'default'}
        icon={<StateIcon sx={{ fontSize: '14px !important' }} />}
        label={freshness ? (
          <Stack component="span" direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <span>{label}</span>
            <FreshnessIcon sx={{ fontSize: '14px' }} aria-hidden />
            <Box component="span" sx={visuallyHidden}>{freshness}</Box>
          </Stack>
        ) : label}
        aria-label={onClick ? [`${t('repo.expansion_health.title')}: ${label}`, freshness].filter(Boolean).join(', ') : undefined}
        onClick={onClick ? event => {
          event.stopPropagation();
          onClick(event);
        } : undefined}
        sx={{ height: '22px', fontWeight: 600, ...(freshness ? { borderStyle: 'dashed' } : {}) }}
      />
    </Tooltip>
  );
};

export default ExpansionHealthChip;
