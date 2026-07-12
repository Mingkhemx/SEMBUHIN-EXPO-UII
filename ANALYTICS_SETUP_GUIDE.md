# Analytics Dashboard Setup Guide

## 📊 Current Status

✅ **Frontend**: Fully implemented and working  
✅ **Supabase Connection**: Configured and ready  
❌ **Database Table**: `payment_orders` table NOT YET CREATED  

The analytics dashboard is built and connected to Supabase, but showing 0 data because the database table doesn't exist yet.

---

## 🔴 CRITICAL: What You Need to Do RIGHT NOW

The `payment_orders` table SQL schema needs to be **manually executed** in your Supabase Dashboard. This is a one-time setup.

### Steps to Execute the SQL:

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your **Sembuhin** project

2. **Navigate to SQL Editor**
   - Click the **"SQL Editor"** in the left sidebar
   - Click **"New Query"** button

3. **Copy & Paste the SQL**
   ```bash
   # Run this command to display the full SQL:
   node execute-sql.js supabase-payment-orders.sql
   ```
   Or manually read the file: `/home/migwara/Documents/Sembuhin/supabase-payment-orders.sql`

4. **Paste into Supabase SQL Editor**
   - Select ALL the SQL text
   - Paste it into the Supabase SQL Editor
   - Click the **"Run"** button (or Ctrl+Enter)

5. **Wait for Success**
   - You should see a success notification
   - The `payment_orders` table will now exist in your database

### Expected Result:
When SQL executes successfully, you'll see:
- ✅ `payment_orders` table created
- ✅ Indexes created for performance
- ✅ RLS (Row Level Security) policies enabled
- ✅ Timestamp trigger configured

---

## 📋 What the SQL Does

The `supabase-payment-orders.sql` file creates:

### 1. **payment_orders Table**
```sql
CREATE TABLE payment_orders (
  id UUID (primary key),
  user_id UUID (references auth.users),
  order_type VARCHAR (premium | pharmacy),
  amount DECIMAL (transaction amount),
  payment_status VARCHAR (pending | paid | failed | cancelled),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  paid_at TIMESTAMP,
  -- ... and more fields
)
```

### 2. **Performance Indexes**
- `idx_payment_orders_user_id` - Fast lookups by user
- `idx_payment_orders_status` - Filter by payment status  
- `idx_payment_orders_type` - Filter by order type (premium/pharmacy)
- `idx_payment_orders_created_at` - Time-based queries
- `idx_payment_orders_midtrans_order_id` - Payment tracking

### 3. **Security Policies (RLS)**
- Users can only view their own orders
- Admins can view ALL orders
- Admins can update order status

### 4. **Auto-Update Trigger**
- `updated_at` timestamp automatically updates when records are modified

---

## ✨ After Setup: What to Test

### 1. **Test Manually Inserting Data** (Optional)
After the table is created, you can insert test data:

```sql
INSERT INTO payment_orders (
  user_id,
  order_type,
  amount,
  payment_status,
  description
) VALUES (
  '12345678-1234-1234-1234-123456789012',
  'premium',
  299999,
  'paid',
  'Premium Monthly Subscription'
);

-- Insert a pharmacy order
INSERT INTO payment_orders (
  user_id,
  order_type,
  amount,
  payment_status,
  description
) VALUES (
  '12345678-1234-1234-1234-123456789012',
  'pharmacy',
  150000,
  'paid',
  'Pharmacy Purchase'
);
```

### 2. **View Analytics Dashboard**
- Navigate to: **Admin Panel** → **Analytics & Penjualan**
- You should see:
  - 📈 Revenue trend chart (Area chart)
  - 🥧 Distribution pie chart (Premium vs Pharmacy)
  - 📊 Bar charts (Revenue comparison, Order breakdown)
  - 📋 Metrics summary cards
  - ⏱️ Real-time data updates

### 3. **Test Real-time Updates**
The dashboard will automatically update when:
- ✅ New payment orders are inserted
- ✅ Payment status changes (pending → paid)
- ✅ Any order is modified

Real-time updates are configured via Supabase real-time subscriptions.

---

## 🎯 Analytics Dashboard Features

### Stat Cards (Top Row)
- **Total Pendapatan** - Combined revenue from premium + pharmacy
- **Premium Membership** - Revenue from premium subscriptions only
- **Penjualan Apotek** - Revenue from pharmacy sales
- **Total Pesanan** - Total number of orders

### Charts (Professional Grade)
1. **Tren Pendapatan** (Area Chart)
   - Shows revenue trend over time
   - Stacked view of premium + pharmacy revenue
   - Customizable date range (30/90 days)

2. **Distribusi Revenue** (Pie Chart)
   - Percentage breakdown: Premium vs Pharmacy
   - Shows actual revenue amounts below chart

3. **Perbandingan Revenue** (Bar Chart)
   - Side-by-side comparison of premium vs pharmacy
   - In millions (Rp) for readability

4. **Breakdown Pesanan** (Horizontal Bar Chart)
   - Count of orders per category
   - Shows order distribution

5. **Ringkasan Metrik** (KPI Cards)
   - Average order value
   - Premium order percentage
   - Pharmacy order percentage
   - Total orders count

---

## 🔄 Real-time Functionality

The dashboard subscribes to the `payment_orders` table using Supabase real-time:

```typescript
supabase
  .channel("payment-orders")
  .on("postgres_changes", { 
    event: "*",
    schema: "public", 
    table: "payment_orders" 
  }, () => {
    fetchAnalyticsData(); // Auto-refresh when data changes
  })
  .subscribe();
```

**What triggers updates:**
- ✅ New payments processed
- ✅ Payment status updated (pending → paid)
- ✅ Order information modified
- ✅ Any INSERT, UPDATE, DELETE on payment_orders

---

## 🚀 Integration Points

### Frontend Components
- **Route**: `/admin/analytics` (protected)
- **Component**: `src/panel-admin/AdminAnalytics.tsx`
- **Layout**: `src/panel-admin/AdminLayout.tsx`

### Supabase Tables Used
- `payment_orders` - Main analytics data
- `profiles` - For admin role verification (RLS)
- `auth.users` - For user identification

### Environment Variables
```env
VITE_SUPABASE_URL=https://ialaexpnnhjtkfkooqgm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

---

## ⚠️ Troubleshooting

### "0 data showing on dashboard"
**Solution**: Execute the SQL file (see "Steps to Execute the SQL" above)

### "Cannot view all orders as admin"
**Solution**: 
- Check that your admin account has `role = 'admin'` in the `profiles` table
- Verify RLS policies are correctly set up

### "Real-time updates not working"
**Solution**:
- Check Supabase real-time is enabled in project settings
- Verify subscription setup in browser console (no errors)
- Try clicking the refresh button manually

### "Permission denied" error
**Solution**:
- Check that user exists in `auth.users`
- Verify user record in `profiles` table
- Check RLS policies are correct

---

## 📝 Next Steps After SQL Execution

1. ✅ Execute `supabase-payment-orders.sql` in Supabase Dashboard
2. ✅ Verify table exists (check Tables in Supabase)
3. ✅ Navigate to Admin Analytics page
4. ✅ Insert test data or use existing data
5. ✅ Verify real-time updates work
6. ✅ Monitor dashboard during production

---

## 💾 Backup: Manual SQL Execution

If you prefer to use Supabase CLI:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref ialaexpnnhjtkfkooqgm

# Push SQL migrations
supabase db execute supabase-payment-orders.sql --project-ref ialaexpnnhjtkfkooqgm
```

---

## 🎓 Educational Notes

This setup demonstrates:
- ✅ Real-time database subscriptions
- ✅ Row Level Security (RLS) policies
- ✅ Database triggers and functions
- ✅ Professional analytics dashboards
- ✅ Direct Supabase integration from React
- ✅ Responsive, mobile-friendly UI with Tailwind CSS
- ✅ Enterprise-grade charting with Recharts

---

**Last Updated**: 2026-07-12  
**Status**: Ready for SQL Execution  
**Questions?** Check the AdminAnalytics.tsx component or contact the development team.
