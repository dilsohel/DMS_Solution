import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Printer,
  ChevronRight,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { Sale } from '../types';
import { QuickActionsFAB } from '../components/QuickActionsFAB';
import { SaleEntryModal } from '../components/SaleEntryModal';
import { RecentActivitySummary } from '../components/RecentActivitySummary';
import { WeeklySalesTrendChart } from '../components/WeeklySalesTrendChart';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onViewInvoice: (sale: Sale) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onViewInvoice }) => {
  const { currentBusiness } = useAuth();
  const { metrics, sales, purchases, expenses, products } = useBusiness();
  const currency = currentBusiness?.currency || '৳';

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  // Calculate 6 months sales and profit trend
  const salesChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    
    // Last 6 months labels
    const labels: string[] = [];
    const salesValues: number[] = [];
    const profitValues: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonthIndex - i + 12) % 12;
      labels.push(months[mIdx]);
      
      // Calculate real totals for this month
      let mSales = 0;
      let mProfit = 0;
      sales.forEach((s) => {
        const d = new Date(s.createdAt);
        if (d.getMonth() === mIdx) {
          mSales += s.total || 0;
          let cost = 0;
          s.items?.forEach((it) => (cost += (it.purchasePrice || 0) * (it.quantity || 0)));
          mProfit += (s.total || 0) - cost;
        }
      });
      salesValues.push(mSales);
      profitValues.push(mProfit);
    }

    return {
      labels,
      datasets: [
        {
          label: `Sales (${currency})`,
          data: salesValues,
          backgroundColor: '#0284c7', // Sky Blue
          borderRadius: 6,
        },
        {
          label: `Gross Profit (${currency})`,
          data: profitValues,
          backgroundColor: '#059669', // Emerald Green
          borderRadius: 6,
        },
      ],
    };
  }, [sales, currency]);

  // Expenses chart data
  const expenseChartData = useMemo(() => {
    const catMap: Record<string, number> = {};
    expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + (e.amount || 0);
    });

    const labels = Object.keys(catMap);
    const data = Object.values(catMap);

    if (labels.length === 0) {
      return {
        labels: ['No Expenses'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#e2e8f0'],
          },
        ],
      };
    }

    const colors = [
      '#059669', '#0284c7', '#f59e0b', '#e11d48',
      '#7c3aed', '#db2777', '#0891b2', '#65a30d',
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
        },
      ],
    };
  }, [expenses]);

  const recentSales = sales.slice(0, 5);
  const lowStockItems = products.filter((p) => p.currentStock <= p.minStockAlert).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome & Business Header Banner */}
      <div className="bg-gradient-to-r from-sky-50/80 via-white to-emerald-50/60 border border-sky-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {currentBusiness?.businessType || 'Business Dashboard'}
            </span>
            <span className="text-xs text-slate-500 font-medium">Fiscal Year: {currentBusiness?.financialYear || '2026-2027'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentBusiness?.name}
          </h1>
          <p className="text-xs text-slate-600 font-normal">
            Welcome back, <strong className="text-slate-800">{currentBusiness?.ownerName}</strong>. Here is your live business financial performance.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSaleModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>New Sale</span>
          </button>
          <button
            onClick={() => onNavigate('purchases')}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-sky-600" />
            <span>New Purchase</span>
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Quick Summary of Recent Activity Component */}
      <RecentActivitySummary
        sales={sales}
        purchases={purchases}
        products={products}
        expenses={expenses}
        currency={currency}
        onNavigate={onNavigate}
        onViewInvoice={onViewInvoice}
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition-all shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</div>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {currency}{metrics.totalSales.toLocaleString()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] border-t border-slate-100 pt-3">
            <span className="text-slate-500">Today's Sales:</span>
            <span className="font-bold text-emerald-700 font-mono">
              {currency}{metrics.todaySales.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition-all shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Business Profit</div>
              <div className={`text-2xl font-black mt-1 font-mono ${metrics.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {currency}{metrics.netProfit.toLocaleString()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] border-t border-slate-100 pt-3">
            <span className="text-slate-500">Gross Profit:</span>
            <span className="font-bold text-slate-800 font-mono">
              {currency}{metrics.grossProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Total Purchases Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition-all shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Purchases</div>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {currency}{metrics.totalPurchases.toLocaleString()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] border-t border-slate-100 pt-3">
            <span className="text-slate-500">Total Expenses:</span>
            <span className="font-bold text-amber-700 font-mono">
              {currency}{metrics.totalExpenses.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Receivables & Dues Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition-all shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Dues (Receivable)</div>
              <div className="text-2xl font-black text-amber-700 mt-1 font-mono">
                {currency}{metrics.totalReceivables.toLocaleString()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] border-t border-slate-100 pt-3">
            <span className="text-slate-500">Supplier Payables:</span>
            <span className="font-bold text-rose-700 font-mono">
              {currency}{metrics.totalPayables.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Liquidity & Inventory Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Cash in Hand</div>
            <div className="text-lg font-bold text-emerald-700 font-mono">
              {currency}{metrics.cashBalance.toLocaleString()}
            </div>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg font-semibold border border-emerald-100">
            Cash
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Bank & MFS Balance</div>
            <div className="text-lg font-bold text-sky-700 font-mono">
              {currency}{(metrics.bankBalance + metrics.mfsBalance).toLocaleString()}
            </div>
          </div>
          <span className="text-xs bg-sky-50 text-sky-800 px-2 py-0.5 rounded-lg font-semibold border border-sky-100">
            Bank/bKash
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Total Products</div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {metrics.totalProducts} items
            </div>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-semibold border border-slate-200">
            Catalog
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Stock Valuation (Cost)</div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {currency}{metrics.inventoryValue.toLocaleString()}
            </div>
          </div>
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg font-semibold border border-purple-100">
            Assets
          </span>
        </div>
      </div>

      {/* Weekly Sales Trends (Recharts) */}
      <WeeklySalesTrendChart sales={sales} currency={currency} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales & Profit Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Sales & Gross Profit</h3>
              <p className="text-xs text-slate-500">Performance overview across the past 6 months</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-sky-700 hover:text-sky-900 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>Full Reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 sm:h-72">
            <Bar
              data={salesChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { color: '#334155', font: { size: 11, weight: 'bold' } },
                  },
                },
                scales: {
                  x: { ticks: { color: '#64748b' }, grid: { display: false } },
                  y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(226, 232, 240, 0.7)' } },
                },
              }}
            />
          </div>
        </div>

        {/* Expense Breakdown Doughnut */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Expense Breakdown</h3>
                <p className="text-xs text-slate-500">Total: {currency}{metrics.totalExpenses.toLocaleString()}</p>
              </div>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="h-48 relative flex items-center justify-center my-4">
              <Doughnut
                data={expenseChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#334155', font: { size: 10, weight: 'bold' }, boxWidth: 10 },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 text-center">
            <button
              onClick={() => onNavigate('expenses')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              + Record Business Expense
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Low Stock Alert & Recent Sales Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low Stock Notifications */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="text-base font-bold text-slate-900">Low-Stock Alerts</h3>
            </div>
            <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded-full">
              {metrics.lowStockCount} Items
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <p>All product inventory levels are currently healthy!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{prod.name}</div>
                    <div className="text-[11px] text-slate-500">
                      SKU: {prod.sku} · Alert limit: {prod.minStockAlert} {prod.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-rose-600 font-mono">
                      {prod.currentStock} {prod.unit} left
                    </div>
                    <button
                      onClick={() => onNavigate('purchases')}
                      className="text-[10px] text-emerald-700 hover:underline font-bold mt-0.5 block cursor-pointer"
                    >
                      Restock Bill →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <button
              onClick={() => onNavigate('products')}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>View full inventory catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Invoices Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Sales Invoices</h3>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
            >
              All Invoices ({sales.length})
            </button>
          </div>

          {recentSales.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <p>No sales recorded yet. Click below to create your first invoice.</p>
              <button
                onClick={() => onNavigate('sales')}
                className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Create Invoice
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5">Invoice #</th>
                    <th className="pb-2.5">Customer</th>
                    <th className="pb-2.5 text-right">Total</th>
                    <th className="pb-2.5 text-center">Status</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSales.map((s) => (
                    <tr key={s.id} className="hover:bg-sky-50/30 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-900">{s.invoiceNo}</td>
                      <td className="py-3">
                        <div className="text-slate-800 font-semibold">{s.customerName}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900">
                        {currency}{s.total.toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        {s.dueAmount <= 0 ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                            Paid
                          </span>
                        ) : s.paidAmount > 0 ? (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                            Partial ({currency}{s.dueAmount})
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded-full">
                            Due
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onViewInvoice(s)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="View & Print Invoice"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Floating Quick Actions Speed Dial */}
      <QuickActionsFAB onViewInvoice={onViewInvoice} onNavigate={onNavigate} />

      {/* Direct Sale Entry Modal from Dashboard Header */}
      <SaleEntryModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSaleCompleted={(sale) => {
          setIsSaleModalOpen(false);
          onViewInvoice(sale);
        }}
      />
    </div>
  );
};
