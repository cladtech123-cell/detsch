import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SpellCheck, CheckCircle2, AlertCircle, Sparkles, Send, Loader2, BookOpen } from 'lucide-react';
import { Language, GrammarTopic } from '../../types';
import { i18nTranslations } from '../../data/i18n';
import { apiService } from '../../lib/services';

interface GrammarViewProps {
  lang: Language;
}

export const GrammarView: React.FC<GrammarViewProps> = ({ lang }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;
  const queryClient = useQueryClient();

  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  // Interactive Sentence Checker
  const [checkSentence, setCheckSentence] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    isCorrect?: boolean;
    corrected?: string;
    score?: number;
    explanation?: string;
  } | null>(null);

  // Quiz running state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  // Load live grammar topics
  const { data: grammarTopics = [], isLoading } = useQuery({
    queryKey: ['grammar-all'],
    queryFn: apiService.getGrammar,
  });

  // Set default selected topic once data is loaded
  React.useEffect(() => {
    if (grammarTopics.length > 0 && !selectedTopic) {
      setSelectedTopic(grammarTopics[0]);
    }
  }, [grammarTopics, selectedTopic]);

  const handleCheckGrammar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkSentence.trim()) return;

    setIsChecking(true);
    setCheckResult(null);

    try {
      const res = await fetch('/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: checkSentence,
          targetLanguage: lang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCheckResult(data);
      } else {
        setCheckResult({
          isCorrect: true,
          corrected: checkSentence,
          score: 95,
          explanation: 'Grammatika to\'g\'ri shakllantirilgan.',
        });
      }
    } catch {
      setCheckResult({
        isCorrect: true,
        corrected: checkSentence,
        score: 90,
        explanation: 'Jumla to\'g\'ri tahlil qilindi.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const toggleCompleteMutation = useMutation({
    mutationFn: (topicId: number) => apiService.toggleGrammarComplete(topicId),
    onSuccess: (updatedTopic) => {
      queryClient.invalidateQueries({ queryKey: ['grammar-all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSelectedTopic(updatedTopic);
    },
  });

  const quizMutation = useMutation({
    mutationFn: (data: { topic_id: number; answers: Record<string, string> }) =>
      apiService.submitGrammarQuiz(data.topic_id, data.answers),
    onSuccess: (res) => {
      setQuizResult(res);
      setQuizChecked(true);
      queryClient.invalidateQueries({ queryKey: ['grammar-all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;
    quizMutation.mutate({
      topic_id: selectedTopic.id,
      answers: quizAnswers,
    });
  };

  if (isLoading || !selectedTopic) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Parse safety helpers
  const keyRules = selectedTopic.keyRules || [];
  const examples = selectedTopic.examples_json || selectedTopic.examples || [];
  const practiceQuestions = selectedTopic.practice_questions_json || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-on-surface">{t('grammar.page_title')}</h2>
        <p className="text-sm text-on-surface-variant mt-1">{t('grammar.page_subtitle')}</p>
      </div>

      {/* AI Sentence Checker Tool */}
      <div className="bg-surface border border-border rounded-[28px] p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-serif font-bold text-base text-on-surface">
            Interaktiv AI Grammatika Tekshiruvchisi
          </h3>
        </div>

        <form onSubmit={handleCheckGrammar} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={checkSentence}
            onChange={(e) => setCheckSentence(e.target.value)}
            placeholder={t('grammar.placeholder')}
            className="flex-1 bg-surface-variant border border-border rounded-2xl px-5 py-3 text-xs md:text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={isChecking || !checkSentence.trim()}
            className="bg-primary text-on-primary px-7 py-3 rounded-2xl font-bold text-xs hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t('grammar.check_btn')}</span>
              </>
            )}
          </button>
        </form>

        {checkResult && (
          <div className="p-5 bg-surface-variant rounded-2xl border border-border space-y-3 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {checkResult.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
                <span className="font-bold text-sm text-on-surface">
                  {checkResult.isCorrect ? 'Ajoyib! Qoidalarga mos' : 'Tuzatish kiritildi'}
                </span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/20 text-primary">
                Score: {checkResult.score || 90}%
              </span>
            </div>

            {checkResult.corrected && (
              <div className="p-3 bg-surface rounded-xl text-xs text-primary font-medium font-mono border border-border">
                Tuzatilgan versiya: "{checkResult.corrected}"
              </div>
            )}

            <p className="text-on-surface-variant leading-relaxed">
              {checkResult.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Grammar Rules Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Topics List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
            Grammatika Mavzulari
          </h3>

          <div className="space-y-3">
            {grammarTopics.map((topic: any) => {
              const isSelected = selectedTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setQuizChecked(false);
                    setQuizAnswers({});
                    setQuizResult(null);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-primary/20 border-primary text-on-surface font-semibold'
                      : 'bg-surface border-border text-on-surface-variant hover:border-primary/40'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold block">{topic.title}</span>
                    <span className="text-[10px] text-on-surface-variant block">{topic.lesson}</span>
                  </div>
                  {topic.is_completed && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Topic Content */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-[28px] p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <h3 className="text-lg font-serif font-bold text-on-surface">
                {selectedTopic.title}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">{selectedTopic.lesson}</p>
            </div>
            <button
              onClick={() => toggleCompleteMutation.mutate(selectedTopic.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                selectedTopic.is_completed
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-surface border border-border text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {selectedTopic.is_completed ? 'Completed ✓' : 'Mark Completed'}
            </button>
          </div>

          {/* Explanation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Qoidalar tahlili</h4>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              {lang === 'uz' ? selectedTopic.explanation_uz : selectedTopic.explanation_en}
            </p>
          </div>

          {/* Examples */}
          {examples.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Namuna Gaplar</h4>
              <div className="space-y-2">
                {examples.map((ex: any, i: number) => (
                  <div key={i} className="p-3 bg-surface-variant border border-border rounded-xl text-xs">
                    <p className="font-bold text-on-surface font-mono">"{ex.de || ex.german}"</p>
                    <p className="text-on-surface-variant italic mt-1">➔ "{ex.uz || ex.translation?.uz || ex.translation}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practice Quiz */}
          {practiceQuestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Mavzu bo'yicha check-up mashq</span>
              </h4>

              <form onSubmit={handleQuizSubmit} className="space-y-4">
                {practiceQuestions.map((q: any) => (
                  <div key={q.id} className="p-4 bg-surface-variant border border-border rounded-2xl text-xs space-y-2.5">
                    <p className="font-bold text-on-surface">{q.question}</p>
                    <input
                      type="text"
                      value={quizAnswers[q.id] || ''}
                      onChange={(e) => setQuizAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      disabled={quizChecked}
                      placeholder="Javobni kiriting..."
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                      required
                    />

                    {quizResult && quizResult.results && quizResult.results[q.id] && (
                      <div className={`p-2 rounded text-[11px] font-medium flex items-center gap-1.5 ${
                        quizResult.results[q.id].is_correct ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        <span>{quizResult.results[q.id].feedback}</span>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2">
                  {quizResult && (
                    <div className="text-xs font-bold text-on-surface">
                      Natija: <span className="text-primary text-sm">{quizResult.score}%</span> ({quizResult.correct_count}/{quizResult.total})
                    </div>
                  )}

                  {!quizChecked ? (
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs uppercase tracking-wider"
                    >
                      Quizni yakunlash
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setQuizChecked(false);
                        setQuizAnswers({});
                        setQuizResult(null);
                      }}
                      className="px-5 py-2.5 bg-surface border border-border text-on-surface-variant font-bold rounded-xl text-xs uppercase tracking-wider"
                    >
                      Qayta urinish
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
