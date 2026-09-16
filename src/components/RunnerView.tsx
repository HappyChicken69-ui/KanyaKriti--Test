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
      // Transition or assign runner
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

      // Post runner location update to server
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
      {/* 1. RUNNER STATS HEADER */}
      <div className="bg-gradient-to-r from-[#4A1525] via-[#5C1D2E] to-stone-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-rose-900/40">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF0F3]/15 border border-rose-300/30 flex items-center justify-center text-white text-2xl shadow-inner">
            <Bike className="w-8 h-8 text-rose-200" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#FFF0F3]/20 text-rose-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 border border-rose-300/30">
              <span>Hyperlocal Delivery Partner</span>
            </div>
            <h2 className="text-2xl font-bold font-serif">{runner.name}</h2>
            <p className="text-rose-200/80 text-xs">
              Operating Zone: {runner.neighborhood ? `${runner.neighborhood} (${runner.city})` : 'Local Neighborhood'} • 89 Deliveries Completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-stone-950/50 px-4 py-3 rounded-2xl border border-rose-500/20 text-center">
            <div className="text-[10px] uppercase font-bold text-rose-300">Earnings Today</div>
            <div className="text-xl font-bold text-white mt-0.5">₹360</div>
          </div>
          <div className="bg-stone-950/50 px-4 py-3 rounded-2xl border border-rose-500/20 text-center">
            <div className="text-[10px] uppercase font-bold text-rose-300">Partner Rating</div>
            <div className="text-xl font-bold text-amber-300 mt-0.5 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>4.9</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE DELIVERY IN PROGRESS */}
      {currentActiveOrder ? (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-stone-200 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                Active Assignment #{currentActiveOrder.id}
              </span>
              <h3 className="text-lg font-bold text-stone-900 mt-1">
                {currentActiveOrder.listingTitle}
              </h3>
              <p className="text-xs text-stone-500">
                Maker: {currentActiveOrder.artisanName} → Customer: {currentActiveOrder.buyerName}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-stone-900 text-white">
                {currentActiveOrder.status}
              </span>
              <div className="text-xs text-emerald-700 font-bold mt-1">Payout: ₹40</div>
            </div>
          </div>

          {/* Interactive Delivery Route Map */}
          <div
            className="relative z-0 isolate"
            style={{ position: 'relative', zIndex: 0, isolation: 'isolate' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                Live Route & GPS Simulation
              </span>
              {currentActiveOrder.status === 'PICKED_UP' && (
                <button
                  type="button"
                  disabled={isSimulatingMove}
                  onClick={() => handleSimulateMovement(currentActiveOrder)}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
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
              className="h-72 w-full rounded-2xl overflow-hidden shadow-inner border border-stone-200"
            />
          </div>

          {/* Action buttons for delivery state progression */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-600">
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
                  className="w-full sm:w-auto py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                  className="w-full sm:w-auto py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Delivery to Customer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-stone-50 rounded-3xl p-8 text-center border border-dashed border-stone-300 text-stone-500 text-sm">
          <Bike className="w-8 h-8 mx-auto text-stone-400 mb-2" />
          No active deliveries assigned to you right now. Pick an order from the available list below.
        </div>
      )}

      {/* 3. AVAILABLE ORDERS WAITING FOR RUNNER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">
              Available Delivery Requests ({availableDeliveries.length})
            </h3>
            <p className="text-xs text-stone-500">
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
                    <h4 className="font-bold text-stone-900 text-sm mt-1">{ord.listingTitle}</h4>
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
