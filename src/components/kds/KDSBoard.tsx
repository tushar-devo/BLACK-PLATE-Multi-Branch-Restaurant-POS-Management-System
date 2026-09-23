import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Utensils,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order, OrderStatus } from '../../types';

export const KDSBoard: React.FC = () => {
  const {
    orders,
    currentBranch,
    updateOrderStatus,
    soundEnabled,
    toggleSound,
  } = useRestaurant();

  const [selectedStation, setSelectedStation] = useState<string>('All');
  const [now, setNow] = useState<number>(Date.now());

  // Live timer tick every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const stations = ['All', 'Kitchen', 'Grill', 'Seafood', 'Beverage', 'Dessert'];

  // Filter orders for current branch that are in active kitchen statuses: New, Preparing, Ready
  const branchOrders = orders.filter(
    (o) =>
      o.branchId === currentBranch.id &&
      (o.status === 'New' || o.status === 'Preparing' || o.status === 'Ready')
  );

  const getElapsedMinutes = (isoString: string) => {
    try {
      const diff = now - new Date(isoString).getTime();
      return Math.max(0, Math.floor(diff / 60000));
    } catch {
      return 0;
    }
  };

  const handleNextStatus = (order: Order) => {
    if (order.status === 'New') {
      updateOrderStatus(order.id, 'Preparing');
    } else if (order.status === 'Preparing') {
      updateOrderStatus(order.id, 'Ready');
    } else if (order.status === 'Ready') {
      // Moves to Served (Triggers automatic inventory deduction!)
      updateOrderStatus(order.id, 'Served');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* KDS Header with Station Filters & Stylized Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ChefHat size={22} className="text-[#FF0000]" />
            Kitchen Display System (KDS)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1E1E1E] text-white border border-[#2A2A2A]">
              {branchOrders.length} Active Tickets
            </span>
          </h2>
          <p className="text-xs text-[#808080] mt-0.5">
            {currentBranch.name} • Live kitchen dispatch and station coordination
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Station Filter Tabs */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-1 flex items-center gap-1 overflow-x-auto">
            {stations.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStation(st)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedStation === st
                    ? 'bg-[#282828] text-white shadow-sm'
                    : 'text-[#808080] hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-[#1E1E1E] hover:bg-[#252525] border border-[#2A2A2A] text-white"
            title="Audio alerts toggle"
          >
            {soundEnabled ? <Volume2 size={16} className="text-[#06990F]" /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* 3D Stylized Kitchen Atmosphere Overview Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#181818] via-[#1E1E1E] to-[#181818] border border-[#2A2A2A] mb-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/30 flex items-center justify-center text-[#FF0000]">
            <Flame size={24} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              Kitchen Command & Station Monitor
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                ONLINE
              </span>
            </h4>
            <div className="text-xs text-[#808080] flex items-center gap-3 mt-0.5">
              <span>Automatic recipe deduction triggers on <strong>Served</strong></span>
              <span>•</span>
              <span>Orders over 15m trigger alert</span>
            </div>
          </div>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#121212] border border-[#262626] text-center">
            <div className="text-[10px] text-[#808080] uppercase font-semibold">New</div>
            <div className="text-base font-extrabold text-blue-400">
              {branchOrders.filter((o) => o.status === 'New').length}
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#121212] border border-[#262626] text-center">
            <div className="text-[10px] text-[#808080] uppercase font-semibold">Cooking</div>
            <div className="text-base font-extrabold text-[#FFFF00]">
              {branchOrders.filter((o) => o.status === 'Preparing').length}
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#121212] border border-[#262626] text-center">
            <div className="text-[10px] text-[#808080] uppercase font-semibold">Ready</div>
            <div className="text-base font-extrabold text-[#06990F]">
              {branchOrders.filter((o) => o.status === 'Ready').length}
            </div>
          </div>
        </div>
      </div>

      {/* KDS Order Tickets Grid */}
      {branchOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#181818] rounded-3xl border border-[#2A2A2A] text-center">
          <CheckCircle2 size={40} className="text-[#06990F] mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Kitchen Queue Clear!</h3>
          <p className="text-xs text-[#808080] max-w-sm">
            All tickets have been cooked and served. New customer orders and POS submissions will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6 overflow-y-auto">
          {branchOrders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isLate = elapsed >= 15;

            return (
              <div
                key={order.id}
                className={`rounded-3xl border transition-all flex flex-col justify-between shadow-2xl ${
                  isLate
                    ? 'bg-[#1C1515] border-[#FF0000]/60 shadow-[#FF0000]/10'
                    : order.status === 'Ready'
                    ? 'bg-[#151C17] border-[#06990F]/60'
                    : 'bg-[#181818] border-[#2A2A2A]'
                }`}
              >
                {/* Ticket Top Header */}
                <div className="p-4 border-b border-[#2A2A2A]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-base font-extrabold text-white">
                      #{order.orderNumber}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Priority tag */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          order.priority === 'Urgent'
                            ? 'bg-[#FF0000] text-white'
                            : order.priority === 'High'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {order.priority}
                      </span>

                      {/* Elapsed timer */}
                      <div
                        className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                          isLate
                            ? 'bg-[#FF0000]/20 text-[#FF0000] animate-pulse'
                            : 'bg-[#222222] text-[#A0A0A0]'
                        }`}
                      >
                        <Clock size={12} />
                        <span>{elapsed}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{order.customerName}</span>
                      <div className="text-[11px] text-[#808080]">
                        {order.orderType === 'Dine in' ? order.tableNumber || 'Table' : order.orderType}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-[#707070]">
                      Taker: {order.orderTakerName}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 flex-1 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-[#141414] border border-[#242424] flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-sm text-[#FF0000] font-mono">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-xs text-white truncate">
                            {item.name}
                          </span>
                        </div>

                        {item.variantName && (
                          <div className="text-[11px] text-amber-300/90 font-medium ml-6">
                            • Variant: {item.variantName}
                          </div>
                        )}

                        {item.addons && item.addons.length > 0 && (
                          <div className="text-[10px] text-[#909090] ml-6">
                            + {item.addons.join(', ')}
                          </div>
                        )}

                        {item.specialInstructions && (
                          <div className="text-[11px] text-[#FF0000] italic font-medium ml-6 mt-0.5">
                            Note: "{item.specialInstructions}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Advancement Action Button */}
                <div className="p-4 border-t border-[#2A2A2A] bg-[#141414] rounded-b-3xl">
                  {order.status === 'New' && (
                    <button
                      onClick={() => handleNextStatus(order)}
                      className="w-full py-2.5 rounded-xl bg-[#FFFF00] hover:bg-yellow-400 text-black font-extrabold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Flame size={15} /> Start Cooking (Preparing)
                    </button>
                  )}

                  {order.status === 'Preparing' && (
                    <button
                      onClick={() => handleNextStatus(order)}
                      className="w-full py-2.5 rounded-xl bg-[#06990F] hover:bg-emerald-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={15} /> Mark Ready to Serve
                    </button>
                  )}

                  {order.status === 'Ready' && (
                    <button
                      onClick={() => handleNextStatus(order)}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Utensils size={15} /> Mark as Served (Auto-Deduct Stock)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
