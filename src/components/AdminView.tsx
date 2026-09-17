import React from 'react';
import {
  Shield,
  Users,
  ShoppingBag,
  IndianRupee,
  Award,
  RotateCcw,
  Sparkles,
  CheckCircle,
  Clock,
  Bike,
  Star,
} from 'lucide-react';
import { ArtisanProfile, Order, Listing, User } from '../types.ts';

interface AdminViewProps {
  artisans: ArtisanProfile[];
  listings: Listing[];
  orders: Order[];
  onResetDemo: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  artisans,
  listings,
  orders,
  onResetDemo,
}) => {
  // Aggregate calculations
  const totalGMV = orders.reduce((sum, o) => sum + o.price, 0);
  const platformRevenue = Math.round(totalGMV * 0.05); // 5% platform fee
  const firstThousandArtisans = artisans.filter((a) => a.totalEarned >= 1000);
  const milestonePercent = Math.round((firstThousandArtisans.length / artisans.length) * 100);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. PLATFORM OVERVIEW BANNER - Warm Airy KanyaKriti Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-rose-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#FFF0F3] text-[#86293D] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-rose-200/80">
            <Shield className="w-3.5 h-3.5 text-[#C84B68]" />
            <span>Platform Governance & Oversight</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#4A1525]">
            KanyaKriti Command Center
          </h2>
          <p className="text-[#5C4D52] text-xs sm:text-sm max-w-xl">
            Real-time analytics for hyperlocal artisan matching, order fulfillment, commission tracking, and women empowerment milestones.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetDemo}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Demo Data</span>
        </button>
      </div>

      {/* 2. CORE PLATFORM METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#86293D] font-bold uppercase">
            <span>Verified Makers</span>
            <Users className="w-4 h-4 text-[#86293D]" />
          </div>
          <div className="text-2xl font-bold text-[#4A1525] mt-2 font-serif">{artisans.length}</div>
          <div className="text-[11px] text-[#8C7A80] mt-1">100% Voice Onboarded</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#86293D] font-bold uppercase">
            <span>Platform GMV</span>
            <IndianRupee className="w-4 h-4 text-[#86293D]" />
          </div>
          <div className="text-2xl font-bold text-[#4A1525] mt-2 font-serif">₹{totalGMV}</div>
          <div className="text-[11px] text-[#8C7A80] mt-1">₹{platformRevenue} Platform Fees (5%)</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#86293D] font-bold uppercase">
            <span>Active Listings</span>
            <ShoppingBag className="w-4 h-4 text-[#C84B68]" />
          </div>
          <div className="text-2xl font-bold text-[#4A1525] mt-2 font-serif">{listings.length}</div>
          <div className="text-[11px] text-[#8C7A80] mt-1">Indexed in Hyperlocal Zone</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#86293D] font-bold uppercase">
            <span>₹1,000 Milestone</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[#86293D] mt-2 font-serif">{milestonePercent}%</div>
          <div className="text-[11px] text-[#8C7A80] mt-1">
            {firstThousandArtisans.length} of {artisans.length} makers reached target
          </div>
        </div>
      </div>

      {/* 3. ARTISANS NORTH STAR MILESTONE LEADERBOARD */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#4A1525] font-serif">
            Artisans Milestone Tracker (North Star Metric)
          </h3>
          <p className="text-xs text-[#5C4D52]">
            Monitoring progress towards the first ₹1,000 earned on KanyaKriti
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FFF9FA] text-[#4A1525] font-semibold uppercase border-y border-rose-100">
              <tr>
                <th className="py-3 px-4">Maker</th>
                <th className="py-3 px-4">Primary Skill</th>
                <th className="py-3 px-4">Neighborhood</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Total Earned</th>
                <th className="py-3 px-4">Milestone Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50 font-medium">
              {artisans.map((artisan) => {
                const reached = artisan.totalEarned >= 1000;
                return (
                  <tr key={artisan.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <img
                        src={artisan.avatar}
                        alt={artisan.name}
                        className="w-8 h-8 rounded-full object-cover border border-rose-200"
                      />
                      <span className="font-bold text-[#4A1525]">{artisan.name}</span>
                    </td>
                    <td className="py-3 px-4">{artisan.primarySkill}</td>
                    <td className="py-3 px-4 text-[#5C4D52]">{artisan.neighborhood}</td>
                    <td className="py-3 px-4 font-bold text-amber-700">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{artisan.rating}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#4A1525] text-sm">
                      ₹{artisan.totalEarned}
                    </td>
                    <td className="py-3 px-4">
                      {reached ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A1525] bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 text-[#86293D]" />
                          <span>₹1,000 Club Achieved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#86293D] bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-[#86293D]" />
                          <span>₹{1000 - artisan.totalEarned} remaining</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. RECENT ORDERS OVERSIGHT */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#4A1525] font-serif">Platform Orders Oversight</h3>
          <p className="text-xs text-[#5C4D52]">Live order state machine tracking across all roles</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FFF9FA] text-[#4A1525] font-semibold uppercase border-y border-rose-100">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Item / Service</th>
                <th className="py-3 px-4">Maker</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-rose-50/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#4A1525]">#{ord.id}</td>
                  <td className="py-3 px-4 font-semibold">{ord.listingTitle}</td>
                  <td className="py-3 px-4">{ord.artisanName}</td>
                  <td className="py-3 px-4">{ord.buyerName}</td>
                  <td className="py-3 px-4 font-bold text-[#4A1525]">₹{ord.totalAmount}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-[#FFF0F3] text-[#86293D] border border-rose-200">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#86293D] font-medium">{ord.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
