import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { formatDate } from '../../common/utils';
import ExpansionHealthChip from './ExpansionHealthChip';
import {
  FRESHNESS_KEYS,
  getDefaultExpansionHealthStatus,
  getStateDescriptionKey,
  getHeadResolvedRepositories,
  getHealthReasons,
  getMemberClassCounts,
  getMultipleNamedVersions
} from './expansionHealth';

const MEMBER_CLASSES = ['release', 'head', 'unreleased', 'interim', 'mismatch', 'ambiguous', 'unattributed'];
// i18next would otherwise escape the slashes in a formatted date
const UNESCAPED = { interpolation: { escapeValue: false } };

const linkSx = {
  '& a': { color: 'primary.main', textDecoration: 'none', wordBreak: 'break-word' },
  '& a:hover': { textDecoration: 'underline' }
};

// a deleted version has no page to link to
const URLList = ({ urls, linked = true }) => urls.length ? (
  <Box component="ul" sx={{ pl: 2.5, mt: 0.5, mb: 0, ...linkSx }}>
    {urls.map(url => (
      <li key={url}>
        <Typography component="span" sx={{ fontSize: '13px', wordBreak: 'break-word' }}>
          {linked ? <a href={url} target="_blank" rel="noreferrer">{url}</a> : url}
        </Typography>
      </li>
    ))}
  </Box>
) : null;

const SubHeading = ({ children }) => (
  <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'surface.contrastText', mt: 1.5 }}>
    {children}
  </Typography>
);

// The stored health of an expansion: its state, why, and how its members were judged
const ExpansionHealthSection = ({ expansion }) => {
  const { t } = useTranslation();
  const status = getDefaultExpansionHealthStatus(expansion);
  if (!status) return null;

  const health = expansion.health;
  const reasons = getHealthReasons(health);
  const headResolved = getHeadResolvedRepositories(health);
  const multipleNamed = getMultipleNamedVersions(health);
  const memberCounts = getMemberClassCounts(health);
  const description = getStateDescriptionKey(status.state);

  return (
    <Box sx={{ mb: 2 }} data-testid="expansion-health">
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 700, color: 'surface.contrastText' }}>
          {t('repo.expansion_health.title')}
        </Typography>
        <ExpansionHealthChip status={status} />
      </Stack>
      {status.state && FRESHNESS_KEYS[status.freshness] && (
        <Typography sx={{ fontSize: '13px', color: 'warning.main', mt: 0.5 }}>
          {t(FRESHNESS_KEYS[status.freshness])}
        </Typography>
      )}
      <Typography sx={{ fontSize: '13px', color: 'secondary.main', mt: 0.5 }}>
        {t(description)}
      </Typography>

      {reasons.length > 0 && (
        <Box component="ul" sx={{ pl: 2.5, mt: 0.5, mb: 0 }}>
          {reasons.map(reason => (
            <li key={reason.code}>
              <Typography sx={{ fontSize: '13px' }}>
                {t(reason.key, { count: reason.count, code: reason.code })}
              </Typography>
              {(reason.headConcepts > 0 || reason.headMappings > 0) && (
                <Typography sx={{ fontSize: '12px', color: 'secondary.main' }}>
                  {t('repo.expansion_health.head_objects', { concepts: reason.headConcepts, mappings: reason.headMappings })}
                </Typography>
              )}
              <URLList urls={reason.urls} linked={reason.code !== 'locked_version_deleted'} />
              {reason.hiddenCount > 0 && (
                <Typography sx={{ fontSize: '12px', color: 'secondary.main' }}>
                  {t('repo.expansion_health.hidden_versions', { count: reason.hiddenCount })}
                </Typography>
              )}
            </li>
          ))}
        </Box>
      )}

      {headResolved.length > 0 && (
        <>
          <SubHeading>{t('repo.expansion_health.head_resolved_repositories')}</SubHeading>
          <URLList urls={headResolved} />
        </>
      )}
      {multipleNamed.length > 0 && (
        <>
          <SubHeading>{t('repo.expansion_health.multiple_named_versions')}</SubHeading>
          <URLList urls={multipleNamed} />
        </>
      )}
      {Object.keys(memberCounts).length > 0 && (
        <>
          <SubHeading>{t('repo.expansion_health.members')}</SubHeading>
          <Box component="ul" sx={{ pl: 2.5, mt: 0.5, mb: 0 }}>
            {MEMBER_CLASSES.filter(memberClass => memberCounts[memberClass]).map(memberClass => (
              <li key={memberClass}>
                <Typography sx={{ fontSize: '13px' }}>
                  {t(`repo.expansion_health.member_${memberClass}`)}: {memberCounts[memberClass].toLocaleString()}
                </Typography>
              </li>
            ))}
          </Box>
        </>
      )}
      {health?.computed_at && (
        <Typography sx={{ fontSize: '12px', color: 'secondary.main', mt: 1 }}>
          {t('repo.expansion_health.checked_at', { date: formatDate(health.computed_at), ...UNESCAPED })}
        </Typography>
      )}
    </Box>
  );
};

export default ExpansionHealthSection;
