
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AnalysisResultData } from './types';
import { analyzePlantImage } from './services/geminiService';
import { ImageInput } from './components/ImageInput';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { HistorySidebar } from './components/HistorySidebar';
import { LeafIcon, DownloadIcon } from './components/icons';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { generatePdfForAnalysis } from './utils/pdfGenerator'; // NEW IMPORT

type Theme = 'light' | 'dark';

const Header: React.FC<{ 
  theme: Theme, 
  onThemeChange: (theme: Theme) => void,
}> = ({ theme, onThemeChange }) => {
    const { t } = useTranslation();
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 mb-8">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <LeafIcon className="w-8 h-8 text-green-500 dark:text-green-400 me-3" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-wider">{t('headerTitle')}</h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <LanguageSwitcher />
              <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
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
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  const [isSelectionMode, setIsSelectionMode] = useState(false); // NEW STATE
  const [selectedAnalysesIds, setSelectedAnalysesIds] = useState<Set<string>>(new Set()); // NEW STATE

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

  // This effect handles re-analyzing an existing analysis to translate it
  useEffect(() => {
    const translateAnalysisIfNeeded = async () => {
      if (!currentAnalysis || isLoading || currentAnalysis.language === i18n.language || currentImage || isSelectionMode) {
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
  }, [i18n.language, currentAnalysis, isSelectionMode]); // Added isSelectionMode dependency

  // NEW FUNCTIONS
  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => {
      if (prev) { // Exiting selection mode
        setSelectedAnalysesIds(new Set()); // Clear selection
      }
      return !prev;
    });
    setCurrentImage(null); // Clear image preview
    setCurrentAnalysis(null); // Clear current analysis display
    setError(null);
  }, []);

  const handleSelectAnalysisForAction = useCallback((id: string) => {
    setSelectedAnalysesIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleDeleteSelected = () => {
    if (selectedAnalysesIds.size === 0) {
      alert(t('noSelectedAnalysesToDelete'));
      return;
    }

    if (!window.confirm(t('confirmDeleteMessage', { count: selectedAnalysesIds.size }))) {
      return;
    }

    setAnalyses(prev => {
      const remainingAnalyses = prev.filter(a => !selectedAnalysesIds.has(a.id));
      return remainingAnalyses;
    });

    if (currentAnalysis && selectedAnalysesIds.has(currentAnalysis.id)) {
      setCurrentAnalysis(null);
    }

    setSelectedAnalysesIds(new Set());
    setIsSelectionMode(false); // Exit selection mode after deletion
  };

  const handleDownloadSelected = async () => {
    if (selectedAnalysesIds.size === 0) {
      alert(t('noSelectedAnalysesToDownload'));
      return;
    }

    setIsLoading(true); // Indicate loading while downloading multiple PDFs
    setError(null);

    try {
      for (const analysisId of selectedAnalysesIds) {
        const analysisToDownload = analyses.find(a => a.id === analysisId);
        if (analysisToDownload) {
          await generatePdfForAnalysis(analysisToDownload, theme, t, i18n);
          await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
        }
      }
      alert(t('downloadComplete'));
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during download.');
    } finally {
      setIsLoading(false);
      setSelectedAnalysesIds(new Set());
      setIsSelectionMode(false); // Exit selection mode after download
    }
  };


  const handleImageSelect = useCallback((imageData: { base64: string; mimeType: string }) => {
    setCurrentImage({ ...imageData, dataUrl: `data:${imageData.mimeType};base64,${imageData.base64}` });
    setCurrentAnalysis(null);
    setError(null);
    if (isSelectionMode) { 
      setIsSelectionMode(false);
      setSelectedAnalysesIds(new Set());
    }
  }, [isSelectionMode]);

  const handleAnalyzeClick = async () => {
    if (!currentImage || isSelectionMode) return; // Prevent analysis if in selection mode

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
      if (isSelectionMode) { 
        setIsSelectionMode(false);
        setSelectedAnalysesIds(new Set());
      }
  }, [isSelectionMode]);

  const handleSelectFromHistory = useCallback((analysis: AnalysisResultData) => {
    if (isSelectionMode) {
      handleSelectAnalysisForAction(analysis.id);
    } else {
      setCurrentAnalysis(analysis);
      setCurrentImage(null); 
      setError(null);
    }
  }, [isSelectionMode, handleSelectAnalysisForAction]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <Header theme={theme} onThemeChange={setTheme} />
      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-120px)]">
          
          <div className="lg:col-span-1 flex flex-col gap-8">
            {!isSelectionMode && (
                <ImageInput 
                  onImageSelect={handleImageSelect} 
                  onClear={handleClear}
                  onAnalyze={handleAnalyzeClick}
                  isLoading={isLoading}
                  hasImage={!!currentImage}
                />
            )}
            
            <div className="flex-grow hidden lg:flex flex-col">
                <HistorySidebar 
                    analyses={analyses} 
                    onSelect={handleSelectFromHistory} 
                    currentAnalysisId={currentAnalysis?.id || null}
                    isSelectionMode={isSelectionMode}
                    selectedAnalysesIds={selectedAnalysesIds}
                    onSelectAnalysisForAction={handleSelectAnalysisForAction}
                    onExitSelectionMode={handleToggleSelectionMode}
                />
                {analyses.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {!isSelectionMode ? (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleToggleSelectionMode}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 me-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    {t('selectAnalyses')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDeleteSelected}
                                    disabled={selectedAnalysesIds.size === 0 || isLoading}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 me-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.92a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.147-2.009-2.201a51.964 51.964 0 0 0-3.32 0c-1.1.054-2.01.927-2.01 2.201v.916m7.5 0h-7.5" />
                                    </svg>
                                    {t('deleteSelected')} ({selectedAnalysesIds.size})
                                </button>
                                <button
                                    onClick={handleDownloadSelected}
                                    disabled={selectedAnalysesIds.size === 0 || isLoading}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                                >
                                    <DownloadIcon className="w-6 h-6 me-2" />
                                    {isLoading ? t('downloading') : t('downloadSelected')} ({selectedAnalysesIds.size})
                                </button>
                                {/* Exit button is already in the header of HistorySidebar, but keeping a redundant one for consistency across UI parts */}
                                {/* This will be handled by onExitSelectionMode prop passed to HistorySidebar to manage header button */}
                                {/* <button
                                    onClick={handleToggleSelectionMode}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    {t('exitSelectionMode')}
                                </button> */}
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>

          <div className="lg:col-span-2 h-full">
            <AnalysisDisplay 
              analysis={currentAnalysis} 
              isLoading={isLoading} 
              error={error} 
              imagePreview={isSelectionMode ? null : (currentImage?.dataUrl || currentAnalysis?.imageUrl || null)}
              theme={theme}
              onDownloadSinglePdf={(analysisToDownload) => generatePdfForAnalysis(analysisToDownload, theme, t, i18n)}
              isSelectionMode={isSelectionMode} // NEW PROP
            />
          </div>
          
           <div className="lg:hidden">
              <HistorySidebar 
                    analyses={analyses} 
                    onSelect={handleSelectFromHistory} 
                    currentAnalysisId={currentAnalysis?.id || null}
                    isSelectionMode={isSelectionMode}
                    selectedAnalysesIds={selectedAnalysesIds}
                    onSelectAnalysisForAction={handleSelectAnalysisForAction}
                    onExitSelectionMode={handleToggleSelectionMode}
                />
                {analyses.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {!isSelectionMode ? (
                             <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleToggleSelectionMode}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 me-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    {t('selectAnalyses')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDeleteSelected}
                                    disabled={selectedAnalysesIds.size === 0 || isLoading}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 me-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.92a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.147-2.009-2.201a51.964 51.964 0 0 0-3.32 0c-1.1.054-2.01.927-2.01 2.201v.916m7.5 0h-7.5" />
                                    </svg>
                                    {t('deleteSelected')} ({selectedAnalysesIds.size})
                                </button>
                                <button
                                    onClick={handleDownloadSelected}
                                    disabled={selectedAnalysesIds.size === 0 || isLoading}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                                >
                                    <DownloadIcon className="w-6 h-6 me-2" />
                                    {isLoading ? t('downloading') : t('downloadSelected')} ({selectedAnalysesIds.size})
                                </button>
                                {/* <button
                                    onClick={handleToggleSelectionMode}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    {t('exitSelectionMode')}
                                </button> */}
                            </div>
                        )}
                    </div>
                )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;