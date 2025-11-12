import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// BeforeInstallPromptEvent is not a standard TS type, so we define it.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}
const isInStandaloneMode = () => ('standalone' in window.navigator) && ((window.navigator as any).standalone === true);


export const InstallPwaButton: React.FC = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosTooltip, setShowIosTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => { setDeferredPrompt(null); };

    if (!isIos()) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      if (!isIos()) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, []);

   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowIosTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tooltipRef]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isInStandaloneMode()) {
    return null; // Don't show if already installed
  }

  if (isIos()) {
    return (
      <div className="relative" ref={tooltipRef}>
        <button
          onClick={() => setShowIosTooltip(prev => !prev)}
          className="px-3 py-1 text-sm font-medium rounded-full transition-colors duration-300 bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap"
        >
          {t('installApplication')}
        </button>
        {showIosTooltip && (
          <div className="absolute bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-lg shadow-xl text-xs w-64 right-0 rtl:left-0 rtl:right-auto mt-2 z-10 border border-gray-200 dark:border-gray-600">
            <p className="font-bold mb-1">{t('iosInstallTitle')}</p>
            <p>{t('iosInstallBody')}</p>
          </div>
        )}
      </div>
    );
  }

  if (!deferredPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="px-3 py-1 text-sm font-medium rounded-full transition-colors duration-300 bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap"
    >
      {t('installApplication')}
    </button>
  );
};