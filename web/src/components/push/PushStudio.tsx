import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Radio,
  Users,
  Send,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react';
import { DevicePreview } from '../preview/DevicePreview';
import { SendPushPayload, SendResult, TargetType } from '../../types';
import { sendPushNotification } from '../../services/api';

interface PushStudioProps {
  initialPayload?: Partial<SendPushPayload>;
  onNotificationSent?: () => void;
}

export const PushStudio: React.FC<PushStudioProps> = ({
  initialPayload,
  onNotificationSent,
}) => {
  const [targetType, setTargetType] = useState<TargetType>(
    initialPayload?.targetType || 'token',
  );
  const [target, setTarget] = useState<string>(initialPayload?.target || '');
  const [title, setTitle] = useState<string>(
    initialPayload?.title || 'Hello from FCM Push Studio!',
  );
  const [body, setBody] = useState<string>(
    initialPayload?.body ||
      'This is a real-time push notification test dispatched from NestJS.',
  );
  const [imageUrl, setImageUrl] = useState<string>(
    initialPayload?.imageUrl || '',
  );

  // Custom data pairs [{ key: 'action', value: 'open_cart' }]
  const [customData, setCustomData] = useState<Array<{ key: string; value: string }>>(
    initialPayload?.data
      ? Object.entries(initialPayload.data).map(([key, value]) => ({ key, value }))
      : [{ key: 'click_action', value: 'FLUTTER_NOTIFICATION_CLICK' }],
  );

  // Platform overrides
  const [showPlatformConfig, setShowPlatformConfig] = useState(
    Boolean(initialPayload?.android || initialPayload?.apns),
  );
  const [androidChannelId, setAndroidChannelId] = useState(
    initialPayload?.android?.channelId || 'default',
  );
  const [androidSound, setAndroidSound] = useState(
    initialPayload?.android?.sound || 'default',
  );
  const [androidPriority, setAndroidPriority] = useState<'high' | 'normal'>(
    initialPayload?.android?.priority || 'high',
  );
  const [apnsBadge, setApnsBadge] = useState<number | ''>(
    initialPayload?.apns?.badge !== undefined ? initialPayload.apns.badge : 1,
  );
  const [apnsSound, setApnsSound] = useState(
    initialPayload?.apns?.sound || 'default',
  );

  // Sync state whenever initialPayload changes (e.g. from History "Load")
  useEffect(() => {
    if (!initialPayload) return;
    if (initialPayload.targetType) setTargetType(initialPayload.targetType);
    if (initialPayload.target !== undefined) setTarget(initialPayload.target);
    if (initialPayload.title !== undefined) setTitle(initialPayload.title);
    if (initialPayload.body !== undefined) setBody(initialPayload.body);
    if (initialPayload.imageUrl !== undefined) setImageUrl(initialPayload.imageUrl || '');

    if (initialPayload.data) {
      setCustomData(
        Object.entries(initialPayload.data).map(([key, value]) => ({ key, value })),
      );
    }

    if (initialPayload.android || initialPayload.apns) {
      setShowPlatformConfig(true);
      if (initialPayload.android?.channelId !== undefined) {
        setAndroidChannelId(initialPayload.android.channelId);
      }
      if (initialPayload.android?.sound !== undefined) {
        setAndroidSound(initialPayload.android.sound);
      }
      if (initialPayload.android?.priority) {
        setAndroidPriority(initialPayload.android.priority);
      }
      if (initialPayload.apns?.badge !== undefined) {
        setApnsBadge(initialPayload.apns.badge);
      }
      if (initialPayload.apns?.sound !== undefined) {
        setApnsSound(initialPayload.apns.sound);
      }
    }
  }, [initialPayload]);

  // Request status
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Handle custom data rows
  const handleAddDataRow = () => {
    setCustomData([...customData, { key: '', value: '' }]);
  };

  const handleRemoveDataRow = (index: number) => {
    setCustomData(customData.filter((_, i) => i !== index));
  };

  const handleDataChange = (index: number, field: 'key' | 'value', text: string) => {
    const updated = [...customData];
    updated[index][field] = text;
    setCustomData(updated);
  };

  // Convert customData array into Record<string, string>
  const getDataObject = (): Record<string, string> => {
    const obj: Record<string, string> = {};
    for (const item of customData) {
      if (item.key.trim()) {
        obj[item.key.trim()] = item.value;
      }
    }
    return obj;
  };

  // Preset templates
  const applyPreset = (preset: 'basic' | 'rich' | 'promo' | 'data' | 'audible') => {
    if (preset === 'basic') {
      setTitle('Important Update Available');
      setBody('Tap to view new announcements and features in your app.');
      setImageUrl('');
    } else if (preset === 'rich') {
      setTitle('Special Weekend Flash Sale! 🎁');
      setBody('Get up to 50% discount on all selected store items. Limited time only!');
      setImageUrl('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=60');
    } else if (preset === 'promo') {
      setTitle('Welcome to the Community! 🎉');
      setBody('Thanks for joining us. Check out getting started tips.');
      setImageUrl('https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=800&auto=format&fit=crop&q=60');
    } else if (preset === 'audible') {
      setTitle('New Alert');
      setBody('This notification will make noise.');
      setImageUrl('');
      setShowPlatformConfig(true);
      setAndroidChannelId('audible_channel_id');
      setAndroidSound('default');
      setApnsSound('default');
    } else if (preset === 'data') {
      setTitle('Background Sync Trigger');
      setBody('Silent update signal received.');
      setCustomData([
        { key: 'action', value: 'REFRESH_CACHE' },
        { key: 'sync_id', value: Date.now().toString() },
      ]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendResult(null);

    const payload: SendPushPayload = {
      targetType,
      target: targetType === 'broadcast' ? (target || 'all') : target,
      title,
      body,
      imageUrl: imageUrl.trim() || undefined,
      data: getDataObject(),
      android: {
        channelId: androidChannelId || undefined,
        sound: androidSound || undefined,
        priority: androidPriority,
      },
      apns: {
        badge: apnsBadge === '' ? undefined : Number(apnsBadge),
        sound: apnsSound || undefined,
      },
    };

    try {
      const result = await sendPushNotification(payload);
      setSendResult(result);
      if (onNotificationSent) {
        onNotificationSent();
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to dispatch notification';
      setSendResult({
        success: false,
        targetType,
        target: target || 'all',
        error: errorMsg,
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form Controls (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Card Header & Presets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Compose Push Notification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target devices, construct payloads, and send via Firebase Admin SDK
              </p>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
              </span>
              <button
                type="button"
                onClick={() => applyPreset('basic')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Basic
              </button>
              <button
                type="button"
                onClick={() => applyPreset('rich')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Rich
              </button>
              <button
                type="button"
                onClick={() => applyPreset('audible')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/60 transition"
              >
                Audible
              </button>
              <button
                type="button"
                onClick={() => applyPreset('data')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Silent
              </button>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-5">
            {/* Target Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTargetType('token')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    targetType === 'token'
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold ring-1 ring-orange-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mb-1.5" />
                  <span className="text-xs">Single Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('topic')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    targetType === 'topic'
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold ring-1 ring-orange-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Radio className="w-5 h-5 mb-1.5" />
                  <span className="text-xs">Topic Target</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('broadcast')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    targetType === 'broadcast'
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold ring-1 ring-orange-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Users className="w-5 h-5 mb-1.5" />
                  <span className="text-xs">Broadcast ('all')</span>
                </button>
              </div>
            </div>

            {/* Target Value Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {targetType === 'token' && 'FCM Registration Token *'}
                  {targetType === 'topic' && 'Topic Name *'}
                  {targetType === 'broadcast' && 'Broadcast Topic (defaults to "all")'}
                </label>
                {targetType === 'broadcast' && (
                  <span className="text-[11px] text-slate-400">
                    Sends to all clients subscribed to topic
                  </span>
                )}
              </div>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required={targetType !== 'broadcast'}
                placeholder={
                  targetType === 'token'
                    ? 'e.g. fN8gU9_K... (paste long FCM device token)'
                    : targetType === 'topic'
                    ? 'e.g. news, sports, alerts'
                    : 'all (or custom general topic)'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Title & Body */}
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Notification Title *
                  </label>
                  <span className="text-[11px] text-slate-400">{title.length}/100</span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                  placeholder="Enter notification title..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Notification Body *
                  </label>
                  <span className="text-[11px] text-slate-400">{body.length}/300</span>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={300}
                  required
                  rows={3}
                  placeholder="Enter notification body message..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-xs"
                />
              </div>
            </div>

            {/* Custom Data Key-Value Editor */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Custom Data Payload (Key-Value)
                </label>
                <button
                  type="button"
                  onClick={handleAddDataRow}
                  className="flex items-center space-x-1 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Field</span>
                </button>
              </div>

              <div className="space-y-2">
                {customData.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Key (e.g. route)"
                      value={item.key}
                      onChange={(e) => handleDataChange(idx, 'key', e.target.value)}
                      className="w-1/3 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. /profile/settings)"
                      value={item.value}
                      onChange={(e) => handleDataChange(idx, 'value', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDataRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {customData.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No custom data attached.</p>
                )}
              </div>
            </div>

            {/* Platform Overrides (Collapsible) */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setShowPlatformConfig(!showPlatformConfig)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider py-1 hover:text-orange-500 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Advanced Platform Overrides (Android / APNs)
                </span>
                {showPlatformConfig ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showPlatformConfig && (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        Android Channel ID
                      </label>
                      <input
                        type="text"
                        value={androidChannelId}
                        placeholder="e.g. audible_channel_id"
                        onChange={(e) => setAndroidChannelId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        Android Sound
                      </label>
                      <input
                        type="text"
                        value={androidSound}
                        placeholder="e.g. default"
                        onChange={(e) => setAndroidSound(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        Android Priority
                      </label>
                      <select
                        value={androidPriority}
                        onChange={(e) =>
                          setAndroidPriority(e.target.value as 'high' | 'normal')
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="high">High (Immediate)</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        iOS Badge Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={apnsBadge}
                        onChange={(e) =>
                          setApnsBadge(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        iOS Sound
                      </label>
                      <input
                        type="text"
                        value={apnsSound}
                        onChange={(e) => setApnsSound(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSending}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Transmitting to Firebase FCM...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Push Notification</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Real-time Result Feedback Box */}
          {sendResult && (
            <div
              className={`mt-5 p-4 rounded-xl border transition-all ${
                sendResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {sendResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  )}
                  <h4 className="font-semibold text-sm">
                    {sendResult.success
                      ? 'Notification Dispatched Successfully!'
                      : 'FCM Dispatch Failed'}
                  </h4>
                </div>
              </div>

              <div className="mt-2 text-xs space-y-1 font-mono">
                {sendResult.messageId && (
                  <div className="flex items-center justify-between bg-white/70 dark:bg-slate-900/70 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
                    <div className="truncate mr-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        FCM Message ID:
                      </span>{' '}
                      {sendResult.messageId}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(sendResult.messageId || '')}
                      className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      title="Copy Message ID"
                    >
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {sendResult.error && (
                  <div className="bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-rose-200/50 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 whitespace-pre-wrap">
                    {sendResult.error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Live Mobile Mockup (5 cols) */}
      <div className="lg:col-span-5 flex justify-center sticky top-24">
        <DevicePreview
          title={title}
          body={body}
          imageUrl={imageUrl}
          dataPayload={getDataObject()}
          targetType={targetType}
          target={target}
        />
      </div>
    </div>
  );
};
