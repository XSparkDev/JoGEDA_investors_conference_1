type AnalyticsConsentBannerProps = {
  onAccept: () => void;
  onDecline: () => void;
};

export function AnalyticsConsentBanner({ onAccept, onDecline }: AnalyticsConsentBannerProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-zinc-200 bg-white/95 backdrop-blur-sm shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <p className="text-xs text-zinc-700 md:text-sm">
          We use analytics cookies on public pages to understand site usage and improve the event
          experience.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDecline}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 transition-colors"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-jogeda-dark px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white hover:bg-jogeda-green hover:text-jogeda-dark transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
