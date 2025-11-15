import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AnalysisResultData, WeatherData, AgriculturalTipsData } from './types';
import { analyzePlantImage, getWeatherForecast, getAgriculturalTips } from './services/geminiService';
import { ImageInput } from './components/ImageInput';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { HistorySidebar } from './components/HistorySidebar';
import { LeafIcon, WeatherIcon, SeedlingIcon, QuestionMarkCircleIcon } from './components/icons';
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

// How to Use Modal and its illustrations
// This is being placed in App.tsx due to file creation constraints.
const Step1Illustration: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-auto rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
        <rect x="10" y="10" width="180" height="100" fill="var(--card-bg-light)" stroke="var(--color-secondary)" rx="5" />
        <text x="20" y="30" fontFamily="sans-serif" fontSize="8" fill="var(--color-primary)" fontWeight="bold">Upload Image</text>
        
        <rect x="20" y="45" width="160" height="25" fill="var(--color-secondary)" rx="3" />
        <text x="100" y="60" fontFamily="sans-serif" fontSize="8" fill="white" textAnchor="middle">Upload from Device</text>
        
        <rect x="20" y="80" width="160" height="25" fill="var(--color-secondary)" rx="3" />
        <text x="100" y="95" fontFamily="sans-serif" fontSize="8" fill="white" textAnchor="middle">Use Camera</text>

        <path d="M120 40 C 130 30, 150 30, 160 40 L 165 45 L 155 45 Z" fill="var(--color-primary)" />
        <circle cx="160" cy="57" r="10" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="3 2" />
    </svg>
);

const Step2Illustration: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-auto rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
         <rect x="10" y="10" width="85" height="100" fill="var(--card-bg-light)" stroke="var(--color-secondary)" rx="5" />
         <rect x="105" y="10" width="85" height="100" fill="var(--card-bg-light)" stroke="var(--color-secondary)" rx="5" />
        
        <text x="115" y="25" fontFamily="sans-serif" fontSize="8" fill="var(--color-primary)">Image Ready</text>
        <path d="M115 35 h 65 v 40 h -65 z" fill="#a2d2a2" />
        <path d="M130 40 l 10 20 l -5 -5 z" fill="green" />

        <rect x="20" y="80" width="65" height="20" fill="var(--color-primary)" rx="3"/>
        <text x="52.5" y="92" fontFamily="sans-serif" fontSize="8" fill="white" textAnchor="middle">Analyze</text>

        <path d="M90 90 L 105 90" stroke="var(--color-primary)" strokeWidth="2" markerEnd="url(#arrow)" />
        <defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-primary)" /></marker></defs>
    </svg>
);

const Step3Illustration: React.FC = () => (
     <svg viewBox="0 0 200 120" className="w-full h-auto rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
        <rect x="10" y="10" width="180" height="100" fill="var(--card-bg-light)" stroke="var(--color-secondary)" rx="5" />
        <text x="100" y="25" fontFamily="sans-serif" fontSize="10" fill="var(--color-primary)" textAnchor="middle" fontWeight="bold">Analysis Report</text>
        <rect x="20" y="35" width="160" height="10" fill="var(--color-secondary)" rx="2" />
        <rect x="20" y="50" width="120" height="8" fill="#e0e0e0" rx="2" />
        <rect x="20" y="62" width="160" height="10" fill="var(--color-secondary)" rx="2" />
        <rect x="20" y="77" width="140" height="8" fill="#e0e0e0" rx="2" />
        <rect x="20" y="90" width="160" height="10" fill="var(--color-primary)" rx="3" />
        <text x="100" y="100" fontFamily="sans-serif" fontSize="6" fill="white" textAnchor="middle">Download PDF</text>
    </svg>
);

const Step4Illustration: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-auto rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
        <rect x="10" y="10" width="85" height="100" fill="var(--card-bg-light)" stroke="var(--color-secondary)" rx="5" />
        <rect x="105" y="10" width="85" height="100" fill="var(--card-bg-light)" stroke="var(--color-secondary)" rx="5" />

        <text x="20" y="25" fontFamily="sans-serif" fontSize="8" fill="var(--color-primary)">History</text>
        <rect x="20" y="35" width="65" height="20" fill="var(--color-primary)" opacity="0.1" rx="3" />
        <rect x="25" y="40" width="10" height="10" fill="#a2d2a2" rx="2" />
        <rect x="40" y="40" width="35" height="4" fill="#ccc" rx="1" />
        <rect x="40" y="47" width="25" height="3" fill="#e0e0e0" rx="1" />
        
        <rect x="20" y="60" width="65" height="20" fill="#f0f0f0" rx="3" />
        <rect x="20" y="85" width="65" height="20" fill="#f0f0f0" rx="3" />
    </svg>
);

const Step5Illustration: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-auto rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
        <rect x="10" y="10" width="180" height="25" fill="var(--card-bg-light)" stroke="var(--color-secondary)" rx="5" />
        <text x="20" y="25" fontFamily="sans-serif" fontSize="8" fill="var(--color-primary)">Doctor Plant</text>
        
        <circle cx="130" cy="22" r="8" fill="var(--color-primary)" opacity="0.2" />
        <circle cx="150" cy="22" r="8" fill="var(--color-primary)" opacity="0.2" />
        <circle cx="170" cy="22" r="8" fill="var(--color-primary)" opacity="0.2" />
    
        <path d="M110 30 C 110 20, 130 20, 130 30 L 135 35 L 125 35 Z" fill="var(--color-primary)" />
        <circle cx="130" cy="22" r="12" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="3 2" />

        <rect x="10" y="45" width="180" height="65" fill="var(--card-bg-light)" stroke="var(--color-secondary)" rx="5" />
        <text x="100" y="75" fontFamily="sans-serif" fontSize="10" fill="var(--color-primary)" textAnchor="middle">Weather & Tips</text>
    </svg>
);

const steps = [
    { titleKey: 'howToUseStep1Title', descriptionKey: 'howToUseStep1Desc', Illustration: Step1Illustration },
    { titleKey: 'howToUseStep2Title', descriptionKey: 'howToUseStep2Desc', Illustration: Step2Illustration },
    { titleKey: 'howToUseStep3Title', descriptionKey: 'howToUseStep3Desc', Illustration: Step3Illustration },
    { titleKey: 'howToUseStep4Title', descriptionKey: 'howToUseStep4Desc', Illustration: Step4Illustration },
    { titleKey: 'howToUseStep5Title', descriptionKey: 'howToUseStep5Desc', Illustration: Step5Illustration },
];

interface HowToUseModalProps {
    isOpen: boolean;
    onClose: () => void;
}
const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const { t } = useTranslation();

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose(); // Finish
        }
    };

    const handleClose = () => {
        setCurrentStep(0); // Reset for next time
        onClose();
    };

    if (!isOpen) return null;

    const { titleKey, descriptionKey, Illustration } = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-to-use-modal-title"
        >
            <div
                className="bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] rounded-2xl shadow-2xl w-full max-w-md text-[var(--text-light)] dark:text-[var(--text-dark)] transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale border border-black/5 dark:border-white/10 flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'fade-in-scale 0.3s forwards' }}
            >
                <style>{`
                    @keyframes fade-in-scale {
                        from { transform: scale(0.95); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                `}</style>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 id="how-to-use-modal-title" className="text-2xl font-bold text-[var(--color-primary)]">{t('howToUseTitle')}</h2>
                        <button 
                            onClick={handleClose} 
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            aria-label={t('close')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <div className="mb-4">
                         <Illustration />
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">{t(titleKey)}</h3>
                        <p className="text-gray-600 dark:text-[var(--text-muted-dark)] min-h-[60px]">{t(descriptionKey)}</p>
                    </div>

                </div>

                <div className="p-6 bg-black/5 dark:bg-white/5 rounded-b-2xl mt-auto">
                    <div className="flex items-center justify-between">
                         <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            {t('skip')}
                        </button>
                        
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            {steps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                        index === currentStep ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                ></div>
                            ))}
                        </div>

                        <button onClick={handleNext} className="px-6 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
                            {isLastStep ? t('finish') : t('next')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Header: React.FC<{ 
  onWeatherClick: () => void;
  onTipsClick: () => void;
  onHowToUseClick: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}> = ({ onWeatherClick, onTipsClick, onHowToUseClick, theme, onThemeChange }) => {
    const { t } = useTranslation();
    return (
        <header className="bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] shadow-sm p-4 mb-8">
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
                onClick={onHowToUseClick}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-[var(--color-primary)] transition-colors"
                aria-label={t('howToUse')}
              >
                <QuestionMarkCircleIcon className="w-6 h-6" />
              </button>
              <button
                onClick={onWeatherClick}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-[var(--color-primary)] transition-colors"
                aria-label={t('weather')}
              >
                <WeatherIcon className="w-6 h-6" />
              </button>
               <button
                onClick={onTipsClick}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-[var(--color-primary)] transition-colors"
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
  const [isHowToUseModalOpen, setIsHowToUseModalOpen] = useState(false);

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
        
        const { isPlant, isArtificialPlant, ...analysisData } = translatedResult;

        const updatedAnalysis: AnalysisResultData = {
          ...currentAnalysis,
          ...analysisData,
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
    setLoadingMessageKey('analyzingMessage');

    try {
        // Step 1: Analyze the image (includes plant and artificial checks)
        const result = await analyzePlantImage(currentImage.base64, currentImage.mimeType, i18n.language);
        
        // Step 2: Validate the result from the single API call
        if (!result.isPlant) {
            throw new Error('NOT_A_PLANT');
        }
        if (result.isArtificialPlant) {
            throw new Error('ARTIFICIAL_PLANT');
        }

        // Step 3: Create and store the analysis if valid
        const { isPlant, isArtificialPlant, ...analysisData } = result;
        const newAnalysis: AnalysisResultData = {
            id: new Date().toISOString(),
            imageUrl: currentImage.dataUrl,
            timestamp: new Date().toISOString(),
            language: i18n.language,
            ...analysisData,
        };
        setCurrentAnalysis(newAnalysis);
        setAnalyses(prev => [newAnalysis, ...prev]);
    } catch (err: any) {
        console.error("Analysis failed:", err);
        if (err.message === 'NOT_A_PLANT') {
            setError(t('notAPlantError'));
        } else if (err.message === 'ARTIFICIAL_PLANT') {
            setError(t('artificialPlantError'));
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
      <Header onWeatherClick={handleWeatherClick} onTipsClick={handleAgriculturalTipsClick} onHowToUseClick={() => setIsHowToUseModalOpen(true)} theme={theme} onThemeChange={setTheme} />
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
       <HowToUseModal 
        isOpen={isHowToUseModalOpen}
        onClose={() => setIsHowToUseModalOpen(false)}
      />
    </div>
  );
}

export default App;