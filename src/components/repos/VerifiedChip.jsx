import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Chip, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/GppGoodOutlined';

import { parseRepoPath, buildRepoPath } from '../../common/repoRoute';
import { isVerified } from './aboutSections';
import { VERIFIED_COLORS } from './verifiedColors';

const SIZES = {
  // Same height and corners as the owner, repository and version chips beside it in the header
  large: { height: '36px', borderRadius: '4px', fontSize: '15px', iconSize: '18px', px: '4px' },
  // Same as the small MUI chips it sits beside (Mapper, the processing flag)
  small: { muiSize: 'small', height: '20px', borderRadius: '16px', fontSize: '0.8125rem', iconSize: '14px', px: '0px' },
};

// Sits next to a verified version's name and opens the Verification section of that version's About tab.
// Its shield icon is its own: VerifiedOutlined means "released".
// `onNavigate` runs when the chip is followed, for a parent (the version picker) that has to close first.
// Where the page isn't the repository's (search results), the caller passes the version's About link in `to`
// and a `label` that names the version; the caller has decided the version is verified.
const VerifiedChip = ({ version, size = 'small', sx, onNavigate, to, label }) => {
  const { t } = useTranslation();
  const location = useLocation();

  if(!to && !isVerified(version)) return null;

  const style = SIZES[size] || SIZES.small;
  const href = to || buildRepoPath(parseRepoPath(location.pathname), {version: version.version || version.id, expansion: '', tab: 'about', resource: ''}) + '#verification';

  return (
    <Tooltip title={t('repo.verification.chip_tooltip')}>
      <Chip
        variant="outlined"
        size={style.muiSize || 'medium'}
        icon={<VerifiedIcon sx={{ fontSize: `${style.iconSize} !important`, color: `${VERIFIED_COLORS.dark} !important` }} />}
        label={label || t('repo.verification.verified')}
        component={RouterLink}
        to={href}
        clickable
        onClick={event => {
          event.stopPropagation();
          onNavigate?.();
        }}
        sx={[{
          height: style.height,
          borderRadius: style.borderRadius,
          px: style.px,
          fontSize: style.fontSize,
          fontWeight: 500,
          color: VERIFIED_COLORS.dark,
          borderColor: VERIFIED_COLORS.main,
          backgroundColor: VERIFIED_COLORS.background,
          textDecoration: 'none',
          '&:hover, &.MuiChip-clickable:hover': { backgroundColor: VERIFIED_COLORS.border, textDecoration: 'none' },
        }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      />
    </Tooltip>
  );
};

export default VerifiedChip;
