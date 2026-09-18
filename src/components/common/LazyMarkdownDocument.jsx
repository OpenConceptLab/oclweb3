import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ExpandMore as ExpandIcon } from '@mui/icons-material';
import MarkdownContent from './MarkdownContent';

// Must match the top-level '## <Title>' headings changelog_markdown.py actually emits for
// diff content (Overview/Summary/Contents stay in the always-visible front matter -- they're
// small and needed for orientation/navigation regardless of diff size).
const COLLAPSIBLE_SECTIONS = ['Concepts', 'Names', 'Descriptions', 'Translations', 'Mappings'];

const HEADING_RE = /^##\s+(.+?)\s*$/;
const HIGHLIGHT_RE = /^\*(.+)\*\s*$/;

// Splits the full changelog markdown into an always-rendered front matter chunk (title,
// overview, summary table, table of contents) and one chunk per collapsible section, without
// ever parsing markdown -- this is a plain line split, so it's cheap even for a multi-MB doc.
//
// Each section's own '## <Title>' heading and its one-line '*N additions, ...*' highlight are
// pulled out (not just read) rather than left in the body: both are already shown on the
// AccordionSummary, so leaving them in would render them a second time once expanded.
const splitIntoSections = markdown => {
  const lines = (markdown || '').split('\n');
  const frontMatterLines = [];
  const sections = [];
  let current = null;

  lines.forEach(line => {
    const match = HEADING_RE.exec(line);
    const title = match ? match[1].trim() : null;
    if (title && COLLAPSIBLE_SECTIONS.includes(title)) {
      if (current) sections.push(current);
      current = { title, bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    } else {
      frontMatterLines.push(line);
    }
  });
  if (current) sections.push(current);

  return {
    frontMatter: frontMatterLines.join('\n'),
    sections: sections.map(({ title, bodyLines }) => {
      const contentLines = [...bodyLines];
      const highlightIndex = contentLines.findIndex(line => HIGHLIGHT_RE.test(line));
      const highlight = highlightIndex === -1 ? '' : HIGHLIGHT_RE.exec(contentLines[highlightIndex])[1];
      if (highlightIndex !== -1) contentLines.splice(highlightIndex, 1);
      return { title, highlight, markdown: contentLines.join('\n') };
    })
  };
};

/**
 * Renders a large changelog markdown document without paying to parse/paint sections the
 * reader never opens: everything after the table of contents is split into per-section
 * accordions, and a section's markdown is only parsed (via MarkdownContent) the first time it's
 * expanded. Table-of-contents / cross-section hash links (e.g. '#concepts-added') expand the
 * right section on demand before scrolling to it.
 */
const LazyMarkdownDocument = ({ markdown }) => {
  const { frontMatter, sections } = React.useMemo(() => splitIntoSections(markdown), [markdown]);
  const [expanded, setExpanded] = React.useState({});
  const [opened, setOpened] = React.useState({});
  const [pendingScrollId, setPendingScrollId] = React.useState(null);
  const containerRef = React.useRef(null);

  const expandSection = React.useCallback(title => {
    setExpanded(prev => (prev[title] ? prev : { ...prev, [title]: true }));
    setOpened(prev => (prev[title] ? prev : { ...prev, [title]: true }));
  }, []);

  // Runs after the (possibly newly-expanded) section has had a chance to mount before we try
  // to find and scroll to its anchor.
  React.useEffect(() => {
    if (!pendingScrollId) return undefined;
    const frame = requestAnimationFrame(() => {
      const target = containerRef.current?.querySelector(`#${CSS.escape(pendingScrollId)}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingScrollId(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pendingScrollId, expanded]);

  const handleClick = React.useCallback(event => {
    const anchor = event.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    if (!href.startsWith('#')) return;
    const id = href.slice(1);

    const existing = containerRef.current?.querySelector(`#${CSS.escape(id)}`);
    if (existing) {
      // Cross-section link whose target section is already open -- the target's own
      // MarkdownContent instance is scoped to itself and can't see it, so handle it here.
      event.preventDefault();
      existing.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const sectionKey = id.split('-')[0];
    const section = sections.find(s => s.title.toLowerCase() === sectionKey);
    if (!section) return;

    event.preventDefault();
    expandSection(section.title);
    setPendingScrollId(id);
  }, [sections, expandSection]);

  return (
    <Box ref={containerRef} onClick={handleClick}>
      <MarkdownContent markdown={frontMatter} />
      {sections.map(section => {
        const { highlight } = section;
        return (
          <Accordion
            key={section.title}
            id={section.title.toLowerCase()}
            expanded={Boolean(expanded[section.title])}
            onChange={(_, isExpanded) => {
              setExpanded(prev => ({ ...prev, [section.title]: isExpanded }));
              if (isExpanded) setOpened(prev => (prev[section.title] ? prev : { ...prev, [section.title]: true }));
            }}
            disableGutters
          >
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{section.title}</Typography>
                {Boolean(highlight) && (
                  <Typography variant="body2" color="text.secondary">{highlight}</Typography>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {Boolean(opened[section.title]) && <MarkdownContent markdown={section.markdown} />}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default LazyMarkdownDocument;
