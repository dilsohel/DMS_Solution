import React, { useState, useMemo } from 'react';
import {
  Download,
  Printer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';

export const ReportsView: React.FC = () => {
  const { currentBusiness } = useAuth();
  const { sales, expenses, products, customers, accounts, metrics } = useBusiness();
  const currency = currentBusiness?.currency || '৳';

  const [reportType, setReportType] = useState<'PL' | 'BALANCE' | 'SALES' | 'STOCK' | 'DUES'>('PL');
  const [timeFilter, setTimeFilter] = useState<'TODAY' | 'MONTH' | 'YEAR' | 'ALL'>('MONTH');

  // Filtered Sales by time
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    return sales.filter((s) => {
      const sDate = new Date(s.createdAt);
      if (timeFilter === 'TODAY') {
        return s.createdAt.startsWith(todayStr);
      }
      if (timeFilter === 'MONTH') {
        return sDate.getFullYear() === curYear && sDate.getMonth() === curMonth;
      }
      if (timeFilter === 'YEAR') {
        return sDate.getFullYear() === curYear;
      }
      return true;
    });
  }, [sales, timeFilter]);

  // Filtered Expenses by time
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    return expenses.filter((e) => {
      const eDate = new Date(e.date);
      if (timeFilter === 'TODAY') {
        return e.date === todayStr;
      }
      if (timeFilter === 'MONTH') {
        return eDate.getFullYear() === curYear && eDate.getMonth() === curMonth;
      }
      if (timeFilter === 'YEAR') {
        return eDate.getFullYear() === curYear;
      }
      return true;
    });
  }, [expenses, timeFilter]);

  // Calculations for Profit & Loss
  const plStats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);

    // Cost of goods sold based on products sold in these sales
    let cogs = 0;
    filteredSales.forEach((s) => {
      s.items?.forEach((it) => {
        const prod = products.find((p) => p.id === it.productId);
        const cost = prod ? prod.purchasePrice : it.unitPrice * 0.7; // fallback margin
        cogs += cost * it.quantity;
      });
    });

    const grossProfit = totalRevenue - cogs;
    const totalExp = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExp;

    return {
      totalRevenue,
      cogs,
      grossProfit,
      totalExp,
      netProfit,
    };
  }, [filteredSales, filteredExpenses, products]);

  // Balance sheet
  const totalAssets = metrics.cashBalance + metrics.bankBalance + metrics.mfsBalance + metrics.totalReceivables + metrics.inventoryValue;
  const totalLiabilities = metrics.totalPayables;
  const equity = totalAssets - totalLiabilities;

  // CSV Export logic
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === 'PL') {
      csvContent += "Profit and Loss Statement\n";
      csvContent += `Business,${currentBusiness?.name}\n`;
      csvContent += `Period,${timeFilter}\n\n`;
      csvContent += `Metric,Amount (${currency})\n`;
      csvContent += `Total Sales Revenue,${plStats.totalRevenue}\n`;
      csvContent += `Cost of Goods Sold (COGS),${plStats.cogs}\n`;
      csvContent += `Gross Profit,${plStats.grossProfit}\n`;
      csvContent += `Operating Expenses,${plStats.totalExp}\n`;
      csvContent += `Net Profit,${plStats.netProfit}\n`;
    } else if (reportType === 'SALES') {
      csvContent += "Invoice No,Date,Customer,Total,Paid,Due,Status\n";
      filteredSales.forEach((s) => {
        csvContent += `"${s.invoiceNo}","${s.createdAt.split('T')[0]}","${s.customerName}",${s.total},${s.paidAmount},${s.dueAmount},"${s.status}"\n`;
      });
    } else if (reportType === 'STOCK') {
      csvContent += "Product,SKU,Category,Current Stock,Unit,Purchase Cost,Selling Price,Total Valuation\n";
      products.forEach((p) => {
        csvContent += `"${p.name}","${p.sku}","${p.category}",${p.currentStock},"${p.unit}",${p.purchasePrice},${p.sellingPrice},${p.currentStock * p.purchasePrice}\n`;
      });
    } else if (reportType === 'DUES') {
      csvContent += "Customer,Phone,Address,Total Purchases,Total Paid,Current Due\n";
      customers.forEach((c) => {
        csvContent += `"${c.name}","${c.phone}","${c.address || ''}",${c.totalPurchases},${c.totalPaid},${c.currentDue}\n`;
      });
    } else {
      csvContent += "Account / Item,Category,Amount\n";
      csvContent += `Total Assets,Assets,${totalAssets}\n`;
      csvContent += `Total Liabilities,Liabilities,${totalLiabilities}\n`;
      csvContent += `Owner Equity,Equity,${equity}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DMS_${reportType}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Reports & Statements</h1>
          <p className="text-xs text-slate-500">
            Real-time balance sheet, profit and loss statements, sales reports, and CSV data exports.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs for Reports */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-2xl overflow-x-auto text-xs">
          {[
            { id: 'PL', label: 'Profit & Loss' },
            { id: 'BALANCE', label: 'Balance Sheet' },
            { id: 'SALES', label: 'Sales Report' },
            { id: 'STOCK', label: 'Stock Valuation' },
            { id: 'DUES', label: 'Customer Dues' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                reportType === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Time Filter Pills */}
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-2xl text-xs">
          {[
            { id: 'TODAY', label: 'Today' },
            { id: 'MONTH', label: 'This Month' },
            { id: 'YEAR', label: 'This Year' },
            { id: 'ALL', label: 'All Time' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeFilter(t.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                timeFilter === t.id ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* REPORT CONTENT BODY */}
      {reportType === 'PL' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4 text-center">
            <h2 className="text-xl font-bold text-slate-900">Profit & Loss Statement</h2>
            <p className="text-xs text-slate-500 mt-1">
              {currentBusiness?.name} • Period: {timeFilter === 'TODAY' ? 'Today' : timeFilter === 'MONTH' ? 'Current Month' : timeFilter === 'YEAR' ? 'Fiscal Year' : 'All Time'}
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">1. Operating Revenue</div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Total Sales Gross Inflow:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {currency}{plStats.totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">2. Cost of Goods Sold (COGS)</div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Cost of Inventory Sold:</span>
                <span className="font-mono font-bold text-rose-600">
                  -{currency}{plStats.cogs.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between items-center p-4 bg-sky-50/50 rounded-2xl border border-sky-100 text-sm font-bold">
              <span className="text-slate-900">Gross Profit:</span>
              <span className={`font-mono text-base ${plStats.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {currency}{plStats.grossProfit.toLocaleString()}
              </span>
            </div>

            {/* Expenses */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">3. Operating Overhead Expenses</div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Shop Rent, Bills & Misc Expenses:</span>
                <span className="font-mono font-bold text-rose-600">
                  -{currency}{plStats.totalExp.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Net Profit */}
            <div className="flex justify-between items-center p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl border border-emerald-200 text-base font-extrabold shadow-2xs">
              <span className="text-slate-900">Net Business Profit (Bottom Line):</span>
              <span className={`font-mono text-xl ${plStats.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {currency}{plStats.netProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {reportType === 'BALANCE' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4 text-center">
            <h2 className="text-xl font-bold text-slate-900">Statement of Financial Position (Balance Sheet)</h2>
            <p className="text-xs text-slate-500 mt-1">
              {currentBusiness?.name} • As of {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Assets */}
            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="font-bold text-emerald-800 uppercase tracking-wider text-xs border-b border-slate-200 pb-2">
                Assets (What the Business Owns)
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span>Cash in Hand:</span>
                  <span className="font-mono font-semibold">{currency}{metrics.cashBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Bank Account Balances:</span>
                  <span className="font-mono font-semibold">{currency}{metrics.bankBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>bKash / Nagad MFS Balances:</span>
                  <span className="font-mono font-semibold">{currency}{metrics.mfsBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Accounts Receivable (Customer Dues):</span>
                  <span className="font-mono font-semibold text-amber-700">{currency}{metrics.totalReceivables.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Current Inventory Stock (Cost):</span>
                  <span className="font-mono font-semibold">{currency}{metrics.inventoryValue.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-bold text-emerald-700">
                <span>Total Assets:</span>
                <span className="font-mono">{currency}{totalAssets.toLocaleString()}</span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
              <div>
                <div className="font-bold text-rose-800 uppercase tracking-wider text-xs border-b border-slate-200 pb-2 mb-3">
                  Liabilities (What the Business Owes)
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Accounts Payable (Supplier Dues):</span>
                  <span className="font-mono font-semibold text-rose-600">{currency}{totalLiabilities.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-bold text-sky-800 uppercase tracking-wider text-xs border-b border-slate-200 pb-2 mb-3">
                  Owner's Capital & Retained Earnings
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Net Equity:</span>
                  <span className="font-mono font-semibold text-sky-700">{currency}{equity.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Liabilities + Equity:</span>
                <span className="font-mono">{currency}{(totalLiabilities + equity).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'SALES' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900">{filteredSales.length} Sales in Selected Range</span>
            <span className="font-mono text-emerald-700 font-bold">
              Total: {currency}{filteredSales.reduce((sum, s) => sum + s.total, 0).toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3 text-right">Items</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.invoiceNo}</td>
                    <td className="py-3 px-3 text-slate-500">{s.createdAt.split('T')[0]}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{s.customerName}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">{s.items?.length || 0}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{currency}{s.total.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">{currency}{s.paidAmount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-mono text-amber-700">{currency}{s.dueAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'STOCK' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900">{products.length} Products in Inventory</span>
            <span className="font-mono text-emerald-700 font-bold">
              Total Stock Valuation: {currency}{metrics.inventoryValue.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3 text-right">Unit Cost</th>
                  <th className="py-3 px-3 text-right">Selling Price</th>
                  <th className="py-3 px-3 text-right">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{p.sku}</td>
                    <td className="py-3 px-3 text-slate-700">{p.category}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">{p.currentStock} {p.unit}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">{currency}{p.purchasePrice}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">{currency}{p.sellingPrice}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-sky-700">
                      {currency}{(p.currentStock * p.purchasePrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'DUES' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900">Outstanding Customer Receivables</span>
            <span className="font-mono text-amber-700 font-bold">
              Total Dues: {currency}{metrics.totalReceivables.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3 text-right">Total Purchases</th>
                  <th className="py-3 px-3 text-right">Total Paid</th>
                  <th className="py-3 px-3 text-right">Outstanding Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers
                  .filter((c) => c.currentDue > 0)
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-sky-50/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-3 text-slate-500">{c.phone}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">{currency}{(c.totalPurchases || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700">{currency}{(c.totalPaid || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                        {currency}{c.currentDue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
