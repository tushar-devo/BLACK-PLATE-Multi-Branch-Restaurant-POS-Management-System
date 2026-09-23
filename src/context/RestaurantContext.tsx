import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Branch,
  User,
  MenuItem,
  Table,
  Ingredient,
  Order,
  Customer,
  Reservation,
  LoyaltyCampaign,
  StaffShift,
  Receipt,
  DeliveryRecord,
  AuditLog,
  PurchaseOrder,
  WastageLog,
  OrderStatus,
  OrderType,
  PaymentMethod,
  CartItem,
  TableStatus,
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_TABLES,
  INITIAL_INGREDIENTS,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_RESERVATIONS,
  INITIAL_CAMPAIGNS,
  INITIAL_SHIFTS,
} from '../data/initialData';
import { hasPermission } from '../utils/permissions';
import { sound } from '../utils/audio';

interface RestaurantContextType {
  // Branches
  branches: Branch[];
  currentBranchId: string;
  currentBranch: Branch;
  setBranchId: (branchId: string) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;

  // Authentication & Users
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  createUser: (userData: Omit<User, 'id' | 'staffId'>) => boolean;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => boolean;
  resetPin: (userId: string, newPin: string) => void;

  // POS & Cart
  cart: CartItem[];
  cartOrderType: OrderType;
  setCartOrderType: (type: OrderType) => void;
  cartCustomerName: string;
  setCartCustomerName: (name: string) => void;
  cartCustomerPhone: string;
  setCartCustomerPhone: (phone: string) => void;
  cartTableNumber: string;
  setCartTableNumber: (table: string) => void;
  cartDeliveryAddress: string;
  setCartDeliveryAddress: (address: string) => void;
  cartDiscountAmount: number;
  cartDiscountCode?: string;
  cartTipAmount: number;
  setCartTipAmount: (amount: number) => void;
  addToCart: (item: MenuItem, variantName?: string, addons?: string[], specialInstructions?: string, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  applyDiscountCoupon: (code: string) => { success: boolean; message: string };
  removeDiscountCoupon: () => void;
  submitCartOrder: () => { success: boolean; orderId?: string; message?: string };

  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => { success: boolean; message?: string };
  requestOrderCancellation: (orderId: string, reason: string) => { success: boolean; message?: string };
  approveOrderCancellation: (orderId: string) => { success: boolean; message?: string };
  rejectOrderCancellation: (orderId: string) => void;
  activeOrderQueues: Order[];

  // Payments & Receipts (Cashier Only)
  receipts: Receipt[];
  activeReceiptModal: Receipt | null;
  setActiveReceiptModal: (receipt: Receipt | null) => void;
  processPayment: (orderId: string, paymentMethod: PaymentMethod, tipAmount?: number) => { success: boolean; receipt?: Receipt; message?: string };
  refundPayment: (orderId: string, reason: string) => { success: boolean; message?: string };

  // Tables & 3D Interactive Floor
  tables: Table[];
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  addTable: (table: Omit<Table, 'id'>) => void;

  // Menu
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'menuId'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  toggleMenuItemAvailability: (menuItemId: string) => void;
  deleteMenuItem: (menuItemId: string) => void;

  // Inventory & Purchasing & Wastage
  ingredients: Ingredient[];
  purchaseOrders: PurchaseOrder[];
  wastageLogs: WastageLog[];
  adjustStock: (ingredientId: string, deltaQty: number, reason: string) => void;
  createPurchaseOrder: (supplierName: string, items: { ingredientId: string; quantity: number }[]) => void;
  receivePurchaseOrder: (poId: string) => void;
  logWastage: (ingredientId: string, quantity: number, reason: WastageLog['reason']) => void;

  // Deliveries
  deliveries: DeliveryRecord[];
  assignDeliveryStaff: (orderId: string, staffId: string) => { success: boolean; message?: string };
  updateDeliveryStatus: (deliveryId: string, newStatus: DeliveryRecord['status']) => void;

  // Customers & Loyalty & Campaigns
  customers: Customer[];
  campaigns: LoyaltyCampaign[];
  addCustomer: (customer: Omit<Customer, 'id' | 'customerId' | 'loyaltyPoints' | 'loyaltyTier' | 'totalOrdersCount' | 'totalSpent' | 'createdAt'>) => void;

  // Reservations
  reservations: Reservation[];
  addReservation: (res: Omit<Reservation, 'id' | 'reservationNumber' | 'createdAt'>) => void;
  updateReservationStatus: (reservationId: string, status: Reservation['status']) => void;

  // Staff Shifts
  shifts: StaffShift[];

  // Audit Logs
  auditLogs: AuditLog[];
  logAudit: (action: string, target: string, details: string) => void;

  // Sound toggle
  soundEnabled: boolean;
  toggleSound: () => void;

  // System Backup & Restore
  exportSystemBackup: () => string;
  restoreSystemBackup: (jsonContent: string) => { success: boolean; message: string };
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const STORAGE_KEY = 'black_plate_system_state_v1';

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state or localStorage
  const loadSaved = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [branches, setBranches] = useState<Branch[]>(() => loadSaved('branches', INITIAL_BRANCHES));
  const [currentBranchId, setCurrentBranchId] = useState<string>(() => loadSaved('currentBranchId', 'branch-kg'));
  const [users, setUsers] = useState<User[]>(() => loadSaved('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = loadSaved<User | null>('currentUser', null);
    return savedUser || INITIAL_USERS[0]; // Default Antonio Erlangga (Owner)
  });

  const [tables, setTables] = useState<Table[]>(() => loadSaved('tables', INITIAL_TABLES));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => loadSaved('menuItems', INITIAL_MENU_ITEMS));
  const [orders, setOrders] = useState<Order[]>(() => loadSaved('orders', INITIAL_ORDERS));
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => loadSaved('ingredients', INITIAL_INGREDIENTS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadSaved('customers', INITIAL_CUSTOMERS));
  const [reservations, setReservations] = useState<Reservation[]>(() => loadSaved('reservations', INITIAL_RESERVATIONS));
  const [campaigns, setCampaigns] = useState<LoyaltyCampaign[]>(() => loadSaved('campaigns', INITIAL_CAMPAIGNS));
  const [receipts, setReceipts] = useState<Receipt[]>(() => loadSaved('receipts', []));
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(() => loadSaved('deliveries', []));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => loadSaved('purchaseOrders', []));
  const [wastageLogs, setWastageLogs] = useState<WastageLog[]>(() => loadSaved('wastageLogs', []));
  const [shifts, setShifts] = useState<StaffShift[]>(() => loadSaved('shifts', INITIAL_SHIFTS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadSaved('auditLogs', []));

  // Cart State (2D Operations POS)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOrderType, setCartOrderType] = useState<OrderType>('Dine in');
  const [cartCustomerName, setCartCustomerName] = useState<string>('');
  const [cartCustomerPhone, setCartCustomerPhone] = useState<string>('');
  const [cartTableNumber, setCartTableNumber] = useState<string>('Table 1A');
  const [cartDeliveryAddress, setCartDeliveryAddress] = useState<string>('');
  const [cartDiscountAmount, setCartDiscountAmount] = useState<number>(0);
  const [cartDiscountCode, setCartDiscountCode] = useState<string | undefined>(undefined);
  const [cartTipAmount, setCartTipAmount] = useState<number>(0);

  // Active modals and UI helpers
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [activeReceiptModal, setActiveReceiptModal] = useState<Receipt | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_branches`, JSON.stringify(branches));
      localStorage.setItem(`${STORAGE_KEY}_currentBranchId`, JSON.stringify(currentBranchId));
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
      localStorage.setItem(`${STORAGE_KEY}_tables`, JSON.stringify(tables));
      localStorage.setItem(`${STORAGE_KEY}_menuItems`, JSON.stringify(menuItems));
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
      localStorage.setItem(`${STORAGE_KEY}_ingredients`, JSON.stringify(ingredients));
      localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
      localStorage.setItem(`${STORAGE_KEY}_reservations`, JSON.stringify(reservations));
      localStorage.setItem(`${STORAGE_KEY}_campaigns`, JSON.stringify(campaigns));
      localStorage.setItem(`${STORAGE_KEY}_receipts`, JSON.stringify(receipts));
      localStorage.setItem(`${STORAGE_KEY}_deliveries`, JSON.stringify(deliveries));
      localStorage.setItem(`${STORAGE_KEY}_purchaseOrders`, JSON.stringify(purchaseOrders));
      localStorage.setItem(`${STORAGE_KEY}_wastageLogs`, JSON.stringify(wastageLogs));
      localStorage.setItem(`${STORAGE_KEY}_shifts`, JSON.stringify(shifts));
      localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
    } catch {
      // LocalStorage quota fallback
    }
  }, [
    branches,
    currentBranchId,
    users,
    currentUser,
    tables,
    menuItems,
    orders,
    ingredients,
    customers,
    reservations,
    campaigns,
    receipts,
    deliveries,
    purchaseOrders,
    wastageLogs,
    shifts,
    auditLogs,
  ]);

  const currentBranch = useMemo(() => {
    return branches.find((b) => b.id === currentBranchId) || branches[0];
  }, [branches, currentBranchId]);

  // Log Audit helper
  const logAudit = (action: string, target: string, details: string) => {
    const entry: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      branchCode: currentBranch.code,
      action,
      target,
      details,
    };
    setAuditLogs((prev) => [entry, ...prev.slice(0, 499)]); // keep recent 500
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  // Branch switcher
  const setBranchId = (branchId: string) => {
    const targetBranch = branches.find((b) => b.id === branchId);
    if (!targetBranch) return;

    // Check branch access permissions
    if (currentUser.role !== 'Owner' && currentUser.role !== 'Super Admin' && currentUser.branchId !== branchId) {
      alert(`Access Denied: Your account is restricted to your assigned branch.`);
      return;
    }

    setCurrentBranchId(branchId);
    logAudit('BRANCH_SWITCH', `Branch ${targetBranch.code}`, `Switched active branch to ${targetBranch.name}`);
  };

  const addBranch = (branchData: Omit<Branch, 'id'>) => {
    if (!hasPermission(currentUser, 'branches.create')) {
      alert('Permission Denied: Only Owner or Super Admin can create branches.');
      return;
    }
    const newBranch: Branch = {
      ...branchData,
      id: `branch-${branchData.code.toLowerCase()}`,
    };
    setBranches((prev) => [...prev, newBranch]);
    logAudit('BRANCH_CREATE', `Branch ${newBranch.code}`, `Created new branch: ${newBranch.name}`);
  };

  // User Management
  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      // If user has specific branch and isn't owner/admin, sync branch
      if (target.branchId !== 'all' && target.branchId !== currentBranchId) {
        setCurrentBranchId(target.branchId);
      }
      logAudit('LOGIN_SWITCH', `User ${target.staffId}`, `Switched active session to ${target.name} (${target.role})`);
    }
  };

  const createUser = (userData: Omit<User, 'id' | 'staffId'>) => {
    if (!hasPermission(currentUser, 'staff.create')) {
      alert('Permission Denied: You cannot create staff accounts.');
      return false;
    }

    const branch = branches.find((b) => b.id === (userData.branchId === 'all' ? currentBranchId : userData.branchId)) || currentBranch;
    const branchCode = branch.code;
    const seq = users.length + 1;
    const staffId = `BP${branchCode}-ST${seq < 10 ? '0' + seq : seq}`;

    const newUser: User = {
      ...userData,
      id: 'user-' + Date.now(),
      staffId,
    };

    setUsers((prev) => [...prev, newUser]);
    logAudit('USER_CREATE', staffId, `Created staff account: ${newUser.name} as ${newUser.role}`);
    return true;
  };

  const updateUser = (updated: User) => {
    if (!hasPermission(currentUser, 'staff.edit')) {
      alert('Permission Denied: You cannot edit staff accounts.');
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
    logAudit('USER_UPDATE', updated.staffId, `Updated staff account for ${updated.name}`);
  };

  // Rule 26: "When an employee leaves: Delete their account permanently."
  const deleteUser = (userId: string) => {
    if (!hasPermission(currentUser, 'staff.delete')) {
      alert('Permission Denied: You cannot delete staff accounts.');
      return false;
    }
    const target = users.find((u) => u.id === userId);
    if (!target) return false;

    if (target.role === 'Owner') {
      alert('Action Denied: Cannot delete the primary Owner account.');
      return false;
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    logAudit('USER_DELETE_PERMANENT', target.staffId, `Permanently deleted employee account: ${target.name}`);
    return true;
  };

  const resetPin = (userId: string, newPin: string) => {
    if (!hasPermission(currentUser, 'staff.edit') && currentUser.id !== userId) {
      alert('Permission Denied: Cannot reset PIN.');
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, pin: newPin } : u)));
    logAudit('USER_PIN_RESET', userId, `PIN reset for user ID ${userId}`);
  };

  // POS Cart Management
  const addToCart = (
    item: MenuItem,
    variantName?: string,
    addonNames: string[] = [],
    specialInstructions?: string,
    quantity: number = 1
  ) => {
    // Find variant and addons objects
    const variant = item.variants.find((v) => v.name === variantName) || item.variants[0];
    const selectedAddons = item.addons.filter((a) => addonNames.includes(a.name));

    const addonPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = item.price + (variant ? variant.priceModifier : 0) + addonPrice;

    const lineId = `${item.id}-${variant?.id || 'base'}-${addonNames.sort().join('-')}-${specialInstructions || ''}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.id === lineId);
      if (existingIndex > -1) {
        const next = [...prev];
        const existing = next[existingIndex];
        const newQty = existing.quantity + quantity;
        next[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPrice: newQty * existing.unitPrice,
        };
        return next;
      } else {
        const newCartItem: CartItem = {
          id: lineId,
          menuItem: item,
          selectedVariant: variant,
          selectedAddons,
          specialInstructions,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
        };
        return [...prev, newCartItem];
      }
    });
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.id === cartItemId) {
            const nextQty = ci.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...ci,
              quantity: nextQty,
              totalPrice: nextQty * ci.unitPrice,
            };
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setCartDiscountAmount(0);
    setCartDiscountCode(undefined);
    setCartTipAmount(0);
  };

  // Fixed discount application (Rule 31: Only fixed-amount discounts: ৳100, ৳500, ৳1500)
  const applyDiscountCoupon = (code: string) => {
    const campaign = campaigns.find(
      (c) => c.active && c.couponCode.toUpperCase() === code.trim().toUpperCase()
    );
    if (!campaign) {
      return { success: false, message: 'Invalid or expired promo code.' };
    }
    const currentSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    if (currentSubtotal < campaign.minimumOrderAmount) {
      return {
        success: false,
        message: `Order must be at least ৳${campaign.minimumOrderAmount} to apply this discount.`,
      };
    }

    setCartDiscountAmount(campaign.fixedDiscountAmount);
    setCartDiscountCode(campaign.couponCode);
    return {
      success: true,
      message: `Promo code ${campaign.couponCode} applied (-৳${campaign.fixedDiscountAmount})`,
    };
  };

  const removeDiscountCoupon = () => {
    setCartDiscountAmount(0);
    setCartDiscountCode(undefined);
  };

  // Order Submission
  // Rule 17: Format: BP{BranchCode}-{SequentialNumber} (e.g. BPKG-05)
  // Rule 23: Name + Phone required!
  const submitCartOrder = () => {
    if (cart.length === 0) {
      return { success: false, message: 'Cart is empty. Add menu items first.' };
    }

    const trimmedName = cartCustomerName.trim();
    const trimmedPhone = cartCustomerPhone.trim();

    if (!trimmedName) {
      return { success: false, message: 'Customer name is required for all orders.' };
    }
    if (!trimmedPhone) {
      return { success: false, message: 'Customer phone number is required.' };
    }

    // Generate branch-specific sequential order number
    const branchOrders = orders.filter((o) => o.branchId === currentBranchId);
    const seq = branchOrders.length + 1;
    const orderNumber = `BP${currentBranch.code}-${seq < 10 ? '0' + seq : seq}`;

    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = Math.max(0, subtotal - cartDiscountAmount + cartTipAmount);

    const orderItems = cart.map((ci) => ({
      id: 'oi-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      menuItemId: ci.menuItem.id,
      name: ci.menuItem.name,
      variantName: ci.selectedVariant?.name,
      addons: ci.selectedAddons.map((a) => a.name),
      specialInstructions: ci.specialInstructions,
      quantity: ci.quantity,
      unitPrice: ci.unitPrice,
      totalPrice: ci.totalPrice,
    }));

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber,
      branchId: currentBranchId,
      orderType: cartOrderType,
      tableNumber: cartOrderType === 'Dine in' ? cartTableNumber : undefined,
      customerName: trimmedName,
      customerPhone: trimmedPhone,
      deliveryAddress: cartOrderType === 'Delivery' ? cartDeliveryAddress || 'Standard Address' : undefined,
      items: orderItems,
      subtotal,
      discountAmount: cartDiscountAmount,
      discountCode: cartDiscountCode,
      tipAmount: cartTipAmount,
      totalAmount,
      status: 'New',
      paymentStatus: 'Unpaid',
      orderTakerName: currentUser.name,
      orderTakerRole: currentUser.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inventoryDeducted: false,
      priority: 'Normal',
    };

    setOrders((prev) => [newOrder, ...prev]);

    // If dine in, update table status to Occupied
    if (cartOrderType === 'Dine in' && cartTableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.tableNumber === cartTableNumber && t.branchId === currentBranchId
            ? { ...t, status: 'Occupied', currentOrderId: newOrder.id }
            : t
        )
      );
    }

    // If customer already exists, link or create
    const existingCust = customers.find((c) => c.phone === trimmedPhone && c.branchId === currentBranchId);
    if (!existingCust) {
      const custSeq = customers.filter((c) => c.branchId === currentBranchId).length + 1;
      const customerId = `${currentBranch.code}-C${custSeq < 10 ? '0' + custSeq : custSeq}`;
      const newCustomer: Customer = {
        id: 'cust-' + Date.now(),
        customerId,
        branchId: currentBranchId,
        name: trimmedName,
        phone: trimmedPhone,
        loyaltyPoints: 0,
        loyaltyTier: 'Bronze',
        totalOrdersCount: 1,
        totalSpent: 0, // updated when paid
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCustomers((prev) => [...prev, newCustomer]);
    }

    // Play pleasant new order chime
    sound.playNewOrder();
    logAudit('ORDER_CREATE', orderNumber, `Created ${cartOrderType} order by ${currentUser.name} (৳${totalAmount})`);

    // Reset cart
    clearCart();
    return { success: true, orderId: newOrder.id, message: `Order #${orderNumber} created successfully!` };
  };

  // Rule 13: "Inventory deduction happens when order becomes Served."
  const deductOrderInventory = (order: Order) => {
    if (order.inventoryDeducted) return;

    // Deduct each recipe ingredient
    setIngredients((prev) => {
      const updated = [...prev];
      order.items.forEach((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
        if (menuItem && menuItem.recipe) {
          menuItem.recipe.forEach((rec) => {
            const ingIdx = updated.findIndex((i) => i.id === rec.ingredientId);
            if (ingIdx > -1) {
              const deduction = rec.quantity * item.quantity;
              const current = updated[ingIdx].currentStock;
              updated[ingIdx] = {
                ...updated[ingIdx],
                currentStock: Math.max(0, Number((current - deduction).toFixed(2))),
              };
            }
          });
        }
      });
      return updated;
    });

    logAudit('INVENTORY_AUTO_DEDUCT', order.orderNumber, `Ingredients automatically deducted for Served order.`);
  };

  // Return ingredients if cancellation approved after inventory deduction
  const returnOrderInventory = (order: Order) => {
    if (!order.inventoryDeducted) return;

    setIngredients((prev) => {
      const updated = [...prev];
      order.items.forEach((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
        if (menuItem && menuItem.recipe) {
          menuItem.recipe.forEach((rec) => {
            const ingIdx = updated.findIndex((i) => i.id === rec.ingredientId);
            if (ingIdx > -1) {
              const addition = rec.quantity * item.quantity;
              const current = updated[ingIdx].currentStock;
              updated[ingIdx] = {
                ...updated[ingIdx],
                currentStock: Number((current + addition).toFixed(2)),
              };
            }
          });
        }
      });
      return updated;
    });

    logAudit('INVENTORY_RETURNED', order.orderNumber, `Ingredients returned to inventory following approved cancellation.`);
  };

  // Order Lifecycle Workflow
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    // Permissions check
    if (newStatus === 'Preparing' || newStatus === 'Ready') {
      if (!hasPermission(currentUser, 'kds.manage')) {
        return { success: false, message: 'Permission Denied: Only Kitchen staff / Head Chef / Managers can update KDS.' };
      }
    }

    let deductInv = order.inventoryDeducted;
    if (newStatus === 'Served' && !order.inventoryDeducted) {
      deductOrderInventory(order);
      deductInv = true;
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              inventoryDeducted: deductInv,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    sound.playKitchenAlert();
    logAudit('ORDER_STATUS_CHANGE', order.orderNumber, `Order status updated to ${newStatus}`);
    return { success: true };
  };

  // Rule 21 & 39: Order Cancellation Rules
  const requestOrderCancellation = (orderId: string, reason: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    // If order is already served (inventory deducted), requires manager approval
    if (order.inventoryDeducted || order.status === 'Served' || order.status === 'Ready') {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                cancellationPendingApproval: true,
                cancellationReason: reason,
                updatedAt: new Date().toISOString(),
              }
            : o
        )
      );
      logAudit('ORDER_CANCEL_REQUESTED', order.orderNumber, `Manager approval requested to cancel: "${reason}"`);
      return {
        success: true,
        message: 'Order was already prepared/served. Cancellation request sent for Manager Approval.',
      };
    }

    // Otherwise immediate cancel (e.g. while New or before Preparing)
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Canceled',
              cancellationReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    // Free table if dine in
    if (order.tableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.tableNumber === order.tableNumber && t.branchId === order.branchId
            ? { ...t, status: 'Available', currentOrderId: undefined }
            : t
        )
      );
    }

    logAudit('ORDER_CANCELED', order.orderNumber, `Order canceled: "${reason}"`);
    return { success: true, message: 'Order canceled successfully.' };
  };

  const approveOrderCancellation = (orderId: string) => {
    if (!hasPermission(currentUser, 'orders.approve_cancellation')) {
      return { success: false, message: 'Permission Denied: Only Manager or Owner can approve cancellations.' };
    }

    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    // Rule 15 & 39: Return deducted ingredients to inventory
    returnOrderInventory(order);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Canceled',
              cancellationPendingApproval: false,
              inventoryDeducted: false,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    // Free table if dine-in
    if (order.tableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.tableNumber === order.tableNumber && t.branchId === order.branchId
            ? { ...t, status: 'Available', currentOrderId: undefined }
            : t
        )
      );
    }

    logAudit('CANCEL_APPROVED', order.orderNumber, `Manager approved cancellation and restocked ingredients.`);
    return { success: true, message: 'Cancellation approved. Deducted ingredients restored to inventory.' };
  };

  const rejectOrderCancellation = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, cancellationPendingApproval: false } : o))
    );
    logAudit('CANCEL_REJECTED', orderId, `Manager rejected cancellation request.`);
  };

  // Rule 11 & 27: Payment & Receipts (Cashier Only!)
  // Payment methods: Cash, Card, bKash, Nagad, Rocket
  // Sequential receipt ID format: {BranchCode}-R{Number} (e.g. BPKG-R01)
  // Rule 16: "Loyalty points are awarded only after: Fully Paid + Completed"
  const processPayment = (orderId: string, paymentMethod: PaymentMethod, tipAmount: number = 0) => {
    if (!hasPermission(currentUser, 'payments.create')) {
      return {
        success: false,
        message: 'Permission Denied: Billing and payments are restricted to Cashier accounts only.',
      };
    }

    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    const branchReceipts = receipts.filter((r) => r.branchId === currentBranchId);
    const seq = branchReceipts.length + 1;
    const receiptNumber = `${currentBranch.code}-R${seq < 10 ? '0' + seq : seq}`;

    const finalTip = tipAmount || order.tipAmount || 0;
    const finalTotal = Math.max(0, order.subtotal - order.discountAmount + finalTip);

    const newReceipt: Receipt = {
      id: 'rec-' + Date.now(),
      receiptNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      branchId: currentBranchId,
      branchName: currentBranch.name,
      branchAddress: currentBranch.address,
      branchPhone: currentBranch.phone,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      tableNumber: order.tableNumber,
      orderType: order.orderType,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discountAmount,
      tip: finalTip,
      total: finalTotal,
      paymentMethod,
      cashierName: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    setReceipts((prev) => [newReceipt, ...prev]);

    // Update order to Paid & Completed
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'Paid',
              status: 'Completed',
              paymentMethod,
              receiptNumber,
              tipAmount: finalTip,
              totalAmount: finalTotal,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    // Free table if Dine in
    if (order.tableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.tableNumber === order.tableNumber && t.branchId === order.branchId
            ? { ...t, status: 'Available', currentOrderId: undefined }
            : t
        )
      );
    }

    // Rule 16 & 41: Award Loyalty Points after Fully Paid + Completed (1 point per ৳50)
    const pointsEarned = Math.floor(finalTotal / 50);
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.phone === order.customerPhone && c.branchId === order.branchId) {
          const newPoints = c.loyaltyPoints + pointsEarned;
          const newSpent = c.totalSpent + finalTotal;
          let tier: Customer['loyaltyTier'] = 'Bronze';
          if (newPoints >= 500) tier = 'Platinum';
          else if (newPoints >= 250) tier = 'Gold';
          else if (newPoints >= 100) tier = 'Silver';

          return {
            ...c,
            loyaltyPoints: newPoints,
            loyaltyTier: tier,
            totalSpent: newSpent,
            totalOrdersCount: c.totalOrdersCount + 1,
          };
        }
        return c;
      })
    );

    // Audio chime
    sound.playPaymentSuccess();
    logAudit('PAYMENT_PROCESSED', receiptNumber, `Paid ৳${finalTotal} via ${paymentMethod} (Cashier: ${currentUser.name})`);

    // Set active receipt modal for immediate preview & print
    setActiveReceiptModal(newReceipt);

    return { success: true, receipt: newReceipt };
  };

  const refundPayment = (orderId: string, reason: string) => {
    if (!hasPermission(currentUser, 'payments.refund')) {
      return { success: false, message: 'Permission Denied: Refunds are Cashier-only.' };
    }
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: 'Unpaid', status: 'Canceled' } : o))
    );
    logAudit('PAYMENT_REFUND', order.orderNumber, `Payment refunded: "${reason}"`);
    return { success: true, message: 'Payment refunded successfully.' };
  };

  // Table Management
  const updateTableStatus = (tableId: string, status: TableStatus) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status } : t)));
    logAudit('TABLE_UPDATE', tableId, `Status changed to ${status}`);
  };

  const addTable = (tableData: Omit<Table, 'id'>) => {
    const seq = tables.filter((t) => t.branchId === currentBranchId).length + 1;
    const tableNumber = `${currentBranch.code}-T${seq < 10 ? '0' + seq : seq}`;
    const newTable: Table = {
      ...tableData,
      id: 'tbl-' + Date.now(),
      tableNumber: tableData.tableNumber || tableNumber,
      branchId: currentBranchId,
    };
    setTables((prev) => [...prev, newTable]);
    logAudit('TABLE_CREATE', newTable.tableNumber, `Added new table`);
  };

  // Menu Management
  const addMenuItem = (itemData: Omit<MenuItem, 'id' | 'menuId'>) => {
    const seq = menuItems.length + 1;
    const menuId = `${currentBranch.code}-M${seq < 10 ? '0' + seq : seq}`;
    const newItem: MenuItem = {
      ...itemData,
      id: 'menu-' + Date.now(),
      menuId,
    };
    setMenuItems((prev) => [newItem, ...prev]);
    logAudit('MENU_CREATE', menuId, `Created menu item: ${newItem.name}`);
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));
    logAudit('MENU_UPDATE', item.menuId, `Updated item: ${item.name}`);
  };

  const toggleMenuItemAvailability = (menuItemId: string) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === menuItemId ? { ...m, available: !m.available } : m))
    );
  };

  const deleteMenuItem = (menuItemId: string) => {
    const item = menuItems.find((m) => m.id === menuItemId);
    setMenuItems((prev) => prev.filter((m) => m.id !== menuItemId));
    if (item) logAudit('MENU_DELETE', item.menuId, `Deleted menu item`);
  };

  // Inventory Management
  const adjustStock = (ingredientId: string, deltaQty: number, reason: string) => {
    setIngredients((prev) =>
      prev.map((i) => {
        if (i.id === ingredientId) {
          const nextStock = Math.max(0, Number((i.currentStock + deltaQty).toFixed(2)));
          return { ...i, currentStock: nextStock };
        }
        return i;
      })
    );
    logAudit('INVENTORY_ADJUST', ingredientId, `Stock adjusted by ${deltaQty} (${reason})`);
  };

  const createPurchaseOrder = (supplierName: string, items: { ingredientId: string; quantity: number }[]) => {
    const seq = purchaseOrders.length + 1;
    const poNumber = `${currentBranch.code}-PO${seq < 10 ? '0' + seq : seq}`;

    let totalCost = 0;
    const poItems = items.map((it) => {
      const ing = ingredients.find((i) => i.id === it.ingredientId);
      const unitCost = ing ? ing.costPerUnit : 100;
      const cost = unitCost * it.quantity;
      totalCost += cost;
      return {
        ingredientId: it.ingredientId,
        ingredientName: ing ? ing.name : 'Ingredient',
        quantity: it.quantity,
        unit: ing ? ing.unit : 'kg',
        unitCost,
        totalCost: cost,
      };
    });

    const po: PurchaseOrder = {
      id: 'po-' + Date.now(),
      poNumber,
      branchId: currentBranchId,
      supplierName,
      items: poItems,
      totalCost,
      status: 'Ordered',
      createdAt: new Date().toISOString(),
    };

    setPurchaseOrders((prev) => [po, ...prev]);
    logAudit('PO_CREATE', poNumber, `Created Purchase Order for ${supplierName} (৳${totalCost})`);
  };

  const receivePurchaseOrder = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === 'Received') return;

    // Add stock to ingredients
    setIngredients((prev) => {
      const updated = [...prev];
      po.items.forEach((item) => {
        const idx = updated.findIndex((i) => i.id === item.ingredientId);
        if (idx > -1) {
          updated[idx] = {
            ...updated[idx],
            currentStock: Number((updated[idx].currentStock + item.quantity).toFixed(2)),
            lastRestocked: new Date().toISOString().split('T')[0],
          };
        }
      });
      return updated;
    });

    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, status: 'Received', receivedAt: new Date().toISOString() } : p))
    );
    logAudit('PO_RECEIVED', po.poNumber, `Stock received and updated in inventory.`);
  };

  const logWastage = (ingredientId: string, quantity: number, reason: WastageLog['reason']) => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    if (!ing) return;

    const cost = ing.costPerUnit * quantity;
    const wastage: WastageLog = {
      id: 'wastage-' + Date.now(),
      branchId: currentBranchId,
      ingredientId,
      ingredientName: ing.name,
      quantity,
      unit: ing.unit,
      cost,
      reason,
      staffName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      status: 'Approved',
    };

    setWastageLogs((prev) => [wastage, ...prev]);
    // Deduct wasted amount from stock
    adjustStock(ingredientId, -quantity, `Wastage: ${reason}`);
    logAudit('WASTAGE_LOGGED', ing.name, `Logged ${quantity} ${ing.unit} wastage (${reason})`);
  };

  // Delivery Management (Rule 24: Order Taker is responsible for delivery assignment)
  const assignDeliveryStaff = (orderId: string, staffId: string) => {
    const staff = users.find((u) => u.id === staffId);
    const order = orders.find((o) => o.id === orderId);
    if (!staff || !order) return { success: false, message: 'Invalid order or staff' };

    const seq = deliveries.filter((d) => d.branchId === currentBranchId).length + 1;
    const deliveryNumber = `${currentBranch.code}-DEL${seq < 10 ? '0' + seq : seq}`;

    const newDelivery: DeliveryRecord = {
      id: 'del-' + Date.now(),
      deliveryNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      branchId: currentBranchId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.deliveryAddress || 'Address on file',
      deliveryStaffId: staff.id,
      deliveryStaffName: staff.name,
      status: 'Assigned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDeliveries((prev) => [newDelivery, ...prev]);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, deliveryStaffId: staff.id, deliveryStaffName: staff.name } : o))
    );
    logAudit('DELIVERY_ASSIGNED', deliveryNumber, `Assigned to ${staff.name} for Order ${order.orderNumber}`);
    return { success: true };
  };

  const updateDeliveryStatus = (deliveryId: string, newStatus: DeliveryRecord['status']) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === deliveryId ? { ...d, status: newStatus, updatedAt: new Date().toISOString() } : d))
    );
    logAudit('DELIVERY_UPDATE', deliveryId, `Status updated to ${newStatus}`);
  };

  // Customers & Reservations
  const addCustomer = (customerData: Omit<Customer, 'id' | 'customerId' | 'loyaltyPoints' | 'loyaltyTier' | 'totalOrdersCount' | 'totalSpent' | 'createdAt'>) => {
    const seq = customers.filter((c) => c.branchId === currentBranchId).length + 1;
    const customerId = `${currentBranch.code}-C${seq < 10 ? '0' + seq : seq}`;
    const newCust: Customer = {
      ...customerData,
      id: 'cust-' + Date.now(),
      customerId,
      loyaltyPoints: 0,
      loyaltyTier: 'Bronze',
      totalOrdersCount: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [...prev, newCust]);
    logAudit('CUSTOMER_CREATE', customerId, `Registered new customer: ${newCust.name}`);
  };

  const addReservation = (resData: Omit<Reservation, 'id' | 'reservationNumber' | 'createdAt'>) => {
    const seq = reservations.filter((r) => r.branchId === currentBranchId).length + 1;
    const reservationNumber = `${currentBranch.code}-RES${seq < 10 ? '0' + seq : seq}`;
    const newRes: Reservation = {
      ...resData,
      id: 'res-' + Date.now(),
      reservationNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setReservations((prev) => [...prev, newRes]);

    // Mark table booked if matched
    if (resData.tableNumber) {
      setTables((prev) =>
        prev.map((t) => (t.tableNumber === resData.tableNumber ? { ...t, status: 'Booked' } : t))
      );
    }
    logAudit('RESERVATION_CREATE', reservationNumber, `Booked table ${resData.tableNumber} for ${resData.customerName}`);
  };

  const updateReservationStatus = (reservationId: string, status: Reservation['status']) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status } : r))
    );
    logAudit('RESERVATION_STATUS', reservationId, `Status changed to ${status}`);
  };

  // Backup & Restore
  const exportSystemBackup = () => {
    const backupData = {
      version: '1.0.0',
      system: 'BLACK_PLATE_OS',
      timestamp: new Date().toISOString(),
      branches,
      users,
      tables,
      menuItems,
      orders,
      ingredients,
      customers,
      reservations,
      campaigns,
      receipts,
      deliveries,
      purchaseOrders,
      wastageLogs,
      shifts,
      auditLogs,
    };
    logAudit('BACKUP_EXPORT', 'SYSTEM', 'Full system state exported.');
    return JSON.stringify(backupData, null, 2);
  };

  const restoreSystemBackup = (jsonContent: string) => {
    if (!hasPermission(currentUser, 'backup.restore')) {
      return { success: false, message: 'Permission Denied: Only Super Admin / Owner can restore backups.' };
    }
    try {
      const data = JSON.parse(jsonContent);
      if (data.system !== 'BLACK_PLATE_OS') {
        return { success: false, message: 'Invalid backup file signature.' };
      }
      if (data.branches) setBranches(data.branches);
      if (data.users) setUsers(data.users);
      if (data.tables) setTables(data.tables);
      if (data.menuItems) setMenuItems(data.menuItems);
      if (data.orders) setOrders(data.orders);
      if (data.ingredients) setIngredients(data.ingredients);
      if (data.customers) setCustomers(data.customers);
      if (data.reservations) setReservations(data.reservations);
      if (data.receipts) setReceipts(data.receipts);
      if (data.deliveries) setDeliveries(data.deliveries);
      if (data.auditLogs) setAuditLogs(data.auditLogs);

      logAudit('BACKUP_RESTORE', 'SYSTEM', 'Full system restore executed.');
      return { success: true, message: 'System state successfully restored from backup.' };
    } catch {
      return { success: false, message: 'Malformed JSON backup file.' };
    }
  };

  // Filter active order queues for the current branch
  const activeOrderQueues = useMemo(() => {
    return orders
      .filter((o) => o.branchId === currentBranchId)
      .slice(0, 10);
  }, [orders, currentBranchId]);

  return (
    <RestaurantContext.Provider
      value={{
        branches,
        currentBranchId,
        currentBranch,
        setBranchId,
        addBranch,

        currentUser,
        users,
        switchUser,
        createUser,
        updateUser,
        deleteUser,
        resetPin,

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
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyDiscountCoupon,
        removeDiscountCoupon,
        submitCartOrder,

        orders,
        updateOrderStatus,
        requestOrderCancellation,
        approveOrderCancellation,
        rejectOrderCancellation,
        activeOrderQueues,

        receipts,
        activeReceiptModal,
        setActiveReceiptModal,
        processPayment,
        refundPayment,

        tables,
        selectedTableId,
        setSelectedTableId,
        updateTableStatus,
        addTable,

        menuItems,
        addMenuItem,
        updateMenuItem,
        toggleMenuItemAvailability,
        deleteMenuItem,

        ingredients,
        purchaseOrders,
        wastageLogs,
        adjustStock,
        createPurchaseOrder,
        receivePurchaseOrder,
        logWastage,

        deliveries,
        assignDeliveryStaff,
        updateDeliveryStatus,

        customers,
        campaigns,
        addCustomer,

        reservations,
        addReservation,
        updateReservationStatus,

        shifts,
        auditLogs,
        logAudit,

        soundEnabled,
        toggleSound,

        exportSystemBackup,
        restoreSystemBackup,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
