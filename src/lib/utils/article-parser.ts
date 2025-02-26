import { ArticleSection, ParsedArticle } from '../types';

/**
 * Parses a rich article content into structured sections
 * Supports markdown-like syntax for different content types:
 * - # Heading 1, ## Heading 2, ### Heading 3
 * - Regular paragraphs
 * - ```example Caption text
 *   Example content
 *   ```
 * - ```code:language
 *   Code content
 *   ```
 * - ![Image caption](image-url)
 */
export function parseArticleContent(content: string): ParsedArticle {
  if (!content) {
    return { sections: [] };
  }

  const lines = content.split('\n');
  const sections: ArticleSection[] = [];
  let currentSection: ArticleSection | null = null;
  let inCodeBlock = false;
  let codeBlockType = '';
  let codeBlockCaption = '';
  let codeContent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.startsWith('```') && !inCodeBlock) {
      inCodeBlock = true;
      const blockInfo = line.slice(3).trim();

      if (blockInfo.startsWith('example')) {
        codeBlockType = 'example';
        codeBlockCaption = blockInfo.slice(7).trim();
      } else if (blockInfo.startsWith('code:')) {
        codeBlockType = 'code';
        const parts = blockInfo.slice(5).split(' ');
        const language = parts[0];
        codeBlockCaption = parts.slice(1).join(' ');
        currentSection = {
          type: 'code',
          content: '',
          language,
          caption: codeBlockCaption || undefined,
        };
      }
      codeContent = '';
      continue;
    }

    if (line.startsWith('```') && inCodeBlock) {
      inCodeBlock = false;
      if (codeBlockType === 'example') {
        sections.push({
          type: 'example',
          content: codeContent,
          caption: codeBlockCaption || undefined,
        });
      } else if (codeBlockType === 'code' && currentSection) {
        currentSection.content = codeContent;
        sections.push(currentSection);
        currentSection = null;
      }
      codeContent = '';
      continue;
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? '\n' : '') + line;
      continue;
    }

    // Handle headings
    if (line.startsWith('# ')) {
      sections.push({
        type: 'heading',
        content: line.slice(2),
        level: 1,
      });
      continue;
    }

    if (line.startsWith('## ')) {
      sections.push({
        type: 'heading',
        content: line.slice(3),
        level: 2,
      });
      continue;
    }

    if (line.startsWith('### ')) {
      sections.push({
        type: 'heading',
        content: line.slice(4),
        level: 3,
      });
      continue;
    }

    // Handle images
    if (line.startsWith('![') && line.includes('](') && line.endsWith(')')) {
      const captionEnd = line.indexOf('](');
      const caption = line.slice(2, captionEnd);
      const url = line.slice(captionEnd + 2, line.length - 1);

      sections.push({
        type: 'image',
        content: url,
        caption,
      });
      continue;
    }

    // Handle paragraphs (including empty lines)
    if (
      line.trim() === '' &&
      sections.length > 0 &&
      sections[sections.length - 1].type === 'paragraph'
    ) {
      // Add a line break to the existing paragraph
      sections[sections.length - 1].content += '\n\n';
    } else if (line.trim() !== '') {
      // If the previous section was a paragraph and didn't end with a double newline, append to it
      if (
        sections.length > 0 &&
        sections[sections.length - 1].type === 'paragraph' &&
        !sections[sections.length - 1].content.endsWith('\n\n')
      ) {
        sections[sections.length - 1].content += ' ' + line;
      } else {
        // Otherwise create a new paragraph
        sections.push({
          type: 'paragraph',
          content: line,
        });
      }
    }
  }

  return { sections };
}
