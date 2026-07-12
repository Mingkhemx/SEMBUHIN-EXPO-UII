# 🚀 Real-time Analytics - Quick Start

## Apa yang Sudah Dibuat?

Sistem real-time analytics dashboard yang fully terintegrasi dengan Supabase:

### 📁 Files

1. **`supabase-realtime-analytics.sql`** - SQL script dengan:
   - `analytics_summary` table (real-time)
   - Functions untuk kalkulasi metrics
   - Triggers otomatis
   - 3 Materialized Views

2. **`src/hooks/useAnalyticsRealtime.ts`** - React hook yang:
   - Auto-fetch data saat mount
   - Real-time subscribe ke database
   - Handle loading, error, fallback
   - Support 30/90 hari range

3. **`src/panel-admin/AdminAnalytics.tsx`** - Updated component dengan:
   - Real-time status indicator
   - Error handling
   - Manual refresh
   - Better UX

4. **`REALTIME_ANALYTICS_SETUP.md`** - Full documentation (di file ini lengkap)

---

## ⚡ Quick Setup (5 Menit)

### Step 1: Run SQL Script

```bash
# Copy isi file supabase-realtime-analytics.sql
# Buka Supabase Dashboard → SQL Editor → New Query
# Paste semua kode → Click Run
```

**Atau gunakan Supabase CLI:**
```bash
supabase db push
# (pastikan file di migrations folder)
```

### Step 2: Enable Realtime

Supabase Dashboard → Database → Replication

```
✓ analytics_summary    (toggle ON)
✓ payment_orders       (toggle ON)
```

### Step 3: Verify di React

Buka dashboard, lihat badge "Live" di top-right ✅

---

## 🧪 Test Realtime Works

### Via SQL (Supabase SQL Editor):

```sql
-- Insert test data
INSERT INTO payment_orders (
  user_id, order_type, amount, payment_status, created_at
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'premium',
  299000,
  'paid',
  now()
);

-- Lihat analytics terupdate
SELECT * FROM analytics_summary 
WHERE date = CURRENT_DATE
LIMIT 1;
```

### Di React:
1. Open dashboard
2. Jalankan SQL insert di atas
3. Dashboard auto-update dalam 1-2 detik ✨

---

## 📊 Data Flow

```
payment_orders insert/update
           ↓
    trigger fires
           ↓
refresh_analytics_summary()
           ↓
analytics_summary upsert
           ↓
Supabase broadcast change
           ↓
React subscribe menerima
           ↓
Component re-render ✨
```

---

## 🎯 Use Hook di Component

```typescript
import { useAnalyticsRealtime } from "@/hooks/useAnalyticsRealtime";

export function MyDashboard() {
  const {
    metrics,        // { totalRevenue, premiumRevenue, ... }
    chartData,      // Array untuk chart
    isLoading,      // Boolean
    error,          // Error message atau null
    lastUpdate,     // Date object
    refresh,        // Async function
    isSubscribed,   // Boolean real-time status
  } = useAnalyticsRealtime({
    dateRange: 30,      // 30 atau 90
    autoSubscribe: true // Auto subscribe
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <h1>{metrics.totalRevenue.toLocaleString("id-ID")}</h1>
      <Chart data={chartData} />
      <p>Last update: {lastUpdate?.toLocaleString("id-ID")}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

---

## 📈 What You Get

### Performance
- ✅ Real-time updates (1-2 seconds)
- ✅ Optimized queries dengan indexed tables
- ✅ Materialized views untuk fast analytics
- ✅ Fallback ke payment_orders jika needed

### Features
- ✅ Auto-refresh saat ada perubahan
- ✅ Manual refresh button
- ✅ Live status indicator
- ✅ Error handling & display
- ✅ 30 & 90 hari view
- ✅ Chart data breakdown
- ✅ Last update timestamp

### Security
- ✅ RLS policies (hanya admin bisa lihat)
- ✅ Real-time encryption via Supabase
- ✅ Server-side validation

---

## 🔧 Customization

### 1. Add Custom Metrics

Edit `calculate_daily_analytics()` function di SQL:

```sql
-- Tambah ke RETURNS TABLE
conversion_rate DECIMAL,
avg_premium_value DECIMAL,

-- Tambah ke SELECT
(COUNT(CASE WHEN order_type = 'premium' THEN 1 END)::DECIMAL / COUNT(*)) as conversion_rate,
AVG(CASE WHEN order_type = 'premium' THEN amount END) as avg_premium_value,
```

### 2. Change Update Frequency

Default: update saat ada insert/update payment_orders

Untuk scheduled (e.g., every 1 hour):
```sql
-- Supabase Cron Jobs
SELECT refresh_all_analytics_views();
-- Schedule: 0 * * * * (setiap jam)
```

### 3. Custom Date Range

Edit hook untuk add custom range:
```typescript
type DateRange = 7 | 30 | 60 | 90;

const dateRange = useRef<DateRange>(dateRangeRef.current);
```

---

## ❌ Troubleshooting

### Dashboard tidak update real-time

**Check 1: Realtime enabled?**
```
Supabase → Database → Replication
Analytics_summary: ON ✓
```

**Check 2: RLS tidak block?**
```sql
SELECT * FROM analytics_summary; -- di SQL Editor
-- Jika ada data = RLS OK
```

**Check 3: Browser console error?**
```javascript
// DevTools → Console
// Harusnya ada: "Analytics subscription status: SUBSCRIBED"
```

### Analytics kosong

**Insert test data:**
```sql
INSERT INTO payment_orders (
  user_id, order_type, amount, payment_status
) VALUES (
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1),
  'premium',
  100000,
  'paid'
);
```

**Check payment_orders ada data:**
```sql
SELECT COUNT(*) FROM payment_orders 
WHERE payment_status = 'paid' AND created_at >= NOW() - INTERVAL '30 days';
```

---

## 📚 More Info

Lihat `REALTIME_ANALYTICS_SETUP.md` untuk:
- ✅ Detailed setup guide
- ✅ Monitoring queries
- ✅ Advanced usage
- ✅ Production checklist

---

## 🎉 You're All Set!

Dashboard sudah real-time. Setiap payment order baru akan langsung muncul di chart tanpa perlu refresh manual.

**Test it:**
1. Insert data via SQL
2. Watch dashboard update instantly ✨

---

**Questions?** Check SQL script atau docs untuk detailed explanation setiap component.

