import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { ArtisanView } from './components/ArtisanView.tsx';
import { BuyerView } from './components/BuyerView.tsx';
import { RunnerView } from './components/RunnerView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { PublicHomePage } from './components/PublicHomePage.tsx';
import { Footer } from './components/Footer.tsx';
import { VoiceArtisanModal } from './components/VoiceArtisanModal.tsx';
import { DemoTourModal } from './components/DemoTourModal.tsx';
import { AuthModal, AuthViewMode } from './components/AuthModal.tsx';
import { User, ArtisanProfile, Listing, Order, NotificationItem } from './types.ts';
import {
  fetchArtisans,
  fetchListings,
  fetchOrders,
  fetchNotifications,
  resetDemo,
  fetchCurrentUser,
  logoutUser,
} from './lib/api.ts';
import { ShieldAlert, ArrowLeft, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCurrentLocation } from './context/LocationContext.tsx';
import { useLanguage } from './context/LanguageContext.tsx';

export type AppView = 'home' | 'artisan' | 'buyer' | 'runner' | 'admin';

const DEMO_PERSONAS: Record<'artisan' | 'buyer' | 'runner' | 'admin', User> = {
  artisan: {
    id: 'artisan-1',
    name: 'Sunita Devi',
    email: 'sunita.devi@kanyakriti.local',
    role: 'artisan',
    phone: '+91 98450 12345',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    city: 'Local Area',
    neighborhood: 'Artisan Hub',
    lat: 12.9345,
    lng: 77.6265,
    created_at: '2026-09-01T08:00:00Z',
  },
  buyer: {
    id: 'buyer-1',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    role: 'buyer',
    phone: '+91 99001 11223',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    city: 'Local Area',
    neighborhood: 'Residential Sector',
    lat: 12.9352,
    lng: 77.6245,
    created_at: '2026-09-05T08:00:00Z',
  },
  runner: {
    id: 'runner-1',
    name: 'Ramesh Kumar',
    email: 'ramesh.kumar@runner.kanyakriti.local',
    role: 'runner',
    phone: '+91 98888 11111',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    city: 'Local Area',
    neighborhood: 'Hub Station',
    lat: 12.9348,
    lng: 77.6258,
    created_at: '2026-09-02T08:00:00Z',
  },
  admin: {
    id: 'admin-1',
    name: 'Ananya Deshmukh (Admin)',
    email: 'admin@kanyakriti.org',
    role: 'admin',
    phone: '+91 99999 00000',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    city: 'Local Area',
    neighborhood: 'Operations HQ',
    lat: 12.935,
    lng: 77.625,
    created_at: '2026-08-01T08:00:00Z',
  },
};

export function App() {
  const { t, resetLanguage } = useLanguage();
  // Demo Mode is OFF by default for every new session/user
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [activeRoleView, setActiveRoleView] = useState<AppView>('home');
  const { location: geoLoc } = useCurrentLocation();

  const getDynamicPersona = useCallback((role: 'artisan' | 'buyer' | 'runner' | 'admin'): User => {
    const base = DEMO_PERSONAS[role];
    if (geoLoc) {
      return {
        ...base,
        city: geoLoc.city || geoLoc.locality || base.city,
        neighborhood: geoLoc.locality || geoLoc.city || base.neighborhood,
        lat: geoLoc.latitude || base.lat,
        lng: geoLoc.longitude || base.lng,
      };
    }
    return base;
  }, [geoLoc]);

  // Authenticated user state: starts null until real login/signup or explicitly turning Demo Mode ON
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRealAuthSession, setIsRealAuthSession] = useState<boolean>(false);

  // Data collections
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Modals state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<AuthViewMode>('role-select');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load backend data
  const loadAllData = async () => {
    try {
      const [artisanList, listingList, orderList, notifList] = await Promise.all([
        fetchArtisans(),
        fetchListings(),
        fetchOrders(),
        fetchNotifications(),
      ]);
      setArtisans(artisanList);
      setListings(listingList);
      setOrders(orderList);
      setNotifications(notifList);
    } catch (err) {
      console.warn('Error loading KanyaKriti data:', err);
    }
  };

  // Initial mount & session check
  useEffect(() => {
    loadAllData();

    // Check if real session cookie exists
    fetchCurrentUser().then(({ user, isDemo }) => {
      if (user && !isDemo) {
        setCurrentUser(user);
        setIsRealAuthSession(true);
        setIsDemoMode(false);
        const normRole = (user.role?.toLowerCase() || 'buyer') as any;
        setActiveRoleView(normRole);
      }
    });

    // Connectivity handlers
    const onOnline = () => {
      setIsOffline(false);
      loadAllData();
    };
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Realtime events
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'ORDER_CREATED') {
          setOrders((prev) => [payload.order, ...prev]);
          showToast(`New order placed: ${payload.order.listingTitle}`);
        } else if (payload.type === 'ORDER_UPDATED') {
          setOrders((prev) => prev.map((o) => (o.id === payload.order.id ? payload.order : o)));
          showToast(`Order #${payload.order.id} status updated to ${payload.order.status}`);
        } else if (payload.type === 'NEW_LISTING') {
          setListings((prev) => [payload.listing, ...prev]);
          showToast(`New artisan listing published: ${payload.listing.title}`);
        } else if (payload.type === 'NOTIFICATION') {
          setNotifications((prev) => [payload.notification, ...prev]);
        } else if (payload.type === 'DEMO_RESET') {
          loadAllData();
          showToast('Database reset to initial demo state');
        }
      } catch (err) {
        // ignore
      }
    };

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      eventSource.close();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  // Demo Persona Switcher (only works when isDemoMode is enabled)
  const handleSwitchUser = (role: 'artisan' | 'buyer' | 'runner' | 'admin') => {
    setIsDemoMode(true);
    setActiveRoleView(role);
    const persona = getDynamicPersona(role);
    setCurrentUser(persona);
    setIsRealAuthSession(false);
    showToast(`Switched to Demo Persona: ${persona.name} (${role.toUpperCase()})`);
  };

  const handleToggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      if (next) {
        if (!currentUser) {
          const artisanPersona = getDynamicPersona('artisan');
          setCurrentUser(artisanPersona);
          setActiveRoleView('artisan');
        }
        showToast('Demo Mode turned ON (testing persona switcher available)');
      } else {
        if (!isRealAuthSession) {
          setCurrentUser(null);
          setActiveRoleView('home');
        }
        showToast('Demo Mode turned OFF (Real/Production mode)');
      }
      return next;
    });
  };

  // Real Authentication Handler
  const handleAuthSuccess = async (user: User, isNewArtisan = false) => {
    setCurrentUser(user);
    setIsRealAuthSession(true);
    setIsDemoMode(false); // real authenticated user exits pure demo mode

    const userRole = (user.role?.toLowerCase() || 'buyer') as 'artisan' | 'buyer' | 'runner' | 'admin';
    setActiveRoleView(userRole);

    await loadAllData();

    if (isNewArtisan && userRole === 'artisan') {
      showToast(`Welcome ${user.name}! Let's create your first voice listing.`);
      // Step-by-step: Immediately open Voice Modal for voice-first listing creation
      setTimeout(() => {
        setIsVoiceModalOpen(true);
      }, 500);
    } else {
      showToast(`Welcome back, ${user.name}!`);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    resetLanguage();
    setCurrentUser(null);
    setIsRealAuthSession(false);
    setIsDemoMode(false);
    setActiveRoleView('home');
    showToast(t('toast_logged_out', 'Logged out successfully.'));
  };

  const handleResetDemo = async () => {
    try {
      await resetDemo();
      await loadAllData();
      showToast(t('toast_demo_reset', 'Database reset to initial demo state'));
    } catch (err) {
      alert('Failed to reset demo data');
    }
  };

  const currentArtisanProfile =
    artisans.find((a) => a.userId === currentUser?.id || a.id === currentUser?.id) ||
    artisans[0] || {
      id: 'artisan-1',
      userId: 'artisan-1',
      name: currentUser?.name || 'Local Artisan',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      bio: 'Expert artisan with local neighborhood trust.',
      primarySkill: 'Garment Craftsmanship',
      skills: ['Tailoring', 'Alteration', 'Craft'],
      rating: 5.0,
      reviewCount: 1,
      totalEarned: 0,
      pendingBalance: 0,
      availableBalance: 0,
      firstThousandReached: false,
      approximateLat: 12.9345,
      approximateLng: 77.6265,
      neighborhood: currentUser?.neighborhood || 'Local Area',
      city: currentUser?.city || 'Local Zone',
      languages: ['Hindi', 'English'],
      phone: currentUser?.phone || '+91 98450 12345',
    };

  // Role Security Check for UI Rendering
  // An authenticated user must not access internal role views that don't belong to them:
  // - Buyers cannot access artisan, runner, or admin dashboards.
  // - Artisans cannot access runner or admin dashboards.
  // - Runners cannot access artisan or admin dashboards.
  // - All authenticated users are permitted to browse the Marketplace ('buyer' view) or 'home'.
  const isUnauthorizedRole =
    activeRoleView !== 'home' &&
    activeRoleView !== 'buyer' &&
    !isDemoMode &&
    isRealAuthSession &&
    currentUser &&
    currentUser.role?.toLowerCase() !== activeRoleView;

  return (
    <div className="min-h-screen bg-[#FCECEF] text-stone-900 font-sans flex flex-col">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-[99999] bg-[#4A1525] text-white px-4 py-3 rounded-2xl shadow-2xl border border-rose-900/60 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5"
          style={{ zIndex: 99999 }}
        >
          <span className="w-2 h-2 rounded-full bg-[#E8A5B5] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header with Persona Switcher & Voice CTA */}
      <Header
        currentUser={currentUser}
        activeView={activeRoleView}
        onSelectView={(view) => {
          if (view === 'home') {
            setActiveRoleView('home');
          } else if (isDemoMode) {
            handleSwitchUser(view);
            setActiveRoleView(view);
          } else if (currentUser) {
            setActiveRoleView(view);
          } else {
            // Unauthenticated user attempting to access a specific role dashboard
            setAuthModalInitialMode(
              view === 'artisan' ? 'artisan-login' :
              view === 'buyer' ? 'buyer-login' :
              view === 'runner' ? 'runner-login' :
              'admin-login'
            );
            setIsAuthModalOpen(true);
          }
        }}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onSwitchUser={(role) => {
          handleSwitchUser(role);
          setActiveRoleView(role);
        }}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        onResetDemo={handleResetDemo}
        onOpenAuthModal={(mode) => {
          setAuthModalInitialMode(mode || 'role-select');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        notifications={notifications}
        artisanProfile={currentArtisanProfile}
        isOffline={isOffline}
      />

      {/* Notice Banner when in Judges Demo Mode */}
      {isDemoMode && (
        <div className="bg-[#FFF0F3] border-b border-rose-200 px-4 py-2 text-[#86293D] text-xs flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-[#C84B68] text-white font-bold text-[10px] px-2 py-0.5 rounded-full font-mono">
                DEMO MODE
              </span>
              <span className="font-medium text-[11px] text-[#4A1525]">
                Judges Switcher Active: Currently viewing <strong>{activeRoleView === 'home' ? 'Mission & Story (Public Home)' : `${currentUser?.name} (${activeRoleView.toUpperCase()})`}</strong>. Click any persona above to test role workflows.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsDemoMode(false);
                setCurrentUser(null);
                setIsRealAuthSession(false);
                setActiveRoleView('home');
              }}
              className="text-[11px] underline text-[#C84B68] hover:text-[#86293D] font-semibold cursor-pointer ml-4"
            >
              Exit Demo Mode
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* If user role does not match current view, display standard 403 Forbidden Access Guard */}
        {isUnauthorizedRole ? (
          <div className="max-w-lg mx-auto my-16 p-8 bg-white border border-rose-100 rounded-3xl shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-[#C84B68] mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#4A1525] font-serif">
                Access Restricted
              </h2>
              <p className="text-sm text-stone-600 mt-2">
                You don't have permission to access this page.
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Your account is currently registered as a <strong>{currentUser?.role?.toUpperCase()}</strong>.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveRoleView((currentUser?.role?.toLowerCase() || 'buyer') as any)}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#C84B68] hover:bg-[#B33956] text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to {currentUser?.role} Dashboard</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-rose-50 text-[#86293D] text-xs font-semibold rounded-full border border-rose-200 transition-all cursor-pointer shadow-2xs"
              >
                Switch Account
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* View Router */}
            {activeRoleView === 'home' && (
              <PublicHomePage
                listings={listings}
                artisans={artisans}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                onExploreArtisans={() => {
                  setActiveRoleView('buyer');
                  if (isDemoMode) handleSwitchUser('buyer');
                }}
                onOpenAuthModal={(mode) => {
                  setAuthModalInitialMode(mode || 'role-select');
                  setIsAuthModalOpen(true);
                }}
                onOpenDemoTour={() => setIsDemoTourOpen(true)}
                onSwitchToPersona={(role) => {
                  handleSwitchUser(role);
                  setActiveRoleView(role);
                }}
              />
            )}

            {activeRoleView === 'artisan' && (
              <ArtisanView
                artisan={currentArtisanProfile}
                listings={listings}
                orders={orders}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                onRefreshData={loadAllData}
              />
            )}

            {activeRoleView === 'buyer' && (
              <BuyerView
                buyer={currentUser || getDynamicPersona('buyer')}
                buyerOrders={orders.filter((o) => o.buyerId === (currentUser?.id || 'buyer-1'))}
                onOrderCreated={() => {
                  loadAllData();
                  showToast('Order placed successfully!');
                }}
              />
            )}

            {activeRoleView === 'runner' && (
              <RunnerView
                runner={currentUser || getDynamicPersona('runner')}
                orders={orders}
                onRefreshData={loadAllData}
              />
            )}

            {activeRoleView === 'admin' && (
              <AdminView
                artisans={artisans}
                listings={listings}
                orders={orders}
                onResetDemo={handleResetDemo}
              />
            )}
          </>
        )}
      </main>

      {/* Redesigned Multi-Column Footer with Mission Statement */}
      <Footer
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        onSelectRole={(role) => {
          handleSwitchUser(role);
          setActiveRoleView(role);
        }}
        onSelectTab={(tab) => {
          setActiveRoleView(tab);
          if (tab !== 'home' && isDemoMode) {
            handleSwitchUser(tab);
          }
        }}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalInitialMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <VoiceArtisanModal
        artisanId={currentArtisanProfile.userId || currentArtisanProfile.id}
        artisanName={currentArtisanProfile.name}
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onListingPublished={(listing) => {
          setListings((prev) => [listing, ...prev]);
          showToast('New shoppable listing published successfully!');
        }}
      />

      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onJumpToStep={(stepIdx) => {
          if (stepIdx === 0 || stepIdx === 1) {
            handleSwitchUser('artisan');
            setIsVoiceModalOpen(true);
          } else if (stepIdx === 2) {
            handleSwitchUser('buyer');
          } else if (stepIdx === 3) {
            handleSwitchUser('runner');
          } else if (stepIdx === 4) {
            handleSwitchUser('artisan');
          }
        }}
      />
    </div>
  );
}

export default App;
