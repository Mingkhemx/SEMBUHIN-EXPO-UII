# Real-time Analytics Dashboard Setup Guide

## 📋 Overview

Setup lengkap untuk membuat Analytics Dashboard menjadi real-time menggunakan Supabase dengan:
- ✅ Real-time data updates via PostgreSQL triggers
- ✅ Materialized views untuk performa optimal
- ✅ Analytics summary table untuk query cepat
- ✅ Real-time subscription di React component

---

## 🎯 Step 1: SQL Setup di Supabase Editor

Jalankan SQL script `supabase-realtime-analytics.sql` di Supabase SQL Editor:

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Ke menu **SQL Editor** → **New Query**
4. Copy-paste seluruh isi dari file `supabase-realtime-analytics.sql`
5. Click **Run** untuk execute semua queries

### Yang akan dibuat:

#### 1. **analytics_summary Table** (Realtime)
```sql
-- Table untuk daily summary (updated real-time via trigger)
analytics_summary (
  id UUID PRIMARY KEY
  date DATE UNIQUE
  total_revenue DECIMAL
  premium_revenue DECIMAL
  pharmacy_revenue DECIMAL
  total_orders INTEGER
  premium_orders INTEGER
  pharmacy_orders INTEGER
  average_order_value DECIMAL
  created_at TIMESTAMP
  updated_at TIMESTAMP
)
```

#### 2. **Functions**
- `calculate_daily_analytics(p_date)` - Kalkulasi metrics untuk 1 hari
- `refresh_analytics_summary()` - Update analytics_summary table
- `refresh_all_analytics_views()` - Refresh semua materialized views

#### 3. **Triggers**
- `trigger_payment_order_analytics` - Trigger otomatis saat ada payment order baru/update

#### 4. **Materialized Views** (Opsional tapi recommended)
- `mv_analytics_historical` - 90 hari terakhir breakdown per hari
- `mv_analytics_monthly` - Monthly summary
- `mv_analytics_category` - Category performance

---

## 🔧 Step 2: Konfigurasi Realtime di Supabase

Enable Realtime untuk `analytics_summary` table:

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Ke menu **Database** → **Replication**
3. Cari table `analytics_summary`
4. Pastikan status **Enabled** (toggle ke ON)
5. Juga enable untuk `payment_orders` jika belum

### Screenshot Guide:
```
Database → Replication → Scroll down
┌─────────────────────────────────────┐
│ analytics_summary  [Toggle: ON]  ✅  │
│ payment_orders     [Toggle: ON]  ✅  │
└─────────────────────────────────────┘
```

---

## 🎨 Step 3: React Setup

### File 1: Install/Verify Dependencies

Pastikan di `package.json` sudah ada:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "framer-motion": "^10.16.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.263.0",
    "date-fns": "^2.30.0"
  }
}
```

Jika belum, install:
```bash
npm install @supabase/supabase-js framer-motion recharts lucide-react date-fns
```

### File 2: Hook Real-time (`src/hooks/useAnalyticsRealtime.ts`)

File sudah dibuat dan siap digunakan. Hook ini:
- ✅ Auto-fetch data saat mount
- ✅ Real-time subscribe ke database changes
- ✅ Handle fallback ke payment_orders jika analytics_summary kosong
- ✅ Support 30 dan 90 hari range
- ✅ Return metrics, chartData, loading, error, lastUpdate

**Penggunaan:**
```typescript
const { 
  metrics,        // Current metrics (totalRevenue, premiumRevenue, etc)
  chartData,      // Array data untuk chart
  isLoading,      // Boolean loading state
  error,          // Error message jika ada
  lastUpdate,     // Timestamp update terakhir
  refresh,        // Function untuk manual refresh
  isSubscribed,   // Boolean subscription status
} = useAnalyticsRealtime({ 
  dateRange: 30,      // atau 90
  autoSubscribe: true // Auto subscribe on mount
});
```

### File 3: Component (`src/panel-admin/AdminAnalytics.tsx`)

Component sudah di-update untuk menggunakan hook real-time baru.

**Key Features:**
- ✅ Real-time indicator (Live/Offline badge)
- ✅ Error display jika ada
- ✅ Manual refresh button
- ✅ Auto-update saat ada perubahan di database
- ✅ Show last update time
- ✅ Date range selector (30/90 hari)

---

## 📊 Step 4: Testing

### Test 1: Manual Insert di SQL Editor

Jalankan ini di Supabase SQL Editor untuk trigger analytics update:

```sql
-- Insert test payment order
INSERT INTO payment_orders (
  user_id,
  order_type,
  amount,
  payment_status,
  created_at
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'premium',
  250000,
  'paid',
  now()
);

-- Verify analytics updated
SELECT * FROM analytics_summary 
WHERE date = CURRENT_DATE
ORDER BY updated_at DESC 
LIMIT 1;
```

### Test 2: Realtime in React

1. Buka dashboard di browser
2. Lihat badge "Live" di top-right
3. Insert data via SQL Editor (gunakan query di atas)
4. Dashboard harus auto-update dalam beberapa detik

---

## 🔍 Monitoring & Debugging

### Check Analytics Table Status
```sql
SELECT 
  date,
  total_revenue,
  total_orders,
  average_order_value,
  updated_at
FROM analytics_summary
ORDER BY date DESC
LIMIT 10;
```

### Check Trigger Execution
```sql
-- Lihat berapa kali trigger di-execute
SELECT 
  count(*) as trigger_count,
  max(updated_at) as last_execution
FROM analytics_summary
WHERE date >= CURRENT_DATE - INTERVAL '1 day';
```

### Check Realtime Subscription Status
Buka browser DevTools → Console:
```javascript
// Klik console di dashboard, akan muncul logs seperti:
// "Analytics subscription status: SUBSCRIBED"
// "Payment order change: {...}"
// "Analytics summary change: {...}"
```

---

## 📈 Optimization Tips

### 1. **Refresh Materialized Views (Optional)**

Jika performa query lambat, refresh MV secara berkala:

```bash
# Buat cron job di Supabase untuk refresh setiap jam
# Settings → Cron Jobs → New Cron Job

-- Schedule ini setiap jam
SELECT refresh_all_analytics_views();
```

### 2. **Batch Insert untuk Performa**

Jika ada banyak insert sekaligus, batch lebih cepat:

```sql
-- Lebih baik daripada insert satu-satu
INSERT INTO payment_orders (user_id, order_type, amount, payment_status, created_at)
VALUES 
  (user_id_1, 'premium', 100000, 'paid', now()),
  (user_id_2, 'pharmacy', 50000, 'paid', now()),
  (user_id_3, 'premium', 150000, 'paid', now());
```

### 3. **Disable Realtime saat Testing Performa**

Jika ingin test query performance:
```typescript
const { metrics } = useAnalyticsRealtime({ 
  autoSubscribe: false  // Disable realtime
});

// Manual trigger refresh
await refresh();
```

---

## 🚀 Production Checklist

- [ ] SQL script sudah dijalankan di production database
- [ ] Realtime enabled untuk `analytics_summary` table
- [ ] RLS policies sudah dikonfigurasi (hanya admin bisa lihat)
- [ ] npm dependencies sudah updated
- [ ] React component sudah import hook dengan benar
- [ ] Test manual insert dan verify realtime update
- [ ] Check error handling & fallback logic
- [ ] Monitor dashboard untuk 24 jam pertama
- [ ] Setup backup untuk analytics_summary table

---

## 📚 File References

- **SQL**: `supabase-realtime-analytics.sql`
- **Hook**: `src/hooks/useAnalyticsRealtime.ts`
- **Component**: `src/panel-admin/AdminAnalytics.tsx`

---

## ❓ Troubleshooting

### Q: Dashboard tidak update real-time
**A:** 
1. Check realtime status di Supabase Dashboard → Replication
2. Verify RLS policies allow admin to read
3. Check browser DevTools console untuk errors

### Q: Analytics kosong
**A:**
1. Insert test data via SQL Editor
2. Check payment_orders table ada data dengan `payment_status = 'paid'`
3. Check trigger_payment_order_analytics execute tanpa error

### Q: Query lambat
**A:**
1. Check indexes: `idx_analytics_summary_date` harus exist
2. Refresh materialized views: `SELECT refresh_all_analytics_views();`
3. Check database load di Supabase Dashboard

### Q: Bagaimana jika trigger tidak fire?
**A:**
1. Verify trigger exist: 
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'trigger_payment_order_analytics';
   ```
2. Check function ada error:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'trigger_payment_order_analytics';
   ```

---

## 💡 Advanced Usage

### Custom Hook Options

```typescript
// Fetch setiap 5 menit (manual polling)
useEffect(() => {
  const interval = setInterval(() => {
    refresh();
  }, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);

// Disable realtime, gunakan polling saja
const { metrics } = useAnalyticsRealtime({ 
  autoSubscribe: false 
});
```

### Custom Metrics

Untuk add custom calculation, edit `calculate_daily_analytics` function:

```sql
CREATE OR REPLACE FUNCTION calculate_daily_analytics(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  -- Add custom column
  conversion_rate DECIMAL,
  -- ... existing columns
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Custom calculation
    (COUNT(CASE WHEN order_type = 'premium' THEN 1 END)::DECIMAL / COUNT(*)) as conversion_rate,
    -- ... existing calculations
  FROM payment_orders
  -- ... existing filters
END;
$$ LANGUAGE plpgsql STABLE;
```

---

## 📞 Support

Jika ada issues, check:
1. Supabase documentation: https://supabase.com/docs
2. Realtime docs: https://supabase.com/docs/guides/realtime
3. PostgreSQL triggers: https://www.postgresql.org/docs/current/sql-createtrigger.html

---

**Last Updated**: July 2026
**Status**: ✅ Production Ready

