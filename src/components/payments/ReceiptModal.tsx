import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { Receipt } from '../../types';
import siteLogo from '../../image/Logo.png';

interface ReceiptModalProps {
  receipt: Receipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(receipt.createdAt).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#06990F]" />
            <h3 className="font-bold text-white text-sm">Receipt Generated</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#808080] hover:text-white hover:bg-[#252525]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Printable 80mm Thermal Receipt Content */}
        <div className="p-5 overflow-y-auto flex-1 flex justify-center bg-[#101010]">
          <div
            id="printable-receipt"
            className="w-full max-w-[340px] bg-white text-black font-mono text-[11px] p-5 shadow-2xl rounded-sm leading-relaxed"
          >
            {/* Header / Brand */}
            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <img
                src={siteLogo}
                alt="Black Plate"
                className="w-12 h-12 mx-auto mb-1.5 object-contain filter grayscale contrast-200"
              />
              <div className="font-extrabold text-base tracking-widest uppercase">
                BLACK PLATE
              </div>
              <div className="text-[10px] text-gray-700 font-sans mt-0.5 font-medium">
                {receipt.branchName}
              </div>
              <div className="text-[9px] text-gray-600">{receipt.branchAddress}</div>
              <div className="text-[9px] text-gray-600">{receipt.branchPhone}</div>
            </div>

            {/* Receipt Details */}
            <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Order #:</span>
                <span className="font-bold">{receipt.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-bold">{receipt.orderType}</span>
              </div>
              {receipt.tableNumber && (
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span className="font-bold">{receipt.tableNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{receipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{receipt.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{receipt.cashierName}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-gray-400">
              <div className="flex justify-between font-bold pb-1 text-[10px] uppercase border-b border-gray-200">
                <span>Item</span>
                <span className="text-right">Price</span>
              </div>
              <div className="pt-2 space-y-1.5">
                {receipt.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between font-medium">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>৳{item.totalPrice.toLocaleString()}</span>
                    </div>
                    {item.variantName && (
                      <div className="text-[9px] text-gray-600 pl-3">
                        ({item.variantName})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳{receipt.subtotal.toLocaleString()}</span>
              </div>
              {receipt.discount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Discount:</span>
                  <span>- ৳{receipt.discount.toLocaleString()}</span>
                </div>
              )}
              {receipt.tip > 0 && (
                <div className="flex justify-between">
                  <span>Tip:</span>
                  <span>৳{receipt.tip.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm pt-1.5 border-t border-gray-300">
                <span>TOTAL:</span>
                <span>৳{receipt.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Method:</span>
                <span className="font-bold uppercase">{receipt.paymentMethod}</span>
              </div>
            </div>

            {/* Footer barcode and thank you */}
            <div className="text-center pt-3 text-[9px] text-gray-600">
              <div className="font-bold tracking-wider mb-1">
                *** THANK YOU FOR DINING ***
              </div>
              <div>Please keep this receipt for verification</div>
              <div className="mt-2 text-[10px] tracking-widest font-mono text-gray-400">
                || | | ||| || ||| | ||| || |||
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-[#2A2A2A] bg-[#141414] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#282828] text-xs font-semibold text-white"
          >
            Done
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#06990F] hover:bg-emerald-600 text-xs font-bold text-white flex items-center gap-1.5 shadow-md"
          >
            <Printer size={15} /> Print Thermal Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
