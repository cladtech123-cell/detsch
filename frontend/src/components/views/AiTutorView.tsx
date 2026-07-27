import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, Send, User, Volume2, Sparkles, Loader2, RefreshCw, Mic, MicOff, Trash2, VolumeX } from 'lucide-react';
import { Language } from '../../types';
import { i18nTranslations } from '../../data/i18n';
import { apiService } from '../../lib/services';

interface AiTutorViewProps {
  lang: Language;
  onAddXp: (amount: number) => void;
}

export const AiTutorView: React.FC<AiTutorViewProps> = ({ lang, onAddXp }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;
  const queryClient = useQueryClient();

  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from FastAPI
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['tutor-messages'],
    queryFn: apiService.getTutorMessages,
  });

  // Load current lesson context for the badge
  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: apiService.getProgress,
  });

  const { data: lessonData } = useQuery({
    queryKey: ['curriculum_lesson', progress?.current_lesson],
    queryFn: () => apiService.getCurriculumLesson('A1.1', progress!.current_lesson),
    enabled: !!progress?.current_lesson,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // TTS Read Aloud
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Split to read only the German part before explanation details
    const cleanedText = text.split('(')[0].split('|')[0].trim();
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'de-DE';
    utterance.rate = 0.85;

    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find(v => v.lang.startsWith('de'));
    if (deVoice) utterance.voice = deVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: apiService.sendTutorMessage,
    onSuccess: (newReply) => {
      queryClient.invalidateQueries({ queryKey: ['tutor-messages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      setInput('');
      if (speechEnabled) {
        speakText(newReply.content);
      }
      onAddXp(15);
    },
  });

  const clearMutation = useMutation({
    mutationFn: apiService.clearTutorHistory,
    onSuccess: () => {
      queryClient.setQueryData(['tutor-messages'], []);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;
    chatMutation.mutate(input);
  };

  // STT Voice Capture
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sizning brauzeringiz ovozli tanib olishni qo'llab-quvvatlamaydi. Chrome'dan foydalaning.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };
    recognition.onerror = (e: any) => {
      console.error(e);
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };

    recognition.start();
  };

  const suggestedPrompts = [
    "Menga 'können' va 'müssen' orasidagi farqni tushuntir",
    "Keling, B2 darajasida 'Umweltschutz' haqida gaplashaylik",
    "Germaniyada goethe imtihoniga tayyorlanish bo'yicha maslahat ber",
  ];

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-serif font-bold text-on-surface">{t('ai_tutor.title')}</h2>
          <p className="text-sm text-on-surface-variant mt-1">{t('ai_tutor.subtitle')}</p>
          {/* Curriculum context badge */}
          {progress && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-bold uppercase tracking-wider">
                Lektion {progress.current_lesson}
              </span>
              {lessonData?.grammar_title && (
                <span className="text-[10px] px-2.5 py-1 bg-surface-variant text-on-surface-variant border border-border rounded-full">
                  📚 {lessonData.grammar_title}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* TTS Toggle */}
          <button 
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-2.5 rounded-xl border transition ${
              speechEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-surface border-border text-on-surface-variant'
            }`}
            title={speechEnabled ? "Ovoz chiqarib o'qish yoqilgan" : "Ovoz chiqarib o'qish o'chirilgan"}
          >
            {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          <button
            onClick={() => {
              if (confirm("Muloqot tarixini butunlay o'chirishni xohlaysizmi?")) {
                clearMutation.mutate();
              }
            }}
            className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            title="Tarixni tozalash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-surface border border-border rounded-[28px] flex-1 p-6 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-none">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4 py-8">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary">
                <Sparkles size={28} />
              </div>
              <h3 className="text-base font-bold text-on-surface">DeutschMastery Mentor</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Menga nemis tilida xohlagan matningizni yozing. Men uni tekshirib, xatolaringizni o'zbek tilida tushuntiraman!
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="px-3.5 py-2 rounded-xl bg-surface-variant border border-border text-[11px] text-on-surface hover:bg-primary/20 transition text-left"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m: any) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed space-y-2 ${
                    m.role === 'user'
                      ? 'bg-primary text-on-primary rounded-tr-none'
                      : 'bg-surface-variant border border-border text-on-surface rounded-tl-none font-sans'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => speakText(m.content)}
                      className="text-primary hover:underline text-[10px] font-bold flex items-center gap-1.5 pt-1.5 border-t border-border/40"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audioni eshitish</span>
                    </button>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-9 h-9 rounded-full bg-surface-variant border border-border text-on-surface-variant flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))
          )}
          {chatMutation.isPending && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-surface-variant border border-border rounded-2xl rounded-tl-none px-4 py-3 text-xs text-on-surface-variant flex items-center gap-2 font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>KI-Tutor tahlil qilmoqda...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-border flex gap-3 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={chatMutation.isPending}
            placeholder={t('ai_tutor.placeholder')}
            className="flex-1 bg-surface-variant border border-border rounded-full px-5 py-3.5 text-xs md:text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={startSpeechRecognition}
            className={`p-3.5 rounded-full border transition-all ${
              isRecording
                ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse'
                : 'bg-surface border-border text-on-surface-variant hover:text-on-surface'
            }`}
            title="Voice input"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            type="submit"
            disabled={chatMutation.isPending || !input.trim()}
            className="bg-primary text-on-primary p-3.5 rounded-full font-semibold hover:bg-primary-hover transition-all shadow-md flex items-center justify-center shrink-0 disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
