import React, { useState } from 'react';
import {
  Radio,
  UserPlus,
  UserMinus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
} from 'lucide-react';
import { subscribeTopic, unsubscribeTopic } from '../../services/api';
import { TopicOperationResult } from '../../types';

export const TopicManager: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TopicOperationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const parseTokens = (): string[] => {
    return tokenInput
      .split(/[\n,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  };

  const handleAction = async (action: 'subscribe' | 'unsubscribe') => {
    const tokens = parseTokens();
    if (!topic.trim()) {
      setErrorMsg('Please specify a topic name.');
      return;
    }
    if (tokens.length === 0) {
      setErrorMsg('Please enter at least one FCM device token.');
      return;
    }

    setErrorMsg(null);
    setResult(null);
    setIsLoading(true);

    try {
      const payload = {
        topic: topic.trim(),
        tokens,
      };

      const res =
        action === 'subscribe'
          ? await subscribeTopic(payload)
          : await unsubscribeTopic(payload);

      setResult(res);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          `Failed to ${action} tokens to topic`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Radio className="w-6 h-6 text-orange-500" />
          FCM Topic Subscription Manager
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Dynamically bind or unbind client device tokens to FCM topics via Firebase Admin SDK.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Topic Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Topic Name *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. news, global_announcements, beta_testers"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
            />
          </div>

          {/* Device Tokens Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Registration Tokens *
              </label>
              <span className="text-[11px] text-slate-400">
                {parseTokens().length} token(s) detected
              </span>
            </div>
            <textarea
              rows={5}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste one or multiple device tokens here (separated by newlines or commas)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleAction('subscribe')}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Subscribe to Topic</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleAction('unsubscribe')}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <UserMinus className="w-4 h-4" />
              <span>Unsubscribe from Topic</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Operation Result */}
          {result && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                result.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h4 className="font-semibold text-sm">
                  Topic Operation Completed for '{result.topic}'
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/70">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Success Count:
                  </span>{' '}
                  {result.successCount}
                </div>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/70">
                  <span className="text-rose-500 font-bold">Failure Count:</span>{' '}
                  {result.failureCount}
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="mt-3 text-xs space-y-1">
                  <span className="font-semibold text-rose-500">Errors:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-600 dark:text-rose-300 font-mono text-[11px]">
                    {result.errors.map((e, idx) => (
                      <li key={idx}>
                        Token index #{e.index}: {e.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informational Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-xs text-slate-600 dark:text-slate-400 space-y-3">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
              <Info className="w-4 h-4 text-orange-500" />
              How FCM Topics Work
            </h3>
            <p className="leading-relaxed">
              FCM topic messaging allows you to send a push notification to multiple devices that have opted in to a particular topic name.
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-[11px]">
              <li>Topic names can match <code className="font-mono text-orange-600 dark:text-orange-400">[a-zA-Z0-9-_.~%]+</code></li>
              <li>Subscriptions take a few seconds to propagate through Google's edge caches.</li>
              <li>A single device can be subscribed to up to 2,000 topics.</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-orange-200/50 dark:border-orange-900/30 rounded-2xl p-5 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <h4 className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              General Broadcast Strategy
            </h4>
            <p className="leading-relaxed text-[11px]">
              To broadcast to all active users, have your mobile/web app subscribe to the default topic <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">'all'</code> upon launch. You can then broadcast anytime from the Push Studio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
