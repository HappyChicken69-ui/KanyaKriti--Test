import React, { useState, useEffect } from 'react';
import {
  Bike,
  MapPin,
  CheckCircle,
  Clock,
  ArrowRight,
  Package,
  Phone,
  Navigation,
  Sparkles,
  RefreshCw,
  Star,
  Store,
} from 'lucide-react';
import { Order, User, OrderStatus } from '../types.ts';
import { updateOrderStatus } from '../lib/api.ts';
import { LeafletMap } from './LeafletMap.tsx';

interface RunnerViewProps {
  runner: User;
  orders: Order[];
  onRefreshData: () => void;
}

export const RunnerView: React.FC<RunnerViewProps> = ({
  runner,
  orders,
  onRefreshData,
}) => {
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isSimulatingMove, setIsSimulatingMove] = useState(false);
  const [simulatedLat, setSimulatedLat] = useState<number | undefined>(undefined);
  const [simulatedLng, setSimulatedLng] = useState<number | undefined>(undefined);
  const [actionLoading, setActionLoading] = useState(false);

  // Available orders: status === 'READY' and no runner assigned
  const availableDeliveries = orders.filter(
    (o) => o.status === 'READY' && (!o.runnerId || o.runnerId === '')
  );

  // Active orders assigned to this runner
  const activeOrders = orders.filter(
    (o) => o.runnerId === runner.id && (o.status === 'READY' || o.status === 'PICKED_UP')
  );

  const currentActiveOrder = activeOrderId
    ? activeOrders.find((o) => o.id === activeOrderId) || activeOrders[0]
    : activeOrders[0];

  useEffect(() => {
    if (currentActiveOrder) {
      setActiveOrderId(currentActiveOrder.id);
      setSimulatedLat(currentActiveOrder.runnerLat || currentActiveOrder.pickupLat);
      setSimulatedLng(currentActiveOrder.runnerLng || currentActiveOrder.pickupLng);
    }
  }, [currentActiveOrder?.id]);

  const handleAcceptDelivery = async (orderId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/deliveries/${orderId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runnerId: runner.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActiveOrderId(orderId);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setActionLoading(true);
    try {
      await updateOrderStatus(orderId, nextStatus, runner.id, 'runner');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update delivery status');
    } finally {
      setActionLoading(false);
    }
  };

  // Simulated GPS movement towards destination
  const handleSimulateMovement = async (order: Order) => {
    if (isSimulatingMove) return;
    setIsSimulatingMove(true);

    const steps = 6;
    const startLat = simulatedLat || order.pickupLat;
    const startLng = simulatedLng || order.pickupLng;
    const destLat = order.deliveryLat;
    const destLng = order.deliveryLng;

    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, 600));
      const progress = i / steps;
      const curLat = startLat + (destLat - startLat) * progress;
      const curLng = startLng + (destLng - startLng) * progress;

      setSimulatedLat(curLat);
      setSimulatedLng(curLng);

      try {
        await fetch(`/api/deliveries/${order.id}/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: curLat, lng: curLng }),
        });
      } catch (err) {
        // ignore
      }
    }
    setIsSimulatingMove(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. RUNNER STATS HEADER - Warm Airy KanyaKriti Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-rose-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF0F3] border border-rose-200/80 flex items-center justify-center text-[#C84B68] text-2xl shadow-2xs">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#FFF0F3] text-[#86293D] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 border border-rose-200/70">
              <span>Hyperlocal Delivery Partner</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-[#4A1525]">{runner.name}</h2>
            <p className="text-[#5C4D52] text-xs">
              Operating Zone: {runner.neighborhood ? `${runner.neighborhood} (${runner.city})` : 'Local Neighborhood'} • 89 Deliveries Completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#FFF9FA] px-4 py-3 rounded-2xl border border-rose-100 text-center">
            <div className="text-[10px] uppercase font-bold text-[#86293D]">Earnings Today</div>
            <div className="text-xl font-bold text-[#4A1525] mt-0.5">₹360</div>
          </div>
          <div className="bg-[#FFF9FA] px-4 py-3 rounded-2xl border border-rose-100 text-center">
            <div className="text-[10px] uppercase font-bold text-[#86293D]">Partner Rating</div>
            <div className="text-xl font-bold text-amber-600 mt-0.5 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>4.9</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE DELIVERY IN PROGRESS */}
      {currentActiveOrder ? (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-rose-100 space-y-6">
          <div className="flex items-center justify-between border-b border-rose-100 pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#86293D] bg-[#FFF0F3] border border-rose-200 px-2 py-0.5 rounded uppercase">
                Active Assignment #{currentActiveOrder.id}
              </span>
              <h3 className="text-lg font-bold text-[#4A1525] font-serif mt-1">
                {currentActiveOrder.listingTitle}
              </h3>
              <p className="text-xs text-[#5C4D52]">
                Maker: <strong>{currentActiveOrder.artisanName}</strong> → Customer: <strong>{currentActiveOrder.buyerName}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-[#86293D] text-white">
                {currentActiveOrder.status}
              </span>
              <div className="text-xs text-[#C84B68] font-bold mt-1">Payout: ₹40</div>
            </div>
          </div>

          {/* Interactive Delivery Route Map */}
          <div
            className="relative z-0 isolate"
            style={{ position: 'relative', zIndex: 0, isolation: 'isolate' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#4A1525] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#C84B68]" />
                Live Route & GPS Simulation
              </span>
              {currentActiveOrder.status === 'PICKED_UP' && (
                <button
                  type="button"
                  disabled={isSimulatingMove}
                  onClick={() => handleSimulateMovement(currentActiveOrder)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#86293D] bg-[#FFF0F3] hover:bg-rose-100 border border-rose-200 px-3 py-1 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C84B68]" />
                  <span>{isSimulatingMove ? 'Simulating Ride...' : 'Simulate GPS Movement'}</span>
                </button>
              )}
            </div>

            <LeafletMap
              centerLat={simulatedLat || currentActiveOrder.pickupLat}
              centerLng={simulatedLng || currentActiveOrder.pickupLng}
              pickupLat={currentActiveOrder.pickupLat}
              pickupLng={currentActiveOrder.pickupLng}
              deliveryLat={currentActiveOrder.deliveryLat}
              deliveryLng={currentActiveOrder.deliveryLng}
              runnerLat={simulatedLat}
              runnerLng={simulatedLng}
              runnerName={runner.name}
              className="h-72 w-full rounded-2xl overflow-hidden shadow-inner border border-rose-100"
            />
          </div>

          {/* Action buttons for delivery state progression */}
          <div className="p-4 bg-[#FFF9FA] rounded-2xl border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#5C4D52]">
              {currentActiveOrder.status === 'READY' && (
                <span>Order is ready at artisan's address. Travel to pickup spot and confirm pickup.</span>
              )}
              {currentActiveOrder.status === 'PICKED_UP' && (
                <span>Package in hand. Head to customer destination and confirm delivery.</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {currentActiveOrder.status === 'READY' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(currentActiveOrder.id, 'PICKED_UP')}
                  className="w-full sm:w-auto py-2.5 px-5 bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>Confirm Pickup from Artisan</span>
                </button>
              )}

              {currentActiveOrder.status === 'PICKED_UP' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(currentActiveOrder.id, 'DELIVERED')}
                  className="w-full sm:w-auto py-2.5 px-5 bg-[#86293D] hover:bg-[#701E31] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Delivery to Customer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-rose-200 text-stone-500 text-sm">
          <Bike className="w-8 h-8 mx-auto text-rose-300 mb-2" />
          No active deliveries assigned to you right now. Pick an order from the available list below.
        </div>
      )}

      {/* 3. AVAILABLE ORDERS WAITING FOR RUNNER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#4A1525] font-serif">
              Available Delivery Requests ({availableDeliveries.length})
            </h3>
            <p className="text-xs text-[#5C4D52]">
              Orders marked READY by local makers waiting for nearby runners
            </p>
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

        {availableDeliveries.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-stone-400 text-xs border border-rose-100">
            No ready deliveries at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDeliveries.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl p-5 border border-rose-100 shadow-2xs hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#86293D] bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded">
                      Pickup Available
                    </span>
                    <h4 className="font-bold text-[#4A1525] font-serif text-sm mt-1">{ord.listingTitle}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-[#4A1525]">₹40</span>
                    <div className="text-[10px] text-stone-400">Delivery Earning</div>
                  </div>
                </div>

                <div className="text-xs text-stone-600 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                    <strong className="text-stone-800">Pickup:</strong>
                    <span className="truncate">{ord.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C84B68] shrink-0" />
                    <strong className="text-stone-800">Drop:</strong>
                    <span className="truncate">{ord.deliveryAddress}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-100">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleAcceptDelivery(ord.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Accept Delivery Task</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
