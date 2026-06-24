import React from 'react';
import { Box, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownContent = ({ markdown }) => (
  <Box
    sx={{
      '& a': { color: 'primary.main' },
      '& p': { my: 1, lineHeight: 1.6 },
      '& ul, & ol': { my: 1, pl: 3 },
      '& li': { lineHeight: 1.6, my: 0.25 },
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
      }
    }}
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <Typography variant="h6" sx={{ mt: 0, mb: 1, fontWeight: 700 }}>{children}</Typography>,
        h2: ({ children }) => <Typography variant="subtitle1" sx={{ mt: 2.5, mb: 1, fontWeight: 700 }}>{children}</Typography>,
        h3: ({ children }) => <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 1, fontWeight: 700 }}>{children}</Typography>,
        p: ({ children }) => <Typography variant="body2">{children}</Typography>,
        code: ({ inline, children }) => inline ? (
          <Box component="code" sx={{ fontFamily: 'monospace', px: 0.5, bgcolor: 'surface.main', borderRadius: '3px' }}>
            {children}
          </Box>
        ) : (
          <Box
            component="pre"
            sx={{
              my: 2,
              p: 1.5,
              overflow: 'auto',
              borderRadius: 1,
              bgcolor: 'surface.main'
            }}
          >
            <code>{children}</code>
          </Box>
        ),
        a: ({ href, children, ...props }) => {
          const isExternal = /^https?:\/\//i.test(href || '');
          return (
            <a
              href={href}
              {...props}
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {children}
            </a>
          );
        }
      }}
    >
      {markdown || ''}
    </ReactMarkdown>
  </Box>
);

export default MarkdownContent;
