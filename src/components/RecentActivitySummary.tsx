import React, { useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  AlertCircle,
  FileText,
  ShoppingBag,
  ArrowRight,
  Printer,
  CheckCircle2,
  Calendar,
  Sparkles,
  PackageCheck,
} from 'lucide-react';
import { Sale, Purchase, Product, Expense } from '../types';

interface RecentActivitySummaryProps {
  sales: Sale[];
  purchases: Purchase[];
  products: Product[];
  expenses: Expense[];
  currency: string;
  onNavigate: (view: string) => void;
  onViewInvoice: (sale: Sale) => void;
}

export const RecentActivitySummary: React.FC<RecentActivitySummaryProps> = ({
  sales,
  purchases,
  products,
  currency,
  onNavigate,
  onViewInvoice,
}) => {
  // Activity calculations
  const activityData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Sales today
    const salesToday = sales.filter((s) => {
      const d = new Date(s.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    const todaySalesRevenue = salesToday.reduce((sum, s) => sum + (s.total || 0), 0);

    // 2. Pending Invoices (Partial or Due)
    const pendingSales = sales.filter(
      (s) => s.status === 'due' || s.status === 'partial' || (s.dueAmount && s.dueAmount > 0)
    );
    const totalPendingAmount = pendingSales.reduce((sum, s) => sum + (s.dueAmount || 0), 0);

    // 3. Purchases today
    const purchasesToday = purchases.filter((p) => {
      const d = new Date(p.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    const todayPurchasesAmount = purchasesToday.reduce((sum, p) => sum + (p.total || 0), 0);

    // 4. Low stock products
    const lowStockItems = products.filter(
      (p) => p.currentStock <= (p.minStockAlert || 5)
    );

    // 5. Recent 4 activity events combining sales and purchases
    const recentFeed = [
      ...sales.map((s) => ({
        id: s.id,
        type: 'sale' as const,
        title: `Invoice #${s.invoiceNo || s.id.slice(0, 6)}`,
        subtitle: s.customerName || 'Walk-in Customer',
        amount: s.total,
        due: s.dueAmount || 0,
        status: s.status,
        timestamp: new Date(s.createdAt),
        raw: s,
      })),
      ...purchases.map((p) => ({
        id: p.id,
        type: 'purchase' as const,
        title: `Purchase #${p.invoiceNo || p.id.slice(0, 6)}`,
        subtitle: p.supplierName || 'General Supplier',
        amount: p.total,
        due: p.dueAmount || 0,
        status: p.status,
        timestamp: new Date(p.createdAt),
        raw: p,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 4);

    return {
      salesTodayCount: salesToday.length,
      todaySalesRevenue,
      pendingCount: pendingSales.length,
      totalPendingAmount,
      purchasesTodayCount: purchasesToday.length,
      todayPurchasesAmount,
      lowStockCount: lowStockItems.length,
      recentFeed,
    };
  }, [sales, purchases, products]);

  // Format relative time helper
  const formatTimeAgo = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-slate-300/80 transition-all">
      {/* Header with Live Pulse */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Quick Activity & Operations Summary
              </h2>
              <span className="flex items-center space-x-1 text-[10px] font-semibold bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Live Insights</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Immediate operational status upon your current login session
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* 4 Quick Summary Pulse Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
        {/* Metric 1: Sales Today */}
        <div
          onClick={() => onNavigate('sales')}
          className="group relative p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-100/80 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sales Today</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {activityData.salesTodayCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {activityData.salesTodayCount === 1 ? 'new sale' : 'new sales'}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Revenue:</span>
            <span className="font-bold text-emerald-700 font-mono text-[11px]">
              {currency}
              {activityData.todaySalesRevenue.toLocaleString()}
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-emerald-100/50 flex items-center justify-between text-[11px] font-semibold text-emerald-700 group-hover:text-emerald-800">
            <span>View All Sales</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Metric 2: Pending Invoices */}
        <div
          onClick={() => onNavigate('sales')}
          className="group relative p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 to-white border border-amber-100/80 hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Invoices</span>
            </span>
            {activityData.pendingCount > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                Action
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-700 font-mono">
              {activityData.pendingCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {activityData.pendingCount === 1 ? 'due invoice' : 'due invoices'}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Total Due:</span>
            <span className="font-bold text-rose-600 font-mono text-[11px]">
              {currency}
              {activityData.totalPendingAmount.toLocaleString()}
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-amber-100/50 flex items-center justify-between text-[11px] font-semibold text-amber-800 group-hover:text-amber-900">
            <span>Collect Customer Dues</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Metric 3: Purchases Today */}
        <div
          onClick={() => onNavigate('purchases')}
          className="group relative p-4 rounded-2xl bg-gradient-to-br from-sky-50/60 to-white border border-sky-100/80 hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 flex items-center space-x-1">
              <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
              <span>Purchases Today</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {activityData.purchasesTodayCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {activityData.purchasesTodayCount === 1 ? 'purchase order' : 'purchases'}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Billed:</span>
            <span className="font-bold text-sky-700 font-mono text-[11px]">
              {currency}
              {activityData.todayPurchasesAmount.toLocaleString()}
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-sky-100/50 flex items-center justify-between text-[11px] font-semibold text-sky-700 group-hover:text-sky-800">
            <span>Manage Purchases</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Metric 4: Low Stock Warnings */}
        <div
          onClick={() => onNavigate('products')}
          className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
            activityData.lowStockCount > 0
              ? 'bg-gradient-to-br from-rose-50/60 to-white border-rose-200/80 hover:border-rose-300 hover:shadow-xs'
              : 'bg-gradient-to-br from-slate-50 to-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                activityData.lowStockCount > 0 ? 'text-rose-800' : 'text-slate-700'
              }`}
            >
              <AlertCircle className={`w-3.5 h-3.5 ${activityData.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-500'}`} />
              <span>Low Stock Alert</span>
            </span>
            {activityData.lowStockCount > 0 && (
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded-full">
                Attention
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span
              className={`text-2xl font-black font-mono ${
                activityData.lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {activityData.lowStockCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {activityData.lowStockCount === 1 ? 'item low' : 'items low'}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Inventory status:</span>
            <span
              className={`font-bold text-[11px] ${
                activityData.lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {activityData.lowStockCount > 0 ? 'Stock refill needed' : 'All stocks healthy'}
            </span>
          </div>
          <div
            className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-semibold ${
              activityData.lowStockCount > 0
                ? 'border-rose-100/50 text-rose-700 group-hover:text-rose-800'
                : 'border-slate-100 text-slate-700 group-hover:text-slate-900'
            }`}
          >
            <span>Review Products</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Mini Recent Activity Stream */}
      {activityData.recentFeed.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Latest Transactions</span>
            </span>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>Full Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activityData.recentFeed.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-200 transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'sale'
                        ? 'bg-emerald-100/80 text-emerald-700'
                        : 'bg-sky-100/80 text-sky-700'
                    }`}
                  >
                    {item.type === 'sale' ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <ShoppingBag className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 truncate text-[11px]">
                      {item.title} • {item.subtitle}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatTimeAgo(item.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-right shrink-0">
                  <div>
                    <div className="font-bold text-slate-900 font-mono text-xs">
                      {currency}
                      {item.amount.toLocaleString()}
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                        item.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {item.type === 'sale' && (
                    <button
                      onClick={() => onViewInvoice(item.raw as Sale)}
                      title="View / Print Invoice"
                      className="p-1 hover:bg-slate-200/80 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
