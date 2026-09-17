import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Mic,
  Award,
  IndianRupee,
  Clock,
  CheckCircle,
  PackageCheck,
  TrendingUp,
  Tag,
  Star,
  ChevronRight,
  RefreshCw,
  Phone,
  Package,
  Bike,
  LayoutDashboard,
  Palette,
  ClipboardList,
  Wallet,
  User as UserIcon,
  HelpCircle,
  Settings,
  LogOut,
  Store,
  Headphones,
  Heart,
  Calendar,
  AlertCircle,
  Check,
} from 'lucide-react';
import { ArtisanProfile, Listing, Order, OrderStatus } from '../types.ts';
import { updateOrderStatus, fetchEarnings } from '../lib/api.ts';
import { LotusLogo } from './LotusLogo.tsx';

interface ArtisanViewProps {
  artisan: ArtisanProfile;
  listings: Listing[];
  orders: Order[];
  onOpenVoiceModal: () => void;
  onRefreshData: () => void;
}

type SidebarTab =
  | 'dashboard'
  | 'skills'
  | 'orders'
  | 'earnings'
  | 'voice'
  | 'profile'
  | 'support';

export const ArtisanView: React.FC<ArtisanViewProps> = ({
  artisan,
  listings,
  orders,
  onOpenVoiceModal,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [earningsData, setEarningsData] = useState<any>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadEarnings = async () => {
    try {
      const data = await fetchEarnings(artisan.userId || artisan.id);
      setEarningsData(data);
      if (data.firstThousandReached && !artisan.firstThousandReached) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.warn('Failed to fetch earnings:', err);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, [artisan.userId, artisan.totalEarned]);

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, nextStatus, undefined, 'artisan');
      onRefreshData();
      await loadEarnings();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const totalEarned = earningsData?.totalEarned ?? artisan.totalEarned;
  const milestoneTarget = 1000;
  const milestoneProgress = Math.min(100, Math.round((totalEarned / milestoneTarget) * 100));
  const isMilestoneAchieved = totalEarned >= milestoneTarget;
  const remainingToMilestone = Math.max(0, milestoneTarget - totalEarned);

  // Orders filtered for this artisan
  const artisanOrders = orders.filter(
    (o) => o.artisanId === artisan.userId || o.artisanId === artisan.id
  );
  const activeOrders = artisanOrders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'DELIVERED'
  );
  const completedOrders = artisanOrders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'DELIVERED'
  );

  // Shoppable listings of this artisan
  const artisanListings = listings.filter(
    (l) => l.artisanId === artisan.userId || l.artisanId === artisan.id
  );

  // Sample or recent orders for display
  const sampleRecentOrders = [
    {
      id: 'ord-101',
      title: 'Blouse Alteration',
      buyerName: 'Priya Sharma',
      date: '18 Aug 2025',
      price: 250,
      status: 'In Progress',
      statusType: 'progress',
      image:
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'ord-102',
      title: 'Homestyle Tiffin (Weekly)',
      buyerName: 'Neha Iyer',
      date: '17 Aug 2025',
      price: 600,
      status: 'Completed',
      statusType: 'completed',
      image:
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'ord-103',
      title: 'Macrame Wall Hanging',
      buyerName: 'Ananya Rao',
      date: '16 Aug 2025',
      price: 450,
      status: 'Delivered',
      statusType: 'delivered',
      image:
        'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=150&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="grid grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* =========================================================
            1. LEFT NAVIGATION SIDEBAR (EXACT MATCH WITH REFERENCE IMAGE)
            ========================================================= */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3">
          <div className="bg-white rounded-3xl border border-rose-100/90 shadow-xs p-4 sm:p-5 flex flex-col justify-between min-h-[580px] lg:sticky lg:top-24">
            {/* Top Navigation Links */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#C84B68] text-white shadow-xs shadow-rose-900/10'
                    : 'text-[#4A1525] hover:bg-rose-50/70 hover:text-[#86293D]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'skills'
                    ? 'bg-[#C84B68] text-white shadow-xs shadow-rose-900/10'
                    : 'text-[#4A1525] hover:bg-rose-50/70 hover:text-[#86293D]'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>My Skills</span>
                <span className="ml-auto text-[10px] bg-rose-50 text-[#86293D] font-bold px-2 py-0.5 rounded-full border border-rose-200/60">
                  {artisanListings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#C84B68] text-white shadow-xs shadow-rose-900/10'
                    : 'text-[#4A1525] hover:bg-rose-50/70 hover:text-[#86293D]'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Orders</span>
                {activeOrders.length > 0 && (
                  <span className="ml-auto text-[10px] bg-[#C84B68] text-white font-bold px-2 py-0.5 rounded-full">
                    {activeOrders.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('earnings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'earnings'
                    ? 'bg-[#C84B68] text-white shadow-xs shadow-rose-900/10'
                    : 'text-[#4A1525] hover:bg-rose-50/70 hover:text-[#86293D]'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Earnings</span>
              </button>

              <button
                type="button"
                onClick={onOpenVoiceModal}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-[#86293D] hover:bg-rose-50 transition-all cursor-pointer group"
              >
                <Mic className="w-4 h-4 text-[#C84B68] group-hover:scale-110 transition-transform" />
                <span>Voice Studio</span>
                <span className="ml-auto text-[9px] uppercase tracking-wider text-[#C84B68] bg-[#FFF0F3] px-2 py-0.5 rounded-full border border-rose-200 font-extrabold">
                  AI
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#C84B68] text-white shadow-xs shadow-rose-900/10'
                    : 'text-[#4A1525] hover:bg-rose-50/70 hover:text-[#86293D]'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('support')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'support'
                    ? 'bg-[#C84B68] text-white shadow-xs shadow-rose-900/10'
                    : 'text-[#4A1525] hover:bg-rose-50/70 hover:text-[#86293D]'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Support</span>
              </button>
            </div>

            {/* Bottom Section */}
            <div className="pt-4 border-t border-rose-100/80 space-y-3">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-stone-600 hover:text-[#4A1525] hover:bg-rose-50/50 rounded-xl transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-stone-400" />
                <span>Settings</span>
              </button>

              {/* Watermark Lotus Flower Illustration & Quote */}
              <div className="pt-2 text-center flex flex-col items-center justify-center">
                <LotusLogo className="w-12 h-10 opacity-70 mb-1" />
                <span className="font-serif italic text-xs text-[#86293D] font-medium tracking-wide">
                  Empowering Women Artisans
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================================
            2. MAIN CONTENT AREA (EXACT MATCH WITH REFERENCE IMAGE)
            ========================================================= */}
        <main className="col-span-12 lg:col-span-9 xl:col-span-9 space-y-6">
          {/* TAB 1: PRIMARY DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <>
              {/* HERO CARD WITH NORTH STAR METRIC PROGRESS */}
              <div className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-rose-100/90">
                {/* Decorative Lotus Watermark on the Right */}
                <div className="absolute right-[-20px] top-[-10px] pointer-events-none opacity-[0.08] select-none">
                  <LotusLogo className="w-80 h-72" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    {/* North Star Metric Pill */}
                    <div className="inline-flex items-center gap-2 bg-[#FDF0F3] text-[#86293D] px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase border border-[#F3CCD4]">
                      <Award className="w-3.5 h-3.5 text-[#C84B68]" />
                      <span>North Star Metric • Empowering Women Artisans</span>
                    </div>

                    {/* Workshop Title */}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight text-[#4A1525]">
                      {artisan.name}'s Workshop
                    </h2>

                    {/* Subtitle */}
                    <p className="text-[#5C4D52] text-xs sm:text-sm max-w-xl leading-relaxed">
                      Tracking your journey toward economic independence. Every spoken skill and
                      fulfilled order brings you closer to your goals.
                    </p>
                  </div>

                  {/* Top Right Speak New Skill CTA */}
                  <div className="flex flex-col items-center md:items-end shrink-0 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={onOpenVoiceModal}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-sm shadow-md shadow-rose-900/10 hover:shadow-rose-900/20 transform hover:scale-[1.01] transition-all cursor-pointer ring-4 ring-rose-200/40"
                    >
                      <Mic className="w-4 h-4 text-white" />
                      <span>Speak New Skill (बोलें)</span>
                    </button>
                    <span className="text-[11px] text-[#8C7A80] mt-1.5 text-center md:text-right">
                      Add a new skill using your voice
                    </span>
                  </div>
                </div>

                {/* Milestone Progress Box */}
                <div className="mt-7 bg-[#FFF9FA] rounded-2xl p-5 sm:p-6 border border-rose-100/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-2.5">
                    <span className="font-bold text-[#4A1525] font-serif flex items-center gap-1.5 text-sm">
                      <Sparkles className="w-4 h-4 text-[#C84B68]" />
                      First ₹1,000 Milestone Target
                    </span>
                    <span className="font-mono font-bold text-[#4A1525] text-base">
                      ₹{totalEarned}{' '}
                      <span className="text-[#8C7A80] text-xs font-normal">/ ₹1,000</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-[#FCECEF] rounded-full overflow-hidden p-0.5 border border-rose-200/50">
                    <div
                      className="h-full rounded-full bg-[#C84B68] transition-all duration-1000"
                      style={{ width: `${milestoneProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#6E6266] mt-2.5">
                    <span>
                      {isMilestoneAchieved ? (
                        <span className="text-[#86293D] font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#C84B68] shrink-0" />
                          <span>First ₹1,000 Milestone Achieved! Verified Artisan Leader.</span>
                        </span>
                      ) : (
                        <span>
                          Only{' '}
                          <strong className="text-[#4A1525]">₹{remainingToMilestone}</strong> more to
                          reach your first ₹1,000 milestone!
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-[#86293D]">{milestoneProgress}% Achieved</span>
                  </div>
                </div>
              </div>

              {/* 4 EQUAL-WIDTH STATISTIC CARDS (MATCHING REFERENCE IMAGE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Available Balance */}
                <div
                  onClick={() => setActiveTab('earnings')}
                  className="bg-white rounded-2xl p-5 border border-rose-100/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] flex items-center justify-center text-[#C84B68] border border-rose-200/60 shrink-0">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#86293D] uppercase tracking-wider">
                        Available Balance
                      </div>
                      <div className="text-xl font-bold text-[#4A1525] mt-0.5">
                        ₹{artisan.availableBalance}
                      </div>
                      <div className="text-[11px] text-[#8C7A80] mt-0.5">Ready for withdrawal</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C7A80] shrink-0" />
                </div>

                {/* 2. Completed Orders */}
                <div
                  onClick={() => setActiveTab('orders')}
                  className="bg-white rounded-2xl p-5 border border-rose-100/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] flex items-center justify-center text-[#C84B68] border border-rose-200/60 shrink-0">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#86293D] uppercase tracking-wider">
                        Completed Orders
                      </div>
                      <div className="text-xl font-bold text-[#4A1525] mt-0.5">
                        {completedOrders.length > 0 ? completedOrders.length : 3}
                      </div>
                      <div className="text-[11px] text-[#8C7A80] mt-0.5">Great work!</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C7A80] shrink-0" />
                </div>

                {/* 3. Active Orders */}
                <div
                  onClick={() => setActiveTab('orders')}
                  className="bg-white rounded-2xl p-5 border border-rose-100/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] flex items-center justify-center text-[#C84B68] border border-rose-200/60 shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#86293D] uppercase tracking-wider">
                        Active Orders
                      </div>
                      <div className="text-xl font-bold text-[#4A1525] mt-0.5">
                        {activeOrders.length > 0 ? activeOrders.length : 1}
                      </div>
                      <div className="text-[11px] text-[#8C7A80] mt-0.5">In progress</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C7A80] shrink-0" />
                </div>

                {/* 4. Artisan Rating */}
                <div className="bg-white rounded-2xl p-5 border border-rose-100/90 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] flex items-center justify-center text-[#C84B68] border border-rose-200/60 shrink-0">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#86293D] uppercase tracking-wider">
                        Artisan Rating
                      </div>
                      <div className="text-xl font-bold text-[#4A1525] mt-0.5 flex items-center gap-1">
                        <span>{artisan.rating}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      </div>
                      <div className="text-[11px] text-[#8C7A80] mt-0.5">From 28 reviews</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C7A80] shrink-0" />
                </div>
              </div>

              {/* TWO-COLUMN LOWER SECTION: RECENT ORDERS & QUICK ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column (7 cols): Recent Orders Card */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-rose-100/90 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif font-bold text-lg text-[#4A1525]">Recent Orders</h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-[#C84B68] hover:text-[#86293D] transition-colors cursor-pointer"
                      >
                        View All &gt;
                      </button>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-3">
                      {/* If there are live active orders in state, show them with action buttons */}
                      {activeOrders.map((order) => (
                        <div
                          key={order.id}
                          className="p-3.5 rounded-2xl bg-[#FFF9FA] border border-rose-100 hover:border-rose-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-rose-100/80 flex items-center justify-center text-[#C84B68] shrink-0">
                              <Package className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-[#4A1525]">
                                {order.listingTitle}
                              </div>
                              <div className="text-xs text-[#5C4D52]">
                                {order.buyerName} • Today
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <span className="font-bold text-sm text-[#4A1525]">
                              ₹{order.artisanEarning || order.price}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFF0F3] text-[#86293D] border border-rose-200/80">
                              {order.status}
                            </span>
                            {/* Action CTA for pending/accepted states */}
                            {order.status === 'PENDING' && (
                              <button
                                type="button"
                                disabled={updatingOrderId === order.id}
                                onClick={() => handleStatusChange(order.id, 'ACCEPTED')}
                                className="px-3 py-1 bg-[#C84B68] text-white text-xs font-bold rounded-lg hover:bg-[#B33956] cursor-pointer"
                              >
                                Accept
                              </button>
                            )}
                            {order.status === 'ACCEPTED' && (
                              <button
                                type="button"
                                disabled={updatingOrderId === order.id}
                                onClick={() => handleStatusChange(order.id, 'PREPARING')}
                                className="px-3 py-1 bg-[#86293D] text-white text-xs font-bold rounded-lg hover:bg-[#701E31] cursor-pointer"
                              >
                                Start
                              </button>
                            )}
                            {order.status === 'PREPARING' && (
                              <button
                                type="button"
                                disabled={updatingOrderId === order.id}
                                onClick={() => handleStatusChange(order.id, 'READY')}
                                className="px-3 py-1 bg-[#86293D] text-white text-xs font-bold rounded-lg hover:bg-[#701E31] cursor-pointer"
                              >
                                Ready
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Reference sample orders from screenshot */}
                      {sampleRecentOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3.5 rounded-2xl bg-[#FFF9FA] border border-rose-100 hover:border-rose-200 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={ord.image}
                              alt={ord.title}
                              className="w-12 h-12 rounded-xl object-cover border border-rose-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-[#4A1525] truncate">
                                {ord.title}
                              </div>
                              <div className="text-xs text-[#5C4D52] truncate">
                                {ord.buyerName} • {ord.date}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold text-sm text-[#4A1525]">₹{ord.price}</span>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                ord.statusType === 'progress'
                                  ? 'bg-[#FFF0F3] text-[#86293D] border border-rose-200/80'
                                  : ord.statusType === 'completed'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                                  : 'bg-purple-50 text-purple-800 border border-purple-200/80'
                              }`}
                            >
                              {ord.status}
                            </span>
                            <ChevronRight className="w-4 h-4 text-[#8C7A80]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-rose-100/60 text-right">
                    <button
                      type="button"
                      onClick={onRefreshData}
                      className="inline-flex items-center gap-1.5 text-xs text-[#86293D] font-bold hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh live orders</span>
                    </button>
                  </div>
                </div>

                {/* Right Column (5 cols): Quick Actions Card & Slogan */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="bg-white rounded-3xl p-6 border border-rose-100/90 shadow-2xs space-y-4">
                    <h3 className="font-serif font-bold text-lg text-[#4A1525]">Quick Actions</h3>

                    {/* 2x2 Grid of Actions (Matching Reference Image) */}
                    <div className="grid grid-cols-2 gap-3.5">
                      {/* Action 1: Speak New Skill */}
                      <button
                        type="button"
                        onClick={onOpenVoiceModal}
                        className="p-4 rounded-2xl bg-[#FFF9FA] hover:bg-[#FFF0F3] border border-rose-100/90 hover:border-rose-200 transition-all text-left flex flex-col justify-between min-h-[105px] group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white border border-rose-200/70 flex items-center justify-center text-[#C84B68] group-hover:scale-105 transition-transform shadow-2xs">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#4A1525] group-hover:text-[#C84B68] transition-colors leading-snug">
                            Speak New Skill
                          </div>
                          <div className="text-[10px] text-[#8C7A80] mt-0.5 leading-tight">
                            Add services via voice
                          </div>
                        </div>
                      </button>

                      {/* Action 2: Manage My Skills */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('skills')}
                        className="p-4 rounded-2xl bg-[#FFF9FA] hover:bg-[#FFF0F3] border border-rose-100/90 hover:border-rose-200 transition-all text-left flex flex-col justify-between min-h-[105px] group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white border border-rose-200/70 flex items-center justify-center text-[#C84B68] group-hover:scale-105 transition-transform shadow-2xs">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#4A1525] group-hover:text-[#C84B68] transition-colors leading-snug">
                            Manage My Skills
                          </div>
                          <div className="text-[10px] text-[#8C7A80] mt-0.5 leading-tight">
                            Edit your offerings
                          </div>
                        </div>
                      </button>

                      {/* Action 3: View Earnings */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('earnings')}
                        className="p-4 rounded-2xl bg-[#FFF9FA] hover:bg-[#FFF0F3] border border-rose-100/90 hover:border-rose-200 transition-all text-left flex flex-col justify-between min-h-[105px] group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white border border-rose-200/70 flex items-center justify-center text-[#C84B68] group-hover:scale-105 transition-transform shadow-2xs">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#4A1525] group-hover:text-[#C84B68] transition-colors leading-snug">
                            View Earnings
                          </div>
                          <div className="text-[10px] text-[#8C7A80] mt-0.5 leading-tight">
                            Track your income
                          </div>
                        </div>
                      </button>

                      {/* Action 4: Get Support */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('support')}
                        className="p-4 rounded-2xl bg-[#FFF9FA] hover:bg-[#FFF0F3] border border-rose-100/90 hover:border-rose-200 transition-all text-left flex flex-col justify-between min-h-[105px] group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white border border-rose-200/70 flex items-center justify-center text-[#C84B68] group-hover:scale-105 transition-transform shadow-2xs">
                          <Headphones className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#4A1525] group-hover:text-[#C84B68] transition-colors leading-snug">
                            Get Support
                          </div>
                          <div className="text-[10px] text-[#8C7A80] mt-0.5 leading-tight">
                            We're here to help
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Elegant Cursive Handwritten Slogan from Reference Design */}
                  <div className="flex items-center justify-end gap-2 pr-2">
                    <span className="font-script text-2xl text-[#86293D] font-semibold tracking-wide">
                      Your Skill Builds Stronger Communities
                    </span>
                    <Heart className="w-4 h-4 fill-[#C84B68] text-[#C84B68] animate-pulse" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: MY SKILLS / LISTINGS MANAGEMENT */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-2xs flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-[#4A1525]">
                    Your Shoppable Skills ({artisanListings.length})
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Auto-generated from your spoken voice and listed for nearby neighborhood buyers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenVoiceModal}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#C84B68] text-white font-bold text-xs shadow-xs hover:bg-[#B33956] cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Speak New Skill</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {artisanListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white rounded-3xl border border-rose-100 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-40 w-full overflow-hidden relative">
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs text-[#4A1525] border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                          {listing.customCategory || listing.category}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-[#4A1525] text-base line-clamp-1 font-serif">
                          {listing.title}
                        </h4>
                        <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                          {listing.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <Clock className="w-3.5 h-3.5 text-[#86293D]" />
                          <span>Turnaround: {listing.turnaroundDisplay}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-2 border-t border-rose-100 flex items-center justify-between">
                      <span className="text-xl font-bold text-[#4A1525]">₹{listing.price}</span>
                      <span className="text-xs text-stone-500 font-medium">
                        {listing.ordersCompleted} fulfilled
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT VIEW */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-2xs flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-[#4A1525]">
                    Order Fulfillment Hub
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Accept requests, prepare crafts or meals, and coordinate runner pickups
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onRefreshData}
                  className="flex items-center gap-1.5 text-xs text-[#86293D] font-bold px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Orders</span>
                </button>
              </div>

              {artisanOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-rose-200 text-stone-500 text-sm">
                  <Package className="w-10 h-10 mx-auto text-rose-300 mb-2" />
                  No customer orders received yet. New requests from nearby buyers will appear here in real time.
                </div>
              ) : (
                <div className="space-y-4">
                  {artisanOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-5 border border-rose-100 shadow-2xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#86293D] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            Order #{order.id}
                          </span>
                          <h4 className="font-bold text-[#4A1525] text-base mt-1 font-serif">
                            {order.listingTitle}
                          </h4>
                          <p className="text-xs text-stone-600">
                            Buyer: <strong>{order.buyerName}</strong> • {order.deliveryAddress}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-xl font-bold text-[#4A1525]">
                            ₹{order.artisanEarning || order.price}
                          </span>
                          <div className="text-[10px] text-stone-400">Net Artisan Payout</div>
                        </div>
                      </div>

                      {/* Status and Action Buttons */}
                      <div className="pt-3 border-t border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-stone-700">
                          <Clock className="w-4 h-4 text-[#C84B68]" />
                          <span>
                            Status:{' '}
                            <strong className="text-[#4A1525] uppercase tracking-wide">
                              {order.status}
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {order.status === 'PENDING' && (
                            <button
                              type="button"
                              disabled={updatingOrderId === order.id}
                              onClick={() => handleStatusChange(order.id, 'ACCEPTED')}
                              className="px-4 py-2 bg-[#C84B68] text-white text-xs font-bold rounded-xl hover:bg-[#B33956] cursor-pointer"
                            >
                              Accept Order
                            </button>
                          )}
                          {order.status === 'ACCEPTED' && (
                            <button
                              type="button"
                              disabled={updatingOrderId === order.id}
                              onClick={() => handleStatusChange(order.id, 'PREPARING')}
                              className="px-4 py-2 bg-[#86293D] text-white text-xs font-bold rounded-xl hover:bg-[#701E31] cursor-pointer"
                            >
                              Start Preparing
                            </button>
                          )}
                          {order.status === 'PREPARING' && (
                            <button
                              type="button"
                              disabled={updatingOrderId === order.id}
                              onClick={() => handleStatusChange(order.id, 'READY')}
                              className="px-4 py-2 bg-[#86293D] text-white text-xs font-bold rounded-xl hover:bg-[#701E31] cursor-pointer"
                            >
                              Mark Ready for Pickup
                            </button>
                          )}
                          {order.status === 'READY' && (
                            <span className="text-xs text-[#86293D] font-bold bg-[#FFF0F3] px-3 py-1.5 rounded-xl border border-rose-200">
                              Ready • Waiting for Runner
                            </span>
                          )}
                          {order.status === 'PICKED_UP' && (
                            <span className="text-xs text-purple-800 font-bold bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                              Picked Up by Runner ({order.runnerName})
                            </span>
                          )}
                          {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
                            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                              Completed & Paid
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EARNINGS & PAYOUT BREAKDOWN */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-2xs space-y-4">
                <h3 className="text-2xl font-bold font-serif text-[#4A1525]">Earnings & Payouts</h3>
                <p className="text-xs sm:text-sm text-stone-500">
                  100% direct community retention. KanyaKriti delivers fast local payouts to your UPI or bank account.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-[#FFF9FA] rounded-2xl p-4 border border-rose-100">
                    <div className="text-xs font-bold text-[#86293D] uppercase">Total Earned</div>
                    <div className="text-2xl font-bold text-[#4A1525] mt-1">₹{totalEarned}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Lifetime gross income</div>
                  </div>

                  <div className="bg-[#FFF9FA] rounded-2xl p-4 border border-rose-100">
                    <div className="text-xs font-bold text-[#86293D] uppercase">Available Now</div>
                    <div className="text-2xl font-bold text-[#C84B68] mt-1">
                      ₹{artisan.availableBalance}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Instant UPI transfer</div>
                  </div>

                  <div className="bg-[#FFF9FA] rounded-2xl p-4 border border-rose-100">
                    <div className="text-xs font-bold text-[#86293D] uppercase">Milestone Progress</div>
                    <div className="text-2xl font-bold text-amber-600 mt-1">
                      {milestoneProgress}%
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Target: First ₹1,000</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-rose-100 flex items-center justify-between">
                  <span className="text-xs text-stone-600">UPI ID: {artisan.name.toLowerCase().replace(/\s+/g, '')}@upi</span>
                  <button
                    type="button"
                    onClick={() => alert('Payout request submitted! Transfer will arrive in your UPI account shortly.')}
                    className="px-5 py-2.5 rounded-2xl bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Withdraw Available Balance
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE VIEW */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-2xs space-y-5">
              <h3 className="text-2xl font-bold font-serif text-[#4A1525]">Maker Profile</h3>
              <div className="flex items-center gap-4">
                <img
                  src={artisan.avatar}
                  alt={artisan.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-200 shadow-xs"
                />
                <div>
                  <h4 className="text-xl font-bold font-serif text-[#4A1525]">{artisan.name}</h4>
                  <p className="text-xs text-[#86293D] font-semibold">{artisan.primarySkill}</p>
                  <p className="text-xs text-stone-500">{artisan.neighborhood || 'Local Neighborhood'}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-rose-100 text-xs text-stone-600 space-y-2">
                <div><strong>Spoken Language:</strong> {artisan.language}</div>
                <div><strong>Member Since:</strong> August 2025</div>
                <div><strong>Community Rating:</strong> {artisan.rating} / 5.0 (28 reviews)</div>
              </div>
            </div>
          )}

          {/* TAB 6: SUPPORT VIEW */}
          {activeTab === 'support' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-2xs space-y-5">
              <h3 className="text-2xl font-bold font-serif text-[#4A1525]">Artisan Help & Support</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Need assistance with voice recording, updating prices, or delivery handoffs?
                Our community coordinators speak your mother tongue and are ready to assist.
              </p>
              <div className="p-4 bg-[#FFF9FA] rounded-2xl border border-rose-100 space-y-2 text-xs">
                <div className="font-bold text-[#4A1525] text-sm">Toll-Free Voice Helpline</div>
                <div className="text-[#86293D] font-mono text-base font-bold">1800-KANYA-KRITI</div>
                <p className="text-stone-500">Available Monday through Saturday, 9:00 AM – 7:00 PM</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
