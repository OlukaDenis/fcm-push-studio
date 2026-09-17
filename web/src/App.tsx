import { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { PushStudio } from './components/push/PushStudio';
import { TopicManager } from './components/topics/TopicManager';
import { HistoryView } from './components/history/HistoryView';
import { ServiceAccountGuideModal } from './components/common/ServiceAccountGuideModal';
import { getFirebaseStatus, reloadFirebase } from './services/api';
import { FirebaseStatus, SendPushPayload } from './types';
import {
  AlertTriangle,
  FileCode,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'push' | 'topic' | 'history'>('push');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('fcm_theme') === 'dark' ||
      (!('fcm_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isBannerGuideExpanded, setIsBannerGuideExpanded] = useState(true);
  const [copiedPath, setCopiedPath] = useState(false);
  const [clonedPayload, setClonedPayload] = useState<Partial<SendPushPayload> | undefined>(
    undefined,
  );

  // Sync dark class on html root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fcm_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fcm_theme', 'light');
    }
  }, [isDark]);

  // Check Firebase status on mount
  const checkStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const status = await getFirebaseStatus();
      setFirebaseStatus(status);
    } catch (err) {
      setFirebaseStatus({
        connected: false,
        projectId: null,
        clientEmail: null,
        serviceAccountPath: null,
        error: 'API server is not reachable. Ensure backend is running on port 3001.',
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleReloadCredentials = async () => {
    setIsLoadingStatus(true);
    try {
      const status = await reloadFirebase();
      setFirebaseStatus(status);
    } catch (err) {
      await checkStatus();
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleCloneToStudio = (payload: Partial<SendPushPayload>) => {
    setClonedPayload(payload);
    setActiveTab('push');
  };

  const copyPath = () => {
    navigator.clipboard.writeText('api/service-account.json');
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        firebaseStatus={firebaseStatus}
        isLoadingStatus={isLoadingStatus}
        onRefreshStatus={handleReloadCredentials}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Account Missing Alert Banner & Stepper Guide */}
        {firebaseStatus && !firebaseStatus.connected && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 shadow-sm animate-fade-in space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 dark:text-amber-200 text-base">
                    Firebase Credentials Needed for FCM
                  </h3>
                  <p className="text-amber-800/90 dark:text-amber-300/90 text-xs sm:text-sm mt-0.5">
                    FCM v1 requires a Google Cloud service account key to sign and transmit push notifications.
                  </p>
                </div>
              </div>

              {/* Action Buttons in Banner */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 hover:bg-amber-100/50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                  <span>Full Guide</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBannerGuideExpanded(!isBannerGuideExpanded)}
                  className="p-1.5 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition"
                  title="Toggle instructions"
                >
                  {isBannerGuideExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick 4-Step Visual Instructions */}
            {isBannerGuideExpanded && (
              <div className="pt-2 border-t border-amber-200/70 dark:border-amber-900/50 space-y-3">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  How to get your key in 1 minute:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                      1
                    </span>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                      Firebase Console
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                      Go to{' '}
                      <a
                        href="https://console.firebase.google.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-600 dark:text-orange-400 underline font-medium inline-flex items-center gap-0.5"
                      >
                        console.firebase.google.com
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>{' '}
                      and select your project.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                      2
                    </span>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                      Project Settings
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                      Click the gear icon ⚙️ in the top-left sidebar &gt; <strong>Project settings</strong>.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                      3
                    </span>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                      Generate Private Key
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                      Select <strong>Service accounts</strong> tab &gt; click <strong>Generate new private key</strong>.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white font-bold text-[10px]">
                      4
                    </span>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                      Copy into Project
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                      Save or rename the file to <code className="font-mono text-orange-600 dark:text-orange-400">api/service-account.json</code>.
                    </p>
                  </div>
                </div>

                {/* File path pill and Verify button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                      Destination file:
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 text-slate-800 dark:text-slate-200 shadow-sm font-mono text-xs">
                      <FileCode className="w-3.5 h-3.5 text-amber-500" />
                      api/service-account.json
                      <button
                        type="button"
                        onClick={copyPath}
                        className="ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Copy path"
                      >
                        {copiedPath ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleReloadCredentials}
                    disabled={isLoadingStatus}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingStatus ? 'Verifying...' : 'Verify & Reload Credentials'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'push' && (
          <PushStudio
            initialPayload={clonedPayload}
            onNotificationSent={() => {
              // Hook after notification sent
            }}
          />
        )}

        {activeTab === 'topic' && <TopicManager />}

        {activeTab === 'history' && (
          <HistoryView onCloneToStudio={handleCloneToStudio} />
        )}
      </main>

      {/* Guide Modal */}
      <ServiceAccountGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onReload={handleReloadCredentials}
        isLoading={isLoadingStatus}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>FCM Push Testing Platform • NestJS + React + SQLite</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="text-orange-600 dark:text-orange-400 font-medium hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Service Account Setup Guide</span>
            </button>
            <span>•</span>
            <a
              href="https://firebase.google.com/docs/cloud-messaging"
              target="_blank"
              rel="noreferrer"
              className="hover:text-orange-500 transition"
            >
              FCM Documentation
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
