type GtagCommand = (...args: unknown[]) => void;
export type AnalyticsConsentState = 'unset' | 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: GtagCommand;
    google_tag_manager?: unknown;
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
let gtagLoadPromise: Promise<void> | null = null;

const shouldLogAnalyticsDebug = () => {
  if (typeof window === 'undefined') return false;
  return analyticsEnabled && isAllowedHost(window.location.hostname.toLowerCase());
};

const logGoogleAnalyticsDiagnostics = (
  stage: string,
  extra: Record<string, unknown> = {}
) => {
  if (!shouldLogAnalyticsDebug()) return;

  console.info('[GA DEBUG]', stage, {
    host: typeof window !== 'undefined' ? window.location.hostname : undefined,
    prod: import.meta.env.PROD,
    analyticsEnabled,
    measurementId,
    allowedHosts,
    storedConsent: getStoredAnalyticsConsent(),
    shouldEnable: shouldEnableGoogleAnalytics(),
    hasConfigured,
    scriptPresent: typeof document !== 'undefined'
      ? !!document.getElementById('google-gtag-script')
      : false,
    gaDisabled:
      typeof window !== 'undefined' && measurementId
        ? (window as any)[`ga-disable-${measurementId}`]
        : undefined,
    hasGoogleTagManager:
      typeof window !== 'undefined' ? typeof window.google_tag_manager !== 'undefined' : false,
    dataLayerLength: typeof window !== 'undefined' ? window.dataLayer?.length ?? 0 : 0,
    ...extra,
  });
};

const inspectGoogleAnalyticsClientId = (reason: string) => {
  if (typeof window === 'undefined' || !measurementId) return;
  if (typeof window.gtag !== 'function') {
    logGoogleAnalyticsDiagnostics('client-id-unavailable', { reason, gtagType: typeof window.gtag });
    return;
  }

  let resolved = false;
  window.gtag('get', measurementId, 'client_id', (clientId: unknown) => {
    resolved = true;
    logGoogleAnalyticsDiagnostics('client-id-callback', { reason, clientId });
  });

  window.setTimeout(() => {
    if (!resolved) {
      logGoogleAnalyticsDiagnostics('client-id-timeout', { reason });
    }
  }, 3000);
};

const ensureGoogleAnalyticsScriptLoaded = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window unavailable'));
  }

  if (typeof window.google_tag_manager !== 'undefined') {
    logGoogleAnalyticsDiagnostics('script-already-loaded');
    return Promise.resolve();
  }

  if (gtagLoadPromise) {
    return gtagLoadPromise;
  }

  gtagLoadPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      'google-gtag-script'
    ) as HTMLScriptElement | null;

    const handleLoad = () => {
      logGoogleAnalyticsDiagnostics('script-loaded');
      resolve();
    };

    const handleError = () => {
      logGoogleAnalyticsDiagnostics('script-error');
      reject(new Error('failed to load gtag script'));
    };

    if (existingScript) {
      logGoogleAnalyticsDiagnostics('script-already-present');
      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    document.head.appendChild(script);
    logGoogleAnalyticsDiagnostics('script-appended');
  });

  return gtagLoadPromise;
};

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
  logGoogleAnalyticsDiagnostics('set-disabled', { disabled });
};

export const applyGoogleAnalyticsConsent = (consent: AnalyticsConsentState) => {
  if (typeof window === 'undefined' || !measurementId) return;
  if (typeof window.gtag !== 'function') {
    logGoogleAnalyticsDiagnostics('consent-skipped-no-gtag', { consent });
    return;
  }

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
  logGoogleAnalyticsDiagnostics('consent-updated', { consent, analytics_storage });
  if (consent === 'granted') {
    inspectGoogleAnalyticsClientId('consent-updated');
  }
};

export const initGoogleAnalytics = () => {
  if (!shouldEnableGoogleAnalytics()) {
    logGoogleAnalyticsDiagnostics('init-blocked');
    return false;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      // Match Google's recommended snippet exactly: push the raw arguments
      // object so the loaded gtag runtime can process commands correctly.
      window.dataLayer.push(arguments);
    };
  logGoogleAnalyticsDiagnostics('init-start');

  void ensureGoogleAnalyticsScriptLoaded()
    .then(() => {
      applyGoogleAnalyticsConsent(getStoredAnalyticsConsent());

      if (!hasConfigured) {
        window.gtag('js', new Date());
        window.gtag('config', measurementId, { send_page_view: true });
        logGoogleAnalyticsDiagnostics('config-called-after-load');
        hasConfigured = true;
      } else {
        logGoogleAnalyticsDiagnostics('config-skipped-already-configured');
      }

      inspectGoogleAnalyticsClientId('post-load-config');
    })
    .catch((error) => {
      logGoogleAnalyticsDiagnostics('init-load-failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    });

  return true;
};
