/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JoGedaTemplate, RegistrationForm } from './templates/Templates';
import { AdminGate } from './components/AdminGate';
import { AttendeeDashboard } from './components/AttendeeDashboard';
import { AnalyticsConsentBanner } from './components/AnalyticsConsentBanner';
import {
  getStoredAnalyticsConsent,
  applyGoogleAnalyticsConsent,
  initGoogleAnalytics,
  setGoogleAnalyticsDisabled,
  setStoredAnalyticsConsent,
  shouldShowAnalyticsBanner,
  type AnalyticsConsentState,
} from './analytics';

export default function App() {
  type ViewMode = 'landing' | 'registration' | 'admin';
  const REDIRECT_TIMEOUT_MS = 2000;

  const redirectedRef = useRef(false);

  const googlePlayUrl =
    (import.meta as any).env?.VITE_GOOGLE_PLAY_URL ||
    (typeof process !== 'undefined' ? (process as any).env?.VITE_GOOGLE_PLAY_URL : '');
  const appleAppUrl =
    (import.meta as any).env?.VITE_APPLE_APP_URL ||
    (typeof process !== 'undefined' ? (process as any).env?.VITE_APPLE_APP_URL : '');

  const installRedirectRequested =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('install') === '1'
      : false;

  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'landing';
    if (window.location.hash === '#admin') return 'admin';
    const params = new URLSearchParams(window.location.search);
    if (params.get('register') === '1') return 'registration';
    return 'landing';
  });
  const [analyticsConsent, setAnalyticsConsent] = useState<AnalyticsConsentState>(() =>
    getStoredAnalyticsConsent()
  );
  const [showInstallFallback, setShowInstallFallback] = useState(false);

  const handleRegister = () => {
    setView('registration');
  };

  const handleBack = () => {
    setView('landing');
  };

  const handleOpenAdmin = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = 'admin';
    } else {
      setView('admin');
    }
  };

  useEffect(() => {
    const isAdminView = view === 'admin';
    if (isAdminView) {
      setGoogleAnalyticsDisabled(true);
      return;
    }

    if (analyticsConsent === 'granted') {
      setGoogleAnalyticsDisabled(false);
      initGoogleAnalytics();
      applyGoogleAnalyticsConsent('granted');
      return;
    }

    if (analyticsConsent === 'denied') {
      applyGoogleAnalyticsConsent('denied');
    }
    setGoogleAnalyticsDisabled(true);
  }, [view, analyticsConsent]);

  useEffect(() => {
    if (installRedirectRequested) {
      // Prevent repeated redirects (React StrictMode may mount twice in dev).
      if (!redirectedRef.current) {
        redirectedRef.current = true;

        const ua = navigator.userAgent || '';
        const platform = navigator.platform || '';
        const maxTouchPoints = navigator.maxTouchPoints || 0;

        const isIOS =
          /iPad|iPhone|iPod/.test(ua) ||
          (platform === 'MacIntel' && maxTouchPoints > 1);
        const isAndroid = /Android/i.test(ua);
        const targetUrl = isIOS ? appleAppUrl : isAndroid ? googlePlayUrl : '';

        if (targetUrl) {
          window.location.replace(targetUrl);

          // Safety net: if navigation does not complete, show manual buttons.
          const timerId = window.setTimeout(() => {
            setShowInstallFallback(true);
          }, REDIRECT_TIMEOUT_MS);
          return () => window.clearTimeout(timerId);
        }

        // Unknown OS or missing store URLs: show fallback actions immediately.
        setShowInstallFallback(true);
        console.warn('Install redirect requested but no matching app store URL is configured.');
      }
    }

    const onHashChange = () => {
      if (window.location.hash === '#admin') {
        setView('admin');
      } else if (view === 'admin') {
        setView('landing');
      }
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [view, installRedirectRequested, appleAppUrl, googlePlayUrl]);

  return (
    <div className="relative">
      {installRedirectRequested ? (
        <div className="min-h-screen flex items-center justify-center bg-white px-6">
          {showInstallFallback ? (
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
              <h1 className="text-lg font-black text-jogeda-dark">Download XS Card</h1>
              <p className="mt-2 text-sm text-zinc-600">Choose your app store to continue.</p>
              {!appleAppUrl && !googlePlayUrl ? (
                <p className="mt-4 text-sm font-semibold text-red-600">
                  App store links are not configured yet. Please contact the event team.
                </p>
              ) : (
                <div className="mt-5 grid gap-3">
                  {appleAppUrl ? (
                    <a
                      href={appleAppUrl}
                      className="rounded-xl bg-black px-4 py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
                    >
                      Download on App Store
                    </a>
                  ) : null}
                  {googlePlayUrl ? (
                    <a
                      href={googlePlayUrl}
                      className="rounded-xl bg-jogeda-green px-4 py-3 text-sm font-black text-jogeda-dark transition-opacity hover:opacity-90"
                    >
                      Download on Google Play
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-bold text-zinc-600">Redirecting to the app store...</p>
          )}
        </div>
      ) : null}
      <AnimatePresence mode="wait">
        {installRedirectRequested ? null : view === 'registration' ? (
          <motion.div
            key="registration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RegistrationForm onBack={handleBack} />
          </motion.div>
        ) : view === 'admin' ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminGate>
              <AttendeeDashboard />
            </AdminGate>
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <JoGedaTemplate onRegister={handleRegister} onOpenAdmin={handleOpenAdmin} />
          </motion.div>
        )}
      </AnimatePresence>
      {view !== 'admin' && analyticsConsent === 'unset' && shouldShowAnalyticsBanner() ? (
        <AnalyticsConsentBanner
          onAccept={() => {
            setStoredAnalyticsConsent('granted');
            setAnalyticsConsent('granted');
          }}
          onDecline={() => {
            setStoredAnalyticsConsent('denied');
            setAnalyticsConsent('denied');
          }}
        />
      ) : null}
    </div>
  );
}
