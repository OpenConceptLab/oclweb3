import React from 'react';
import { Box, Button as MuiButton, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import {
  CheckCircleOutlined as DefaultIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon,
  WarningAmberOutlined as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import get from 'lodash/get';

import ProcessingChip from '../common/ProcessingChip';
import { dropVersion, formatDate } from '../../common/utils';
import { formatCount } from './versionsTab.styles';

// eslint-disable-next-line spellcheck/spell-checker
const GRID_COLUMNS = 'minmax(200px, 1.4fr) minmax(160px, 1fr) minmax(160px, 1fr) 40px';

const labelFromVersionUrl = url => {
  const parts = url.split('/').filter(Boolean);
  // URL form: /<orgs|users>/<owner>/<sources|collections>/<short_code>/<version>/
  if (parts.length >= 5) return `${parts[1]} / ${parts[3]}:${parts[4]}`;
  return url;
};

const renderRepoVersionLabel = version => `${version.owner} / ${version.short_code}:${version.version}`;

const getExplicitRepoVersions = expansion => [
  ...(expansion?.explicit_source_versions || []),
  ...(expansion?.explicit_collection_versions || [])
];

const getEvaluatedRepoVersions = expansion => [
  ...(expansion?.evaluated_source_versions || []),
  ...(expansion?.evaluated_collection_versions || [])
];

const RepoVersionList = ({ versions, emptyLabel }) => (
  <Box sx={{ minWidth: 0 }}>
    {versions.length ? versions.map(version => (
      <Typography
        key={version.version_url || `${version.owner}-${version.short_code}-${version.version}`}
        sx={{
          fontSize: '12px',
          lineHeight: 1.5,
          wordBreak: 'break-word',
          '& a': { color: 'primary.main', textDecoration: 'none' },
          '& a:hover': { textDecoration: 'underline' }
        }}
      >
        <a href={`#${version.version_url}`} target="_blank" rel="noreferrer">
          {renderRepoVersionLabel(version)}
        </a>
      </Typography>
    )) : (
      <Typography sx={{ fontSize: '12px', color: 'secondary.main' }}>{emptyLabel}</Typography>
    )}
  </Box>
);

// Inline list of a version's expansions, rendered inside the expanded table row
// instead of a separate dialog — keeps the power-user detail (including exactly
// which resolved repo version changed) one toggle away without leaving the table.
// Laid out as three aligned columns: Expansion ID, Explicit Repo Versions, Evaluated Repo Versions.
const ExpansionRowList = ({
  expansions = [],
  loading,
  isStale,
  processingState,
  getRepoUpdates,
  onSelectExpansion,
  onOpenExpansionMenu,
  onRebuild
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (!expansions.length) {
    return (
      <Typography sx={{ fontSize: '13px', color: 'secondary.main', py: 1, px: 1 }}>
        {t('repo.no_expansions_message')}
      </Typography>
    );
  }

  return (
    <Box sx={{ py: 0.5 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLUMNS, columnGap: 2, px: 1, pb: 0.5 }}>
        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'secondary.main', textTransform: 'uppercase' }}>
          {t('repo.expansions')}
        </Typography>
        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'secondary.main', textTransform: 'uppercase' }}>
          {t('repo.explicit_repo_versions')}
        </Typography>
        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'secondary.main', textTransform: 'uppercase' }}>
          {t('repo.evaluated_repo_versions')}
        </Typography>
        <span />
      </Box>

      {expansions.map(expansion => {
        const repoUpdates = getRepoUpdates?.(expansion);
        const hasRepoUpdates = repoUpdates && Object.keys(repoUpdates).length > 0;
        const explicitVersions = getExplicitRepoVersions(expansion);
        const evaluatedVersions = getEvaluatedRepoVersions(expansion);

        return (
          <Box
            key={expansion.url}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'surface.nv80',
              py: 1,
              px: 1,
              '&:last-of-type': { borderBottom: 'none' }
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLUMNS, columnGap: 2, alignItems: 'start' }}>
              <Box onClick={() => onSelectExpansion(expansion)} sx={{ minWidth: 0, cursor: 'pointer' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'primary.main' }}>
                    {expansion.mnemonic}
                  </Typography>
                  {(expansion.default || expansion.auto) && (
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <DefaultIcon sx={{ width: 14, height: 14, color: 'primary.main' }} />
                      <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}>
                        {t('common.default')}
                      </Typography>
                    </Stack>
                  )}
                  {isStale(expansion) && (
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <WarningIcon sx={{ width: 14, height: 14, color: 'error.main' }} />
                      <Typography sx={{ fontSize: '11px', color: 'error.main' }}>{t('repo.stale')}</Typography>
                    </Stack>
                  )}
                  {processingState(expansion) && (
                    <ProcessingChip processed={processingState(expansion) === 'processed'} fading={processingState(expansion) === 'processed'} />
                  )}
                </Stack>
                <Typography sx={{ fontSize: '12px', color: 'secondary.main', mt: 0.25 }}>
                  {formatCount(get(expansion, 'summary.active_concepts'))} {t('search.concepts').toLowerCase()}
                  {' · '}
                  {formatCount(get(expansion, 'summary.active_mappings'))} {t('search.mappings').toLowerCase()}
                  {expansion.created_on ? ` · ${formatDate(expansion.created_on)}` : ''}
                </Typography>
              </Box>

              <RepoVersionList versions={explicitVersions} emptyLabel={t('common.none')} />
              <RepoVersionList versions={evaluatedVersions} emptyLabel={t('common.none')} />

              <IconButton
                size="small"
                onClick={event => {
                  event.stopPropagation();
                  onOpenExpansionMenu(event, expansion);
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>

            {hasRepoUpdates && (
              <Box
                sx={{
                  mt: 1,
                  p: 1.25,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(237, 108, 2, 0.08)'
                }}
              >
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <WarningIcon sx={{ width: 14, height: 14, color: 'warning.main' }} />
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'warning.main' }}>
                    {t('repo.resolved_repo_updates_available')}
                  </Typography>
                </Stack>
                {Object.entries(repoUpdates).map(([oldUrl, newUrl]) => {
                  const compareUrl = `#${dropVersion(newUrl)}compare-versions?version1=${newUrl}&version2=${oldUrl}`;
                  return (
                    <Typography
                      key={oldUrl}
                      sx={{
                        fontSize: '12px',
                        mt: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        flexWrap: 'wrap',
                        '& a': { color: 'primary.main', textDecoration: 'none' },
                        '& a:hover': { textDecoration: 'underline' }
                      }}
                    >
                      <a href={`#${oldUrl}`} target="_blank" rel="noreferrer">{labelFromVersionUrl(oldUrl)}</a>
                      {' → '}
                      <a href={`#${newUrl}`} target="_blank" rel="noreferrer">{labelFromVersionUrl(newUrl)}</a>
                      <a href={compareUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        ({t('common.compare')} <OpenInNewIcon sx={{ fontSize: '12px' }} />)
                      </a>
                    </Typography>
                  );
                })}
                <MuiButton
                  size="small"
                  variant="text"
                  sx={{ mt: 0.5, minWidth: 0, p: 0, textTransform: 'none', fontWeight: 700 }}
                  onClick={() => onRebuild(expansion)}
                >
                  {t('repo.rebuild')}
                </MuiButton>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default ExpansionRowList;
