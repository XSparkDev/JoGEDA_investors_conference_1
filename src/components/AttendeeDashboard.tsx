import { useEffect, useMemo, useState } from 'react';
import { Camera, CheckCircle2, RefreshCw, Search, UserPlus, X } from 'lucide-react';
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
};

type ExportFormat = 'csv' | 'excel' | 'pdf';

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
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [pendingExportFormat, setPendingExportFormat] = useState<ExportFormat | null>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    title: string;
    body: string;
  } | null>(null);

  const [openActionForId, setOpenActionForId] = useState<string | number | null>(null);
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

  const fetchAttendees = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!supabaseFunctionsBaseUrl) {
        throw new Error('Supabase functions base URL is not configured.');
      }

      const url = new URL(`${supabaseFunctionsBaseUrl}/list-attendees`);
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
      if (!res.ok) {
        throw new Error('Failed to load attendees');
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
      setError('Unable to load attendees.');
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(id);
  }, [toast]);

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
                      openExportConfirm('csv');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-zinc-50"
                  >
                    Download CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openExportConfirm('excel');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-zinc-50"
                  >
                    Download Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openExportConfirm('pdf');
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
                      <div className="relative inline-flex justify-end">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 hover:bg-zinc-50 transition-colors"
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
                              disabled={attendee.status === 'Confirmed' || !attendee.email}
                              className={`w-full px-3 py-2 text-left text-xs font-black uppercase tracking-[0.18em] transition-colors ${
                                attendee.status === 'Confirmed' || !attendee.email
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

                                    const res = await fetch(`${supabaseFunctionsBaseUrl}/mark-email-verified`, {
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

                                    const data = await res
                                      .json()
                                      .catch(() => ({} as any));

                                    const verifySuccess = Boolean((data as any).success);

                                    if (!res.ok || !verifySuccess) {
                                      setToast({
                                        type: 'error',
                                        title: 'Verify Failed',
                                        body:
                                          (data &&
                                            (data.message as string | undefined)) ||
                                          (res.ok
                                            ? 'Delegate email could not be marked as verified.'
                                            : 'Verify request failed. Please try again.'),
                                      });
                                      return;
                                    }

                                    setToast({
                                      type: 'success',
                                      title: 'Verified',
                                      body:
                                        (data &&
                                          (data.message as string | undefined)) ||
                                        'Delegate email verification succeeded.',
                                    });

                                    await fetchAttendees();
                                  } catch (err) {
                                    console.error('Verify failed', err);
                                    setToast({
                                      type: 'error',
                                      title: 'Network Error',
                                      body: 'We could not reach the verify service. Please try again.',
                                    });
                                  }
                                })();
                              }}
                            >
                              Verify
                            </button>

                            <button
                              type="button"
                              disabled={attendee.status === 'Confirmed' || !attendee.emailVerified}
                              className={`w-full px-3 py-2 text-left text-xs font-black uppercase tracking-[0.18em] transition-colors border-t ${
                                attendee.status === 'Confirmed' || !attendee.emailVerified
                                  ? 'text-zinc-400 cursor-default bg-zinc-50 border-zinc-100'
                                  : 'text-jogeda-dark hover:bg-jogeda-green/10 bg-white border-zinc-100'
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

                                    if (!attendee.xsUserId) {
                                      setToast({
                                        type: 'error',
                                        title: 'Missing Delegate ID',
                                        body: 'This delegate does not have a valid XS userId in Supabase.',
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
                                      title: 'Checked In',
                                      body:
                                        (data && (data.message as string | undefined)) ||
                                        'This delegate has been checked in successfully.',
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
                              {attendee.status === 'Confirmed'
                                ? 'Checked In'
                                : !attendee.emailVerified
                                  ? 'Verify First'
                                : 'Check In'}
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
                  const cleaned = value.trim();
                  setLastScanValue(cleaned);
                  setScanError(null);
                  setScanMessage(null);
                  setHasOpenedUrlForScan(true);

                  // Extract uid from scanned URL and call Supabase check-in Edge Function
                  (async () => {
                    try {
                      if (!supabaseFunctionsBaseUrl) {
                        setScanError('Supabase functions URL is not configured.');
                        setScanMessage(null);
                        return;
                      }

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
                          setScanError('No delegate found for this QR code.');
                          setScanMessage(null);
                          setScannerOpen(false);
                          setToast({
                            type: 'error',
                            title: 'Not Registered',
                            body: 'We could not find a delegate linked to this QR code.',
                          });
                        } else if (reason === 'not_allowed') {
                          setScanError('Delegate found but not allowed for this conference.');
                          setScanMessage(null);
                          setScannerOpen(false);
                          setToast({
                            type: 'error',
                            title: 'Not Allowed',
                            body: 'This delegate is not allowed for this conference.',
                          });
                        } else {
                          setScanError('Unable to verify delegate status.');
                          setScanMessage(null);
                          setScannerOpen(false);
                          setToast({
                            type: 'error',
                            title: 'Check-in Error',
                            body: 'There was an unexpected response while checking this QR code.',
                          });
                        }
                        setScanMessage(null);
                        return;
                      }

                      // Success: delegate checked in
                      setScanMessage(null);
                      setScanError(null);
                      setScannerOpen(false);
                      setToast({
                        type: 'success',
                        title: 'Checked In',
                        body: 'This delegate has been checked in successfully.',
                      });

                      // Refresh attendees to reflect updated check-in state
                      fetchAttendees();
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
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 transition-colors"
                  disabled={exporting}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => void runCentralExporter()}
                  className="inline-flex items-center justify-center rounded-xl bg-jogeda-dark px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-jogeda-green hover:text-jogeda-dark transition-colors disabled:opacity-50"
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

