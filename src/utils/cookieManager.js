// Cookie management utility functions

export const setCookie = (name, value, days = 365) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

export const getCookie = (name) => {
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const getCookieConsent = () => {
  const consent = localStorage.getItem('cookieConsent');
  return consent ? JSON.parse(consent) : null;
};

export const setCookieConsent = (consent) => {
  localStorage.setItem('cookieConsent', JSON.stringify(consent));
};

export const isCookieConsentGiven = () => {
  const consent = getCookieConsent();
  return consent && consent.accepted;
};

export const getCookiePreferences = () => {
  const consent = getCookieConsent();
  return consent ? consent.preferences : null;
};

// Function to check if a specific type of cookie is allowed
export const isCookieTypeAllowed = (type) => {
  const preferences = getCookiePreferences();
  if (!preferences) return false;
  
  // Essential cookies are always allowed
  if (type === 'essential') return true;
  
  return preferences[type] || false;
};

// Function to initialize cookies based on user preferences
export const initializeCookies = () => {
  const preferences = getCookiePreferences();
  if (!preferences) return;

  // Set essential cookies
  setCookie('essential_cookie', 'true', 365);

  // Set analytics cookies if allowed
  if (preferences.analytics) {
    setCookie('analytics_cookie', 'true', 365);
    // Initialize analytics here
  }

  // Set marketing cookies if allowed
  if (preferences.marketing) {
    setCookie('marketing_cookie', 'true', 365);
    // Initialize marketing cookies here
  }

  // Set functional cookies if allowed
  if (preferences.functional) {
    setCookie('functional_cookie', 'true', 365);
    // Initialize functional cookies here
  }
}; 