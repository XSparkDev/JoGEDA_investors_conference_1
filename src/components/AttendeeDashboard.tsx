<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react';
import { Camera, CheckCircle2, RefreshCw, RotateCw, Search, UserPlus, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import QRCodeSvg from 'react-qr-code';
=======
import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, CheckCircle2, RefreshCw, Search, UserPlus, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
>>>>>>> qa
import { QrScanner } from './QrScanner';
import { RegistrationForm } from '../templates/Templates';

type Attendee = {
  id: number | string;
  name: string;
  email: string;
  xsUserId?: string;
  organisation?: string;
  phone?: string;
  investmentFocus?: string;
  createdAt?: string;
  status?: 'Registered' | 'Confirmed';
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
  photoConsent?: boolean;
  headshotPath?: string | null;
  headshotMime?: string | null;
};

type ExportFormat = 'csv' | 'excel' | 'pdf';

export function AttendeeDashboard() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanToast, setScanToast] = useState<{
    tone: 'success' | 'warning' | 'error';
    title: string;
    body: string;
  } | null>(null);
  const [scanProcessing, setScanProcessing] = useState(false);
  const lastScanRef = useRef<{ value: string; at: number } | null>(null);
  const [showRegisteredModal, setShowRegisteredModal] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [pendingExportFormat, setPendingExportFormat] = useState<ExportFormat | null>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    title: string;
    body: string;
  } | null>(null);

  const [openActionForId, setOpenActionForId] = useState<string | number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState('headshot');
  const [previewAttendee, setPreviewAttendee] = useState<Attendee | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
<<<<<<< HEAD
  const [previewRotationDeg, setPreviewRotationDeg] = useState(0);
  const [previewPdfDownloading, setPreviewPdfDownloading] = useState(false);
=======
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const pdfExportRef = useRef<HTMLDivElement | null>(null);
>>>>>>> qa
  const supabaseFunctionsBaseUrl =
    (import.meta as any).env?.VITE_SUPABASE_FUNCTIONS_URL ||
    (typeof process !== 'undefined' ? (process as any).env?.VITE_SUPABASE_FUNCTIONS_URL : '') ||
    '';
  const supabaseAnonKey =
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' ? (process as any).env?.VITE_SUPABASE_ANON_KEY : '') ||
    '';

  const conferenceCode =
    (import.meta as any).env?.VITE_CONFERENCE_CODE ||
    (import.meta as any).env?.CONFERENCE_CODE ||
    (typeof process !== 'undefined' ? (process as any).env?.CONFERENCE_CODE : '');

  const formatRegisteredDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${formattedDate} · ${formattedTime}`;
  };

  const fetchAttendees = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const localBackendBaseUrl =
        typeof window !== 'undefined'
          ? `${window.location.protocol}//${window.location.hostname}:4000`
          : 'http://localhost:4000';

      const fetchLocalAttendees = async () => {
        const localUrl = new URL(`${localBackendBaseUrl}/api/attendees`);
        return await fetch(localUrl.toString());
      };

      let res: Response;
      const useSupabaseFunctions = Boolean(supabaseFunctionsBaseUrl);
      if (useSupabaseFunctions) {
        try {
          const supabaseUrl = new URL(`${supabaseFunctionsBaseUrl}/list-attendees`);
          supabaseUrl.searchParams.set('conferenceCode', conferenceCode);
          res = await fetch(supabaseUrl.toString(), {
            headers: {
              ...(supabaseAnonKey
                ? {
                    apikey: supabaseAnonKey,
                    Authorization: `Bearer ${supabaseAnonKey}`,
                  }
                : {}),
            },
          });
        } catch (supabaseErr) {
          console.warn('Supabase attendee fetch failed, falling back to local API.', supabaseErr);
          res = await fetchLocalAttendees();
        }
      } else {
        res = await fetchLocalAttendees();
      }

<<<<<<< HEAD
=======
      const normalizedBase = supabaseFunctionsBaseUrl.replace(/\/+$/, '');
      const listAttendeesEndpoint = normalizedBase.endsWith('/list-attendees')
        ? normalizedBase
        : `${normalizedBase}/list-attendees`;
      const url = new URL(listAttendeesEndpoint);
      url.searchParams.set('conferenceCode', conferenceCode);

      const res = await fetch(url.toString(), {
        headers: {
          ...(supabaseAnonKey
            ? {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
              }
            : {}),
        },
      });
>>>>>>> qa
      if (!res.ok) {
        const text = await res.text();
        let detail = `${res.status} ${res.statusText}`;
        try {
          const errBody = JSON.parse(text) as { error?: string; message?: string };
          if (errBody?.message) detail += `: ${errBody.message}`;
          else if (errBody?.error) detail += `: ${errBody.error}`;
          else if (text) detail += `: ${text.slice(0, 200)}`;
        } catch {
          if (text) detail += `: ${text.slice(0, 200)}`;
        }
        throw new Error(detail);
      }
      const data = (await res.json()) as { attendees?: Attendee[] };
      const loaded = data.attendees || [];

      setAttendees(
        loaded.map((a) => ({
          ...a,
          status: a.status ?? 'Registered',
        }))
      );
    } catch (err) {
      console.error('Failed to fetch attendees', err);
      const msg =
        err instanceof Error && err.message
          ? `Unable to load attendees. ${err.message}`
          : 'Unable to load attendees.';
      if (!silent) {
        setError(msg);
      }
      setAttendees([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!scanToast) return;
    const id = window.setTimeout(() => setScanToast(null), 3600);
    return () => window.clearTimeout(id);
  }, [scanToast]);

  useEffect(() => {
    if (!scannerOpen) {
      setScanProcessing(false);
      lastScanRef.current = null;
    }
  }, [scannerOpen]);

  const openExportConfirm = (format: ExportFormat) => {
    setPendingExportFormat(format);
    setExportOpen(false);
    setShowExportConfirm(true);
  };

  const runCentralExporter = async () => {
    if (!pendingExportFormat) return;
    if (!attendees.length) {
      setShowExportConfirm(false);
      setToast({
        type: 'error',
        title: 'No Data',
        body: 'There are no attendees to export.',
      });
      return;
    }

    try {
      setExporting(true);
      if (!supabaseFunctionsBaseUrl) {
        setToast({
          type: 'error',
          title: 'Config Error',
          body: 'Supabase functions URL is not configured.',
        });
        return;
      }

      const res = await fetch(`${supabaseFunctionsBaseUrl}/export-attendees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(supabaseAnonKey
            ? {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
              }
            : {}),
        },
        body: JSON.stringify({
          format: pendingExportFormat,
          conferenceCode,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        setToast({
          type: 'error',
          title: 'Export Failed',
          body:
            (data && (data.message as string | undefined)) ||
            'Export request failed. Please try again.',
        });
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition') || '';
      const fileNameMatch = disposition.match(/filename="([^"]+)"/i);
      const fileName =
        fileNameMatch?.[1] ||
        `attendees.${pendingExportFormat === 'excel' ? 'xlsx' : pendingExportFormat}`;
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      setToast({
        type: 'success',
        title: 'Export Complete',
        body: `Download started (${fileName}).`,
      });
    } catch (err) {
      console.error('Export failed', err);
      setToast({
        type: 'error',
        title: 'Network Error',
        body: 'Could not reach export service. Please try again.',
      });
    } finally {
      setExporting(false);
      setShowExportConfirm(false);
      setPendingExportFormat(null);
    }
  };

  const runLogout = () => {
    if (typeof window === 'undefined') return;
    if (loggingOut) return;
    setLoggingOut(true);
    window.setTimeout(() => {
      window.sessionStorage.removeItem('jogeda_admin_authed');
      window.location.href = `${window.location.pathname}${window.location.search}`;
    }, 700);
  };

  useEffect(() => {
    fetchAttendees();
  }, []);

  useEffect(() => {
    const handleOutsideActionClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-action-menu-container="true"]')) return;
      setOpenActionForId(null);
    };

    document.addEventListener('mousedown', handleOutsideActionClick);
    return () => document.removeEventListener('mousedown', handleOutsideActionClick);
  }, []);

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const filteredAttendees = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return attendees;
    return attendees.filter((a) => {
      return (
        a.name.toLowerCase().includes(term) ||
        (a.email && a.email.toLowerCase().includes(term))
      );
    });
  }, [attendees, search]);

  const confirmedCount = useMemo(
    () => attendees.filter((attendee) => attendee.status === 'Confirmed').length,
    [attendees]
  );

  const getAttendeeQrValue = (attendee: Attendee) => {
    const linkedId = attendee.xsUserId || String(attendee.id);
    return `https://joegqabiinvestment.co.za/?userId=${encodeURIComponent(linkedId)}`;
  };

<<<<<<< HEAD
  const getAttendeeStatusLabel = (attendee: Attendee) => attendee.status || 'Registered';

  const getAttendeeQrValue = (attendee: Attendee) => {
    const base =
      typeof window !== 'undefined' ? window.location.origin : 'https://joegqabiinvestment.co.za';
    const linkedId = attendee.xsUserId || String(attendee.id);
    return `${base}/?userId=${encodeURIComponent(linkedId)}`;
  };

  const blobUrlToDataUrl = async (blobUrl: string): Promise<string> => {
    const res = await fetch(blobUrl);
    const blob = await res.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to encode image as data URL'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image blob'));
      reader.readAsDataURL(blob);
    });
  };

  const downloadHeadshotA5Pdf = async () => {
    if (!previewImageUrl || !previewAttendee) return;

    setPreviewPdfDownloading(true);
    try {
      const imageDataUrl = await blobUrlToDataUrl(previewImageUrl);
      const qrDataUrl = await QRCode.toDataURL(getAttendeeQrValue(previewAttendee), {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 900,
      });

      const doc = new jsPDF({
=======
  const extractUserIdFromScan = (raw: string) => {
    const cleaned = raw.trim();
    if (!cleaned) return '';
    try {
      const looksLikeUrl = /^https?:\/\//i.test(cleaned) || /^www\./i.test(cleaned);
      if (!looksLikeUrl) return cleaned;
      const normalized = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
      const urlObj = new URL(normalized);
      return (
        (urlObj.searchParams.get('userId') ||
          urlObj.searchParams.get('uid') ||
          urlObj.searchParams.get('xsUserId') ||
          '') as string
      ).trim();
    } catch {
      return cleaned;
    }
  };

  const getBadgeFileName = (attendee: Attendee) => {
    const fullName = (attendee.name || 'Attendee').trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    const firstName = (parts[0] || 'Attendee').replace(/[^a-zA-Z0-9_-]/g, '');
    const lastName = (parts.slice(1).join('_') || 'Badge').replace(/[^a-zA-Z0-9_-]/g, '');
    return `${firstName}_${lastName}_Badge.pdf`;
  };

  const downloadHeadshotPdf = async () => {
    if (!previewAttendee || !pdfExportRef.current) return;
    setDownloadingPdf(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
      const canvas = await html2canvas(pdfExportRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
>>>>>>> qa
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });
<<<<<<< HEAD

      const pageWidth = 148;
      const pageHeight = 210;
      const margin = 10;
      const cardWidth = pageWidth - margin * 2;
      const cardHeight = pageHeight - margin * 2;
      doc.roundedRect(margin, margin, cardWidth, cardHeight, 4, 4);

      const imageSize = 46;
      const imageX = (pageWidth - imageSize) / 2;
      const imageY = 18;
      const imageFormat = imageDataUrl.includes('data:image/png') ? 'PNG' : 'JPEG';
      const normalizedRotation = ((previewRotationDeg % 360) + 360) % 360;
      doc.addImage(
        imageDataUrl,
        imageFormat,
        imageX,
        imageY,
        imageSize,
        imageSize,
        undefined,
        'MEDIUM',
        normalizedRotation
      );

      const qrSize = 30;
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = imageY + imageSize + 8;
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      const detailStartY = qrY + qrSize + 10;
      const lineGap = 9;
      const detailRows = [
        ['Name', previewAttendee.name || '—'],
        ['Email', previewAttendee.email || '—'],
        ['Organisation', previewAttendee.organisation || '—'],
        ['Phone', previewAttendee.phone || '—'],
        ['Investment Focus', previewAttendee.investmentFocus || '—'],
        ['Status', getAttendeeStatusLabel(previewAttendee)],
      ];

      detailRows.forEach((row, index) => {
        const y = detailStartY + index * lineGap;
        doc.text(`${row[0]}:`, margin + 8, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(row[1]), margin + 38, y, { maxWidth: cardWidth - 44 });
        doc.setFont('helvetica', 'bold');
      });

      doc.save(`${previewFileName || 'attendee'}-a5-card.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
      setToast({
        type: 'error',
        title: 'Download Failed',
        body: 'Could not generate the A5 attendee PDF. Please try again.',
      });
    } finally {
      setPreviewPdfDownloading(false);
    }
  };

  const openHeadshotPreview = async (attendee: Attendee) => {
    if (!canPreviewHeadshot(attendee)) {
=======
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(getBadgeFileName(previewAttendee));
    } catch (err) {
      console.error('Failed to generate attendee badge PDF', err);
>>>>>>> qa
      setToast({
        type: 'error',
        title: 'Download Failed',
        body: 'Could not generate the attendee PDF. Please try again.',
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const openHeadshotPreview = async (attendee: Attendee) => {
    if (!supabaseFunctionsBaseUrl) {
      setToast({
        type: 'error',
        title: 'Config Error',
        body: 'Supabase functions URL is not configured.',
      });
      return;
    }

    setPreviewAttendee(attendee);
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
      setPreviewImageUrl(null);
    }

    if (!attendee.photoConsent || !attendee.headshotPath) {
      setShowPreviewModal(true);
      return;
    }

    setPreviewLoading(true);
    try {
      const url = new URL(`${supabaseFunctionsBaseUrl}/preview-headshot`);
      url.searchParams.set('id', String(attendee.id));
      if (conferenceCode) {
        url.searchParams.set('conferenceCode', conferenceCode);
      }

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          ...(supabaseAnonKey
            ? {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
              }
            : {}),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        setToast({
          type: 'error',
          title: 'Preview Failed',
          body:
            (data && (data.message as string | undefined)) ||
            'Could not load this attendee headshot.',
        });
        return;
      }

      const blob = await res.blob();
      const newUrl = URL.createObjectURL(blob);
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      setPreviewImageUrl(newUrl);
      setPreviewAttendee(attendee);
      setPreviewRotationDeg(0);
      setPreviewFileName(
        `${attendee.name || 'attendee'}-headshot`
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      );
      setShowPreviewModal(true);
    } catch (err) {
      console.error('Headshot preview failed', err);
      setToast({
        type: 'error',
        title: 'Network Error',
        body: 'We could not load the headshot preview. Please try again.',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-start justify-center p-6 md:p-10 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl border border-zinc-100 p-6 md:p-10">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jogeda-green mb-2">
              Internal Tool
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-black uppercase text-jogeda-dark">
              Attendee Management
            </h1>
            <p className="text-xs text-zinc-500 mt-2 max-w-xl">
              View and search registered delegates, and use the QR scanner to process on-site
              check-ins.
            </p>
          </div>
          <button
            type="button"
            onClick={runLogout}
            disabled={loggingOut}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600 hover:border-red-200 hover:text-red-600 transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
            <button
              type="button"
              onClick={fetchAttendees}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-600 hover:border-jogeda-green hover:text-jogeda-dark transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh List
            </button>
            <button
              type="button"
              onClick={() => {
                setScanToast(null);
                setScanProcessing(false);
                setShowRegisteredModal(false);
                setScannerOpen(true);
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-jogeda-dark px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white hover:bg-jogeda-green hover:text-jogeda-dark transition-colors"
            >
              <Camera className="w-4 h-4" />
              Open Scanner
            </button>
        </div>

        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium outline-none focus:border-jogeda-green transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 justify-between md:justify-end w-full md:w-auto">
            <div className="space-y-1">
              <p className="text-[11px] text-zinc-500 font-medium">
                Showing <span className="font-bold text-jogeda-dark">{filteredAttendees.length}</span>{' '}
                of <span className="font-bold text-jogeda-dark">{attendees.length}</span> attendees
              </p>
              <p className="text-[11px] text-zinc-500 font-medium">
                Checked-in:{' '}
                <span className="font-bold text-jogeda-dark">{confirmedCount}</span> of{' '}
                <span className="font-bold text-jogeda-dark">{attendees.length}</span>
              </p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportOpen((open) => !open)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-600 hover:border-jogeda-green hover:text-jogeda-dark transition-colors"
              >
                Export
                <span className="text-xs">▾</span>
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-1 w-40 rounded-xl border border-zinc-200 bg-white shadow-lg text-xs z-10">
                  <button
                    type="button"
                    onClick={() => {
                      openExportConfirm('csv');
                    }}
                    className="w-full px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700 hover:bg-zinc-50"
                  >
                    Download CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openExportConfirm('excel');
                    }}
                    className="w-full px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700 hover:bg-zinc-50"
                  >
                    Download Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openExportConfirm('pdf');
                    }}
                    className="w-full px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700 hover:bg-zinc-50"
                  >
                    Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowRegistration(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-jogeda-green px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-jogeda-dark hover:bg-jogeda-dark hover:text-white transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Register attendee
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-zinc-100">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                <th className="px-4 py-3 min-w-[180px]">Name</th>
                <th className="px-4 py-3 min-w-[210px]">Email</th>
                <th className="px-4 py-3 hidden md:table-cell">Organisation</th>
                <th className="px-4 py-3 hidden md:table-cell min-w-[140px]">Phone</th>
                <th className="px-4 py-3 hidden md:table-cell min-w-[180px]">Investment Focus</th>
                <th className="px-4 py-3 hidden lg:table-cell">Registered</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-zinc-500">
                    {loading
                      ? 'Loading attendees...'
                      : 'No attendees found. Try adjusting your search or refreshing.'}
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((attendee) => (
                  <tr
                    key={attendee.id}
                    className="border-b border-zinc-50 hover:bg-zinc-50/70 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-zinc-900 break-words min-w-[180px]">
                      {attendee.name}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-zinc-600 break-all min-w-[210px]">{attendee.email}</td>
                    <td className="px-4 py-3 text-[11px] text-zinc-600 break-all hidden md:table-cell">
                      {attendee.organisation || '—'}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-zinc-600 whitespace-nowrap hidden md:table-cell min-w-[140px]">
                      {attendee.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-zinc-600 break-all hidden md:table-cell min-w-[180px]">
                      {attendee.investmentFocus || '—'}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-zinc-500 hidden lg:table-cell">
                      {attendee.status === 'Confirmed' ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center justify-center rounded-lg bg-jogeda-green px-3 py-1 font-black uppercase tracking-[0.12em] text-jogeda-dark">
                            Confirmed
                          </span>
                          <p className="text-[11px] text-zinc-400">{formatRegisteredDate(attendee.createdAt)}</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span>{attendee.status ?? 'Registered'}</span>
                          <p className="text-[11px] text-zinc-400">{formatRegisteredDate(attendee.createdAt)}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-right">
                      <div
                        className="relative inline-flex justify-end"
                        data-action-menu-container="true"
                      >
                        <button
                          type="button"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 hover:bg-zinc-50 transition-colors"
                          onClick={() =>
                            setOpenActionForId((prev) =>
                              prev === attendee.id ? null : attendee.id,
                            )
                          }
                          aria-label="Open actions"
                        >
                          ⋯
                        </button>

                        {openActionForId === attendee.id && (
                          <div className="absolute right-0 mt-2 w-44 rounded-xl border border-zinc-200 bg-white shadow-lg z-20 overflow-hidden">
                            <button
                              type="button"
                              disabled={!attendee.email || !attendee.xsUserId}
                              className={`w-full px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] transition-colors ${
                                !attendee.email || !attendee.xsUserId
                                  ? 'text-zinc-400 cursor-default bg-zinc-50'
                                  : 'text-jogeda-dark hover:bg-jogeda-green/10 bg-white'
                              }`}
                              onClick={() => {
                                (async () => {
                                  setOpenActionForId(null);
                                  try {
                                    if (!supabaseFunctionsBaseUrl) {
                                      setToast({
                                        type: 'error',
                                        title: 'Config Error',
                                        body: 'Supabase functions URL is not configured.',
                                      });
                                      return;
                                    }

                                    if (!attendee.email || !attendee.xsUserId) {
                                      setToast({
                                        type: 'error',
                                        title: 'Missing Delegate Data',
                                        body: 'This delegate is missing email or XS userId in Supabase.',
                                      });
                                      return;
                                    }

                                    const verifyRes = await fetch(`${supabaseFunctionsBaseUrl}/mark-email-verified`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        ...(supabaseAnonKey
                                          ? {
                                              apikey: supabaseAnonKey,
                                              Authorization: `Bearer ${supabaseAnonKey}`,
                                            }
                                          : {}),
                                      },
                                      body: JSON.stringify({
                                        email: attendee.email,
                                        conferenceCode,
                                      }),
                                    });

                                    const verifyData = await verifyRes
                                      .json()
                                      .catch(() => ({} as any));

                                    const verifySuccess = Boolean((verifyData as any).success);
                                    if (!verifyRes.ok || !verifySuccess) {
                                      setToast({
                                        type: 'error',
                                        title: 'Verify Failed',
                                        body:
                                          (verifyData &&
                                            (verifyData.message as string | undefined)) ||
                                          (verifyRes.ok
                                            ? 'Delegate email could not be marked as verified.'
                                            : 'Verify request failed. Please try again.'),
                                      });
                                      return;
                                    }

                                    const res = await fetch(
                                      `${supabaseFunctionsBaseUrl}/checkin-attendee`,
                                      {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          ...(supabaseAnonKey
                                            ? {
                                                apikey: supabaseAnonKey,
                                                Authorization: `Bearer ${supabaseAnonKey}`,
                                              }
                                            : {}),
                                        },
                                        body: JSON.stringify({
                                          uid: attendee.xsUserId,
                                          conferenceCode,
                                        }),
                                      }
                                    );

                                    const data = await res
                                      .json()
                                      .catch(() => ({} as any));

                                    if (!res.ok) {
                                      const reason = data.reason as string | undefined;
                                      const message =
                                        (data &&
                                          (data.message as string | undefined)) ||
                                        'Check-in failed. Please try again.';

                                      setToast({
                                        type: 'error',
                                        title:
                                          reason === 'not_registered'
                                            ? 'Not Registered'
                                            : reason === 'not_allowed'
                                              ? 'Not Allowed'
                                              : reason === 'email_not_verified'
                                                ? 'Email Not Verified'
                                              : 'Check-in Error',
                                        body: message,
                                      });
                                      return;
                                    }

                                    setToast({
                                      type: 'success',
                                      title: 'Verified',
                                      body:
                                        (data && (data.message as string | undefined)) ||
                                        'Delegate has been verified and checked in successfully.',
                                    });

                                    await fetchAttendees();
                                  } catch (err) {
                                    console.error('Check-in failed', err);
                                    setToast({
                                      type: 'error',
                                      title: 'Network Error',
                                      body: 'We could not reach the check-in service. Please try again.',
                                    });
                                  }
                                })();
                              }}
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              disabled={previewLoading}
                              className={`w-full px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] transition-colors border-t ${
                                previewLoading
                                  ? 'text-zinc-400 cursor-default bg-zinc-50 border-zinc-100'
                                  : 'text-jogeda-dark hover:bg-jogeda-green/10 bg-white border-zinc-100'
                              }`}
                              onClick={() => {
                                setOpenActionForId(null);
                                void openHeadshotPreview(attendee);
                              }}
                            >
                              {previewLoading ? 'Loading...' : 'Preview'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {scannerOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-zinc-100 relative">
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:text-jogeda-dark hover:border-jogeda-dark transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jogeda-green">
                  Check-in
                </p>
                <h2 className="mt-1 text-2xl font-display font-black uppercase text-jogeda-dark">
                  Scan Delegate QR
                </h2>
                <p className="mt-2 text-xs text-zinc-500">
                  Use this scanner at the registration desk or entry points to process delegate
                  arrivals.
                </p>
              </div>
              <QrScanner
                onResult={(value) => {
                  if (scanProcessing) return;
                  const cleaned = value.trim();
                  const now = Date.now();
                  if (
                    lastScanRef.current &&
                    lastScanRef.current.value === cleaned &&
                    now - lastScanRef.current.at < 3000
                  ) {
                    return;
                  }
                  lastScanRef.current = { value: cleaned, at: now };

                  // Extract uid from scanned QR and call Supabase check-in Edge Function
                  (async () => {
                    try {
                      setScanProcessing(true);
                      if (!supabaseFunctionsBaseUrl) {
                        setScanToast({
                          tone: 'error',
                          title: 'Attendee Not Found',
                          body: 'QR code is not registered',
                        });
                        return;
                      }

                      const userId = extractUserIdFromScan(cleaned);

                      if (!userId) {
                        setScanToast({
                          tone: 'error',
                          title: 'Attendee Not Found',
                          body: 'QR code is not registered',
                        });
                        return;
                      }

                      const attendeeBeforeScan = attendees.find(
                        (a) =>
                          (a.xsUserId && a.xsUserId.trim() === userId) ||
                          String(a.id).trim() === userId
                      );
                      if (attendeeBeforeScan?.status === 'Confirmed') {
                        setScanToast({
                          tone: 'warning',
                          title: attendeeBeforeScan.name || 'Attendee',
                          body: 'Already Checked In',
                        });
                        return;
                      }

                      const res = await fetch(
                        `${supabaseFunctionsBaseUrl}/checkin-attendee`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(supabaseAnonKey
                              ? {
                                  apikey: supabaseAnonKey,
                                  Authorization: `Bearer ${supabaseAnonKey}`,
                                }
                              : {}),
                          },
                          body: JSON.stringify({
                            uid: userId,
                            conferenceCode,
                          }),
                        }
                      );

                      if (!res.ok) {
                        let errBody: any = {};
                        try {
                          errBody = await res.json();
                        } catch {
                          // ignore
                        }
                        const reason = errBody.reason as string | undefined;
                        if (reason === 'not_registered' || reason === 'registration_not_found') {
                          setScanToast({
                            tone: 'error',
                            title: 'Attendee Not Found',
                            body: 'QR code is not registered',
                          });
                        } else if (reason === 'not_allowed') {
                          setScanToast({
                            tone: 'error',
                            title: attendeeBeforeScan?.name || 'Attendee Not Allowed',
                            body: 'This attendee is not allowed for this conference',
                          });
                        } else if (reason === 'email_not_verified') {
                          setScanToast({
                            tone: 'error',
                            title: attendeeBeforeScan?.name || 'Email Not Verified',
                            body: 'Delegate email is not verified yet',
                          });
                        } else {
                          setScanToast({
                            tone: 'error',
                            title: 'Attendee Not Found',
                            body: 'QR code is not registered',
                          });
                        }
                        return;
                      }

                      // Success: delegate checked in
                      const attendeeName =
                        attendeeBeforeScan?.name ||
                        attendees.find(
                          (a) =>
                            (a.xsUserId && a.xsUserId.trim() === userId) ||
                            String(a.id).trim() === userId
                        )?.name ||
                        'Attendee';
                      setScanToast({
                        tone: 'success',
                        title: attendeeName,
                        body: 'QR Code Successfully Scanned',
                      });

                      // Refresh attendees to reflect updated check-in state
                      void fetchAttendees(true);
                    } catch (err) {
                      console.error('Status check failed', err);
                      setScanToast({
                        tone: 'error',
                        title: 'Attendee Not Found',
                        body: 'QR code is not registered',
                      });
                    } finally {
                      window.setTimeout(() => setScanProcessing(false), 1200);
                    }
                  })();
                }}
                onError={(message) => {
                  setScanToast({
                    tone: 'error',
                    title: 'Camera Unavailable',
                    body:
                      message ||
                      'Unable to access camera. Please check browser permissions and that a camera is available.',
                  });
                }}
                onCheckInComplete={() => {}}
              />
              {scanToast && (
                <div
                  className={`mt-4 rounded-2xl px-4 py-3 text-white shadow-lg ${
                    scanToast.tone === 'success'
                      ? 'bg-green-600'
                      : scanToast.tone === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-red-600'
                  }`}
                >
                  <p className="text-base font-black uppercase tracking-[0.06em]">{scanToast.title}</p>
                  <p className="text-xs font-semibold mt-1">{scanToast.body}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {showRegisteredModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-zinc-100 text-center relative">
              <button
                type="button"
                onClick={() => setShowRegisteredModal(false)}
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:text-jogeda-dark hover:border-jogeda-dark transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-jogeda-green text-jogeda-dark">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-display font-black uppercase text-jogeda-dark mb-2">
                Registered
              </h2>
              <p className="text-sm text-zinc-600 mb-6">
                Your XS Card contact has been registered successfully.
              </p>
              <button
                type="button"
                onClick={() => setShowRegisteredModal(false)}
                className="inline-flex items-center justify-center rounded-xl bg-jogeda-dark px-6 sm:px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-white whitespace-nowrap hover:bg-jogeda-green hover:text-jogeda-dark transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-3xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-zinc-100 relative">
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewAttendee(null);
                  setPreviewRotationDeg(0);
                }}
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:text-jogeda-dark hover:border-jogeda-dark transition-colors bg-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mb-4 pr-10">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jogeda-green">
                  Attendee Headshot
                </p>
                <h2 className="mt-1 text-2xl font-display font-black uppercase text-jogeda-dark">
                  Preview
                </h2>
              </div>
<<<<<<< HEAD
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="relative h-56 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                    {previewImageUrl ? (
                      <img
                        src={previewImageUrl}
                        alt="Attendee headshot preview"
                        className="h-full w-full object-contain transition-transform duration-200"
                        style={{ transform: `rotate(${previewRotationDeg}deg)` }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm text-zinc-500">
                        No image available.
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setPreviewRotationDeg((prev) => prev + 90)}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 hover:text-jogeda-dark hover:border-jogeda-dark transition-colors"
                      aria-label="Rotate image"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                  </div>
                  {previewAttendee ? (
                    <div className="rounded-xl border border-zinc-200 bg-white p-3">
                      <QRCodeSvg value={getAttendeeQrValue(previewAttendee)} size={96} />
                    </div>
=======
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                <div className="flex flex-col items-center">
                  {previewImageUrl ? (
                    <img
                      src={previewImageUrl}
                      alt="Attendee headshot preview"
                      className="h-[300px] w-[200px] rounded-[12px] object-cover shadow-md"
                    />
                  ) : null}

                  {previewAttendee ? (
                    previewAttendee.xsUserId && previewAttendee.xsUserId.trim() ? (
                      <div className="mt-3 flex items-center justify-center rounded-lg bg-white p-2">
                        <QRCode value={previewAttendee.xsUserId.trim()} size={120} />
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-zinc-500">Missing XS user ID</p>
                    )
>>>>>>> qa
                  ) : null}
                </div>
              </div>
              {previewAttendee && (
                <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">
                    Attendee Details
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <p>
                      <span className="font-black text-jogeda-dark">Name:</span>{' '}
                      <span className="text-zinc-600">{previewAttendee.name || '—'}</span>
                    </p>
                    <p>
                      <span className="font-black text-jogeda-dark">Email:</span>{' '}
                      <span className="text-zinc-600 break-all">{previewAttendee.email || '—'}</span>
                    </p>
                    <p>
                      <span className="font-black text-jogeda-dark">Organisation:</span>{' '}
                      <span className="text-zinc-600 break-all">{previewAttendee.organisation || '—'}</span>
                    </p>
                    <p>
                      <span className="font-black text-jogeda-dark">Phone:</span>{' '}
                      <span className="text-zinc-600 break-all">{previewAttendee.phone || '—'}</span>
                    </p>
                    <p>
                      <span className="font-black text-jogeda-dark">Investment Focus:</span>{' '}
                      <span className="text-zinc-600 break-all">{previewAttendee.investmentFocus || '—'}</span>
                    </p>
                    <p>
                      <span className="font-black text-jogeda-dark">Status:</span>{' '}
                      <span className="text-zinc-600">{getAttendeeStatusLabel(previewAttendee)}</span>
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-4 flex justify-end">
<<<<<<< HEAD
                {previewImageUrl && previewAttendee ? (
                  <button
                    type="button"
                    onClick={() => void downloadHeadshotA5Pdf()}
                    disabled={previewPdfDownloading}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-jogeda-dark px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-white whitespace-nowrap hover:bg-jogeda-green hover:text-jogeda-dark transition-colors"
                  >
                    {previewPdfDownloading ? 'Preparing PDF...' : 'Download A5 PDF'}
=======
                {previewAttendee ? (
                  <button
                    type="button"
                    onClick={() => void downloadHeadshotPdf()}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-jogeda-dark px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-white whitespace-nowrap hover:bg-jogeda-green hover:text-jogeda-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={downloadingPdf}
                  >
                    {downloadingPdf ? 'Downloading...' : 'Download'}
>>>>>>> qa
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
        {previewAttendee ? (
          <div className="pointer-events-none fixed left-[-99999px] top-0 opacity-0">
            <div
              ref={pdfExportRef}
              style={{
                // A5 at 96 DPI (approx): 148mm x 210mm
                width: '560px',
                height: '794px',
                background: '#ffffff',
                color: '#18181b',
                fontFamily: 'Inter, Arial, sans-serif',
                boxSizing: 'border-box',
                padding: '32px 34px 30px 34px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.24em', color: '#6B7C2D' }}>
                ATTENDEE HEADSHOT
              </div>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt="Attendee headshot for PDF"
                    style={{
                      width: '200px',
                      height: '300px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      boxShadow: '0 8px 18px rgba(0,0,0,0.14)',
                    }}
                  />
                ) : null}
                <div
                  style={{
                    marginTop: previewImageUrl ? '12px' : '0px',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #e4e4e7',
                    background: '#ffffff',
                  }}
                >
                  <QRCode value={getAttendeeQrValue(previewAttendee)} size={120} />
                </div>
              </div>
              <div style={{ marginTop: '18px', borderTop: '1px solid #d4d4d8' }} />
              <div style={{ marginTop: '14px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: '#71717a' }}>
                ATTENDEE DETAILS
              </div>
              <div
                style={{
                  marginTop: '12px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  columnGap: '16px',
                  rowGap: '8px',
                  fontSize: '11px',
                  lineHeight: 1.45,
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>Name:</strong> {previewAttendee.name || '—'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Email:</strong> {previewAttendee.email || '—'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Organisation:</strong> {previewAttendee.organisation || '—'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Phone:</strong> {previewAttendee.phone || '—'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Investment Focus:</strong> {previewAttendee.investmentFocus || '—'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Status:</strong> {previewAttendee.status || 'Registered'}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {showRegistration && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-4 md:p-6 shadow-2xl border border-zinc-100 relative">
              <button
                type="button"
                onClick={() => setShowRegistration(false)}
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:text-jogeda-dark hover:border-jogeda-dark transition-colors bg-white"
              >
                ×
              </button>
              <RegistrationForm
                onBack={() => setShowRegistration(false)}
                onSuccess={() => {
                  setShowRegistration(false);
                  setToast({
                    type: 'success',
                    title: 'Registered',
                    body: 'User added successfully. Please check your email to verify your account.',
                  });
                  void fetchAttendees();
                }}
              />
            </div>
          </div>
        )}
        {showExportConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-zinc-100 text-center relative">
              <h2 className="text-xl font-display font-black uppercase text-jogeda-dark mb-3">
                Confirm Export
              </h2>
              <p className="text-sm text-zinc-600 mb-6">
                Are you sure you want to export all attendees and download the{' '}
                {pendingExportFormat?.toUpperCase()} file?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowExportConfirm(false);
                    setPendingExportFormat(null);
                  }}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-7 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 transition-colors"
                  disabled={exporting}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => void runCentralExporter()}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-jogeda-dark px-7 py-3 text-xs font-black uppercase tracking-[0.2em] text-white whitespace-nowrap hover:bg-jogeda-green hover:text-jogeda-dark transition-colors disabled:opacity-50"
                  disabled={exporting}
                >
                  {exporting ? 'Exporting...' : 'Yes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {toast && (
        <div className="fixed right-4 top-4 z-50 w-full max-w-sm md:right-6 md:top-6 md:max-w-md">
          <div className="w-full rounded-[1.75rem] bg-white shadow-2xl border border-zinc-100 relative px-6 py-6 md:px-8 md:py-7">
            <button
              type="button"
              onClick={() => setToast(null)}
              className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:text-jogeda-dark hover:border-jogeda-dark transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex flex-col items-center text-center gap-4">
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                  toast.type === 'success'
                    ? 'bg-jogeda-green text-jogeda-dark'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-display font-black uppercase tracking-wide text-jogeda-dark">
                  {toast.title}
                </h2>
                <p className="text-xs md:text-sm text-zinc-600">
                  {toast.body}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

