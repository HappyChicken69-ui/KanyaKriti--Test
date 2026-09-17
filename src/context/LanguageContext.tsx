import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  getSpeechLanguageCode,
  ARTISAN_VOICE_QUOTES,
  ArtisanVoiceQuote,
  getVoicePromptsForLanguage,
  VoiceSamplePrompt,
} from '../data/languages.ts';
import { translate } from '../data/translations.ts';

const SESSION_LANG_KEY = 'kanyakriti_session_language';

export interface LanguageContextType {
  selectedLanguageCode: string;
  selectedLanguage: SupportedLanguage;
  setLanguageCode: (code: string) => void;
  resetLanguage: () => void;
  supportedLanguages: SupportedLanguage[];
  t: (key: string, fallback?: string) => string;
  speechLocale: string;
  voiceQuote: ArtisanVoiceQuote;
  samplePrompts: VoiceSamplePrompt[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always default to English for new sessions.
  // Persist within the current session (sessionStorage) so refresh/navigation keeps language.
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>(() => {
    try {
      // Clean up any stale localStorage from previous versions to ensure shared devices start clean
      localStorage.removeItem('kanyakriti_selected_language');

      const sessionSaved = sessionStorage.getItem(SESSION_LANG_KEY);
      if (sessionSaved && SUPPORTED_LANGUAGES.some((l) => l.code === sessionSaved)) {
        return sessionSaved;
      }
    } catch {
      // ignore storage access restrictions
    }
    return 'en'; // Strict Default: English
  });

  const setLanguageCode = useCallback((code: string) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
      setSelectedLanguageCode(code);
      try {
        sessionStorage.setItem(SESSION_LANG_KEY, code);
      } catch {
        // ignore
      }
    }
  }, []);

  const resetLanguage = useCallback(() => {
    setSelectedLanguageCode('en');
    try {
      sessionStorage.removeItem(SESSION_LANG_KEY);
      localStorage.removeItem('kanyakriti_selected_language');
    } catch {
      // ignore
    }
  }, []);

  // Synchronize document HTML lang attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = selectedLanguageCode;
    }
  }, [selectedLanguageCode]);

  const selectedLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguageCode) || SUPPORTED_LANGUAGES[0];

  const speechLocale = getSpeechLanguageCode(selectedLanguageCode);

  const voiceQuote =
    ARTISAN_VOICE_QUOTES[selectedLanguageCode] || ARTISAN_VOICE_QUOTES['en'];

  const samplePrompts = getVoicePromptsForLanguage(selectedLanguageCode);

  const t = useCallback(
    (key: string, fallback?: string) => {
      return translate(selectedLanguageCode, key, fallback);
    },
    [selectedLanguageCode]
  );

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguageCode,
        selectedLanguage,
        setLanguageCode,
        resetLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
        speechLocale,
        voiceQuote,
        samplePrompts,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
