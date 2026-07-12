# ✅ Analytics Dashboard - Setup Checklist

## 🎯 Pre-Setup Verification (Already Done)

- [x] Frontend components built and tested
- [x] TypeScript compilation successful
- [x] React component with all chart types implemented
- [x] Admin menu item added
- [x] Route configured at `/admin/analytics`
- [x] Real-time Supabase subscriptions configured
- [x] RLS security policies defined
- [x] Database schema file created
- [x] Helper scripts created
- [x] Full documentation written
- [x] Application builds successfully (0 errors)

---

## 🔴 CRITICAL: What You MUST Do Now

### Step 1: Generate SQL ⏱️ (30 seconds)
```bash
cd ~/Documents/Sembuhin
node execute-sql.js supabase-payment-orders.sql
```
✅ **Expected Output**: Full SQL schema file displayed  
🔍 **Tip**: Copy this entire output to clipboard

---

### Step 2: Open Supabase Dashboard ⏱️ (1 minute)
```
1. Open browser
2. Go to: https://app.supabase.com
3. Select "Sembuhin" project
4. Wait for dashboard to load
```

✅ **Expected**: Supabase project dashboard opens  
🔍 **Tip**: Make sure you're in the RIGHT project (Sembuhin)

---

### Step 3: Open SQL Editor ⏱️ (30 seconds)
```
1. In left sidebar, find "SQL Editor" section
2. Click "SQL Editor"
3. Click "New Query" button (blue button)
4. Empty SQL editor opens
```

✅ **Expected**: Blank SQL editor window  
🔍 **Tip**: You should see query number assigned (e.g., "Query #1")

---

### Step 4: Paste & Execute SQL ⏱️ (1 minute)
```
1. Focus in the SQL editor text area
2. Press Ctrl+A (Select All)
3. Press Ctrl+V (Paste the SQL from Step 1)
4. Visual check: SQL should be syntax-highlighted
5. Press Ctrl+Enter OR click blue "Run" button
6. Watch for success notification
```

✅ **Expected**: Green checkmark ✓ and "Success" message  
❌ **NOT Expected**: Red X or error message  
🔍 **Tip**: Scroll down for success message at bottom

---

### Step 5: Verify Table Created ⏱️ (1 minute)
```
1. In left sidebar, click "Tables"
2. Look for "payment_orders" in the list
3. Click on it to expand
4. Verify these columns exist:
   - id (UUID)
   - user_id (UUID)
   - order_type (text)
   - amount (numeric)
   - payment_status (text)
   - created_at (timestamp)
   - updated_at (timestamp)
```

✅ **Expected**: Table exists with all columns  
❌ **NOT Expected**: Table not in list or missing columns  
🔍 **Tip**: Columns should be visible when you expand the table

---

### Step 6: Test Analytics Page ⏱️ (2 minutes)
```
1. Go to your application: http://localhost:5173 (dev)
2. Click "Admin Panel" or go to /admin
3. In sidebar, click "Analytics & Penjualan"
4. Wait for page to load
5. Verify:
   - 4 stat cards visible (showing Rp 0)
   - 5 charts visible (Area, Pie, Bar charts)
   - Date range selector (30/90 buttons) works
   - Refresh button visible
```

✅ **Expected**: Page loads with all charts (even if data is 0)  
❌ **NOT Expected**: Errors in console or missing charts  
🔍 **Tip**: Open browser DevTools (F12) to check console for errors

---

## 📋 Optional: Insert Test Data ⏱️ (2 minutes)

If you want to see the dashboard with actual data:

```
1. Go back to Supabase SQL Editor
2. Click "New Query"
3. Paste this SQL:
```

```sql
-- Insert sample payment data
INSERT INTO payment_orders (
  user_id, 
  order_type, 
  amount, 
  payment_status, 
  description, 
  created_at
) VALUES
  ('f1234567-1234-1234-1234-123456789012', 'premium', 299000, 'paid', 'Premium Monthly', now()),
  ('f1234567-1234-1234-1234-123456789012', 'pharmacy', 150000, 'paid', 'Obat Alergy', now()),
  ('f2234567-1234-1234-1234-123456789012', 'premium', 299000, 'paid', 'Premium Monthly', now() - interval '1 day'),
  ('f2234567-1234-1234-1234-123456789012', 'pharmacy', 85000, 'paid', 'Vitamin C', now() - interval '1 day'),
  ('f3234567-1234-1234-1234-123456789012', 'pharmacy', 225000, 'paid', 'Vitamin Package', now() - interval '2 days');
```

```
4. Click Run
5. Go back to Analytics page
6. Dashboard updates automatically! ✨
```

---

## 🧪 Quick Test Checklist

After completing all steps above:

- [ ] ✅ SQL executed successfully in Supabase
- [ ] ✅ `payment_orders` table visible in Supabase Tables
- [ ] ✅ Analytics page loads without errors
- [ ] ✅ All 4 stat cards display (showing values)
- [ ] ✅ All 5 charts render properly
- [ ] ✅ Date range buttons work (30/90 days)
- [ ] ✅ Refresh button works (no console errors)
- [ ] ✅ (Optional) Test data inserted and charts updated

---

## 🐛 Troubleshooting

### Problem: "Relation 'payment_orders' does not exist"
**Solution**:
- [ ] Did you actually click Run in Supabase?
- [ ] Did you see the green success notification?
- [ ] Try refreshing Supabase Tables view
- [ ] Re-execute the SQL if still missing

### Problem: "Permission denied" when inserting data
**Solution**:
- [ ] Check that your user exists in `auth.users`
- [ ] Verify user record exists in `profiles` table
- [ ] Check user has `role = 'admin'` in profiles
- [ ] Try inserting data as service role (if you have service key)

### Problem: Charts show "0" even after inserting data
**Solution**:
- [ ] Make sure you inserted data with `payment_status = 'paid'`
- [ ] The dashboard only counts PAID orders
- [ ] Try clicking the refresh button
- [ ] Check date range (is your data within 30 days?)
- [ ] Open browser DevTools console to check for errors

### Problem: Real-time updates not working
**Solution**:
- [ ] Check browser DevTools console (F12)
- [ ] Verify Supabase real-time is enabled in project
- [ ] Try clicking the refresh button manually
- [ ] Check network tab for WebSocket connection
- [ ] Verify table subscription is active in component

### Problem: Admin access denied
**Solution**:
- [ ] Login with admin account
- [ ] Check user's `role` in `profiles` table
- [ ] Make sure `role = 'admin'` exactly (lowercase)
- [ ] Try logging out and back in

---

## ✨ Expected End State

After completing all steps, you should have:

✅ **Database**: `payment_orders` table fully created  
✅ **Frontend**: Analytics page accessible at `/admin/analytics`  
✅ **Functionality**: Real-time charts showing business data  
✅ **Security**: RLS policies protecting data  
✅ **Documentation**: Full setup guides available  
✅ **Testing**: Ready to track premium and pharmacy sales  

---

## 📊 What's Inside the Analytics Dashboard

| Component | Details |
|-----------|---------|
| **Stat Cards** | 4 cards showing total revenue, premium, pharmacy, and order count |
| **Area Chart** | Revenue trend over time (stacked premium + pharmacy) |
| **Pie Chart** | Distribution percentage (premium vs pharmacy) |
| **Bar Charts** | Revenue comparison and order count breakdown |
| **KPI Cards** | Average order value, percentages, order count |
| **Controls** | 30/90 day range selector, manual refresh, last update time |
| **Real-time** | Automatic updates when data changes in database |

---

## 🎓 Key Concepts

| Term | Explanation |
|------|------------|
| **RLS** | Row Level Security - controls who can see which data |
| **Trigger** | Automatically updates `updated_at` when records change |
| **Index** | Database performance optimization for faster queries |
| **Real-time** | WebSocket subscription that pushes updates to frontend |
| **Supabase** | PostgreSQL database with built-in auth and real-time |

---

## ⏰ Total Time Required

- Setup SQL: **5 minutes**
- Test Dashboard: **2 minutes**
- Insert Test Data (Optional): **2 minutes**
- **Total**: **~10 minutes** ✨

---

## 🚀 Go Live Checklist

When you're ready to go live:

- [ ] ✅ SQL executed in Supabase (production)
- [ ] ✅ Verified table exists with data
- [ ] ✅ Real-time subscriptions working
- [ ] ✅ RLS policies verified
- [ ] ✅ Admin access working correctly
- [ ] ✅ Charts displaying properly
- [ ] ✅ No console errors
- [ ] ✅ Performance acceptable
- [ ] ✅ Data privacy verified

---

## 📞 Need Help?

1. **Quick Reference**: `QUICK_START_ANALYTICS.md`
2. **Full Guide**: `ANALYTICS_SETUP_GUIDE.md`
3. **Status Report**: `ANALYTICS_STATUS.md`
4. **Helper Script**: `node execute-sql.js supabase-payment-orders.sql`

---

**Start Time**: Now ⏱️  
**Expected Completion**: 10 minutes ✨  
**Next Step**: Execute the SQL in Supabase! 👆
