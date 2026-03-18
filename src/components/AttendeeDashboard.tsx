import { useEffect, useMemo, useState } from 'react';
import { Camera, CheckCircle2, RefreshCw, Search, UserPlus, X } from 'lucide-react';
import { QrScanner } from './QrScanner';
import { RegistrationForm } from '../templates/Templates';

type Attendee = {
  id: number | string;
  name: string;
  email: string;
  organisation?: string;
  phone?: string;
  investmentFocus?: string;
  createdAt?: string;
  status?: 'Registered' | 'Confirmed';
};

const demoAttendees: Attendee[] = [
  {
    id: 'demo-1',
    name: 'Dr Vuyiwe Marambana',
    email: 'vuyiwe.marambana@example.com',
    organisation: 'JoGEDA',
    phone: '+27 11 555 0101',
    investmentFocus: 'Tourism & Property Development',
    status: 'Registered',
  },
  {
    id: 'demo-2',
    name: 'Cllr Nomvuyo Mposelwa',
    email: 'nomvuyo.mposelwa@example.com',
    organisation: 'Joe Gqabi District Municipality',
    phone: '+27 11 555 0202',
    investmentFocus: 'Agriculture & Agro-processing',
    status: 'Registered',
  },
  {
    id: 'demo-3',
    name: 'Bantu Magqashela',
    email: 'bantu.magqashela@example.com',
    organisation: 'JoGEDA Board',
    phone: '+27 11 555 0303',
    investmentFocus: 'Renewable Energy',
    status: 'Registered',
  },
  {
    id: 'demo-4',
    name: 'Thandi Mokoena',
    email: 'thandi.mokoena@example.com',
    organisation: 'Frontier Capital',
    phone: '+27 21 555 0404',
    investmentFocus: 'Industrial & Logistics',
    status: 'Registered',
  },
];

export function AttendeeDashboard() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastScanValue, setLastScanValue] = useState<string | null>(null);
  const [hasOpenedUrlForScan, setHasOpenedUrlForScan] = useState(false);
  const [showRegisteredModal, setShowRegisteredModal] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    title: string;
    body: string;
  } | null>(null);

  const statusApiBase =
    typeof window !== 'undefined'
      ? window.location.origin.replace(/:\d+$/, ':4000')
      : 'http://localhost:4000';

  const fetchAttendees = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBase =
        typeof window !== 'undefined'
          ? window.location.origin.replace(/:\d+$/, ':4000')
          : 'http://localhost:4000';
      const res = await fetch(`${apiBase}/api/attendees`);
      if (!res.ok) {
        throw new Error('Failed to load attendees');
      }
      const data = (await res.json()) as { attendees?: Attendee[] };
      const loaded = data.attendees || [];

      if (loaded.length === 0 && import.meta.env.DEV) {
        setAttendees(demoAttendees);
      } else {
        setAttendees(
          loaded.map((a) => ({
            ...a,
            status: a.status ?? 'Registered',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch attendees', err);
      setError('Unable to load attendees. Showing demo data instead.');
      if (import.meta.env.DEV) {
        setAttendees(demoAttendees);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const exportData = (format: 'csv' | 'excel' | 'pdf') => {
    const rows = filteredAttendees.length ? filteredAttendees : attendees;
    if (!rows.length) return;

    if (format === 'pdf') {
      const win = window.open('', '_blank', 'noopener,noreferrer');
      if (!win) return;
      const html = `
        <html>
          <head>
            <title>Attendees</title>
            <style>
              body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12px; padding: 16px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #e5e5e5; padding: 6px 8px; text-align: left; }
              th { background: #f4f4f5; }
            </style>
          </head>
          <body>
            <h1>Attendees</h1>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Organisation</th>
                  <th>Phone</th>
                  <th>Investment Focus</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (a) => `
                  <tr>
                    <td>${a.name}</td>
                    <td>${a.email}</td>
                    <td>${a.organisation ?? ''}</td>
                    <td>${a.phone ?? ''}</td>
                    <td>${a.investmentFocus ?? ''}</td>
                    <td>${a.status ?? 'Registered'}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
      return;
    }

    const header = [
      'Name',
      'Email',
      'Organisation',
      'Phone',
      'Investment Focus',
      'Status',
      'Registered At',
    ];

    const csvLines = [
      header.join(','),
      ...rows.map((a) =>
        [
          a.name,
          a.email,
          a.organisation ?? '',
          a.phone ?? '',
          a.investmentFocus ?? '',
          a.status ?? 'Registered',
          a.createdAt ?? '',
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ];

    const blob = new Blob([csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download =
      format === 'excel' ? 'attendees.xlsx' : 'attendees.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAttendees();
  }, []);

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

  return (
    <div className="min-h-screen bg-zinc-50 flex items-start justify-center p-6 md:p-10 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl border border-zinc-100 p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
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
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchAttendees}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-600 hover:border-jogeda-green hover:text-jogeda-dark transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh List
            </button>
            <button
              type="button"
              onClick={() => {
                setLastScanValue(null);
                setScanError(null);
                setScanMessage(null);
                setHasOpenedUrlForScan(false);
                setShowRegisteredModal(false);
                setScannerOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-jogeda-dark px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white hover:bg-jogeda-green hover:text-jogeda-dark transition-colors"
            >
              <Camera className="w-4 h-4" />
              Open Scanner
            </button>
          </div>
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
            <p className="text-[11px] text-zinc-500 font-medium">
              Showing <span className="font-bold text-jogeda-dark">{filteredAttendees.length}</span>{' '}
              of <span className="font-bold text-jogeda-dark">{attendees.length}</span> attendees
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600 hover:border-jogeda-green hover:text-jogeda-dark transition-colors"
              >
                Export
                <span className="text-xs">▾</span>
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-1 w-40 rounded-xl border border-zinc-200 bg-white shadow-lg text-xs z-10">
                  <button
                    type="button"
                    onClick={() => {
                      exportData('csv');
                      setExportOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-zinc-50"
                  >
                    Download CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportData('excel');
                      setExportOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-zinc-50"
                  >
                    Download Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportData('pdf');
                      setExportOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-zinc-50"
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
            className="inline-flex items-center gap-2 rounded-xl bg-jogeda-green px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-jogeda-dark hover:bg-jogeda-dark hover:text-white transition-colors"
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

        {(scanMessage || scanError || lastScanValue) && (
          <div className="mb-4 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-xs">
            {lastScanValue && (
              <p className="mb-1">
                <span className="font-black uppercase tracking-[0.18em] text-jogeda-dark">
                  Last Scan:
                </span>{' '}
                <span className="font-mono break-all text-[11px] text-zinc-700">
                  {lastScanValue}
                </span>
              </p>
            )}
            {scanMessage && (
              <p className="text-[11px] font-medium text-jogeda-green">{scanMessage}</p>
            )}
            {scanError && (
              <p className="text-[11px] font-medium text-red-500">{scanError}</p>
            )}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-zinc-100">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 hidden md:table-cell">Organisation</th>
                <th className="px-4 py-3 hidden md:table-cell">Phone</th>
                <th className="px-4 py-3 hidden md:table-cell">Investment Focus</th>
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
                    <td className="px-4 py-3 text-sm font-semibold text-zinc-900">
                      {attendee.name}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-zinc-600">{attendee.email}</td>
                    <td className="px-4 py-3 text-[11px] text-zinc-600 hidden md:table-cell">
                      {attendee.organisation || '—'}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-zinc-600 hidden md:table-cell">
                      {attendee.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-zinc-600 hidden md:table-cell">
                      {attendee.investmentFocus || '—'}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-zinc-500 hidden lg:table-cell">
                      {attendee.status ?? 'Registered'}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-right">
                      <button
                        type="button"
                        disabled={attendee.status === 'Confirmed'}
                        onClick={() =>
                          setAttendees((prev) =>
                            prev.map((a) =>
                              a.id === attendee.id ? { ...a, status: 'Confirmed' } : a
                            )
                          )
                        }
                        className={`inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${
                          attendee.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                            : 'bg-jogeda-dark text-white hover:bg-jogeda-green hover:text-jogeda-dark border border-jogeda-dark/40'
                        }`}
                      >
                        {attendee.status === 'Confirmed' ? 'Confirmed' : 'Confirm'}
                      </button>
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
                  const cleaned = value.trim();
                  setLastScanValue(cleaned);
                  setScanError(null);
                  setScanMessage(null);
                  setHasOpenedUrlForScan(true);

                  // Extract uid from scanned URL and call conference status API
                  (async () => {
                    try {
                      let urlText = cleaned;
                      if (!/^https?:\/\//i.test(urlText)) {
                        urlText = `https://${urlText}`;
                      }

                      const urlObj = new URL(urlText);
                      const userId = urlObj.searchParams.get('userId');

                      if (!userId) {
                        setScanError('Scanned QR does not contain a userId.');
                        return;
                      }

                      setScanMessage('Checking delegate status...');

                      const res = await fetch(
                        `${statusApiBase}/api/conference/user-status/${encodeURIComponent(
                          userId
                        )}`
                      );

                      if (!res.ok) {
                        setScanError('Unable to verify delegate status.');
                        setScanMessage(null);
                        setScannerOpen(false);
                        setToast({
                          type: 'error',
                          title: 'Not Registered',
                          body: 'We could not verify this delegate for the conference.',
                        });
                        return;
                      }

                      let data: any;
                      try {
                        data = await res.json();
                      } catch {
                        setScanError('Status service did not return valid JSON.');
                        setScanMessage(null);
                        return;
                      }
                      const success = Boolean(data.success);
                      const found = Boolean(data.found);
                      const allowed = Boolean(data.allowed);

                      if (success && found && allowed) {
                        setScanMessage(null);
                        setScanError(null);
                        setScannerOpen(false);
                        setToast({
                          type: 'success',
                          title: 'Registered',
                          body: 'This delegate is registered and allowed for this conference.',
                        });
                      } else if (success && found && !allowed) {
                        setScanError('Delegate found but not allowed for this conference.');
                        setScanMessage(null);
                        setScannerOpen(false);
                        setToast({
                          type: 'error',
                          title: 'Not Allowed',
                          body: 'This delegate is not allowed for this conference.',
                        });
                      } else if (success && !found) {
                        setScanError('No delegate found for this QR code.');
                        setScanMessage(null);
                        setScannerOpen(false);
                        setToast({
                          type: 'error',
                          title: 'Not Registered',
                          body: 'We could not find a delegate linked to this QR code.',
                        });
                      } else {
                        setScanError('Unexpected response from status service.');
                        setScanMessage(null);
                        setScannerOpen(false);
                        setToast({
                          type: 'error',
                          title: 'Check-in Error',
                          body: 'There was an unexpected response while checking this QR code.',
                        });
                      }
                    } catch (err) {
                      console.error('Status check failed', err);
                      setScanError('Failed to contact status service.');
                      setScanMessage(null);
                      setScannerOpen(false);
                      setToast({
                        type: 'error',
                        title: 'Network Error',
                        body: 'We could not reach the check-in service. Please try again.',
                      });
                    }
                  })();
                }}
                onError={(message) => {
                  setScanError(message);
                  setScanMessage(null);
                }}
                onCheckInComplete={(message) => {
                  setScanMessage(message);
                }}
              />
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
                className="inline-flex items-center justify-center rounded-xl bg-jogeda-dark px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-jogeda-green hover:text-jogeda-dark transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

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
                hideStep4
              />
            </div>
          </div>
        )}
      </div>
      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="w-full max-w-sm md:max-w-md rounded-[1.75rem] bg-white shadow-2xl border border-zinc-100 relative px-6 py-6 md:px-8 md:py-7">
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

