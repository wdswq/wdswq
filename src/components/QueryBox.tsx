import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Mic, Paperclip } from 'lucide-react';

interface QueryBoxProps {
  onSendMessage: (message: string) => void;
  isStreaming: boolean;
  onCancel: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function QueryBox({ 
  onSendMessage, 
  isStreaming, 
  onCancel, 
  disabled = false,
  placeholder = "Ask me anything..."
}: QueryBoxProps) {
  const [query, setQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isStreaming && !disabled) {
      onSendMessage(query.trim());
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCancel = () => {
    onCancel();
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          rows={1}
          className="w-full px-4 py-3 pr-24 resize-none border-0 rounded-lg focus:outline-none focus:ring-0 disabled:bg-gray-50 disabled:text-gray-500"
          style={{ minHeight: '56px', maxHeight: '200px' }}
        />
        
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || isStreaming}
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
          
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || isStreaming}
            title="Voice input"
          >
            <Mic size={18} />
          </button>
          
          {isStreaming ? (
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 text-red-500 hover:text-red-600 transition-colors"
              title="Stop generation"
            >
              <Square size={18} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!query.trim() || disabled}
              className="p-2 text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500 text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </form>
  );
}