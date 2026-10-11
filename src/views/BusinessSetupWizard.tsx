import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  MessageCircle,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { uploadFileToStorage } from '../lib/firebase';
import { BrandLogo } from '../components/BrandLogo';

interface BusinessSetupWizardProps {
  onCancel?: () => void;
  isFirstBusiness?: boolean;
  onOpenSupport: () => void;
}

export const BusinessSetupWizard: React.FC<BusinessSetupWizardProps> = ({
  onCancel,
  isFirstBusiness = true,
  onOpenSupport,
}) => {
  const { createNewBusiness, userProfile, user } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState(userProfile?.displayName || user?.displayName || '');
  const [businessType, setBusinessType] = useState('Retailer & Shopkeeper');
  const [address, setAddress] = useState('Dhaka, Bangladesh');
  const [phone, setPhone] = useState('01789637029');
  const [whatsapp, setWhatsapp] = useState('01789637029');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState('৳');
  const [currencyCode, setCurrencyCode] = useState('BDT');
  const [invoicePrefix, setInvoicePrefix] = useState('DMS-');
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `logos/new_biz_${Date.now()}.${ext}`;
      const url = await uploadFileToStorage(file, path);
      setLogoUrl(url);
    } catch (err: any) {
      console.error('Logo upload failed:', err);
      setError('Failed to upload logo: ' + (err.message || 'Please try again'));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !businessName.trim()) {
      setError('Please provide your business name');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleFinish = async () => {
    setError(null);
    setLoading(true);
    try {
      const newBusinessPayload: any = {
        name: businessName.trim(),
        ownerName: ownerName.trim() || 'Owner',
        businessType,
        address: address.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim(),
        currency,
        currencyCode,
        invoicePrefix: invoicePrefix.trim().toUpperCase() || 'DMS-',
        nextInvoiceNumber: 1001,
        financialYear,
      };

      if (logoUrl.trim()) {
        newBusinessPayload.logoUrl = logoUrl.trim();
      }

      await createNewBusiness(newBusinessPayload);

      toast.success(
        `Business "${businessName.trim()}" profile saved and initialized successfully!`,
        'Business Created'
      );

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      if (onCancel) {
        onCancel();
      }
    } catch (err: any) {
      console.error('Error creating business:', err);
      setError(err.message || 'Failed to initialize business. Please retry.');
      toast.error(err.message || 'Failed to initialize business. Please retry.', 'Setup Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full flex justify-between items-center pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <BrandLogo size="md" showText={false} />
          <div>
            <h1 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
              DMS Solution
            </h1>
            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mt-0.5">
              Business Setup Wizard
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSupport}
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Support: 01789637029</span>
        </button>
      </div>

      {/* Wizard Card */}
      <div className="max-w-2xl mx-auto w-full my-auto py-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span className={step >= 1 ? 'text-emerald-700 font-bold' : ''}>1. Business Profile</span>
              <span className={step >= 2 ? 'text-emerald-700 font-bold' : ''}>2. Contact Details</span>
              <span className={step >= 3 ? 'text-emerald-700 font-bold' : ''}>3. Financial Preferences</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 transition-all duration-300 rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Step 1: Business Profile */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Let's set up your business</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Enter your business name and details to customize your invoices and accounts.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business / Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Sohel Enterprise & Department Store"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. DIL Mohammad Sohel"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Business Type
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="Retailer & Shopkeeper">Retailer & Shopkeeper</option>
                      <option value="Wholesaler & Distributor">Wholesaler & Distributor</option>
                      <option value="Manufacturer & Production">Manufacturer & Production</option>
                      <option value="Grocery & Super Shop">Grocery & Super Shop</option>
                      <option value="Electronics & Mobile">Electronics & Mobile</option>
                      <option value="Pharmacy & Health">Pharmacy & Health</option>
                      <option value="Fashion & Garments">Fashion & Garments</option>
                      <option value="General Trading">General Trading</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Logo Image (Upload or URL - Optional)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://... or upload from device"
                      className="flex-1 bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{uploadingLogo ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                    </label>
                  </div>
                  {logoUrl && (
                    <div className="mt-2 flex items-center space-x-2">
                      <img
                        src={logoUrl}
                        alt="Logo Preview"
                        className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5"
                      />
                      <span className="text-[11px] text-emerald-700 font-medium">
                        Logo ready for business dashboard
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                {!isFirstBusiness && onCancel ? (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                ) : <div />}
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-xs cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Contact & Address</h2>
                <p className="text-xs text-slate-600 mt-1">
                  This info appears on invoices, receipts, and order confirmations.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Shop #12, Market Square, Dhaka"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 01789637029"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="e.g. 01789637029"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Business Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. contact@business.com"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-xs cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Finance & Defaults */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Finance & Invoicing Setup</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Configure default currency, numbering prefix, and fiscal accounting year.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Currency Symbol
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => {
                        setCurrency(e.target.value);
                        setCurrencyCode(e.target.value === '৳' ? 'BDT' : e.target.value === '$' ? 'USD' : 'EUR');
                      }}
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 font-bold"
                    >
                      <option value="৳">৳ BDT (Bangladeshi Taka - Default)</option>
                      <option value="$">$ USD (US Dollar)</option>
                      <option value="€">€ EUR (Euro)</option>
                      <option value="₹">₹ INR (Indian Rupee)</option>
                      <option value="£">£ GBP (British Pound)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Invoice Prefix
                    </label>
                    <input
                      type="text"
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                      placeholder="DMS-"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Financial Year
                    </label>
                    <input
                      type="text"
                      value={financialYear}
                      onChange={(e) => setFinancialYear(e.target.value)}
                      placeholder="2026-2027"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Starting Invoice Number
                    </label>
                    <input
                      type="text"
                      disabled
                      value="1001 (Auto-increment)"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 font-mono font-medium"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <div className="font-bold flex items-center space-x-1.5 mb-1 text-emerald-950">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Automatic Account Provisioning</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    We will automatically configure <strong>Cash in Hand</strong>, <strong>Bank Account</strong>, and <strong>bKash MFS</strong> accounts so you can start selling immediately!
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinish}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 text-white font-bold py-3 px-8 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Launch Business Dashboard</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto w-full text-center text-xs text-slate-500 pt-6 border-t border-slate-200">
        DMS Solution SaaS • Owner: DIL Mohammad Sohel • WhatsApp Support: 01789637029
      </div>
    </div>
  );
};
