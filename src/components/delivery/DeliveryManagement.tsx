import React, { useState } from 'react';
import { Bike, MapPin, Phone, UserCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { DeliveryRecord } from '../../types';
import { hasPermission } from '../../utils/permissions';

export const DeliveryManagement: React.FC = () => {
  const {
    deliveries,
    orders,
    currentBranch,
    users,
    assignDeliveryStaff,
    updateDeliveryStatus,
    currentUser,
  } = useRestaurant();

  const [assignOrderId, setAssignOrderId] = useState<string>('');
  const [assignStaffId, setAssignStaffId] = useState<string>('');

  const deliveryStaffMembers = users.filter(
    (u) =>
      u.role === 'Delivery Staff' &&
      (u.branchId === currentBranch.id || u.branchId === 'all')
  );

  // Delivery orders needing assignment
  const unassignedDeliveryOrders = orders.filter(
    (o) =>
      o.branchId === currentBranch.id &&
      o.orderType === 'Delivery' &&
      !deliveries.some((d) => d.orderId === o.id)
  );

  // Filter deliveries based on logged in role
  const branchDeliveries = deliveries.filter((d) => {
    if (d.branchId !== currentBranch.id) return false;
    if (currentUser.role === 'Delivery Staff') {
      return d.deliveryStaffId === currentUser.id;
    }
    return true;
  });

  const canAssignDelivery = hasPermission(currentUser, 'delivery.assign');

  const handleAssign = () => {
    if (!assignOrderId || !assignStaffId) return;
    assignDeliveryStaff(assignOrderId, assignStaffId);
    setAssignOrderId('');
  };

  const getStatusBadge = (status: DeliveryRecord['status']) => {
    switch (status) {
      case 'Assigned':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Picked Up':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'Out for Delivery':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'Delivered':
        return 'bg-[#06990F]/20 text-[#06990F] border border-[#06990F]/30';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bike size={22} className="text-[#FF0000]" />
            Delivery Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1E1E1E] text-white border border-[#2A2A2A]">
              {branchDeliveries.length} Records
            </span>
          </h2>
          <p className="text-xs text-[#808080] mt-0.5">
            {currentBranch.name} • Order assignment, dispatch tracking, and rider coordination
          </p>
        </div>
      </div>

      {/* Assignment Card for Order Taker */}
      {canAssignDelivery && unassignedDeliveryOrders.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#181818] border border-[#2A2A2A] mb-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertCircle size={14} className="text-[#FF0000]" />
            Pending Delivery Assignment ({unassignedDeliveryOrders.length})
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-2.5 text-xs">
            <select
              value={assignOrderId}
              onChange={(e) => setAssignOrderId(e.target.value)}
              className="flex-1 bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
            >
              <option value="">Select Delivery Order...</option>
              {unassignedDeliveryOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.orderNumber} - {o.customerName} ({o.deliveryAddress})
                </option>
              ))}
            </select>

            <select
              value={assignStaffId}
              onChange={(e) => setAssignStaffId(e.target.value)}
              className="bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
            >
              <option value="">Select Rider...</option>
              {deliveryStaffMembers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.staffId})
                </option>
              ))}
            </select>

            <button
              onClick={handleAssign}
              disabled={!assignOrderId || !assignStaffId}
              className="px-4 py-2 rounded-xl bg-[#06990F] hover:bg-emerald-600 disabled:bg-[#222222] disabled:text-[#606060] font-bold text-white transition-colors"
            >
              Assign Rider
            </button>
          </div>
        </div>
      )}

      {/* Deliveries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branchDeliveries.length === 0 ? (
          <div className="col-span-full p-10 bg-[#181818] border border-[#2A2A2A] rounded-3xl text-center text-xs text-[#808080]">
            No delivery records for this branch.
          </div>
        ) : (
          branchDeliveries.map((del) => (
            <div
              key={del.id}
              className="p-4 rounded-3xl bg-[#181818] border border-[#2A2A2A] flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-extrabold text-sm text-white">
                    #{del.deliveryNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(del.status)}`}>
                    {del.status}
                  </span>
                </div>

                <div className="font-bold text-sm text-white mb-1">{del.customerName}</div>
                <div className="text-xs text-[#808080] flex items-center gap-1.5 mb-2">
                  <Phone size={12} /> {del.customerPhone}
                </div>
                <div className="text-xs text-[#A0A0A0] flex items-start gap-1.5 mb-3 bg-[#121212] p-2.5 rounded-xl border border-[#242424]">
                  <MapPin size={13} className="text-[#FF0000] shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{del.address}</span>
                </div>

                <div className="text-xs text-[#808080] flex items-center gap-1.5 pt-2 border-t border-[#242424]">
                  <UserCheck size={13} className="text-[#06990F]" />
                  Rider: <span className="text-white font-medium">{del.deliveryStaffName || 'Assigned'}</span>
                </div>
              </div>

              {/* Status Update Pipeline */}
              <div className="mt-4 pt-3 border-t border-[#242424]">
                <label className="text-[10px] uppercase font-bold text-[#808080] block mb-1">
                  Delivery Progress
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Picked Up', 'Out for Delivery', 'Delivered'] as const).map((nextSt) => (
                    <button
                      key={nextSt}
                      onClick={() => updateDeliveryStatus(del.id, nextSt)}
                      disabled={del.status === 'Delivered'}
                      className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-colors ${
                        del.status === nextSt
                          ? 'bg-white text-black'
                          : 'bg-[#222222] hover:bg-[#2A2A2A] text-white'
                      }`}
                    >
                      {nextSt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
