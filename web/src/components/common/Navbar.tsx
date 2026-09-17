import React from 'react';
import {
  Bell,
  Radio,
  History,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  HelpCircle,
} from 'lucide-react';
import { FirebaseStatus } from '../../types';

interface NavbarProps {
  activeTab: 'push' | 'topic' | 'history';
  setActiveTab: (tab: 'push' | 'topic' | 'history') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  firebaseStatus: FirebaseStatus | null;
  isLoadingStatus: boolean;
  onRefreshStatus: () => void;
  onOpenGuide: () => void;
  onOpenManager: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  firebaseStatus,
  isLoadingStatus,
  onRefreshStatus,
  onOpenGuide,
  onOpenManager,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                FCM Push Studio
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50">
                v1 HTTP API
              </span>
            </div>
          </div>

          {/* Center: Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('push')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'push'
                  ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Push Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('topic')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'topic'
                  ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Topic Manager</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Dispatch History</span>
            </button>
          </nav>

          {/* Right Side: Firebase Status & Dark/Light Toggle */}
          <div className="flex items-center space-x-3">
            {/* Firebase Status Badge (Click to manage) */}
            <div className="flex items-center">
              {firebaseStatus?.connected ? (
                <button
                  type="button"
                  onClick={onOpenManager}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition shadow-sm"
                  title={`Connected to Project: ${firebaseStatus.projectId}\nClick to manage or replace credentials`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="hidden sm:inline font-mono">
                    {firebaseStatus.projectId}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenManager}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-medium cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/40 transition shadow-sm animate-pulse-subtle"
                  title="No Service Account Connected - Click to upload or paste JSON"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline font-semibold">Upload Service Account</span>
                </button>
              )}

              {/* Refresh / Reload Service Account button */}
              <button
                onClick={onRefreshStatus}
                disabled={isLoadingStatus}
                title="Reload credentials from disk"
                className="ml-1.5 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin text-orange-500' : ''}`}
                />
              </button>
            </div>

            {/* Setup Guide Button */}
            <button
              onClick={onOpenGuide}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-xs font-medium"
              title="How to extract and setup service-account.json"
            >
              <HelpCircle className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">Setup Guide</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('push')}
            className={`flex items-center space-x-1 py-1 px-2 rounded ${
              activeTab === 'push'
                ? 'text-orange-600 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Push Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('topic')}
            className={`flex items-center space-x-1 py-1 px-2 rounded ${
              activeTab === 'topic'
                ? 'text-orange-600 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Topic Manager</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1 py-1 px-2 rounded ${
              activeTab === 'history'
                ? 'text-orange-600 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>
      </div>
    </header>
  );
};
