export type Role =
  | 'Owner'
  | 'Super Admin'
  | 'Branch Manager'
  | 'Accountant'
  | 'Cashier'
  | 'Order Taker'
  | 'Head Chef'
  | 'Kitchen Staff'
  | 'Inventory Manager'
  | 'Staff Manager'
  | 'Marketer'
  | 'Graphic Designer'
  | 'Delivery Staff';

export type Permission =
  | 'dashboard.view'
  | 'pos.access'
  | 'orders.view'
  | 'orders.create'
  | 'orders.edit'
  | 'orders.cancel'
  | 'orders.approve_cancellation'
  | 'tables.view'
  | 'tables.create'
  | 'tables.edit'
  | 'tables.delete'
  | 'reservations.view'
  | 'reservations.create'
  | 'reservations.edit'
  | 'reservations.delete'
  | 'customers.view'
  | 'customers.create'
  | 'customers.edit'
  | 'menu.view'
  | 'menu.create'
  | 'menu.edit'
  | 'menu.delete'
  | 'menu.change_price'
  | 'menu.change_availability'
  | 'kds.view'
  | 'kds.manage'
  | 'payments.view'
  | 'payments.create'
  | 'payments.refund'
  | 'inventory.view'
  | 'inventory.create'
  | 'inventory.edit'
  | 'inventory.adjust'
  | 'inventory.wastage'
  | 'purchasing.view'
  | 'purchasing.manage'
  | 'delivery.view'
  | 'delivery.assign'
  | 'delivery.update'
  | 'loyalty.view'
  | 'loyalty.manage'
  | 'marketing.view'
  | 'marketing.manage'
  | 'staff.view'
  | 'staff.create'
  | 'staff.edit'
  | 'staff.delete'
  | 'branches.view'
  | 'branches.create'
  | 'branches.edit'
  | 'branches.delete'
  | 'reports.view'
  | 'reports.export'
  | 'audit.view'
  | 'backup.create'
  | 'backup.restore'
  | 'settings.view'
  | 'settings.edit';

export interface Branch {
  id: string;
  name: string;
  code: string; // e.g., 'KG', 'DH', 'CTG'
  address: string;
  phone: string;
  managerName: string;
  active: boolean;
}

export interface User {
  id: string;
  staffId: string; // e.g. BPKG-ST01
  name: string;
  email: string;
  username: string;
  pin: string;
  role: Role;
  branchId: string; // 'all' for Owner/Super Admin or specific branch ID
  avatar: string;
  phone: string;
  active: boolean;
  permissionOverrides?: Partial<Record<Permission, boolean>>;
  shift?: 'Morning' | 'Evening' | 'Night' | 'Full Day';
}

export type OrderType = 'Dine in' | 'Takeaway' | 'Delivery';

export type OrderStatus =
  | 'New'
  | 'Preparing'
  | 'Ready'
  | 'Served'
  | 'Paid'
  | 'Completed'
  | 'Canceled';

export type TableStatus = 'Available' | 'Booked' | 'Pending' | 'Occupied';

export interface Table {
  id: string;
  tableNumber: string; // e.g. BPKG-T01 or Table 1A
  branchId: string;
  capacity: number;
  status: TableStatus;
  location: string;
  positionX: number; // 3D coordinates
  positionZ: number;
  shape: 'round' | 'square' | 'booth';
  qrCodeUrl?: string;
  currentOrderId?: string;
}

export interface MenuItemVariant {
  id: string;
  name: string; // e.g. 'Original', 'Lemon zest', 'Spicy'
  priceModifier: number; // +৳0 or +৳50
}

export interface MenuItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: string;
}

export interface MenuItem {
  id: string;
  menuId: string; // e.g. BPKG-M01
  branchId: string; // 'all' or branch-specific
  name: string;
  category: string;
  description: string;
  price: number; // in BDT (৳)
  image: string;
  available: boolean;
  variants: MenuItemVariant[];
  addons: MenuItemAddon[];
  recipe: RecipeIngredient[];
  preparationTimeMinutes: number;
  station: 'Kitchen' | 'Grill' | 'Beverage' | 'Seafood' | 'Dessert';
}

export interface CartItem {
  id: string; // unique cart line id
  menuItem: MenuItem;
  selectedVariant?: MenuItemVariant;
  selectedAddons: MenuItemAddon[];
  specialInstructions?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  variantName?: string;
  addons: string[];
  specialInstructions?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. BPKG-01
  branchId: string;
  orderType: OrderType;
  tableNumber?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryStaffId?: string;
  deliveryStaffName?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  tipAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: 'Unpaid' | 'Paid';
  paymentMethod?: PaymentMethod;
  receiptNumber?: string; // e.g. BPKG-R01
  orderTakerName: string;
  orderTakerRole: string;
  createdAt: string;
  updatedAt: string;
  inventoryDeducted: boolean;
  cancellationPendingApproval?: boolean;
  cancellationReason?: string;
  priority: 'Normal' | 'High' | 'Urgent';
}

export type PaymentMethod = 'Cash' | 'Card' | 'bKash' | 'Nagad' | 'Rocket';

export interface Receipt {
  id: string;
  receiptNumber: string; // e.g. BPKG-R01
  orderId: string;
  orderNumber: string;
  branchId: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  customerName: string;
  customerPhone: string;
  tableNumber?: string;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tip: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashierName: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerId: string; // e.g. BPKG-C01
  branchId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalOrdersCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface Reservation {
  id: string;
  reservationNumber: string; // e.g. BPKG-RES01
  branchId: string;
  customerName: string;
  customerPhone: string;
  guestsCount: number;
  tableNumber: string;
  reservationDate: string; // YYYY-MM-DD
  reservationTime: string; // HH:mm
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Canceled';
  notes?: string;
  createdAt: string;
}

export interface DeliveryRecord {
  id: string;
  deliveryNumber: string; // e.g. BPKG-DEL01
  orderId: string;
  orderNumber: string;
  branchId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  deliveryStaffId?: string;
  deliveryStaffName?: string;
  status: 'Assigned' | 'Picked Up' | 'Out for Delivery' | 'Delivered';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  inventoryNumber: string; // e.g. BPKG-INV01
  branchId: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string; // 'kg', 'pcs', 'liters', 'packets'
  minimumStockAlert: number;
  costPerUnit: number; // in BDT
  supplierName: string;
  lastRestocked: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  branchId: string;
  supplierName: string;
  items: {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
  }[];
  totalCost: number;
  status: 'Ordered' | 'Received' | 'Canceled';
  createdAt: string;
  receivedAt?: string;
}

export interface WastageLog {
  id: string;
  branchId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost: number;
  reason: 'Spoilage' | 'Damage' | 'Expired stock' | 'Preparation waste' | 'Other';
  staffName: string;
  date: string;
  status: 'Approved' | 'Pending';
}

export interface LoyaltyCampaign {
  id: string;
  title: string;
  description: string;
  couponCode: string;
  fixedDiscountAmount: number; // ৳100, ৳500, ৳1500
  minimumOrderAmount: number;
  validUntil: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  branchCode: string;
  action: string;
  target: string;
  details: string;
}

export interface StaffShift {
  id: string;
  staffId: string;
  staffName: string;
  role: Role;
  branchId: string;
  date: string;
  shift: 'Morning' | 'Evening' | 'Night' | 'Full Day';
  status: 'On Duty' | 'Off Duty' | 'On Leave';
  clockInTime?: string;
  clockOutTime?: string;
}
