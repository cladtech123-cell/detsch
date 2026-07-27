import React from 'react';
import { Language } from '../types';
import { i18nTranslations } from '../data/i18n';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;

  return (
    <footer className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 text-on-surface-variant text-xs">
      <div className="flex items-center gap-2">
        <span className="font-serif font-bold text-on-surface">© 2026 DeutschMastery</span>
        <span className="mx-2 opacity-30">|</span>
        <span>{t('footer.rights')}</span>
      </div>
      <div className="flex gap-6 flex-wrap justify-center">
        <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">
          {t('footer.privacy')}
        </a>
        <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">
          {t('footer.terms')}
        </a>
        <a href="#imprint" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">
          {t('footer.imprint')}
        </a>
        <a href="#help" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">
          {t('footer.help')}
        </a>
      </div>
    </footer>
  );
};
