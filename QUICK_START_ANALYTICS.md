# ⚡ Quick Start: Analytics Dashboard

## 🎯 Do This RIGHT NOW (5 minutes)

### Step 1: Get the SQL
```bash
node execute-sql.js supabase-payment-orders.sql
```
This will display the exact SQL you need to copy.

### Step 2: Go to Supabase Dashboard
👉 https://app.supabase.com

### Step 3: Execute SQL
1. Open the **Sembuhin** project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. **Paste the SQL** from Step 1
5. Click **Run** button (or Ctrl+Enter)
6. ✅ Wait for success message

### Step 4: Verify Table Created
1. Click **Tables** in left sidebar
2. Look for `payment_orders` table
3. ✅ It should be there!

### Step 5: Test Analytics Dashboard
1. Go to: http://localhost:5173 (dev) or your deployed URL
2. Click **Admin Panel**
3. Click **Analytics & Penjualan** in sidebar
4. ✅ Charts should load (initially showing 0 data)

---

## 📊 Dashboard Features (After SQL Setup)

| Feature | What It Shows | Updates |
|---------|---------------|---------|
| **Revenue Trend** | Area chart of revenue over time | Real-time ✨ |
| **Distribution** | Pie chart: Premium vs Pharmacy % | Real-time ✨ |
| **Comparison** | Bar chart: side-by-side revenue | Real-time ✨ |
| **Orders** | Horizontal bar: count by type | Real-time ✨ |
| **Stats Cards** | Total revenue, premium, pharmacy | Real-time ✨ |
| **Date Range** | Filter data by 30 or 90 days | Manual |
| **Refresh Button** | Manual refresh icon | Manual |

---

## ✅ Success Criteria

After completing the steps above, you should see:

- ✅ `payment_orders` table exists in Supabase
- ✅ Admin Analytics page loads without errors
- ✅ Charts render (even if showing 0 data)
- ✅ Date range selector works
- ✅ Refresh button works

---

## 🧪 Test with Sample Data (Optional)

If you want to see data, insert test data in Supabase SQL Editor:

```sql
-- Insert sample payment data
INSERT INTO payment_orders (user_id, order_type, amount, payment_status, description, created_at)
VALUES
  ('f1234567-1234-1234-1234-123456789012', 'premium', 299000, 'paid', 'Premium Monthly', now()),
  ('f1234567-1234-1234-1234-123456789012', 'pharmacy', 150000, 'paid', 'Obat Alergy', now()),
  ('f2234567-1234-1234-1234-123456789012', 'premium', 299000, 'paid', 'Premium Monthly', now() - interval '1 day'),
  ('f2234567-1234-1234-1234-123456789012', 'pharmacy', 85000, 'paid', 'Vitamin C', now() - interval '1 day');
```

After inserting, dashboard updates **automatically** (real-time)! ✨

---

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Table doesn't exist"** | Execute SQL in Supabase (Step 3) |
| **"0 data showing"** | Insert test data using sample SQL above |
| **Charts not loading** | Check browser console for errors |
| **Admin access denied** | Verify user has `role = 'admin'` in profiles table |
| **Real-time not updating** | Refresh page or click refresh button |

---

## 📁 Files Modified/Created

```
✅ Created: execute-sql.js (helper script)
✅ Created: ANALYTICS_SETUP_GUIDE.md (full docs)
✅ Created: QUICK_START_ANALYTICS.md (this file)
✅ Updated: src/panel-admin/AdminAnalytics.tsx (component)
✅ Updated: src/panel-admin/AdminLayout.tsx (menu item)
✅ Created: src/routes/admin/analytics.tsx (route)
✅ Created: supabase-payment-orders.sql (database schema)
```

---

## 🚀 Status

| Item | Status |
|------|--------|
| Frontend Build | ✅ Success |
| Component Code | ✅ Ready |
| Route Configuration | ✅ Ready |
| Database Schema | ⏳ **NEEDS EXECUTION** |
| Documentation | ✅ Complete |

### Next Action: Execute the SQL! 👆

---

**Questions?** See full docs in `ANALYTICS_SETUP_GUIDE.md`
