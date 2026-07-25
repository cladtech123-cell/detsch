import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  AlertCircle, 
  Volume2, 
  Send, 
  Lightbulb 
} from 'lucide-react';
import { apiService } from '@/lib/services';

interface Topic {
  id: number;
  title: string;
  lesson: string;
  explanation_uz: string;
  explanation_en: string;
  examples_json: Array<{ de: string; uz: string }>;
  common_mistakes_json: Array<{ de: string; uz: string }>;
  practice_questions_json: Array<{ id: string; question: string; hint: string; answer: string }>;
  is_completed: boolean;
}

interface Word {
  id: number;
  german: string;
  translation: string;
  lesson: string;
  category: string;
}

export function LessonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const topicId = parseInt(id || '0') || null;

  const [activeTab, setActiveTab] = useState<'rules' | 'examples' | 'quiz' | 'vocab'>('rules');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  // Queries
  const { data: topic, isLoading, isError } = useQuery<Topic>({
    queryKey: ['grammar-topic', topicId],
    queryFn: () => apiService.getGrammarTopic(topicId!),
    enabled: topicId !== null,
  });

  const { data: allWords = [] } = useQuery<Word[]>({
    queryKey: ['vocabulary-all'],
    queryFn: apiService.getVocabulary,
  });

  // Mutations
  const toggleMutation = useMutation({
    mutationFn: (tid: number) => apiService.toggleGrammarComplete(tid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grammar-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['grammar-topics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const submitQuizMutation = useMutation({
    mutationFn: (vars: { topic_id: number; answers: Record<string, string> }) =>
      apiService.submitGrammarQuiz(vars.topic_id, vars.answers),
    onSuccess: (res) => {
      setQuizResult(res);
      queryClient.invalidateQueries({ queryKey: ['grammar-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['grammar-topics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  // Text-To-Speech audio player
  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel ongoing synthesis
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicId) return;
    submitQuizMutation.mutate({
      topic_id: topicId,
      answers: quizAnswers
    });
  };

  if (isLoading || !topic) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="font-label-md text-on-surface-variant">Inhalt wird geladen...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-error/20 bg-error/5 p-8 text-center max-w-xl mx-auto">
        <AlertCircle className="mx-auto text-error mb-4" size={48} />
        <h3 className="text-xl font-bold text-on-surface">Ladefehler</h3>
        <p className="text-sm text-on-surface-variant mt-2">Das Thema konnte nicht geladen werden.</p>
      </div>
    );
  }

  // Filter words related to this lesson
  const relatedWords = allWords.filter(
    (w) => w.lesson.toLowerCase().trim() === topic.lesson.toLowerCase().trim()
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button & Action header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/lessons')}
          className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
        >
          <ArrowLeft size={16} />
          Zurück zur Übersicht
        </button>
        <button 
          onClick={() => toggleMutation.mutate(topic.id)}
          className={`px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 ${
            topic.is_completed 
              ? 'bg-tertiary text-on-tertiary hover:bg-tertiary/90'
              : 'bg-primary-container text-on-primary-container hover:bg-primary-container/90'
          }`}
        >
          {topic.is_completed ? 'Als unvollständig markieren' : 'Als gelernt markieren'}
        </button>
      </div>

      {/* Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          {topic.lesson}
        </span>
        <h3 className="text-2xl font-black text-on-surface tracking-tight">{topic.title}</h3>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 gap-6">
        {(['rules', 'examples', 'quiz', 'vocab'] as const).map((tab) => {
          const labels = {
            rules: 'Grammatikregeln',
            examples: 'Beispielsätze',
            quiz: 'Übung & Quiz',
            vocab: 'Lektionsvokabular'
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-bold text-sm transition-all relative ${
                activeTab === tab 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Tab contents */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm min-h-[300px]">
        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h5 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">translate</span>
                  Tushuntirish (O'zbekcha)
                </h5>
                <p className="text-on-surface-variant font-body-md text-sm leading-relaxed whitespace-pre-line">
                  {topic.explanation_uz}
                </p>
              </div>
              <div>
                <h5 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">info</span>
                  Explanation (English)
                </h5>
                <p className="text-on-surface-variant font-body-md text-sm leading-relaxed whitespace-pre-line">
                  {topic.explanation_en}
                </p>
              </div>
            </div>

            {/* Common mistakes */}
            {topic.common_mistakes_json && topic.common_mistakes_json.length > 0 && (
              <div className="border-t border-slate-100 pt-6">
                <h5 className="font-bold text-on-surface mb-4 flex items-center gap-2 text-error">
                  <span className="material-symbols-outlined">error</span>
                  Häufige Fehler (Ko'p qilinadigan xatolar)
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topic.common_mistakes_json.map((mistake, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-error/5 border border-error/15 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded bg-error/10 text-error font-bold font-mono tracking-wider">Incorrect</span>
                        <span className="text-[10px] text-on-surface-variant">Lektion xato</span>
                      </div>
                      <p className="text-error font-mono line-through">"{mistake.de}"</p>
                      <p className="text-on-surface-variant font-sans">{mistake.uz}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Examples Tab */}
        {activeTab === 'examples' && (
          <div className="space-y-6">
            <h5 className="font-bold text-on-surface mb-4">Mavzuga oid gaplar:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.examples_json.map((ex, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-colors flex items-center justify-between gap-4 border border-slate-100">
                  <div>
                    <p className="font-bold text-on-surface text-sm">"{ex.de}"</p>
                    <p className="text-xs text-on-surface-variant mt-1">{ex.uz}</p>
                  </div>
                  <button 
                    onClick={() => playAudio(ex.de)}
                    className="w-10 h-10 rounded-full bg-white hover:bg-primary/5 text-primary border border-slate-200 flex items-center justify-center transition-colors active:scale-95 shrink-0"
                    title="Audio talaffuz"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">quiz</span>
                Mini Test (Bilimingizni sinab ko'ring)
              </h5>
              {topic.is_completed && (
                <span className="text-xs font-bold text-tertiary bg-tertiary/10 px-2.5 py-1 rounded-full">
                  Lektion abgeschlossen ✓
                </span>
              )}
            </div>

            <form onSubmit={handleQuizSubmit} className="space-y-6">
              {topic.practice_questions_json.map((q, idx) => {
                const isCorrect = quizResult?.feedback?.[q.id]?.is_correct;
                const feedbackMsg = quizResult?.feedback?.[q.id]?.feedback;
                const correctAnswer = quizResult?.feedback?.[q.id]?.correct_answer;

                return (
                  <div key={q.id} className="p-5 rounded-2xl bg-surface-container-low border border-slate-100 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <p className="font-bold text-on-surface text-sm">
                        {idx + 1}. {q.question}
                      </p>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider font-mono">Q{idx + 1}</span>
                    </div>

                    <div className="flex gap-3">
                      <input 
                        type="text"
                        value={quizAnswers[q.id] || ''}
                        onChange={(e) => {
                          setQuizAnswers({
                            ...quizAnswers,
                            [q.id]: e.target.value
                          });
                        }}
                        disabled={submitQuizMutation.isPending}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                        placeholder="Javobingizni kiriting..."
                      />
                    </div>

                    {/* Hints and Feedbacks */}
                    <div className="text-xs space-y-1">
                      <p className="text-on-surface-variant flex items-center gap-1.5 opacity-70">
                        <Lightbulb size={12} className="text-amber-500" />
                        Maslahat: {q.hint}
                      </p>
                      {quizResult && (
                        <div className={`mt-2 font-bold flex items-center gap-1 ${
                          isCorrect ? 'text-tertiary' : 'text-error'
                        }`}>
                          <span className="material-symbols-outlined text-sm">
                            {isCorrect ? 'check_circle' : 'cancel'}
                          </span>
                          {feedbackMsg}
                        </div>
                      )}
                      {correctAnswer && !isCorrect && (
                        <p className="text-tertiary font-bold">To'g'ri javob: {correctAnswer}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                type="submit"
                disabled={submitQuizMutation.isPending}
                className="bg-primary text-on-primary font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {submitQuizMutation.isPending ? 'Tekshirilmoqda...' : 'Javoblarni yuborish'}
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Vocabulary Tab */}
        {activeTab === 'vocab' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-bold text-on-surface">Lektsiyadagi yangi so'zlar:</h5>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                {relatedWords.length} So'z topildi
              </span>
            </div>
            {relatedWords.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">bookmark</span>
                <p className="font-medium text-sm">Bu leksiya uchun alohida so'zlar yo'q.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedWords.map((w) => (
                  <div key={w.id} className="p-4 rounded-2xl bg-surface-container-low border border-slate-100 hover:shadow-sm transition-all flex justify-between items-center gap-4">
                    <div>
                      <p className="font-black text-on-surface text-sm">{w.german}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{w.translation}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider font-mono">
                        {w.category}
                      </span>
                    </div>
                    <button 
                      onClick={() => playAudio(w.german)}
                      className="w-8 h-8 rounded-full bg-white hover:bg-primary/5 text-primary border border-slate-200 flex items-center justify-center transition-colors active:scale-95 shrink-0"
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
