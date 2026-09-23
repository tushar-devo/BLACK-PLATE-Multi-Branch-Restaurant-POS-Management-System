import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order, PaymentMethod } from '../../types';
import { hasPermission } from '../../utils/permissions';

interface PaymentModalProps {
  order: Order | null;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ order, onClose }) => {
  const { currentUser, switchUser, users, processPayment } = useRestaurant();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bKash');
  const [tipInput, setTipInput] = useState<number>(order?.tipAmount || 0);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!order) return null;

  const isCashierAuthorized = hasPermission(currentUser, 'payments.create');

  const subtotal = order.subtotal;
  const discount = order.discountAmount;
  const finalTotal = Math.max(0, subtotal - discount + tipInput);

  const paymentMethods: { id: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'bKash', label: 'bKash', icon: <Smartphone size={18} />, color: 'bg-pink-600/20 text-pink-400 border-pink-500/40' },
    { id: 'Nagad', label: 'Nagad', icon: <Smartphone size={18} />, color: 'bg-orange-600/20 text-orange-400 border-orange-500/40' },
    { id: 'Rocket', label: 'Rocket', icon: <Smartphone size={18} />, color: 'bg-purple-600/20 text-purple-400 border-purple-500/40' },
    { id: 'Card', label: 'Credit / Debit Card', icon: <CreditCard size={18} />, color: 'bg-blue-600/20 text-blue-400 border-blue-500/40' },
    { id: 'Cash', label: 'Cash (Drawer)', icon: <Banknote size={18} />, color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40' },
  ];

  const handleProcess = () => {
    setErrorMsg(null);
    setProcessing(true);
    const res = processPayment(order.id, selectedMethod, tipInput);
    setProcessing(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message || 'Payment processing failed');
    }
  };

  const cashierUser = users.find((u) => u.role === 'Cashier');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Billing & Payment
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#222222] text-[#A0A0A0] font-mono">
                #{order.orderNumber}
              </span>
            </h3>
            <p className="text-xs text-[#808080] mt-0.5">
              Customer: {order.customerName} • {order.customerPhone}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#808080] hover:text-white hover:bg-[#252525]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cashier Permission Notice (Rule 11: Payment & refund Cashier-only) */}
        {!isCashierAuthorized && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-300">Cashier Role Required:</span>
              <p className="text-amber-200/80 mt-0.5">
                Per business rules, billing and receipts must be processed by authorized Cashier staff.
              </p>
              {cashierUser && (
                <button
                  onClick={() => switchUser(cashierUser.id)}
                  className="mt-2 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-400 text-black flex items-center gap-1.5 hover:bg-amber-300"
                >
                  <UserCheck size={13} /> Switch to Cashier ({cashierUser.name})
                </button>
              )}
            </div>
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Order Summary Box */}
          <div className="p-3.5 rounded-2xl bg-[#121212] border border-[#262626] space-y-2 text-xs">
            <div className="flex justify-between text-[#808080]">
              <span>Items Total ({order.items.length})</span>
              <span className="font-semibold text-white">৳{subtotal.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-[#06990F]">
                <span>Discount Applied</span>
                <span className="font-semibold">- ৳{discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[#808080]">
              <span>Tip / Gratuity</span>
              <div className="flex items-center gap-1">
                <span className="text-white text-xs">৳</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={tipInput}
                  onChange={(e) => setTipInput(Number(e.target.value) || 0)}
                  className="w-16 bg-[#181818] border border-[#2A2A2A] rounded px-1.5 py-0.5 text-xs text-white text-right focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between text-white font-extrabold text-sm pt-2 border-t border-[#262626]">
              <span>Total Payable</span>
              <span className="text-base text-[#06990F]">৳{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Select (Rule 27: Cash, Card, bKash, Nagad, Rocket) */}
          <div>
            <label className="text-xs font-bold text-white block mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((m) => {
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? `${m.color} ring-2 ring-white/20 shadow-md`
                        : 'bg-[#141414] text-[#808080] border-[#262626] hover:text-white hover:bg-[#1E1E1E]'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF0000]/10 border border-[#FF0000]/30 text-xs text-[#FF0000]">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-[#2A2A2A] bg-[#141414] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-xs font-semibold text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleProcess}
            disabled={!isCashierAuthorized || processing}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              !isCashierAuthorized || processing
                ? 'bg-[#222222] text-[#606060] cursor-not-allowed'
                : 'bg-[#06990F] hover:bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
            }`}
          >
            <CheckCircle2 size={15} />
            {processing ? 'Processing...' : `Confirm & Print Receipt (৳${finalTotal})`}
          </button>
        </div>
      </div>
    </div>
  );
};
