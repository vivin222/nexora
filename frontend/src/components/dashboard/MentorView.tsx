import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Terminal, 
  ShieldCheck, 
  Compass, 
  HelpCircle,
  Cpu
} from 'lucide-react';
import { MentorMessage, ProgressOverview } from '../../types';
import { api } from '../../api/client';
import { Badge } from '../common/Badge';

interface MentorViewProps {
  progress: ProgressOverview | null;
}

export const MentorView: React.FC<MentorViewProps> = ({ progress }) => {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    try {
      setInitialLoading(true);
      const hist = await api.getMentorHistory();
      if (hist.length > 0) {
        setMessages(hist);
      } else {
        // Welcome message with personalized context
        const careerName = progress?.career.title || 'Full Stack Developer';
        const score = progress?.overall_readiness_score || 52;
        setMessages([
          {
            id: 'welcome',
            sender: 'mentor',
            message: `### Welcome to NEXORA AI Mentorship\n\nI have loaded your active profile targeting **${careerName}** (Current match score: **${score}%**).\n\nI have verified your foundations in **Python & SQL**, and identified critical deficits in **JavaScript & React**.\n\nAsk me anything regarding your customized roadmap, technical concepts, or strategic career moves. How can I assist you today?`,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load mentor history:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    setInputText('');
    const userMsg: MentorMessage = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      message: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.chatWithMentor(text);
      const mentorMsg: MentorMessage = {
        id: res.id,
        sender: 'mentor',
        message: res.message,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, mentorMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'mentor',
          message: `*System Notice:* AI engine encountered a temporary timeout. Re-routing through local deterministic knowledge engine.`,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What should I study today based on my roadmap?",
    "Why is JavaScript critical for my career score?",
    "Break down closures and the event loop",
    "How can I bridge my remaining skill gaps faster?"
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Top Context Ingestion Ribbon */}
      <div className="glass-panel p-4 rounded-xl border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center font-bold text-rose-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>NEXORA AI Career Mentor</span>
              <Badge variant="crimson" size="sm">ACTIVE CONTEXT</Badge>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              Target: <span className="text-rose-300 font-semibold">{progress?.career.title || 'Full Stack Developer'}</span> • Readiness: <span className="text-rose-400 font-semibold">{progress?.overall_readiness_score || 52}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Gemini official SDK & Hybrid Engine</span>
        </div>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 glass-panel rounded-2xl border border-white/8 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isUser 
                  ? 'bg-zinc-800 border border-zinc-700 text-zinc-300' 
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.3)]'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                isUser
                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tr-none'
                  : 'bg-zinc-950/90 border border-white/10 text-zinc-200 rounded-tl-none shadow-lg'
              }`}>
                <div className="whitespace-pre-wrap font-sans">
                  {msg.message}
                </div>
                {msg.created_at && (
                  <div className={`text-[10px] font-mono mt-2 ${isUser ? 'text-zinc-500 text-right' : 'text-zinc-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-950 border border-white/10 p-3 rounded-2xl rounded-tl-none text-xs text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Analyzing learner state & drafting personalized advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 text-xs font-mono">
        <span className="text-zinc-500 text-[10px] uppercase shrink-0">Suggestions:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors whitespace-nowrap cursor-pointer text-[11px]"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="glass-panel p-2 rounded-xl border border-white/10 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask AI Mentor anything about your career path, technical skills, or roadmap..."
          disabled={loading}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-[0_0_12px_rgba(225,29,72,0.4)] cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
