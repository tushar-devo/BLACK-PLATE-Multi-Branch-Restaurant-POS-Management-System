import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Trash2,
  UtensilsCrossed,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MenuItem, MenuItemVariant } from '../../types';
import siteLogo from '../../image/Logo.png';

interface CustomerQRSimulatorProps {
  onClose: () => void;
}

export const CustomerQRSimulator: React.FC<CustomerQRSimulatorProps> = ({ onClose }) => {
  const { menuItems, tables, currentBranch, orders, requestOrderCancellation } = useRestaurant();

  const branchTables = tables.filter((t) => t.branchId === currentBranch.id);
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>(
    branchTables[0]?.tableNumber || 'Table 1A'
  );

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCart, setCustomerCart] = useState<
    { item: MenuItem; variant?: MenuItemVariant; quantity: number }[]
  >([]);
  const [activeStep, setActiveStep] = useState<'menu' | 'cart' | 'confirmed'>('menu');
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  const { submitCartOrder, setCartCustomerName, setCartCustomerPhone, setCartTableNumber, setCartOrderType, addToCart, clearCart } = useRestaurant();

  const handleAddDish = (item: MenuItem) => {
    const variant = item.variants[0];
    setCustomerCart((prev) => {
      const idx = prev.findIndex((p) => p.item.id === item.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { item, variant, quantity: 1 }];
    });
  };

  const handleQty = (itemId: string, delta: number) => {
    setCustomerCart((prev) =>
      prev
        .map((p) => {
          if (p.item.id === itemId) {
            const next = p.quantity + delta;
            return next > 0 ? { ...p, quantity: next } : null;
          }
          return p;
        })
        .filter(Boolean) as { item: MenuItem; variant?: MenuItemVariant; quantity: number }[]
    );
  };

  const cartTotal = customerCart.reduce(
    (sum, p) => sum + (p.item.price + (p.variant?.priceModifier || 0)) * p.quantity,
    0
  );

  const handleSubmitCustomerOrder = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Name and phone number are strictly required for dine-in QR orders.');
      return;
    }
    if (customerCart.length === 0) return;

    // Load customer selection into context
    clearCart();
    setCartOrderType('Dine in');
    setCartTableNumber(selectedTableNumber);
    setCartCustomerName(customerName);
    setCartCustomerPhone(customerPhone);

    customerCart.forEach((ci) => {
      addToCart(ci.item, ci.variant?.name, [], '', ci.quantity);
    });

    // Execute submit
    const res = submitCartOrder();
    if (res.success && res.orderId) {
      setSubmittedOrderId(res.orderId);
      setActiveStep('confirmed');
    }
  };

  // Find submitted order live status
  const liveOrder = orders.find((o) => o.id === submittedOrderId);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-[#2A2A2A] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col h-[700px] max-h-[90vh]">
        {/* Mobile Mockup Notch Header */}
        <div className="bg-[#181818] p-3 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-[#FF0000]" />
            <span className="text-xs font-bold text-white">Customer QR Experience</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#808080] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mobile Device Screen Content */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-[#141414] text-white">
          {/* Restaurant Banner */}
          <div className="p-4 bg-gradient-to-b from-[#222222] to-[#141414] border-b border-[#242424]">
            <div className="flex items-center gap-2.5 mb-1.5">
              <img src={siteLogo} alt="Black Plate" className="w-8 h-8 rounded-lg object-contain bg-black/40 border border-[#333333] p-0.5" />
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#FF0000]">
                  {currentBranch.name}
                </div>
                <h3 className="font-extrabold text-base text-white leading-tight">BLACK PLATE</h3>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-[#A0A0A0] mt-1">
              <span>Ordering from:</span>
              <select
                value={selectedTableNumber}
                onChange={(e) => setSelectedTableNumber(e.target.value)}
                className="bg-[#242424] border border-[#3A3A3A] rounded px-2 py-0.5 text-xs text-white"
              >
                {branchTables.map((t) => (
                  <option key={t.id} value={t.tableNumber}>
                    {t.tableNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeStep === 'menu' && (
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Dine-In Menu</span>
                  <span className="text-[11px] text-[#808080]">Scan verified</span>
                </div>

                <div className="space-y-2.5">
                  {menuItems.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-2xl bg-[#1A1A1A] border border-[#262626] flex items-center justify-between gap-2.5"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{item.name}</h4>
                        <div className="text-[11px] text-[#06990F] font-semibold">
                          ৳{item.price.toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddDish(item)}
                        className="p-1.5 rounded-xl bg-[#282828] hover:bg-[#333333] text-white"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky Bottom Cart Bar */}
              {customerCart.length > 0 && (
                <div className="pt-4 mt-4 border-t border-[#262626]">
                  <button
                    onClick={() => setActiveStep('cart')}
                    className="w-full py-3 px-4 rounded-2xl bg-[#FF0000] text-white font-bold text-xs flex items-center justify-between shadow-lg"
                  >
                    <span>View Cart ({customerCart.reduce((s, p) => s + p.quantity, 0)} items)</span>
                    <span>৳{cartTotal.toLocaleString()}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeStep === 'cart' && (
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <button
                  onClick={() => setActiveStep('menu')}
                  className="text-xs text-[#A0A0A0] hover:text-white flex items-center gap-1 mb-3"
                >
                  <ArrowLeft size={14} /> Back to Menu
                </button>

                <h4 className="font-bold text-sm text-white mb-3">Your Selection</h4>

                <div className="space-y-2 mb-4">
                  {customerCart.map((ci) => (
                    <div
                      key={ci.item.id}
                      className="p-2.5 rounded-xl bg-[#1A1A1A] border border-[#262626] flex items-center justify-between"
                    >
                      <div className="truncate">
                        <div className="font-bold text-xs text-white truncate">{ci.item.name}</div>
                        <div className="text-[10px] text-[#808080]">
                          ৳{ci.item.price} each
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQty(ci.item.id, -1)}
                          className="p-1 rounded bg-[#262626]"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{ci.quantity}</span>
                        <button
                          onClick={() => handleQty(ci.item.id, 1)}
                          className="p-1 rounded bg-[#262626]"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Required Name and Phone inputs per Rule 22 */}
                <div className="space-y-2.5 p-3 rounded-2xl bg-[#1A1A1A] border border-[#262626]">
                  <div className="text-xs font-bold text-white">Guest Information</div>
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name (Required) *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#606060] focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number (Required) *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#606060] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#262626]">
                <div className="flex justify-between text-xs font-bold text-white mb-3">
                  <span>Total Payable:</span>
                  <span className="text-[#06990F]">৳{cartTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleSubmitCustomerOrder}
                  className="w-full py-3 rounded-2xl bg-[#06990F] hover:bg-emerald-600 font-extrabold text-xs text-white shadow-lg"
                >
                  Confirm & Place Order
                </button>
              </div>
            </div>
          )}

          {activeStep === 'confirmed' && (
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#06990F]/20 text-[#06990F] flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-extrabold text-lg text-white mb-1">Order Received!</h3>
              <p className="text-xs text-[#A0A0A0] max-w-xs mb-4">
                Your order is now routed to Black Plate Kitchen ({selectedTableNumber}).
              </p>

              {liveOrder && (
                <div className="w-full p-4 rounded-2xl bg-[#1A1A1A] border border-[#262626] text-left text-xs mb-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Order ID:</span>
                    <span className="font-mono font-bold text-white">#{liveOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Live Status:</span>
                    <span className="font-bold text-[#FFFF00]">{liveOrder.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Total:</span>
                    <span className="font-bold text-white">৳{liveOrder.totalAmount}</span>
                  </div>

                  {/* Rule 21: Customer can cancel until kitchen starts Preparing */}
                  {liveOrder.status === 'New' && (
                    <button
                      onClick={() => {
                        requestOrderCancellation(liveOrder.id, 'Customer changed mind');
                        alert('Order successfully canceled.');
                        setActiveStep('menu');
                      }}
                      className="w-full mt-2 py-1.5 rounded-lg bg-[#FF0000]/20 hover:bg-[#FF0000]/30 text-[#FF0000] border border-[#FF0000]/40 text-[11px] font-bold"
                    >
                      Cancel Order (Allowed while New)
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setCustomerCart([]);
                  setActiveStep('menu');
                }}
                className="py-2 px-4 rounded-xl bg-[#242424] text-xs font-semibold text-white"
              >
                Order More Items
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TableQRCodeModal: React.FC<{ table: any; onClose: () => void }> = ({
  table,
  onClose,
}) => {
  if (!table) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl w-full max-w-sm overflow-hidden p-6 text-center shadow-2xl">
        <div className="flex justify-end">
          <button onClick={onClose} className="p-1 text-[#808080] hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#141414] border border-[#333333] flex items-center justify-center mx-auto mb-3 p-1.5 shadow-lg">
          <img src={siteLogo} alt="Black Plate" className="w-full h-full object-contain" />
        </div>

        <h3 className="font-extrabold text-base text-white">Scan & Dine QR Code</h3>
        <p className="text-xs text-[#808080] mt-0.5 mb-5">{table.tableNumber} • {table.location}</p>

        {/* Realistic SVG QR Code Display */}
        <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mx-auto mb-4">
          <svg className="w-48 h-48" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#ffffff" />
            {/* Top-left corner finder */}
            <rect x="10" y="10" width="20" height="20" fill="#000000" />
            <rect x="14" y="14" width="12" height="12" fill="#ffffff" />
            <rect x="17" y="17" width="6" height="6" fill="#000000" />

            {/* Top-right corner finder */}
            <rect x="70" y="10" width="20" height="20" fill="#000000" />
            <rect x="74" y="14" width="12" height="12" fill="#ffffff" />
            <rect x="77" y="17" width="6" height="6" fill="#000000" />

            {/* Bottom-left corner finder */}
            <rect x="10" y="70" width="20" height="20" fill="#000000" />
            <rect x="14" y="74" width="12" height="12" fill="#ffffff" />
            <rect x="17" y="77" width="6" height="6" fill="#000000" />

            {/* Pattern data bits */}
            <rect x="36" y="12" width="6" height="6" fill="#000000" />
            <rect x="46" y="12" width="6" height="6" fill="#000000" />
            <rect x="56" y="12" width="6" height="6" fill="#000000" />

            <rect x="36" y="24" width="6" height="6" fill="#000000" />
            <rect x="50" y="24" width="6" height="6" fill="#000000" />

            <rect x="12" y="38" width="6" height="6" fill="#000000" />
            <rect x="24" y="38" width="6" height="6" fill="#000000" />
            <rect x="38" y="38" width="12" height="12" fill="#000000" />
            <rect x="56" y="38" width="6" height="6" fill="#000000" />
            <rect x="70" y="38" width="6" height="6" fill="#000000" />
            <rect x="82" y="38" width="6" height="6" fill="#000000" />

            <rect x="38" y="56" width="6" height="6" fill="#000000" />
            <rect x="50" y="56" width="6" height="6" fill="#000000" />
            <rect x="64" y="56" width="12" height="12" fill="#000000" />
            <rect x="82" y="56" width="6" height="6" fill="#000000" />

            <rect x="36" y="74" width="6" height="6" fill="#000000" />
            <rect x="48" y="74" width="6" height="6" fill="#000000" />
            <rect x="60" y="74" width="6" height="6" fill="#000000" />
            <rect x="78" y="74" width="6" height="6" fill="#000000" />
          </svg>
        </div>

        <div className="text-[11px] font-mono text-[#A0A0A0] mb-4">
          https://blackplate.app/order/{table.id}
        </div>

        <button
          onClick={() => window.print()}
          className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs"
        >
          Print Table Sticker
        </button>
      </div>
    </div>
  );
};
