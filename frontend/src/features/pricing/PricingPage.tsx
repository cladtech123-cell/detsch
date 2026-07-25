import { CheckCircle2, Award } from 'lucide-react';

export function PricingPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6 animate-fadeIn">
      {/* Pricing Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
          Premium Mitgliedschaft
        </span>
        <h3 className="text-3xl font-black text-on-surface tracking-tight">Investiere in deinen Erfolg</h3>
        <p className="text-on-surface-variant text-sm">
          Schalte alle Features frei, um Deutsch doppelt so schnell zu meistern.
        </p>
      </div>

      {/* Pricing Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
        
        {/* Free Plan */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
          <div>
            <h4 className="text-xl font-bold text-on-surface mb-2">Free Plan</h4>
            <p className="text-xs text-on-surface-variant mb-6">Für Einsteiger, die reinschnuppern wollen.</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-on-surface">$0</span>
              <span className="text-xs text-on-surface-variant font-medium"> / monatlich</span>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-xs text-on-surface-variant">
                <CheckCircle2 size={16} className="text-primary" />
                5 KI-Anfragen pro Tag
              </li>
              <li className="flex items-center gap-3 text-xs text-on-surface-variant">
                <CheckCircle2 size={16} className="text-primary" />
                Vokabel-Lernkarten (Standard)
              </li>
              <li className="flex items-center gap-3 text-xs text-on-surface-variant">
                <CheckCircle2 size={16} className="text-primary" />
                Grammatik-Bibliothek (A1-A2)
              </li>
            </ul>
          </div>

          <button 
            disabled 
            className="w-full mt-8 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-sm cursor-not-allowed"
          >
            Aktueller Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-white border-2 border-primary rounded-3xl p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
          {/* Top highlight ribbon */}
          <div className="absolute top-4 right-4 bg-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Empfohlen
          </div>

          <div>
            <h4 className="text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
              Premium Pro
              <Award size={18} className="text-amber-500" />
            </h4>
            <p className="text-xs text-on-surface-variant mb-6">Für ambitionierte Schüler, die B2 anstreben.</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-on-surface">$9</span>
              <span className="text-xs text-on-surface-variant font-medium"> / monatlich</span>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-xs text-on-surface">
                <CheckCircle2 size={16} className="text-tertiary" />
                <strong>Unbegrenzte</strong> KI-Anfragen (Gemini & Groq)
              </li>
              <li className="flex items-center gap-3 text-xs text-on-surface">
                <CheckCircle2 size={16} className="text-tertiary" />
                Voller Zugriff auf alle Lektionen (1-12)
              </li>
              <li className="flex items-center gap-3 text-xs text-on-surface">
                <CheckCircle2 size={16} className="text-tertiary" />
                Personalisierte Fehleranalyse & Berichte
              </li>
              <li className="flex items-center gap-3 text-xs text-on-surface">
                <CheckCircle2 size={16} className="text-tertiary" />
                Exklusiver Offline-Modus für Bulk Import
              </li>
            </ul>
          </div>

          <button 
            onClick={() => alert('Vielen Dank! Premium-Abonnement gestartet.')}
            className="w-full mt-8 py-3.5 bg-primary text-on-primary hover:bg-primary/95 font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-md shadow-primary/10"
          >
            Premium freischalten
          </button>
        </div>

      </div>
    </div>
  );
}
