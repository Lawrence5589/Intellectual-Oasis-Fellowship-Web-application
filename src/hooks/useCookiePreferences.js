import { useState, useEffect } from 'react';
import {
  getCookieConsent,
  setCookieConsent,
  isCookieConsentGiven,
  getCookiePreferences,
  isCookieTypeAllowed,
  initializeCookies
} from '../utils/cookieManager';

export const useCookiePreferences = () => {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent) {
      setPreferences(consent.preferences);
      setHasConsent(consent.accepted);
    }
  }, []);

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences);
    setCookieConsent({
      accepted: true,
      preferences: newPreferences,
      timestamp: new Date().toISOString()
    });
    initializeCookies();
  };

  const acceptAll = () => {
    const allPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    updatePreferences(allPreferences);
  };

  const declineAll = () => {
    const minimalPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    updatePreferences(minimalPreferences);
  };

  const isAllowed = (type) => {
    return isCookieTypeAllowed(type);
  };

  return {
    preferences,
    hasConsent,
    updatePreferences,
    acceptAll,
    declineAll,
    isAllowed
  };
}; 