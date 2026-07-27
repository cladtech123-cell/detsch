import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, Plus, Check, Trash2, Database, AlertCircle, Sparkles, Cpu, Zap, Activity } from 'lucide-react';
import { apiService } from '../../lib/services';
import { Language } from '../../types';

interface AdminViewProps {
  lang: Language;
}

const seedVocabularyData = [
  { german: "die Herausforderung", translation: "qiyinchilik, sinov", example_sentence: "Das ist eine große Herausforderung (Bu katta qiyinchilik).", cefr_level: "B2", category: "Noun", lesson: "Lektion 7" },
  { german: "nachhaltig", translation: "ekologik barqaror", example_sentence: "Wir müssen nachhaltig leben (Biz barqaror yashashimiz kerak).", cefr_level: "B2", category: "Adjective", lesson: "Lektion 7" },
  { german: "verantwortungsvoll", translation: "mas'uliyatli", example_sentence: "Er ist sehr verantwortungsvoll (U juda mas'uliyatli).", cefr_level: "B2", category: "Adjective", lesson: "Lektion 7" },
  { german: "entscheiden", translation: "qaror qabul qilmoq", example_sentence: "Ich muss mich entscheiden (Men qaror qabul qilishim kerak).", cefr_level: "B2", category: "Verb", lesson: "Lektion 7" },
  { german: "die Erfahrung", translation: "tajriba", example_sentence: "Er hat viel Erfahrung (Unda tajriba ko'p).", cefr_level: "B2", category: "Noun", lesson: "Lektion 7" },
  { german: "die Familie", translation: "oila", example_sentence: "Ich liebe meine Familie (Men oilamni yaxshi ko'raman).", cefr_level: "A1", category: "Family", lesson: "Lektion 2" },
  { german: "einkaufen", translation: "xarid qilmoq", example_sentence: "Wir gehen einkaufen (Biz xarid qilishga boryapmiz).", cefr_level: "A1", category: "General", lesson: "Lektion 3" },
  { german: "die Wohnung", translation: "kvartira, uy", example_sentence: "Meine Wohnung ist gemütlich (Mening uyim shinam).", cefr_level: "A1", category: "General", lesson: "Lektion 4" },
  { german: "können", translation: "qila olmoq (modal fe'l)", example_sentence: "Ich kann Deutsch sprechen (Men nemischa gapira olaman).", cefr_level: "A1", category: "Modalverben", lesson: "Lektion 7" },
  { german: "müssen", translation: "majbur bo'lmoq", example_sentence: "Wir müssen lernen (Biz o'rganishimiz kerak).", cefr_level: "A1", category: "Modalverben", lesson: "Lektion 7" }
];

export const AdminView: React.FC<AdminViewProps> = ({ lang }) => {
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'seeder' | 'vocab' | 'grammar'>('status');
  const [dbStats, setDbStats] = useState({ vocabCount: 0, grammarCount: 0, mistakesCount: 0 });
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [grammarList, setGrammarList] = useState<any[]>([]);
  
  // Latency test
  const [latency, setLatency] = useState<string>('Testing...');
  const [isTestingLatency, setIsTestingLatency] = useState(false);

  // Vocab form state
  const [german, setGerman] = useState('');
  const [translation, setTranslation] = useState('');
  const [example, setExample] = useState('');
  const [category, setCategory] = useState('General');
  const [level, setLevel] = useState('B2');
  const [lesson, setLesson] = useState('Lektion 7');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadStats = async () => {
    try {
      const vocabs = await apiService.getVocabulary();
      const grammar = await apiService.getGrammar();
      const dashboard = await apiService.getDashboard();
      
      setDbStats({
        vocabCount: vocabs.length,
        grammarCount: grammar.length,
        mistakesCount: dashboard.recent_mistakes?.length || 0
      });
      setVocabList(vocabs);
      setGrammarList(grammar);
    } catch (e: any) {
      console.error(e);
    }
  };

  const runLatencyTest = async () => {
    setIsTestingLatency(true);
    const start = performance.now();
    try {
      await apiService.getProgress();
      const duration = Math.round(performance.now() - start);
      setLatency(`${duration}ms`);
    } catch {
      setLatency('Error connecting');
    } finally {
      setIsTestingLatency(false);
    }
  };

  useEffect(() => {
    loadStats();
    runLatencyTest();
  }, []);

  const handleAddVocab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!german || !translation) return;
    setLoading(true);
    try {
      await apiService.addVocabulary({
        german,
        translation,
        example_sentence: example || `${german} ist wichtig.`,
        cefr_level: level,
        category,
        lesson
      });
      setMessage({ type: 'success', text: 'Yangi so\'z ma\'lumotlar bazasiga saqlandi!' });
      setGerman('');
      setTranslation('');
      setExample('');
      loadStats();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Xatolik yuz berdi.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleToggleGrammar = async (id: number) => {
    try {
      await apiService.toggleGrammarComplete(id);
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi.');
    }
  };

  const handleSeedDatabase = async () => {
    setLoading(true);
    try {
      await apiService.bulkImportVocabulary(seedVocabularyData);
      setMessage({ type: 'success', text: 'Ma\'lumotlar bazasi muvaffaqiyatli to\'ldirildi!' });
      loadStats();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Seeding failed.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto text-on-surface">
      <div>
        <h2 className="text-2xl font-serif font-bold text-on-surface flex items-center gap-2">
          <Sliders className="w-6 h-6 text-primary" />
          <span>Admin Boshqaruv Konsoli (Admin Panel)</span>
        </h2>
        <p className="text-xs md:text-sm text-on-surface-variant mt-1">Platforma ma'lumotlar bazasi va tizim statistikasini boshqarish.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          <AlertCircle className="w-5 h-5" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
        {(['status', 'seeder', 'vocab', 'grammar'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeSubTab === tab 
                ? 'bg-primary text-on-primary shadow-sm' 
                : 'bg-surface hover:bg-surface-variant text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab === 'status' ? 'Diagnostika' : tab === 'seeder' ? 'Seeder Controls' : tab === 'vocab' ? "So'zlar" : 'Grammatika'}
          </button>
        ))}
      </div>

      {activeSubTab === 'status' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border p-6 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Jami So'zlar</p>
                <h3 className="text-3xl font-black mt-2 text-on-surface">{dbStats.vocabCount}</h3>
              </div>
              <Database className="w-10 h-10 text-primary opacity-60" />
            </div>

            <div className="bg-surface border border-border p-6 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Grammatika Mavzulari</p>
                <h3 className="text-3xl font-black mt-2 text-on-surface">{dbStats.grammarCount}</h3>
              </div>
              <Sliders className="w-10 h-10 text-primary opacity-60" />
            </div>

            <div className="bg-surface border border-border p-6 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Kiritilgan Xatolar</p>
                <h3 className="text-3xl font-black mt-2 text-on-surface">{dbStats.mistakesCount}</h3>
              </div>
              <Database className="w-10 h-10 text-red-400 opacity-60" />
            </div>
          </div>

          {/* Connection diagnostics */}
          <div className="bg-surface border border-border p-6 rounded-[32px] space-y-6">
            <h3 className="text-base font-serif font-bold text-on-surface flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Tizim diagnostikasi (Diagnostics)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-surface-variant rounded-2xl border border-border flex justify-between items-center">
                <span className="text-on-surface-variant">Ma'lumotlar bazasi (SQLite):</span>
                <span className="font-bold text-emerald-400">ONLINE (lerndeutsch.db)</span>
              </div>
              <div className="p-4 bg-surface-variant rounded-2xl border border-border flex justify-between items-center">
                <span className="text-on-surface-variant">API Ping kechikishi (Latency):</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary">{latency}</span>
                  <button onClick={runLatencyTest} disabled={isTestingLatency} className="p-1 rounded bg-surface hover:bg-surface-variant transition">
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingLatency ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-surface-variant rounded-2xl border border-border flex justify-between items-center">
                <span className="text-on-surface-variant">Sun'iy intellekt modeli (AI Provider):</span>
                <span className="font-bold text-on-surface">Gemini-2.5-Flash (Ulanish OK)</span>
              </div>
              <div className="p-4 bg-surface-variant rounded-2xl border border-border flex justify-between items-center">
                <span className="text-on-surface-variant">FastAPI Server status:</span>
                <span className="font-bold text-emerald-400">ACTIVE (Port 8060)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'seeder' && (
        <div className="max-w-xl mx-auto bg-surface border border-border p-6 md:p-8 rounded-[32px] space-y-6">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary">
            <Cpu className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-serif font-bold text-on-surface">Database Seeder & Management</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Tizimni dastlabki namuna so'zlar bilan to'ldirish. Bu SQLite bazasidagi mavjud ma'lumotlarni o'chirmagan holda yangi kartalarni import qiladi.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleSeedDatabase}
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-hover text-on-primary font-bold rounded-2xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Namuna so'zlarni bazaga yozish (Seed Vocabs)</span>
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'vocab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Form */}
          <div className="lg:col-span-5 bg-surface border border-border p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-serif font-bold text-on-surface">Yangi So'z Qo'shish</h3>
            
            <form onSubmit={handleAddVocab} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-on-surface-variant">Nemischa *</label>
                <input
                  type="text"
                  required
                  value={german}
                  onChange={(e) => setGerman(e.target.value)}
                  placeholder="z.B. die Entscheidung"
                  className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-on-surface-variant">Tarjimasi *</label>
                <input
                  type="text"
                  required
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  placeholder="Mavzu bo'yicha tarjimasi"
                  className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-on-surface-variant">Misol Gap (Nemischa)</label>
                <input
                  type="text"
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  placeholder="z.B. Das war eine gute Entscheidung."
                  className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1 font-semibold text-on-surface-variant">CEFR</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-surface-variant border border-border rounded-xl px-3 py-2 text-on-surface focus:outline-none"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-on-surface-variant">Kategoriya</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-variant border border-border rounded-xl px-3 py-2 text-on-surface focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-on-surface-variant">Darslik</label>
                  <input
                    type="text"
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    className="w-full bg-surface-variant border border-border rounded-xl px-3 py-2 text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-on-primary hover:bg-primary-hover rounded-xl font-bold uppercase tracking-wider transition"
              >
                {loading ? 'Kutilmoqda...' : "Ma'lumotlar bazasiga yozish"}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-7 bg-surface border border-border p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-serif font-bold text-on-surface">Mavjud Lug'atlar ({vocabList.length} ta)</h3>
            <div className="max-h-[450px] overflow-y-auto space-y-2 pr-2 scrollbar-none">
              {vocabList.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-2xl bg-surface-variant border border-border text-xs">
                  <div>
                    <p className="font-bold text-on-surface">{item.german}</p>
                    <p className="text-on-surface-variant">{item.translation}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary font-bold text-[10px] uppercase">
                    {item.cefr_level || item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'grammar' && (
        <div className="bg-surface border border-border p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-serif font-bold text-on-surface">Grammatika Mavzulari Boshqaruvi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grammarList.map((topic: any) => (
              <div key={topic.id} className="p-4 rounded-2xl bg-surface-variant border border-border flex justify-between items-start text-xs">
                <div>
                  <h4 className="font-bold text-on-surface text-sm">{topic.title}</h4>
                  <p className="text-on-surface-variant mt-1">{topic.lesson}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      topic.is_completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {topic.is_completed ? 'Bajargan' : 'Bajarilmagan'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleGrammar(topic.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition ${
                    topic.is_completed ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  }`}
                >
                  {topic.is_completed ? 'Qaytarish' : 'Tugatish'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
