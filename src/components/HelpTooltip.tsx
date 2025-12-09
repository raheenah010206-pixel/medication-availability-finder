import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpTooltip({ content, position = 'top' }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs">
            {content}
            <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
              'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`}></div>
          </div>
        </div>
      )}
    </div>
  );
}