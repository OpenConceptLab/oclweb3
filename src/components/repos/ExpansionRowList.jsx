import React from 'react';
import { Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import {
  CheckCircleOutlined as DefaultIcon,
  MoreVert as MoreVertIcon,
  WarningAmberOutlined as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import ProcessingChip from '../common/ProcessingChip';
import ProcessingFlag from './ProcessingFlag';
import ExpansionHealthChip from './ExpansionHealthChip';
import { getDefaultExpansionHealthStatus } from './expansionHealth';
import ReleaseUpdatesPanel from './ReleaseUpdatesPanel';
import { isProcessing, isVersionProcessing } from './processingStages';
import { formatDate } from '../../common/utils';
import { formatCount } from './versionsTab.styles';
import { getExpansionCount } from './expansionCounts';

// on a phone the two version lists go under the expansion, each with its own heading
const rowGridSx = {
  display: 'grid',
  columnGap: 2,
  // eslint-disable-next-line spellcheck/spell-checker
  gridTemplateColumns: { xs: 'minmax(0, 1fr) 40px', sm: 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) 40px' },
  gridTemplateAreas: { xs: '"name menu" "explicit explicit" "evaluated evaluated"', sm: '"name explicit evaluated menu"' }
};
const columnHeadingSx = { fontSize: '11px', fontWeight: 700, color: 'secondary.main', textTransform: 'uppercase' };

const renderRepoVersionLabel = version => `${version.owner} / ${version.short_code}:${version.version}`;

const getExplicitRepoVersions = expansion => [
  ...(expansion?.explicit_source_versions || []),
  ...(expansion?.explicit_collection_versions || [])
];

const getEvaluatedRepoVersions = expansion => [
  ...(expansion?.evaluated_source_versions || []),
  ...(expansion?.evaluated_collection_versions || [])
];

const RepoVersionList = ({ versions, emptyLabel, heading, area }) => (
  <Box sx={{ minWidth: 0, gridArea: area, mt: { xs: 0.75, sm: 0 } }}>
    <Typography sx={{ ...columnHeadingSx, display: { xs: 'block', sm: 'none' } }}>{heading}</Typography>
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
        <a href={version.version_url} target="_blank" rel="noreferrer">
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
  getStageVersion,
  isMenuOpen,
  getRepoUpdates,
  onSelectExpansion,
  onOpenExpansionMenu,
  onRebuild,
  onCreateSimilar,
  version,
  canEdit
}) => {
  const { t } = useTranslation();

  // all members, and how many are retired once the API says (see expansionCounts.js)
  const getCountText = (expansion, resource) => {
    const count = getExpansionCount(expansion.summary, resource);
    if (Number.isFinite(count.retired))
      return t(`repo.summary_${resource}_with_retired`, { total: formatCount(count.total), retired: formatCount(count.retired) });
    return `${formatCount(count.total)} ${t(`search.${resource}`).toLowerCase()}`;
  };

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
      <Box sx={{ ...rowGridSx, display: { xs: 'none', sm: 'grid' }, px: 1, pb: 0.5 }}>
        <Typography sx={{ ...columnHeadingSx, gridArea: 'name' }}>{t('repo.expansions')}</Typography>
        <Typography sx={{ ...columnHeadingSx, gridArea: 'explicit' }}>{t('repo.explicit_repo_versions')}</Typography>
        <Typography sx={{ ...columnHeadingSx, gridArea: 'evaluated' }}>{t('repo.evaluated_repo_versions')}</Typography>
      </Box>

      {expansions.map(expansion => {
        const repoUpdates = getRepoUpdates?.(expansion);
        const stageVersion = getStageVersion?.(expansion) || null;
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
              '&:last-of-type': { borderBottom: 'none' },
              ...(isMenuOpen?.(expansion) ? { backgroundColor: 'surface.main' } : {})
            }}
          >
            <Box sx={{ ...rowGridSx, alignItems: 'start' }}>
              <Box onClick={() => onSelectExpansion(expansion)} sx={{ minWidth: 0, cursor: 'pointer', gridArea: 'name' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'primary.main' }}>
                    {expansion.mnemonic}
                  </Typography>
                  {expansion.default && (
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <DefaultIcon sx={{ width: 14, height: 14, color: 'primary.main' }} />
                      <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}>
                        {t('common.default')}
                      </Typography>
                    </Stack>
                  )}
                  <ExpansionHealthChip status={getDefaultExpansionHealthStatus(expansion)} onClick={() => onSelectExpansion(expansion)} />
                  {isStale(expansion) && (
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <WarningIcon sx={{ width: 14, height: 14, color: 'error.main' }} />
                      <Typography sx={{ fontSize: '11px', color: 'error.main' }}>{t('repo.stale')}</Typography>
                    </Stack>
                  )}
                  {processingState(expansion) === 'processing' ? (
                    <ProcessingFlag entity={isProcessing(stageVersion) ? stageVersion : expansion} processing />
                  ) : processingState(expansion) && (
                    <ProcessingChip processed={processingState(expansion) === 'processed'} fading={processingState(expansion) === 'processed'} />
                  )}
                </Stack>
                <Typography sx={{ fontSize: '12px', color: 'secondary.main', mt: 0.25 }}>
                  {getCountText(expansion, 'concepts')}
                  {' · '}
                  {getCountText(expansion, 'mappings')}
                  {expansion.created_on ? ` · ${formatDate(expansion.created_on)}` : ''}
                </Typography>
              </Box>

              <RepoVersionList versions={explicitVersions} emptyLabel={t('common.none')} heading={t('repo.explicit_repo_versions')} area="explicit" />
              <RepoVersionList versions={evaluatedVersions} emptyLabel={t('common.none')} heading={t('repo.evaluated_repo_versions')} area="evaluated" />

              <IconButton
                size="small"
                sx={{ gridArea: 'menu', justifySelf: 'end' }}
                onClick={event => {
                  event.stopPropagation();
                  onOpenExpansionMenu(event, expansion);
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>

            {canEdit && (
              <ReleaseUpdatesPanel
                expansion={expansion}
                version={version}
                expansions={expansions}
                repoUpdates={repoUpdates}
                processing={processingState(expansion) === 'processing' || isVersionProcessing(version)}
                onCreateSimilar={onCreateSimilar}
                onRebuild={onRebuild}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default ExpansionRowList;
