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
    <svg viewBox="0 0 200 120" className="w-full h-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
        <rect x="2" y="2" width="196" height="116" fill="#FFFFFF" rx="6" />
        <text x="10" y="16" fontFamily="sans-serif" fontSize="8" fill="#89A1B0" fontWeight="bold">Upload Image</text>
        
        {/* Upload Button */}
        <rect x="20" y="30" width="160" height="25" fill="#D6DDE4" rx="3" />
        <path d="M95 38 l-4-4m0 0L87 38m4-4v12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="110" y="44" fontFamily="sans-serif" fontSize="7" fill="white" >Upload</text>
        
        {/* Camera Button */}
        <rect x="20" y="65" width="160" height="25" fill="#D6DDE4" rx="3" />
        <path d="M88 72a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0195.07 67h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 00103.07 70H104a2 2 0 012 2v9a2 2 0 01-2 2H90a2 2 0 01-2-2V72z M99 78a3 3 0 11-6 0 3 3 0 016 0z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="110" y="79" fontFamily="sans-serif" fontSize="7" fill="white" >Camera</text>
        
        {/* Animated cursor */}
        <path d="M165 50 l -5 -5 l 0 -5 l 5 -5 l 5 5 l -5 5 v 10 z" fill="#89A1B0" style={{ animation: 'click-anim 1.5s infinite ease-in-out' }} />
        <style>{`
            @keyframes click-anim {
                0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
                50% { transform: translateY(35px) scale(0.9); opacity: 0.9; }
            }
        `}</style>
    </svg>
);


const Step2Illustration: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
        <rect x="2" y="2" width="196" height="116" fill="#FFFFFF" rx="6" />
        <clipPath id="clip-step2"><rect x="2" y="2" width="196" height="116" rx="6"/></clipPath>
        <g clipPath="url(#clip-step2)">
            {/* Left side: Image Preview */}
            <rect x="10" y="10" width="180" height="80" fill="#F7F9FB" rx="3" />
            <path d="M40 30 L 60 15 L 80 40 L 90 30 L 110 50 L 20 50 Z" fill="#D6DDE4" />
            <circle cx="80" cy="20" r="5" fill="#FBBF24" />
            <text x="100" y="70" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fill="#718096">Image is ready for analysis</text>

            {/* Analyze Button */}
            <rect x="10" y="95" width="180" height="25" fill="#89A1B0" rx="3" />
            <text x="100" y="108" fontFamily="sans-serif" fontSize="8" fill="white" textAnchor="middle">Analyze Plant</text>

            {/* Loading overlay animation */}
            <g style={{ animation: 'slide-in 2s infinite ease-in-out' }}>
                <rect x="200" y="2" width="196" height="116" fill="rgba(255,255,255,0.9)" />
                <circle cx="298" cy="45" r="10" stroke="#89A1B0" strokeWidth="2" fill="none" strokeDasharray="5" style={{ animation: 'spin 1.5s linear infinite' }}/>
                <text x="298" y="70" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill="#89A1B0">Analyzing...</text>
            </g>
            <style>{`
                @keyframes slide-in { 0% { transform: translateX(0); } 40% { transform: translateX(-200px); } 100% { transform: translateX(-200px); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </g>
    </svg>
);


const Step3Illustration: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
        <rect x="2" y="2" width="196" height="116" fill="#FFFFFF" rx="6" />
        <text x="100" y="15" fontFamily="sans-serif" fontSize="10" fill="#2D3748" textAnchor="middle" fontWeight="bold">Leaf Spot</text>
        <rect x="20" y="22" width="160" height="20" fill="#F7F9FB" rx="3" />
        <path d="M25 25 L 45 25" stroke="#38BDF8" strokeWidth="3" rx="1.5" />
        <text x="160" y="32" textAnchor="end" fontFamily="sans-serif" fontSize="7" fill="#718096">Severity: 5/10</text>
        
        <rect x="20" y="50" width="160" height="25" fill="#F7F9FB" rx="3" />
        <text x="25" y="60" fontFamily="sans-serif" fontSize="6" fill="#718096">Description</text>
        <rect x="25" y="65" width="100" height="3" fill="#D6DDE4" rx="1.5" />

        <rect x="20" y="80" width="160" height="25" fill="#F7F9FB" rx="3" />
        <text x="25" y="90" fontFamily="sans-serif" fontSize="6" fill="#718096">Treatment</text>
        <rect x="25" y="95" width="120" height="3" fill="#D6DDE4" rx="1.5" />
        
        {/* Animated line drawing */}
        <style>{`@keyframes draw { to { stroke-dashoffset: 0; } }`}</style>
        <path d="M10 50 v40" stroke="#89A1B0" strokeWidth="1" strokeDasharray="5 2" style={{ animation: 'draw 1.5s ease-out forwards', strokeDasharray: 40, strokeDashoffset: 40 }}/>
    </svg>
);


const Step4Illustration: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
        <rect x="2" y="2" width="196" height="116" fill="#FFFFFF" rx="6" />
        <text x="10" y="16" fontFamily="sans-serif" fontSize="8" fill="#89A1B0" fontWeight="bold">Analysis History</text>
        
        {/* History Item 1 */}
        <g style={{ animation: 'fade-in-item 0.5s 0s forwards', opacity: 0 }}>
            <rect x="10" y="25" width="180" height="25" fill="#89A1B01A" rx="3" />
            <rect x="15" y="28" width="19" height="19" fill="#a2d2a2" rx="2" />
            <circle cx="42" cy="33" r="2" fill="#14b8a6" />
            <text x="50" y="35" fontFamily="sans-serif" fontSize="7" fill="#2D3748">Healthy Plant</text>
            <text x="50" y="44" fontFamily="sans-serif" fontSize="5" fill="#718096">Yesterday</text>
        </g>
        
        {/* History Item 2 */}
        <g style={{ animation: 'fade-in-item 0.5s 0.2s forwards', opacity: 0 }}>
            <rect x="10" y="55" width="180" height="25" fill="#F7F9FB" rx="3" />
            <rect x="15" y="58" width="19" height="19" fill="#fde047" rx="2" />
            <circle cx="42" cy="63" r="2" fill="#38bdf8" />
            <text x="50" y="65" fontFamily="sans-serif" fontSize="7" fill="#2D3748">Rust Fungus</text>
            <text x="50" y="74" fontFamily="sans-serif" fontSize="5" fill="#718096">2 days ago</text>
        </g>
        
        {/* History Item 3 */}
        <g style={{ animation: 'fade-in-item 0.5s 0.4s forwards', opacity: 0 }}>
            <rect x="10" y="85" width="180" height="25" fill="#F7F9FB" rx="3" />
            <rect x="15" y="88" width="19" height="19" fill="#fca5a5" rx="2" />
            <circle cx="42" cy="93" r="2" fill="#8b5cf6" />
            <text x="50" y="95" fontFamily="sans-serif" fontSize="7" fill="#2D3748">Powdery Mildew</text>
            <text x="50" y="104" fontFamily="sans-serif" fontSize="5" fill="#718096">5 days ago</text>
        </g>
        
        <style>{`
            @keyframes fade-in-item { to { opacity: 1; transform: translateX(0); } from { opacity: 0; transform: translateX(-10px); } }
        `}</style>
    </svg>
);

const Step5Illustration: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
        {/* Header */}
        <rect x="2" y="2" width="196" height="20" fill="#FFFFFF" rx="3" />
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" transform="scale(0.5) translate(10, -5)" fill="#D6DDE4" />
        <text x="30" y="15" fontFamily="sans-serif" fontSize="6" fontWeight="bold" fill="#89A1B0">Dr Plant</text>
        <path d="M165 9a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 00165 13z" fill="#89A1B0" strokeWidth="1.5" />
        <circle cx="178" cy="12" r="8" fill="none" stroke="#89A1B0" strokeWidth="1.5" style={{ animation: 'pulse-dot 2s infinite' }}/>
        
        {/* Modal */}
        <rect x="20" y="30" width="160" height="85" fill="#FFFFFF" rx="5" stroke="#E5E7EB" />
        <text x="30" y="45" fontFamily="sans-serif" fontSize="8" fill="#89A1B0" fontWeight="bold">Weather Forecast</text>
        <text x="75" y="70" textAnchor="middle" fontFamily="sans-serif" fontSize="20" fill="#2D3748" fontWeight="bold">28°</text>
        <path d="M110 55 a 10 10 0 0 1 0 20 h 20 a 10 10 0 0 1 0 -20 Z" fill="#FBBF24" />
        <circle cx="105" cy="60" r="12" fill="#FBBF24" />
        
        <rect x="30" y="85" width="40" height="20" fill="#F7F9FB" rx="2" />
        <text x="50" y="95" textAnchor="middle" fontFamily="sans-serif" fontSize="6">Mon</text>
        <rect x="80" y="85" width="40" height="20" fill="#F7F9FB" rx="2" />
        <text x="100" y="95" textAnchor="middle" fontFamily="sans-serif" fontSize="6">Tue</text>
        <rect x="130" y="85" width="40" height="20" fill="#F7F9FB" rx="2" />
        <text x="150" y="95" textAnchor="middle" fontFamily="sans-serif" fontSize="6">Wed</text>
        
        <style>{`@keyframes pulse-dot { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.3); opacity: 1; } }`}</style>
    </svg>
);


const Step6Illustration: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
        {/* Header */}
        <rect x="2" y="2" width="196" height="20" fill="#FFFFFF" rx="3" />
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" transform="scale(0.5) translate(10, -5)" fill="#D6DDE4" />
        <text x="30" y="15" fontFamily="sans-serif" fontSize="6" fontWeight="bold" fill="#89A1B0">Dr Plant</text>
        <path d="M185 18v-15m0 0c-3.125 0-5.25 2.625-5.25 5.25s2.125 5.25 5.25 5.25c3.125 0 5.25-2.625 5.25-5.25S188.125 3 185 3z M176 18h18" stroke="#89A1B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="185" cy="12" r="8" fill="none" stroke="#89A1B0" strokeWidth="1.5" style={{ animation: 'pulse-dot 2s infinite' }}/>
        
        {/* Modal */}
        <rect x="20" y="30" width="160" height="85" fill="#FFFFFF" rx="5" stroke="#E5E7EB" />
        <text x="30" y="45" fontFamily="sans-serif" fontSize="8" fill="#89A1B0" fontWeight="bold">Planting Tips</text>
        
        <rect x="30" y="55" width="140" height="22" fill="#F7F9FB" rx="3" />
        <text x="35" y="65" fontFamily="sans-serif" fontSize="6" fill="#2D3748" fontWeight="bold">Tomatoes</text>
        <rect x="35" y="69" width="80" height="2" fill="#D6DDE4" rx="1" />
        
        <rect x="30" y="82" width="140" height="22" fill="#F7F9FB" rx="3" />
        <text x="35" y="92" fontFamily="sans-serif" fontSize="6" fill="#2D3748" fontWeight="bold">Mint</text>
        <rect x="35" y="96" width="60" height="2" fill="#D6DDE4" rx="1" />
        
        <style>{`@keyframes pulse-dot { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.3); opacity: 1; } }`}</style>
    </svg>
);


const Step7Illustration: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
        {/* Header */}
        <rect x="2" y="2" width="196" height="20" fill="#FFFFFF" rx="3" />
        <text x="30" y="15" fontFamily="sans-serif" fontSize="6" fontWeight="bold" fill="#89A1B0">Dr Plant</text>
        
        {/* Theme Switch */}
        <g transform="translate(155, 6)">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" transform="scale(0.3)" fill="none" stroke="#89A1B0" strokeWidth="4" />
        </g>
        {/* Language Switch */}
        <g transform="translate(175, 6)">
            <rect x="0" y="0" width="18" height="12" rx="6" fill="#89A1B01A" />
            <circle cx="6" cy="6" r="4" fill="#89A1B0" />
            <text x="12.5" y="9" fontFamily="sans-serif" fontSize="5" fill="#718096">ع</text>
        </g>
        
        {/* Light Mode Preview */}
        <rect x="10" y="30" width="85" height="80" fill="#F7F9FB" rx="5" stroke="#E5E7EB" />
        <rect x="18" y="38" width="70" height="15" fill="#FFFFFF" rx="2" />
        <rect x="18" y="58" width="70" height="45" fill="#FFFFFF" rx="2" />
        
        {/* Dark Mode Preview */}
        <rect x="105" y="30" width="85" height="80" fill="#2D3748" rx="5" stroke="#4A5568" />
        <rect x="113" y="38" width="70" height="15" fill="#4A5568" rx="2" />
        <rect x="113" y="58" width="70" height="45" fill="#4A5568" rx="2" />
        
        {/* Animated toggle */}
        <g transform="translate(175, 6)" style={{ animation: 'toggle-anim 3s infinite ease-in-out' }}>
            <rect x="0" y="0" width="18" height="12" rx="6" fill="#89A1B01A" />
            <circle cx="12" cy="6" r="4" fill="#89A1B0" />
            <text x="4.5" y="9" fontFamily="sans-serif" fontSize="5" fill="#718096">EN</text>
        </g>
        
        <style>{`
            @keyframes toggle-anim {
                0%, 40% { transform: translate(175px, 6px); }
                60%, 100% { transform: translate(175px, 6px) translateX(-11px); }
            }
        `}</style>
    </svg>
);


const steps = [
    { titleKey: 'howToUseStep1Title', descriptionKey: 'howToUseStep1Desc', Illustration: Step1Illustration },
    { titleKey: 'howToUseStep2Title', descriptionKey: 'howToUseStep2Desc', Illustration: Step2Illustration },
    { titleKey: 'howToUseStep3Title', descriptionKey: 'howToUseStep3Desc', Illustration: Step3Illustration },
    { titleKey: 'howToUseStep4Title', descriptionKey: 'howToUseStep4Desc', Illustration: Step4Illustration },
    { titleKey: 'howToUseStep5Title', descriptionKey: 'howToUseStep5Desc', Illustration: Step5Illustration },
    { titleKey: 'howToUseStep6Title', descriptionKey: 'howToUseStep6Desc', Illustration: Step6Illustration },
    { titleKey: 'howToUseStep7Title', descriptionKey: 'howToUseStep7Desc', Illustration: Step7Illustration },
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
              <LeafIcon className="w-4 h-4 md:w-10 md:h-10 text-[var(--color-secondary)] me-2 md:me-3 flex-shrink-0" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-[var(--color-primary)] tracking-wider">{t('headerTitle')}</h1>
                <p className="text-xs md:text-sm text-gray-500 dark:text-[var(--text-muted-dark)]">{t('headerSubtitle')}</p>
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
      const isPwaStandalone = ('standalone' in window.navigator) && ((window.navigator as any).standalone === true);
      const isCapacitorNative = (window as any).Capacitor?.isNativePlatform();
      return isPwaStandalone || isCapacitorNative;
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
            setTipsError(t('weatherErrorBody'));
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