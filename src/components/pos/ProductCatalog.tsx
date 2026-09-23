import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MenuItem, MenuItemVariant } from '../../types';

interface ProductCatalogProps {
  onOpenManualModal: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onOpenManualModal }) => {
  const { menuItems, addToCart } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Per-item selected variant state: { [menuItemId]: variantName }
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  // Per-item quantity stepper state: { [menuItemId]: number }
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const categories = [
    'All',
    'Appetizers',
    'Seafood platters',
    'Shrimp',
    'Rice',
    'Burgers',
    'Drinks',
    'Dessert',
  ];

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCategory =
        selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const handleSelectVariant = (itemId: string, variantName: string) => {
    setSelectedVariants((prev) => ({ ...prev, [itemId]: variantName }));
  };

  const handleQtyChange = (itemId: string, delta: number) => {
    setItemQuantities((prev) => {
      const current = prev[itemId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const handleAddToCart = (item: MenuItem) => {
    const chosenVariantName = selectedVariants[item.id] || (item.variants[0] ? item.variants[0].name : undefined);
    const qty = itemQuantities[item.id] || 1;

    addToCart(item, chosenVariantName, [], '', qty);

    // Reset card quantity counter back to 1
    setItemQuantities((prev) => ({ ...prev, [item.id]: 1 }));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Product Lists Header & Search (Matches Screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Product Lists
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E1E1E] text-[#A0A0A0] border border-[#2A2A2A]">
              {filteredItems.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenManualModal}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#1E1E1E] hover:bg-[#252525] text-white border border-[#2A2A2A] transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} className="text-[#FF0000]" />
            Input manually
          </button>

          <div className="relative min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Search for food (⌘ F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-[#707070] focus:outline-none focus:border-[#404040] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#707070] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Pills (Matches Screenshot) */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-white text-black shadow-md shadow-white/10 font-bold'
                  : 'bg-[#1E1E1E] text-[#A0A0A0] hover:text-white hover:bg-[#252525] border border-[#2A2A2A]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid (Matches Screenshot item card design) */}
      {filteredItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#1E1E1E] rounded-3xl border border-[#2A2A2A] text-center">
          <Sparkles size={32} className="text-[#FF0000] mb-2 animate-bounce" />
          <h3 className="text-sm font-semibold text-white mb-1">No dishes found</h3>
          <p className="text-xs text-[#808080] max-w-sm">
            Try searching for another keyword or select a different category tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 overflow-y-auto">
          {filteredItems.map((item) => {
            const activeVariantName =
              selectedVariants[item.id] || (item.variants[0] ? item.variants[0].name : '');
            const currentQty = itemQuantities[item.id] || 1;

            // Calculate display price based on variant modifier
            const activeVariant = item.variants.find((v) => v.name === activeVariantName);
            const variantModifier = activeVariant ? activeVariant.priceModifier : 0;
            const displayUnitPrice = item.price + variantModifier;

            return (
              <div
                key={item.id}
                className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl overflow-hidden hover:border-[#3A3A3A] transition-all flex flex-col justify-between shadow-xl shadow-black/40 group"
              >
                {/* Food Image with Station Badge */}
                <div className="relative h-44 overflow-hidden bg-black/40">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white/90 border border-white/10">
                    {item.station}
                  </div>
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-xs font-bold text-[#FF0000] bg-black/80 px-3 py-1 rounded-full border border-[#FF0000]/40">
                        Out of stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white line-clamp-1 mb-1" title={item.name}>
                      {item.name}
                    </h3>
                    <div className="text-xs font-semibold text-[#A0A0A0] mb-3">
                      ৳{displayUnitPrice.toLocaleString()}
                      <span className="text-[11px] font-normal text-[#707070]">/serving</span>
                    </div>

                    {/* Variant Selectors (Matches Screenshot pills like Original, Lemon zest) */}
                    {item.variants && item.variants.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.variants.map((v) => {
                          const isChosen = activeVariantName === v.name;
                          return (
                            <button
                              key={v.id}
                              onClick={() => handleSelectVariant(item.id, v.name)}
                              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all ${
                                isChosen
                                  ? 'bg-[#2E2E2E] text-white border border-[#444444] font-semibold'
                                  : 'bg-[#181818] text-[#808080] hover:text-white border border-[#262626]'
                              }`}
                            >
                              {v.name}
                              {v.priceModifier > 0 && ` (+৳${v.priceModifier})`}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quantity Stepper & Add to Cart Button (Matches Screenshot) */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#262626] mt-auto">
                    <div className="flex items-center bg-[#151515] border border-[#2A2A2A] rounded-xl px-1.5 py-1">
                      <button
                        onClick={() => handleQtyChange(item.id, -1)}
                        className="p-1 text-[#808080] hover:text-white transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">
                        {currentQty}
                      </span>
                      <button
                        onClick={() => handleQtyChange(item.id, 1)}
                        className="p-1 text-[#808080] hover:text-white transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.available}
                      className={`flex-1 text-xs font-semibold py-2 px-3 rounded-xl transition-all ${
                        item.available
                          ? 'bg-[#181818] hover:bg-[#252525] text-white border border-[#303030] hover:border-[#404040]'
                          : 'bg-[#1A1A1A] text-[#555555] cursor-not-allowed border border-[#222222]'
                      }`}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
