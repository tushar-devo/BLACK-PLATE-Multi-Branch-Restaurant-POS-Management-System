import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Trash2,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { OrderType } from '../../types';

interface CartDrawerProps {
  onOpenPaymentModal: () => void;
  onOpenQROrderModal: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onOpenPaymentModal,
  onOpenQROrderModal,
}) => {
  const {
    cart,
    cartOrderType,
    setCartOrderType,
    cartCustomerName,
    setCartCustomerName,
    cartCustomerPhone,
    setCartCustomerPhone,
    cartTableNumber,
    setCartTableNumber,
    cartDeliveryAddress,
    setCartDeliveryAddress,
    cartDiscountAmount,
    cartDiscountCode,
    cartTipAmount,
    setCartTipAmount,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    applyDiscountCoupon,
    removeDiscountCoupon,
    submitCartOrder,
    tables,
    currentBranch,
  } = useRestaurant();

  const [customerInfoOpen, setCustomerInfoOpen] = useState(true);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [customTipActive, setCustomTipActive] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalAmount = Math.max(0, subtotal - cartDiscountAmount + cartTipAmount);

  // Available branch tables for dropdown
  const branchTables = tables.filter((t) => t.branchId === currentBranch.id);

  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) return;
    const res = applyDiscountCoupon(promoCodeInput.trim());
    setPromoMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setPromoCodeInput('');
    }
  };

  const handleCreateOrderDirectly = () => {
    setOrderSubmitting(true);
    const res = submitCartOrder();
    setOrderSubmitting(false);
    if (!res.success) {
      alert(res.message || 'Failed to submit order');
    }
  };

  const orderTypes: { type: OrderType; icon: React.ComponentType<{ size?: number }> }[] = [
    { type: 'Dine in', icon: UtensilsCrossed },
    { type: 'Takeaway', icon: ShoppingBag },
    { type: 'Delivery', icon: Bike },
  ];

  return (
    <div className="w-full lg:w-96 bg-[#181818] border border-[#2A2A2A] rounded-3xl p-4 flex flex-col justify-between shrink-0 shadow-2xl shadow-black/60">
      {/* Top Header (Matches Screenshot Cart Details) */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-white">Cart Details</h3>
            {cart.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#242424] text-[#A0A0A0] border border-[#333333]">
                {cart.reduce((s, it) => s + it.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={onOpenQROrderModal}
            className="text-[11px] font-semibold text-[#A0A0A0] hover:text-white px-2 py-1 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] border border-[#303030] transition-colors flex items-center gap-1"
            title="Simulate customer scanning table QR code"
          >
            <Sparkles size={12} className="text-[#FF0000]" /> QR Order
          </button>
        </div>

        {/* Order Type Toggle Pills: Dine in, Takeaway, Delivery */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#121212] rounded-2xl border border-[#262626] mb-4">
          {orderTypes.map(({ type, icon: Icon }) => {
            const isActive = cartOrderType === type;
            return (
              <button
                key={type}
                onClick={() => setCartOrderType(type)}
                className={`py-2 px-1 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-[#222222] text-white shadow-sm border border-[#353535]'
                    : 'text-[#808080] hover:text-white hover:bg-[#181818]'
                }`}
              >
                <Icon size={13} />
                <span>{type}</span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Customer Information (Matches Screenshot) */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-3 mb-4">
          <button
            onClick={() => setCustomerInfoOpen(!customerInfoOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-white text-left"
          >
            <span>Customer information</span>
            {customerInfoOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {customerInfoOpen && (
            <div className="mt-3 space-y-2.5">
              <div>
                <label className="text-[11px] font-medium text-[#808080] block mb-1">
                  Customer name <span className="text-[#FF0000]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter name (e.g. Dwi Lestari)"
                  value={cartCustomerName}
                  onChange={(e) => setCartCustomerName(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#606060] focus:outline-none focus:border-[#404040]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#808080] block mb-1">
                  Phone number <span className="text-[#FF0000]">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+880 1712-XXXXXX"
                  value={cartCustomerPhone}
                  onChange={(e) => setCartCustomerPhone(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#606060] focus:outline-none focus:border-[#404040]"
                />
              </div>

              {cartOrderType === 'Dine in' ? (
                <div>
                  <label className="text-[11px] font-medium text-[#808080] block mb-1">
                    Table location
                  </label>
                  <select
                    value={cartTableNumber}
                    onChange={(e) => setCartTableNumber(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#404040]"
                  >
                    {branchTables.map((t) => (
                      <option key={t.id} value={t.tableNumber}>
                        {t.tableNumber} ({t.capacity} Seats - {t.status})
                      </option>
                    ))}
                  </select>
                </div>
              ) : cartOrderType === 'Delivery' ? (
                <div>
                  <label className="text-[11px] font-medium text-[#808080] block mb-1">
                    Delivery address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Full street address..."
                    value={cartDeliveryAddress}
                    onChange={(e) => setCartDeliveryAddress(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#606060] focus:outline-none focus:border-[#404040] resize-none"
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Order Items Header with Clear All Items (Matches Screenshot) */}
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-white">Order items</span>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-[#FF0000] hover:underline"
            >
              Clear all items
            </button>
          )}
        </div>

        {/* Cart Item Cards List */}
        <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#707070] bg-[#141414] border border-[#242424] rounded-2xl">
              No items in cart yet.
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-[#141414] border border-[#262626] rounded-2xl flex items-center justify-between gap-2.5 group"
              >
                <img
                  src={item.menuItem.image}
                  alt={item.menuItem.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#2F2F2F]"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-white truncate">{item.menuItem.name}</h4>
                  <div className="text-[10px] text-[#808080] truncate">
                    Variant: <span className="text-white/80">{item.selectedVariant?.name || 'Standard'}</span>
                  </div>
                  <div className="text-xs font-bold text-[#A0A0A0] mt-0.5">
                    ৳{item.totalPrice.toLocaleString()}
                  </div>
                </div>

                {/* Stepper & Delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-1 py-0.5">
                    <button
                      onClick={() => updateCartQuantity(item.id, -1)}
                      className="p-0.5 text-[#808080] hover:text-white"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, 1)}
                      className="p-0.5 text-[#808080] hover:text-white"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-[#808080] hover:text-[#FF0000] transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Summary & Checkout Actions (Matches Screenshot) */}
      <div className="pt-3 border-t border-[#2A2A2A] mt-3">
        {/* Pricing breakdown lines */}
        <div className="space-y-1.5 text-xs text-[#A0A0A0] mb-3">
          <div className="flex items-center justify-between">
            <span>Sub total</span>
            <span className="font-semibold text-white">৳{subtotal.toLocaleString()}</span>
          </div>

          {cartDiscountAmount > 0 && (
            <div className="flex items-center justify-between text-[#06990F]">
              <span className="flex items-center gap-1">
                Discount ({cartDiscountCode})
                <button
                  onClick={removeDiscountCoupon}
                  className="text-[10px] underline ml-1 hover:text-white"
                >
                  remove
                </button>
              </span>
              <span className="font-semibold">- ৳{cartDiscountAmount.toLocaleString()}</span>
            </div>
          )}

          {/* Optional Tip line */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCustomTipActive(!customTipActive)}
              className="text-[11px] underline text-[#808080] hover:text-white"
            >
              Tip (optional)
            </button>
            {customTipActive ? (
              <div className="flex items-center gap-1">
                <span className="text-white text-xs">৳</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={cartTipAmount || ''}
                  onChange={(e) => setCartTipAmount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-16 bg-[#121212] border border-[#2A2A2A] rounded px-1.5 py-0.5 text-xs text-white text-right focus:outline-none"
                />
              </div>
            ) : (
              <span className="font-semibold text-white">৳{cartTipAmount}</span>
            )}
          </div>

          <div className="flex items-center justify-between text-white font-extrabold text-sm pt-2 border-t border-[#262626]">
            <span>Total amount</span>
            <span className="text-base text-white">৳{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Promo Code Input (Fixed Discounts Only per Rule 31) */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Enter promo code"
            value={promoCodeInput}
            onChange={(e) => setPromoCodeInput(e.target.value)}
            className="flex-1 bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#606060] focus:outline-none focus:border-[#404040]"
          />
          <button
            onClick={handleApplyPromo}
            className="px-3.5 py-1.5 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-xs font-semibold text-white border border-[#303030] transition-colors"
          >
            Apply
          </button>
        </div>

        {promoMessage && (
          <div
            className={`text-[11px] mb-2 px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
              promoMessage.isError
                ? 'bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20'
                : 'bg-[#06990F]/10 text-[#06990F] border border-[#06990F]/20'
            }`}
          >
            {promoMessage.isError ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
            <span>{promoMessage.text}</span>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Quick Submit into Kitchen & POS Queue */}
          <button
            onClick={handleCreateOrderDirectly}
            disabled={cart.length === 0 || orderSubmitting}
            className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all text-center ${
              cart.length === 0
                ? 'bg-[#202020] text-[#555555] cursor-not-allowed'
                : 'bg-[#242424] hover:bg-[#2D2D2D] text-white border border-[#353535]'
            }`}
          >
            Send to Kitchen
          </button>

          {/* Proceed Payment (Matches dark teal/green CTA in screenshot) */}
          <button
            onClick={onOpenPaymentModal}
            disabled={cart.length === 0}
            className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all text-center shadow-lg ${
              cart.length === 0
                ? 'bg-[#152e27] text-[#4d7268] cursor-not-allowed'
                : 'bg-[#004D40] hover:bg-[#00695C] text-white shadow-emerald-950/50'
            }`}
          >
            Proceed payment
          </button>
        </div>
      </div>
    </div>
  );
};
