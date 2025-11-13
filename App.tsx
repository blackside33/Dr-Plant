

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AnalysisResultData, WeatherData, AgriculturalTipsData } from './types';
import { analyzePlantImage, getWeatherForecast, getAgriculturalTips, isImageOfPlant } from './services/geminiService';
import { ImageInput } from './components/ImageInput';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { HistorySidebar } from './components/HistorySidebar';
import { LeafIcon, WeatherIcon, SeedlingIcon } from './components/icons';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { WeatherModal } from './components/WeatherModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { Footer } from './components/Footer';
import { AgriculturalTipsModal } from './components/AgriculturalTipsModal';

// BeforeInstallPromptEvent is not a standard TS type, so we define it.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}


const Header: React.FC<{ 
  onWeatherClick: () => void;
  onTipsClick: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}> = ({ onWeatherClick, onTipsClick, theme, onThemeChange }) => {
    const { t } = useTranslation();
    return (
        <header className="bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] shadow-md p-4 mb-8 border-b-2 border-[var(--color-primary)]">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <LeafIcon className="w-10 h-10 text-[var(--color-secondary)] me-3 flex-shrink-0" />
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-primary)] tracking-wider">{t('headerTitle')}</h1>
                <p className="text-sm text-gray-500 dark:text-[var(--text-muted-dark)]">{t('headerSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
              <LanguageSwitcher />
              <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
              <button
                onClick={onWeatherClick}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-green-500 transition-colors"
                aria-label={t('weather')}
              >
                <WeatherIcon className="w-6 h-6" />
              </button>
               <button
                onClick={onTipsClick}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-green-500 transition-colors"
                aria-label={t('agriculturalSuggestions')}
              >
                <SeedlingIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>
    );
};


function App() {
  const { i18n, t } = useTranslation();
  const [analyses, setAnalyses] = useState<AnalysisResultData[]>([]);
  const [currentImage, setCurrentImage] = useState<{ base64: string; mimeType: string; dataUrl: string} | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResultData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessageKey, setLoadingMessageKey] = useState('analyzingMessage');
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);

  const [agriculturalTips, setAgriculturalTips] = useState<AgriculturalTipsData | null>(null);
  const [isTipsLoading, setIsTipsLoading] = useState(false);
  const [tipsError, setTipsError] = useState<string | null>(null);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as 'light' | 'dark';
      if (storedTheme) return storedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'dark'; // Default to dark as per new design
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);


  useEffect(() => {
      document.documentElement.lang = i18n.language;
      document.documentElement.dir = i18n.dir(i18n.language);
  }, [i18n, i18n.language]);

  useEffect(() => {
    try {
      const savedAnalyses = localStorage.getItem('plantAnalyses');
      if (savedAnalyses) {
        setAnalyses(JSON.parse(savedAnalyses));
      }
    } catch (e) {
      console.error("Failed to load analyses from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('plantAnalyses', JSON.stringify(analyses));
    } catch (e) {
      console.error("Failed to save analyses to localStorage", e);
    }
  }, [analyses]);
  
  const isIos = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }, []);

  const isInStandaloneMode = useCallback(() => {
      if (typeof window === 'undefined') return false;
      return ('standalone' in window.navigator) && ((window.navigator as any).standalone === true)
  }, []);


  // This effect handles the PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (!isInStandaloneMode()) {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsInstallModalOpen(true);
      }
    };

    const isIosDevice = isIos();
    const hasDismissedIosPrompt = localStorage.getItem('iosInstallDismissed');

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (isIosDevice && !isInStandaloneMode() && !hasDismissedIosPrompt) {
      setTimeout(() => {
        setIsInstallModalOpen(true);
      }, 5000); 
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isIos, isInStandaloneMode]);


  // This effect handles re-analyzing an existing analysis to translate it
  useEffect(() => {
    const translateAnalysisIfNeeded = async () => {
      if (!currentAnalysis || isLoading || currentAnalysis.language === i18n.language || currentImage) {
        return;
      }
      
      setIsLoading(true);
      setError(null);

      try {
        const match = currentAnalysis.imageUrl.match(/^data:(image\/.*?);base64,(.*)$/);
        if (!match || match.length < 3) {
          throw new Error("Could not parse image data from history for translation.");
        }
        const mimeType = match[1];
        const base64 = match[2];

        const translatedResult = await analyzePlantImage(base64, mimeType, i18n.language);
        
        const updatedAnalysis: AnalysisResultData = {
          ...currentAnalysis,
          ...translatedResult,
          language: i18n.language,
        };

        setCurrentAnalysis(updatedAnalysis);
        
        setAnalyses(prevAnalyses => 
          prevAnalyses.map(a => a.id === updatedAnalysis.id ? updatedAnalysis : a)
        );

      } catch (err: any) {
        console.error("Translation failed:", err);
        if (err.message === 'SERVICE_UNAVAILABLE') {
            setError(t('serviceUnavailableError'));
        } else {
            setError(t('translationFailedBody'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    translateAnalysisIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, currentAnalysis]);

  const handleImageSelect = useCallback((imageData: { base64: string; mimeType: string }) => {
    setCurrentImage({ ...imageData, dataUrl: `data:${imageData.mimeType};base64,${imageData.base64}` });
    setCurrentAnalysis(null);
    setError(null);
  }, []);

  const handleAnalyzeClick = async () => {
    if (!currentImage) return;

    setIsLoading(true);
    setError(null);
    setCurrentAnalysis(null);
    setLoadingMessageKey('verifyingImage');

    try {
        // Step 1: Verify if the image is a plant
        const isPlant = await isImageOfPlant(currentImage.base64, currentImage.mimeType);
        if (!isPlant) {
            // Custom error to be caught below
            throw new Error('NOT_A_PLANT');
        }

        // Step 2: Proceed with the full analysis
        setLoadingMessageKey('analyzingMessage');
        const result = await analyzePlantImage(currentImage.base64, currentImage.mimeType, i18n.language);
        const newAnalysis: AnalysisResultData = {
            id: new Date().toISOString(),
            imageUrl: currentImage.dataUrl,
            timestamp: new Date().toISOString(),
            language: i18n.language,
            ...result,
        };
        setCurrentAnalysis(newAnalysis);
        setAnalyses(prev => [newAnalysis, ...prev]);
    } catch (err: any) {
        console.error("Analysis failed:", err);
        if (err.message === 'NOT_A_PLANT') {
            setError(t('notAPlantError'));
        } else if (err.message === 'SERVICE_UNAVAILABLE') {
            setError(t('serviceUnavailableError'));
        } else {
            setError(t('analysisFailedBody'));
        }
    } finally {
        setIsLoading(false);
        setCurrentImage(null);
    }
  };
  
  const handleClear = useCallback(() => {
      setCurrentImage(null);
      setCurrentAnalysis(null);
      setError(null);
  }, []);

  const handleSelectFromHistory = useCallback((analysis: AnalysisResultData) => {
    setCurrentAnalysis(analysis);
    setCurrentImage(null); 
    setError(null);
  }, []);

  const handleDeleteSelected = useCallback((ids: string[]) => {
    setAnalyses(prev => prev.filter(a => !ids.includes(a.id)));
    if (currentAnalysis && ids.includes(currentAnalysis.id)) {
        setCurrentAnalysis(null);
    }
  }, [currentAnalysis]);
  
  const handleWeatherClick = () => {
    setIsWeatherModalOpen(true);
    setIsWeatherLoading(true);
    setWeatherError('location'); // special error state for 'getting location' message
    setWeatherData(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setWeatherError(null);
        try {
          const { latitude, longitude } = position.coords;
          const data = await getWeatherForecast({lat: latitude, lon: longitude}, i18n.language);
          setWeatherData(data);
        } catch (err: any) {
          if (err.message === 'SERVICE_UNAVAILABLE') {
            setWeatherError(t('serviceUnavailableError'));
          } else {
            setWeatherError(err.message || 'An unknown error occurred.');
          }
        } finally {
          setIsWeatherLoading(false);
        }
      },
      (error: GeolocationPositionError) => {
        console.error(`Geolocation error: Code ${error.code} - ${error.message}`);
        let errorMessage = t('weatherErrorBody');
        if (error.code === 1) { // PERMISSION_DENIED
            errorMessage = t('geolocationPermissionDenied');
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
            errorMessage = t('geolocationPositionUnavailable');
        } else if (error.code === 3) { // TIMEOUT
            errorMessage = t('geolocationTimeout');
        }
        setWeatherError(errorMessage);
        setIsWeatherLoading(false);
      },
      { timeout: 10000 }
    );
  };
  
  const handleCloseWeatherModal = () => {
      setIsWeatherModalOpen(false);
      setIsWeatherLoading(false);
      setWeatherError(null);
      setWeatherData(null);
  }

  const handleManualWeatherSearch = async (locationName: string) => {
    if (!locationName.trim()) return;
    setIsWeatherLoading(true);
    setWeatherError(null);
    setWeatherData(null);
    try {
        const data = await getWeatherForecast({ name: locationName }, i18n.language);
        setWeatherData(data);
    } catch (err: any) {
        if (err.message === 'SERVICE_UNAVAILABLE') {
            setWeatherError(t('serviceUnavailableError'));
        } else {
            setWeatherError(err.message || t('weatherErrorBody'));
        }
    } finally {
        setIsWeatherLoading(false);
    }
  };

  const handleAgriculturalTipsClick = () => {
    setIsTipsModalOpen(true);
    setIsTipsLoading(true);
    setTipsError('location');
    setAgriculturalTips(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setTipsError(null);
        try {
          const { latitude, longitude } = position.coords;
          const data = await getAgriculturalTips({ lat: latitude, lon: longitude }, i18n.language);
          setAgriculturalTips(data);
        } catch (err: any) {
          if (err.message === 'SERVICE_UNAVAILABLE') {
            setTipsError(t('serviceUnavailableError'));
          } else {
            setTipsError(err.message || 'An unknown error occurred.');
          }
        } finally {
          setIsTipsLoading(false);
        }
      },
      (error: GeolocationPositionError) => {
        console.error(`Geolocation error: Code ${error.code} - ${error.message}`);
        let errorMessage = t('weatherErrorBody');
        if (error.code === 1) { // PERMISSION_DENIED
            errorMessage = t('geolocationPermissionDenied');
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
            errorMessage = t('geolocationPositionUnavailable');
        } else if (error.code === 3) { // TIMEOUT
            errorMessage = t('geolocationTimeout');
        }
        setTipsError(errorMessage);
        setIsTipsLoading(false);
      },
      { timeout: 10000 }
    );
  };

   const handleManualTipsSearch = async (locationName: string) => {
    if (!locationName.trim()) return;
    setIsTipsLoading(true);
    setTipsError(null);
    setAgriculturalTips(null);
    try {
        const data = await getAgriculturalTips({ name: locationName }, i18n.language);
        setAgriculturalTips(data);
    } catch (err: any) {
        if (err.message === 'SERVICE_UNAVAILABLE') {
            setTipsError(t('serviceUnavailableError'));
        } else {
            setTipsError(err.message || t('weatherErrorBody'));
        }
    } finally {
        setIsTipsLoading(false);
    }
  };

  const handleCloseTipsModal = () => {
    setIsTipsModalOpen(false);
    setIsTipsLoading(false);
    setTipsError(null);
    setAgriculturalTips(null);
  };


    const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallModalOpen(false);
  };

  const handleCloseInstallModal = () => {
    if (isIos() && !isInStandaloneMode()) {
      localStorage.setItem('iosInstallDismissed', 'true');
    }
    setIsInstallModalOpen(false);
  };

  const getAppBgClass = useCallback(() => {
    if (isLoading) {
      return 'bg-app-loading';
    }
    if (currentAnalysis) {
      const level = currentAnalysis.severityLevel;
      if (level <= 3) return 'bg-app-healthy';
      if (level <= 7) return 'bg-app-medium';
      return 'bg-app-high';
    }
    return 'bg-app-default';
  }, [isLoading, currentAnalysis]);


  return (
    <div className={`min-h-screen text-[var(--text-light)] dark:text-[var(--text-dark)] app-container ${getAppBgClass()}`}>
      <Header onWeatherClick={handleWeatherClick} onTipsClick={handleAgriculturalTipsClick} theme={theme} onThemeChange={setTheme} />
      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[calc(100vh-120px)]">
          
          <div className="lg:col-span-1 flex flex-col gap-8">
            <ImageInput 
              onImageSelect={handleImageSelect} 
              onClear={handleClear}
              onAnalyze={handleAnalyzeClick}
              isLoading={isLoading}
              hasImage={!!currentImage}
            />
             <div className="hidden lg:block h-1/2">
                <HistorySidebar analyses={analyses} onSelect={handleSelectFromHistory} currentAnalysisId={currentAnalysis?.id || null} onDeleteSelected={handleDeleteSelected} />
            </div>
          </div>

          <div className="lg:col-span-2 h-full">
            <AnalysisDisplay 
              analysis={currentAnalysis} 
              isLoading={isLoading} 
              error={error} 
              imagePreview={currentImage?.dataUrl || currentAnalysis?.imageUrl || null}
              loadingMessageKey={loadingMessageKey}
            />
          </div>
          
           <div className="lg:hidden">
              <HistorySidebar analyses={analyses} onSelect={handleSelectFromHistory} currentAnalysisId={currentAnalysis?.id || null} onDeleteSelected={handleDeleteSelected} />
          </div>

        </div>
      </main>
      <Footer />
      <WeatherModal
        isOpen={isWeatherModalOpen}
        onClose={handleCloseWeatherModal}
        isLoading={isWeatherLoading}
        error={weatherError}
        data={weatherData}
        onManualSearch={handleManualWeatherSearch}
      />
      <AgriculturalTipsModal
        isOpen={isTipsModalOpen}
        onClose={handleCloseTipsModal}
        isLoading={isTipsLoading}
        error={tipsError}
        data={agriculturalTips}
        onManualSearch={handleManualTipsSearch}
      />
       <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={handleCloseInstallModal}
        onInstall={handleInstallPwa}
        isIos={isIos()}
      />
    </div>
  );
}

export default App;