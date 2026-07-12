import React from 'react';
import { WifiOff, Download, RefreshCw, X } from 'lucide-react';
import { usePWA } from '../context/PWAContext';
import { useTheme } from '../context/ThemeContext';

const PWAWidgets = () => {
  const { isOffline, deferredPrompt, installApp, needRefresh, updateApp, closeUpdatePrompt } = usePWA();
  const { theme } = useTheme();
  
  const themeClasses = theme === 'dark' ? 'bg-[#191919] text-white border-white/10' : 'bg-white text-gray-900 border-gray-200';

  return (
    <>
      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[100] animate-bounce">
          <WifiOff size={24} />
          <div className="flex flex-col">
            <span className="font-bold text-sm md:text-base">You're offline</span>
            <span className="text-xs md:text-sm opacity-90">Actions will sync when connected.</span>
          </div>
        </div>
      )}

      {/* Update Prompt */}
      {needRefresh && (
        <div className={`fixed bottom-4 right-4 max-w-sm ${themeClasses} p-6 rounded-2xl shadow-2xl border z-[100] transition-all transform duration-500`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <RefreshCw className="text-[#1B42CB] animate-spin" size={20} />
              Update Available!
            </h3>
            <button onClick={closeUpdatePrompt} className="text-gray-500 hover:text-gray-700 transition">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm mb-4 opacity-80">A new version of SmartPark is available. Refresh to apply the latest features and fixes.</p>
          <div className="flex gap-3">
            <button onClick={updateApp} className="flex-1 bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] text-white py-2 rounded-xl font-bold hover:shadow-lg transition">
              Update Now
            </button>
          </div>
        </div>
      )}

      {/* Install Prompt */}
      {deferredPrompt && !needRefresh && (
        <div className={`fixed bottom-4 left-4 max-w-sm ${themeClasses} p-6 rounded-2xl shadow-2xl border z-[100] transition-all transform duration-500`}>
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-[#1B42CB] to-[#FF2F6C] p-3 rounded-xl">
              <Download className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Install SmartPark</h3>
              <p className="text-sm opacity-80 mb-3">Install our app on your device for a faster, offline-capable experience!</p>
              <button onClick={installApp} className="w-full bg-[#191919] dark:bg-white dark:text-black text-white py-2 rounded-xl font-bold hover:opacity-90 transition">
                Install App
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAWidgets;
