import React, { createContext, useContext, useState } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../data/languages.ts';

interface LanguageContextType {
  selectedLanguageCode: string;
  selectedLanguage: SupportedLanguage;
  setLanguageCode: (code: string) => void;
  supportedLanguages: SupportedLanguage[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('kanyakriti_selected_language');
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguageCode = (code: string) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
      setSelectedLanguageCode(code);
      try {
        localStorage.setItem('kanyakriti_selected_language', code);
      } catch {
        // ignore
      }
    }
  };

  const selectedLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguageCode) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguageCode,
        selectedLanguage,
        setLanguageCode,
        supportedLanguages: SUPPORTED_LANGUAGES,
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
