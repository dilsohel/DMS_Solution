import React from 'react';
import { Phone, MessageCircle, User, ShieldCheck, ExternalLink } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BrandLogo size="md" showText={false} className="shadow-md" />
            <div>
              <h3 className="font-extrabold text-lg leading-tight tracking-tight">DMS Solution Support</h3>
              <p className="text-emerald-100 text-xs">Official Customer & Technical Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white rounded-xl p-1.5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-950">
              <p className="font-bold text-emerald-950">Direct Developer & Founder Support</p>
              <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                Get instant assistance for setup, business inquiries, customization, or technical guidance.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Platform Owner</div>
                  <div className="font-bold text-slate-900 text-sm">DIL Mohammad Sohel</div>
                </div>
              </div>
              <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">Founder</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Customer Support WhatsApp</div>
                  <div className="font-bold text-slate-900 text-sm tracking-wide font-mono">01789637029</div>
                </div>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">Active</span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://wa.me/01789637029"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat on WhatsApp (01789637029)</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
            </a>
          </div>

          <p className="text-center text-xs text-slate-400">
            DMS Solution — Premium Business Management SaaS
          </p>
        </div>
      </div>
    </div>
  );
};

export const SupportBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between shadow-xs">
      <div className="flex items-center space-x-2">
        <span className="bg-white/20 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wide uppercase">
          Support
        </span>
        <span className="font-medium">
          DMS Solution Support | Owner: <strong className="font-bold">DIL Mohammad Sohel</strong>
        </span>
      </div>
      <div className="flex items-center space-x-3 mt-1 sm:mt-0">
        <span className="text-emerald-100 font-mono font-medium">WhatsApp: 01789637029</span>
        <a
          href="https://wa.me/01789637029"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-emerald-800 hover:bg-emerald-50 px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center space-x-1 transition-colors shadow-2xs"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp Chat</span>
        </a>
      </div>
    </div>
  );
};
