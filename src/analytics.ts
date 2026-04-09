type GtagCommand = (...args: unknown[]) => void;
export type AnalyticsConsentState = 'unset' | 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: GtagCommand;
  }
}

const measurementId =
  ((import.meta as any).env?.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() || '';

const analyticsEnabled =
  (((import.meta as any).env?.VITE_GA_ENABLED as string | undefined) || '').toLowerCase() ===
  'true';

const allowedHosts = (
  ((import.meta as any).env?.VITE_GA_ALLOWED_HOSTS as string | undefined) || ''
)
  .split(',')
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

let hasConfigured = false;
const consentStorageKey = 'jogeda_analytics_consent';

const hostMatches = (hostname: string, pattern: string) => {
  if (!pattern) return false;
  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(1); // ".example.com"
    return hostname.endsWith(suffix);
  }
  return hostname === pattern;
};

const isAllowedHost = (hostname: string) => {
  if (!allowedHosts.length) return true;
  return allowedHosts.some((pattern) => hostMatches(hostname, pattern));
};

export const shouldEnableGoogleAnalytics = () => {
  if (typeof window === 'undefined') return false;
  if (!import.meta.env.PROD) return false;
  if (!analyticsEnabled || !measurementId) return false;
  return isAllowedHost(window.location.hostname.toLowerCase());
};

export const shouldShowAnalyticsBanner = () => {
  if (typeof window === 'undefined') return false;
  if (!analyticsEnabled || !measurementId) return false;
  return isAllowedHost(window.location.hostname.toLowerCase());
};

export const getStoredAnalyticsConsent = (): AnalyticsConsentState => {
  if (typeof window === 'undefined') return 'unset';
  const value = window.localStorage.getItem(consentStorageKey);
  if (value === 'granted' || value === 'denied') return value;
  return 'unset';
};

export const setStoredAnalyticsConsent = (value: Exclude<AnalyticsConsentState, 'unset'>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(consentStorageKey, value);
};

export const setGoogleAnalyticsDisabled = (disabled: boolean) => {
  if (typeof window === 'undefined' || !measurementId) return;
  (window as any)[`ga-disable-${measurementId}`] = disabled;
};

export const applyGoogleAnalyticsConsent = (consent: AnalyticsConsentState) => {
  if (typeof window === 'undefined' || !measurementId) return;
  if (typeof window.gtag !== 'function') return;

  // If the user hasn't answered yet, don't send any consent updates.
  // This avoids accidentally "denying" in a way that prevents later dispatch.
  if (consent === 'unset') return;

  // GA4 Consent Mode: explicitly grant/deny analytics storage.
  // We keep ad_storage denied since we're not running ads tracking here.
  const analytics_storage = consent === 'granted' ? 'granted' : 'denied';
  window.gtag('consent', 'update', {
    analytics_storage,
    ad_storage: 'denied',
  });
};

export const initGoogleAnalytics = () => {
  if (!shouldEnableGoogleAnalytics()) return false;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };

  if (!document.getElementById('google-gtag-script')) {
    const script = document.createElement('script');
    script.id = 'google-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }

  if (!hasConfigured) {
    applyGoogleAnalyticsConsent(getStoredAnalyticsConsent());
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
    hasConfigured = true;
  }

  return true;
};
