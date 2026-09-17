import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  FileCode,
  Key,
  Download,
  Settings,
  FolderDown,
} from 'lucide-react';

interface ServiceAccountGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReload: () => void;
  isLoading?: boolean;
}

export const ServiceAccountGuideModal: React.FC<ServiceAccountGuideModalProps> = ({
  isOpen,
  onClose,
  onReload,
  isLoading = false,
}) => {
  const [copiedPath, setCopiedPath] = useState(false);

  if (!isOpen) return null;

  const targetPath = 'api/service-account.json';

  const copyPath = () => {
    navigator.clipboard.writeText(targetPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                How to Extract Your Firebase Service Account JSON
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Follow these 5 simple steps to get and configure your key for FCM
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Steps */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-700 dark:text-slate-300">
          {/* Step 1 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex-shrink-0">
              1
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Open Firebase Console
                </h4>
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold hover:underline"
                >
                  <span>Open Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Navigate to your Firebase project overview page in your web browser.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex-shrink-0">
              2
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Go to Project Settings
                </h4>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Click on the <strong className="text-slate-800 dark:text-slate-200">gear icon ⚙️</strong> next to "Project Overview" in the left sidebar, then select <strong className="text-slate-800 dark:text-slate-200">Project settings</strong>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex-shrink-0">
              3
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                Switch to "Service accounts" Tab
              </h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Click on the <span className="font-semibold text-orange-600 dark:text-orange-400">Service accounts</span> tab at the top of the settings page. Make sure <strong className="text-slate-800 dark:text-slate-200">Firebase Admin SDK</strong> is highlighted.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex-shrink-0">
              4
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-1.5">
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Generate New Private Key
                </h4>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Click the blue <strong className="text-slate-800 dark:text-slate-200">"Generate new private key"</strong> button at the bottom of the section, and confirm when prompted. A <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-orange-600 dark:text-orange-400">.json</code> file will immediately download to your computer.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl border-2 border-orange-500/50 bg-orange-50/30 dark:bg-orange-950/20">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex-shrink-0">
              5
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-1.5">
                <FolderDown className="w-3.5 h-3.5 text-orange-500" />
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Place File in the API Directory
                </h4>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Rename or copy your downloaded JSON file to:
              </p>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-950 border border-orange-200 dark:border-orange-900/60 font-mono text-xs text-orange-600 dark:text-orange-400">
                <span className="font-bold">{targetPath}</span>
                <button
                  type="button"
                  onClick={copyPath}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  title="Copy relative path"
                >
                  {copiedPath ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protected: service-account.json is strictly ignored by .gitignore</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <span className="text-xs text-slate-500">
            Once file is copied, reload to establish connection.
          </span>
          <button
            type="button"
            onClick={onReload}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Verify & Reload Connection'}
          </button>
        </div>
      </div>
    </div>
  );
};
