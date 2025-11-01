import React from 'react';
import { SuggestedPrompt } from '../types';
import { Lightbulb, TrendingUp, BookOpen, Heart, Code, Atom } from 'lucide-react';

interface SuggestedPromptsProps {
  prompts: SuggestedPrompt[];
  onSelectPrompt: (prompt: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Technology': <TrendingUp size={16} />,
  'Education': <BookOpen size={16} />,
  'Health': <Heart size={16} />,
  'Programming': <Code size={16} />,
  'Science': <Atom size={16} />,
  'Productivity': <TrendingUp size={16} />,
};

export function SuggestedPrompts({ prompts, onSelectPrompt }: SuggestedPromptsProps) {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={16} className="text-amber-500" />
        <h3 className="text-sm font-medium text-gray-700">Suggested questions</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelectPrompt(prompt.text)}
            className="flex items-center gap-2 p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              {prompt.icon || (
                <span className="text-gray-600">
                  {categoryIcons[prompt.category] || <Lightbulb size={16} />}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-gray-900">
                {prompt.text}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {prompt.category}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}