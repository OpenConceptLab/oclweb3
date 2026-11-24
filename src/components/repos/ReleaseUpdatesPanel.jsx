import React from 'react';
import { Box, Button as MuiButton, Stack, Typography } from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  WarningAmberOutlined as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { dropVersion } from '../../common/utils';
import {
  UPDATE_CASES,
  getCompareExpansionsURL,
  getComparableExpansion,
  getDeletedLocks,
  getReleaseUpdates,
  isReleasedCollectionVersion
} from './releaseUpdates';

const labelFromVersionUrl = url => {
  const parts = url.split('/').filter(Boolean);
  // URL form: /<orgs|users>/<owner>/<sources|collections>/<short_code>/<version>/
  if (parts.length >= 5) return `${parts[1]} / ${parts[3]}:${parts[4]}`;
  if (parts.length === 4) return `${parts[1]} / ${parts[3]}:HEAD`;
  return url;
};

const linkSx = {
  '& a': { color: 'primary.main', textDecoration: 'none' },
  '& a:hover': { textDecoration: 'underline' }
};

const lineSx = { fontSize: '12px', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', ...linkSx };

// Says why an expansion's locked versions have newer releases, and offers a comparison before a rebuild.
// The lock stays where it is until the owner rebuilds.
const ReleaseUpdatesPanel = ({ expansion, version, expansions, repoUpdates, processing, onCreateSimilar, onRebuild }) => {
  const { t } = useTranslation();
  const updates = getReleaseUpdates(expansion, repoUpdates);
  const deletedLocks = getDeletedLocks(expansion);
  if (!updates.length && !deletedLocks) return null;

  const released = isReleasedCollectionVersion(version);
  const comparable = getComparableExpansion(expansion, expansions);
  const versionURL = version?.version_url || version?.url;
  const compareURL = getCompareExpansionsURL(versionURL, expansion, comparable);

  return (
    <Box sx={{ mt: 1, p: 1.25, borderRadius: '8px', backgroundColor: 'rgba(237, 108, 2, 0.08)' }} data-testid="release-updates">
      {updates.length > 0 && (
        <>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <WarningIcon sx={{ width: 14, height: 14, color: 'warning.main' }} />
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'warning.main' }}>
              {t('repo.resolved_repo_updates_available')}
            </Typography>
          </Stack>
          {updates.map(update => {
            const compareVersionsURL = `${dropVersion(update.newURL)}compare-versions?version1=${update.newURL}&version2=${update.oldURL}`;
            return (
              <Typography key={update.oldURL} component="div" sx={lineSx}>
                <Box component="span" sx={{ fontWeight: 700 }}>{t(UPDATE_CASES[update.case])}:</Box>
                <a href={update.oldURL} target="_blank" rel="noreferrer">{labelFromVersionUrl(update.oldURL)}</a>
                {' → '}
                <a href={update.newURL} target="_blank" rel="noreferrer">{labelFromVersionUrl(update.newURL)}</a>
                <a href={compareVersionsURL} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  ({t('common.compare')} <OpenInNewIcon sx={{ fontSize: '12px' }} />)
                </a>
              </Typography>
            );
          })}
        </>
      )}

      {deletedLocks && (
        <Box sx={{ mt: updates.length ? 1 : 0 }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <WarningIcon sx={{ width: 14, height: 14, color: 'warning.main' }} />
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'warning.main' }}>
              {t('repo.expansion_health.reason_locked_version_deleted', { count: deletedLocks.count })}
            </Typography>
          </Stack>
          {deletedLocks.urls.map(url => (
            <Typography key={url} sx={lineSx}>{labelFromVersionUrl(url)}</Typography>
          ))}
          {deletedLocks.hiddenCount > 0 && (
            <Typography sx={{ fontSize: '12px', mt: 0.5, color: 'secondary.main' }}>
              {t('repo.expansion_health.hidden_versions', { count: deletedLocks.hiddenCount })}
            </Typography>
          )}
        </Box>
      )}

      <Typography sx={{ fontSize: '12px', mt: 1 }}>
        {t('repo.release_updates.lock_stays')} {t('repo.release_updates.compare_first')}
      </Typography>
      {released && (
        <Typography sx={{ fontSize: '12px', mt: 0.5, fontWeight: 700 }}>
          {t('repo.release_updates.released_nudge')}
        </Typography>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 0.5, alignItems: 'center', flexWrap: 'wrap', ...linkSx }}>
        <MuiButton
          size="small"
          variant="text"
          sx={{ minWidth: 0, p: 0, textTransform: 'none', fontWeight: 700 }}
          disabled={processing}
          onClick={() => onCreateSimilar(expansion)}
        >
          {t('repo.create_similar')}
        </MuiButton>
        {compareURL && (
          <Typography component="span" sx={{ fontSize: '13px', fontWeight: 700 }}>
            <a href={compareURL} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              {t('repo.release_updates.compare_with', { mnemonic: comparable.mnemonic })} <OpenInNewIcon sx={{ fontSize: '13px' }} />
            </a>
          </Typography>
        )}
        <MuiButton
          size="small"
          variant="text"
          color={released ? 'secondary' : 'primary'}
          sx={{ minWidth: 0, p: 0, textTransform: 'none', fontWeight: 700 }}
          disabled={processing}
          onClick={() => onRebuild(expansion)}
        >
          {t('repo.rebuild')}
        </MuiButton>
      </Stack>
    </Box>
  );
};

export default ReleaseUpdatesPanel;
