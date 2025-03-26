import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookiePreferences } from '../hooks/useCookiePreferences';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const { preferences, updatePreferences, acceptAll, declineAll } = useCookiePreferences();

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setShowConsent(false);
  };

  const handleAcceptSelected = () => {
    updatePreferences(preferences);
    setShowConsent(false);
  };

  const handleDecline = () => {
    declineAll();
    setShowConsent(false);
  };

  const togglePreference = (type) => {
    if (type === 'essential') return; // Essential cookies can't be disabled
    updatePreferences({
      ...preferences,
      [type]: !preferences[type]
    });
  };

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-50"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Cookie Preferences</h3>
                <p className="text-sm text-gray-600">
                  We use cookies to enhance your browsing experience and analyze site traffic.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 bg-[rgb(130,88,18)] text-white rounded-md hover:bg-[rgb(110,68,0)] transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={handleDecline}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Essential Cookies</h4>
                  <p className="text-sm text-gray-600">Required for the website to function</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.essential}
                  disabled
                  className="h-4 w-4 text-[rgb(130,88,18)] rounded border-gray-300"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">Help us understand how visitors interact with our site</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                  className="h-4 w-4 text-[rgb(130,88,18)] rounded border-gray-300"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600">Used to deliver personalized advertisements</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => togglePreference('marketing')}
                  className="h-4 w-4 text-[rgb(130,88,18)] rounded border-gray-300"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Functional Cookies</h4>
                  <p className="text-sm text-gray-600">Enable enhanced functionality and personalization</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={() => togglePreference('functional')}
                  className="h-4 w-4 text-[rgb(130,88,18)] rounded border-gray-300"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAcceptSelected}
                className="px-4 py-2 bg-[rgb(130,88,18)] text-white rounded-md hover:bg-[rgb(110,68,0)] transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent; 