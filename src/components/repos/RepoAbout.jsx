import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Chip, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import CopyIcon from '@mui/icons-material/ContentCopyOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VerifiedIcon from '@mui/icons-material/GppGood';
import PassedIcon from '@mui/icons-material/CheckCircle';

import MarkdownContent from '../common/MarkdownContent';
import { OperationsContext } from '../app/LayoutContext';
import { copyToClipboard, formatDate } from '../../common/utils';
import {
  getAboutSections, getSourceRows, getOverviewText, getVerification, getVerificationChecks,
  getOverviewDescription, getVerificationNotes, getCheckLineKey, VERIFIED_REPOSITORIES_DOCS_URL
} from './aboutSections';
import { VERIFIED_COLORS } from './verifiedColors';

// eslint-disable-next-line spellcheck/spell-checker
const CHECKS_GRID = 'repeat(3, minmax(0, 1fr))';
// eslint-disable-next-line spellcheck/spell-checker
const FIELDS_GRID = 'minmax(110px, 190px) minmax(0, 1fr)';

const SECTION_SX = { border: '1px solid', borderColor: 'surface.nv80', borderRadius: '12px', overflow: 'hidden' };

const SectionHeading = ({ id, title, color, variant = 'h2' }) => {
  const { t } = useTranslation();
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25 }}>
      <Typography component={variant} sx={{ fontSize: '20px', fontWeight: 500, color: color || 'surface.dark', m: 0 }}>{title}</Typography>
      <IconButton component="a" href={`#${id}`} size="small" aria-label={t('repo.about_tab.link_to_section', { section: title })} sx={{ color: color || 'secondary.main', opacity: 0.8 }}>
        <LinkIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
};

const ExternalLink = ({ href, children, sx }) => (
  <Link href={href} target="_blank" rel="noopener noreferrer" sx={sx}>{children}</Link>
);

const VerificationSection = ({ repo }) => {
  const { t } = useTranslation();
  const { setAlert } = React.useContext(OperationsContext);
  const verification = getVerification(repo);
  const checks = getVerificationChecks(verification);
  const notes = getVerificationNotes(repo);
  const facts = [
    { key: 'publisher', value: repo.publisher },
    { key: 'release', value: repo.version && repo.version !== 'HEAD' ? repo.version : '' },
    { key: 'verified_at', value: verification.verified_at ? formatDate(verification.verified_at) : '' },
  ].filter(fact => fact.value);

  const onCopyHash = () => {
    copyToClipboard(verification.hash);
    setAlert({ severity: 'success', message: t('repo.verification.record_copied') });
  };

  return (
    <Box component="section" id="verification" sx={{ ...SECTION_SX, borderColor: VERIFIED_COLORS.border }}>
      <Stack direction="row" sx={{ gap: 2, p: '20px 24px', bgcolor: VERIFIED_COLORS.background, alignItems: 'flex-start' }}>
        <VerifiedIcon sx={{ fontSize: 44, color: VERIFIED_COLORS.main, flex: 'none' }} />
        <Stack sx={{ gap: 0.75, minWidth: 0, flex: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', columnGap: 1.5 }}>
            <SectionHeading id="verification" title={t('repo.verification.verified')} color={VERIFIED_COLORS.dark} />
            <ExternalLink href={VERIFIED_REPOSITORIES_DOCS_URL} sx={{ ml: 'auto', display: 'inline-flex', alignItems: 'center', gap: 0.75, color: VERIFIED_COLORS.dark, textDecorationColor: VERIFIED_COLORS.dark, fontWeight: 500 }}>
              {t('repo.verification.what_verified_means')}
              <OpenInNewIcon sx={{ fontSize: 16 }} />
            </ExternalLink>
          </Stack>
          <Typography sx={{ fontSize: '18px', fontWeight: 500, color: 'surface.dark' }}>{t('repo.verification.headline')}</Typography>
          <Typography sx={{ fontSize: '15px' }}>{t('repo.verification.detail')}</Typography>
          {
            facts.length > 0 &&
              <Box component="dl" sx={{ m: '4px 0 0', display: 'flex', flexWrap: 'wrap', columnGap: 3.5, rowGap: 0.5, fontSize: '14px' }}>
                {
                  facts.map(fact => (
                    <Stack direction="row" key={fact.key} sx={{ gap: 0.75 }}>
                      <Box component="dt" sx={{ color: VERIFIED_COLORS.label }}>{t(`repo.verification.${fact.key}`)}</Box>
                      <Box component="dd" sx={{ m: 0, fontWeight: 500, color: 'surface.dark' }}>{fact.value}</Box>
                    </Stack>
                  ))
                }
              </Box>
          }
        </Stack>
      </Stack>
      <Stack sx={{ p: '20px 24px 22px', gap: 2.75 }}>
        {
          checks.length > 0 &&
            <Box component="ul" aria-label={t('repo.verification.checks_label')} sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', md: CHECKS_GRID }, gap: '16px 20px' }}>
              {
                checks.map(check => (
                  <Stack component="li" direction="row" key={check} sx={{ gap: 1.25, alignItems: 'flex-start' }}>
                    <PassedIcon role="img" aria-label={t('repo.verification.passed')} sx={{ color: VERIFIED_COLORS.main, fontSize: 22, flex: 'none', mt: '1px' }} />
                    <Stack sx={{ gap: 0.25, minWidth: 0 }}>
                      <ExternalLink href={`${VERIFIED_REPOSITORIES_DOCS_URL}#${check}`} sx={{ fontSize: '15px', fontWeight: 500, color: 'surface.dark', textDecorationColor: '#c8c5d0', textUnderlineOffset: '3px' }}>
                        {t(`repo.verification.checks.${check}.title`)}
                      </ExternalLink>
                      <Typography sx={{ fontSize: '13.5px', overflowWrap: 'anywhere' }}>{t(`repo.verification.checks.${check}.${getCheckLineKey(check, notes)}`)}</Typography>
                    </Stack>
                  </Stack>
                ))
              }
            </Box>
        }
        {
          notes &&
            <Stack sx={{ gap: 1 }}>
              <Typography component="h3" sx={{ fontSize: '15px', fontWeight: 500, color: 'surface.dark', m: 0 }}>{t('repo.verification.what_ocl_added')}</Typography>
              <MarkdownContent markdown={notes} />
            </Stack>
        }
        <Stack direction="row" sx={{ pt: 1.75, borderTop: '1px solid', borderColor: 'surface.nv80', flexWrap: 'wrap', alignItems: 'center', columnGap: 2.5, rowGap: 0.5, fontSize: '13px', color: 'secondary.main' }}>
          {
            verification.process &&
              <span>
                {t('repo.verification.process')}{' '}
                <ExternalLink href={`${VERIFIED_REPOSITORIES_DOCS_URL}#what-ocl-checks`} sx={{ fontFamily: 'monospace', fontSize: '12.5px' }}>{verification.process}</ExternalLink>
              </span>
          }
          {
            verification.hash &&
              <Stack component="span" direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                {t('repo.verification.record')}
                <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '12.5px', color: 'surface.dark', overflowWrap: 'anywhere' }}>{verification.hash}</Box>
                <Tooltip title={t('repo.verification.copy_record')}>
                  <IconButton size="small" aria-label={t('repo.verification.copy_record')} onClick={onCopyHash}>
                    <CopyIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
          }
          <Box component="span" sx={{ flexBasis: '100%' }}>
            {t('repo.verification.fine_print')}{' '}
            <ExternalLink href={`${VERIFIED_REPOSITORIES_DOCS_URL}#what-verified-covers`}>{t('repo.verification.what_verified_covers')}</ExternalLink>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

const OverviewSection = ({ repo }) => {
  const { t } = useTranslation();
  return (
    <Stack component="section" id="overview" sx={{ ...SECTION_SX, p: '20px 24px 24px', gap: 1.5 }}>
      <SectionHeading id="overview" title={t('repo.about_tab.overview')} />
      {
        getOverviewText(repo) ?
          <MarkdownContent markdown={getOverviewText(repo)} /> :
          <Typography sx={{ fontSize: '15px', lineHeight: 1.6, color: 'surface.dark', whiteSpace: 'pre-line' }}>{getOverviewDescription(repo)}</Typography>
      }
    </Stack>
  );
};

const SourceValue = ({ item }) => {
  const { t } = useTranslation();
  if(item.release)
    return <span>{item.text && item.date ? t('repo.about_tab.release_value', { version: item.text, date: formatDate(item.date) }) : (item.text || formatDate(item.date))}</span>;
  if(item.code)
    return <span>{t(`repo.about_tab.hierarchy_meaning.${item.text}`, { defaultValue: item.text })}</span>;
  if(item.href)
    return <span>{item.prefix}<ExternalLink href={item.href}>{item.text}</ExternalLink></span>;
  return <span>{item.text}</span>;
};

const SourceSection = ({ repo }) => {
  const { t } = useTranslation();
  const rows = getSourceRows(repo);
  return (
    <Stack component="section" id="source" sx={{ ...SECTION_SX, p: '20px 24px 24px', gap: 2 }}>
      <SectionHeading id="source" title={t('repo.about_tab.source')} />
      <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: FIELDS_GRID, columnGap: 2.5, rowGap: 1.75, fontSize: '14px' }}>
        {
          rows.map(row => (
            <React.Fragment key={row.key}>
              <Box component="dt" sx={{ color: 'secondary.main' }}>{t(`repo.about_tab.fields.${row.key}`)}</Box>
              <Box component="dd" sx={{ m: 0, color: 'surface.dark', overflowWrap: 'anywhere' }}>
                {
                  row.items.map((item, index) => (
                    <Box key={index} sx={{ display: 'block' }}><SourceValue item={item} /></Box>
                  ))
                }
              </Box>
            </React.Fragment>
          ))
        }
      </Box>
    </Stack>
  );
};

const SECTION_COMPONENTS = {
  verification: VerificationSection,
  overview: OverviewSection,
  source: SourceSection,
};

// The repository About tab (ocl_issues#1892): it follows the selected version, and each section has its own link.
const RepoAbout = ({ repo, height }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const sections = getAboutSections(repo);

  React.useEffect(() => {
    const id = (location.hash || '').slice(1);
    if(id && sections.includes(id))
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, [location.hash, repo?.version_url || repo?.url]);

  if(!sections.length)
    return null;

  return (
    <Box sx={{ height: height || 'auto', overflow: 'auto' }}>
      <Stack sx={{ p: '20px 24px 28px', gap: 3 }}>
        {
          sections.length > 1 &&
            <Stack component="nav" direction="row" aria-label={t('repo.about_tab.on_this_page')} sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              <Typography component="span" sx={{ color: 'secondary.main', mr: 0.5 }}>{t('repo.about_tab.on_this_page')}</Typography>
              {
                sections.map(section => (
                  <Chip key={section} component="a" href={`#${section}`} clickable label={t(`repo.about_tab.${section}`)} sx={{ height: '36px', borderRadius: '18px', px: '2px', fontSize: '14px', fontWeight: 500, color: 'primary.20', backgroundColor: 'primary.95', textDecoration: 'none', '&:hover': { backgroundColor: 'primary.90', textDecoration: 'none' } }} />
                ))
              }
            </Stack>
        }
        {
          sections.map(section => {
            const Section = SECTION_COMPONENTS[section];
            return <Section key={section} repo={repo} />;
          })
        }
      </Stack>
    </Box>
  );
};

export default RepoAbout;
