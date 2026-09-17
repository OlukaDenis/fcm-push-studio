import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Apple,
  Wifi,
  Battery,
  Flame,
  Layers,
  Monitor
} from 'lucide-react';

interface DevicePreviewProps {
  title: string;
  body: string;
  imageUrl?: string;
  dataPayload?: Record<string, string>;
  targetType: string;
  target?: string;
}

export const DevicePreview: React.FC<DevicePreviewProps> = ({
  title,
  body,
  imageUrl,
  dataPayload,
  targetType,
  target,
}) => {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');
  const [showDataDrawer, setShowDataDrawer] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const statusBarTime = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const displayTitle = title.trim() || 'Notification Title';
  const displayBody =
    body.trim() || 'Your notification message body will appear right here in real-time.';
  const dataCount = dataPayload ? Object.keys(dataPayload).length : 0;

  return (
    <div className="flex flex-col items-center">
      {/* Platform Switcher & Header Controls */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5 text-orange-500" />
          Live Simulator
        </span>

        <div className="flex items-center space-x-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setPlatform('ios')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${platform === 'ios'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iOS</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${platform === 'android'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
        </div>
      </div>

      {/* Realistic Mobile Frame */}
      <div className="relative w-[340px] h-[640px] bg-slate-900 dark:bg-slate-950 rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-800/80 border-4 border-slate-700/60 flex flex-col justify-between overflow-hidden select-none">
        {/* Dynamic Island / Speaker cutout */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          {platform === 'ios' ? (
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5">
              <div className="w-2 h-2 rounded-full bg-slate-800"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-950/80 border border-slate-800"></div>
            </div>
          ) : (
            <div className="w-3 h-3 bg-black rounded-full border border-slate-800"></div>
          )}
        </div>

        {/* Device Screen Area */}
        <div
          className="relative w-full h-full rounded-[38px] overflow-hidden flex flex-col justify-between p-4"
          style={{
            background:
              platform === 'ios'
                ? 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%, #020617 100%)'
                : 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 70%, #030712 100%)',
          }}
        >
          {/* Top Status Bar */}
          <div className="flex items-center justify-between text-white/90 text-xs px-2 pt-1 font-medium z-10">
            <span>{statusBarTime}</span>
            <div className="flex items-center space-x-1.5 text-white/80">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Center Wallpaper Lockscreen Clock (iOS Style) */}
          <div className="text-center my-auto flex flex-col items-center opacity-80 pointer-events-none">
            <span className="text-xs text-white/70 font-medium tracking-wide uppercase">
              {formattedDate}
            </span>
            <span className="text-6xl font-light text-white tracking-tight my-1">
              {formattedTime}
            </span>
            <span className="text-xs text-white/50">
              Target: <span className="font-mono text-orange-400">{targetType.toUpperCase()}</span>
            </span>
          </div>

          {/* The Live Notification Banner */}
          <div className="w-full z-10 animate-fade-in-up">
            {platform === 'ios' ? (
              /* iOS Style Notification Banner */
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-xl text-white">
                {/* Notification Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm">
                      <Flame className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">
                      FCM TEST
                    </span>
                  </div>
                  <span className="text-[10px] text-white/50">now</span>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white leading-tight">
                    {displayTitle}
                  </h4>
                  <p className="text-xs text-slate-300 leading-snug line-clamp-3">
                    {displayBody}
                  </p>
                </div>

                {/* Optional Image */}
                {imageUrl && (
                  <div className="mt-2.5 rounded-xl overflow-hidden max-h-32 bg-slate-950/60 border border-white/5">
                    <img
                      src={imageUrl}
                      alt="Push attachment"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Android Style Notification Shade Card */
              <div className="bg-slate-800/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-xl text-white">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                      <Flame className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-slate-300">
                      FCM App
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-[11px] text-slate-400">now</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-slate-100 leading-snug">
                    {displayTitle}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {displayBody}
                  </p>
                </div>

                {/* Android Image Expanded */}
                {imageUrl && (
                  <div className="mt-2.5 rounded-xl overflow-hidden max-h-36 bg-slate-900 border border-slate-700/50">
                    <img
                      src={imageUrl}
                      alt="Push attachment"
                      className="w-full h-36 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Home Bar Indicator */}
          <div className="w-28 h-1 bg-white/40 rounded-full mx-auto mt-3 mb-1"></div>
        </div>
      </div>

      {/* Extra Info: Data Payload Preview Pills */}
      {dataCount > 0 && (
        <div className="w-full max-w-sm mt-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs">
          <div className="flex items-center justify-between mb-1.5 font-medium text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Attached Custom Data ({dataCount})
            </span>
            <button
              type="button"
              onClick={() => setShowDataDrawer(!showDataDrawer)}
              className="text-orange-600 dark:text-orange-400 text-[11px] hover:underline"
            >
              {showDataDrawer ? 'Collapse' : 'Expand'}
            </button>
          </div>
          {showDataDrawer && (
            <div className="space-y-1 mt-2 font-mono text-[11px] bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              {Object.entries(dataPayload || {}).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-orange-500">{k}:</span>
                  <span className="truncate max-w-[160px]">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
