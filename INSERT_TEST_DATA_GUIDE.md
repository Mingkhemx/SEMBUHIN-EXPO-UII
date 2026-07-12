# 📊 Insert Test Data - Analytics Dashboard

Panduan lengkap untuk menambahkan data test ke dashboard analytics.

---

## 🎯 Langkah-langkah

### Step 1: Buka Supabase SQL Editor

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project: **Sembuhin**
3. Menu: **SQL Editor** → **New Query**

### Step 2: Copy Script Test Data

**File:** `supabase-insert-test-data.sql`

Script ini akan insert 22 transaksi test:
- 12 Premium orders (varying amounts)
- 10 Pharmacy orders (varying amounts)
- Spread across last 7 days (realistic data)

### Step 3: Paste & Run

1. Copy seluruh isi file `supabase-insert-test-data.sql`
2. Paste ke SQL Editor
3. Click **Run** (tombol biru di top-right)
4. ⏱️ Tunggu ~5 detik untuk complete

### Step 4: Verify Data Inserted

Setelah script selesai, akan keluar hasil query:

```
Count: 22
```

Ini berarti 22 transaksi berhasil di-insert ✅

---

## 📈 Expected Results

Setelah insert, dashboard akan menunjukkan:

### Total Revenue: ~Rp 5,950,000
```
Premium:  Rp 2,680,000  (12 orders)
Pharmacy: Rp 3,270,000  (10 orders)
```

### Order Counts:
- Total: 22 orders
- Premium: 12 orders (54%)
- Pharmacy: 10 orders (46%)

### Average Order Value: ~Rp 270,000

### Charts akan menampilkan:
- ✅ 7-day breakdown (one bar per day)
- ✅ Pie chart 54% Premium, 46% Pharmacy
- ✅ Bar comparison Premium vs Pharmacy
- ✅ All metrics updated

---

## 🔄 Real-time Verification

Setelah insert:

1. **Check Analytics Summary Table**
   ```sql
   SELECT * FROM analytics_summary 
   WHERE date >= CURRENT_DATE - INTERVAL '7 days'
   ORDER BY date DESC;
   ```

2. **Lihat di Dashboard**
   - Dashboard harus auto-update dalam 1-2 detik
   - Jika tidak, click **Refresh** button

3. **Check Trigger Execution**
   - Lihat `updated_at` timestamp di `analytics_summary`
   - Harusnya sama dengan waktu insert

---

## 📝 Data Distribution (7 Days)

| Day | Premium | Pharmacy | Total | Revenue |
|-----|---------|----------|-------|---------|
| -6  | 2 | 2 | 4 | Rp 824,000 |
| -5  | 1 | 2 | 3 | Rp 449,000 |
| -4  | 3 | 2 | 5 | Rp 1,277,000 |
| -3  | 1 | 1 | 2 | Rp 224,000 |
| -2  | 3 | 1 | 4 | Rp 595,000 |
| -1  | 1 | 1 | 2 | Rp 194,000 |
| 0   | 1 | 2 | 3 | Rp 748,000 |

---

## ✅ Checklist After Insert

- [ ] Script executed tanpa error
- [ ] Count shows 22 orders
- [ ] Dashboard tidak lagi menunjukkan Rp 0
- [ ] Badge "Live" masih hijau
- [ ] Charts menampilkan data
- [ ] 7-day breakdown terlihat
- [ ] Premium vs Pharmacy breakdown visible
- [ ] All metrics updated

---

## 🆘 Troubleshooting

### Q: Script error "table 'payment_orders' does not exist"
**A:** Run `supabase-realtime-analytics.sql` terlebih dahulu

### Q: Script error "no rows with DISTINCT/LIMIT"
**A:** Database belum ada users. Insert dummy user terlebih dahulu atau gunakan existing user IDs

### Q: Dashboard masih menunjukkan Rp 0 setelah insert
**A:** 
1. Click Refresh button di dashboard
2. Tunggu 2-3 detik untuk realtime update
3. Verify di SQL: `SELECT * FROM analytics_summary;`

### Q: Metrics tidak match dengan data yang di-insert
**A:**
1. Check: hanya "paid" status yang di-count
2. Verify: `SELECT * FROM payment_orders WHERE payment_status = 'paid';`
3. Check trigger: `SELECT * FROM analytics_summary;`

---

## 💡 Tips

1. **Test Realtime Update**
   - Insert 1 order baru via SQL Editor
   - Lihat dashboard auto-update dalam 1-2 detik
   - Ini membuktikan real-time working! ✨

2. **Generate More Data**
   - Copy script ini dan modify dates
   - Insert lebih banyak data untuk testing performa

3. **Monitor Trigger**
   - Open SQL Editor
   - Query: `SELECT * FROM analytics_summary ORDER BY updated_at DESC LIMIT 1;`
   - Lihat timestamp berubah setelah insert

---

## 📊 Sample Manual Insert (untuk testing)

Jika ingin insert 1 order untuk test realtime:

```sql
-- Insert single premium order
INSERT INTO payment_orders (
  user_id,
  order_type,
  amount,
  payment_status,
  plan_type,
  billing_cycle,
  description,
  created_at,
  updated_at,
  paid_at
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'premium',
  99000,
  'paid',
  'premium_monthly',
  'monthly',
  'Test Premium Order',
  now(),
  now(),
  now()
);

-- Verify insert
SELECT * FROM payment_orders ORDER BY created_at DESC LIMIT 1;

-- Check analytics updated
SELECT * FROM analytics_summary WHERE date = CURRENT_DATE;
```

Setelah insert, dashboard harus update dalam 1-2 detik! ✨

---

## 🚀 Next Steps

1. ✅ Insert test data
2. ✅ Verify dashboard menampilkan data
3. ✅ Test realtime dengan manual insert
4. ✅ Test date range filter (30/90 hari)
5. ✅ Monitor untuk 24 jam
6. ✅ Deploy ke production

---

**Status:** Ready to use ✅

Selamat! Dashboard analytics sudah siap dengan data test.

