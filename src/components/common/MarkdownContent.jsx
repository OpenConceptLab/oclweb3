/* eslint-disable spellcheck/spell-checker */
import React from 'react';
import { Box } from '@mui/material';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';

// defaultSchema already allows `id`/`align` on any element (needed for our explicit
// `<a id="...">` anchors and GFM table alignment) -- the only thing it doesn't allow is
// target/rel on links, which rehypeExternalLinks adds AFTER sanitizing (see below).
//
// clobberPrefix is overridden to '': hast-util-sanitize's default rewrites every `id` to
// `user-content-<id>` (GitHub's anti-clobbering convention), which would silently break our
// `<a id="concepts-added">`-style anchors against the '#concepts-added' hrefs the table of
// contents links to. We don't need that protection here -- this is a self-contained rendered
// document, not markdown embedded alongside other page chrome it could clobber -- and every
// other sanitization rule (stripped tags/scripts/dangerous attributes) still applies.
const SANITIZE_SCHEMA = { ...defaultSchema, clobberPrefix: '' };

// Marks http(s) links as external (new tab, no opener/referrer leak) directly in the HTML
// output, so no per-click JS is needed for this at render time.
function rehypeExternalLinks() {
  return tree => {
    visit(tree, 'element', node => {
      if (node.tagName === 'a' && typeof node.properties?.href === 'string' && /^https?:\/\//i.test(node.properties.href)) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
    });
  };
}

// Rendering markdown via ReactMarkdown builds one React component per node, which for a
// changelog with tens of thousands of table rows means tens of thousands of React elements to
// reconcile and mount -- that's what makes very large changelogs freeze the tab. Producing a
// plain HTML string once (memoized) and injecting it via dangerouslySetInnerHTML instead lets
// the browser's native HTML parser/layout engine handle it, which is dramatically cheaper for
// large documents than an equivalent React tree.
const markdownToHtml = markdown => unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, SANITIZE_SCHEMA)
  .use(rehypeSlug)
  .use(rehypeExternalLinks)
  .use(rehypeStringify)
  .processSync(markdown || '')
  .toString();

const MarkdownContent = ({ markdown }) => {
  const html = React.useMemo(() => markdownToHtml(markdown), [markdown]);
  const containerRef = React.useRef(null);

  // Self-contained hash-link scrolling: only handles it (and stops it there) when the target
  // anchor exists within this same rendered block. If it doesn't (e.g. the link points into a
  // different, not-yet-rendered section under a lazy-section wrapper), it's left alone so an
  // ancestor handler can deal with it -- see LazyMarkdownDocument.
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
