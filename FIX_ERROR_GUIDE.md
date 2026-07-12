# 🔧 Fix Error Guide - Analytics Setup

Error yang terjadi: `column "order_type" of relation "payment_orders" does not exist`

---

## 🎯 Solusi

### Step 1: Run Fix Script

**File:** `supabase-fix-payment-orders.sql`

Ini akan:
- ✅ Recreate payment_orders table dengan struktur benar
- ✅ Create analytics_summary table
- ✅ Setup semua functions & triggers
- ✅ Verify setup dengan status checks

**Cara:**
1. Buka Supabase SQL Editor → New Query
2. Copy seluruh `supabase-fix-payment-orders.sql`
3. Paste & Run
4. Tunggu hingga selesai (~10 detik)

**Output yang benar:**
```
check_name             status
─────────────────────────────
Payment Orders Table   EXISTS ✅
Analytics Summary      EXISTS ✅
Order Type Column      EXISTS ✅
Trigger Exists         EXISTS ✅
```

### Step 2: Insert Simple Test Data

**File:** `supabase-insert-simple-data.sql`

Lebih simple dari sebelumnya:
- ✅ 13 test orders (7 premium + 6 pharmacy)
- ✅ Spread across last 7 days
- ✅ Auto-use existing users
- ✅ Includes verification queries

**Cara:**
1. Buka Supabase SQL Editor → New Query
2. Copy seluruh `supabase-insert-simple-data.sql`
3. Paste & Run
4. Tunggu hasil

**Output:**
```
total_orders: 13

order_type  count  total
premium     7      1,073,000
pharmacy    6      1,275,000

status: Setup complete! ✅
```

### Step 3: Verify in Dashboard

1. Refresh dashboard (F5)
2. Metrics should show:
   - Total Pendapatan: Rp 2,348,000 ✅
   - Premium: Rp 1,073,000
   - Pharmacy: Rp 1,275,000
   - Charts populated ✅

---

## ⚠️ Important Notes

### Why This Error Happened?

1. `payment_orders` table structure mungkin berbeda dengan yang expected
2. Column `order_type` tidak exist di table yang sudah dibuat
3. RLS policies atau constraints mungkin corrupt

### What This Fix Does?

1. Drop dan recreate table dengan struktur yang benar
2. Include semua required columns:
   - `id` (UUID PK)
   - `user_id` (FK to auth.users)
   - `order_type` (VARCHAR: premium/pharmacy) ← **PENTING**
   - `amount` (DECIMAL)
   - `payment_status` (VARCHAR: pending/paid/failed/cancelled)
   - Plus other fields

3. Create analytics tables & functions
4. Setup triggers untuk auto-update

### Data Loss Risk?

**Original Script:** `supabase-fix-payment-orders.sql` akan DROP existing table jika corrupt
- ✅ Jika table sudah kosong: tidak masalah
- ⚠️ Jika ada data penting: BACKUP DULU sebelum jalankan

---

## 🔄 Step-by-Step Process

```
1. Run: supabase-fix-payment-orders.sql
   ↓ Creates fresh table structure
   
2. Verify: Check output status (4 lines should show ✅)
   ↓ All tables & columns exist
   
3. Run: supabase-insert-simple-data.sql
   ↓ Insert 13 test orders
   
4. Verify: Check count & breakdown
   ↓ 13 orders, split by type
   
5. Dashboard: Refresh & check metrics
   ↓ Should show Rp 2,348,000+ data
```

---

## 📊 Expected Results After Fix

### Dashboard Metrics:
- ✅ Total Pendapatan: Rp 2,348,000
- ✅ Premium Revenue: Rp 1,073,000
- ✅ Pharmacy Revenue: Rp 1,275,000
- ✅ Total Orders: 13
- ✅ Charts: 7-day breakdown visible
- ✅ Live badge: Green ✅

### Database:
- ✅ payment_orders: 13 rows
- ✅ analytics_summary: 7 rows (one per day)
- ✅ Triggers: Firing correctly
- ✅ RLS: Admin can view all

---

## 🆘 If Still Getting Error

### Error: "relation does not exist"
**Check:** Do the Fix Script output show all ✅?
**Fix:** 
```sql
-- Check what exists
SELECT tablename FROM pg_tables 
WHERE tablename IN ('payment_orders', 'analytics_summary');

-- Check columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'payment_orders';
```

### Error: "violates foreign key constraint"
**Cause:** user_id doesn't exist in auth.users
**Fix:** 
```sql
-- Check if users exist
SELECT COUNT(*) as user_count FROM auth.users;

-- If empty, need to create test user first
-- Contact admin to create user
```

### Error: "violates row level security policy"
**Cause:** RLS policies blocking insert
**Fix:** Temporarily disable RLS:
```sql
ALTER TABLE payment_orders DISABLE ROW LEVEL SECURITY;
-- Run insert
-- Then re-enable:
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
```

---

## 📝 Files Reference

| File | Purpose | Status |
|------|---------|--------|
| supabase-fix-payment-orders.sql | Fix & recreate tables | Run 1st ✅ |
| supabase-insert-simple-data.sql | Insert 13 test orders | Run 2nd ✅ |
| REALTIME_ANALYTICS_SETUP.md | Full documentation | Reference |
| INSERT_TEST_DATA_GUIDE.md | Detailed data insert guide | Reference |

---

## ✅ Verification Checklist

After running both scripts:

- [ ] Fix script ran without errors
- [ ] Output shows 4 status lines with ✅
- [ ] Insert script ran without errors
- [ ] Count output shows: 13 total_orders
- [ ] Breakdown shows: 7 premium, 6 pharmacy
- [ ] Dashboard refreshed
- [ ] Metrics no longer showing Rp 0
- [ ] Charts displaying 7-day data
- [ ] Live badge showing green

---

## 🚀 Next Steps

1. ✅ Run fix script
2. ✅ Run insert script
3. ✅ Refresh dashboard
4. ✅ Test realtime (insert 1 order manually)
5. ✅ Monitor for 24 hours
6. ✅ Deploy to production

---

**Created:** July 2026
**Version:** 1.0
**Status:** Ready to use ✅

Ready? Start with Step 1! 🎯

