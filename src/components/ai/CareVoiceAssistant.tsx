import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  PhoneCall,
  Volume2,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { useCareOS } from '../../services/store';
import { askCareVoiceAssistant } from '../../services/geminiService';

export const CareVoiceAssistant: React.FC = () => {
  const { doctors, queueEntries } = useCareOS();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<
    Array<{
      role: 'user' | 'assistant';
      text: string;
      toolExecuted?: string;
      timestamp: string;
    }>
  >([
    {
      role: 'assistant',
      text: 'Namaste! I am CareVoice, the AI operational queue assistant for CareOS at NSRIT Medical Center, Visakhapatnam. How may I assist your appointment scheduling or queue inquiries today?',
      timestamp: '09:30 AM',
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Speech Recognition
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not directly supported in this browser. Please type your query below.');
      return;
    }
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (userPrompt?: string) => {
    const promptToSend = userPrompt || inputMessage;
    if (!promptToSend.trim()) return;

    const timeStr = '09:31 AM';
    const userMsg = {
      role: 'user' as const,
      text: promptToSend.trim(),
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    const context = {
      hospital: 'CareOS NSRIT Medical Center, Visakhapatnam',
      availableDoctors: doctors.map((d) => ({
        name: d.name,
        dept: d.department,
        room: d.roomNumber,
        status: d.status,
        delayMinutes: d.delayMinutes,
      })),
      activeQueueLength: queueEntries.filter((q) => q.state === 'WAITING').length,
    };

    const response = await askCareVoiceAssistant({
      message: promptToSend,
      context,
      history: messages.map((m) => ({ role: m.role, text: m.text })),
      language,
    });

    let toolExecutedText = '';
    if (response.toolCalls && response.toolCalls.length > 0) {
      toolExecutedText = response.toolCalls.map((t) => `Executed Tool: ${t.name}`).join(', ');
    }

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: response.text,
        toolExecuted: toolExecutedText || undefined,
        timestamp: timeStr,
      },
    ]);

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response.text.slice(0, 160));
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }

    setIsLoading(false);
  };

  const sampleChips = [
    'Check Cardiology queue & Dr. Sharma availability',
    'What is the wait time for Orthopedics right now?',
    'Explain the delay in OPD-102',
    'Book appointment for Sunita in Pediatrics',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#E8F7F3] border border-[#0F9D8A]/30 flex items-center justify-center text-[#0F9D8A]">
            <PhoneCall className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#243746]">CareVoice — Conversational AI Agent</h2>
              <span className="text-[11px] font-mono text-[#0F9D8A] bg-[#E8F7F3] px-2 py-0.5 rounded border border-[#0F9D8A]/30 font-semibold">
                Gemini 3.8 Flash Powered
              </span>
            </div>
            <p className="text-xs text-[#536B7E]">
              Voice and text outpatient assistant for queue verification, delay explanations, and scheduling.
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 bg-[#F8FCFB] p-1 rounded-lg border border-slate-200 text-xs">
          <Globe className="w-3.5 h-3.5 text-[#0F9D8A] ml-1.5 mr-0.5" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              language === 'en' ? 'bg-[#0F9D8A] text-white shadow-xs' : 'text-[#536B7E] hover:text-[#243746]'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('te')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              language === 'te' ? 'bg-[#0F9D8A] text-white shadow-xs' : 'text-[#536B7E] hover:text-[#243746]'
            }`}
          >
            Telugu (తెలుగు)
          </button>
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#F8FCFB]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-[#E8F7F3] border border-[#0F9D8A]/30 flex items-center justify-center text-[#0F9D8A] shrink-0 font-bold">
                  CV
                </div>
              )}

              <div
                className={`max-w-[82%] p-3.5 rounded-xl space-y-1.5 ${
                  m.role === 'user'
                    ? 'bg-[#0F9D8A] text-white font-medium shadow-xs'
                    : 'bg-white text-[#243746] border border-slate-200 shadow-xs'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                {m.toolExecuted && (
                  <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-[#0F9D8A] font-mono font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{m.toolExecuted}</span>
                  </div>
                )}
                <span
                  className={`text-[9px] block text-right font-mono ${
                    m.role === 'user' ? 'text-white/80' : 'text-[#536B7E]'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-[#E8F7F3] border border-[#0F9D8A]/30 flex items-center justify-center text-[#0F9D8A] shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-[#0F9D8A]" />
              </div>
              <div className="p-3 bg-white text-[#536B7E] rounded-xl border border-slate-200 animate-pulse shadow-xs">
                CareVoice reasoning with live hospital queue engine...
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Voice Waveform Activity if listening */}
        {isListening && (
          <div className="p-3 bg-[#E8F7F3] border-t border-[#0F9D8A]/20 flex items-center justify-center gap-1.5">
            <span className="text-xs text-[#0F9D8A] font-mono mr-2 animate-pulse font-bold">
              Listening to voice audio...
            </span>
            {[40, 75, 30, 90, 60, 45, 80, 25, 70].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h * 0.25}px` }}
                className="w-1 bg-[#0F9D8A] rounded-full animate-bounce"
              />
            ))}
          </div>
        )}

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-[#536B7E] shrink-0 font-medium">Try:</span>
          {sampleChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 rounded-md bg-[#F8FCFB] hover:bg-[#E8F7F3] text-[#243746] hover:text-[#0F9D8A] border border-slate-200 hover:border-[#0F9D8A]/30 whitespace-nowrap transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            onClick={toggleListening}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-50 border-rose-400 text-rose-600 animate-pulse'
                : 'bg-[#F8FCFB] border-slate-200 text-[#536B7E] hover:text-[#0F9D8A] hover:border-[#0F9D8A]/40'
            }`}
            title="Toggle Voice Input"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder={
              language === 'te'
                ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి...'
                : 'Ask CareVoice about doctor schedules, waiting times, or appointments...'
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            className="flex-1 bg-[#F8FCFB] border border-slate-200 rounded-lg px-3 py-2 text-xs text-[#243746] placeholder-slate-400 outline-none focus:border-[#0F9D8A] focus:bg-white"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] disabled:opacity-40 text-white font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
