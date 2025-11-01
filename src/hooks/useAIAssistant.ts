import { useState, useCallback, useEffect } from 'react';
import { Message, ConversationContext, FilterState, StreamingState, SuggestedPrompt } from '../types';
import { aiService } from '../services/aiService';

const STORAGE_KEY = 'ai-assistant-context';

export function useAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentContent: '',
    status: 'idle'
  });
  const [filters, setFilters] = useState<FilterState>({});
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>([]);

  // Load conversation context from localStorage on mount
  useEffect(() => {
    const savedContext = localStorage.getItem(STORAGE_KEY);
    if (savedContext) {
      try {
        const context: ConversationContext = JSON.parse(savedContext);
        setMessages(context.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setFilters(context.filters);
      } catch (error) {
        console.warn('Failed to load saved conversation context:', error);
      }
    }

    // Load suggested prompts
    loadSuggestedPrompts();
  }, []);

  // Save conversation context to localStorage whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      const context: ConversationContext = {
        id: 'default',
        messages,
        filters,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
    }
  }, [messages, filters]);

  const loadSuggestedPrompts = useCallback(async () => {
    try {
      const prompts = await aiService.getSuggestedPrompts();
      setSuggestedPrompts(prompts);
    } catch (error) {
      console.error('Failed to load suggested prompts:', error);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Create placeholder for assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const generator = aiService.streamMessage(
        content,
        messages.filter(msg => msg.id !== userMessage.id),
        filters,
        setStreamingState
      );

      let accumulatedContent = '';
      
      for await (const chunk of generator) {
        accumulatedContent += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: accumulatedContent }
            : msg
        ));
      }

      // Final update with complete message
      setStreamingState(prev => ({ ...prev, isStreaming: false, status: 'completed' }));
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      setStreamingState(prev => ({
        ...prev,
        isStreaming: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      
      // Remove the streaming assistant message and add error message
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [messages, filters]);

  const cancelStreaming = useCallback(() => {
    aiService.cancelRequest();
    setStreamingState(prev => ({ ...prev, isStreaming: false, status: 'idle' }));
    
    // Remove the streaming message
    setMessages(prev => prev.filter(msg => !msg.isStreaming));
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setFilters({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
    if (lastUserMessage) {
      // Remove the last assistant message (likely the error message)
      setMessages(prev => {
        const lastAssistantIndex = prev.map((msg, index) => msg.role === 'assistant' ? index : -1)
          .filter(index => index !== -1)
          .pop();
        if (lastAssistantIndex !== undefined) {
          return prev.slice(0, lastAssistantIndex);
        }
        return prev;
      });
      
      // Resend the last user message
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    streamingState,
    filters,
    suggestedPrompts,
    sendMessage,
    cancelStreaming,
    clearConversation,
    updateFilters,
    retryLastMessage,
    loadSuggestedPrompts
  };
}