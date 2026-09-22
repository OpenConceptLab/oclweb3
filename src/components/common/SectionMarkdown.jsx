import React from 'react';
import { splitMarkdownBlocks } from './markdownBlocks';
import MarkdownContent from './MarkdownContent';
import VirtualizedMarkdownTable from './VirtualizedMarkdownTable';

const SectionMarkdown = ({ markdown, registry }) => {
  const blocks = React.useMemo(() => splitMarkdownBlocks(markdown), [markdown]);

  return blocks.map((block, index) => (
    block.type === 'table'
      // eslint-disable-next-line react/no-array-index-key
      ? <VirtualizedMarkdownTable key={index} header={block.header} rows={block.rows} raw={block.raw} registry={registry} />
      // eslint-disable-next-line react/no-array-index-key
      : <MarkdownContent key={index} markdown={block.content} />
  ));
};

export default SectionMarkdown;
