import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import QRCode from 'react-qr-code';

interface RegisterQrSectionProps {
  isRegistrationClosed?: boolean;
  onAttemptRegister?: () => void;
}

export function RegisterQrSection({
  isRegistrationClosed = false,
  onAttemptRegister,
}: RegisterQrSectionProps) {
  const [registrationUrl, setRegistrationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      url.searchParams.set('register', '1');
      setRegistrationUrl(url.toString());
    } catch (err) {
      console.error('Failed to generate registration URL for QR', err);
      setError('Unable to generate registration QR code right now.');
    }
  }, []);

  const handleDownload = () => {
    if (!svgRef.current || !registrationUrl) return;
    try {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgRef.current);
      const blob = new Blob([source], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'jogeda-registration-qr.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download QR code', err);
      setError('Unable to download QR code image. Please try again.');
    }
  };

  return (
    <section className="py-24 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-md mx-auto text-center">
          {isRegistrationClosed && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-600 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-red-900/15">
              <span aria-hidden="true">⚠️ </span>
              Registration Closed - Maximum Capacity Reached
            </div>
          )}
          <p className="sub-heading mb-2">Scan to Register</p>
          <h2 className="section-heading text-3xl md:text-4xl mb-4">
            Join the <span className="text-jogeda-green">Conference</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-600 font-medium mb-8">
            Scan this QR code to register
          </p>

          <div className="flex justify-center">
            <div className="relative bg-white p-5 rounded-3xl shadow-lg border border-zinc-100 inline-block overflow-hidden">
              {registrationUrl && !error ? (
                <QRCode
                  ref={svgRef}
                  value={registrationUrl}
                  size={256}
                  style={{
                    height: 'auto',
                    maxWidth: '100%',
                    width: '100%',
                    filter: isRegistrationClosed ? 'grayscale(100%) opacity(0.4)' : undefined,
                  }}
                />
              ) : error ? (
                <p className="text-xs text-red-500 font-medium max-w-xs">
                  {error}
                </p>
              ) : (
                <p className="text-xs text-zinc-500 font-medium max-w-xs">
                  Preparing QR code...
                </p>
              )}

              {isRegistrationClosed && registrationUrl && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-white">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-black/35 backdrop-blur-sm">
                    <Lock className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.18em]">
                    Registration Closed
                  </p>
                </div>
              )}
            </div>
          </div>

          {registrationUrl && !error && (
            <button
              type="button"
              onClick={isRegistrationClosed ? onAttemptRegister : handleDownload}
              aria-disabled={isRegistrationClosed}
              className={`mt-6 inline-flex items-center justify-center rounded-xl px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors ${
                isRegistrationClosed
                  ? 'bg-[#9e9e9e] cursor-not-allowed'
                  : 'bg-jogeda-dark hover:bg-jogeda-green hover:text-jogeda-dark'
              }`}
            >
              Download QR Code
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

