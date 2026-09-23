import React, { useState } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Boxes,
  Percent,
  Grid3X3,
  Users,
  ClipboardList,
  BarChart3,
  ChefHat,
  Bike,
  Award,
  UserCog,
  Building2,
  ScrollText,
  Save,
  Volume2,
  VolumeX,
  ChevronDown,
  Plus,
  LogOut,
  Check,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { hasPermission } from '../../utils/permissions';
import { Role } from '../../types';
import siteLogo from '../../image/Logo.png';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddBranch: () => void;
  onOpenAddUser: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddBranch,
  onOpenAddUser,
}) => {
  const {
    currentUser,
    users,
    switchUser,
    branches,
    currentBranch,
    setBranchId,
    orders,
    ingredients,
    campaigns,
    soundEnabled,
    toggleSound,
  } = useRestaurant();

  const [collapsed, setCollapsed] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Compute live badges
  const activeOrdersCount = orders.filter(
    (o) => o.branchId === currentBranch.id && o.status !== 'Completed' && o.status !== 'Canceled'
  ).length;

  const lowStockCount = ingredients.filter(
    (i) => i.branchId === currentBranch.id && i.currentStock <= i.minimumStockAlert
  ).length;

  const activeCampaignsCount = campaigns.filter((c) => c.active).length;

  // Navigation Items mapped to permissions and roles
  const allNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: 'dashboard.view' as const,
    },
    {
      id: 'pos',
      label: 'Orders (POS)',
      icon: UtensilsCrossed,
      permission: 'pos.access' as const,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
      badgeColor: 'bg-[#FF0000]',
    },
    {
      id: 'tables',
      label: '3D Floor & Tables',
      icon: Grid3X3,
      permission: 'tables.view' as const,
    },
    {
      id: 'kds',
      label: 'Kitchen (KDS)',
      icon: ChefHat,
      permission: 'kds.view' as const,
    },
    {
      id: 'order_lists',
      label: 'Order Lists',
      icon: ClipboardList,
      permission: 'orders.view' as const,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      permission: 'inventory.view' as const,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-[#FF0000]',
    },
    {
      id: 'delivery',
      label: 'Delivery',
      icon: Bike,
      permission: 'delivery.view' as const,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      permission: 'customers.view' as const,
    },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: ScrollText,
      permission: 'reservations.view' as const,
    },
    {
      id: 'discounts',
      label: 'Promotions',
      icon: Percent,
      permission: 'marketing.view' as const,
      badge: activeCampaignsCount > 0 ? activeCampaignsCount : undefined,
      badgeColor: 'bg-[#06990F]',
    },
    {
      id: 'loyalty',
      label: 'Loyalty Program',
      icon: Award,
      permission: 'loyalty.view' as const,
    },
    {
      id: 'staff',
      label: 'Staff Management',
      icon: UserCog,
      permission: 'staff.view' as const,
    },
    {
      id: 'reports',
      label: 'Analysis & Reports',
      icon: BarChart3,
      permission: 'reports.view' as const,
    },
    {
      id: 'branches',
      label: 'Branches',
      icon: Building2,
      permission: 'branches.view' as const,
    },
    {
      id: 'audit',
      label: 'Audit Log',
      icon: ShieldCheck,
      permission: 'audit.view' as const,
    },
    {
      id: 'backup',
      label: 'Backup & Restore',
      icon: Save,
      permission: 'backup.create' as const,
    },
  ];

  // Dynamic filter based on role and individual user permissions
  const visibleNavItems = allNavItems.filter((item) =>
    hasPermission(currentUser, item.permission)
  );

  return (
    <aside
      className={`h-screen bg-[#121212] border-r border-[#2A2A2A] flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Header */}
      <div className="p-4 border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#333333] flex items-center justify-center shrink-0 shadow-lg shadow-black/50 overflow-hidden p-1">
              <img
                src={siteLogo}
                alt="Black Plate Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && (
              <div className="leading-tight truncate">
                <h1 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                  BLACK PLATE
                  <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/40 font-mono">
                    OS
                  </span>
                </h1>
                <p className="text-xs text-[#A0A0A0] truncate">Restaurant Operating System</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-[#1E1E1E] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Current Branch Selector Card (Matches Screenshot style) */}
        {!collapsed && (
          <div className="mt-4 relative">
            <div className="text-[11px] font-medium text-[#A0A0A0] mb-1.5 uppercase tracking-wider">
              Current restaurant
            </div>
            <button
              onClick={() => setShowBranchDropdown(!showBranchDropdown)}
              className="w-full text-left p-2.5 rounded-xl bg-[#1E1E1E] hover:bg-[#252525] border border-[#2A2A2A] transition-all flex items-center justify-between group"
            >
              <div className="truncate pr-2">
                <div className="font-semibold text-xs text-white truncate flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#06990F] animate-pulse"></span>
                  {currentBranch.name}
                </div>
                <div className="text-[11px] text-[#A0A0A0] truncate mt-0.5">
                  {currentBranch.address}
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-[#A0A0A0] group-hover:text-white transition-transform ${
                  showBranchDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Branch dropdown menu */}
            {showBranchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                <div className="max-h-56 overflow-y-auto">
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setBranchId(b.id);
                        setShowBranchDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-[#282828] flex items-center justify-between ${
                        b.id === currentBranch.id ? 'bg-[#252525] text-white font-medium' : 'text-[#A0A0A0]'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium text-white">{b.name}</div>
                        <div className="text-[10px] text-[#808080]">{b.code} • {b.address}</div>
                      </div>
                      {b.id === currentBranch.id && <Check size={14} className="text-[#06990F]" />}
                    </button>
                  ))}
                </div>
                {hasPermission(currentUser, 'branches.create') && (
                  <button
                    onClick={() => {
                      setShowBranchDropdown(false);
                      onOpenAddBranch();
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-[#FF0000] hover:bg-[#252525] border-t border-[#2A2A2A] flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add new branch
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-0' : 'justify-between px-3'
              } py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#1E1E1E] text-white border border-[#3A3A3A] shadow-md shadow-black/40 font-semibold'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={isActive ? 'text-[#FF0000]' : 'text-[#A0A0A0] group-hover:text-white'}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!collapsed && item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                    item.badgeColor || 'bg-[#2A2A2A]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer & User Switcher Widget (Matches Screenshot bottom widget) */}
      <div className="p-3 border-t border-[#2A2A2A] bg-[#141414] relative">
        {/* Audio Alert Toggle */}
        <div className="mb-2 flex items-center justify-between px-1">
          {!collapsed && (
            <span className="text-[11px] text-[#A0A0A0] flex items-center gap-1.5">
              Audio cues
            </span>
          )}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-[#1E1E1E] transition-colors ml-auto"
            title={soundEnabled ? 'Mute sound alerts' : 'Enable sound alerts'}
          >
            {soundEnabled ? (
              <Volume2 size={16} className="text-[#06990F]" />
            ) : (
              <VolumeX size={16} className="text-[#666666]" />
            )}
          </button>
        </div>

        {/* Switch Account Card */}
        <div className="relative">
          {!collapsed && (
            <div className="text-[10px] uppercase tracking-wider text-[#777777] font-semibold mb-1 px-1">
              Switch account
            </div>
          )}

          <button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className={`w-full p-2 rounded-xl bg-[#1E1E1E] hover:bg-[#252525] border border-[#2A2A2A] transition-all flex items-center ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-[#333333] shrink-0"
              />
              {!collapsed && (
                <div className="truncate text-left">
                  <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#A0A0A0] truncate">
                    {currentUser.role}
                  </div>
                </div>
              )}
            </div>
            {!collapsed && (
              <ChevronDown
                size={14}
                className={`text-[#A0A0A0] transition-transform ${
                  showAccountDropdown ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {/* Account Dropdown Modal / Popover */}
          {showAccountDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl shadow-2xl z-50 p-2 min-w-[240px]">
              <div className="text-[11px] font-semibold text-[#A0A0A0] px-2 py-1 uppercase tracking-wider">
                Select Active Profile
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 my-1">
                {users.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowAccountDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                        isSelected ? 'bg-[#292929] text-white' : 'text-[#A0A0A0] hover:bg-[#242424] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover border border-[#3A3A3A] shrink-0"
                        />
                        <div className="truncate">
                          <div className="font-semibold text-white truncate">{u.name}</div>
                          <div className="text-[10px] text-[#888888] truncate">
                            {u.role} • {u.staffId}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#06990F]/20 text-[#06990F] flex items-center justify-center shrink-0">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {hasPermission(currentUser, 'staff.create') && (
                <button
                  onClick={() => {
                    setShowAccountDropdown(false);
                    onOpenAddUser();
                  }}
                  className="w-full mt-1.5 p-2 rounded-lg border border-dashed border-[#3A3A3A] text-xs font-medium text-white hover:bg-[#252525] flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Add account
                </button>
              )}

              <button
                onClick={() => {
                  setShowAccountDropdown(false);
                  // Sign out resets to first staff
                  switchUser(users[0].id);
                }}
                className="w-full mt-1 p-2 rounded-lg text-xs font-semibold text-[#FF0000] hover:bg-[#252525] flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
