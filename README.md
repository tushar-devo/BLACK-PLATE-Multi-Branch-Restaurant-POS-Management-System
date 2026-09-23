# BLACK PLATE — Multi-Branch Restaurant POS & Management System

> High-performance, multi-branch restaurant Point of Sale (POS), 3D interactive table management, Kitchen Display System (KDS), inventory recipe deduction, and role-based staff operations suite.

---

## 📋 System Overview

**BLACK PLATE** is an enterprise-grade restaurant operations platform designed specifically for multi-branch dining establishments. It unifies front-of-house order taking, 3D atmospheric floor visualization, live kitchen ticket routing, automated recipe inventory depletion, delivery dispatch, and multi-channel Bangladeshi payment gateways (`bKash`, `Nagad`, `Rocket`, `Card`, `Cash`).

---

## 🎨 Design System & Visual Identity

The interface adheres strictly to the **BLACK PLATE Dark Aesthetic**:

| Element | Specification | Hex / Value |
| :--- | :--- | :--- |
| **Canvas Background** | Deep Pitch Black | `#121212` |
| **Card / Drawer Surface** | Elevated Dark Slate | `#181818` / `#1E1E1E` |
| **Borders & Dividers** | Subtle Hairline Borders | `#2A2A2A` / `#242424` |
| **Brand Accent** | Black Plate Signature Red | `#FF0000` |
| **Available / Ready / Success** | Vivid Emerald Green | `#06990F` |
| **Cooking / Pending Warning** | Electric Yellow | `#FFFF00` |
| **Typography (UI)** | Modern Sans-Serif | `Plus Jakarta Sans`, sans-serif |
| **Typography (Numbers & IDs)** | Monospace Precision | `JetBrains Mono`, monospace |
| **Currency** | Bangladeshi Taka | `৳` (BDT) |

---

## 🏢 Multi-Branch Architecture

The platform supports centralized oversight with decentralized branch isolation.

### Configured Branches:
1. **Khilgaon Outlet** (`BP-KG`): Shahid Baki Road, Khilgaon, Dhaka (+880 1711-234567)
2. **Dhanmondi Outlet** (`BP-DH`): Satmasjid Road, Dhanmondi, Dhaka (+880 1711-890123)
3. **Uttara Outlet** (`BP-UT`): Sector 3, Jashimuddin Avenue, Uttara, Dhaka (+880 1711-456789)

### Standardized Identifier Sequences:
- **Orders**: `BP{BranchCode}-{Number}` (e.g. `BPKG-01`, `BPDH-02`)
- **Receipts**: `BP{BranchCode}-R{Number}` (e.g. `BPKG-R01`)
- **Deliveries**: `BP{BranchCode}-DEL{Number}` (e.g. `BPKG-DEL01`)
- **Reservations**: `BP{BranchCode}-RES{Number}` (e.g. `BPKG-RES01`)
- **Staff IDs**: `BP{BranchCode}-ST{Number}` (e.g. `BPKG-ST01`)
- **Customer IDs**: `BP{BranchCode}-C{Number}` (e.g. `BPKG-C01`)

---

## 👥 13 Role-Based Access Control (RBAC) System

Every feature, button, and data record enforces strict role permissions. Users can switch roles seamlessly from the sidebar drawer to test operations:

| Role | Primary Scope & Access |
| :--- | :--- |
| **Owner** | Full system master control, all branches, global financial P&L, system restore. |
| **Super Admin** | Global configuration, branch provisioning, audit logging, security overrides. |
| **Branch Manager** | Branch oversight, table layouts, staff shift management, order cancellation approvals. |
| **Accountant** | Financial reporting, revenue reconciliations, profit margin tracking, tax records. |
| **Cashier** | **Exclusive authority** for billing, payment capture, refunds, and 80mm thermal receipt printing. |
| **Order Taker** | POS order entry, manual custom items, customer phone capture, delivery staff assignment. |
| **Head Chef** | KDS kitchen orchestration, station assignment, recipe configurations. |
| **Kitchen Staff** | Live ticket cooking timers, status advancements (`New` $\to$ `Preparing` $\to$ `Ready`). |
| **Inventory Manager** | Stock level management, purchase order creation/receiving, wastage recording. |
| **Staff Manager** | Employee directory, shift scheduling, PIN credential resets, onboarding/offboarding. |
| **Marketer** | Flat-amount promo code campaigns (`৳100`, `৳500`, `৳1500`), loyalty tier tuning. |
| **Graphic Designer** | Menu photography, visual asset coordination, dish promotional banners. |
| **Delivery Staff** | Dedicated mobile/rider dispatch queue (`Assigned` $\to$ `Picked Up` $\to$ `Out for Delivery` $\to$ `Delivered`). |

*Note: Per Black Plate business policy, when an employee departs, their account is permanently deleted rather than deactivated.*

---

## ⚡ Core Feature Modules

### 1. Point of Sale (POS) Interface
- **Order Queues Bar**: Top horizontal carousel showcasing incoming orders with live status badges (*Ready to serve*, *On cooking*, *New*, *Served*), customer identity, elapsed time, item counts, and table badges.
- **Product Lists**: Fast category switching (*All*, *Appetizers*, *Seafood platters*, *Shrimp*, *Rice*, *Burgers*, *Drinks*, *Dessert*), instant keyboard search (`⌘ F`), dish variant selectors (*Original*, *Lemon zest*), quantity steppers, and single-click cart additions.
- **Manual Dish Entry**: Allows Order Takers to input off-menu dishes and chef specials on the fly with custom pricing and kitchen station routing.
- **Cart Details Drawer**: Order type selection (*Dine in*, *Takeaway*, *Delivery*), collapsible customer info with **mandatory Name and Phone**, table selection, order items breakdown, tip calculation, flat promo coupon engine, and high-contrast checkout CTA.

### 2. 3D Interactive Floor & Table Management
- Built with **Three.js** rendering an ambient, high-end restaurant floor with mood lighting, candle accents, bar counter neon strip, and realistic table models with chairs.
- Real-time status rings:
  - 🟢 **Green** (`#06990F`): Available
  - 🔴 **Red** (`#FF0000`): Booked / Reserved
  - 🟡 **Yellow** (`#FFFF00`): Pending Confirmation
  - 🔵 **Blue**: Currently Occupied
- Raycasted pointer interaction: Hover for table seat count, click to smoothly fly camera into table focus and launch quick orders.
- Includes a **2D Operations Grid** for high-volume POS operations and table QR code generation.

### 3. Kitchen Display System (KDS)
- Kitchen ticket dispatch grouped across cooking stations (*Kitchen*, *Grill*, *Seafood*, *Beverage*, *Dessert*).
- Elapsed live cooking timer with urgent visual highlights when orders exceed 15 minutes.
- Synthesized Web Audio alerts on ticket arrivals.
- **Automated Recipe Deduction**: Advancing an order from `Ready` $\to$ `Served` automatically deducts proportional raw ingredients from the branch inventory.

### 4. Billing, Payments & 80mm Thermal Receipt
- **Cashier Enforcement**: Restricted to Cashier role for regulatory compliance and audit safety.
- **Bangladeshi Payment Gateways**: Supports `bKash`, `Nagad`, `Rocket`, `Card`, and `Cash`.
- **Printable 80mm Thermal Receipt**: Meets standard commercial thermal printer dimensions with branch contact info, sequential receipt ID, itemized prices, discounts, gratuity, and barcode. Automatically triggers `window.print()` with custom print stylesheets.

### 5. Customer QR Ordering Simulator
- Simulates guest table-side mobile experience.
- Scan $\to$ Menu $\to$ Select Dish $\to$ Choose Variant $\to$ Add Instructions $\to$ Enter Required Name & Phone $\to$ Place Order.
- Live kitchen status tracking from the customer's perspective.
- Direct self-cancellation allowed as long as the kitchen status remains `New`.

### 6. Inventory, Recipes, POs & Wastage
- Real-time stock levels with unit metrics (`kg`, `pcs`, `liters`).
- Visual low-stock alert warnings when stock reaches or falls below the safety reorder threshold.
- Recipe Inspector showing exact ingredient grammage per menu dish.
- Purchase Order management: Create PO $\to$ Receive stock (instantly updates inventory levels).
- Wastage logging for spoilage, damage, and expired goods.

### 7. Order Cancellation Workflow
- Orders in `New` status can be immediately canceled.
- Orders already in `Served` status (where inventory was deducted) require **Manager Approval** to cancel; once approved, deducted ingredients are automatically replenished back into the branch inventory.

### 8. Delivery Management
- Order Taker assignment of delivery orders to dedicated Delivery Staff riders.
- Delivery lifecycle tracking: `Assigned` $\to$ `Picked Up` $\to$ `Out for Delivery` $\to$ `Delivered`.
- Riders only see orders assigned to their personal account.

### 9. Guest Relationship (CRM), Reservations & Loyalty
- Customer directory tracking lifetime visits, total expenditure, and loyalty tier (*Bronze*, *Silver*, *Gold*, *Platinum*).
- Table reservations schedule with guest count and seating notes.
- Fixed-discount promotional campaigns (e.g. `WELCOME100`, `FAMILY500`, `PLATINUM1500`).

### 10. Financial Analytics & Disaster Recovery
- Real-time Sales, Orders, Average Check Value (AOV), and Gross Margin tracking.
- Payment method breakdown across digital mobile money and cash.
- One-click CSV and print export.
- **Full Database JSON Export & Restore** for disaster recovery and offline backup.

---

## 🛠 Tech Stack

- **Framework**: React 19 (TypeScript)
- **Bundler & Dev Server**: Vite 8
- **Styling**: Tailwind CSS v4
- **3D Engine**: Three.js
- **Icons**: Lucide React
- **Animations**: Motion
- **Sound**: Synthesized Web Audio API (zero external asset dependencies)

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Run

1. Clone or navigate to the repository directory:
   ```bash
   cd black-plate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server on port 3000:
   ```bash
   npm run dev
   ```

4. Verify build & TypeScript compilation:
   ```bash
   npm run build
   ```

5. Run linter checks:
   ```bash
   npm run lint
   ```

---

## 📄 License & Ownership

Developed for **BLACK PLATE Multi-Branch Restaurant Operations**. All rights reserved.
