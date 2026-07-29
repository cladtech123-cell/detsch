import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Volume2, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Language, ChatMessage } from '../../types';
import { i18nTranslations } from '../../data/i18n';

interface AiTutorViewProps {
  lang: Language;
  onAddXp: (amount: number) => void;
}

export const AiTutorView: React.FC<AiTutorViewProps> = ({ lang, onAddXp }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: "Hallo Julian! Ich bin dein DeutschMastery KI-Tutor. Wie kann ich dir heute mit deinem B2-Deutsch helfen? Wir können über Modalverben sprechen oder einen freien Dialog führen!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove emojis or special markdown for clean TTS
      const cleanText = text.replace(/[^\w\säöüÄÖÜß,.-]/gi, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history,
          targetLanguage: lang,
          userLevel: 'B2',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `a_${Date.now()}`,
          sender: 'ai',
          text: data.reply || "Sehr gut! Lass uns weiter üben.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        onAddXp(15);
      } else {
        throw new Error('Server response error');
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'ai',
        text: "Das ist ein sehr interessanter Satz! In B2 Deutsch achten wir besonders auf die Position der Modalverben und Nebensätze. Möchtest du dazu eine kurze Übung machen?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    "Menga 'können' va 'müssen' orasidagi farqni tushuntir",
    "Keling, B2 darajasida 'Umweltschutz' (Atrof-muhit) haqida suhbatlashaylik",
    "Nemis tilidagi eng ko'p yo'l qo'yiladigan 3 ta grammatik xatoni aytib ber",
    "Ushbu gapimni tekshir: 'Ich habe gestern Deutsch gelernt und kann es sprechen.'",
  ];

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#1a1a1a]">{t('ai_tutor.title')}</h2>
          <p className="text-sm text-[#5c5c52] mt-1">{t('ai_tutor.subtitle')}</p>
        </div>
        <button
          onClick={() =>
            setMessages([
              {
                id: 'm1',
                sender: 'ai',
                text: "Hallo Julian! Ich bin bereit für unser neues Gespräch auf Deutsch!",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="p-2.5 rounded-full bg-[#f8f8f5] text-[#5c5c52] border border-[#e8e8e0] hover:text-[#1a1a1a] transition-colors"
          title="Reset chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="glass-card rounded-[28px] flex-1 p-6 flex flex-col overflow-hidden relative border border-[#e8e8e0]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-9 h-9 rounded-full bg-[#e9edc9] border border-[#ccd5ae] text-[#5A5A40] flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-[#5A5A40] text-white font-medium rounded-tr-none'
                    : 'bg-[#f8f8f5] border border-[#e8e8e0] text-[#1a1a1a] rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                <div className="flex justify-between items-center pt-1 text-[10px] opacity-70">
                  <span>{m.timestamp}</span>
                  {m.sender === 'ai' && (
                    <button
                      onClick={() => speakText(m.text)}
                      className="p-1 hover:text-[#5A5A40] transition-colors"
                      title="Audio Playback"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-9 h-9 rounded-full bg-[#faedcd] border border-[#D4A373]/30 text-[#8a531f] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-9 h-9 rounded-full bg-[#e9edc9] text-[#5A5A40] flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-[#f8f8f5] border border-[#e8e8e0] p-3.5 rounded-2xl text-xs text-[#5c5c52] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#5A5A40]" />
                <span>AI Tutor javob tayyorlamoqda...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Topic Chips */}
        <div className="pt-3 border-t border-[#e8e8e0] shrink-0">
          <p className="text-[11px] font-semibold text-[#5c5c52] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>{t('ai_tutor.suggested')}</span>
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-3.5 py-1.5 rounded-full bg-[#f8f8f5] border border-[#e8e8e0] hover:bg-[#e9edc9]/50 text-[11px] text-[#2d2d2d] whitespace-nowrap transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-3 mt-3 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('ai_tutor.placeholder')}
            className="flex-1 bg-[#f8f8f5] border border-[#e8e8e0] rounded-full px-5 py-3 text-xs md:text-sm text-[#2d2d2d] placeholder-[#71716b]/50 focus:outline-none focus:border-[#5A5A40]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[#5A5A40] text-white px-6 rounded-full font-bold text-xs hover:bg-[#4a4a34] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t('ai_tutor.send')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
