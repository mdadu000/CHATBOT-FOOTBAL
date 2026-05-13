export const LANGUAGES = [
  { code: 'auto', label: 'Auto-detect' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'ar', label: 'Arabic' },
];

/** BCP-47 for SpeechSynthesis */
export function speechLangFor(code) {
  const map = {
    en: 'en-US',
    hi: 'hi-IN',
    kn: 'kn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    es: 'es-ES',
    fr: 'fr-FR',
    ar: 'ar-SA',
    auto: 'en-US',
  };
  return map[code] || 'en-US';
}
