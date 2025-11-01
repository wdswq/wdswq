import { useAIAssistant } from './hooks/useAIAssistant';
import { MessageCard } from './components/MessageCard';
import { QueryBox } from './components/QueryBox';
import { SuggestedPrompts } from './components/SuggestedPrompts';
import { FilterControls } from './components/FilterControls';
import { StreamingIndicator } from './components/StreamingIndicator';
import { FollowUpAction } from './types';
import { RotateCcw, Trash2, Settings } from 'lucide-react';

function App() {
  const {
    messages,
    streamingState,
    filters,
    suggestedPrompts,
    sendMessage,
    cancelStreaming,
    clearConversation,
    updateFilters,
    retryLastMessage
  } = useAIAssistant();

  const handleFollowUpAction = (action: FollowUpAction) => {
    sendMessage(action.prompt);
  };

  const handleRetry = () => {
    retryLastMessage();
  };

  const hasMessages = messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const isError = lastMessage?.role === 'assistant' && 
                  lastMessage.content.includes('encountered an error');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
              <StreamingIndicator state={streamingState} />
            </div>
            
            <div className="flex items-center gap-2">
              {isError && (
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 transition-colors"
                >
                  <RotateCcw size={14} />
                  Retry
                </button>
              )}
              
              {hasMessages && (
                <button
                  onClick={clearConversation}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} />
                  Clear
                </button>
              )}
              
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Filter Controls */}
        <FilterControls
          filters={filters}
          onFiltersChange={updateFilters}
        />

        {/* Messages */}
        <div className="max-w-4xl mx-auto space-y-4 mb-6">
          {hasMessages ? (
            messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onFollowUpAction={handleFollowUpAction}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to AI Assistant
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Ask me anything! I can help with research, explain concepts, provide recommendations, and more. 
                Try one of the suggested questions below or type your own.
              </p>
            </div>
          )}
        </div>

        {/* Suggested Prompts - Only show when no messages */}
        {!hasMessages && (
          <div className="max-w-4xl mx-auto">
            <SuggestedPrompts
              prompts={suggestedPrompts}
              onSelectPrompt={sendMessage}
            />
          </div>
        )}

        {/* Query Box */}
        <div className="max-w-4xl mx-auto">
          <QueryBox
            onSendMessage={sendMessage}
            isStreaming={streamingState.isStreaming}
            onCancel={cancelStreaming}
            disabled={streamingState.status === 'error'}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              AI responses may be inaccurate. Verify important information.
            </div>
            <div className="flex items-center gap-4">
              <span>Context: {messages.length} messages</span>
              <span>Status: {streamingState.status}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;