import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Landing Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-margin-desktop py-4 max-w-container-max mx-auto">
          <div className="font-headline-md text-headline-md font-bold text-primary">DeutschMastery</div>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={handleStart} className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1 transition-colors duration-200">Lernpfad</button>
            <button onClick={() => navigate('/grammar')} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">Grammatik</button>
            <button onClick={() => navigate('/vocabulary')} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">Vokabeln</button>
            <button onClick={() => navigate('/pricing')} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">Preise</button>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={handleStart} className="font-label-md text-label-md text-primary px-4 py-2 hover:bg-primary/5 rounded-lg transition-all active:scale-95">Anmelden</button>
            <button onClick={handleStart} className="font-label-md text-label-md bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold shadow-sm hover:shadow-md transition-all active:scale-95">Kostenlos testen</button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm mb-6 uppercase tracking-wider font-bold">Einfach & Effizient</span>
              <h1 className="font-display-lg text-display-lg mb-6 leading-tight">Learn German the Smart Way</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl">Master German vocabulary, complex grammar rules, and prepare for Goethe exams with precision-engineered courses designed for modern learners.</p>
              <div className="flex flex-wrap gap-4">
                <button onClick={handleStart} className="px-8 py-4 bg-primary text-on-primary rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 group">
                  Start Learning
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <button onClick={handleStart} className="px-8 py-4 bg-surface-container-high text-on-surface rounded-xl font-bold hover:bg-surface-container-highest transition-all active:scale-95">
                  Explore Courses
                </button>
              </div>
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAAsy2Wa3mfuOrjpfkiXiYValiyrCKJraTl1dy95xWyxSZ3AQgRoUeVeBDM6IC2wqwobbfKbjUE78uPqqUYsZT1hRfkO0xV1XR13i1DheEEZDJe__hTdVP4Ow_Ca3DS1V15-Td5QkYMOloRRuoKrnu4eLKxUGT59X-GN_95cAdD3xQB_zRAAbiWiFkKgtZI2R6nzVWWTvgQO4DpBlG-s_PBRsjRdukrW_aVKwM3m3rZIlMQ29881RoEmQfwDOAboYgfPvydyxg0UZL" alt="Student" />
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAurgrwEceW541Fy-vrRPJvnnQc5-ru9VUYGh3fq4z5lI6ckWLZ30ldszqdFhZ_5IJMb-nWCC45LhVwTUGF186JGZNSErn3pKJXyhL8hO5vn-PsD-mSNcTz0ztl-YF2JQIyK14mklh0-X9mFqd5-jhq7OPlay86lfglV6a3T6oezKjMrkRH7z3Z1unCTt11wjEQLCa6PLjV2R75sTnJYREIZzRFA5NcDgClpifo1owV0kqzYJdm7rmhH6kzsSKwoeHgODr1U4GpomED" alt="Student" />
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATOCAtwnG5cR6gu4s0WVXWutbvaCTFhxAKrLYo53qOi2cPYUHAEw2ul3RKAPOwQ1XRVTc8LDKFbbiaFVsdcchySxcw7wHmFuhJik6HbXRDWxeQUpnKCcQa-GH9JyC3OdSRy6doLaKn7JuveqKfbWZutie1hkU_ha25eYR9OtN5KL9mo8NRSULDebj8pRsMg1sS3OlZMV-fz9srS6mJsSDdptMbccRLMC9pI3MNAkZALMnpzPGANwDI8-JvdEprX5BuPvp22VhoXkBK" alt="Student" />
                </div>
                <div className="text-label-sm font-label-sm text-on-surface-variant">
                  <span className="text-primary font-bold">12k+</span> Lernende vertrauen uns bereits
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary-container/20 rounded-full blur-3xl"></div>
              <div className="relative glass-card rounded-3xl p-4 learning-card-shadow rotate-2 hover:rotate-0 transition-transform duration-500">
                <img className="w-full h-auto rounded-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRq_cN_nTVQJLd7PwZjAwee7oW5TL3MFbmSWQET2M9lTQxT4dGBJLLIdbKv29vJVbToxtYXQ_3bDyK6DcLKxwP-BFPDecWxfGg7sM-GnIxnZ-5rSn6TJSohj4tqchuY6AyU8RCnaMQfAxGpln93UNOTECyT1K8M1SqiVfFZjENfQFt58Nz13epT7mIbAp2KGBY2YZ76-_UxcvTtOS2Xvv9ePYsuUqjcoND9JOahyJyNbGOHB5KhQqVnureHffgodxqhemowyr4FNfP" alt="DeutschMastery Study" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-surface-container-low">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl learning-card-shadow flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-primary text-3xl mb-4">school</span>
                <div className="font-headline-md text-headline-md text-on-surface">450+</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">Lessons Completed Today</div>
              </div>
              <div className="bg-white p-6 rounded-2xl learning-card-shadow flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-secondary text-3xl mb-4">translate</span>
                <div className="font-headline-md text-headline-md text-on-surface">15k</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">Words Learned</div>
              </div>
              <div className="bg-white p-6 rounded-2xl learning-card-shadow flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-tertiary-container text-3xl mb-4">local_fire_department</span>
                <div className="font-headline-md text-headline-md text-on-surface">12 Tage</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">Study Streak</div>
              </div>
              <div className="bg-white p-6 rounded-2xl learning-card-shadow flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-error text-3xl mb-4">verified</span>
                <div className="font-headline-md text-headline-md text-on-surface">94%</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">Quiz Accuracy</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 max-w-container-max mx-auto px-margin-desktop">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold mb-4 inline-block">Warum DeutschMastery?</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">Precision Learning Tools for German Learners</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">We combine modern spaced repetition, smart interactive exercises, and custom curriculum tracking to deliver optimal learning speed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-slate-200 hover:border-primary/20 hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">style</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Spaced Repetition</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Store German vocabulary in your long-term memory with our optimized algorithmic flashcards scheduling.</p>
            </div>
            <div className="p-8 rounded-3xl border border-slate-200 hover:border-primary/20 hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-12 h-12 bg-secondary-container/20 text-on-secondary-container rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">edit_note</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Sentence Builder</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Practice German word order, noun cases (Nominativ, Akkusativ, Dativ), and verb position conjugations.</p>
            </div>
            <div className="p-8 rounded-3xl border border-slate-200 hover:border-primary/20 hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">forum</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-4">AI Conversation</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Talk with a personalized AI German Tutor that gently corrects your mistakes, explains rules, and suggests better phrasings.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-outline-variant bg-surface-container-low text-on-surface-variant">
        <div className="max-w-container-max mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-label-sm text-xs">© 2026 DeutschMastery GmbH. Präzision im Lernen.</p>
          <div className="flex gap-6">
            <button onClick={handleStart} className="font-label-sm text-xs hover:text-primary transition-colors">Impressum</button>
            <button onClick={handleStart} className="font-label-sm text-xs hover:text-primary transition-colors">Datenschutz</button>
            <button onClick={handleStart} className="font-label-sm text-xs hover:text-primary transition-colors">AGB</button>
            <button onClick={handleStart} className="font-label-sm text-xs hover:text-primary transition-colors">Kontakt</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
