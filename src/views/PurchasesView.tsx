import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Trash2,
  Printer,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { useToast } from '../context/ToastContext';
import { Purchase, PurchaseItem } from '../types';

interface PurchasesViewProps {
  onViewBill: (purchase: Purchase) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ onViewBill }) => {
  const { currentBusiness } = useAuth();
  const toast = useToast();
  const {
    purchases,
    products,
    suppliers,
    accounts,
    createPurchase,
    addSupplier
  } = useBusiness();

  const currency = currentBusiness?.currency || '৳';

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [historySearch, setHistorySearch] = useState('');

  // Form states
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [cartItems, setCartItems] = useState<PurchaseItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'mfs' | 'credit'>('cash');
  const [paymentAccountId, setPaymentAccountId] = useState<string>(
    accounts.find((a) => a.type === 'cash')?.id || accounts[0]?.id || ''
  );
  const [billNotes, setBillNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quick Supplier Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppPhone, setNewSuppPhone] = useState('');
  const [newSuppAddress, setNewSuppAddress] = useState('');

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, it) => sum + it.subtotal, 0);
  }, [cartItems]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const dueAmount = useMemo(() => {
    return Math.max(0, grandTotal - paidAmount);
  }, [grandTotal, paidAmount]);

  const handleAddProductToBill = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const existing = cartItems.find((it) => it.productId === productId);
    if (existing) {
      setCartItems(
        cartItems.map((it) =>
          it.productId === productId
            ? { ...it, quantity: it.quantity + 1, subtotal: (it.quantity + 1) * it.purchasePrice }
            : it
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: prod.id,
          productName: prod.name,
          unit: prod.unit,
          quantity: 1,
          purchasePrice: prod.purchasePrice,
          subtotal: prod.purchasePrice,
        },
      ]);
    }
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCartItems(cartItems.filter((i) => i.productId !== productId));
      return;
    }
    setCartItems(
      cartItems.map((it) =>
        it.productId === productId
          ? { ...it, quantity: qty, subtotal: qty * it.purchasePrice }
          : it
      )
    );
  };

  const handleUpdateCartPrice = (productId: string, price: number) => {
    setCartItems(
      cartItems.map((it) =>
        it.productId === productId
          ? { ...it, purchasePrice: price, subtotal: it.quantity * price }
          : it
      )
    );
  };

  const handleSavePurchase = async () => {
    if (cartItems.length === 0) {
      alert('Please select at least one item to purchase');
      return;
    }
    if (!selectedSupplierId) {
      toast.warning('Please select or add a supplier first.', 'Supplier Required');
      return;
    }

    setSubmitting(true);
    try {
      const supplier = suppliers.find((s) => s.id === selectedSupplierId);
      const created = await createPurchase({
        supplierId: selectedSupplierId,
        supplierName: supplier?.name || 'Supplier',
        items: cartItems,
        subtotal,
        discount: discountAmount,
        total: grandTotal,
        paidAmount,
        dueAmount,
        paymentMethod,
        paymentAccountId,
        notes: billNotes.trim() || undefined,
        status: dueAmount <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'due',
      });

      toast.success(
        `Purchase bill saved! Total: ${currency}${grandTotal.toLocaleString()}`,
        'Bill Recorded'
      );

      setCartItems([]);
      setDiscountAmount(0);
      setPaidAmount(0);
      setBillNotes('');
      setSelectedSupplierId('');

      if (created) {
        onViewBill(created);
      }
    } catch (err: any) {
      console.error('Error saving purchase:', err);
      toast.error('Failed to save purchase bill: ' + (err.message || 'Please try again'), 'Purchase Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSupplierQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuppName.trim()) return;

    try {
      const newId = await addSupplier({
        name: newSuppName.trim(),
        phone: newSuppPhone.trim() || 'N/A',
        address: newSuppAddress.trim() || undefined,
        openingBalance: 0,
      });

      toast.success(`Supplier "${newSuppName.trim()}" added successfully!`, 'Supplier Created');
      setSelectedSupplierId(newId);
      setIsSupplierModalOpen(false);
      setNewSuppName('');
      setNewSuppPhone('');
      setNewSuppAddress('');
    } catch (err: any) {
      toast.error('Failed to add supplier: ' + err.message, 'Error');
    }
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter(
      (p) =>
        p.invoiceNo.toLowerCase().includes(historySearch.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(historySearch.toLowerCase())
    );
  }, [purchases, historySearch]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Stock Purchases & Bills</h1>
          <p className="text-xs text-slate-500">
            Record supplier orders, stock replenishment, manage payables, and print purchase receipts.
          </p>
        </div>

        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-2xl text-xs">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Purchase Bill
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Purchase History ({purchases.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Product Selection */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900">Select Stock Items to Restock</h2>
              <span className="text-xs text-slate-500">{products.length} products</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleAddProductToBill(p.id)}
                  className="p-3 bg-slate-50/80 border border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 rounded-2xl cursor-pointer transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Current: {p.currentStock} {p.unit}</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex justify-between items-center text-xs">
                    <span className="font-mono text-sky-700 font-bold">
                      {currency}{p.purchasePrice}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">+ Add</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Purchase Bill Form */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900">Purchase Order Details</h2>
              <span className="text-xs font-mono text-sky-700 font-bold">Bill Entry</span>
            </div>

            {/* Supplier Selector */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Supplier *</label>
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(true)}
                  className="text-[11px] text-sky-700 hover:text-sky-900 font-bold cursor-pointer"
                >
                  + New Supplier
                </button>
              </div>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone}) - Payable: {currency}{s.currentDue}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No items selected. Click products on the left to add to bill.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 mr-2">
                      <div className="font-semibold text-slate-900 truncate">{item.productName}</div>
                      <div className="text-[11px] text-slate-500">Unit: {item.unit}</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateCartQty(item.productId, parseInt(e.target.value) || 1)}
                        className="w-14 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-900 text-xs"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.purchasePrice}
                        onChange={(e) => handleUpdateCartPrice(item.productId, parseFloat(e.target.value) || 0)}
                        className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-right font-mono text-sky-700 font-bold text-xs"
                      />
                      <button
                        onClick={() => setCartItems(cartItems.filter((i) => i.productId !== item.productId))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-900 font-bold">
                  {currency}{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Discount ({currency}):</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-50/70 border border-slate-200 rounded-lg px-2 py-1 text-right font-mono text-slate-900 text-xs focus:bg-white focus:border-sky-500"
                />
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Grand Total:</span>
                <span className="font-mono text-sky-700 text-base font-black">
                  {currency}{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payments */}
            <div className="border-t border-slate-100 pt-3 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="mfs">bKash / Nagad / MFS</option>
                    <option value="credit">Full Credit (Payable Due)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Deduct From Account
                  </label>
                  <select
                    value={paymentAccountId}
                    onChange={(e) => setPaymentAccountId(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({currency}{a.balance})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Paid Amount ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Payable Due ({currency})
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${currency}${dueAmount.toLocaleString()}`}
                    className={`w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold ${
                      dueAmount > 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPaidAmount(grandTotal)}
                className="text-[11px] text-sky-700 hover:underline font-semibold block cursor-pointer"
              >
                Set full paid amount ({currency}{grandTotal.toLocaleString()})
              </button>

              <button
                type="button"
                disabled={submitting || cartItems.length === 0}
                onClick={handleSavePurchase}
                className="w-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-xs disabled:opacity-50 mt-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Save Purchase & Update Inventory</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* PURCHASE HISTORY */
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search purchase bill # or supplier..."
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
            {filteredPurchases.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No purchase records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Bill #</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Supplier</th>
                      <th className="py-3 px-3 text-right">Total Bill</th>
                      <th className="py-3 px-3 text-right">Paid</th>
                      <th className="py-3 px-3 text-right">Due</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-sky-50/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.invoiceNo}</td>
                        <td className="py-3 px-3 text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{p.supplierName}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {currency}{p.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                          {currency}{p.paidAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                          {currency}{p.dueAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {p.dueAmount <= 0 ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                              Paid
                            </span>
                          ) : (
                            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded-full">
                              Due: {currency}{p.dueAmount}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onViewBill(p)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Print / View Purchase Bill"
                          >
                            <Printer className="w-3.5 h-3.5 text-sky-600" />
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
      )}

      {/* Quick Add Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-3">Add Supplier Quickly</h3>
            <form onSubmit={handleCreateSupplierQuick} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={newSuppName}
                  onChange={(e) => setNewSuppName(e.target.value)}
                  placeholder="e.g. Meghna Trading Ltd."
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={newSuppPhone}
                  onChange={(e) => setNewSuppPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={newSuppAddress}
                  onChange={(e) => setNewSuppAddress(e.target.value)}
                  placeholder="Khatungonj, Chittagong"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
