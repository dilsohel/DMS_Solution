import React from 'react';
import {
  Sparkles,
  Bot,
  Globe,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { GeminiChatbot } from '../components/GeminiChatbot';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';

export const AICopilotView: React.FC = () => {
  const { currentBusiness } = useAuth();
  const { metrics, products } = useBusiness();
  const currency = currentBusiness?.currency || '৳';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Gemini AI & Google Search
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Multi-Role Intelligent Assistant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            DMS AI Business Copilot
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Powered by Google Gemini models with live Google Search Grounding. Analyze store financials, forecast inventory, and query up-to-date market rates.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Business</div>
            <div className="text-sm font-bold text-white truncate max-w-[160px]">
              {currentBusiness?.name}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Chatbot + Context Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Thread Interface */}
        <div className="lg:col-span-8">
          <GeminiChatbot />
        </div>

        {/* Live Business Context Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Context Attached
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Gemini automatically uses these numbers from your active business database to contextualize its answers:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Total Sales:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {currency}{metrics.totalSales.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Customer Dues:</span>
                <span className="font-bold text-amber-700 font-mono">
                  {currency}{metrics.totalReceivables.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Net Profit:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {currency}{metrics.netProfit.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Low Stock Items:</span>
                <span className="font-bold text-rose-600 font-mono">
                  {metrics.lowStockCount} products
                </span>
              </div>
            </div>
          </div>

          {/* Model Roles Guide */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Specialized AI Roles
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
                <div className="font-bold text-emerald-900 text-[11px]">
                  Business Copilot (gemini-3.8-flash)
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  Best for inventory turn rates, customer retention, sales promotions, and general store operations.
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-sky-100 bg-sky-50/50">
                <div className="font-bold text-sky-900 text-[11px]">
                  Financial Analyst (gemini-4-argon)
                </div>
                <div className="text-[11px] text-sky-700 mt-0.5">
                  Deep reasoning for margin projections, capital allocation, supplier payment scheduling, and tax estimates.
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/50">
                <div className="font-bold text-amber-900 text-[11px]">
                  Fast Operations (gemini-3.1-flash-lite)
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  Instant calculation shortcuts, cashier lookup tips, and ultra-fast workflow procedures.
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-purple-100 bg-purple-50/50">
                <div className="font-bold text-purple-900 text-[11px] flex items-center space-x-1">
                  <Globe className="w-3 h-3 text-purple-700" />
                  <span>Google Search Grounding</span>
                </div>
                <div className="text-[11px] text-purple-700 mt-0.5">
                  Toggle on Google Search to pull verified real-time commodity prices and market benchmarks directly from the web.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
