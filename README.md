# StockSathi 📈

**Smart Inventory Management & Professional Accounting SaaS**

StockSathi is a high-performance, multi-tenant SaaS platform designed to streamline inventory tracking, sales management, and customer accounting for modern businesses. Built with a focus on speed, precision, and professional aesthetics.

---

## ✨ Key Features

### 🏢 Multi-Tenant Workspace
Register your business and get a dedicated, secure workspace. Manage your products, sales, and customers in an isolated environment with role-based access.

### 📊 Professional Dashboard
Get real-time insights into your business health.
- **Dynamic Metrics**: Monitor Total Sales, Profit, and Due amounts at a glance.
- **Top Selling Products**: Track your best-performing inventory.
- **Low Stock Alerts**: Automatically identify products that need restocking.

### 📜 Accounting Ledger
A high-fidelity, professional accounting statement for every customer.
- **Transaction History**: Detailed tracking of Sales (Debit) and Payments (Credit).
- **Voucher System**: Automatic generation of Invoice (INV) and Receipt (RCT) vouchers.
- **Running Balance**: Real-time balance calculation with 'Dr/Cr' indicators.
- **Premium UI**: Clean, zebra-striped tables with faded grid lines for maximum readability.

### 📦 Smart Inventory
- **Physical Unit Tracking**: Manage products in Kg, Liters, Pieces, etc.
- **Cost Calculation**: Automated unit cost derivation from bulk prices.
- **Low Stock Thresholds**: Set custom alerts for inventory replenishment.

### 📱 Progressive Web App (PWA)
Install StockSathi on your Desktop or Mobile device for a native app-like experience. Offline readiness and quick access from your home screen.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Redux Toolkit
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL (Supabase / Local)
- **State Management**: Redux Toolkit for global app state
- **UI Icons**: Lucide React
- **Validation**: React Hook Form + Zod

---

## 📸 Snapshots

### Real-time Business Dashboard
![Dashboard](file:///C:/Users/HP/.gemini/antigravity/brain/8ffbfae0-bdb0-4bb5-89a3-1704310d7734/dashboard_screenshot_1776849105854.png)
*Track sales, revenue, profit, and low-stock alerts in one place.*

### Inventory Management
![Inventory](file:///C:/Users/HP/.gemini/antigravity/brain/8ffbfae0-bdb0-4bb5-89a3-1704310d7734/products_screenshot_1776849123271.png)
*Manage stock levels, pricing, and categories with ease.*

### Professional Customer Ledger
![Customer Ledger](file:///C:/Users/HP/.gemini/antigravity/brain/8ffbfae0-bdb0-4bb5-89a3-1704310d7734/media__1776841591807.png)
*Modern accounting-style ledger with real-time balance tracking.*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm / yarn
- PostgreSQL instance

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prabesh12/stockpartner.git
   cd stocksathi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   Configure your `.env` in the `backend` package:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/stocksathi"
   JWT_SECRET="your_secret_key"
   ```
   Push the schema:
   ```bash
   npm run db:push -w backend
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 🛡️ License
Licensed under the MIT License. Developed with ❤️ for businesses everywhere.
