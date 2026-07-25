import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Trash2, 
  Sparkles,
  Bot,
  User,
  VolumeX
} from 'lucide-react';
import { apiService } from '@/lib/services';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  provider_info?: string;
}

export function TutorPage() {
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['tutor-messages'],
    queryFn: apiService.getTutorMessages,
  });

  const chatMutation = useMutation({
    mutationFn: apiService.sendTutorMessage,
    onSuccess: (newReply) => {
      queryClient.setQueryData(['tutor-messages'], (old: Message[] = []) => [
        ...old,
        { id: newReply.id - 1, role: 'user', content: inputText },
        newReply,
      ]);
      setInputText('');
      
      // Trigger Text to Speech if enabled
      if (speechEnabled) {
        speakText(newReply.content);
      }
      
      // Invalidate dashboard to sync recent mistakes
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: apiService.clearTutorHistory,
    onSuccess: () => {
      queryClient.setQueryData(['tutor-messages'], []);
    },
  });

  // Scroll to bottom on load/new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || chatMutation.isPending) return;
    chatMutation.mutate(inputText);
  };

  // Browser Text-To-Speech (TTS)
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Remove translations/Uzbek explanations to only speak the German part
    // Typically German text is at the start, explanations in brackets/parents
    const cleanedText = text.split('(')[0].split('|')[0].trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'de-DE'; // German voice
    
    // Optional: find a good German voice
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find(v => v.lang.startsWith('de'));
    if (deVoice) utterance.voice = deVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  // Browser Speech-To-Text (STT)
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sizning brauzeringiz ovozli tanib olishni qo'llab-quvvatlamaydi. Google Chrome foydalaning.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE'; // Expect German speech
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
      setInputText(prev => prev + ' ' + transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[82vh] max-w-5xl mx-auto border border-slate-200 rounded-2xl bg-white/60 backdrop-blur-md overflow-hidden">
      {/* Tutor Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-white border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-outline-variant">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-on-surface">AI Tutor (Nemis tili o'qituvchisi)</h2>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Xatolaringizni o'zbek tilida tushuntiradi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* TTS Toggle */}
          <button 
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-2 rounded-lg border transition ${
              speechEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-white border-slate-200 text-on-surface-variant'
            }`}
            title={speechEnabled ? "Ovoz chiqarib o'qish yoqilgan" : "Ovoz chiqarib o'qish o'chirilgan"}
          >
            {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          {/* Clear history */}
          <button 
            onClick={() => {
              if (confirm("Muloqot tarixini butunlay o'chirishni xohlaysizmi?")) {
                clearMutation.mutate();
              }
            }}
            className="p-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
            title="Tarixni tozalash"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-container-low">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-primary/10 border border-outline-variant flex items-center justify-center text-primary">
              <Sparkles size={28} />
            </div>
            <h3 className="text-base font-semibold text-on-surface">Deutsch-Lernassistent bilan muloqotni boshlang</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Menga xohlagan gapingizni nemis tilida yozing. Men javob beraman, xatolaringizni o'zbek tilida tushuntiraman va to'g'irlayman.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <button 
                onClick={() => setInputText("Hallo! Wie geht es dir?")}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-on-surface-variant hover:border-slate-200 transition"
              >
                "Hallo! Wie geht es dir?"
              </button>
              <button 
                onClick={() => setInputText("Ich wohnen in Berlin.")}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-on-surface-variant hover:border-slate-200 transition"
              >
                "Ich wohnen in Berlin." (Xato namuna)
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`p-2 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center border ${
                msg.role === 'user' 
                  ? 'bg-white border-slate-200 text-on-surface-variant' 
                  : 'bg-primary/10 border-outline-variant text-primary'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary text-on-surface rounded-tr-none' 
                  : 'bg-white/80 border border-slate-100 text-on-surface rounded-tl-none font-sans'
              }`}>
                {/* Process text output with markdown code snippets if any */}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && (
                  <div className="mt-2 pt-1.5 border-t border-slate-200 flex justify-between items-center gap-2">
                    <button 
                      onClick={() => speakText(msg.content)}
                      className="text-primary hover:text-primary-fixed-dim flex items-center gap-1 text-[11px] font-semibold text-left"
                    >
                      <Volume2 size={12} /> Ovoz chiqarib o'qish
                    </button>
                    {msg.provider_info && (
                      <span className="text-[10px] text-on-surface-variant font-mono italic">
                        {msg.provider_info}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {chatMutation.isPending && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="p-2 rounded-xl bg-primary/10 border border-outline-variant text-primary h-9 w-9 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-white/80 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-on-surface-variant font-mono flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              Tutor tahlil qilmoqda...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input panel */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white/30 flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nemis tilida yozing... (masalan: Ich lerne Deutsch.)"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-on-surface placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
          disabled={chatMutation.isPending}
        />
        
        {/* Speak record button */}
        <button
          type="button"
          onClick={startSpeechRecognition}
          className={`p-2.5 rounded-xl border transition shrink-0 ${
            isRecording 
              ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
              : 'bg-white border-slate-200 text-on-surface-variant hover:text-on-surface'
          }`}
          disabled={chatMutation.isPending}
          title="Ovoz orqali kiritish (Nemischa nutq)"
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Send button */}
        <button
          type="submit"
          className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-on-surface font-semibold text-sm transition shrink-0 flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15 disabled:opacity-50"
          disabled={chatMutation.isPending || !inputText.trim()}
        >
          <span>Yuborish</span>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
