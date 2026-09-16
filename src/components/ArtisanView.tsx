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
  ArrowRight,
  RefreshCw,
  Phone,
  Package,
  Bike,
} from 'lucide-react';
import { ArtisanProfile, Listing, Order, OrderStatus, Transaction } from '../types.ts';
import { updateOrderStatus, fetchEarnings } from '../lib/api.ts';

interface ArtisanViewProps {
  artisan: ArtisanProfile;
  listings: Listing[];
  orders: Order[];
  onOpenVoiceModal: () => void;
  onRefreshData: () => void;
}

export const ArtisanView: React.FC<ArtisanViewProps> = ({
  artisan,
  listings,
  orders,
  onOpenVoiceModal,
  onRefreshData,
}) => {
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
  const milestoneProgress = Math.min(100, Math.round((totalEarned / 1000) * 100));
  const isMilestoneAchieved = totalEarned >= 1000;

  // Filter orders for this artisan
  const artisanOrders = orders.filter(
    (o) => o.artisanId === artisan.userId || o.artisanId === artisan.id
  );
  const activeOrders = artisanOrders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'DELIVERED'
  );
  const completedOrders = artisanOrders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'DELIVERED'
  );

  return (
    <div className="space-y-8 pb-16">
      {/* 1. NORTH STAR METRIC HERO CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#FFF5F7] via-[#FAF7F5] to-[#FAF7F5] p-6 sm:p-8 shadow-xs border border-rose-100">
        {/* Soft subtle atmospheric background glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-rose-100/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 rounded-full bg-amber-50/50 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#FDF0F3] text-[#86293D] px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase border border-[#F3CCD4] shadow-2xs">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>North Star Metric • Empowering Women Artisans</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#4A1525]">
              {artisan.name}'s Workshop
            </h2>
            <p className="text-[#5C4D52] text-xs sm:text-sm max-w-xl leading-relaxed">
              Tracking your journey toward economic independence. Every spoken skill and fulfilled order brings you closer to your goals.
            </p>
          </div>

          {/* Quick Voice CTA button */}
          <button
            type="button"
            onClick={onOpenVoiceModal}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-sm shadow-md shadow-rose-900/10 hover:shadow-rose-900/20 transform hover:scale-[1.02] transition-all cursor-pointer ring-4 ring-rose-200/40 shrink-0"
          >
            <Mic className="w-5 h-5 text-white" />
            <span>Speak New Skill (बोलें)</span>
          </button>
        </div>

        {/* Milestone Card */}
        <div className="mt-8 bg-white rounded-2xl p-5 sm:p-6 border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2.5">
            <span className="font-bold text-[#4A1525] font-serif flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-[#C84B68]" />
              First ₹1,000 Milestone Target
            </span>
            <span className="font-mono font-bold text-[#4A1525] text-base">
              ₹{totalEarned} <span className="text-[#8C7A80] text-xs font-normal">/ ₹1,000</span>
            </span>
          </div>

          <div className="w-full h-3.5 bg-[#FFF0F3] rounded-full overflow-hidden p-0.5 border border-rose-200/60">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isMilestoneAchieved
                  ? 'bg-gradient-to-r from-amber-400 via-[#E0859A] to-[#C84B68]'
                  : 'bg-gradient-to-r from-[#C84B68] to-[#E0859A]'
              }`}
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6E6266] mt-2.5">
            <span>
              {isMilestoneAchieved ? (
                <span className="text-amber-700 font-bold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>First ₹1,000 Milestone Achieved! Verified Artisan Leader.</span>
                </span>
              ) : (
                <span>
                  Only <strong className="text-[#4A1525]">₹{Math.max(0, 1000 - totalEarned)}</strong> more to reach your first ₹1,000 milestone!
                </span>
              )}
            </span>
            <span className="font-bold text-[#86293D]">{milestoneProgress}% Achieved</span>
          </div>
        </div>

        {/* 4 Micro stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-full">
            <div className="text-xs font-semibold text-[#86293D] uppercase tracking-wider">Available Balance</div>
            <div className="text-2xl font-black text-[#C84B68] mt-2">₹{artisan.availableBalance}</div>
            <div className="text-[11px] text-[#8C7A80] mt-1">Ready for transfer</div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-full">
            <div className="text-xs font-semibold text-[#86293D] uppercase tracking-wider">Completed Orders</div>
            <div className="text-2xl font-black text-[#2D2527] mt-2">{completedOrders.length}</div>
            <div className="text-[11px] text-[#8C7A80] mt-1">0% commission retained</div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-full">
            <div className="text-xs font-semibold text-[#86293D] uppercase tracking-wider">Active Orders</div>
            <div className="text-2xl font-black text-[#C84B68] mt-2">{activeOrders.length}</div>
            <div className="text-[11px] text-[#8C7A80] mt-1">{activeOrders.length > 0 ? 'In progress locally' : 'No pending tasks'}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-full">
            <div className="text-xs font-semibold text-[#86293D] uppercase tracking-wider">Artisan Rating</div>
            <div className="text-2xl font-black text-[#2D2527] mt-2 flex items-center gap-1.5">
              <span>{artisan.rating}</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
            <div className="text-[11px] text-[#8C7A80] mt-1">5.0 Star community trust</div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE ORDERS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">Incoming & Active Orders</h3>
            <p className="text-xs text-stone-500">Manage order states and prepare services for pickup</p>
          </div>
          <button
            type="button"
            onClick={onRefreshData}
            className="flex items-center gap-1 text-xs text-[#86293D] hover:text-[#4A1525] font-bold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-rose-200 text-stone-500 text-sm">
            <PackageCheck className="w-8 h-8 mx-auto text-stone-400 mb-2" />
            No active orders right now. New customer requests will appear here automatically.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-rose-100 shadow-2xs hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#86293D] bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded">
                      Order #{order.id}
                    </span>
                    <h4 className="font-bold text-stone-900 text-base mt-1">{order.listingTitle}</h4>
                    <div className="text-xs text-stone-500">
                      Buyer: <strong>{order.buyerName}</strong> • {order.deliveryAddress}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-[#4A1525]">₹{order.artisanEarning}</span>
                    <div className="text-[10px] text-stone-400">Net Earning</div>
                  </div>
                </div>

                {/* State Progress Pill */}
                <div className="flex items-center gap-2 p-2.5 bg-[#FAF7F5] rounded-xl text-xs border border-rose-100/60">
                  <Clock className="w-4 h-4 text-[#86293D] shrink-0" />
                  <span className="text-stone-700">
                    Current Status:{' '}
                    <strong className="text-[#4A1525] font-bold uppercase tracking-wide">
                      {order.status}
                    </strong>
                  </span>
                </div>

                {/* Action buttons strictly mapped to allowed transitions */}
                <div className="pt-2 border-t border-rose-100 flex items-center justify-between gap-3">
                  {order.status === 'PENDING' && (
                    <button
                      type="button"
                      disabled={updatingOrderId === order.id}
                      onClick={() => handleStatusChange(order.id, 'ACCEPTED')}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Accept Order</span>
                    </button>
                  )}

                  {order.status === 'ACCEPTED' && (
                    <button
                      type="button"
                      disabled={updatingOrderId === order.id}
                      onClick={() => handleStatusChange(order.id, 'PREPARING')}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#86293D] hover:bg-[#701E31] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Start Preparing / Stitching</span>
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      type="button"
                      disabled={updatingOrderId === order.id}
                      onClick={() => handleStatusChange(order.id, 'READY')}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#86293D] hover:bg-[#701E31] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Mark Ready for Pickup</span>
                    </button>
                  )}

                  {order.status === 'READY' && (
                    <div className="w-full py-2 px-3 bg-rose-50 text-[#86293D] text-xs font-medium rounded-xl text-center border border-rose-200 flex items-center justify-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#86293D] shrink-0" />
                      <span>Ready! Waiting for delivery runner to accept and pickup.</span>
                    </div>
                  )}

                  {order.status === 'PICKED_UP' && (
                    <div className="w-full py-2 px-3 bg-[#FAF7F5] text-stone-800 text-xs font-medium rounded-xl text-center border border-rose-200 flex items-center justify-center gap-1.5">
                      <Bike className="w-3.5 h-3.5 text-[#86293D] shrink-0" />
                      <span>Picked up by runner ({order.runnerName}). On the way to customer!</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. ARTISAN LISTINGS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">Your Shoppable Listings</h3>
            <p className="text-xs text-stone-500">Auto-generated via voice and indexed for local buyers</p>
          </div>
          <button
            type="button"
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 text-xs font-bold text-[#86293D] bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Add Skill via Voice</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings
            .filter((l) => l.artisanId === artisan.userId || l.artisanId === artisan.id)
            .map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 w-full overflow-hidden relative">
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs text-[#4A1525] border border-rose-200/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                      {listing.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{listing.title}</h4>
                    <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <Clock className="w-3.5 h-3.5 text-[#86293D]" />
                      <span>{listing.turnaroundDisplay}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-rose-100 flex items-center justify-between mt-2">
                  <span className="text-lg font-black text-[#4A1525]">₹{listing.price}</span>
                  <span className="text-[10px] text-stone-500">
                    {listing.ordersCompleted} orders completed
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
