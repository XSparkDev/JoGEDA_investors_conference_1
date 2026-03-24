import { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';

export function RegisterQrSection() {
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
          <p className="sub-heading mb-2">Scan to Register</p>
          <h2 className="section-heading text-3xl md:text-4xl mb-4">
            Join the <span className="text-jogeda-green">Conference</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-600 font-medium mb-8">
            Scan this QR code to register
          </p>

          <div className="flex justify-center">
            <div className="bg-white p-5 rounded-3xl shadow-lg border border-zinc-100 inline-block">
              {registrationUrl && !error ? (
                <QRCode
                  ref={svgRef}
                  value={registrationUrl}
                  size={256}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
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
            </div>
          </div>

          {registrationUrl && !error && (
            <button
              type="button"
              onClick={handleDownload}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-jogeda-dark px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-jogeda-green hover:text-jogeda-dark transition-colors"
            >
              Download QR Code
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

