import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCode,
  Key,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  X,
  FileCheck,
  Layers,
} from 'lucide-react';
import { FirebaseStatus } from '../../types';
import { uploadFirebaseCredentials, disconnectFirebase } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface ServiceAccountManagerProps {
  isOpen: boolean;
  onClose: () => void;
  firebaseStatus: FirebaseStatus | null;
  onStatusUpdated: (status: FirebaseStatus) => void;
  onOpenGuide: () => void;
}

export const ServiceAccountManager: React.FC<ServiceAccountManagerProps> = ({
  isOpen,
  onClose,
  firebaseStatus,
  onStatusUpdated,
  onOpenGuide,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    toast.info('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleJsonUpload = async (parsed: any) => {
    if (!parsed || typeof parsed !== 'object') {
      const msg = 'File does not contain a valid JSON object.';
      toast.error('Invalid JSON', msg);
      throw new Error(msg);
    }

    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      const msg = 'Invalid Service Account: Missing required fields (project_id, client_email, or private_key).';
      toast.error('Validation Error', msg);
      throw new Error(msg);
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const newStatus = await uploadFirebaseCredentials(parsed);
      onStatusUpdated(newStatus);
      setSuccessMsg(`Successfully connected to Firebase Project: ${newStatus.projectId}`);
      toast.success('Firebase Connected', `Project: ${newStatus.projectId}`);
      setJsonInput('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload service account';
      setErrorMsg(msg);
      toast.error('Upload Failed', msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      const msg = 'Please upload a valid .json service account file.';
      setErrorMsg(msg);
      toast.error('Invalid File', msg);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        await handleJsonUpload(parsed);
      } catch (err: any) {
        const msg = 'Failed to parse JSON file. Ensure it is a valid Google Service Account key.';
        setErrorMsg(msg);
        toast.error('Parse Error', msg);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonInput.trim()) {
      setErrorMsg('Please paste your service account JSON.');
      toast.error('Input Required', 'Please paste your service account JSON.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput.trim());
      await handleJsonUpload(parsed);
    } catch (err: any) {
      const msg = err.message || 'Invalid JSON format. Check syntax and try again.';
      setErrorMsg(msg);
      toast.error('Invalid JSON', msg);
    }
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        'Are you sure you want to disconnect this Firebase project credentials?',
      )
    )
      return;

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const newStatus = await disconnectFirebase();
      onStatusUpdated(newStatus);
      setSuccessMsg('Service account disconnected.');
      toast.info('Firebase Disconnected', 'Active service account removed');
    } catch (err: any) {
      const msg = err.message || 'Failed to disconnect';
      setErrorMsg(msg);
      toast.error('Disconnect Failed', msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                Manage Project Credentials
                {firebaseStatus?.connected && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Connected
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload or change your Firebase Service Account JSON at runtime
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* Active Connection Details Card */}
          {firebaseStatus?.connected && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 dark:border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                    Active Project Connected
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition font-medium flex items-center gap-1 border border-rose-200 dark:border-rose-900/50"
                  title="Disconnect active credentials"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                    Project ID
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {firebaseStatus.projectId}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(firebaseStatus.projectId || '', 'project-id')
                      }
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      {copiedId === 'project-id' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                    Client Email
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 truncate" title={firebaseStatus.clientEmail || ''}>
                      {firebaseStatus.clientEmail}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(firebaseStatus.clientEmail || '', 'client-email')
                      }
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      {copiedId === 'client-email' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback alerts */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload or Paste Tabs */}
          <div>
            <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 w-fit mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'upload'
                    ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload JSON File</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'paste'
                    ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Paste JSON Content</span>
              </button>
            </div>

            {activeTab === 'upload' ? (
              /* Drag & Drop File Area */
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileInput}
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 bg-slate-50/50 dark:bg-slate-950/30'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3 shadow-inner">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    Click to browse or drag & drop service_account.json
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                    Upload the Google Cloud service account JSON downloaded from Firebase Console.
                  </p>

                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400 shadow-sm">
                    <FileCheck className="w-3.5 h-3.5 text-orange-500" />
                    <span>Supports standard Firebase Admin JSON</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Paste JSON Area */
              <form onSubmit={handlePasteSubmit} className="space-y-3">
                <textarea
                  rows={8}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste your service account JSON here:&#10;{&#10;  &quot;type&quot;: &quot;service_account&quot;,&#10;  &quot;project_id&quot;: &quot;...&quot;,&#10;  &quot;private_key&quot;: &quot;...&quot;,&#10;  &quot;client_email&quot;: &quot;...&quot;&#10;}"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isProcessing || !jsonInput.trim()}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? 'Validating...' : 'Load & Connect Credentials'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Info & Guide Callout */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-[11px]">
                Credentials are saved locally to your secure backend instance.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGuide();
              }}
              className="text-orange-600 dark:text-orange-400 hover:underline font-semibold text-[11px] flex items-center gap-1 flex-shrink-0 ml-2"
            >
              <span>Need help getting the key?</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
