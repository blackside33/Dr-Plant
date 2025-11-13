



import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AnalysisResultData, WeatherData } from './types';
import { analyzePlantImage, getWeatherForecast } from './services/geminiService';
import { ImageInput } from './components/ImageInput';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { HistorySidebar } from './components/HistorySidebar';
import { LeafIcon, WeatherIcon } from './components/icons';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { WeatherModal } from './components/WeatherModal';
import { InstallPwaButton } from './components/InstallPwaButton';

const Header: React.FC<{ 
  onWeatherClick: () => void;
}> = ({ onWeatherClick }) => {
    const { t } = useTranslation();
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 mb-8">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <LeafIcon className="w-8 h-8 text-green-500 dark:text-green-400 me-3 flex-shrink-0" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-wider">{t('headerTitle')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('headerSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
              <InstallPwaButton />
              <LanguageSwitcher />
              <button
                onClick={onWeatherClick}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-green-500 transition-colors"
                aria-label={t('weather')}
              >
                <WeatherIcon className="w-6 h-6" />
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
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

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
        setError(err.message || 'An unknown error occurred during translation.');
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

    const performAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setCurrentAnalysis(null);

        try {
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
            setError(err.message || 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
            setCurrentImage(null);
        }
    };
    
    await performAnalysis();
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
    if (window.confirm(t('confirmDelete'))) {
        setAnalyses(prev => prev.filter(a => !ids.includes(a.id)));
        if (currentAnalysis && ids.includes(currentAnalysis.id)) {
            setCurrentAnalysis(null);
        }
    }
  }, [t, currentAnalysis]);
  
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
          const data = await getWeatherForecast(latitude, longitude, i18n.language);
          setWeatherData(data);
        } catch (err: any) {
          setWeatherError(err.message || 'An unknown error occurred.');
        } finally {
          setIsWeatherLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setWeatherError(error.message);
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


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <Header onWeatherClick={handleWeatherClick} />
      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-120px)]">
          
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
            />
          </div>
          
           <div className="lg:hidden">
              <HistorySidebar analyses={analyses} onSelect={handleSelectFromHistory} currentAnalysisId={currentAnalysis?.id || null} onDeleteSelected={handleDeleteSelected} />
          </div>

        </div>
      </main>
      <WeatherModal
        isOpen={isWeatherModalOpen}
        onClose={handleCloseWeatherModal}
        isLoading={isWeatherLoading}
        error={weatherError}
        data={weatherData}
      />
    </div>
  );
}

export default App;