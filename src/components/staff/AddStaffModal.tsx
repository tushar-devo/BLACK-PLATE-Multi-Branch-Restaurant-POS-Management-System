import React, { useState } from 'react';
import { X, UserPlus, Shield } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Role } from '../../types';

interface AddStaffModalProps {
  onClose: () => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ onClose }) => {
  const { createUser, branches, currentBranch } = useRestaurant();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('Order Taker');
  const [branchId, setBranchId] = useState(currentBranch.id);
  const [shift, setShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');
  const [pin, setPin] = useState('1234');

  const allRoles: Role[] = [
    'Owner',
    'Super Admin',
    'Branch Manager',
    'Accountant',
    'Cashier',
    'Order Taker',
    'Head Chef',
    'Kitchen Staff',
    'Inventory Manager',
    'Staff Manager',
    'Marketer',
    'Graphic Designer',
    'Delivery Staff',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Name and email are required');
      return;
    }

    createUser({
      name: name.trim(),
      email: email.trim(),
      username: email.trim().split('@')[0],
      phone: phone.trim() || '+880 1700-000000',
      role,
      branchId,
      shift,
      pin: pin.trim() || '1234',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      active: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-[#FF0000]" />
            <h3 className="font-bold text-white text-sm">Add New Staff Member</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#808080] hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="text-[#808080] block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mahfuzur Rahman"
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[#808080] block mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@blackplate.com"
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[#808080] block mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1711..."
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[#808080] block mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {allRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#808080] block mb-1">Assigned Branch</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="all">All Branches (Global)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[#808080] block mb-1">Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>

            <div>
              <label className="text-[#808080] block mb-1">Access PIN</label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4-digit PIN"
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white font-mono text-center"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#262626] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#222222] text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#FF0000] hover:bg-red-700 font-bold text-white shadow-md"
            >
              Create Staff Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
