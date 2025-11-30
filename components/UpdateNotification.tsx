import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const UpdateNotification: React.FC = () => {
    const { t } = useTranslation();
    const [showReload, setShowReload] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    const onSWUpdate = (registration: ServiceWorkerRegistration) => {
        setShowReload(true);
        setWaitingWorker(registration.waiting);
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Check if there is already a waiting worker
            navigator.serviceWorker.getRegistration()
                .then(registration => {
                    if (registration && registration.waiting) {
                        onSWUpdate(registration);
                    }
                })
                .catch(err => {
                    console.warn("Service Worker registration check failed (likely due to environment environment restrictions):", err);
                });

            // Listen for new updates
            navigator.serviceWorker.ready.then(registration => {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                onSWUpdate(registration);
                            }
                        });
                    }
                });
            }).catch(err => {
                 console.warn("Service Worker ready check failed:", err);
            });

            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    window.location.reload();
                    refreshing = true;
                }
            });
        }
    }, []);

    const reloadPage = () => {
        waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
        setShowReload(false);
    };

    const dismiss = () => {
        setShowReload(false);
    }

    if (!showReload) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] p-4 rounded-xl shadow-2xl border border-[var(--color-primary)] flex flex-col sm:flex-row items-center justify-between gap-4 transform transition-all duration-500 animate-[fade-in-up_0.5s_ease-out]">
            <div className="flex items-center gap-3">
                 <div className="bg-[var(--color-primary)]/10 p-2.5 rounded-full text-[var(--color-primary)] shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                 </div>
                <div className="text-sm">
                    <p className="font-bold text-gray-900 dark:text-white text-base">{t('updateAvailableTitle')}</p>
                    <p className="text-gray-600 dark:text-gray-300">{t('updateAvailableBody')}</p>
                </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
                <button 
                    onClick={dismiss}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    {t('updateDismiss')}
                </button>
                <button 
                    onClick={reloadPage}
                    className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors shadow-lg shadow-[var(--color-primary)]/30"
                >
                    {t('updateNow')}
                </button>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};