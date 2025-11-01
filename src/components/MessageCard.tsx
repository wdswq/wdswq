import { Message, Citation, FollowUpAction } from '../types';
import { User, Bot, ExternalLink, Star, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface MessageCardProps {
  message: Message;
  onFollowUpAction?: (action: FollowUpAction) => void;
}

export function MessageCard({ message, onFollowUpAction }: MessageCardProps) {
  const isUser = message.role === 'user';

  return (
    <div className={clsx(
      'flex gap-3 p-4 rounded-lg',
      isUser ? 'bg-blue-50' : 'bg-gray-50'
    )}>
      <div className={clsx(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
          {message.confidence && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Star size={12} />
              <span>{Math.round(message.confidence * 100)}% confidence</span>
            </div>
          )}
        </div>

        <div className="prose prose-sm max-w-none">
          {message.isStreaming ? (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-gray-800">
              {message.content}
            </p>
          )}
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Info size={14} />
              Sources
            </div>
            <div className="grid gap-2">
              {message.citations.map((citation) => (
                <CitationCard key={citation.id} citation={citation} />
              ))}
            </div>
          </div>
        )}

        {message.followUpActions && message.followUpActions.length > 0 && !message.isStreaming && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Follow-up actions</div>
            <div className="flex flex-wrap gap-2">
              {message.followUpActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onFollowUpAction?.(action)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CitationCardProps {
  citation: Citation;
}

function CitationCard({ citation }: CitationCardProps) {
  return (
    <div className="p-3 bg-white border border-gray-200 rounded-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-medium text-gray-900">
            {citation.title}
          </h4>
          <p className="text-xs text-gray-600 line-clamp-2">
            {citation.snippet}
          </p>
        </div>
        {citation.url && (
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}