import type { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingConversations, setIsFetchingConversations] = useState(true);

  // Fetch conversations on component mount or when userId changes
  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  // Fetch conversations from Supabase
  const fetchConversations = async () => {
    if (!userId) return;

    setIsFetchingConversations(true);

    try {
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

      setConversations(data || []);

      // If there's at least one conversation and no current conversation is selected,
      // select the most recent one
      if (data && data.length > 0 && !currentConversationId) {
        setCurrentConversationId(data[0].id);
        loadMessages(data[0].id, data[0].messages);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsFetchingConversations(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = (
    conversationId: string,
    conversationMessages: Tables<'messages'>[]
  ) => {
    const formattedMessages = conversationMessages
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

    setMessages(formattedMessages);
  };

  // Create a new conversation
  const createNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  // Handle conversation selection
  const handleConversationSelect = (conversationId: string) => {
    const selectedConversation = conversations.find(
      (conv) => conv.id === conversationId
    );

    if (selectedConversation) {
      setCurrentConversationId(conversationId);
      loadMessages(conversationId, selectedConversation.messages);
    }
  };

  // Send a message
  const sendMessage = async (
    content: string
  ): Promise<{ messageId: string; conversationId: string } | undefined> => {
    if (!content.trim() || !userId || isLoading) return;

    setIsLoading(true);

    try {
      let conversationId = currentConversationId;
      let newMessages = [...messages];

      // Add user message to UI immediately
      const userMsg: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        createdAt: new Date(),
      };

      newMessages.push(userMsg);
      setMessages(newMessages);

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
        setConversations((prev) => [
          ...prev,
          {
            ...newConversation,
            messages: [],
          },
        ]);
        setCurrentConversationId(conversationId);
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

      // Update the temporary user message with the saved one
      newMessages = newMessages.map((msg) =>
        msg.id === userMsg.id
          ? {
              id: savedUserMessage.id,
              role: 'user',
              content: savedUserMessage.content,
              createdAt: new Date(savedUserMessage.created_at),
            }
          : msg
      );

      setMessages(newMessages);

      return { messageId: savedUserMessage.id, conversationId };
    } catch (error) {
      console.error('Error sending message:', error);
      return Promise.reject(error);
    } finally {
      // Don't set isLoading to false here, as we're still waiting for AI response
      // setIsLoading(false);
    }
  };

  // Add an AI message to the conversation
  const addAIMessage = async (
    content: string,
    conversationId?: string
  ): Promise<void> => {
    conversationId = conversationId ?? currentConversationId ?? undefined;
    if (!conversationId || !content.trim()) return;

    try {
      // Add AI response to UI immediately
      const assistantMsg: Message = {
        id: `temp-${Date.now()}`,
        role: 'assistant',
        content,
        createdAt: new Date(),
      };

      const newMessages: Message[] = [...messages, assistantMsg];
      setMessages(newMessages);

      // Save AI response to database
      const { data: savedAssistantMessage, error: assistantMsgError } =
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            role: 'assistant',
            content,
          })
          .select()
          .single();

      if (assistantMsgError) throw assistantMsgError;

      // Update the temporary assistant message with the saved one
      const updatedMessages: Message[] = newMessages.map((msg) =>
        msg.id === assistantMsg.id
          ? {
              id: savedAssistantMessage.id,
              role: 'assistant',
              content: savedAssistantMessage.content,
              createdAt: new Date(savedAssistantMessage.created_at),
            }
          : msg
      );

      setMessages(updatedMessages);

      // Refresh conversations list
      fetchConversations();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding AI message:', error);
      return Promise.reject(error);
    }
  };

  return {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    isFetchingConversations,
    fetchConversations,
    createNewConversation,
    handleConversationSelect,
    sendMessage,
    addAIMessage,
  };
}
