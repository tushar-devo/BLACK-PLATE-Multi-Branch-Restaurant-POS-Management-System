import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  Plus,
  ArrowUpDown,
  FileText,
  Trash2,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  Utensils,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Ingredient, WastageLog } from '../../types';

export const InventoryView: React.FC = () => {
  const {
    ingredients,
    currentBranch,
    adjustStock,
    menuItems,
    purchaseOrders,
    createPurchaseOrder,
    receivePurchaseOrder,
    wastageLogs,
    logWastage,
  } = useRestaurant();

  const branchIngredients = ingredients.filter((i) => i.branchId === currentBranch.id);

  const [activeTab, setActiveTab] = useState<'stock' | 'recipes' | 'po' | 'wastage'>('stock');

  // Modals state
  const [adjustModal, setAdjustModal] = useState<Ingredient | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Inventory reconciliation');

  const [showPOModal, setShowPOModal] = useState(false);
  const [poSupplier, setPOSupplier] = useState('Bay Bengal Fisheries');
  const [poItems, setPOItems] = useState<{ ingredientId: string; quantity: number }[]>([
    { ingredientId: branchIngredients[0]?.id || '', quantity: 10 },
  ]);

  const [showWastageModal, setShowWastageModal] = useState(false);
  const [wasteIngId, setWasteIngId] = useState(branchIngredients[0]?.id || '');
  const [wasteQty, setWasteQty] = useState(1);
  const [wasteReason, setWasteReason] = useState<WastageLog['reason']>('Spoilage');

  // Stats calculation
  const totalValue = branchIngredients.reduce((sum, i) => sum + i.currentStock * i.costPerUnit, 0);
  const lowStockCount = branchIngredients.filter((i) => i.currentStock <= i.minimumStockAlert).length;

  const handleAdjustSubmit = () => {
    if (!adjustModal) return;
    adjustStock(adjustModal.id, adjustDelta, adjustReason);
    setAdjustModal(null);
  };

  const handlePOSubmit = () => {
    createPurchaseOrder(poSupplier, poItems);
    setShowPOModal(false);
  };

  const handleWastageSubmit = () => {
    logWastage(wasteIngId, wasteQty, wasteReason);
    setShowWastageModal(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes size={22} className="text-[#FF0000]" />
            Inventory & Purchasing
          </h2>
          <p className="text-xs text-[#808080] mt-0.5">
            {currentBranch.name} • Stock levels, recipes, purchase orders, and wastage
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPOModal(true)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#1E1E1E] hover:bg-[#262626] text-white border border-[#2A2A2A] flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} className="text-[#06990F]" /> Create PO
          </button>
          <button
            onClick={() => setShowWastageModal(true)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#1E1E1E] hover:bg-[#262626] text-white border border-[#2A2A2A] flex items-center gap-1.5 transition-colors"
          >
            <TrendingDown size={14} className="text-[#FF0000]" /> Log Wastage
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-4 rounded-2xl bg-[#181818] border border-[#2A2A2A]">
          <div className="text-xs text-[#808080] font-medium mb-1">Total Stock Value</div>
          <div className="text-xl font-extrabold text-white">৳{totalValue.toLocaleString()}</div>
          <div className="text-[10px] text-[#A0A0A0] mt-0.5">{branchIngredients.length} unique ingredients</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#181818] border border-[#2A2A2A]">
          <div className="text-xs text-[#808080] font-medium mb-1">Low Stock Alerts</div>
          <div className="text-xl font-extrabold text-[#FF0000]">{lowStockCount}</div>
          <div className="text-[10px] text-[#A0A0A0] mt-0.5">Items below minimum reorder threshold</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#181818] border border-[#2A2A2A]">
          <div className="text-xs text-[#808080] font-medium mb-1">Recipe Auto-Deductions</div>
          <div className="text-xl font-extrabold text-[#06990F]">ACTIVE</div>
          <div className="text-[10px] text-[#A0A0A0] mt-0.5">Triggers automatically upon 'Served'</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2A2A2A] pb-2 mb-4">
        {[
          { id: 'stock', label: 'Ingredients Stock' },
          { id: 'recipes', label: 'Menu Recipes & Deductions' },
          { id: 'po', label: 'Purchase Orders & Receiving' },
          { id: 'wastage', label: 'Wastage Tracking' },
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

      {/* Tab 1: Stock table */}
      {activeTab === 'stock' && (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#808080] border-b border-[#262626]">
              <tr>
                <th className="p-3.5">ID / Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Min Alert</th>
                <th className="p-3.5">Unit Cost</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {branchIngredients.map((item) => {
                const isLow = item.currentStock <= item.minimumStockAlert;
                return (
                  <tr key={item.id} className="hover:bg-[#1E1E1E]">
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {item.name}
                        {isLow && (
                          <span className="p-1 rounded bg-[#FF0000]/20 text-[#FF0000]" title="Low Stock">
                            <AlertTriangle size={12} />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#707070] font-mono">{item.inventoryNumber}</div>
                    </td>
                    <td className="p-3.5 text-[#A0A0A0]">{item.category}</td>
                    <td className="p-3.5">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded ${
                          isLow ? 'bg-[#FF0000]/20 text-[#FF0000]' : 'text-white'
                        }`}
                      >
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#808080]">
                      {item.minimumStockAlert} {item.unit}
                    </td>
                    <td className="p-3.5 font-mono text-white">৳{item.costPerUnit}</td>
                    <td className="p-3.5 text-[#A0A0A0]">{item.supplierName}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setAdjustModal(item);
                          setAdjustDelta(0);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-white text-[11px] font-semibold"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Recipes breakdown */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((dish) => (
            <div key={dish.id} className="p-4 rounded-2xl bg-[#181818] border border-[#2A2A2A]">
              <div className="flex items-center gap-3 mb-3">
                <img src={dish.image} alt={dish.name} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold text-sm text-white">{dish.name}</h4>
                  <div className="text-xs text-[#06990F] font-semibold">Selling: ৳{dish.price}</div>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-[#808080] uppercase mb-2">
                Ingredients Deducted on 'Served'
              </div>
              <div className="space-y-1.5">
                {dish.recipe.length === 0 ? (
                  <div className="text-xs text-[#606060] italic">No recipe mapped yet.</div>
                ) : (
                  dish.recipe.map((rec, i) => {
                    const ing = ingredients.find((ing) => ing.id === rec.ingredientId);
                    return (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-[#141414] border border-[#242424] flex items-center justify-between text-xs"
                      >
                        <span className="text-white font-medium">{ing?.name || 'Ingredient'}</span>
                        <span className="font-mono text-[#A0A0A0]">
                          -{rec.quantity} {rec.unit}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Purchase Orders */}
      {activeTab === 'po' && (
        <div className="space-y-3">
          {purchaseOrders.length === 0 ? (
            <div className="p-8 text-center bg-[#181818] rounded-2xl border border-[#2A2A2A] text-xs text-[#808080]">
              No purchase orders yet. Click "Create PO" to restock ingredients.
            </div>
          ) : (
            purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="p-4 rounded-2xl bg-[#181818] border border-[#2A2A2A] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{po.poNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        po.status === 'Received'
                          ? 'bg-[#06990F]/20 text-[#06990F]'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {po.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#808080] mt-1">
                    Supplier: <span className="text-white">{po.supplierName}</span> • Total: ৳{po.totalCost}
                  </div>
                </div>

                {po.status === 'Ordered' && (
                  <button
                    onClick={() => receivePurchaseOrder(po.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#06990F] hover:bg-emerald-600 text-white text-xs font-bold"
                  >
                    Receive Stock (Update Inventory)
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Wastage */}
      {activeTab === 'wastage' && (
        <div className="space-y-3">
          {wastageLogs.length === 0 ? (
            <div className="p-8 text-center bg-[#181818] rounded-2xl border border-[#2A2A2A] text-xs text-[#808080]">
              No wastage logged.
            </div>
          ) : (
            wastageLogs.map((w) => (
              <div
                key={w.id}
                className="p-3.5 rounded-2xl bg-[#181818] border border-[#2A2A2A] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{w.ingredientName}</div>
                  <div className="text-[#808080] text-[11px]">
                    Reason: {w.reason} • Logged by: {w.staffName} ({w.date})
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-[#FF0000]">
                    -{w.quantity} {w.unit}
                  </div>
                  <div className="text-[10px] text-[#808080]">Cost: ৳{w.cost}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-5 max-w-sm w-full">
            <h3 className="font-bold text-sm text-white mb-1">Adjust Stock</h3>
            <p className="text-xs text-[#808080] mb-4">{adjustModal.name}</p>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="text-[#808080] block mb-1">Quantity Change (+ or -)</label>
                <input
                  type="number"
                  step="0.5"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#808080] block mb-1">Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAdjustModal(null)}
                className="px-3 py-1.5 rounded-xl bg-[#222222] text-xs text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustSubmit}
                className="px-4 py-1.5 rounded-xl bg-[#FF0000] text-xs font-bold text-white"
              >
                Confirm Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-5 max-w-md w-full">
            <h3 className="font-bold text-sm text-white mb-3">Create Purchase Order</h3>
            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="text-[#808080] block mb-1">Supplier</label>
                <input
                  type="text"
                  value={poSupplier}
                  onChange={(e) => setPOSupplier(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#808080] block mb-1">Ingredient</label>
                <select
                  value={poItems[0]?.ingredientId}
                  onChange={(e) => setPOItems([{ ...poItems[0], ingredientId: e.target.value }])}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                >
                  {branchIngredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} (Current: {ing.currentStock} {ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#808080] block mb-1">Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={poItems[0]?.quantity || 10}
                  onChange={(e) =>
                    setPOItems([{ ...poItems[0], quantity: Number(e.target.value) || 1 }])
                  }
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPOModal(false)}
                className="px-3 py-1.5 rounded-xl bg-[#222222] text-xs text-white"
              >
                Cancel
              </button>
              <button
                onClick={handlePOSubmit}
                className="px-4 py-1.5 rounded-xl bg-[#06990F] text-xs font-bold text-white"
              >
                Submit PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Wastage Modal */}
      {showWastageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-5 max-w-md w-full">
            <h3 className="font-bold text-sm text-white mb-3">Record Wastage / Spoilage</h3>
            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="text-[#808080] block mb-1">Ingredient</label>
                <select
                  value={wasteIngId}
                  onChange={(e) => setWasteIngId(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                >
                  {branchIngredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} (Stock: {ing.currentStock} {ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#808080] block mb-1">Wasted Quantity</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={wasteQty}
                  onChange={(e) => setWasteQty(Number(e.target.value) || 1)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#808080] block mb-1">Reason</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value as any)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                >
                  <option value="Spoilage">Spoilage</option>
                  <option value="Damage">Damage</option>
                  <option value="Expired stock">Expired stock</option>
                  <option value="Preparation waste">Preparation waste</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowWastageModal(false)}
                className="px-3 py-1.5 rounded-xl bg-[#222222] text-xs text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleWastageSubmit}
                className="px-4 py-1.5 rounded-xl bg-[#FF0000] text-xs font-bold text-white"
              >
                Deduct & Log Wastage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
