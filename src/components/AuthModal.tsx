import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  Globe,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Shield,
  ShieldCheck,
  Bike,
  ChevronLeft,
  Mic,
  ShoppingBag,
  Zap,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { LotusLogo } from './LotusLogo.tsx';
import {
  registerArtisan,
  registerBuyer,
  registerRunner,
  loginArtisan,
  loginBuyer,
  loginRunner,
  loginAdmin,
} from '../lib/api.ts';
import { User } from '../types.ts';
import { useCurrentLocation } from '../context/LocationContext.tsx';
import { SUPPORTED_LANGUAGES } from '../data/languages.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

export type AuthViewMode =
  | 'role-select'
  | 'login'
  | 'artisan-register'
  | 'artisan-login'
  | 'buyer-register'
  | 'buyer-login'
  | 'runner-register'
  | 'runner-login'
  | 'admin-login'
  | 'forgot-password';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthViewMode;
  onClose: () => void;
  onAuthSuccess: (user: User, isNewArtisan?: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'role-select',
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<AuthViewMode>(initialMode);
  const [loginRoleTab, setLoginRoleTab] = useState<'artisan' | 'buyer' | 'runner' | 'admin'>('artisan');

  // App-wide language context
  const { selectedLanguage, setLanguageCode, supportedLanguages, t } = useLanguage();

  // Form State
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState(selectedLanguage?.name || 'English');
  const { location } = useCurrentLocation();
  const [neighborhood, setNeighborhood] = useState('');
  const [vehicleType, setVehicleType] = useState('Electric Two-Wheeler');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Sync preferred language with app's single source of truth
  useEffect(() => {
    if (selectedLanguage?.name) {
      setPreferredLanguage(selectedLanguage.name);
    }
  }, [selectedLanguage?.name]);

  const handlePreferredLanguageChange = (langName: string) => {
    setPreferredLanguage(langName);
    const matched = supportedLanguages.find((l) => l.name === langName);
    if (matched) {
      setLanguageCode(matched.code);
    }
  };

  useEffect(() => {
    if (!neighborhood && location?.locality) {
      setNeighborhood(location.locality);
    }
  }, [location?.locality, neighborhood]);

  // Sync mode whenever initialMode or isOpen changes
  useEffect(() => {
    if (initialMode === 'login') {
      setMode('login');
      setLoginRoleTab('artisan');
    } else if (initialMode === 'artisan-login') {
      setMode('artisan-login');
      setLoginRoleTab('artisan');
    } else if (initialMode === 'buyer-login') {
      setMode('buyer-login');
      setLoginRoleTab('buyer');
    } else if (initialMode === 'runner-login') {
      setMode('runner-login');
      setLoginRoleTab('runner');
    } else if (initialMode === 'admin-login') {
      setMode('admin-login');
      setLoginRoleTab('admin');
    } else {
      setMode(initialMode || 'role-select');
    }
    setError(null);
    setForgotSubmitted(false);
  }, [initialMode, isOpen]);

  // Reset errors and fields on mode switch
  const switchMode = (newMode: AuthViewMode) => {
    setMode(newMode);
    setError(null);
    setForgotSubmitted(false);
    if (newMode === 'artisan-login') setLoginRoleTab('artisan');
    if (newMode === 'buyer-login') setLoginRoleTab('buyer');
    if (newMode === 'runner-login') setLoginRoleTab('runner');
    if (newMode === 'admin-login') setLoginRoleTab('admin');
  };

  const handleSelectLoginTab = (role: 'artisan' | 'buyer' | 'runner' | 'admin') => {
    setLoginRoleTab(role);
    setError(null);
    if (role === 'artisan') setMode('artisan-login');
    else if (role === 'buyer') setMode('buyer-login');
    else if (role === 'runner') setMode('runner-login');
    else if (role === 'admin') setMode('admin-login');
  };

  if (!isOpen) return null;

  // 1. Artisan Register
  const handleArtisanRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!identifier.trim()) {
      setError('Please enter your phone number or email address.');
      return;
    }
    if (password.length < 6) {
      setError('Please choose a stronger password (at least 6 characters).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const payload = {
        name: name.trim(),
        email: isEmail ? identifier.trim() : undefined,
        phone: !isEmail ? identifier.trim() : undefined,
        password,
        preferredLanguage,
        neighborhood: neighborhood.trim() || location?.locality || 'Local Neighborhood',
        city: location?.city || location?.locality || 'Local City',
      };

      const result = await registerArtisan(payload);
      onAuthSuccess(result.user, true); // trigger voice onboarding
      onClose();
    } catch (err: any) {
      setError(err?.message || "We're having trouble connecting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Buyer Register
  const handleBuyerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!identifier.trim()) {
      setError('Please enter your phone number or email address.');
      return;
    }
    if (password.length < 6) {
      setError('Please choose a stronger password (at least 6 characters).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const payload = {
        name: name.trim(),
        email: isEmail ? identifier.trim() : undefined,
        phone: !isEmail ? identifier.trim() : undefined,
        password,
        neighborhood: neighborhood.trim() || location?.locality || 'Local Neighborhood',
        city: location?.city || location?.locality || 'Local City',
      };

      const result = await registerBuyer(payload);
      onAuthSuccess(result.user, false);
      onClose();
    } catch (err: any) {
      setError(err?.message || "We're having trouble connecting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Runner Register
  const handleRunnerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!identifier.trim()) {
      setError('Please enter your phone number or email address.');
      return;
    }
    if (password.length < 6) {
      setError('Please choose a stronger password (at least 6 characters).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const payload = {
        name: name.trim(),
        email: isEmail ? identifier.trim() : undefined,
        phone: !isEmail ? identifier.trim() : undefined,
        password,
        vehicleType,
        neighborhood: neighborhood.trim() || location?.locality || 'Local Neighborhood',
        city: location?.city || location?.locality || 'Local City',
      };

      const result = await registerRunner(payload);
      onAuthSuccess(result.user, false);
      onClose();
    } catch (err: any) {
      setError(err?.message || "We're having trouble connecting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Artisan Login
  const handleArtisanLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Email/phone and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginArtisan({
        identifier: identifier.trim(),
        password,
      });
      onAuthSuccess(result.user, false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Email/phone or password is incorrect.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Buyer Login
  const handleBuyerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Email/phone and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginBuyer({
        identifier: identifier.trim(),
        password,
      });
      onAuthSuccess(result.user, false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Email/phone or password is incorrect.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Runner Login
  const handleRunnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Email/phone and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginRunner({
        identifier: identifier.trim(),
        password,
      });
      onAuthSuccess(result.user, false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Email/phone or password is incorrect.');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Administrator email or password is required.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginAdmin({
        identifier: identifier.trim(),
        password,
      });
      onAuthSuccess(result.user, false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Administrator authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for unified login submit
  const handleCurrentLoginSubmit = (e: React.FormEvent) => {
    const activeRole = mode === 'artisan-login' ? 'artisan'
      : mode === 'buyer-login' ? 'buyer'
      : mode === 'runner-login' ? 'runner'
      : mode === 'admin-login' ? 'admin'
      : loginRoleTab;

    if (activeRole === 'artisan') return handleArtisanLogin(e);
    if (activeRole === 'buyer') return handleBuyerLogin(e);
    if (activeRole === 'runner') return handleRunnerLogin(e);
    if (activeRole === 'admin') return handleAdminLogin(e);
    return handleArtisanLogin(e);
  };

  const isAnyLoginMode = mode === 'login' || mode === 'artisan-login' || mode === 'buyer-login' || mode === 'runner-login' || mode === 'admin-login';
  const effectiveLoginRole = mode === 'artisan-login' ? 'artisan'
    : mode === 'buyer-login' ? 'buyer'
    : mode === 'runner-login' ? 'runner'
    : mode === 'admin-login' ? 'admin'
    : loginRoleTab;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in"
      style={{ zIndex: 99999 }}
    >
      <div
        className={`relative w-full ${
          mode === 'role-select' ? 'max-w-2xl' : 'max-w-lg'
        } bg-white border border-rose-100 rounded-3xl shadow-2xl overflow-hidden text-stone-800 flex flex-col max-h-[92vh] transition-all duration-200`}
      >
        {/* Header Ribbon - KanyaKriti Warm Ivory & Rose Branding */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-rose-100/90 flex items-center justify-between bg-gradient-to-r from-[#FFF9F6] via-white to-[#FFF5F7]">
          <div className="flex items-center gap-3">
            {mode !== 'role-select' && (
              <button
                type="button"
                id="auth-back-btn"
                onClick={() => switchMode('role-select')}
                className="p-1.5 sm:p-2 rounded-xl text-[#86293D] hover:bg-rose-50 border border-rose-100/60 transition-colors cursor-pointer"
                title="Back to role selection"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#86293D]" />
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <LotusLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-black text-[#4A1525] text-lg sm:text-xl tracking-tight leading-none">
                    KanyaKriti
                  </span>
                  <span className="text-[9px] bg-rose-50 text-[#86293D] font-bold px-1.5 py-0.2 rounded-full border border-rose-200 uppercase tracking-wider">
                    Official
                  </span>
                </div>
                <span className="block text-[10px] sm:text-[11px] text-[#86293D] font-medium tracking-wide leading-tight mt-0.5">
                  Your Local Connector • Voice-First Hyperlocal Marketplace
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            id="auth-close-btn"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-[#4A1525] hover:bg-rose-50 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-[#FAF7F5]/50">
          {/* Global Alert / Error banner */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-[#FFF0F3] border border-rose-200 text-[#86293D] text-xs flex items-start gap-2.5 animate-in slide-in-from-top-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-[#C84B68] shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW 1: ROLE SELECTION LANDING (GET STARTED) */}
          {/* ========================================== */}
          {mode === 'role-select' && (
            <div className="space-y-5 text-center py-1">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#4A1525] tracking-tight">
                  {t('auth_welcome', 'Welcome to KanyaKriti')}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 font-normal">
                  {t('auth_select_role', "Choose how you'd like to join our community:")}
                </p>
              </div>

              {/* Role cards - Responsive 2x2 grid on desktop, single-column on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-left pt-1">
                {/* 1. Artisan Card */}
                <button
                  type="button"
                  id="welcome-role-artisan-btn"
                  onClick={() => switchMode('artisan-register')}
                  className="group relative p-5 sm:p-5.5 rounded-2xl bg-white hover:bg-rose-50/40 border border-rose-100/90 hover:border-[#E8A5B5] transition-all duration-200 text-left shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between h-full min-h-[160px]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF0F3] border border-rose-200/80 flex items-center justify-center text-[#C84B68] shrink-0 group-hover:scale-105 group-hover:bg-[#C84B68] group-hover:text-white transition-all shadow-2xs">
                        <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="p-1 rounded-full text-stone-400 group-hover:text-[#C84B68] group-hover:translate-x-1 transition-all">
                        <ArrowRight className="w-4 h-4 text-[#86293D]/60 group-hover:text-[#C84B68]" />
                      </div>
                    </div>
                    <h3 className="font-serif font-bold text-[#4A1525] text-base sm:text-lg group-hover:text-[#C84B68] transition-colors mt-3">
                      {t('auth_artisan_role', "I'm an Artisan")}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {t('auth_artisan_role_desc', 'Share your skills and earn locally from home with voice listing.')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-rose-50 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] bg-[#FFF0F3] text-[#86293D] px-2.5 py-0.5 rounded-full font-bold border border-rose-200/80 whitespace-nowrap">
                      Voice-First
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium whitespace-nowrap">
                      {t('hero_stat_voice_desc', 'Zero typing needed')}
                    </span>
                  </div>
                </button>

                {/* 2. Buyer Card */}
                <button
                  type="button"
                  id="welcome-role-buyer-btn"
                  onClick={() => switchMode('buyer-register')}
                  className="group relative p-5 sm:p-5.5 rounded-2xl bg-white hover:bg-rose-50/40 border border-rose-100/90 hover:border-[#E8A5B5] transition-all duration-200 text-left shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between h-full min-h-[160px]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF0F3] border border-rose-200/80 flex items-center justify-center text-[#C84B68] shrink-0 group-hover:scale-105 group-hover:bg-[#C84B68] group-hover:text-white transition-all shadow-2xs">
                        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="p-1 rounded-full text-stone-400 group-hover:text-[#C84B68] group-hover:translate-x-1 transition-all">
                        <ArrowRight className="w-4 h-4 text-[#86293D]/60 group-hover:text-[#C84B68]" />
                      </div>
                    </div>
                    <h3 className="font-serif font-bold text-[#4A1525] text-base sm:text-lg group-hover:text-[#C84B68] transition-colors mt-3">
                      {t('auth_buyer_role', "I'm a Buyer")}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {t('auth_buyer_role_desc', 'Find authentic crafts and trusted women makers right in your neighborhood.')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-rose-50 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] bg-rose-50 text-[#86293D] px-2.5 py-0.5 rounded-full font-bold border border-rose-200/80 whitespace-nowrap">
                      Hyperlocal Zone
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium whitespace-nowrap">
                      Near your location
                    </span>
                  </div>
                </button>

                {/* 3. Runner Card */}
                <button
                  type="button"
                  id="welcome-role-runner-btn"
                  onClick={() => switchMode('runner-register')}
                  className="group relative p-5 sm:p-5.5 rounded-2xl bg-white hover:bg-rose-50/40 border border-rose-100/90 hover:border-[#E8A5B5] transition-all duration-200 text-left shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between h-full min-h-[160px]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF0F3] border border-rose-200/80 flex items-center justify-center text-[#C84B68] shrink-0 group-hover:scale-105 group-hover:bg-[#C84B68] group-hover:text-white transition-all shadow-2xs">
                        <Bike className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="p-1 rounded-full text-stone-400 group-hover:text-[#C84B68] group-hover:translate-x-1 transition-all">
                        <ArrowRight className="w-4 h-4 text-[#86293D]/60 group-hover:text-[#C84B68]" />
                      </div>
                    </div>
                    <h3 className="font-serif font-bold text-[#4A1525] text-base sm:text-lg group-hover:text-[#C84B68] transition-colors mt-3">
                      {t('auth_runner_role', "I'm a Runner")}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {t('auth_runner_role_desc', 'Deliver neighborhood orders and earn flexible income with instant payouts.')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-rose-50 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] bg-rose-50 text-[#86293D] px-2.5 py-0.5 rounded-full font-bold border border-rose-200/80 whitespace-nowrap">
                      Flexible Work
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium whitespace-nowrap">
                      Pick up & deliver nearby
                    </span>
                  </div>
                </button>

                {/* 4. Admin Card */}
                <button
                  type="button"
                  id="welcome-role-admin-btn"
                  onClick={() => switchMode('admin-login')}
                  className="group relative p-5 sm:p-5.5 rounded-2xl bg-white hover:bg-rose-50/40 border border-rose-100/90 hover:border-[#E8A5B5] transition-all duration-200 text-left shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between h-full min-h-[160px]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF0F3] border border-rose-200/80 flex items-center justify-center text-[#C84B68] shrink-0 group-hover:scale-105 group-hover:bg-[#C84B68] group-hover:text-white transition-all shadow-2xs">
                        <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="p-1 rounded-full text-stone-400 group-hover:text-[#C84B68] group-hover:translate-x-1 transition-all">
                        <ArrowRight className="w-4 h-4 text-[#86293D]/60 group-hover:text-[#C84B68]" />
                      </div>
                    </div>
                    <h3 className="font-serif font-bold text-[#4A1525] text-base sm:text-lg group-hover:text-[#C84B68] transition-colors mt-3">
                      {t('auth_admin_role', "I'm an Admin")}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {t('auth_admin_role_desc', 'Oversee community health, verifications, platform metrics, and logistics.')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-rose-50 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full font-bold border border-stone-200 whitespace-nowrap">
                      Platform Management
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium whitespace-nowrap">
                      Operations & users
                    </span>
                  </div>
                </button>
              </div>

              {/* Already have an account? Section */}
              <div className="pt-4 border-t border-rose-100/90 text-xs text-stone-500 space-y-2">
                <p className="font-medium text-stone-600">{t('auth_switch_to_login', 'Already have an account?')}</p>
                <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 gap-y-1.5 font-medium">
                  <button
                    type="button"
                    id="welcome-login-artisan-btn"
                    onClick={() => switchMode('artisan-login')}
                    className="text-[#C84B68] hover:text-[#86293D] font-bold underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    {t('nav_maker', 'Artisan')} {t('nav_login', 'Login')}
                  </button>
                  <span className="text-rose-200">•</span>
                  <button
                    type="button"
                    id="welcome-login-buyer-btn"
                    onClick={() => switchMode('buyer-login')}
                    className="text-[#C84B68] hover:text-[#86293D] font-bold underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    {t('nav_buyer', 'Buyer')} {t('nav_login', 'Login')}
                  </button>
                  <span className="text-rose-200">•</span>
                  <button
                    type="button"
                    id="welcome-login-runner-btn"
                    onClick={() => switchMode('runner-login')}
                    className="text-[#C84B68] hover:text-[#86293D] font-bold underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    {t('nav_runner', 'Runner')} {t('nav_login', 'Login')}
                  </button>
                  <span className="text-rose-200">•</span>
                  <button
                    type="button"
                    id="welcome-login-admin-btn"
                    onClick={() => switchMode('admin-login')}
                    className="text-[#86293D] hover:text-[#4A1525] font-bold underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    {t('nav_admin', 'Admin')} {t('nav_login', 'Login')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* UNIFIED / ROLE LOGIN VIEWS                                */}
          {/* (Handles mode === 'login', 'artisan-login', 'buyer-login', */}
          {/*  'runner-login', 'admin-login')                           */}
          {/* ========================================================= */}
          {isAnyLoginMode && (
            <form onSubmit={handleCurrentLoginSubmit} className="space-y-4">
              {/* Role Selection Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#86293D] uppercase tracking-wider">
                    Select Your Portal
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Sign in with your role
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 bg-rose-50/70 border border-rose-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => handleSelectLoginTab('artisan')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      effectiveLoginRole === 'artisan'
                        ? 'bg-[#C84B68] text-white shadow-xs'
                        : 'text-stone-600 hover:text-[#4A1525] hover:bg-white/60'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{t('nav_maker', 'Artisan')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectLoginTab('buyer')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      effectiveLoginRole === 'buyer'
                        ? 'bg-[#86293D] text-white shadow-xs'
                        : 'text-stone-600 hover:text-[#4A1525] hover:bg-white/60'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t('nav_buyer', 'Buyer')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectLoginTab('runner')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      effectiveLoginRole === 'runner'
                        ? 'bg-[#4A1525] text-white shadow-xs'
                        : 'text-stone-600 hover:text-[#4A1525] hover:bg-white/60'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>{t('nav_runner', 'Runner')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectLoginTab('admin')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      effectiveLoginRole === 'admin'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-600 hover:text-[#4A1525] hover:bg-white/60'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('nav_admin', 'Admin')}</span>
                  </button>
                </div>
              </div>

              {/* Portal Header Information */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#86293D] text-[11px] font-bold mb-2 border border-rose-200/80">
                  {effectiveLoginRole === 'artisan' && <Mic className="w-3.5 h-3.5 text-[#C84B68]" />}
                  {effectiveLoginRole === 'buyer' && <ShoppingBag className="w-3.5 h-3.5 text-[#C84B68]" />}
                  {effectiveLoginRole === 'runner' && <Bike className="w-3.5 h-3.5 text-[#C84B68]" />}
                  {effectiveLoginRole === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-[#86293D]" />}
                  <span className="capitalize">{effectiveLoginRole} Portal Login</span>
                </div>
                <h2 className="text-xl font-black font-serif text-[#4A1525]">
                  {effectiveLoginRole === 'artisan' && 'Welcome back, Artisan'}
                  {effectiveLoginRole === 'buyer' && 'Welcome back, Buyer'}
                  {effectiveLoginRole === 'runner' && 'Welcome back, Runner'}
                  {effectiveLoginRole === 'admin' && 'Administrator Authentication'}
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  {effectiveLoginRole === 'artisan' && 'Access your orders, earnings balance and voice listings.'}
                  {effectiveLoginRole === 'buyer' && 'Discover local handmade crafts, tracking and saved artisans.'}
                  {effectiveLoginRole === 'runner' && 'View neighborhood deliveries, active runs and daily payouts.'}
                  {effectiveLoginRole === 'admin' && 'Protected administrative console for KanyaKriti operations.'}
                </p>
              </div>

              {/* Admin Notice */}
              {effectiveLoginRole === 'admin' && (
                <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>Restricted Access:</strong> Public admin registration is disabled. Only pre-authorized administrator accounts can authenticate.
                  </span>
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#4A1525] mb-1">
                    {effectiveLoginRole === 'admin' ? 'Admin Email or Phone' : 'Email or Phone Number'}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        effectiveLoginRole === 'artisan' ? 'e.g. sunita.devi@kanyakriti.local or +91 98450 12345'
                        : effectiveLoginRole === 'buyer' ? 'e.g. priya.sharma@example.com or +91 99001 11223'
                        : effectiveLoginRole === 'runner' ? 'e.g. ramesh.kumar@runner.kanyakriti.local or +91 98888 11111'
                        : 'e.g. admin@kanyakriti.org'
                      }
                      className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#4A1525]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot-password')}
                      className="text-[11px] text-[#C84B68] hover:text-[#86293D] font-semibold hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Fill Demo Credentials */}
              <button
                type="button"
                onClick={() => {
                  if (effectiveLoginRole === 'artisan') {
                    setIdentifier('sunita.devi@kanyakriti.local');
                    setPassword('KanyaKriti@2026');
                  } else if (effectiveLoginRole === 'buyer') {
                    setIdentifier('priya.sharma@example.com');
                    setPassword('KanyaKriti@2026');
                  } else if (effectiveLoginRole === 'runner') {
                    setIdentifier('ramesh.kumar@runner.kanyakriti.local');
                    setPassword('KanyaKriti@2026');
                  } else if (effectiveLoginRole === 'admin') {
                    setIdentifier('admin@kanyakriti.org');
                    setPassword('KanyaKriti@2026');
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-rose-50/80 border border-rose-200 text-[#86293D] text-[11px] font-semibold hover:bg-rose-100/70 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#C84B68]" />
                <span>
                  {effectiveLoginRole === 'artisan' && 'Quick-fill Demo Artisan (Sunita Devi)'}
                  {effectiveLoginRole === 'buyer' && 'Quick-fill Demo Buyer (Priya Sharma)'}
                  {effectiveLoginRole === 'runner' && 'Quick-fill Demo Runner (Ramesh Kumar)'}
                  {effectiveLoginRole === 'admin' && 'Quick-fill Demo Admin (Ananya Deshmukh)'}
                </span>
              </button>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#C84B68] hover:bg-[#B33956] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {effectiveLoginRole === 'artisan' && 'Log In as Artisan'}
                        {effectiveLoginRole === 'buyer' && 'Log In as Buyer'}
                        {effectiveLoginRole === 'runner' && 'Log In as Runner'}
                        {effectiveLoginRole === 'admin' && 'Authenticate & Enter Admin Portal'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Switcher */}
              <div className="text-center text-xs text-stone-500 pt-3 border-t border-rose-100/90">
                {effectiveLoginRole === 'artisan' && (
                  <>
                    <span>New to KanyaKriti? </span>
                    <button
                      type="button"
                      onClick={() => switchMode('artisan-register')}
                      className="text-[#C84B68] hover:text-[#86293D] font-bold hover:underline cursor-pointer"
                    >
                      Create Artisan Account
                    </button>
                  </>
                )}
                {effectiveLoginRole === 'buyer' && (
                  <>
                    <span>New to KanyaKriti? </span>
                    <button
                      type="button"
                      onClick={() => switchMode('buyer-register')}
                      className="text-[#C84B68] hover:text-[#86293D] font-bold hover:underline cursor-pointer"
                    >
                      Create Buyer Account
                    </button>
                  </>
                )}
                {effectiveLoginRole === 'runner' && (
                  <>
                    <span>Want to earn by delivering? </span>
                    <button
                      type="button"
                      onClick={() => switchMode('runner-register')}
                      className="text-[#C84B68] hover:text-[#86293D] font-bold hover:underline cursor-pointer"
                    >
                      Register as Runner
                    </button>
                  </>
                )}
                {effectiveLoginRole === 'admin' && (
                  <span>
                    Need administration access? Contact KanyaKriti Security Operations.
                  </span>
                )}
              </div>
            </form>
          )}

          {/* ========================================== */}
          {/* VIEW 2: ARTISAN REGISTRATION               */}
          {/* ========================================== */}
          {mode === 'artisan-register' && (
            <form onSubmit={handleArtisanRegister} className="space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#86293D] text-[11px] font-bold mb-2 border border-rose-200/80">
                  <Mic className="w-3.5 h-3.5 text-[#C84B68]" />
                  <span>Join as an Artisan</span>
                </div>
                <h2 className="text-xl font-black font-serif text-[#4A1525]">
                  Create Artisan Account
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Start selling your handmade crafts right from home using your voice.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#4A1525] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sunita Devi"
                      className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A1525] mb-1">
                    Phone Number or Email *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="+91 98450 12345 or email@domain.com"
                      className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      {t('voice_listening_in', 'Voice Language')}
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                      <select
                        value={preferredLanguage}
                        onChange={(e) => handlePreferredLanguageChange(e.target.value)}
                        className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.name}>
                            {lang.name} ({lang.nativeName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      Neighborhood
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="e.g. Sector 4, Local Hub"
                        className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#C84B68] hover:bg-[#B33956] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Artisan Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Artisan Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-xs text-stone-500 pt-3 border-t border-rose-100/90">
                <span>Already have an artisan account? </span>
                <button
                  type="button"
                  onClick={() => switchMode('artisan-login')}
                  className="text-[#C84B68] hover:text-[#86293D] font-bold hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* ========================================== */}
          {/* VIEW 4: BUYER REGISTRATION                 */}
          {/* ========================================== */}
          {mode === 'buyer-register' && (
            <form onSubmit={handleBuyerRegister} className="space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#86293D] text-[11px] font-bold mb-2 border border-rose-200/80">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#C84B68]" />
                  <span>Join as a Buyer</span>
                </div>
                <h2 className="text-xl font-black font-serif text-[#4A1525]">
                  Create Buyer Account
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Discover verified women makers and artisans right next to you.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#4A1525] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A1525] mb-1">
                    Phone Number or Email *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="+91 99001 11223 or priya.sharma@example.com"
                      className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A1525] mb-1">
                    Your Neighborhood / Colony
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="e.g. Indiranagar, Local Hub"
                      className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#C84B68] hover:bg-[#B33956] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Buyer Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Buyer Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-xs text-stone-500 pt-3 border-t border-rose-100/90">
                <span>Already have a buyer account? </span>
                <button
                  type="button"
                  onClick={() => switchMode('buyer-login')}
                  className="text-[#C84B68] hover:text-[#86293D] font-bold hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* ========================================== */}
          {/* VIEW 6: RUNNER REGISTRATION                */}
          {/* ========================================== */}
          {mode === 'runner-register' && (
            <form onSubmit={handleRunnerRegister} className="space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#86293D] text-[11px] font-bold mb-2 border border-rose-200/80">
                  <Bike className="w-3.5 h-3.5 text-[#C84B68]" />
                  <span>Join as a Runner</span>
                </div>
                <h2 className="text-xl font-black font-serif text-[#4A1525]">
                  Register as Neighborhood Runner
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Deliver orders between local makers and buyers. Flexible hours, instant payouts.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#4A1525] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A1525] mb-1">
                    Phone Number or Email *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="+91 98888 11111 or email@domain.com"
                      className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                    >
                      <option value="Bicycle">Bicycle (Eco-Friendly)</option>
                      <option value="Electric Two-Wheeler">Electric Two-Wheeler (EV)</option>
                      <option value="Motorcycle / Scooter">Motorcycle / Scooter</option>
                      <option value="On Foot / Walking">On Foot / Walking (Dense Area)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      Base Neighborhood
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="e.g. Hub Station"
                        className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#C84B68] hover:bg-[#B33956] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Runner Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Runner Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-xs text-stone-500 pt-3 border-t border-rose-100/90">
                <span>Already have a runner account? </span>
                <button
                  type="button"
                  onClick={() => switchMode('runner-login')}
                  className="text-[#C84B68] hover:text-[#86293D] font-bold hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* ========================================== */}
          {/* VIEW 9: FORGOT PASSWORD                    */}
          {/* ========================================== */}
          {mode === 'forgot-password' && (
            <div className="space-y-4 py-2">
              <div>
                <h2 className="text-xl font-black font-serif text-[#4A1525]">
                  Reset Password
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Enter your registered phone number or email to receive a recovery code.
                </p>
              </div>

              {forgotSubmitted ? (
                <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200 text-center space-y-2.5">
                  <CheckCircle2 className="w-8 h-8 text-[#C84B68] mx-auto" />
                  <h4 className="font-serif font-bold text-[#4A1525] text-base">Recovery Link Dispatched</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    If an account exists for <strong>{identifier || 'your details'}</strong>, instructions have been sent to reset your password.
                  </p>
                  <button
                    type="button"
                    onClick={() => switchMode('role-select')}
                    className="mt-3 text-xs text-[#C84B68] hover:text-[#86293D] font-bold underline cursor-pointer"
                  >
                    Return to Role Selection
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      Email or Phone Number
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#86293D]/60 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. +91 98450 12345 or email@domain.com"
                        className="w-full bg-[#FAF7F5] border border-rose-200/80 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForgotSubmitted(true)}
                    className="w-full py-3 bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    Send Recovery Code
                  </button>
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => switchMode('role-select')}
                      className="text-xs text-stone-500 hover:text-[#86293D] font-semibold underline cursor-pointer"
                    >
                      Back to Role Selection
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
