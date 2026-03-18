/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JoGedaTemplate, RegistrationForm } from './templates/Templates';
import { AdminGate } from './components/AdminGate';
import { AttendeeDashboard } from './components/AttendeeDashboard';

export default function App() {
  type ViewMode = 'landing' | 'registration' | 'admin';

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

  useEffect(() => {
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
      <AnimatePresence mode="wait">
        {view === 'registration' ? (
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
            <JoGedaTemplate onRegister={handleRegister} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
