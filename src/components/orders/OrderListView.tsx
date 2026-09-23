import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  CreditCard,
  Printer,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Utensils,
  MapPin,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order, OrderStatus } from '../../types';
import { hasPermission } from '../../utils/permissions';

interface OrderListViewProps {
  onPayOrder: (order: Order) => void;
  onViewReceipt: (order: Order) => void;
}

export const OrderListView: React.FC<OrderListViewProps> = ({
  onPayOrder,
  onViewReceipt,
}) => {
  const {
    orders,
    currentBranch,
    updateOrderStatus,
    requestOrderCancellation,
    approveOrderCancellation,
    rejectOrderCancellation,
    currentUser,
  } = useRestaurant();

  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Customer changed order');

  const branchOrders = orders.filter((o) => o.branchId === currentBranch.id);

  const filteredOrders = branchOrders.filter((order) => {
    const matchFilter = selectedFilter === 'All' || order.status === selectedFilter;
    const matchSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return matchFilter && matchSearch;
  });

  const canApproveCancellation = hasPermission(currentUser, 'orders.approve_cancellation');

  const handleCancelSubmit = () => {
    if (!cancelModalOrder) return;
    const res = requestOrderCancellation(cancelModalOrder.id, cancelReason);
    if (res.message) alert(res.message);
    setCancelModalOrder(null);
  };

  const statuses: ('All' | OrderStatus)[] = [
    'All',
    'New',
    'Preparing',
    'Ready',
    'Served',
    'Paid',
    'Completed',
    'Canceled',
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList size={22} className="text-[#FF0000]" />
            Order Management & Lists
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1E1E1E] text-white border border-[#2A2A2A]">
              {branchOrders.length} Total
            </span>
          </h2>
          <p className="text-xs text-[#808080] mt-0.5">
            {currentBranch.name} • Full order lifecycles, cancellations, and billing history
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]" />
          <input
            type="text"
            placeholder="Search by Order # or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#606060] focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-thin">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedFilter(st)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              selectedFilter === st
                ? 'bg-white text-black font-bold'
                : 'bg-[#181818] text-[#808080] hover:text-white border border-[#2A2A2A]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#808080] border-b border-[#262626]">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer & Phone</th>
                <th className="p-3.5">Type & Table</th>
                <th className="p-3.5">Items Summary</th>
                <th className="p-3.5">Total & Payment</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#707070]">
                    No orders match the current filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemCount = order.items.reduce((s, it) => s + it.quantity, 0);

                  return (
                    <tr key={order.id} className="hover:bg-[#1C1C1C] transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-extrabold text-white text-sm">
                          #{order.orderNumber}
                        </div>
                        <div className="text-[10px] text-[#707070]">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {order.inventoryDeducted && (
                          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                            Stock Deducted
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-white">{order.customerName}</div>
                        <div className="text-[11px] text-[#808080]">{order.customerPhone}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-white">{order.orderType}</div>
                        <div className="text-[11px] text-[#808080]">
                          {order.orderType === 'Dine in' ? order.tableNumber : order.deliveryAddress || 'Pickup'}
                        </div>
                      </td>

                      <td className="p-3.5 max-w-[200px]">
                        <div className="text-white font-medium truncate">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        <div className="text-[10px] text-[#707070]">
                          {itemCount} total {itemCount === 1 ? 'dish' : 'dishes'}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-extrabold text-white">৳{order.totalAmount.toLocaleString()}</div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-[#06990F]/20 text-[#06990F]'
                              : 'bg-[#FF0000]/20 text-[#FF0000]'
                          }`}
                        >
                          {order.paymentStatus}
                          {order.paymentMethod ? ` (${order.paymentMethod})` : ''}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                            order.status === 'Ready'
                              ? 'bg-[#06990F]/20 text-[#06990F] border border-[#06990F]/30'
                              : order.status === 'Preparing'
                              ? 'bg-[#FFFF00]/20 text-[#FFFF00] border border-[#FFFF00]/30'
                              : order.status === 'Served'
                              ? 'bg-purple-500/20 text-purple-400'
                              : order.status === 'Canceled'
                              ? 'bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30'
                              : order.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {order.status}
                        </span>

                        {order.cancellationPendingApproval && (
                          <div className="text-[10px] font-bold text-amber-400 mt-1 flex items-center gap-1">
                            <AlertTriangle size={11} /> Approval Needed
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {/* Manager Approval for Cancellation after Served (Rule 14 & 15) */}
                        {order.cancellationPendingApproval && canApproveCancellation && (
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => approveOrderCancellation(order.id)}
                              className="px-2 py-1 rounded-lg bg-[#06990F] hover:bg-emerald-600 text-white text-[11px] font-bold"
                              title="Approve cancellation & return ingredients"
                            >
                              Approve Return
                            </button>
                            <button
                              onClick={() => rejectOrderCancellation(order.id)}
                              className="px-2 py-1 rounded-lg bg-[#282828] text-white text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {/* Pay Button if Unpaid */}
                        {order.paymentStatus === 'Unpaid' && order.status !== 'Canceled' && (
                          <button
                            onClick={() => onPayOrder(order)}
                            className="px-3 py-1.5 rounded-lg bg-[#06990F] hover:bg-emerald-600 text-white font-bold text-xs"
                          >
                            Pay Bill
                          </button>
                        )}

                        {/* View Receipt if Paid */}
                        {order.paymentStatus === 'Paid' && (
                          <button
                            onClick={() => onViewReceipt(order)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-xs inline-flex items-center gap-1"
                          >
                            <Printer size={13} /> Receipt
                          </button>
                        )}

                        {/* Cancel Button */}
                        {order.status !== 'Canceled' && order.status !== 'Completed' && (
                          <button
                            onClick={() => setCancelModalOrder(order)}
                            className="p-1.5 rounded-lg text-[#808080] hover:text-[#FF0000] hover:bg-[#222222]"
                            title="Cancel Order"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancellation Reason Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-5 max-w-sm w-full">
            <h3 className="font-bold text-sm text-white mb-1">
              Cancel Order #{cancelModalOrder.orderNumber}
            </h3>
            <p className="text-xs text-[#808080] mb-4">
              {cancelModalOrder.inventoryDeducted
                ? 'Notice: Ingredients have already been deducted for this served order. Submitting cancellation will require Manager approval to return ingredients to inventory.'
                : 'This order is not served yet. It can be canceled directly.'}
            </p>

            <div className="space-y-3 text-xs mb-4">
              <label className="text-[#808080] block">Reason for cancellation</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason..."
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="px-3 py-1.5 rounded-xl bg-[#222222] text-xs text-white"
              >
                Back
              </button>
              <button
                onClick={handleCancelSubmit}
                className="px-4 py-1.5 rounded-xl bg-[#FF0000] text-xs font-bold text-white"
              >
                Submit Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
