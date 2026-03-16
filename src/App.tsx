/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JoGedaTemplate, RegistrationForm } from './templates/Templates';

export default function App() {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = () => {
    setIsRegistering(true);
  };

  const handleBack = () => {
    setIsRegistering(false);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isRegistering ? (
          <motion.div
            key="registration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RegistrationForm onBack={handleBack} />
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
