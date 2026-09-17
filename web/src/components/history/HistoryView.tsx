import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ExternalLink,
  Code2,
  X,
  Smartphone,
  Radio,
  Users,
} from 'lucide-react';
import { getHistory, deleteHistoryItem, clearAllHistory } from '../../services/api';
import { NotificationHistoryItem, SendPushPayload, TargetType } from '../../types';

interface HistoryViewProps {
  onCloneToStudio: (payload: Partial<SendPushPayload>) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onCloneToStudio }) => {
  const [historyItems, setHistoryItems] = useState<NotificationHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [targetFilter, setTargetFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<NotificationHistoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [payloadFormat, setPayloadFormat] = useState<'sdk' | 'rest'>('rest');

  const getFullMessagePayload = (
    item: NotificationHistoryItem,
    format: 'sdk' | 'rest' = 'rest',
  ) => {
    let base: any = null;
    if (item.fullPayload) {
      try {
        base = JSON.parse(item.fullPayload);
      } catch (e) {}
    }
    if (!base) {
      base = {
        [item.targetType === 'token' ? 'token' : 'topic']: item.target,
        notification: {
          title: item.title,
          body: item.body,
          ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
        },
      };
      if (item.dataPayload) {
        try {
          base.data = JSON.parse(item.dataPayload);
        } catch (e) {}
      }
      if (item.platformConfig) {
        try {
          const platform = JSON.parse(item.platformConfig);
          if (platform.android) base.android = platform.android;
          if (platform.apns) base.apns = platform.apns;
        } catch (e) {}
      }
    }
    return format === 'rest' ? { message: base } : base;
  };

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await getHistory({
        limit: 100,
        targetType: targetFilter || undefined,
        status: statusFilter || undefined,
      });
      setHistoryItems(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [targetFilter, statusFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notification record?')) return;
    try {
      await deleteHistoryItem(id);
      setHistoryItems(historyItems.filter((i) => i.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Failed to delete history item', err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to permanently clear all notification history?')) return;
    try {
      await clearAllHistory();
      setHistoryItems([]);
      setTotal(0);
      setSelectedItem(null);
    } catch (err) {
      console.error('Failed to clear history', err);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClone = (item: NotificationHistoryItem) => {
    let parsedData: Record<string, string> | undefined;
    if (item.dataPayload) {
      try {
        parsedData = JSON.parse(item.dataPayload);
      } catch (e) {}
    }

    let android: any = undefined;
    let apns: any = undefined;

    if (item.platformConfig) {
      try {
        const parsed = JSON.parse(item.platformConfig);
        if (parsed.android) android = parsed.android;
        if (parsed.apns) apns = parsed.apns;
      } catch (e) {}
    }

    // Also check fullPayload if present
    if (item.fullPayload) {
      try {
        const full = JSON.parse(item.fullPayload);
        if (!parsedData && full.data) {
          parsedData = full.data;
        }
        if (!android && full.android) {
          android = {
            channelId:
              full.android.notification?.channelId ||
              full.android.notification?.channel_id,
            sound: full.android.notification?.sound,
            priority: full.android.priority,
          };
        }
        if (!apns && full.apns) {
          apns = {
            badge: full.apns.payload?.aps?.badge,
            sound: full.apns.payload?.aps?.sound,
          };
        }
      } catch (e) {}
    }

    onCloneToStudio({
      targetType: item.targetType,
      target: item.target,
      title: item.title,
      body: item.body,
      imageUrl: item.imageUrl || undefined,
      data: parsedData,
      android,
      apns,
    });
  };

  // Filter items by client search query
  const filteredItems = historyItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.body.toLowerCase().includes(q) ||
      item.target.toLowerCase().includes(q) ||
      (item.fcmMessageId && item.fcmMessageId.toLowerCase().includes(q))
    );
  });

  const getTargetIcon = (type: TargetType) => {
    switch (type) {
      case 'token':
        return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
      case 'topic':
        return <Radio className="w-3.5 h-3.5 text-purple-500" />;
      case 'broadcast':
        return <Users className="w-3.5 h-3.5 text-orange-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-orange-500" />
            Dispatch History & Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Persistent SQLite audit log of outbound push requests and FCM delivery responses ({total} total)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={fetchHistory}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
            <span>Refresh</span>
          </button>

          {historyItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, target, or message ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* Target Filter Pills */}
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setTargetFilter('')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              targetFilter === ''
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setTargetFilter('token')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              targetFilter === 'token'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tokens
          </button>
          <button
            onClick={() => setTargetFilter('topic')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              targetFilter === 'topic'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Topics
          </button>
          <button
            onClick={() => setTargetFilter('broadcast')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              targetFilter === 'broadcast'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Broadcasts
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1 text-xs border-l border-slate-200 dark:border-slate-800 pl-3">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-2 py-1 rounded-lg font-medium transition ${
              statusFilter === ''
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-500'
            }`}
          >
            Any
          </button>
          <button
            onClick={() => setStatusFilter('SUCCESS')}
            className={`px-2 py-1 rounded-lg font-medium transition ${
              statusFilter === 'SUCCESS'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setStatusFilter('FAILED')}
            className={`px-2 py-1 rounded-lg font-medium transition ${
              statusFilter === 'FAILED'
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
            <p className="font-medium text-sm">No notification records found</p>
            <p className="text-xs text-slate-400">
              Dispatched push notifications will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Notification Content</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Status Pill */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
                          <XCircle className="w-3 h-3 text-rose-500" />
                          Failed
                        </span>
                      )}
                    </td>

                    {/* Target & TargetType */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                        {getTargetIcon(item.targetType)}
                        <span className="truncate max-w-[140px] text-slate-800 dark:text-slate-200" title={item.target}>
                          {item.target}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(item.target, `target-${item.id}`)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title="Copy target"
                        >
                          {copiedId === `target-${item.id}` ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {item.targetType}
                      </span>
                    </td>

                    {/* Title & Body */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                        {item.body}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                      <div className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium inline-flex items-center gap-1 text-[11px]"
                        title="Inspect payload & FCM response"
                      >
                        <Code2 className="w-3 h-3 text-indigo-500" />
                        <span>Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleClone(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-600 dark:text-orange-400 font-medium inline-flex items-center gap-1 text-[11px]"
                        title="Load into Push Studio"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Load</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Notification Dispatch Audit #{selectedItem.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* Status Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  selectedItem.status === 'SUCCESS'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}
              >
                <span className="font-semibold">Status: {selectedItem.status}</span>
                {selectedItem.fcmMessageId && (
                  <span className="font-mono text-[11px] truncate max-w-xs">
                    ID: {selectedItem.fcmMessageId}
                  </span>
                )}
              </div>

              {/* Target & Time */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block mb-0.5">Target ({selectedItem.targetType}):</span>
                  <span className="text-slate-900 dark:text-white break-all">{selectedItem.target}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Dispatched At:</span>
                  <span className="text-slate-900 dark:text-white">
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Error if present */}
              {selectedItem.errorMessage && (
                <div>
                  <span className="font-semibold text-rose-500 block mb-1">Error Diagnostics:</span>
                  <pre className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 font-mono text-[11px] whitespace-pre-wrap">
                    {selectedItem.errorMessage}
                  </pre>
                </div>
              )}

              {/* Full Dispatched FCM Message Payload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Full Dispatched Message Payload:
                    </span>
                    <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                      <button
                        type="button"
                        onClick={() => setPayloadFormat('rest')}
                        className={`px-2 py-0.5 rounded-md font-medium transition ${
                          payloadFormat === 'rest'
                            ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        HTTP v1 REST
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayloadFormat('sdk')}
                        className={`px-2 py-0.5 rounded-md font-medium transition ${
                          payloadFormat === 'sdk'
                            ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Admin SDK
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        JSON.stringify(
                          getFullMessagePayload(selectedItem, payloadFormat),
                          null,
                          2,
                        ),
                        'full-payload',
                      )
                    }
                    className="p-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 text-[11px] font-medium transition shadow-sm"
                    title="Copy full payload JSON"
                  >
                    {copiedId === 'full-payload' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-900 dark:bg-black rounded-xl text-slate-100 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                  {JSON.stringify(
                    getFullMessagePayload(selectedItem, payloadFormat),
                    null,
                    2,
                  )}
                </pre>
              </div>

              {/* Custom Data Payload */}
              {selectedItem.dataPayload && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Attached Custom Data Payload:
                  </span>
                  <pre className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl text-slate-800 dark:text-slate-200 font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedItem.dataPayload), null, 2)}
                  </pre>
                </div>
              )}

              {/* Raw Response */}
              {selectedItem.rawResponse && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    FCM Response / Error Trace:
                  </span>
                  <pre className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl text-slate-800 dark:text-slate-200 font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedItem.rawResponse), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-2 px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <button
                type="button"
                onClick={() => {
                  handleClone(selectedItem);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Clone into Push Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
