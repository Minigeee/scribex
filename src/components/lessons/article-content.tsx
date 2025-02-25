import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

interface ArticleContentProps {
  content: string | null;
  className?: string;
}

// Custom remark plugin to handle example blocks
function remarkExample() {
  return (tree: any) => {
    visit(tree, (node) => {
      // Handle code blocks with example language
      if (
        node.type === 'code' &&
        node.lang === 'example' &&
        typeof node.value === 'string'
      ) {
        const meta = node.meta || '';

        // Convert to a custom directive node
        node.type = 'containerDirective';
        node.name = 'example';
        node.attributes = { caption: meta };
        node.children = [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: node.value }],
          },
        ];
        delete node.lang;
        delete node.meta;
        delete node.value;
      }
    });
  };
}

// Custom directive handler for example blocks
function directiveExample() {
  return (tree: any) => {
    visit(tree, ['containerDirective'], (node) => {
      if (node.name !== 'example') return;

      const data = node.data || (node.data = {});
      const caption = node.attributes?.caption || '';

      data.hName = 'div';
      data.hProperties = {
        className:
          'example-block border-primary/20 bg-primary/5 rounded-md overflow-hidden',
        'data-caption': caption,
      };
    });
  };
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  if (!content) {
    return <div className='py-8 text-center'>No content available</div>;
  }

  return (
    <div className={cn('article-content prose space-y-6', className)}>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkDirective,
          remarkExample,
          directiveExample,
        ]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1
              className='mb-4 mt-8 text-3xl font-bold tracking-tight text-primary'
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className='mb-3 mt-6 text-2xl font-semibold tracking-tight text-primary'
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className='mb-2 mt-4 text-xl font-medium tracking-tight text-primary'
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className='mb-2 mt-4 text-lg font-medium tracking-tight text-primary'
              {...props}
            />
          ),

          // Images
          img: ({ node, ...props }) => {
            const { src, alt } = props;
            if (!src) return null;

            return (
              <figure className='my-6'>
                <div className='relative h-64 w-full overflow-hidden rounded-lg'>
                  <Image
                    src={src}
                    alt={alt || 'Article image'}
                    fill
                    className='object-cover'
                  />
                </div>
                {alt && (
                  <figcaption className='mt-2 text-center text-sm text-muted-foreground'>
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },

          // Custom example block
          div: ({ node, className, ...props }: any) => {
            if (className?.includes('example-block')) {
              return (
                <Card className='border-primary/20 bg-primary/5'>
                  <CardHeader className='border-b border-primary/20 px-4 py-2'>
                    <CardTitle className='text-xs font-medium text-muted-foreground'>
                      Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent
                    className='prose prose-sm max-w-none p-4'
                    {...props}
                  ></CardContent>
                </Card>
              );
            }

            return <div className={className} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
