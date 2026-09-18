import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';

const SANITIZE_SCHEMA = { ...defaultSchema, clobberPrefix: '' };

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

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, SANITIZE_SCHEMA)
  .use(rehypeSlug)
  .use(rehypeExternalLinks)
  .use(rehypeStringify);

export const markdownToHtml = markdown => processor.processSync(markdown || '').toString();

export const renderInlineMarkdown = markdown => {
  const html = markdownToHtml(markdown);
  const match = /^<p>([\s\S]*)<\/p>\s*$/.exec(html);
  return match ? match[1] : html;
};
