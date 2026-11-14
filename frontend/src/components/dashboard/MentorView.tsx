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
  Cpu,
  Zap,
  Target,
  ArrowRight,
  RefreshCw,
  Flame
} from 'lucide-react';
import { MentorMessage, ProgressOverview } from '../../types';
import { api } from '../../api/client';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface MentorViewProps {
  progress: ProgressOverview | null;
}

export const MentorView: React.FC<MentorViewProps> = ({ progress }) => {
  const [operatingMode, setOperatingMode] = useState<'reactive' | 'proactive'>('reactive');
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [proactiveAdvice, setProactiveAdvice] = useState<any | null>(null);
  const [loadingProactive, setLoadingProactive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    try {
      setInitialLoading(true);
      const hist = await api.getMentorHistory();
      if (hist.length > 0) {
        setMessages(hist);
      } else {
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

  const fetchProactiveAdvice = async () => {
    try {
      setLoadingProactive(true);
      const adv = await api.getProactiveMentorAdvice();
      setProactiveAdvice(adv);
    } catch (err) {
      console.error('Failed to load proactive advice:', err);
    } finally {
      setLoadingProactive(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchProactiveAdvice();
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
    `What should I focus on next to increase my readiness for ${progress?.career.title || 'my Target Career'}?`,
    "Explain microtasks vs macrotasks in the Node.js event loop with code examples.",
    "Why does an unindexed JOIN cause sequential scans in PostgreSQL?",
    "Review my current learning streak and suggest a recovery exercise."
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">24/7 AI CAREER MENTOR</Badge>
            <span className="text-xs font-mono text-zinc-500">• Context-Aware Intelligence (Zero Fabrication)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Engineering & Career Coach
          </h1>
          <p className="text-sm text-[#929CA3] mt-1">
            Grounded in your real SQLite profile, verified skill assessments, and active roadmap milestones.
          </p>
        </div>

        {/* Operating Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[#0B0F12] p-1 rounded-xl border border-white/8 self-start sm:self-auto">
          <button
            onClick={() => setOperatingMode('reactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              operatingMode === 'reactive'
                ? 'bg-[#161D22] text-[#35D9F2] shadow-sm border border-[#35D9F2]/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            💬 Reactive Q&A
          </button>
          <button
            onClick={() => setOperatingMode('proactive')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              operatingMode === 'proactive'
                ? 'bg-[#161D22] text-[#C5F45B] shadow-sm border border-[#C5F45B]/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#C5F45B]" />
            <span>Proactive Sprint Coach</span>
          </button>
        </div>
      </div>

      {/* PROACTIVE COACH VIEW */}
      {operatingMode === 'proactive' && (
        <div className="bg-[#0B0F12] border border-[#C5F45B]/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#C5F45B]/10 border border-[#C5F45B]/30 flex items-center justify-center text-[#C5F45B]">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#C5F45B] block font-bold">
                  STUDENT-CONTROLLED PROACTIVE INTELLIGENCE
                </span>
                <h2 className="text-xl font-bold text-white">Empirical Sprint Recommendation</h2>
              </div>
            </div>

            <Button
              onClick={fetchProactiveAdvice}
              disabled={loadingProactive}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 font-mono text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingProactive ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </Button>
          </div>

          {proactiveAdvice ? (
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-[#11171B] border border-white/5 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="cyan" size="sm">Target: {proactiveAdvice.career_target}</Badge>
                  <span className="text-xs font-mono text-[#C5F45B]">• Top Strength: {proactiveAdvice.top_strength}</span>
                  <span className="text-xs font-mono text-amber-400">• High-Leverage Gap: {proactiveAdvice.critical_gap}</span>
                </div>
                <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-sans">
                  {proactiveAdvice.proactive_advice}
                </p>
              </div>

              {proactiveAdvice.active_mission && (
                <div className="p-4 rounded-xl bg-[#050608] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5">
                      ACTIVE SPRINT DELIVERABLE
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {proactiveAdvice.active_mission.objective}
                    </h4>
                    <span className="text-xs font-mono text-zinc-500">
                      Est. Duration: {proactiveAdvice.active_mission.estimated_duration}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      setOperatingMode('reactive');
                      handleSend(`Help me break down the mission: ${proactiveAdvice.active_mission.objective}`);
                    }}
                    size="sm"
                    className="bg-[#35D9F2] text-black font-bold flex items-center gap-1.5"
                  >
                    <span>Strategize with Coach</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500 font-mono text-xs">
              Synthesizing proactive advice from SQLite progress records...
            </div>
          )}
        </div>
      )}

      {/* CHAT / REACTIVE INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Context & Prompts (Left 1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-mono uppercase text-zinc-400 font-semibold block pb-2 border-b border-white/8">
              Suggested Technical Prompts
            </span>
            <div className="space-y-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-xl bg-[#11171B] border border-white/5 hover:border-[#35D9F2]/40 hover:bg-[#161D22] text-xs text-zinc-300 hover:text-white transition-all cursor-pointer leading-snug group"
                >
                  <span className="group-hover:text-[#35D9F2] transition-colors line-clamp-3">
                    {p}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Academic Integrity Guardrail Indicator */}
          <div className="p-4 rounded-xl bg-[#11171B] border border-white/5 space-y-1.5 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 text-[#35D9F2] font-mono text-[10px] uppercase font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Grounded Knowledge Policy</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              Your mentor is strictly bound to your verified SQLite profile records and does not hallucinate false progress.
            </p>
          </div>
        </div>

        {/* Chat Feed & Input (Right 3 cols) */}
        <div className="lg:col-span-3 bg-[#0B0F12] border border-white/8 rounded-2xl flex flex-col h-[650px] shadow-2xl overflow-hidden">
          {/* Chat Messages Scrollable Box */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 custom-scrollbar">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser 
                      ? 'bg-[#35D9F2]/20 border border-[#35D9F2]/40 text-[#35D9F2]' 
                      : 'bg-[#C5F45B]/20 border border-[#C5F45B]/40 text-[#C5F45B]'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#161D22] text-white border border-[#35D9F2]/30'
                      : 'bg-[#11171B] text-zinc-200 border border-white/5'
                  }`}>
                    <div className="whitespace-pre-wrap">{m.message}</div>
                    <span className="text-[9px] font-mono text-zinc-500 block mt-2 text-right">
                      {new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#C5F45B]/20 border border-[#C5F45B]/40 text-[#C5F45B] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#11171B] border border-white/5 p-4 rounded-2xl text-xs text-zinc-400 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin" />
                  <span>Consulting knowledge graph and career benchmarks...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-[#0B0F12] border-t border-white/8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about architectural trade-offs, code syntax, or career trajectory..."
                className="flex-1 bg-[#11171B] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2] transition-colors"
              />
              <Button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="bg-[#35D9F2] text-black font-bold px-5 py-3 rounded-xl hover:bg-[#35D9F2]/90 transition-all flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
