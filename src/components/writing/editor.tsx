'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { cn } from '@/lib/utils';
import sanitizeHtml from '@/lib/utils/sanitize-html';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  LogOut,
  MoreHorizontal,
  Quote,
  Redo,
  Undo,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface EditorProps {
  content: string;
  onChange?: (content: string) => void;
  className?: string;
  editable?: boolean;
  toolbarExtras?: React.ReactNode;
}

interface ToolbarButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  tooltip: string;
  isActive?: boolean;
}

function ToolbarButton({
  onClick,
  disabled,
  icon,
  tooltip,
  isActive,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'h-8 w-8 rounded-sm p-0',
            isActive && 'bg-muted text-foreground'
          )}
        >
          {icon}
          <span className='sr-only'>{tooltip}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function EditorToolbar({
  editor,
  extras,
}: {
  editor: ReturnType<typeof useEditor>;
  extras?: React.ReactNode;
}) {
  const router = useRouter();
  const isDesktop = useBreakpoint('md');

  if (!editor) {
    return null;
  }

  // Buttons to show in the dropdown menu on mobile
  const mobileDropdownButtons = !isDesktop ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8 rounded-sm p-0'>
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>More formatting options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className='mr-2 h-4 w-4' />
            <span>Heading 1</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className='mr-2 h-4 w-4' />
            <span>Heading 2</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className='mr-2 h-4 w-4' />
            <span>Heading 3</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className='mr-2 h-4 w-4' />
            <span>Blockquote</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code className='mr-2 h-4 w-4' />
            <span>Code Block</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <TooltipProvider>
      <div className='flex flex-wrap items-center gap-1 border-b p-2'>
        {!isDesktop && (
          <>
            <ToolbarButton
              onClick={() => router.back()}
              icon={<LogOut className='h-4 w-4 rotate-180' />}
              tooltip='Exit'
            />
            <Separator orientation='vertical' />
          </>
        )}

        {/* Essential formatting controls - always visible */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={<Bold className='h-4 w-4' />}
          tooltip='Bold'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={<Italic className='h-4 w-4' />}
          tooltip='Italic'
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={<List className='h-4 w-4' />}
          tooltip='Bullet List'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={<ListOrdered className='h-4 w-4' />}
          tooltip='Ordered List'
        />

        {isDesktop && <Separator orientation='vertical' />}

        {/* Advanced formatting - only on desktop */}
        {isDesktop ? (
          <>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              isActive={editor.isActive('heading', { level: 1 })}
              icon={<Heading1 className='h-4 w-4' />}
              tooltip='Heading 1'
            />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              isActive={editor.isActive('heading', { level: 2 })}
              icon={<Heading2 className='h-4 w-4' />}
              tooltip='Heading 2'
            />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              isActive={editor.isActive('heading', { level: 3 })}
              icon={<Heading3 className='h-4 w-4' />}
              tooltip='Heading 3'
            />

            <Separator orientation='vertical' />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              icon={<Quote className='h-4 w-4' />}
              tooltip='Blockquote'
            />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              icon={<Code className='h-4 w-4' />}
              tooltip='Code Block'
            />
          </>
        ) : (
          mobileDropdownButtons
        )}

        <div className='ml-auto flex items-center gap-1'>
          {/* Extra elements passed from parent */}
          {extras}

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            icon={<Undo className='h-4 w-4' />}
            tooltip='Undo'
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            icon={<Redo className='h-4 w-4' />}
            tooltip='Redo'
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

export function Editor({
  content,
  onChange,
  className,
  editable = true,
  toolbarExtras,
}: EditorProps) {
  const initialContent = useMemo(() => {
    return sanitizeHtml(content);
  }, [content]);

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-base lg:prose-lg dark:prose-invert max-w-none',
          'h-full min-h-screen w-full focus:outline-none',
          'px-[max(calc(50%-40ch),1.5rem)] py-8 md:py-12'
        ),
      },
    },
    extensions: [StarterKit],
    content: initialContent,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedUpdate(html);
    },
  });

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Debounce updates to avoid too many saves
  const debouncedUpdate = useDebouncedCallback((html: string) => {
    onChange?.(html);
  }, 500);

  return (
    <div className={cn('flex h-full w-full flex-col', className)}>
      {editable && <EditorToolbar editor={editor} extras={toolbarExtras} />}
      <ScrollArea className='flex-grow'>
        <EditorContent editor={editor} />
      </ScrollArea>
    </div>
  );
}
