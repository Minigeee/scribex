'use client';

import { generateCompletion } from '@/app/actions/generate-completion';
import { type ConversationStarter as BaseConversationStarter } from '@/app/actions/generate-conversation-starters';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Tables } from '@/lib/database.types';
import { useAuth } from '@/lib/hooks/use-auth';
import { useConversations } from '@/lib/hooks/use-conversations';
import { cn } from '@/lib/utils';
import { assistantMessage, systemMessage, userMessage } from '@/lib/utils/ai';
import { Loader2, Plus, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

// Default system prompt
const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful, friendly AI assistant. You provide clear, concise, and accurate information.';

// Extended conversation starter type with optional system prompt
export interface ConversationStarter extends BaseConversationStarter {
  systemPrompt?: string;
  isLoading?: boolean;
}

// Default conversation starters
const DEFAULT_CONVERSATION_STARTERS: ConversationStarter[] = [
  {
    title: 'Explain a concept',
    prompt: 'Can you explain how machine learning works in simple terms?',
  },
  {
    title: 'Creative writing',
    prompt: 'Write a short story about a robot discovering emotions.',
  },
  {
    title: 'Problem solving',
    prompt:
      "I'm trying to optimize my React application. What are some best practices?",
  },
];

// Writing project conversation starters
const WRITING_PROJECT_STARTERS: ConversationStarter[] = [
  {
    title: 'Get feedback',
    prompt: 'Can you review my writing and provide constructive feedback?',
  },
  {
    title: "Writer's block",
    prompt:
      "I'm experiencing writer's block. Can you suggest some ideas to continue my story?",
  },
  {
    title: 'Character development',
    prompt: 'Help me develop a more complex character for my story.',
  },
];

// Research-focused genres
const RESEARCH_GENRES = ['persuasive', 'informative', 'journalism'];

type ProjectWithGenre = Tables<'projects'> & {
  genres: Tables<'genres'> | null;
};

interface ChatInterfaceProps {
  project?: ProjectWithGenre;
  projectContent?: string;
  customStarters?: ConversationStarter[];
  defaultSystemPrompt?: string;
  activeTab?: string;
}

export function ChatInterface({
  project,
  projectContent,
  customStarters,
  defaultSystemPrompt,
  activeTab,
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);

  // State
  const [inputValue, setInputValue] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    defaultSystemPrompt ||
      (project
        ? `You are a helpful writing assistant. You're helping the user with their ${project.genres?.name || ''} writing project titled "${project.title}". Provide constructive feedback, ideas, and suggestions to improve their writing.`
        : DEFAULT_SYSTEM_PROMPT)
  );
  const [activeSystemPrompt, setActiveSystemPrompt] = useState(systemPrompt);
  const [aiLoading, setAiLoading] = useState(false);
  const [isGeneratingQuestions] = useState(false);
  const [
    hasGeneratedQuestionsForCurrentConversation,
    setHasGeneratedQuestionsForCurrentConversation,
  ] = useState(false);

  // Memoize conversation starters based on project and custom starters
  const defaultStarters = useMemo(() => {
    return (
      customStarters ||
      (project ? WRITING_PROJECT_STARTERS : DEFAULT_CONVERSATION_STARTERS)
    );
  }, [customStarters, project]);

  const [conversationStarters, setConversationStarters] =
    useState<ConversationStarter[]>(defaultStarters);

  // Use the conversations hook
  const {
    conversations,
    currentConversationId,
    messages,
    isFetchingConversations,
    createNewConversation,
    handleConversationSelect,
    sendMessage,
    addAIMessage,
  } = useConversations(user?.id);

  // Combined loading state
  const isLoading = aiLoading;

  // Check if the project genre is research-focused
  const isResearchGenre = useMemo(() => {
    if (!project || !project.genres) return false;
    return RESEARCH_GENRES.includes(project.genres.name.toLowerCase());
  }, [project]);

  // Scroll to the latest message when messages change
  useEffect(() => {
    console.log('messages changed', messages.length);
    scrollToLatestMessage();
  }, [messages.length]);

  useEffect(() => {
    console.log('mount');
  }, []);

  // Update conversation starters when customStarters prop changes
  useEffect(() => {
    if (customStarters) {
      setConversationStarters(customStarters);
    }
  }, [customStarters]);

  // Update system prompt when defaultSystemPrompt prop changes
  useEffect(() => {
    if (defaultSystemPrompt) {
      setSystemPrompt(defaultSystemPrompt);
      if (messages.length === 0) {
        setActiveSystemPrompt(defaultSystemPrompt);
      }
    }
  }, [defaultSystemPrompt, messages.length]);

  // Reset the generated questions flag when the conversation changes
  useEffect(() => {
    setHasGeneratedQuestionsForCurrentConversation(false);

    // Reset to default starters when switching conversations
    setConversationStarters(defaultStarters);
  }, [currentConversationId, defaultStarters]);

  // Reset the generated questions flag when the project or content changes
  useEffect(() => {
    setHasGeneratedQuestionsForCurrentConversation(false);
  }, [project?.id, projectContent]);

  // Handle conversation selection changes
  const handleConversationChange = useCallback(
    (conversationId: string) => {
      handleConversationSelect(conversationId);
      setHasGeneratedQuestionsForCurrentConversation(false);
    },
    [handleConversationSelect]
  );

  // Handle tab changes to regenerate questions when switching to chat tab
  useEffect(() => {
    if (
      activeTab === 'chat' &&
      isResearchGenre &&
      !isFetchingConversations &&
      !currentConversationId &&
      !isGeneratingQuestions &&
      !hasGeneratedQuestionsForCurrentConversation
    ) {
      console.log(
        isFetchingConversations,
        currentConversationId,
        isGeneratingQuestions,
        hasGeneratedQuestionsForCurrentConversation
      );
      // generateResearchQuestionsForProject();
    }
  }, [
    activeTab,
    isResearchGenre,
    currentConversationId,
    isFetchingConversations,
  ]);

  // Truncate conversation title to 40 characters
  const conversationTitles = useMemo(() => {
    return conversations.map((conversation) => {
      if (conversation.title.length > 40) {
        return conversation.title.slice(0, 40) + '...';
      }
      return conversation.title;
    });
  }, [conversations]);

  // Prepare AI messages for completion
  const prepareAIMessages = useCallback(
    (userMessageContent: string, currentSystemPrompt: string) => {
      const aiMessages = [
        systemMessage(currentSystemPrompt),
        ...messages.map((msg) =>
          msg.role === 'user'
            ? userMessage(msg.content)
            : assistantMessage(msg.content)
        ),
        userMessage(userMessageContent),
      ];

      // If this is a project chat and we have project content, add it to the context
      if (project && projectContent && messages.length === 0) {
        aiMessages.splice(
          1,
          0,
          systemMessage(
            `Here is the user's current writing project content:\n\n${projectContent.substring(0, 8000)}\n\nProvide feedback and assistance based on this content.`
          )
        );
      }

      return aiMessages;
    },
    [messages, project, projectContent]
  );

  // Handle sending a message
  const handleSendMessage = async (
    messageContent = inputValue,
    starterSystemPrompt?: string
  ) => {
    const userMessageContent = messageContent.trim();
    if (!userMessageContent || !user || isLoading) return;

    setInputValue('');

    // Use the starter's system prompt if provided, otherwise use the current system prompt
    const currentSystemPrompt = starterSystemPrompt || activeSystemPrompt;

    // Set loading state to true to show AI is thinking
    setAiLoading(true);

    try {
      // Prepare messages for AI completion
      const aiMessages = prepareAIMessages(
        userMessageContent,
        currentSystemPrompt
      );

      // Start both operations concurrently
      const sendMessagePromise = sendMessage(userMessageContent);
      const aiResponsePromise = generateCompletion({
        messages: aiMessages,
      });

      // Wait for AI response first (for better UX)
      const aiResponse = await aiResponsePromise;

      // Wait for the message to be sent and get conversation ID
      const userSendResult = await sendMessagePromise;
      if (!userSendResult) {
        setAiLoading(false);
        return;
      }

      // Add AI response to conversation
      await addAIMessage(aiResponse.text, userSendResult.conversationId);

      // Set AI loading to false
      setAiLoading(false);
    } catch (error) {
      console.error('Error in message exchange:', error);
      setAiLoading(false);
    }
  };

  // Handle conversation starter click
  const handleStarterClick = useCallback(
    (starter: ConversationStarter) => {
      // Skip if the starter is still loading
      if (starter.isLoading) return;

      // If the starter has a system prompt, use it for this message
      if (starter.systemPrompt) {
        setActiveSystemPrompt(starter.systemPrompt);
      }

      // Send the message immediately
      handleSendMessage(starter.prompt, starter.systemPrompt);
    },
    [handleSendMessage]
  );

  // Handle input submission
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Scroll to the latest message
  const scrollToLatestMessage = useCallback(() => {
    if (messages.length > 0) {
      latestMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If there are no messages, scroll to bottom as before
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Format date for display
  const formatMessageDate = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Handle creating a new conversation
  const handleNewConversation = useCallback(() => {
    createNewConversation();
    setInputValue('');
    // Reset active system prompt to the default
    setActiveSystemPrompt(systemPrompt);

    // Reset the flag so we'll generate new questions for the new conversation
    setHasGeneratedQuestionsForCurrentConversation(false);
  }, [createNewConversation, systemPrompt]);

  return (
    <div className='flex h-full flex-col'>
      {/* Header with conversation selector */}
      <div className='flex items-center justify-between border-b p-3'>
        <div className='flex flex-1 items-center gap-2'>
          <Select
            value={currentConversationId || ''}
            onValueChange={handleConversationChange}
            disabled={isFetchingConversations}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select conversation' />
            </SelectTrigger>
            <SelectContent>
              {conversations.map((conversation, index) => (
                <SelectItem key={conversation.id} value={conversation.id}>
                  {conversationTitles[index]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant='ghost'
            size='icon'
            onClick={handleNewConversation}
            title='New conversation'
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className='px-4'>
        {messages.length > 0 ? (
          <div className='space-y-3 py-2'>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className='w-full'
                ref={
                  index === messages.length - 1 ? latestMessageRef : undefined
                }
              >
                {/* Role indicator */}
                <div className='mb-1 text-xs font-medium'>
                  {message.role === 'user' ? 'You' : 'AI'}
                </div>

                {/* Message content */}
                <div
                  className={cn(
                    'rounded-lg p-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'prose dark:prose-invert',
                      message.role === 'user' && 'text-primary-foreground'
                    )}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </span>
                  <div
                    className={cn(
                      'mt-1 text-xs',
                      message.role === 'user'
                        ? 'text-right text-primary-foreground/70'
                        : 'text-muted-foreground'
                    )}
                  >
                    {formatMessageDate(message.createdAt)}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className='w-full'>
                <div className='mb-1 text-xs font-medium'>AI</div>
                <div className='space-y-2 rounded-lg bg-muted p-3'>
                  <div className='flex items-center space-x-2'>
                    <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                    <span className='text-sm text-muted-foreground'>
                      Thinking...
                    </span>
                  </div>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-[80%]' />
                  <Skeleton className='h-4 w-[60%]' />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className='flex h-full flex-col justify-center py-8'>
            <div className='space-y-3'>
              <div className='mb-2 text-center'>
                <h3 className='text-lg font-medium'>Start a conversation</h3>
                <p className='text-base text-muted-foreground'>
                  {project
                    ? isResearchGenre
                      ? 'Ask research questions or get writing help'
                      : 'Get help with your writing'
                    : 'Choose a starter or type below'}
                </p>
              </div>

              <div className='space-y-2'>
                {conversationStarters.map((starter, index) => (
                  <Button
                    key={index}
                    variant='outline'
                    onClick={() => handleStarterClick(starter)}
                    className='h-fit w-full justify-start whitespace-normal py-3 text-left'
                    disabled={starter.isLoading}
                  >
                    <div className='w-full'>
                      <div className='flex items-center gap-2 text-sm font-medium'>
                        {starter.title}
                        {starter.isLoading && (
                          <Loader2 className='h-3 w-3 animate-spin' />
                        )}
                      </div>
                      <div className='line-clamp-2 break-words text-xs text-muted-foreground'>
                        {starter.prompt}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className='border-t p-3'>
        <div className='flex gap-2'>
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder='Type your message...'
            className='min-h-[60px] resize-none'
            disabled={isLoading || !user}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading || !user}
            className='self-end'
            size='icon'
          >
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
