import React, { useState } from 'react';
import {
  Bell,
  RotateCcw,
  Wifi,
  WifiOff,
  Compass,
  ShoppingBag,
  Bike,
  Shield,
  Palette,
  LogOut,
  LogIn,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Mic,
  Menu,
  X,
  Sparkles,
  User as UserIcon,
  Search,
  ChevronDown,
  Globe,
  Loader2,
} from 'lucide-react';
import { User, NotificationItem, ArtisanProfile } from '../types.ts';
import { AuthViewMode } from './AuthModal.tsx';
import { useCurrentLocation } from '../context/LocationContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LotusLogo } from './LotusLogo.tsx';

interface HeaderProps {
  currentUser: User | null;
  activeView?: 'home' | 'artisan' | 'buyer' | 'runner' | 'admin';
  onSelectView?: (view: 'home' | 'artisan' | 'buyer' | 'runner' | 'admin') => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onSwitchUser: (role: 'artisan' | 'buyer' | 'runner' | 'admin') => void;
  onOpenVoiceModal: () => void;
  onOpenDemoTour: () => void;
  onResetDemo: () => void;
  onOpenAuthModal: (mode?: AuthViewMode) => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  artisanProfile?: ArtisanProfile;
  isOffline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeView = 'home',
  onSelectView,
  isDemoMode,
  onToggleDemoMode,
  onSwitchUser,
  onOpenVoiceModal,
  onOpenDemoTour,
  onResetDemo,
  onOpenAuthModal,
  onLogout,
  notifications,
  isOffline,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = notifications.filter((n) => !n.read).length;
  const { location, status: locationStatus, requestLocation, openNeighbourhoodModal } = useCurrentLocation();
  const { selectedLanguageCode, setLanguageCode, supportedLanguages, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F5]/95 backdrop-blur-md border-b border-rose-100/60 text-stone-800">
      {/* 1. TOP UTILITY MICRO-BAR */}
      <div className="bg-[#FAF3F0] px-4 sm:px-6 py-1.5 text-xs flex items-center justify-between border-b border-rose-100/80 text-stone-600">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenDemoTour}
            className="inline-flex items-center gap-1.5 text-[#86293D] hover:text-[#4A1525] font-semibold cursor-pointer transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-[#C84B68]" />
            <span>{t('header_walkthrough', '3-Minute Demo Walkthrough')}</span>
            <span className="bg-rose-100 text-[#86293D] text-[10px] px-1.5 py-0.5 rounded-full font-medium">
              Guide
            </span>
          </button>
          <span className="text-rose-200 hidden sm:inline">•</span>

          {/* Hyperlocal Dynamic Location Status */}
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px]">
            {locationStatus === 'detecting' && (
              <span className="inline-flex items-center gap-1.5 text-stone-500">
                <Loader2 className="w-3 h-3 text-[#C84B68] animate-spin" />
                <span>Detecting your neighbourhood…</span>
              </span>
            )}
            {locationStatus === 'granted' && location && (
              <span className="inline-flex items-center gap-1.5 text-[#4A1525] font-medium">
                <MapPin className="w-3 h-3 text-[#C84B68]" />
                <span>
                  Your Neighbourhood • <strong className="font-bold text-[#86293D]">{location.locality || location.city || location.displayName}</strong>
                </span>
                <button
                  type="button"
                  onClick={openNeighbourhoodModal}
                  className="text-[#C84B68] hover:text-[#86293D] underline font-bold text-[10px] ml-1 cursor-pointer"
                >
                  Change
                </button>
              </span>
            )}
            {(locationStatus === 'denied' ||
              locationStatus === 'unavailable' ||
              (locationStatus !== 'detecting' && !location)) && (
              <span className="inline-flex items-center gap-1.5 text-stone-500">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>Location unavailable •</span>
                <button
                  type="button"
                  onClick={openNeighbourhoodModal}
                  className="text-[#C84B68] hover:text-[#86293D] underline font-bold cursor-pointer"
                >
                  Choose your neighbourhood
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Demo Mode Switcher (Default OFF) */}
          <button
            type="button"
            onClick={onToggleDemoMode}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
              isDemoMode
                ? 'bg-rose-100 text-[#86293D] border-[#E8A5B5] shadow-xs'
                : 'bg-white text-stone-500 border-stone-200 hover:text-stone-800'
            }`}
            title="Toggle Demo Mode for judging"
          >
            {isDemoMode ? (
              <>
                <ToggleRight className="w-3.5 h-3.5 text-[#C84B68]" />
                <span>DEMO MODE (ON)</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-3.5 h-3.5 text-stone-400" />
                <span>Demo Switcher (OFF)</span>
              </>
            )}
          </button>

          {/* Network connectivity status */}
          <div className="flex items-center gap-1 text-[11px]">
            {isOffline ? (
              <span className="flex items-center gap-1 text-rose-600 font-medium">
                <WifiOff className="w-3 h-3" /> Offline Mode
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 font-medium hidden md:flex">
                <Wifi className="w-3 h-3" /> Live
              </span>
            )}
          </div>

          {/* Reset Demo State Button */}
          <button
            type="button"
            onClick={onResetDemo}
            title="Reset database to initial pristine state for judging"
            className="flex items-center gap-1 text-stone-500 hover:text-[#86293D] px-2 py-0.5 rounded hover:bg-rose-50 text-[11px] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN FLOATING ELEGANT NAVBAR CONTAINER */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full border border-rose-100/90 shadow-sm shadow-rose-900/5 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Brand & Tagline */}
          <button
            type="button"
            onClick={() => onSelectView?.('home')}
            className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer group shrink-0"
            title="Go to KanyaKriti Mission Home"
          >
            <LotusLogo className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-105" />
            <div>
              <div className="flex items-baseline gap-1.5">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#4A1525] tracking-tight group-hover:text-[#86293D] transition-colors">
                  KanyaKriti
                </h1>
                {isDemoMode && (
                  <span className="text-[9px] bg-rose-50 text-[#86293D] font-bold px-1.5 py-0.2 rounded-full border border-rose-200">
                    DEMO
                  </span>
                )}
              </div>
              <span className="block text-[9px] sm:text-[10px] tracking-[0.25em] text-[#86293D] font-bold uppercase font-sans -mt-0.5">
                SKILL • VOICE • MARKET
              </span>
            </div>
          </button>

          {/* Center Search Pill (From Reference Design) */}
          <div className="hidden lg:flex items-center relative flex-1 max-w-xs mx-3">
            <Search className="w-3.5 h-3.5 text-[#8C7A80] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav_search_placeholder', 'Search your dashboard...')}
              className="w-full bg-[#FAF7F5] border border-rose-100 rounded-full pl-9 pr-3.5 py-1.5 text-xs text-[#4A1525] placeholder:text-[#8C7A80] focus:outline-none focus:border-[#C84B68] focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelectView?.('home')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                activeView === 'home'
                  ? 'text-[#86293D] bg-rose-50 font-bold'
                  : 'text-stone-600 hover:text-[#86293D] hover:bg-stone-50'
              }`}
            >
              {t('nav_mission', 'Mission')}
            </button>
            <button
              type="button"
              onClick={() => onSelectView?.('buyer')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                activeView === 'buyer'
                  ? 'text-[#86293D] bg-rose-50 font-bold'
                  : 'text-stone-600 hover:text-[#86293D] hover:bg-stone-50'
              }`}
            >
              {t('nav_marketplace', 'Marketplace')}
            </button>

            {/* Persona Switchers if Demo Mode is ACTIVE */}
            {isDemoMode && (
              <div className="flex items-center bg-rose-50/70 p-0.5 rounded-full border border-rose-200/80 ml-1">
                <button
                  type="button"
                  onClick={() => {
                    onSwitchUser('artisan');
                    onSelectView?.('artisan');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    activeView === 'artisan' && currentUser?.role === 'artisan'
                      ? 'bg-[#C84B68] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Palette className="w-3 h-3" />
                  <span>{t('role_artisan', 'Maker')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSwitchUser('buyer');
                    onSelectView?.('buyer');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    activeView === 'buyer' && currentUser?.role === 'buyer'
                      ? 'bg-[#86293D] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>{t('role_buyer', 'Buyer')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSwitchUser('runner');
                    onSelectView?.('runner');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    activeView === 'runner' && currentUser?.role === 'runner'
                      ? 'bg-[#4A1525] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Bike className="w-3 h-3" />
                  <span>{t('role_runner', 'Runner')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSwitchUser('admin');
                    onSelectView?.('admin');
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    activeView === 'admin' && currentUser?.role === 'admin'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>{t('role_admin', 'Admin')}</span>
                </button>
              </div>
            )}
          </nav>

          {/* Right Action Group */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Location Display Pill (From Reference Design) */}
            <div
              id="header-neighbourhood-pill"
              onClick={openNeighbourhoodModal}
              className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#FFF9FA] hover:bg-rose-50 border border-rose-200/80 rounded-full cursor-pointer transition-all shadow-2xs group"
              title="Click to change your active neighbourhood"
            >
              <div className="w-6 h-6 rounded-full bg-[#FFF0F3] group-hover:bg-[#FFE4EA] flex items-center justify-center text-[#C84B68] transition-colors">
                {locationStatus === 'detecting' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="text-left">
                <div className="text-[9px] uppercase font-bold text-[#8C7A80] leading-none tracking-wider">
                  Your Neighbourhood
                </div>
                <div className="text-[11px] font-bold text-[#4A1525] leading-tight flex items-center gap-0.5">
                  <span className="truncate max-w-[105px]">
                    {locationStatus === 'detecting'
                      ? 'Detecting…'
                      : (location?.locality || location?.city || 'Select Area')}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#8C7A80] group-hover:text-[#C84B68] transition-colors" />
                </div>
              </div>
            </div>

            {/* Language Selector (23 Indian Languages with English Default) */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-[#86293D] absolute left-2.5 pointer-events-none" />
              <select
                value={selectedLanguageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                className="bg-[#FAF7F5] hover:bg-white border border-rose-200/80 text-[#4A1525] text-xs rounded-full pl-8 pr-2.5 py-1.5 font-semibold focus:outline-none focus:border-[#C84B68] focus:ring-1 focus:ring-[#C84B68] cursor-pointer shadow-2xs transition-all"
                title="Select language"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications Button with Pink Dot */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-full text-stone-600 hover:text-[#86293D] hover:bg-rose-50 transition-colors cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#C84B68] rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-rose-100 rounded-2xl shadow-xl overflow-hidden z-[100] text-stone-800">
                  <div className="p-3 bg-[#FAF3F0] border-b border-rose-100 flex items-center justify-between text-xs font-semibold text-[#4A1525]">
                    <span>Recent Notifications ({unreadCount})</span>
                    <button
                      type="button"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-stone-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 text-xs ${notif.read ? 'bg-white' : 'bg-rose-50/50'}`}
                        >
                          <div className="font-semibold text-stone-900">{notif.title}</div>
                          <div className="text-stone-600 mt-0.5">{notif.message}</div>
                          <div className="text-[10px] text-stone-400 mt-1">
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill (From Reference Design) */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-[#FFF9FA] hover:bg-rose-50 pl-1.5 pr-3 py-1 rounded-full border border-rose-100 text-xs transition-colors cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-xl object-cover border border-rose-200"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="font-bold text-[#4A1525] text-[11px] leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] capitalize text-[#86293D] font-medium">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8C7A80]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-rose-100 shadow-xl py-2 z-[100] text-xs">
                    <div className="px-3 py-1.5 border-b border-rose-50 text-[11px] text-stone-500 font-medium">
                      Signed in as <strong className="text-[#4A1525]">{currentUser.name}</strong>
                    </div>

                    {/* Role-Aware Primary Dashboard Routing */}
                    {(() => {
                      const userRole = (currentUser.role?.toLowerCase() || 'buyer') as
                        | 'artisan'
                        | 'buyer'
                        | 'runner'
                        | 'admin';

                      return (
                        <>
                          {userRole === 'buyer' && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectView?.('buyer');
                                setUserDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2 text-left font-bold text-[#86293D] hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 text-[#86293D]" />
                              <span>{t('buyer_dashboard', 'Buyer Dashboard')}</span>
                            </button>
                          )}

                          {userRole === 'artisan' && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectView?.('artisan');
                                setUserDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2 text-left font-bold text-[#86293D] hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Palette className="w-3.5 h-3.5 text-[#C84B68]" />
                              <span>{t('artisan_dashboard', 'Artisan Dashboard')}</span>
                            </button>
                          )}

                          {userRole === 'runner' && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectView?.('runner');
                                setUserDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2 text-left font-bold text-[#86293D] hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Bike className="w-3.5 h-3.5 text-[#4A1525]" />
                              <span>{t('runner_dashboard', 'Runner Dashboard')}</span>
                            </button>
                          )}

                          {userRole === 'admin' && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectView?.('admin');
                                setUserDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2 text-left font-bold text-[#86293D] hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Shield className="w-3.5 h-3.5 text-stone-900" />
                              <span>{t('admin_dashboard', 'Admin Dashboard')}</span>
                            </button>
                          )}

                          {/* Secondary Marketplace link if not already on Buyer dashboard */}
                          {userRole !== 'buyer' && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectView?.('buyer');
                                setUserDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2 text-left text-stone-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 text-[#86293D]" />
                              <span>{t('nav_marketplace', 'Browse Marketplace')}</span>
                            </button>
                          )}

                          {/* Mission & Story */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectView?.('home');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-stone-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Compass className="w-3.5 h-3.5 text-stone-500" />
                            <span>{t('nav_mission', 'Mission & Story')}</span>
                          </button>
                        </>
                      );
                    })()}

                    <div className="border-t border-rose-50 my-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[#86293D] hover:bg-rose-50 font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav_logout', 'Log Out')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                {/* Log In */}
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 hover:text-[#86293D] hover:bg-rose-50/80 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#C84B68]" />
                  <span>{t('nav_login', 'Log In')}</span>
                </button>

                {/* Get Started - Rose Primary Button */}
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('role-select')}
                  className="px-4 sm:px-5 py-2 rounded-full text-xs font-semibold bg-[#C84B68] hover:bg-[#B33956] text-white shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('nav_get_started', 'Get Started')}</span>
                </button>
              </div>
            )}

            {/* Speak Your Skill - Secondary Rose Outline Button */}
            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white hover:bg-rose-50/80 text-[#86293D] font-semibold text-xs rounded-full border border-[#E8A5B5] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-[#C84B68] shrink-0" />
              <span className="hidden md:inline">{t('btn_speak_skill', 'Speak Your Skill')}</span>
              <span className="md:hidden">{t('btn_speak', 'Speak')}</span>
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-full text-stone-600 hover:text-[#86293D] hover:bg-rose-50 transition-colors cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#C84B68] rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-rose-100 rounded-2xl shadow-xl overflow-hidden z-[100] text-stone-800">
                  <div className="p-3 bg-[#FAF3F0] border-b border-rose-100 flex items-center justify-between text-xs font-semibold text-[#4A1525]">
                    <span>Live Activity Stream</span>
                    <span className="text-[10px] text-[#86293D] bg-white px-2 py-0.5 rounded-full border border-rose-200">
                      Realtime SSE
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-rose-50 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-stone-500 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-3 hover:bg-rose-50/40 transition-colors">
                          <div className="font-semibold text-[#4A1525] text-xs flex items-center justify-between">
                            <span>{notif.title}</span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-stone-600 text-[11px] mt-0.5">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-stone-600 hover:text-[#86293D] hover:bg-rose-50 lg:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="mt-2 p-4 bg-white/98 rounded-2xl border border-rose-100 shadow-lg lg:hidden space-y-3">
            <div className="flex flex-col gap-1.5">
              {currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    const role = (currentUser.role?.toLowerCase() || 'buyer') as 'artisan' | 'buyer' | 'runner' | 'admin';
                    onSelectView?.(role);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    activeView === (currentUser.role?.toLowerCase() || 'buyer')
                      ? 'bg-rose-100 text-[#86293D]'
                      : 'bg-rose-50 text-[#86293D] hover:bg-rose-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C84B68]" />
                  <span>
                    {currentUser.role?.toLowerCase() === 'buyer'
                      ? t('buyer_dashboard', 'Buyer Dashboard')
                      : currentUser.role?.toLowerCase() === 'artisan'
                      ? t('artisan_dashboard', 'Artisan Dashboard')
                      : currentUser.role?.toLowerCase() === 'runner'
                      ? t('runner_dashboard', 'Runner Dashboard')
                      : t('admin_dashboard', 'Admin Dashboard')}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onSelectView?.('home');
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                  activeView === 'home' ? 'bg-rose-50 text-[#86293D]' : 'text-stone-700'
                }`}
              >
                {t('nav_mission', 'Mission & Story')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectView?.('buyer');
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                  activeView === 'buyer' ? 'bg-rose-50 text-[#86293D]' : 'text-stone-700'
                }`}
              >
                {t('nav_marketplace', 'Browse Marketplace')}
              </button>
            </div>

            <div className="pt-2 border-t border-rose-100 flex flex-col gap-2">
              {!currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-center text-xs font-semibold text-stone-700 bg-stone-50 rounded-xl"
                  >
                    {t('nav_login', 'Log In')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal('role-select');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-center text-xs font-semibold bg-[#C84B68] text-white rounded-xl shadow-xs"
                  >
                    {t('nav_get_started', 'Get Started')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-rose-700 bg-rose-50 rounded-xl"
                >
                  {t('nav_logout', 'Log Out')} ({currentUser.name})
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
