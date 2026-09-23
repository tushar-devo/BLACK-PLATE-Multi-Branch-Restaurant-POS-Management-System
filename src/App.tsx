import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Sidebar } from './components/sidebar/Sidebar';
import { OrderQueuesBar } from './components/pos/OrderQueuesBar';
import { ProductCatalog } from './components/pos/ProductCatalog';
import { CartDrawer } from './components/pos/CartDrawer';
import { Restaurant3DFloor } from './components/tables/Restaurant3DFloor';
import { KDSBoard } from './components/kds/KDSBoard';
import { OrderListView } from './components/orders/OrderListView';
import { InventoryView } from './components/inventory/InventoryView';
import { DeliveryManagement } from './components/delivery/DeliveryManagement';
import { CRMView } from './components/crm/CRMView';
import { StaffView } from './components/staff/StaffView';
import { ReportsView } from './components/reports/ReportsView';
import { PaymentModal } from './components/payments/PaymentModal';
import { ReceiptModal } from './components/payments/ReceiptModal';
import { CustomerQRSimulator, TableQRCodeModal } from './components/qr/CustomerQRSimulator';
import { AddStaffModal } from './components/staff/AddStaffModal';
import { ManualItemModal } from './components/pos/ManualItemModal';
import { Order, Table } from './types';
import {
  Building,
  Settings,
  Sparkles,
  ShieldCheck,
  Save,
  Download,
  Upload,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Grid3X3,
  Clock,
  Plus,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeReceiptModal,
    setActiveReceiptModal,
    receipts,
    orders,
    currentBranch,
    branches,
    tables,
    setCartTableNumber,
    auditLogs,
    exportSystemBackup,
    restoreSystemBackup,
    addBranch,
  } = useRestaurant();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('pos');

  // Modal states
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [showQRSimulator, setShowQRSimulator] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showManualItemModal, setShowManualItemModal] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);

  // New branch state
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');

  // Quick payment handler from CartDrawer
  const handleProceedPaymentFromCart = () => {
    const existingOrder = orders.find(
      (o) =>
        o.branchId === currentBranch.id &&
        o.paymentStatus === 'Unpaid' &&
        o.status !== 'Canceled'
    );
    if (existingOrder) {
      setPaymentModalOrder(existingOrder);
    } else {
      alert('Please click "Send to Kitchen" first to submit the order, then proceed with payment.');
    }
  };

  const handleTableStartOrder = (table: Table) => {
    setCartTableNumber(table.tableNumber);
    setActiveTab('pos');
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || !newBranchCode) return;
    addBranch({
      name: newBranchName.trim(),
      code: newBranchCode.trim().toUpperCase(),
      address: newBranchAddress.trim() || 'Dhaka, Bangladesh',
      phone: newBranchPhone.trim() || '+880 1700-000000',
      managerName: 'Branch Manager',
      active: true,
    });
    setShowAddBranchModal(false);
    setNewBranchName('');
    setNewBranchCode('');
  };

  const handleExportBackup = () => {
    const json = exportSystemBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `black_plate_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = restoreSystemBackup(content);
      alert(res.message);
    };
    reader.readAsText(file);
  };

  // Branch statistics for dashboard
  const branchOrders = orders.filter((o) => o.branchId === currentBranch.id);
  const branchSales = branchOrders
    .filter((o) => o.status !== 'Canceled')
    .reduce((s, o) => s + o.totalAmount, 0);
  const activeTablesCount = tables.filter(
    (t) => t.branchId === currentBranch.id && t.status !== 'Available'
  ).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121212] text-white font-sans antialiased select-none">
      {/* 1. Left Sidebar Navigation (Collapsible, 13 roles, branch switcher) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddBranch={() => setShowAddBranchModal(true)}
        onOpenAddUser={() => setShowAddStaffModal(true)}
      />

      {/* 2. Main Content View Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 lg:p-6 bg-[#121212]">
        {/* VIEW: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="max-w-[1600px] mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  Executive Dashboard
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1E1E1E] text-[#FF0000] border border-[#2A2A2A] font-mono">
                    {currentBranch.name}
                  </span>
                </h1>
                <p className="text-xs text-[#808080] mt-1">
                  Real-time operational metrics, multi-branch summary, and rapid actions
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('pos')}
                  className="px-4 py-2 rounded-xl bg-[#FF0000] hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-lg shadow-red-950/40"
                >
                  Open POS Register
                </button>
                <button
                  onClick={() => setActiveTab('tables')}
                  className="px-4 py-2 rounded-xl bg-[#1E1E1E] hover:bg-[#282828] text-white text-xs font-semibold border border-[#2A2A2A]"
                >
                  3D Floor Plan
                </button>
              </div>
            </div>

            {/* Quick KPI Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[#181818] border border-[#2A2A2A]">
                <div className="flex items-center justify-between text-xs text-[#808080] mb-2">
                  <span>Branch Daily Sales</span>
                  <DollarSign size={16} className="text-[#06990F]" />
                </div>
                <div className="text-2xl font-extrabold text-white">৳{branchSales.toLocaleString()}</div>
                <div className="text-[11px] text-[#06990F] mt-1 font-semibold flex items-center gap-1">
                  <TrendingUp size={12} /> Today's revenue
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#181818] border border-[#2A2A2A]">
                <div className="flex items-center justify-between text-xs text-[#808080] mb-2">
                  <span>Total Branch Orders</span>
                  <ShoppingBag size={16} className="text-blue-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{branchOrders.length}</div>
                <div className="text-[11px] text-[#808080] mt-1">All dine-in, takeaway & delivery</div>
              </div>

              <div className="p-5 rounded-3xl bg-[#181818] border border-[#2A2A2A]">
                <div className="flex items-center justify-between text-xs text-[#808080] mb-2">
                  <span>Occupied Tables</span>
                  <Grid3X3 size={16} className="text-[#FFFF00]" />
                </div>
                <div className="text-2xl font-extrabold text-[#FFFF00]">{activeTablesCount}</div>
                <div className="text-[11px] text-[#808080] mt-1">
                  Active seating out of {tables.filter((t) => t.branchId === currentBranch.id).length} tables
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#181818] border border-[#2A2A2A]">
                <div className="flex items-center justify-between text-xs text-[#808080] mb-2">
                  <span>System Health</span>
                  <CheckCircle2 size={16} className="text-[#06990F]" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-400">100% ONLINE</div>
                <div className="text-[11px] text-[#808080] mt-1">Synthesized audio & POS synced</div>
              </div>
            </div>

            {/* Quick Order Queues preview */}
            <OrderQueuesBar
              onViewAll={() => setActiveTab('order_lists')}
              onSelectOrder={(order) => {
                if (order.paymentStatus === 'Unpaid') {
                  setPaymentModalOrder(order);
                } else {
                  const r = receipts.find((rec) => rec.orderId === order.id);
                  if (r) setActiveReceiptModal(r);
                  else setActiveTab('order_lists');
                }
              }}
            />
          </div>
        )}

        {/* VIEW: POS Interface (Exact match to screenshot!) */}
        {activeTab === 'pos' && (
          <div className="flex-1 flex flex-col min-w-0 max-w-[1600px] mx-auto w-full">
            {/* Top Carousel: Order Queues */}
            <OrderQueuesBar
              onViewAll={() => setActiveTab('order_lists')}
              onSelectOrder={(order) => {
                if (order.paymentStatus === 'Unpaid') {
                  setPaymentModalOrder(order);
                } else {
                  const r = receipts.find((rec) => rec.orderId === order.id);
                  if (r) setActiveReceiptModal(r);
                  else setActiveTab('order_lists');
                }
              }}
            />

            {/* Split Section: Product Catalog (Left) + Cart Details (Right) */}
            <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
              <ProductCatalog onOpenManualModal={() => setShowManualItemModal(true)} />
              <CartDrawer
                onOpenPaymentModal={handleProceedPaymentFromCart}
                onOpenQROrderModal={() => setShowQRSimulator(true)}
              />
            </div>
          </div>
        )}

        {/* VIEW: 3D Restaurant Floor & Table Management */}
        {activeTab === 'tables' && (
          <Restaurant3DFloor
            onTableAction={handleTableStartOrder}
            onOpenTableQR={(t) => setSelectedTableForQR(t)}
          />
        )}

        {/* VIEW: Kitchen Display System (KDS) */}
        {activeTab === 'kds' && <KDSBoard />}

        {/* VIEW: Order Lists */}
        {activeTab === 'order_lists' && (
          <OrderListView
            onPayOrder={(order) => setPaymentModalOrder(order)}
            onViewReceipt={(order) => {
              const r = receipts.find((rec) => rec.orderId === order.id);
              if (r) setActiveReceiptModal(r);
            }}
          />
        )}

        {/* VIEW: Inventory */}
        {activeTab === 'inventory' && <InventoryView />}

        {/* VIEW: Delivery */}
        {activeTab === 'delivery' && <DeliveryManagement />}

        {/* VIEW: Customers CRM */}
        {activeTab === 'customers' && <CRMView initialTab="customers" />}

        {/* VIEW: Reservations */}
        {activeTab === 'reservations' && <CRMView initialTab="reservations" />}

        {/* VIEW: Loyalty & Fixed Coupons */}
        {(activeTab === 'loyalty' || activeTab === 'discounts') && (
          <CRMView initialTab="loyalty" />
        )}

        {/* VIEW: Staff Directory & RBAC */}
        {activeTab === 'staff' && (
          <StaffView onOpenAddStaff={() => setShowAddStaffModal(true)} />
        )}

        {/* VIEW: Reports & Analytics */}
        {activeTab === 'reports' && <ReportsView />}

        {/* VIEW: Multi-Branch Outlets */}
        {activeTab === 'branches' && (
          <div className="max-w-4xl w-full mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Building size={22} className="text-[#FF0000]" />
                  Multi-Branch Management
                </h2>
                <p className="text-xs text-[#808080] mt-0.5">
                  Black Plate chain outlets, managers, and branch identifier codes
                </p>
              </div>

              <button
                onClick={() => setShowAddBranchModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#FF0000] hover:bg-red-700 text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Plus size={14} /> Add New Branch
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className={`p-5 rounded-3xl border ${
                    b.id === currentBranch.id
                      ? 'bg-[#1E1E1E] border-[#FF0000]/60 ring-1 ring-[#FF0000]/20'
                      : 'bg-[#161616] border-[#2A2A2A]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white text-base">{b.name}</h4>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-black/60 text-amber-300 font-bold border border-amber-300/30">
                      CODE: {b.code}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-[#808080] mt-3">
                    <div>Address: <span className="text-white/80">{b.address}</span></div>
                    <div>Phone: <span className="text-white/80">{b.phone}</span></div>
                    <div>Manager: <span className="text-white/80">{b.managerName}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="max-w-4xl w-full mx-auto space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck size={22} className="text-[#06990F]" />
              System Audit Logs
            </h2>
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141414] text-[#808080] border-b border-[#262626]">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Target</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242424]">
                  {auditLogs.slice(0, 30).map((log) => (
                    <tr key={log.id} className="hover:bg-[#1C1C1C]">
                      <td className="p-3.5 font-mono text-[#808080]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3.5 font-bold text-white">{log.userName}</td>
                      <td className="p-3.5">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#242424] text-white">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#A0A0A0]">{log.target}</td>
                      <td className="p-3.5 text-xs text-white/90">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="max-w-2xl w-full mx-auto space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Save size={22} className="text-[#FF0000]" />
                System Backup & Disaster Recovery
              </h2>
              <p className="text-xs text-[#808080] mt-0.5">
                Export and restore the complete multi-branch operational database
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#181818] border border-[#2A2A2A] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Export Full JSON Database</h4>
                  <p className="text-xs text-[#808080]">
                    Download orders, inventory, customers, branches, and recipes into a single portable backup file.
                  </p>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 rounded-xl bg-[#06990F] hover:bg-emerald-600 text-xs font-bold text-white flex items-center gap-1.5 shrink-0"
                >
                  <Download size={14} /> Download Backup
                </button>
              </div>

              <div className="pt-4 border-t border-[#262626] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Restore Database</h4>
                  <p className="text-xs text-[#808080]">
                    Import a previously exported JSON backup file.
                  </p>
                </div>
                <label className="px-4 py-2 rounded-xl bg-[#242424] hover:bg-[#2D2D2D] text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Upload size={14} /> Upload JSON
                  <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Global Modals */}
      {/* Cashier Payment Modal */}
      {paymentModalOrder && (
        <PaymentModal
          order={paymentModalOrder}
          onClose={() => setPaymentModalOrder(null)}
        />
      )}

      {/* Thermal Receipt Modal */}
      {activeReceiptModal && (
        <ReceiptModal
          receipt={activeReceiptModal}
          onClose={() => setActiveReceiptModal(null)}
        />
      )}

      {/* Customer QR Self-Ordering Simulator */}
      {showQRSimulator && (
        <CustomerQRSimulator onClose={() => setShowQRSimulator(false)} />
      )}

      {/* Table QR Sticker Modal */}
      {selectedTableForQR && (
        <TableQRCodeModal
          table={selectedTableForQR}
          onClose={() => setSelectedTableForQR(null)}
        />
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <AddStaffModal onClose={() => setShowAddStaffModal(false)} />
      )}

      {/* Input Manually Custom Dish Modal */}
      {showManualItemModal && (
        <ManualItemModal onClose={() => setShowManualItemModal(false)} />
      )}

      {/* Add New Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-5 max-w-sm w-full text-xs">
            <h3 className="font-bold text-sm text-white mb-3">Add New Restaurant Branch</h3>
            <form onSubmit={handleCreateBranch} className="space-y-3">
              <div>
                <label className="text-[#808080] block mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Black Plate - Uttara"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#808080] block mb-1">Branch Code (2-3 letters) *</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="e.g. UT"
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-[#808080] block mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Sector 3, Uttara, Dhaka"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#808080] block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+880 17..."
                  value={newBranchPhone}
                  onChange={(e) => setNewBranchPhone(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#222222] text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#FF0000] font-bold text-white"
                >
                  Create Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <RestaurantProvider>
      <AppContent />
    </RestaurantProvider>
  );
}

export default App;
