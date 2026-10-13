import React from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, Link } from '@mui/material';
import { Copyright as CopyrightIcon } from '@mui/icons-material';
import { get } from 'lodash';
import {
  getAppliedServerConfig
} from '../../common/utils';
import { TERMS_OF_USE_URL, PRIVACY_POLICY_URL } from '../../common/constants';
import AppVersions from './AppVersions';
import './Footer.scss';

const DEFAULT_FOOTER_TEXT = `${new Date().getFullYear()} Open Concept Lab`;

// On every page, signed in or not: using TBv3 means accepting the Terms of Use.
const LEGAL_LINKS = [
  { labelKey: 'common.terms_of_use', href: TERMS_OF_USE_URL },
  { labelKey: 'common.privacy_policy', href: PRIVACY_POLICY_URL },
];

// The footer's height in Footer.scss while it fits on one row. Narrower
// screens stack it onto more rows, and --app-height in index.scss subtracts
// the extra, so pages end above it.
const ROW_HEIGHT = 30;
const EXTRA_HEIGHT_VAR = '--footer-extra-height';

const Footer = () => {
  const { t } = useTranslation();
  const ref = React.useRef(null);
  const text = get(getAppliedServerConfig(), 'info.site.footerText', DEFAULT_FOOTER_TEXT);
  const isDefault = text === DEFAULT_FOOTER_TEXT;

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el)
      return;
    const root = document.documentElement.style;
    const update = () => root.setProperty(EXTRA_HEIGHT_VAR, `${Math.max(0, el.offsetHeight - ROW_HEIGHT)}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.removeProperty(EXTRA_HEIGHT_VAR);
    };
  }, []);

  return (
    <footer ref={ref} className='col-sm-12 footer-container flex-vertical-center' style={{textAlign: 'right'}}>
      <div className='footer-legal flex-vertical-center'>
        {LEGAL_LINKS.map(({ labelKey, href }, i) => (
          <React.Fragment key={href}>
            {i > 0 && <Divider orientation='vertical' className='footer-divider-vertical' />}
            {/* Bootstrap's a:hover and a:focus color would otherwise win over MUI's */}
            <Link href={href} target='_blank' rel='noopener noreferrer' underline='hover' sx={{ whiteSpace: 'nowrap', '&:hover, &:focus': { color: 'primary.main' } }}>
              {t(labelKey)}
            </Link>
          </React.Fragment>
        ))}
      </div>
      <Divider orientation='vertical' className='footer-divider-vertical' />
      <span className='flex-vertical-center'>
        {
          isDefault &&
          <CopyrightIcon fontSize='small'/>
        }
        <span className='footer-company'>{text}</span>
      </span>
      <Divider orientation='vertical' className='footer-divider-vertical' />
      <AppVersions />
    </footer>
  );

}

export default Footer;
