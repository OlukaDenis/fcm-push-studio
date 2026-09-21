import React from 'react';
import {
  X,
  Settings,
  Bell,
  Zap,
  Check,
  RotateCcw,
  Info,
} from 'lucide-react';
import { AppSettings } from '../../types';
import { useToast } from '../../context/ToastContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultMessageType: 'display',
  autoInjectApnsBackground: true,
  autoAndroidHighPriority: true,
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const toast = useToast();
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);
  const [savedToast, setSavedToast] = React.useState(false);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    toast.success('Settings saved', 'Push preferences updated successfully');
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 400);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_APP_SETTINGS);
    toast.info('Settings reset', 'Restored default push preferences');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Push Studio Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure default push behavior & background sync preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Default Notification Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
              Default Push Notification Mode
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Choose the initial mode selected when opening Push Studio. You can still switch modes dynamically inside the composer.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option: Display */}
              <button
                type="button"
                onClick={() =>
                  setLocalSettings({ ...localSettings, defaultMessageType: 'display' })
                }
                className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                  localSettings.defaultMessageType === 'display'
                    ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 ring-1 ring-orange-500 text-orange-900 dark:text-orange-200'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/60 text-orange-600 dark:text-orange-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  {localSettings.defaultMessageType === 'display' && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span className="font-semibold text-sm">Display Notification</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Visual system alert with Title, Body, and Banner previews on lock screen.
                </span>
              </button>

              {/* Option: Data-Only */}
              <button
                type="button"
                onClick={() =>
                  setLocalSettings({ ...localSettings, defaultMessageType: 'data-only' })
                }
                className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                  localSettings.defaultMessageType === 'data-only'
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 ring-1 ring-indigo-500 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  {localSettings.defaultMessageType === 'data-only' && (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span className="font-semibold text-sm">Data-Only (Silent)</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Pure key-value payload with no OS banner. Wakes the app for background processing.
                </span>
              </button>
            </div>
          </div>

          {/* Section 2: Silent Push Automatic Optimizations */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
              Silent Push Delivery Presets
            </label>

            <div className="space-y-3.5">
              {/* APNs Background */}
              <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-950 transition">
                <input
                  type="checkbox"
                  checked={localSettings.autoInjectApnsBackground}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      autoInjectApnsBackground: e.target.checked,
                    })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Auto-configure Apple (APNs) Background Flags
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                    Injects <code className="text-indigo-600 dark:text-indigo-400 font-mono">content-available: 1</code> and <code className="text-indigo-600 dark:text-indigo-400 font-mono">apns-priority: 5</code> required by iOS to wake suspended apps.
                  </span>
                </div>
              </label>

              {/* Android High Priority */}
              <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-950 transition">
                <input
                  type="checkbox"
                  checked={localSettings.autoAndroidHighPriority}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      autoAndroidHighPriority: e.target.checked,
                    })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    High Priority for Android Data Messages
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                    Ensures prompt background execution even if the receiving Android device is currently in battery-saving Doze mode.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Quick Notice Tip */}
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-start space-x-2.5 text-xs text-blue-900 dark:text-blue-200">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Settings are stored in your local browser storage and applied automatically each time you open FCM Push Studio.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 transition cursor-pointer"
            >
              {savedToast ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
