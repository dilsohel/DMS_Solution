import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Globe,
  Trash2,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Lightbulb,
  Zap,
  BrainCircuit,
  Briefcase,
  Copy,
  Check,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  searchQueries?: string[];
  sources?: Array<{ title: string; uri: string }>;
}

export type AssistantRole = 'general' | 'financial' | 'speed';

interface GeminiChatbotProps {
  isFloating?: boolean;
  onClose?: () => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ isFloating = false, onClose }) => {
  const { currentBusiness } = useAuth();
  const { metrics, products, sales, purchases } = useBusiness();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('dms_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I am your **DMS AI Business Copilot**. I have live context for **${
          currentBusiness?.name || 'your business'
        }**.\n\nYou can ask me about stock replenishment, cash flow, debt collection, or toggle **Google Search Grounding** to research live market prices and supplier benchmarks.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AssistantRole>('general');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('dms_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Model and role configurations based on requirements
  const roleConfig = {
    general: {
      name: 'Business Copilot',
      model: 'gemini-3.8-flash',
      icon: Briefcase,
      color: 'text-emerald-700 bg-emerald-100',
      description: 'General inventory, sales strategies, and store management (gemini-3.8-flash)',
      systemInstruction:
        'You are an expert SME and retail business management advisor for DMS Solution. Give practical, numbers-grounded advice for store owners, wholesalers, and inventory managers.',
    },
    financial: {
      name: 'Financial Analyst',
      model: 'gemini-4-argon',
      icon: BrainCircuit,
      color: 'text-sky-700 bg-sky-100',
      description: 'Deep financial analysis, margin calculation, and complex forecasting (gemini-4-argon)',
      systemInstruction:
        'You are a senior financial analyst and controller for commercial enterprises. Specialize in cash flow projections, working capital optimization, cost-of-goods-sold analysis, and debt recovery strategies.',
    },
    speed: {
      name: 'Fast Operations',
      model: 'gemini-3.1-flash-lite',
      icon: Zap,
      color: 'text-amber-700 bg-amber-100',
      description: 'Ultra-fast operational answers and formula shortcuts (gemini-3.1-flash-lite)',
      systemInstruction:
        'You are a high-speed operational assistant for point-of-sale staff and cashiers. Keep responses rapid, concise, and focused on operational formulas and procedures.',
    },
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Prepare live business context
    const businessContext = {
      name: currentBusiness?.name,
      type: currentBusiness?.businessType,
      currency: currentBusiness?.currency || '৳',
      totalSales: metrics.totalSales,
      todaySales: metrics.todaySales,
      netProfit: metrics.netProfit,
      receivables: metrics.totalReceivables,
      payables: metrics.totalPayables,
      lowStockCount: metrics.lowStockCount,
      cashBalance: metrics.cashBalance,
      bankBalance: metrics.bankBalance + metrics.mfsBalance,
    };

    // When search is enabled, force gemini-3.8-flash as required for Google Search Grounding
    const activeModel = enableSearch ? 'gemini-3.8-flash' : roleConfig[selectedRole].model;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemInstruction: roleConfig[selectedRole].systemInstruction,
          model: activeModel,
          enableSearch,
          businessContext,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        searchQueries: data.searchQueries,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: `⚠️ Could not complete request: ${err.message || 'Network error'}. Please verify the server connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('dms_chat_history');
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        content: `Chat history cleared. How can I assist **${currentBusiness?.name || 'your business'}** today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    `How can I speed up recovery of ${currentBusiness?.currency || '৳'}${metrics.totalReceivables.toLocaleString()} in customer dues?`,
    `Review my ${metrics.lowStockCount} low-stock products and suggest a reorder plan.`,
    `What are the latest wholesale market price trends for staple retail commodities in Bangladesh?`,
    `Recommend 3 actionable steps to increase my net profit margin this month.`,
  ];

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col overflow-hidden transition-all ${
        isFloating ? 'h-[600px] w-[420px] max-w-[95vw]' : 'h-[750px] w-full'
      }`}
    >
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold tracking-tight">DMS AI Copilot</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                {enableSearch ? 'Search Grounded' : roleConfig[selectedRole].model}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 truncate max-w-[220px]">
              {currentBusiness?.name || 'Live Business Assistant'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleClearHistory}
            title="Clear Chat History"
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isFloating && onClose && (
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Role & Search Controls Bar */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Role Selector Tabs */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200">
          {(['general', 'financial', 'speed'] as AssistantRole[]).map((r) => {
            const cfg = roleConfig[r];
            const Icon = cfg.icon;
            const isSelected = selectedRole === r;
            return (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={cfg.description}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cfg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Google Search Grounding Toggle */}
        <label className="flex items-center space-x-2 bg-white px-2.5 py-1 rounded-xl border border-slate-200 cursor-pointer select-none">
          <Globe
            className={`w-3.5 h-3.5 transition-colors ${
              enableSearch ? 'text-sky-600 animate-pulse' : 'text-slate-400'
            }`}
          />
          <span className="font-semibold text-slate-700 text-[11px]">Google Search</span>
          <input
            type="checkbox"
            checked={enableSearch}
            onChange={(e) => setEnableSearch(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs transition-all relative group ${
                m.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
              }`}
            >
              {/* Copy message button */}
              <button
                onClick={() => copyToClipboard(m.content, m.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-opacity cursor-pointer"
                title="Copy text"
              >
                {copiedId === m.id ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>

              {/* Message text with basic paragraph formatting */}
              <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                {m.content}
              </div>

              {/* Grounding Sources & Search Queries */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-bold text-sky-700 flex items-center space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>Grounding Web Sources:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.sources.slice(0, 4).map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 text-[10px] font-medium border border-sky-200 transition-colors"
                      >
                        <span className="truncate max-w-[150px]">{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp & Metadata Footer */}
              <div
                className={`mt-1.5 text-[9px] flex items-center justify-between ${
                  m.role === 'user' ? 'text-emerald-100' : 'text-slate-400'
                }`}
              >
                <span>{m.timestamp}</span>
                {m.modelUsed && <span className="font-mono">{m.modelUsed}</span>}
              </div>
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-xs text-xs flex items-center space-x-2 text-slate-600">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>
                {enableSearch
                  ? 'Searching Google & grounding analysis...'
                  : `Thinking with ${roleConfig[selectedRole].model}...`}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length <= 3 && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/60">
          <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center space-x-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Suggested prompts:</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Composer */}
      <div className="p-3.5 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={
              enableSearch
                ? 'Ask anything with Google Search Grounding...'
                : `Ask ${roleConfig[selectedRole].name}...`
            }
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs transition-all placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
