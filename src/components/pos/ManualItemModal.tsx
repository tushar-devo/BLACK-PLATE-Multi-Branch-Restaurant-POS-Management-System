import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MenuItem } from '../../types';

interface ManualItemModalProps {
  onClose: () => void;
}

export const ManualItemModal: React.FC<ManualItemModalProps> = ({ onClose }) => {
  const { addToCart, currentBranch } = useRestaurant();

  const [dishName, setDishName] = useState('');
  const [price, setPrice] = useState<number>(500);
  const [category, setCategory] = useState('Seafood platters');
  const [station, setStation] = useState<'Kitchen' | 'Grill' | 'Seafood' | 'Beverage' | 'Dessert'>('Kitchen');
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    // Create a temporary manual MenuItem
    const manualItem: MenuItem = {
      id: `manual_${Date.now()}`,
      menuId: `BP${currentBranch.code}-M${Math.floor(100 + Math.random() * 900)}`,
      branchId: currentBranch.id,
      name: dishName.trim(),
      description: 'Special off-menu custom dish',
      price: price,
      category: category,
      station: station,
      image:
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
      available: true,
      variants: [],
      addons: [],
      recipe: [],
      preparationTimeMinutes: 15,
    };

    addToCart(manualItem, undefined, [], instructions, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-[#FF0000]" />
            <h3 className="font-bold text-white text-sm">Input Dish Manually</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#808080] hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="text-[#808080] block mb-1">Item Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Special Grilled Pomfret"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[#808080] block mb-1">Price (৳) *</label>
              <input
                type="number"
                min="10"
                step="50"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[#808080] block mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[#808080] block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-2.5 py-2 text-white focus:outline-none"
              >
                <option value="Seafood platters">Seafood platters</option>
                <option value="Appetizers">Appetizers</option>
                <option value="Shrimp">Shrimp</option>
                <option value="Fish">Fish</option>
                <option value="Crab">Crab</option>
                <option value="Squid">Squid</option>
                <option value="Rice">Rice</option>
                <option value="Burgers">Burgers</option>
                <option value="Drinks">Drinks</option>
                <option value="Dessert">Dessert</option>
              </select>
            </div>

            <div>
              <label className="text-[#808080] block mb-1">Kitchen Station</label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value as any)}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-2.5 py-2 text-white focus:outline-none"
              >
                <option value="Kitchen">Kitchen</option>
                <option value="Grill">Grill</option>
                <option value="Seafood">Seafood</option>
                <option value="Beverage">Beverage</option>
                <option value="Dessert">Dessert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[#808080] block mb-1">Kitchen Note / Special Request</label>
            <input
              type="text"
              placeholder="e.g. Less spicy, extra lemon on side"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#262626] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-[#222222] text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#FF0000] hover:bg-red-700 font-bold text-white shadow-md"
            >
              Add to Cart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
