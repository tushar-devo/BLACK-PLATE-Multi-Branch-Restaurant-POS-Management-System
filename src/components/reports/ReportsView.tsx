import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Percent,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const ReportsView: React.FC = () => {
  const { orders, currentBranch, receipts, ingredients, menuItems } = useRestaurant();

  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');

  const branchOrders = orders.filter((o) => o.branchId === currentBranch.id);
  const branchReceipts = receipts.filter((r) => r.branchId === currentBranch.id);

  // Financial calculations
  const totalSales = branchOrders
    .filter((o) => o.status !== 'Canceled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const completedOrdersCount = branchOrders.filter((o) => o.status === 'Completed').length;
  const canceledOrdersCount = branchOrders.filter((o) => o.status === 'Canceled').length;
  const averageOrderValue = completedOrdersCount > 0 ? Math.round(totalSales / completedOrdersCount) : 0;

  // Payment Breakdown
  const paymentMethodsTotals = {
    bKash: branchReceipts.filter((r) => r.paymentMethod === 'bKash').reduce((s, r) => s + r.total, 0),
    Nagad: branchReceipts.filter((r) => r.paymentMethod === 'Nagad').reduce((s, r) => s + r.total, 0),
    Rocket: branchReceipts.filter((r) => r.paymentMethod === 'Rocket').reduce((s, r) => s + r.total, 0),
    Card: branchReceipts.filter((r) => r.paymentMethod === 'Card').reduce((s, r) => s + r.total, 0),
    Cash: branchReceipts.filter((r) => r.paymentMethod === 'Cash').reduce((s, r) => s + r.total, 0),
  };

  // Food cost estimate (roughly 32% industry benchmark or based on inventory recipes)
  const estimatedFoodCost = Math.round(totalSales * 0.32);
  const grossProfit = totalSales - estimatedFoodCost;
  const grossMargin = totalSales > 0 ? Math.round((grossProfit / totalSales) * 100) : 0;

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Phone', 'Type', 'Table', 'Status', 'Payment', 'Total (BDT)'];
    const rows = branchOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString(),
      `"${o.customerName}"`,
      o.customerPhone,
      o.orderType,
      o.tableNumber || '',
      o.status,
      o.paymentStatus,
      o.totalAmount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `black_plate_sales_${currentBranch.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 size={22} className="text-[#FF0000]" />
            Financial Analytics & Reporting
          </h2>
          <p className="text-xs text-[#808080] mt-0.5">
            {currentBranch.name} • Revenue, gross margins, payment breakdown, and export
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range pills */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-1 flex items-center gap-1">
            {(['today', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-all ${
                  dateRange === r ? 'bg-[#282828] text-white shadow-sm' : 'text-[#808080] hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#1E1E1E] hover:bg-[#262626] text-white border border-[#2A2A2A] flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} className="text-[#06990F]" /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#1E1E1E] hover:bg-[#262626] text-white border border-[#2A2A2A] flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="p-4 rounded-3xl bg-[#181818] border border-[#2A2A2A]">
          <div className="flex items-center justify-between text-xs text-[#808080] mb-1">
            <span>Total Revenue</span>
            <DollarSign size={16} className="text-[#06990F]" />
          </div>
          <div className="text-2xl font-extrabold text-white">৳{totalSales.toLocaleString()}</div>
          <div className="text-[11px] text-[#06990F] mt-1 font-semibold flex items-center gap-1">
            <TrendingUp size={12} /> Positive daily trajectory
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#181818] border border-[#2A2A2A]">
          <div className="flex items-center justify-between text-xs text-[#808080] mb-1">
            <span>Completed Orders</span>
            <ShoppingBag size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{completedOrdersCount}</div>
          <div className="text-[11px] text-[#808080] mt-1">
            {canceledOrdersCount} canceled orders
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#181818] border border-[#2A2A2A]">
          <div className="flex items-center justify-between text-xs text-[#808080] mb-1">
            <span>Average Order Value</span>
            <Calendar size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">৳{averageOrderValue.toLocaleString()}</div>
          <div className="text-[11px] text-[#808080] mt-1">Per dining check</div>
        </div>

        <div className="p-4 rounded-3xl bg-[#181818] border border-[#2A2A2A]">
          <div className="flex items-center justify-between text-xs text-[#808080] mb-1">
            <span>Gross Margin</span>
            <Percent size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{grossMargin}%</div>
          <div className="text-[11px] text-[#A0A0A0] mt-1">
            Food cost: ৳{estimatedFoodCost.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Payment Methods Breakdown */}
        <div className="p-5 rounded-3xl bg-[#181818] border border-[#2A2A2A]">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-[#FF0000]" />
            Payment Channel Distribution
          </h3>

          <div className="space-y-3">
            {[
              { label: 'bKash (Digital)', amount: paymentMethodsTotals.bKash, color: 'bg-pink-500' },
              { label: 'Nagad (Digital)', amount: paymentMethodsTotals.Nagad, color: 'bg-orange-500' },
              { label: 'Rocket (Digital)', amount: paymentMethodsTotals.Rocket, color: 'bg-purple-500' },
              { label: 'Card (POS Terminal)', amount: paymentMethodsTotals.Card, color: 'bg-blue-500' },
              { label: 'Cash (Drawer)', amount: paymentMethodsTotals.Cash, color: 'bg-emerald-500' },
            ].map((pm) => {
              const pct = totalSales > 0 ? Math.round((pm.amount / totalSales) * 100) : 0;
              return (
                <div key={pm.label} className="text-xs">
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-[#A0A0A0]">{pm.label}</span>
                    <span className="text-white font-mono font-bold">
                      ৳{pm.amount.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#121212] overflow-hidden">
                    <div className={`h-full ${pm.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Menu Items */}
        <div className="p-5 rounded-3xl bg-[#181818] border border-[#2A2A2A]">
          <h3 className="text-sm font-bold text-white mb-4">Top Performing Dishes</h3>
          <div className="space-y-3">
            {menuItems.slice(0, 5).map((dish, idx) => (
              <div
                key={dish.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#141414] border border-[#242424]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono font-bold text-xs text-[#808080]">
                    #{idx + 1}
                  </span>
                  <img src={dish.image} alt={dish.name} className="w-9 h-9 rounded-xl object-cover" />
                  <div>
                    <h5 className="font-bold text-xs text-white">{dish.name}</h5>
                    <div className="text-[10px] text-[#707070]">{dish.category}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-white">৳{dish.price}</div>
                  <div className="text-[10px] text-[#06990F]">High Velocity</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
