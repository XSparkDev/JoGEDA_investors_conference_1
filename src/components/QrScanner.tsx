import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

type QrScannerProps = {
  onResult: (value: string) => void;
  onError?: (message: string) => void;
  scanIntervalMs?: number;
  onCheckInComplete?: (message: string) => void;
  mode?: 'default' | 'badge';
};

type ScannerStatus = 'idle' | 'starting' | 'scanning' | 'error';

export const QrScanner: React.FC<QrScannerProps> = ({
  onResult,
  onError,
  scanIntervalMs = 250,
  onCheckInComplete,
  mode = 'default',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);

  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      setStatus('starting');
      setErrorMessage(null);

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus('scanning');
        beginScanning();
      } catch (err) {
        console.error('QR scanner camera error:', err);
        const message =
          'Unable to access camera. Please check browser permissions and that a camera is available.';
        setStatus('error');
        setErrorMessage(message);
        onError?.(message);
      }
    };

    const beginScanning = () => {
      if (!canvasRef.current || !videoRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      const scanFrame = () => {
        if (!video.videoWidth || !video.videoHeight) {
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (mode === 'badge') {
          const regionSize = Math.min(canvas.width, canvas.height) * 0.6;
          const regionX = (canvas.width - regionSize) / 2;
          const regionY = (canvas.height - regionSize) / 2;
          context.drawImage(
            video,
            regionX,
            regionY,
            regionSize,
            regionSize,
            regionX,
            regionY,
            regionSize,
            regionSize
          );
        } else {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(imageData.data, imageData.width, imageData.height);

        if (result && result.data) {
          const value = result.data;
          onResult(value);

          if (onCheckInComplete) {
            const apiBase =
              typeof window !== 'undefined'
                ? window.location.origin.replace(/:\d+$/, ':4000')
                : 'http://localhost:4000';

            fetch(`${apiBase}/api/checkin`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ code: value }),
            })
              .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                  throw new Error((data as any).message || 'Check-in failed');
                }
                onCheckInComplete(
                  (data as any).message || 'QR code received successfully.'
                );
              })
              .catch((err) => {
                console.error('QR backend error:', err);
                onError?.(
                  'We could read the QR code but could not reach the check-in service. Please try again or contact support.'
                );
              });
          }
        }
      };

      scanTimerRef.current = window.setInterval(scanFrame, scanIntervalMs);
    };

    startCamera();

    return () => {
      cancelled = true;

      if (scanTimerRef.current !== null) {
        window.clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [onResult, onError, onCheckInComplete, scanIntervalMs]);

  const statusLabel =
    status === 'starting'
      ? 'Starting camera...'
      : status === 'scanning'
      ? mode === 'badge'
        ? 'Hold the badge so the QR fits inside the frame'
        : 'Point your camera at the QR code'
      : status === 'error'
      ? 'Camera unavailable'
      : 'Ready';

  return (
    <div className="w-full">
      <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-black/80 relative">
        <video
          ref={videoRef}
          className="h-full w-full object-cover opacity-80"
          playsInline
          muted
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-48 rounded-3xl border-4 border-jogeda-green/80 shadow-[0_0_40px_rgba(34,197,94,0.6)]" />
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-4 space-y-2 text-sm">
        <p className="font-bold text-zinc-800">{statusLabel}</p>
        {errorMessage && (
          <p className="text-xs font-medium text-red-500">{errorMessage}</p>
        )}
        <p className="text-xs text-zinc-500">
          If prompted, please allow camera access in your browser to scan your conference QR code.
        </p>
      </div>
    </div>
  );
};

