/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SupportBanner, SupportModal } from './components/SupportModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { AuthView } from './views/AuthView';
import { BusinessSetupWizard } from './views/BusinessSetupWizard';
import { DashboardView } from './views/DashboardView';
import { ProductsView } from './views/ProductsView';
import { SalesView } from './views/SalesView';
import { PurchasesView } from './views/PurchasesView';
import { CustomersView } from './views/CustomersView';
import { SuppliersView } from './views/SuppliersView';
import { AccountsView } from './views/AccountsView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { MembersView } from './views/MembersView';
import { AuditLogsView } from './views/AuditLogsView';
import { SettingsView } from './views/SettingsView';
import { AICopilotView } from './views/AICopilotView';
import { GeminiChatbot } from './components/GeminiChatbot';
import { Sparkles, Bot, X } from 'lucide-react';
import { Purchase, Sale } from './types';

const MainAppContent: React.FC = () => {
  const { user, currentBusiness, businesses, loading } = useAuth();

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRegisterBusinessModalOpen, setIsRegisterBusinessModalOpen] = useState(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  // Invoice Print Preview Modal State
  const [activePrintSale, setActivePrintSale] = useState<Sale | null>(null);
  const [activePrintPurchase, setActivePrintPurchase] = useState<Purchase | null>(null);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 space-y-4">
        <img
          src="https://i.imgur.com/XjO7IJK.jpg"
          alt="DMS Solution"
          className="h-14 w-auto object-contain animate-pulse"
        />
        <div className="text-sm font-semibold tracking-wide text-slate-600">
          Loading DMS Solution...
        </div>
      </div>
    );
  }

  // If user is not authenticated -> AuthView
  if (!user) {
    return (
      <>
        <AuthView onOpenSupport={() => setIsSupportOpen(true)} />
        <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      </>
    );
  }

  // If user has no registered business yet -> Guided Wizard
  if (businesses.length === 0 || !currentBusiness) {
    return (
      <>
        <BusinessSetupWizard
          isFirstBusiness={true}
          onOpenSupport={() => setIsSupportOpen(true)}
        />
        <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      </>
    );
  }

  return (
    <BusinessProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
        {/* Support Banner at Top */}
        <SupportBanner />

        {/* Global Navbar */}
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenNewBusinessModal={() => setIsRegisterBusinessModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Layout Body: Sidebar + Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onOpenSupport={() => setIsSupportOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-6rem)]">
            {currentView === 'dashboard' && (
              <DashboardView
                onNavigate={(v) => setCurrentView(v)}
                onViewInvoice={(s) => {
                  setActivePrintSale(s);
                  setActivePrintPurchase(null);
                }}
              />
            )}

            {currentView === 'sales' && (
              <SalesView
                onViewInvoice={(s) => {
                  setActivePrintSale(s);
                  setActivePrintPurchase(null);
                }}
              />
            )}

            {currentView === 'purchases' && (
              <PurchasesView
                onViewBill={(p) => {
                  setActivePrintPurchase(p);
                  setActivePrintSale(null);
                }}
              />
            )}

            {currentView === 'products' && <ProductsView />}
            {currentView === 'customers' && <CustomersView />}
            {currentView === 'ai-copilot' && <AICopilotView />}
            {currentView === 'suppliers' && <SuppliersView />}
            {currentView === 'accounts' && <AccountsView />}
            {currentView === 'expenses' && <ExpensesView />}
            {currentView === 'reports' && <ReportsView />}
            {currentView === 'members' && <MembersView />}
            {currentView === 'audit' && <AuditLogsView />}
            {currentView === 'settings' && (
              <SettingsView onOpenSupport={() => setIsSupportOpen(true)} />
            )}
          </main>
        </div>

        {/* Floating AI Business Copilot Launcher & Window */}
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
          {isFloatingChatOpen ? (
            <div className="mb-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <GeminiChatbot isFloating={true} onClose={() => setIsFloatingChatOpen(false)} />
            </div>
          ) : (
            <button
              onClick={() => setIsFloatingChatOpen(true)}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 hover:from-emerald-700 hover:to-sky-800 text-white px-4 py-3 rounded-full font-bold shadow-xl shadow-emerald-950/20 flex items-center space-x-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
              title="Open Gemini AI Copilot"
            >
              <div className="relative">
                <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300" />
              </div>
              <span className="text-xs tracking-wide">Ask AI Copilot</span>
            </button>
          )}
        </div>

        {/* Modals */}
        <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />

        <InvoicePrintModal
          isOpen={!!activePrintSale || !!activePrintPurchase}
          onClose={() => {
            setActivePrintSale(null);
            setActivePrintPurchase(null);
          }}
          business={currentBusiness}
          sale={activePrintSale}
          purchase={activePrintPurchase}
        />

        {/* Register Additional Business Modal */}
        {isRegisterBusinessModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs p-4">
            <BusinessSetupWizard
              isFirstBusiness={false}
              onCancel={() => setIsRegisterBusinessModalOpen(false)}
              onOpenSupport={() => setIsSupportOpen(true)}
            />
          </div>
        )}
      </div>
    </BusinessProvider>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
