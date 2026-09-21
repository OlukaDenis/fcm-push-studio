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
  Settings as SettingsIcon,
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
  onOpenSettings: () => void;
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
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/25 flex-shrink-0">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                FCM Push Studio
              </span>
              <span className="hidden xl:inline text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-orange-100/90 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/50 whitespace-nowrap">
                v1 HTTP
              </span>
            </div>
          </div>

          {/* Center: Navigation Tabs (Single line, no wrap) */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('push')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'push'
                  ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200/50 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Push Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('topic')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'topic'
                  ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200/50 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Topics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200/50 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          </nav>

          {/* Right Side: Firebase Status & Toolbars */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
            {/* Firebase Connection Capsule */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-900/90 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {firebaseStatus?.connected ? (
                <button
                  type="button"
                  onClick={onOpenManager}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/60 transition cursor-pointer"
                  title={`Connected to FCM Project: ${firebaseStatus.projectId}\nClick to manage or update service account`}
                >
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-xs max-w-[100px] sm:max-w-[130px] lg:max-w-[160px] truncate whitespace-nowrap">
                    {firebaseStatus.projectId}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenManager}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer"
                  title="No Service Account Connected - Click to upload JSON"
                >
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Connect FCM</span>
                </button>
              )}

              {/* Refresh credentials button */}
              <button
                type="button"
                onClick={onRefreshStatus}
                disabled={isLoadingStatus}
                title="Reload service-account.json from disk"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin text-orange-500' : ''}`}
                />
              </button>
            </div>

            {/* Quick Actions Toolbar Capsule */}
            <div className="flex items-center space-x-0.5 bg-slate-100/90 dark:bg-slate-900/90 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {/* Setup Guide Button */}
              <button
                type="button"
                onClick={onOpenGuide}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
                title="How to extract and setup service-account.json"
              >
                <HelpCircle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span className="hidden lg:inline whitespace-nowrap">Guide</span>
              </button>

              <div className="w-[1px] h-3.5 bg-slate-200 dark:border-slate-700/60 dark:bg-slate-800 my-auto" />

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={() => setIsDark(!isDark)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
                title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                )}
              </button>

              {/* Studio Settings Button */}
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
                title="Studio Settings (Default push mode, APNs background flags)"
                aria-label="Studio Settings"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('push')}
            className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg font-medium transition ${
              activeTab === 'push'
                ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Push Studio</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('topic')}
            className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg font-medium transition ${
              activeTab === 'topic'
                ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Topics</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg font-medium transition ${
              activeTab === 'history'
                ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-semibold'
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
