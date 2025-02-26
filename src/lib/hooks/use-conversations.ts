import type { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

export type Conversation = Tables<'conversations'> & {
  messages: Tables<'messages'>[];
};

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
};

export function useConversations(userId: string | undefined) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch conversations with React Query
  const {
    data: conversations = [],
    isPending: isFetchingConversations,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(
          `
          *,
          messages (*)
        `
        )
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Get current conversation messages
  const messages = useMemo(() => {
    if (!currentConversationId) return [];
    
    const currentConversation = conversations.find(
      (conv) => conv.id === currentConversationId
    );
    
    if (!currentConversation) return [];
    
    return currentConversation.messages
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      .map((message) => ({
        id: message.id,
        role: message.role as 'user' | 'assistant' | 'system',
        content: message.content,
        createdAt: new Date(message.created_at),
      }));
  }, [conversations, currentConversationId]);

  // Set initial conversation if none selected
  useMemo(() => {
    if (
      conversations.length > 0 && 
      !currentConversationId && 
      !isLoading
    ) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId, isLoading]);

  // Create a new conversation
  const createNewConversation = () => {
    setCurrentConversationId(null);
  };

  // Handle conversation selection
  const handleConversationSelect = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  // Mutation for sending a message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string): Promise<{ messageId: string; conversationId: string } | undefined> => {
      if (!content.trim() || !userId) return;

      try {
        let conversationId = currentConversationId;

        // If no conversation exists, create one
        if (!conversationId) {
          const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({
              user_id: userId,
              title:
                content.substring(0, 50) + (content.length > 50 ? '...' : ''),
              last_message_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) throw createError;

          conversationId = newConversation.id;
          setCurrentConversationId(conversationId);
          
          // Invalidate conversations query to refresh the list
          queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
        } else {
          // Update last_message_at for existing conversation
          await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId);
        }

        // Save user message to database
        const { data: savedUserMessage, error: userMsgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            role: 'user',
            content: content.trim(),
          })
          .select()
          .single();

        if (userMsgError) throw userMsgError;

        // Invalidate the conversations query to refresh with new message
        queryClient.invalidateQueries({ queryKey: ['conversations', userId] });

        return { messageId: savedUserMessage.id, conversationId };
      } catch (error) {
        console.error('Error sending message:', error);
        return Promise.reject(error);
      }
    },
    onMutate: async (content) => {
      setIsLoading(true);
      
      // Optimistically update UI
      if (currentConversationId) {
        // For existing conversation, add message optimistically
        const tempMessage = {
          id: `temp-${Date.now()}`,
          role: 'user' as const,
          content: content.trim(),
          created_at: new Date().toISOString(),
        };
        
        queryClient.setQueryData(['conversations', userId], (old: Conversation[] | undefined) => {
          if (!old) return [];
          
          return old.map(conv => {
            if (conv.id === currentConversationId) {
              return {
                ...conv,
                messages: [...conv.messages, tempMessage]
              };
            }
            return conv;
          });
        });
      }
    },
    onSettled: () => {
      // Don't set isLoading to false here, as we're still waiting for AI response
    },
  });

  // Mutation for adding an AI message
  const addAIMessageMutation = useMutation({
    mutationFn: async ({ content, conversationId }: { content: string; conversationId?: string }) => {
      const targetConversationId = conversationId ?? currentConversationId ?? undefined;
      if (!targetConversationId || !content.trim()) return;

      // Save AI response to database
      const { data: savedAssistantMessage, error: assistantMsgError } =
        await supabase
          .from('messages')
          .insert({
            conversation_id: targetConversationId,
            role: 'assistant',
            content,
          })
          .select()
          .single();

      if (assistantMsgError) throw assistantMsgError;

      return savedAssistantMessage;
    },
    onMutate: async ({ content, conversationId }) => {
      const targetConversationId = conversationId ?? currentConversationId;
      if (!targetConversationId) return;
      
      // Optimistically update UI
      const tempMessage = {
        id: `temp-${Date.now()}`,
        role: 'assistant' as const,
        content,
        created_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData(['conversations', userId], (old: Conversation[] | undefined) => {
        if (!old) return [];
        
        return old.map(conv => {
          if (conv.id === targetConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, tempMessage]
            };
          }
          return conv;
        });
      });
    },
    onSuccess: () => {
      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error adding AI message:', error);
      setIsLoading(false);
    },
  });

  // Send a message wrapper function
  const sendMessage = async (content: string) => {
    if (!content.trim() || !userId || isLoading) return;
    return sendMessageMutation.mutateAsync(content);
  };

  // Add an AI message wrapper function
  const addAIMessage = async (content: string, conversationId?: string) => {
    return addAIMessageMutation.mutateAsync({ content, conversationId });
  };

  return {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    isFetchingConversations,
    fetchConversations: refetchConversations,
    createNewConversation,
    handleConversationSelect,
    sendMessage,
    addAIMessage,
  };
}
