import React, { useState } from 'react';
import {
  Users,
  ScrollText,
  Award,
  Plus,
  Calendar,
  Clock,
  Phone,
  Tag,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Reservation, Customer } from '../../types';

export const CRMView: React.FC<{ initialTab?: 'reservations' | 'customers' | 'loyalty' }> = ({
  initialTab = 'customers',
}) => {
  const {
    customers,
    reservations,
    campaigns,
    currentBranch,
    addReservation,
    updateReservationStatus,
    tables,
    addCustomer,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'customers' | 'reservations' | 'loyalty'>(initialTab);

  // New Reservation modal state
  const [showResModal, setShowResModal] = useState(false);
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resGuests, setResGuests] = useState(2);
  const [resTable, setResTable] = useState('Table 1A');
  const [resDate, setResDate] = useState(new Date().toISOString().split('T')[0]);
  const [resTime, setResTime] = useState('19:30');
  const [resNotes, setResNotes] = useState('');

  // New Customer modal state
  const [showCustModal, setShowCustModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');

  const branchReservations = reservations.filter((r) => r.branchId === currentBranch.id);
  const branchCustomers = customers.filter((c) => c.branchId === currentBranch.id);
  const branchTables = tables.filter((t) => t.branchId === currentBranch.id);

  const handleCreateReservation = () => {
    if (!resName.trim() || !resPhone.trim()) {
      alert('Name and phone are required for reservations.');
      return;
    }
    addReservation({
      branchId: currentBranch.id,
      customerName: resName.trim(),
      customerPhone: resPhone.trim(),
      guestsCount: resGuests,
      tableNumber: resTable,
      reservationDate: resDate,
      reservationTime: resTime,
      status: 'Confirmed',
      notes: resNotes,
    });
    setShowResModal(false);
  };

  const handleCreateCustomer = () => {
    if (!custName.trim() || !custPhone.trim()) {
      alert('Name and phone are required.');
      return;
    }
    addCustomer({
      branchId: currentBranch.id,
      name: custName.trim(),
      phone: custPhone.trim(),
      email: custEmail.trim() || undefined,
      address: custAddress.trim() || undefined,
    });
    setShowCustModal(false);
  };

  const getTierColor = (tier: Customer['loyaltyTier']) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Gold':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Silver':
        return 'bg-slate-400/20 text-slate-200 border-slate-400/40';
      case 'Bronze':
      default:
        return 'bg-orange-800/20 text-orange-400 border-orange-700/40';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users size={22} className="text-[#FF0000]" />
            Guest Relationship & Loyalty
          </h2>
          <p className="text-xs text-[#808080] mt-0.5">
            {currentBranch.name} • Customer directory, bookings, and rewards
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'reservations' && (
            <button
              onClick={() => setShowResModal(true)}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#1E1E1E] hover:bg-[#262626] text-white border border-[#2A2A2A] flex items-center gap-1.5"
            >
              <Plus size={14} className="text-[#FF0000]" /> Book Table
            </button>
          )}

          {activeTab === 'customers' && (
            <button
              onClick={() => setShowCustModal(true)}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#1E1E1E] hover:bg-[#262626] text-white border border-[#2A2A2A] flex items-center gap-1.5"
            >
              <Plus size={14} className="text-[#FF0000]" /> Add Customer
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2A2A2A] pb-2 mb-4">
        {[
          { id: 'customers', label: `Customers (${branchCustomers.length})` },
          { id: 'reservations', label: `Reservations (${branchReservations.length})` },
          { id: 'loyalty', label: 'Loyalty & Fixed Coupons' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
              activeTab === t.id
                ? 'bg-white text-black font-bold'
                : 'text-[#808080] hover:text-white bg-[#181818]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#808080] border-b border-[#262626]">
              <tr>
                <th className="p-3.5">Customer ID</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Phone / Contact</th>
                <th className="p-3.5">Tier</th>
                <th className="p-3.5">Points</th>
                <th className="p-3.5">Total Orders</th>
                <th className="p-3.5">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {branchCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#1C1C1C]">
                  <td className="p-3.5 font-mono text-white font-bold">{c.customerId}</td>
                  <td className="p-3.5 font-bold text-white">{c.name}</td>
                  <td className="p-3.5 text-[#A0A0A0]">{c.phone}</td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTierColor(c.loyaltyTier)}`}>
                      {c.loyaltyTier}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[#06990F]">{c.loyaltyPoints} pts</td>
                  <td className="p-3.5 text-white">{c.totalOrdersCount}</td>
                  <td className="p-3.5 font-mono font-bold text-white">৳{c.totalSpent.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branchReservations.length === 0 ? (
            <div className="col-span-full p-8 text-center text-xs text-[#808080] bg-[#181818] rounded-2xl border border-[#2A2A2A]">
              No reservations scheduled for this branch.
            </div>
          ) : (
            branchReservations.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-3xl bg-[#181818] border border-[#2A2A2A] flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-white">
                      #{r.reservationNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'Confirmed'
                          ? 'bg-[#06990F]/20 text-[#06990F]'
                          : r.status === 'Pending'
                          ? 'bg-[#FFFF00]/20 text-[#FFFF00]'
                          : 'bg-[#FF0000]/20 text-[#FF0000]'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white mb-1">{r.customerName}</h4>
                  <div className="text-xs text-[#808080] mb-2">{r.customerPhone}</div>

                  <div className="space-y-1 text-xs text-[#A0A0A0] bg-[#141414] p-2.5 rounded-xl border border-[#242424] mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#FF0000]" />
                      <span>{r.reservationDate} at {r.reservationTime}</span>
                    </div>
                    <div>Table: <strong className="text-white">{r.tableNumber}</strong> ({r.guestsCount} Guests)</div>
                    {r.notes && <div className="text-[11px] italic text-[#707070]">"{r.notes}"</div>}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#262626]">
                  {r.status !== 'Confirmed' && (
                    <button
                      onClick={() => updateReservationStatus(r.id, 'Confirmed')}
                      className="flex-1 py-1.5 rounded-lg bg-[#06990F] hover:bg-emerald-600 text-white text-xs font-bold"
                    >
                      Confirm
                    </button>
                  )}
                  {r.status !== 'Canceled' && (
                    <button
                      onClick={() => updateReservationStatus(r.id, 'Canceled')}
                      className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2F2F2F] text-[#FF0000] text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Loyalty & Fixed Campaigns Tab */}
      {activeTab === 'loyalty' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#181818] to-[#222222] border border-[#2A2A2A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#06990F]/20 text-[#06990F] flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Point Accumulation Rules</h4>
                <p className="text-xs text-[#808080]">
                  Guests earn 1 Loyalty Point for every ৳50 spent (awarded after full payment & completion).
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-white bg-[#121212] px-3 py-1.5 rounded-xl border border-[#2A2A2A]">
              Bronze &lt; 100 • Silver &ge; 100 • Gold &ge; 250 • Platinum &ge; 500
            </div>
          </div>

          <h3 className="text-sm font-bold text-white mb-2">
            Active Fixed Discount Coupons (Rule 31: Fixed amounts only)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-4 rounded-3xl bg-[#181818] border border-[#2A2A2A] shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-extrabold text-sm text-[#06990F] bg-[#06990F]/10 px-2 py-0.5 rounded-md border border-[#06990F]/30">
                    {camp.couponCode}
                  </span>
                  <span className="text-xs font-bold text-white">Flat -৳{camp.fixedDiscountAmount}</span>
                </div>
                <h4 className="font-bold text-xs text-white mb-1">{camp.title}</h4>
                <p className="text-[11px] text-[#808080] mb-3">{camp.description}</p>
                <div className="text-[10px] text-[#707070] pt-2 border-t border-[#262626]">
                  Min order: ৳{camp.minimumOrderAmount} • Valid until {camp.validUntil}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Reservation Modal */}
      {showResModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-5 max-w-md w-full text-xs">
            <h3 className="font-bold text-sm text-white mb-3">Book Table Reservation</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[#808080] block mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-[#808080] block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={resPhone}
                  onChange={(e) => setResPhone(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#808080] block mb-1">Date</label>
                  <input
                    type="date"
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#808080] block mb-1">Time</label>
                  <input
                    type="time"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#808080] block mb-1">Guests Count</label>
                  <input
                    type="number"
                    min="1"
                    value={resGuests}
                    onChange={(e) => setResGuests(Number(e.target.value) || 1)}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#808080] block mb-1">Table</label>
                  <select
                    value={resTable}
                    onChange={(e) => setResTable(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                  >
                    {branchTables.map((t) => (
                      <option key={t.id} value={t.tableNumber}>
                        {t.tableNumber} ({t.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResModal(false)}
                className="px-3 py-1.5 rounded-xl bg-[#222222] text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReservation}
                className="px-4 py-1.5 rounded-xl bg-[#FF0000] font-bold text-white"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showCustModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-5 max-w-sm w-full text-xs">
            <h3 className="font-bold text-sm text-white mb-3">Add Customer</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[#808080] block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-[#808080] block mb-1">Phone *</label>
                <input
                  type="tel"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-[#808080] block mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCustModal(false)}
                className="px-3 py-1.5 rounded-xl bg-[#222222] text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                className="px-4 py-1.5 rounded-xl bg-[#06990F] font-bold text-white"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
