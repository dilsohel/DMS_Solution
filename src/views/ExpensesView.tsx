import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  TrendingDown,
  Tag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { useToast } from '../context/ToastContext';

export const ExpensesView: React.FC = () => {
  const { currentBusiness, permissions } = useAuth();
  const { expenses, accounts, addExpense } = useBusiness();
  const toast = useToast();
  const currency = currentBusiness?.currency || '৳';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [category, setCategory] = useState('Rent & Utilities');
  const [amount, setAmount] = useState<number>(0);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const defaultCategories = [
    'Rent & Utilities',
    'Employee Salaries',
    'Tea & Refreshments',
    'Transport & Logistics',
    'Packaging & Supplies',
    'Marketing & Ads',
    'Office & Shop Maintenance',
    'Software & Subscriptions',
    'Taxes & Trade Licenses',
    'Miscellaneous Expense',
  ];

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    try {
      const selectedAcc = accounts.find((a) => a.id === accountId) || accounts[0];

      await addExpense({
        category: category.trim(),
        amount: Number(amount),
        accountId: selectedAcc?.id || 'cash_default',
        accountName: selectedAcc?.name || 'Cash',
        date,
        description: description.trim() || category,
      });

      toast.success(
        `Expense of ${currency}${Number(amount).toLocaleString()} for "${category}" recorded!`,
        'Expense Saved'
      );

      setIsAddModalOpen(false);
      setAmount(0);
      setDescription('');
    } catch (err: any) {
      console.error('Error saving expense:', err);
      toast.error(err.message || 'Failed to record expense.', 'Expense Error');
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchSearch =
        exp.description.toLowerCase().includes(search.toLowerCase()) ||
        exp.category.toLowerCase().includes(search.toLowerCase()) ||
        exp.accountName.toLowerCase().includes(search.toLowerCase());

      const matchCat = selectedCategory === 'ALL' || exp.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [expenses, search, selectedCategory]);

  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Expenses & Operating Costs</h1>
          <p className="text-xs text-slate-500">
            Track overhead costs, shop rent, staff wages, utilities, tea & guest refreshments.
          </p>
        </div>

        {permissions.canManageFinance && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        )}
      </div>

      {/* Summary Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Expenses Recorded</div>
            <div className="text-2xl font-black text-rose-600 mt-0.5 font-mono">
              {currency}{totalExpense.toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Expense Entries</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
              {expenses.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Average Expense per Entry</div>
            <div className="text-2xl font-black text-slate-800 mt-0.5 font-mono">
              {currency}{expenses.length > 0 ? Math.round(totalExpense / expenses.length).toLocaleString() : 0}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <Tag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description or category..."
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500"
        >
          <option value="ALL">All Categories</option>
          {defaultCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No expenses recorded yet. Click "Record Expense" to add your first expense!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Paid From Account</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {exp.date}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-medium">
                      {exp.description}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {exp.accountName}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                      {currency}{exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                      {exp.createdBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-4">Record Business Expense</h3>

            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500"
                >
                  {defaultCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Amount ({currency}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paid From Account *
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type}) - Balance: {currency}{a.balance}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Note
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Shop electricity bill for May, Staff bonus"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
