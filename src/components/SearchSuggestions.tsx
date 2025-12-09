import React from 'react';
import { Search, TrendingUp } from 'lucide-react';

interface SearchSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isVisible: boolean;
}

export function SearchSuggestions({ suggestions, onSuggestionClick, isVisible }: SearchSuggestionsProps) {
  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-60 overflow-y-auto">
      <div className="p-2">
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
          <TrendingUp className="h-3 w-3" />
          <span>Popular searches</span>
        </div>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center space-x-2 text-sm"
          >
            <Search className="h-3 w-3 text-gray-400" />
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}