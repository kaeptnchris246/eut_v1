import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'en', name: 'English', flag: '🇬🇧', rtl: false },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'es', name: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'fr', name: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', rtl: false },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', rtl: false },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', rtl: false },
  { code: 'zh', name: '中文', flag: '🇨🇳', rtl: false },
  { code: 'ja', name: '日本語', flag: '🇯🇵', rtl: false },
];

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState('de');

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('euphena_language') || 'de';
    setCurrentLang(saved);
    applyLanguage(saved);
  }, []);

  const applyLanguage = (langCode) => {
    const lang = languages.find(l => l.code === langCode);
    
    // Set document direction
    document.documentElement.dir = lang?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = langCode;
    
    // Add RTL class to body if needed
    if (lang?.rtl) {
      document.body.classList.add('rtl');
      document.body.style.direction = 'rtl';
      document.body.style.textAlign = 'right';
    } else {
      document.body.classList.remove('rtl');
      document.body.style.direction = 'ltr';
      document.body.style.textAlign = 'left';
    }
  };

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem('euphena_language', langCode);
    applyLanguage(langCode);
    
    // Reload page to apply translations
    window.location.reload();
  };

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="w-full">
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full bg-gray-900 border-2 border-gray-700 text-white hover:bg-gray-800 h-12">
          <div className="flex items-center gap-3 w-full">
            <Globe className="w-5 h-5 text-[#D4AF37]" />
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{currentLanguage.flag}</span>
              <span className="font-semibold">{currentLanguage.name}</span>
            </div>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-2 border-gray-700">
          {languages.map((lang) => (
            <SelectItem
              key={lang.code}
              value={lang.code}
              className="text-white hover:bg-gray-800 cursor-pointer py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className={`font-semibold ${lang.rtl ? 'font-arabic' : ''}`}>
                  {lang.name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}