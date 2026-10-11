import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  Plus,
  HelpCircle,
  LogOut,
  ShoppingBag,
  ShoppingCart,
  Package,
  UserPlus,
  Menu,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onOpenSupport: () => void;
  onNavigate: (view: string) => void;
  onOpenNewBusinessModal: () => void;
  onToggleMobileSidebar: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSupport,
  onNavigate,
  onOpenNewBusinessModal,
  onToggleMobileSidebar,
}) => {
  const { user, userProfile, businesses, currentBusiness, switchBusiness, signOutUser, currentRole } = useAuth();
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-xs">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer group flex items-center"
          >
            <BrandLogo size="md" showText={true} />
          </div>

          {/* Business Selector */}
          {currentBusiness && (
            <div className="relative ml-4 pl-4 border-l border-slate-200 hidden md:block">
              <button
                onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
                className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 transition-all text-xs font-medium cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="max-w-[150px] truncate font-semibold text-slate-900">
                  {currentBusiness.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showBusinessDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Your Businesses
                  </div>
                  {businesses.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        switchBusiness(b.id);
                        setShowBusinessDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        b.id === currentBusiness.id ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium">{b.name}</div>
                        <div className="text-[10px] text-slate-500">{b.businessType || 'General'}</div>
                      </div>
                      {b.id === currentBusiness.id && (
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowBusinessDropdown(false);
                        onOpenNewBusinessModal();
                      }}
                      className="w-full text-left px-3 py-2 text-emerald-700 hover:bg-emerald-50 flex items-center space-x-2 font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Register New Business</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick actions, Support & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Create Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white p-1.5 sm:px-3 sm:py-1.5 rounded-xl font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
              title="Quick Action"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Action</span>
            </button>

            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onNavigate('sales');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2.5 text-slate-700 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  <span>Create Sale Invoice</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onNavigate('purchases');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2.5 text-slate-700 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-sky-600" />
                  <span>Record Purchase Bill</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onNavigate('products');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2.5 text-slate-700 cursor-pointer"
                >
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span>Add New Product</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onNavigate('customers');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2.5 text-slate-700 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-amber-600" />
                  <span>Add Customer</span>
                </button>
              </div>
            )}
          </div>

          {/* Support WhatsApp Button */}
          <button
            onClick={onOpenSupport}
            className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="DMS Solution Support"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Support: 01789637029</span>
            <span className="md:hidden">Support</span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-sky-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-xs">
                {userProfile?.displayName ? userProfile.displayName.substring(0, 2) : 'US'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {userProfile?.displayName || user?.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium capitalize">{currentRole}</div>
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-semibold text-slate-900 truncate">
                    {userProfile?.displayName || 'DMS User'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                  <div className="mt-1">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold px-1.5 py-0.5 rounded capitalize">
                      Role: {currentRole}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Business Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenSupport();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span>Help & Contact Support</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={async () => {
                    setShowUserDropdown(false);
                    await signOutUser();
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
