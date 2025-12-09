import React from 'react';
import { Search, Pill as Pills, User, LogOut, Menu, Bell, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { SearchSuggestions } from './SearchSuggestions';
import { HelpTooltip } from './HelpTooltip';

interface LayoutProps {
  children: React.ReactNode;
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function Layout({ children, onSearch, searchQuery }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [favorites, setFavorites] = React.useState<string[]>([]);

  const searchSuggestions = [
    'Panadol', 'Flagyl', 'Amoxil', 'Chloroquine', 'Vitamin C',
    'Paracetamol', 'Ibuprofen', 'Omeprazole', 'Metformin', 'Aspirin'
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Pills className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">NaijaMeds</h1>
                <p className="text-xs text-gray-500">Nigerian Pharmacy Finder</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative" role="search">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for medications in Nigerian pharmacies..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  autoComplete="off"
                  aria-label="Search medications"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <SearchSuggestions
                  suggestions={searchSuggestions}
                  onSuggestionClick={handleSuggestionClick}
                  isVisible={showSuggestions && searchQuery.length === 0}
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <button
                    className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      3
                    </span>
                  </button>
                  
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Favorites"
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                  
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.email}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:block">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Sign in to contribute</span>
                  <HelpTooltip content="Create an account to update medication availability and help other users find their medications faster." />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Pills className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-gray-900">NaijaMeds</span>
              </div>
              <p className="text-sm text-gray-600">
                Helping Nigerians find medications across pharmacies nationwide through community-driven data.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Popular Medications</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Find Pharmacies</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Add Pharmacy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">How It Works</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Report Issue</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Community</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Guidelines</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contributors</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Feedback</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 NaijaMeds. Made with ❤️ for Nigeria's healthcare community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}