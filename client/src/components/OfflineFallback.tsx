import React from 'react';
import { WifiOff, RefreshCw, Smartphone } from 'lucide-react';
import { usePWA } from '../context/PWAContext';
import { useTheme } from '../context/ThemeContext';

interface OfflineFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showQueueStatus?: boolean;
}

const OfflineFallback: React.FC<OfflineFallbackProps> = ({ 
  title = "You're Offline", 
  message = "This content requires an internet connection to load latest data.",
  onRetry,
  showQueueStatus = false
}) => {
  const { isOffline } = usePWA();
  const { theme } = useTheme();

  const themeClasses = theme === 'dark' ? 'bg-[#191919] text-white border-white/10' : 'bg-white text-gray-900 border-gray-200';

  if (!isOffline) return null;

  return (
    <div className={`w-full max-w-2xl mx-auto my-12 p-10 rounded-3xl border ${themeClasses} shadow-2xl flex flex-col items-center justify-center text-center animate-fade-in`}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
        <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-red-500/30 relative z-10">
          <WifiOff size={40} className="text-red-500" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-lg opacity-70 max-w-md mx-auto mb-8">{message}</p>

      {showQueueStatus && (
        <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8 flex items-center justify-center gap-4 text-left">
          <Smartphone className="text-blue-500" size={32} />
          <div>
            <h4 className="font-bold text-blue-500">Background Sync Active</h4>
            <p className="text-sm opacity-80 mt-1">Actions you perform will be saved locally and automatically synced when you reconnect.</p>
          </div>
        </div>
      )}

      {onRetry && (
        <button 
          onClick={() => {
            if (navigator.onLine) {
              onRetry();
            }
          }}
          className="group flex items-center gap-2 bg-[#1B42CB] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition hover:shadow-lg hover:shadow-blue-500/30"
        >
          <RefreshCw size={20} className="group-hover:animate-spin" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default OfflineFallback;
