import React from 'react';
import { Eye, Clock, Utensils, MapPin } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order, OrderStatus } from '../../types';

interface OrderQueuesBarProps {
  onViewAll: () => void;
  onSelectOrder: (order: Order) => void;
}

export const OrderQueuesBar: React.FC<OrderQueuesBarProps> = ({
  onViewAll,
  onSelectOrder,
}) => {
  const { activeOrderQueues } = useRestaurant();

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Ready':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#06990F]/20 text-[#06990F] border border-[#06990F]/30">
            Ready to serve
          </span>
        );
      case 'Preparing':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FFFF00]/20 text-[#FFFF00] border border-[#FFFF00]/30">
            On cooking
          </span>
        );
      case 'New':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
            New
          </span>
        );
      case 'Served':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Served
          </span>
        );
      case 'Canceled':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30">
            Canceled
          </span>
        );
      case 'Paid':
      case 'Completed':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Completed
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-500/20 text-gray-400">
            {status}
          </span>
        );
    }
  };

  const formatOrderTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full mb-5">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white tracking-tight">Order queues</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E1E1E] text-[#A0A0A0] border border-[#2A2A2A]">
            {activeOrderQueues.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewAll}
            className="p-1.5 rounded-lg bg-[#1E1E1E] hover:bg-[#282828] text-[#A0A0A0] hover:text-white border border-[#2A2A2A] transition-colors"
            title="View summary"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={onViewAll}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1E1E1E] hover:bg-[#282828] text-white border border-[#2A2A2A] transition-colors"
          >
            View All
          </button>
        </div>
      </div>

      {/* Horizontal Order Queue Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {activeOrderQueues.length === 0 ? (
          <div className="w-full p-6 rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] text-center text-xs text-[#A0A0A0]">
            No pending orders currently in queue for this branch.
          </div>
        ) : (
          activeOrderQueues.map((order) => {
            const totalItemsCount = order.items.reduce((s, it) => s + it.quantity, 0);
            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="min-w-[260px] max-w-[280px] p-3.5 rounded-2xl bg-[#1E1E1E] hover:bg-[#242424] border border-[#2A2A2A] hover:border-[#383838] transition-all cursor-pointer shadow-lg shadow-black/30 flex flex-col justify-between shrink-0 group"
              >
                <div>
                  {/* Top row: Order Number & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-[#A0A0A0] group-hover:text-white transition-colors">
                      #{order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Customer Name */}
                  <h4 className="font-semibold text-sm text-white truncate mb-1">
                    {order.customerName}
                  </h4>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[#808080] mb-3">
                    <Clock size={12} />
                    <span>{formatOrderTime(order.createdAt)}</span>
                    <span>•</span>
                    <span className="font-medium text-white/80">৳{order.totalAmount}</span>
                  </div>
                </div>

                {/* Bottom badges: items & table */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#262626]">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#252525] text-[#B0B0B0] flex items-center gap-1">
                    <Utensils size={11} className="text-[#A0A0A0]" />
                    {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
                  </span>

                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#252525] text-[#B0B0B0] flex items-center gap-1 truncate">
                    <MapPin size={11} className="text-[#A0A0A0]" />
                    {order.orderType === 'Dine in' ? order.tableNumber || 'Table' : order.orderType}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
