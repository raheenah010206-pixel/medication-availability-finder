import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Type, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type FontSize = 'small' | 'normal' | 'large' | 'xlarge';

interface AccessibilitySettingsContextType {
  darkMode: boolean;
  fontSize: FontSize;
  toggleDarkMode: () => void;
  setFontSize: (size: FontSize) => void;
}

const AccessibilityContext = React.createContext<AccessibilitySettingsContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useLocalStorage('naijameds-dark-mode', false);
  const [fontSize, setFontSize] = useLocalStorage<FontSize>('naijameds-font-size', 'normal');

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const sizeMap: Record<FontSize, string> = {
      small: '14px',
      normal: '16px',
      large: '18px',
      xlarge: '20px'
    };
    document.documentElement.style.fontSize = sizeMap[fontSize];
  }, [fontSize]);

  return (
    <AccessibilityContext.Provider value={{ darkMode, fontSize, toggleDarkMode, setFontSize }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

export function AccessibilityButton() {
  const [showSettings, setShowSettings] = useState(false);
  const { darkMode, fontSize, toggleDarkMode, setFontSize } = useAccessibility();

  return (
    <>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Accessibility settings"
        title="Accessibility settings"
      >
        <Settings className="h-5 w-5" />
      </button>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Accessibility Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close settings"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Display Mode
                </h3>
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  {darkMode ? (
                    <Moon className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Sun className="h-5 w-5 text-orange-500" />
                  )}
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Size
                </h3>
                <div className="space-y-2">
                  {(['small', 'normal', 'large', 'xlarge'] as FontSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`w-full px-4 py-2 rounded-lg transition-colors text-${getSizeClass(size)} ${
                        fontSize === size
                          ? 'bg-blue-100 text-blue-600 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {getSizeLabel(size)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="text-blue-900">
                  These settings are saved locally on your device and will persist when you revisit.
                </p>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getSizeLabel(size: FontSize): string {
  const labels: Record<FontSize, string> = {
    small: 'Small Text',
    normal: 'Normal Text',
    large: 'Large Text',
    xlarge: 'Extra Large Text'
  };
  return labels[size];
}

function getSizeClass(size: FontSize): string {
  const classes: Record<FontSize, string> = {
    small: 'sm',
    normal: 'base',
    large: 'lg',
    xlarge: 'xl'
  };
  return classes[size];
}
