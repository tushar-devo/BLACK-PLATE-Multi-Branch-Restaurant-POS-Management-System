import React, { useState } from 'react';
import {
  UserCog,
  Plus,
  Trash2,
  KeyRound,
  Shield,
  Clock,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { User, Role } from '../../types';
import { hasPermission } from '../../utils/permissions';

export const StaffView: React.FC<{ onOpenAddStaff: () => void }> = ({ onOpenAddStaff }) => {
  const { users, currentUser, deleteUser, resetPin, branches, currentBranch, updateUser } = useRestaurant();

  const [pinModalUser, setPinModalUser] = useState<User | null>(null);
  const [newPin, setNewPin] = useState('');
  const [permModalUser, setPermModalUser] = useState<User | null>(null);

  const canCreateStaff = hasPermission(currentUser, 'staff.create');
  const canDeleteStaff = hasPermission(currentUser, 'staff.delete');

  const branchUsers = users.filter(
    (u) => u.branchId === currentBranch.id || u.branchId === 'all'
  );

  const handlePinSubmit = () => {
    if (!pinModalUser || !newPin.trim()) return;
    resetPin(pinModalUser.id, newPin.trim());
    setPinModalUser(null);
    setNewPin('');
  };

  const handleDeleteEmployee = (u: User) => {
    const ok = window.confirm(
      `Are you sure you want to permanently delete ${u.name} (${u.staffId})? This action is irreversible.`
    );
    if (ok) {
      deleteUser(u.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCog size={22} className="text-[#FF0000]" />
            Staff & RBAC Security
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1E1E1E] text-white border border-[#2A2A2A]">
              {branchUsers.length} Employees
            </span>
          </h2>
          <p className="text-xs text-[#808080] mt-0.5">
            {currentBranch.name} • 13 role-based permissions, shifts, and credentials
          </p>
        </div>

        {canCreateStaff && (
          <button
            onClick={onOpenAddStaff}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#1E1E1E] hover:bg-[#262626] text-white border border-[#2A2A2A] flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} className="text-[#06990F]" /> Add Staff Member
          </button>
        )}
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {branchUsers.map((u) => {
          const isMe = u.id === currentUser.id;
          const assignedBranch = branches.find((b) => b.id === u.branchId);

          return (
            <div
              key={u.id}
              className={`p-4 rounded-3xl bg-[#181818] border transition-all flex flex-col justify-between shadow-xl ${
                isMe ? 'border-[#FF0000]/60 ring-1 ring-[#FF0000]/20' : 'border-[#2A2A2A]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#333333]"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        {u.name}
                        {isMe && (
                          <span className="text-[10px] font-mono bg-[#FF0000]/20 text-[#FF0000] px-1.5 py-0.2 rounded">
                            YOU
                          </span>
                        )}
                      </h4>
                      <div className="text-[11px] text-[#A0A0A0] font-mono">{u.staffId}</div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#242424] text-white border border-[#333333]">
                    {u.role}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#808080] bg-[#121212] p-3 rounded-2xl border border-[#242424] mb-3">
                  <div>Email: <span className="text-white/80">{u.email}</span></div>
                  <div>Phone: <span className="text-white/80">{u.phone}</span></div>
                  <div>
                    Branch:{' '}
                    <span className="text-white/80">
                      {u.branchId === 'all' ? 'All Branches (Global)' : assignedBranch?.name || u.branchId}
                    </span>
                  </div>
                  <div>Shift: <span className="text-amber-400 font-semibold">{u.shift || 'Morning'}</span></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setPinModalUser(u);
                      setNewPin('');
                    }}
                    className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-[#A0A0A0] hover:text-white"
                    title="Reset Login PIN"
                  >
                    <KeyRound size={14} />
                  </button>
                  <button
                    onClick={() => setPermModalUser(u)}
                    className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-[#A0A0A0] hover:text-white"
                    title="Manage Permission Overrides"
                  >
                    <Shield size={14} />
                  </button>
                </div>

                {canDeleteStaff && u.role !== 'Owner' && (
                  <button
                    onClick={() => handleDeleteEmployee(u)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg text-[#FF0000] hover:bg-[#FF0000]/10 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Delete Permanently
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset PIN Modal */}
      {pinModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-5 max-w-sm w-full text-xs">
            <h3 className="font-bold text-sm text-white mb-1">Reset Access PIN</h3>
            <p className="text-[#808080] mb-4">
              Enter a new 4-digit PIN for {pinModalUser.name} ({pinModalUser.staffId}).
            </p>

            <input
              type="password"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="e.g. 5678"
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white font-mono text-center tracking-widest text-lg mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPinModalUser(null)}
                className="px-3 py-1.5 rounded-xl bg-[#222222] text-white"
              >
                Cancel
              </button>
              <button
                onClick={handlePinSubmit}
                className="px-4 py-1.5 rounded-xl bg-[#06990F] font-bold text-white"
              >
                Update PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Overrides Modal */}
      {permModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-5 max-w-md w-full text-xs">
            <h3 className="font-bold text-sm text-white mb-1">
              Permission Overrides: {permModalUser.name}
            </h3>
            <p className="text-[#808080] mb-4">
              Role: <strong>{permModalUser.role}</strong>. Set custom permissions that override role defaults.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {[
                { perm: 'inventory.view' as const, label: 'View Inventory' },
                { perm: 'inventory.adjust' as const, label: 'Adjust Stock Levels' },
                { perm: 'menu.change_price' as const, label: 'Modify Menu Dish Prices' },
                { perm: 'orders.approve_cancellation' as const, label: 'Approve Order Cancellations' },
                { perm: 'reports.export' as const, label: 'Export Reports & Financials' },
              ].map(({ perm, label }) => {
                const currentVal = !!permModalUser.permissionOverrides?.[perm];
                return (
                  <div
                    key={perm}
                    className="p-2.5 rounded-xl bg-[#121212] border border-[#262626] flex items-center justify-between"
                  >
                    <span>{label}</span>
                    <button
                      onClick={() => {
                        const updated = {
                          ...permModalUser,
                          permissionOverrides: {
                            ...permModalUser.permissionOverrides,
                            [perm]: !currentVal,
                          },
                        };
                        updateUser(updated);
                        setPermModalUser(updated);
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        currentVal ? 'bg-[#06990F] text-white' : 'bg-[#282828] text-[#808080]'
                      }`}
                    >
                      {currentVal ? 'GRANTED' : 'DEFAULT'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#262626]">
              <button
                onClick={() => setPermModalUser(null)}
                className="px-4 py-1.5 rounded-xl bg-[#222222] text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
