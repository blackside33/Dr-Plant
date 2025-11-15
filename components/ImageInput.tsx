import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CameraIcon, UploadIcon, FocusIcon, SunIcon, CheckCircleIcon, BackgroundIcon } from './icons';

interface ImageInputProps {
  onImageSelect: (imageData: { base64: string; mimeType: string }) => void;
  onClear: () => void;
  onAnalyze: () => void;
  isLoading: boolean;
  hasImage: boolean;
}

const CameraModal: React.FC<{ onClose: () => void; onCapture: (dataUrl: string) => void }> = ({ onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const { t } = useTranslation();

    React.useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access the camera. Please ensure permissions are granted.");
                onClose();
            }
        };
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            onCapture(canvas.toDataURL('image/jpeg'));
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] rounded-lg p-4 max-w-3xl w-full">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-md mb-4"></video>
                <div className="flex justify-between">
                    <button onClick={onClose} className="px-4 py-2 bg-stone-500 text-white rounded-md hover:bg-stone-600 transition-colors">{t('cancel')}</button>
                    <button onClick={handleCapture} className="px-4 py-2 bg-[var(--color-secondary)] text-white rounded-md hover:bg-[var(--color-secondary-hover)] transition-colors">{t('snapPhoto')}</button>
                </div>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
        </div>
    );
};

export const ImageInput: React.FC<ImageInputProps> = ({ onImageSelect, onClear, onAnalyze, isLoading, hasImage }) => {
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        if (base64) {
            onImageSelect({ base64, mimeType: file.type });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (dataUrl: string) => {
    const base64 = dataUrl.split(',')[1];
    if(base64){
        onImageSelect({ base64, mimeType: 'image/jpeg' });
    }
  };

  return (
    <div className="bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] p-6 rounded-xl shadow-lg border border-black/5 dark:border-white/5 h-full flex flex-col justify-between">
        <div>
            <h2 className="text-xl font-bold mb-4 text-[var(--color-primary)]">{t('uploadTitle')}</h2>
            <p className="text-gray-600 dark:text-[var(--text-muted-dark)] mb-4">{t('uploadInstructions')}</p>
            
            <div className="mb-6 p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">{t('photoTipsTitle')}</h3>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <li className="flex items-center">
                        <FocusIcon className="w-4 h-4 me-2 text-[var(--color-primary)] flex-shrink-0" />
                        <span>{t('tipFocus')}</span>
                    </li>
                    <li className="flex items-center">
                        <SunIcon className="w-4 h-4 me-2 text-[var(--color-primary)] flex-shrink-0" />
                        <span>{t('tipLight')}</span>
                    </li>
                    <li className="flex items-center">
                        <CheckCircleIcon className="w-4 h-4 me-2 text-[var(--color-primary)] flex-shrink-0" />
                        <span>{t('tipClarity')}</span>
                    </li>
                    <li className="flex items-center">
                        <BackgroundIcon className="w-4 h-4 me-2 text-[var(--color-primary)] flex-shrink-0" />
                        <span>{t('tipBackground')}</span>
                    </li>
                </ul>
            </div>

            <div className="space-y-4">
                 <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center px-4 py-3 bg-[var(--color-secondary)] text-white rounded-md hover:bg-[var(--color-secondary-hover)] transition-all duration-200 transform hover:scale-105">
                    <UploadIcon className="w-6 h-6 me-2" />
                    {t('uploadButton')}
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                <button onClick={() => setShowCamera(true)} className="w-full flex items-center justify-center px-4 py-3 bg-[var(--color-secondary)] text-white rounded-md hover:bg-[var(--color-secondary-hover)] transition-all duration-200 transform hover:scale-105">
                    <CameraIcon className="w-6 h-6 me-2" />
                    {t('cameraButton')}
                </button>
            </div>
        </div>

      <div className="mt-6 space-y-3">
        <button
            onClick={onAnalyze}
            disabled={!hasImage || isLoading}
            className="w-full text-lg font-semibold px-4 py-4 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
        >
            {isLoading ? t('analyzingButton') : t('analyzeButton')}
        </button>
        {hasImage && (
            <button
                onClick={onClear}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-stone-500 text-white rounded-md hover:bg-stone-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500"
            >
                {t('clearButton')}
            </button>
        )}
      </div>

      {showCamera && <CameraModal onClose={() => setShowCamera(false)} onCapture={handleCameraCapture} />}
    </div>
  );
};