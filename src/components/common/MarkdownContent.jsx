/* eslint-disable spellcheck/spell-checker */
import React from 'react';
import { Box } from '@mui/material';
import { markdownToHtml } from './markdownPipeline';

const MarkdownContent = ({ markdown }) => {
  const html = React.useMemo(() => markdownToHtml(markdown), [markdown]);
  const containerRef = React.useRef(null);

  const handleClick = React.useCallback(event => {
    const anchor = event.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    if (!href.startsWith('#')) return;
    const target = containerRef.current?.querySelector(`#${CSS.escape(href.slice(1))}`);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <Box
      ref={containerRef}
      onClick={handleClick}
      sx={{
        '& h1': { fontSize: '1.25rem', fontWeight: 700, mt: 0, mb: 1, lineHeight: 1.3 },
        '& h2': { fontSize: '1rem', fontWeight: 700, mt: 2.5, mb: 1, lineHeight: 1.3 },
        '& h3': { fontSize: '0.875rem', fontWeight: 700, mt: 2.5, mb: 1, lineHeight: 1.3 },
        '& p': { my: 1, lineHeight: 1.6, fontSize: '0.875rem' },
        '& a': { color: 'primary.main' },
        '& ul, & ol': { my: 1, pl: 3 },
        '& li': { lineHeight: 1.6, my: 0.25, fontSize: '0.875rem' },
        '& hr': {
          my: 2,
          border: 0,
          borderTop: '1px solid',
          borderColor: 'divider'
        },
        '& blockquote': {
          borderLeft: '3px solid',
          borderColor: 'primary.main',
          pl: 1.5,
          my: 1.5,
          color: 'text.secondary',
          ml: 0
        },
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          my: 2,
          border: '1px solid',
          borderColor: 'surface.nv80'
        },
        '& th, & td': {
          border: '1px solid',
          borderColor: 'surface.nv80',
          padding: '6px 13px',
          textAlign: 'left',
          verticalAlign: 'top'
        },
        '& th': {
          fontWeight: 700,
          backgroundColor: 'background.paper'
        },
        '& tr:nth-of-type(even)': {
          backgroundColor: 'action.hover'
        },
        '& pre': {
          my: 2,
          p: 1.5,
          overflow: 'auto',
          borderRadius: 1,
          bgcolor: 'surface.main',
          fontFamily: 'monospace'
        },
        '& :not(pre) > code': {
          fontFamily: 'monospace',
          px: 0.5,
          bgcolor: 'surface.main',
          borderRadius: '3px'
        }
      }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownContent;
