import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Chip, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/GppGoodOutlined';

import { parseRepoPath, buildRepoPath } from '../../common/repoRoute';
import { isVerified } from './aboutSections';

// Sits next to a verified version's name, in ProcessingFlag's pattern, and opens the Verification
// section of that version's About tab. Its shield icon is its own: VerifiedOutlined means "released".
const VerifiedChip = ({ version, size = 'small', sx }) => {
  const { t } = useTranslation();
  const location = useLocation();

  if(!isVerified(version)) return null;

  const versionId = version.version || version.id;
  const href = buildRepoPath(parseRepoPath(location.pathname), {version: versionId, expansion: '', tab: 'about', resource: ''}) + '#verification';

  return (
    <Tooltip title={t('repo.verification.chip_tooltip')}>
      <Chip
        size={size}
        variant="outlined"
        color="success"
        icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
        label={t('repo.verification.verified')}
        component={RouterLink}
        to={href}
        clickable
        onClick={event => event.stopPropagation()}
        sx={[{ height: '22px', fontWeight: 600 }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      />
    </Tooltip>
  );
};

export default VerifiedChip;
