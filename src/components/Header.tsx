import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, Sun, Moon, Eye, EyeOff } from 'lucide-react';

interface HeaderProps {
  onSearch: (topic: string) => void;
  onOpenNotebook: () => void;
  savedCount: number;
  theme: 'light' | 'dark' | 'sepia';
  setTheme: (t: 'light' | 'dark' | 'sepia') => void;
  focusMode: boolean;
  setFocusMode: (f: boolean) => void;
  themeStyle: any;
}

export function Header({ 
  onSearch, 
  onOpenNotebook, 
  savedCount,
  theme,
  setTheme,
  focusMode,
  setFocusMode,
  themeStyle
}: HeaderProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <header className={`h-16 shrink-0 flex items-center justify-between px-6 border-b transition-all duration-300 ${themeStyle.headerBg}`}>
      {/* Brand Logo */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSearch("M2 Engineering Maths")}>
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-100">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className={`text-xl font-bold tracking-tight font-display ${theme === 'dark' ? 'text-white' : theme === 'sepia' ? 'text-[#433422]' : 'text-slate-800'}`}>
          Simpli<span className="text-indigo-600">Learn</span>
        </span>
      </div>

      {/* Nav Actions, Theme Swapper & Focus Trigger */}
      <div className="flex items-center space-x-4 md:space-x-6">
        
        {/* Topic Search Box */}
        <form onSubmit={handleSubmit} className="relative hidden md:block">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI to simplify any academic concept..."
            className={`w-72 lg:w-96 pl-4 pr-10 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-sans ${themeStyle.inputBg}`}
          />
          <button 
            type="submit"
            className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

        {/* 3-Way Theme Segmented Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/40">
          <button
            onClick={() => setTheme('light')}
            title="Light Theme"
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              theme === 'light' 
                ? "bg-white text-indigo-600 shadow-xs" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('sepia')}
            title="Sepia Warm Paper (Night Reading)"
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              theme === 'sepia' 
                ? "bg-[#eedfc8] text-amber-900 shadow-xs" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="text-[10px] font-extrabold px-0.5">Aa</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            title="Sleek Dark Mode"
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              theme === 'dark' 
                ? "bg-slate-700 text-indigo-400 shadow-xs" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Focus Mode (ADHD reading relief) Toggler */}
        <button
          onClick={() => setFocusMode(!focusMode)}
          title={focusMode ? "Exit Focus Mode" : "ADHD Reading focus (Hide Sidebars)"}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 border cursor-pointer ${
            focusMode 
              ? "bg-amber-100 border-amber-300 text-amber-800 animate-pulse" 
              : "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-slate-50/50"
          }`}
        >
          {focusMode ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Normal Mode</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Focus Mode</span>
            </>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

        <button
          onClick={onOpenNotebook}
          className="relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-bounce" />
          <span className="hidden sm:inline">My Notebook</span>
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white shadow">
              {savedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
