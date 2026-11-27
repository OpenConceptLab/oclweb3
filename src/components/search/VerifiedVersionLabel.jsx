import React from 'react';
import { useTranslation } from 'react-i18next';
import VerifiedIcon from '@mui/icons-material/GppGoodOutlined';
import { VERIFIED_COLORS } from '../repos/verifiedColors';

// A concept result's version with a small Verified mark inside it. It sits in the repository button, so it isn't
// a link of its own.
const VerifiedVersionLabel = ({ version }) => {
  const { t } = useTranslation();
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'}}>
      {version}
      <span style={{display: 'inline-flex', alignItems: 'center', gap: '3px', color: VERIFIED_COLORS.dark, fontFamily: 'Roboto, Arial, sans-serif', fontSize: '0.75rem', fontWeight: 500}}>
        <VerifiedIcon sx={{fontSize: '14px', color: VERIFIED_COLORS.main, alignSelf: 'center'}} />
        {t('repo.verification.verified')}
      </span>
    </span>
  );
};

export default VerifiedVersionLabel;
