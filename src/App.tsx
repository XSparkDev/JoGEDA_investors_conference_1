/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JoGedaTemplate, RegistrationForm } from './templates/Templates';
import { AdminGate } from './components/AdminGate';
import { AttendeeDashboard } from './components/AttendeeDashboard';

export default function App() {
  type ViewMode = 'landing' | 'registration' | 'admin';

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
    if (installRedirectRequested) {
      // Prevent repeated redirects (React StrictMode may mount twice in dev).
      if (!redirectedRef.current) {
        redirectedRef.current = true;

        const ua = navigator.userAgent || '';
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const targetUrl = isIOS ? appleAppUrl : googlePlayUrl;

        if (targetUrl) {
          window.location.replace(targetUrl);
          return;
        }

        // If config is missing, just fall through to normal SPA view.
        console.warn('Install redirect requested but store URLs are missing.');
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
  }, [view]);

  return (
    <div className="relative">
      {installRedirectRequested ? (
        <div className="min-h-screen flex items-center justify-center bg-white text-zinc-600 text-sm font-bold">
          Redirecting to the app store...
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
    </div>
  );
}
