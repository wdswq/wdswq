import { Message, AIResponse, StreamingState, FilterState } from '../types';

class AIService {
  private baseUrl: string;
  private abortController: AbortController | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_AI_API_URL || 'http://localhost:8080/api/ai';
  }

  async sendMessage(
    message: string,
    context: Message[],
    filters: FilterState = {}
  ): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: context.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          filters
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message to AI service');
    }
  }

  async *streamMessage(
    message: string,
    context: Message[],
    filters: FilterState = {},
    onStateChange?: (state: StreamingState) => void
  ): AsyncGenerator<string, AIResponse, unknown> {
    this.abortController = new AbortController();

    try {
      onStateChange?.({ isStreaming: true, currentContent: '', status: 'connecting' });

      const response = await fetch(`${this.baseUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: context.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          filters
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onStateChange?.({ isStreaming: true, currentContent: '', status: 'streaming' });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onStateChange?.({ isStreaming: false, currentContent: fullContent, status: 'completed' });
              return {
                content: fullContent,
                isComplete: true
              };
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                onStateChange?.({ 
                  isStreaming: true, 
                  currentContent: fullContent, 
                  status: 'streaming' 
                });
                yield parsed.content;
              } else if (parsed.citations || parsed.confidence || parsed.followUpActions) {
                // Return final response with metadata
                onStateChange?.({ isStreaming: false, currentContent: fullContent, status: 'completed' });
                return {
                  content: fullContent,
                  citations: parsed.citations,
                  confidence: parsed.confidence,
                  followUpActions: parsed.followUpActions,
                  isComplete: true
                };
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', data);
            }
          }
        }
      }

      onStateChange?.({ isStreaming: false, currentContent: fullContent, status: 'completed' });
      return {
        content: fullContent,
        isComplete: true
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        onStateChange?.({ isStreaming: false, currentContent: '', status: 'idle' });
        throw new Error('Request was cancelled');
      }
      
      console.error('Error streaming message:', error);
      onStateChange?.({ 
        isStreaming: false, 
        currentContent: '', 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async getSuggestedPrompts(): Promise<Array<{ id: string; text: string; category: string; icon?: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/suggestions`);
      if (!response.ok) {
        // Return default suggestions if endpoint fails
        return this.getDefaultPrompts();
      }
      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch suggested prompts, using defaults:', error);
      return this.getDefaultPrompts();
    }
  }

  private getDefaultPrompts() {
    return [
      { id: '1', text: 'What are the latest trends in artificial intelligence?', category: 'Technology', icon: '🤖' },
      { id: '2', text: 'Explain machine learning in simple terms', category: 'Education', icon: '📚' },
      { id: '3', text: 'How can I improve my productivity?', category: 'Productivity', icon: '⚡' },
      { id: '4', text: 'What are some healthy breakfast recipes?', category: 'Health', icon: '🥗' },
      { id: '5', text: 'Explain the basics of quantum computing', category: 'Science', icon: '⚛️' },
      { id: '6', text: 'How do I start learning web development?', category: 'Programming', icon: '💻' }
    ];
  }
}

export const aiService = new AIService();