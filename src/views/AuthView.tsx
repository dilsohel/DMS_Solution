import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  HelpCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  KeyRound,
  Zap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo, DMS_BG_URL, DMS_BG_FALLBACK } from '../components/BrandLogo';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthViewProps {
  onOpenSupport: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onOpenSupport }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInDirectOwner, sendPasswordReset } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showOperationNotAllowedGuide, setShowOperationNotAllowedGuide] = useState(false);
  const [showCredentialResetOffer, setShowCredentialResetOffer] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [sendingResetInline, setSendingResetInline] = useState(false);
  const [inlineResetSuccess, setInlineResetSuccess] = useState(false);
  const [bgImage, setBgImage] = useState(DMS_BG_URL);
  const [showUnauthorizedDomainGuide, setShowUnauthorizedDomainGuide] = useState(false);
  const [currentHostname, setCurrentHostname] = useState('');
  const [copiedDomain, setCopiedDomain] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setShowOperationNotAllowedGuide(false);
    setShowUnauthorizedDomainGuide(false);
    setShowCredentialResetOffer(false);
    setInlineResetSuccess(false);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password, displayName.trim());
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      const code = err.code || '';
      const msg = err.message || '';

      if (code === 'auth/operation-not-allowed' || msg.includes('PASSWORD_LOGIN_DISABLED') || msg.includes('OPERATION_NOT_ALLOWED')) {
        setShowOperationNotAllowedGuide(true);
        setErrorMessage(
          'Email & Password sign-in is currently disabled in your Firebase project. To enable it, turn on the Email/Password provider in the Firebase Console.'
        );
      } else if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setCurrentHostname(host);
        setShowUnauthorizedDomainGuide(true);
        setErrorMessage(
          `Domain "${host || 'your current domain'}" is not authorized for OAuth operations in your Firebase project.`
        );
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setShowCredentialResetOffer(true);
        setErrorMessage(
          'Invalid email or password. If you originally registered using "Continue with Google", your account does not have a separate password set yet.'
        );
      } else if (code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. If you registered via Google, click "Continue with Google" or click "Sign In".');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('Password should be at least 6 characters long.');
      } else if (code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setShowOperationNotAllowedGuide(false);
    setShowUnauthorizedDomainGuide(false);
    setShowCredentialResetOffer(false);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      const code = err.code || '';
      const msg = err.message || '';

      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setCurrentHostname(host);
        setShowUnauthorizedDomainGuide(true);
        setErrorMessage(
          `Domain "${host || 'your domain'}" is not authorized in Firebase Authentication. Add it to Authorized Domains in Firebase Console to allow Google login.`
        );
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage('Browser blocked the Google sign-in popup. Please allow popups for this window and click again.');
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in window was closed before completing. Please click the button to try again.');
      } else {
        setErrorMessage(err.message || 'Google Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      await sendPasswordReset(resetEmail.trim());
      setResetSent(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reset email.');
    }
  };

  const handleInlineSendReset = async () => {
    if (!email.trim()) {
      setShowForgotModal(true);
      return;
    }
    setSendingResetInline(true);
    try {
      await sendPasswordReset(email.trim());
      setInlineResetSuccess(true);
    } catch (err: any) {
      console.error('Inline Reset Error:', err);
      setErrorMessage(err.message || 'Failed to send password reset email.');
    } finally {
      setSendingResetInline(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Background Image Fallback Image tag (hidden) */}
      <img
        src={bgImage}
        alt=""
        className="hidden"
        onError={() => {
          if (bgImage === DMS_BG_URL) setBgImage(DMS_BG_FALLBACK);
        }}
      />

      {/* Light Overlay ensuring high contrast and pristine readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/92 via-slate-50/88 to-sky-50/92 backdrop-blur-[3px] pointer-events-none" />

      {/* Content wrapper with z-10 */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        {/* Top Official Support Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 px-4 py-2 text-xs flex justify-between items-center text-white shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-emerald-950 uppercase tracking-wider bg-white/90 px-2 py-0.5 rounded text-[10px]">
              Official Support
            </span>
            <span className="text-white/95">
              DMS Solution Support • Owner: <strong className="text-white">DIL Mohammad Sohel</strong>
            </span>
          </div>
          <a
            href="https://wa.me/01789637029"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 text-white font-semibold px-3 py-1 rounded-md text-[11px] inline-flex items-center space-x-1.5 transition-colors backdrop-blur-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
            <span>WhatsApp: 01789637029</span>
          </a>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Brand & Value Prop */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Prominent Logo */}
              <div className="flex items-center space-x-3.5 bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-sky-100 shadow-xs max-w-fit">
                <BrandLogo size="lg" showText={false} />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-none">
                    DMS Solution
                  </h1>
                  <p className="text-xs text-emerald-700 font-bold tracking-wide uppercase mt-1">
                    Complete Business Management SaaS
                  </p>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Manage your shop, wholesale & manufacturing business online.
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                DMS Solution gives shopkeepers, wholesalers, and retailers complete control over invoices, inventory, customer dues, supplier payments, profit & loss, and accounting.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Multi-tenant business isolation with custom currency (default ৳ BDT)',
                  'Instant POS billing, invoice printing & stock auto-deduction',
                  'Customer & supplier ledgers with WhatsApp payment reminders',
                  'Real-time cash, bank, and MFS (bKash/Nagad) accounting',
                  'Comprehensive P&L, balance sheets, and audit trail logs',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Founder Contact Card */}
              <div className="p-4 rounded-2xl bg-white/90 border border-sky-100/80 shadow-xs flex items-center justify-between backdrop-blur-xs">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Need help onboarding?</div>
                  <div className="text-sm font-bold text-slate-900">Talk directly to founder Sohel</div>
                </div>
                <button
                  onClick={onOpenSupport}
                  className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Contact Support</span>
                </button>
              </div>
            </div>

            {/* Right Column: Clean White Auth Card */}
            <div className="lg:col-span-6">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                {/* Decorative Subtle Accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-100/50 via-sky-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setErrorMessage(null);
                      setShowOperationNotAllowedGuide(false);
                      setShowCredentialResetOffer(false);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isLogin
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setErrorMessage(null);
                      setShowOperationNotAllowedGuide(false);
                      setShowCredentialResetOffer(false);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      !isLogin
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Create Business Account
                  </button>
                </div>

                {/* Instant 1-Click Owner Access Button */}
                <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/90 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Instant Direct Access (No Configuration Required)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                      Instant
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => signInDirectOwner('sohel901170@gmail.com', 'Dil Mohammad Sohel')}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-xs hover:shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-emerald-200" />
                    <span>Enter as Owner: Dil Mohammad Sohel</span>
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-1.5">
                    One-click direct login into DMS Solution Dashboard
                  </p>
                </div>

                {/* Recommended 1-Click Google Sign-in Button */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2.5 border border-slate-200 shadow-xs hover:border-slate-300 active:scale-[0.99] cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>

                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <span className="relative bg-white px-3 text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                    Or Sign In with Email & Password
                  </span>
                </div>

                {/* Error Banner with Contextual Diagnostics */}
                {errorMessage && (
                  <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex flex-col space-y-2.5">
                    <div className="flex items-start space-x-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <div className="flex-1 font-medium">{errorMessage}</div>
                    </div>

                    {/* Instant Direct Access Rescue Button */}
                    <div className="pt-2 border-t border-rose-200">
                      <button
                        type="button"
                        onClick={() => signInDirectOwner('sohel901170@gmail.com', 'Dil Mohammad Sohel')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Bypass & Enter as Owner Instantly</span>
                      </button>
                    </div>

                    {/* Scenario A: Firebase Email/Password Disabled */}
                    {showOperationNotAllowedGuide && (
                      <div className="pt-2 border-t border-rose-200/80 space-y-2.5 text-slate-700">
                        <div className="p-3 bg-white rounded-xl border border-rose-200/60 space-y-2">
                          <p className="font-bold text-slate-900 text-[11px]">
                            Why this happened:
                          </p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            In your Firebase project (<code>{firebaseConfig.projectId}</code>), the <strong>Email/Password</strong> sign-in provider is currently turned off in the Firebase Console.
                          </p>
                          <p className="font-bold text-slate-900 text-[11px] pt-1">
                            How to enable Email/Password (takes ~15 seconds):
                          </p>
                          <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
                            <li>Click the button below to open Firebase Auth Sign-in methods.</li>
                            <li>Click on <strong>Email/Password</strong> under &quot;Sign-in providers&quot;.</li>
                            <li>Toggle <strong>Enable</strong> on the first switch and click <strong>Save</strong>.</li>
                          </ol>
                          <a
                            href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-[11px] transition-colors mt-1 shadow-2xs"
                          >
                            <span>Open Firebase Providers Console</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Scenario B: Unauthorized Domain (Google OAuth) */}
                    {showUnauthorizedDomainGuide && (
                      <div className="pt-2 border-t border-rose-200/80 space-y-2.5 text-slate-700">
                        <div className="p-3 bg-white rounded-xl border border-rose-200/60 space-y-2.5">
                          <p className="font-bold text-slate-900 text-[11px]">
                            How to fix "auth/unauthorized-domain":
                          </p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Firebase Authentication protects your app by only allowing Google sign-in from explicitly whitelisted domains. Your current domain is not yet on the whitelist:
                          </p>
                          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <code className="text-xs font-mono font-bold text-emerald-800 break-all flex-1">
                              {currentHostname || (typeof window !== 'undefined' ? window.location.hostname : 'your domain')}
                            </code>
                            <button
                              type="button"
                              onClick={() => {
                                const h = currentHostname || (typeof window !== 'undefined' ? window.location.hostname : '');
                                if (h && navigator.clipboard) {
                                  navigator.clipboard.writeText(h);
                                  setCopiedDomain(true);
                                  setTimeout(() => setCopiedDomain(false), 2500);
                                }
                              }}
                              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded border border-slate-200 shrink-0 cursor-pointer"
                            >
                              {copiedDomain ? 'Copied ✓' : 'Copy Domain'}
                            </button>
                          </div>
                          <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
                            <li>Click the button below to go to <strong>Firebase Auth Settings &gt; Authorized domains</strong>.</li>
                            <li>Click <strong>Add domain</strong>.</li>
                            <li>Paste the copied domain (or <code>{currentHostname || 'github.io'}</code>) and click <strong>Add</strong>.</li>
                          </ol>
                          <a
                            href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-[11px] transition-colors mt-1 shadow-2xs"
                          >
                            <span>Open Firebase Authorized Domains Settings</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Scenario B: Password Mismatch or Google-only account */}
                    {showCredentialResetOffer && (
                      <div className="pt-2 border-t border-rose-200/80 space-y-2 text-slate-700">
                        <div className="p-3 bg-white rounded-xl border border-rose-200/60 space-y-2">
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            If you already created your account with <strong>Google</strong> using <strong className="text-slate-900">{email || 'your email'}</strong>, you can set a password by clicking below to receive a password setup link in your inbox:
                          </p>
                          {inlineResetSuccess ? (
                            <div className="p-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200 flex items-center space-x-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Password setup email sent to {email}! Check your inbox.</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={handleInlineSendReset}
                              disabled={sendingResetInline}
                              className="inline-flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>{sendingResetInline ? 'Sending...' : `Send Password Setup Link to ${email || 'my email'}`}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name / Business Owner Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. DIL Mohammad Sohel"
                          className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="business@example.com"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password
                      </label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => {
                            setResetEmail(email);
                            setShowForgotModal(true);
                          }}
                          className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-700/20 disabled:opacity-50 mt-2 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isLogin ? 'Sign In with Email & Password' : 'Create Business Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <h3 className="font-bold text-base text-slate-900">Reset Password</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your registered email address and Firebase will send you a secure password reset and setup link.
              </p>
              {resetSent ? (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-medium space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Password Reset Link Sent!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">Check your email inbox (and spam folder) for instructions to set your new password.</p>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(false);
                        setResetSent(false);
                      }}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
              {resetSent && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded-xl font-bold cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md px-4 py-4 text-center text-xs text-slate-600">
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-slate-700 font-medium">
            <span>Website: <strong>DMS Solution</strong></span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Owner: <strong>DIL Mohammad Sohel</strong></span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Customer Support WhatsApp: <strong className="text-emerald-700">01789637029</strong></span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button onClick={onOpenSupport} className="text-sky-700 hover:underline font-bold cursor-pointer">
              Help & Contact
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
