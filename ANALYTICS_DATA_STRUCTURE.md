# 📊 Analytics Data Structure & API Reference

## Database Schema

### Table: `analytics_summary`

Used untuk real-time updates via Supabase subscriptions.

```sql
CREATE TABLE analytics_summary (
  id UUID PRIMARY KEY,
  date DATE UNIQUE,
  total_revenue DECIMAL(15, 2),
  premium_revenue DECIMAL(15, 2),
  pharmacy_revenue DECIMAL(15, 2),
  total_orders INTEGER,
  premium_orders INTEGER,
  pharmacy_orders INTEGER,
  average_order_value DECIMAL(15, 2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Example Row:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2026-07-13",
  "total_revenue": 2500000,
  "premium_revenue": 1500000,
  "pharmacy_revenue": 1000000,
  "total_orders": 25,
  "premium_orders": 15,
  "pharmacy_orders": 10,
  "average_order_value": 100000,
  "created_at": "2026-07-13T08:00:00+07:00",
  "updated_at": "2026-07-13T15:30:45+07:00"
}
```

---

### Table: `payment_orders`

Source table untuk semua transaksi.

```sql
CREATE TABLE payment_orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_type VARCHAR(50) CHECK (order_type IN ('premium', 'pharmacy')),
  amount DECIMAL(15, 2) NOT NULL,
  payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
  midtrans_order_id VARCHAR(255) UNIQUE,
  plan_type VARCHAR(50),
  billing_cycle VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);
```

**Example Rows:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "10000000-0000-0000-0000-000000000001",
    "order_type": "premium",
    "amount": 99000,
    "payment_status": "paid",
    "midtrans_order_id": "MID-2026071300001",
    "plan_type": "premium_monthly",
    "billing_cycle": "monthly",
    "created_at": "2026-07-13T10:30:00+07:00",
    "paid_at": "2026-07-13T10:35:00+07:00"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "user_id": "10000000-0000-0000-0000-000000000002",
    "order_type": "pharmacy",
    "amount": 150000,
    "payment_status": "paid",
    "created_at": "2026-07-13T11:00:00+07:00",
    "paid_at": "2026-07-13T11:05:00+07:00"
  }
]
```

---

## Materialized Views

### View: `mv_analytics_historical` (Last 90 Days)

Query untuk historical data breakdown per hari.

```sql
SELECT 
  date,
  premium_revenue,
  pharmacy_revenue,
  total_revenue,
  premium_orders,
  pharmacy_orders,
  total_orders,
  average_order_value
FROM mv_analytics_historical
WHERE date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY date DESC;
```

**Example Result:**
```json
[
  {
    "date": "2026-07-13",
    "premium_revenue": 1500000,
    "pharmacy_revenue": 1000000,
    "total_revenue": 2500000,
    "premium_orders": 15,
    "pharmacy_orders": 10,
    "total_orders": 25,
    "average_order_value": 100000
  },
  {
    "date": "2026-07-12",
    "premium_revenue": 1200000,
    "pharmacy_revenue": 800000,
    "total_revenue": 2000000,
    "premium_orders": 12,
    "pharmacy_orders": 8,
    "total_orders": 20,
    "average_order_value": 100000
  }
]
```

---

### View: `mv_analytics_monthly`

Monthly aggregation.

```sql
SELECT 
  month,
  premium_revenue,
  pharmacy_revenue,
  total_revenue,
  premium_orders,
  pharmacy_orders,
  total_orders,
  average_order_value
FROM mv_analytics_monthly
ORDER BY month DESC;
```

**Example Result:**
```json
[
  {
    "month": "2026-07-01",
    "premium_revenue": 45000000,
    "pharmacy_revenue": 30000000,
    "total_revenue": 75000000,
    "premium_orders": 450,
    "pharmacy_orders": 300,
    "total_orders": 750,
    "average_order_value": 100000
  }
]
```

---

### View: `mv_analytics_category`

Category performance metrics.

```sql
SELECT 
  category,
  order_count,
  total_revenue,
  average_order_value,
  min_order,
  max_order,
  unique_customers
FROM mv_analytics_category;
```

**Example Result:**
```json
[
  {
    "category": "premium",
    "order_count": 450,
    "total_revenue": 45000000,
    "average_order_value": 100000,
    "min_order": 99000,
    "max_order": 150000,
    "unique_customers": 300
  },
  {
    "category": "pharmacy",
    "order_count": 300,
    "total_revenue": 30000000,
    "average_order_value": 100000,
    "min_order": 25000,
    "max_order": 500000,
    "unique_customers": 250
  }
]
```

---

## React Hook: `useAnalyticsRealtime`

### Input Parameters

```typescript
interface UseAnalyticsRealtimeProps {
  dateRange?: 30 | 90;        // Days to fetch (default: 30)
  autoSubscribe?: boolean;    // Auto-subscribe on mount (default: true)
}
```

### Return Object

```typescript
interface UseAnalyticsRealtimeReturn {
  metrics: {
    totalRevenue: number;
    premiumRevenue: number;
    pharmacyRevenue: number;
    totalOrders: number;
    premiumOrders: number;
    pharmacyOrders: number;
    averageOrderValue: number;
  };
  chartData: Array<{
    date: string;           // "13/07/2026" format
    premium: number;        // Premium revenue
    pharmacy: number;       // Pharmacy revenue
    total: number;          // Total revenue
    premiumOrders: number;  // Premium order count
    pharmacyOrders: number; // Pharmacy order count
  }>;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
  subscribe: () => void;
  unsubscribe: () => Promise<void>;
  isSubscribed: boolean;
}
```

### Example Usage & Output

```typescript
// Component
function Dashboard() {
  const { metrics, chartData, isLoading } = useAnalyticsRealtime({ dateRange: 30 });

  if (isLoading) return <Spinner />;

  console.log("Metrics:", metrics);
  // Output:
  // {
  //   totalRevenue: 2500000,
  //   premiumRevenue: 1500000,
  //   pharmacyRevenue: 1000000,
  //   totalOrders: 25,
  //   premiumOrders: 15,
  //   pharmacyOrders: 10,
  //   averageOrderValue: 100000
  // }

  console.log("Chart Data:", chartData);
  // Output:
  // [
  //   {
  //     date: "13/07/2026",
  //     premium: 1500000,
  //     pharmacy: 1000000,
  //     total: 2500000,
  //     premiumOrders: 15,
  //     pharmacyOrders: 10
  //   },
  //   {
  //     date: "12/07/2026",
  //     premium: 1200000,
  //     pharmacy: 800000,
  //     total: 2000000,
  //     premiumOrders: 12,
  //     pharmacyOrders: 8
  //   }
  // ]
}
```

---

## Supabase Realtime Events

When payment order created/updated:

```json
{
  "type": "postgres_changes",
  "event": "INSERT",
  "schema": "public",
  "table": "payment_orders",
  "record": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "10000000-0000-0000-0000-000000000001",
    "order_type": "premium",
    "amount": 99000,
    "payment_status": "paid",
    "created_at": "2026-07-13T10:30:00+07:00"
  }
}
```

This triggers:
1. `trigger_payment_order_analytics` fires
2. `refresh_analytics_summary()` executes
3. `analytics_summary` row created/updated
4. Supabase broadcasts change to all connected clients
5. React component receives update
6. UI re-renders with new data

---

## Common Queries

### Get Today's Analytics

```sql
SELECT * FROM analytics_summary 
WHERE date = CURRENT_DATE;
```

### Get Last 7 Days

```sql
SELECT * FROM analytics_summary 
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

### Get Monthly Comparison

```sql
SELECT 
  DATE_TRUNC('month', created_at)::DATE as month,
  SUM(amount) as total_revenue,
  COUNT(*) as order_count
FROM payment_orders
WHERE payment_status = 'paid'
GROUP BY month
ORDER BY month DESC;
```

### Get Premium vs Pharmacy Ratio

```sql
SELECT 
  order_type,
  COUNT(*) as order_count,
  SUM(amount) as total_revenue,
  ROUND(COUNT(*)::DECIMAL / SUM(COUNT(*)) OVER () * 100, 2) as percentage
FROM payment_orders
WHERE payment_status = 'paid'
GROUP BY order_type;
```

### Get Top Customers

```sql
SELECT 
  user_id,
  COUNT(*) as order_count,
  SUM(amount) as total_spent,
  AVG(amount) as avg_order_value
FROM payment_orders
WHERE payment_status = 'paid'
GROUP BY user_id
ORDER BY total_spent DESC
LIMIT 10;
```

---

## Data Type Reference

| Field | Type | Format | Example |
|-------|------|--------|---------|
| `id` | UUID | UUID v4 | `550e8400-e29b-41d4-a716-446655440000` |
| `date` | DATE | YYYY-MM-DD | `2026-07-13` |
| `amount` | DECIMAL(15,2) | Currency | `99000.00` |
| `total_revenue` | DECIMAL(15,2) | Currency | `2500000.00` |
| `total_orders` | INTEGER | Number | `25` |
| `payment_status` | VARCHAR | Enum | `paid`, `pending`, `failed`, `cancelled` |
| `order_type` | VARCHAR | Enum | `premium`, `pharmacy` |
| `created_at` | TIMESTAMP | ISO 8601 | `2026-07-13T10:30:00+07:00` |

---

## Performance Notes

### Query Times (Approximate)

| Query | Time | Notes |
|-------|------|-------|
| `analytics_summary` (1 day) | <50ms | Indexed by date |
| `mv_analytics_historical` (90 days) | <100ms | Materialized view |
| `payment_orders` (full scan) | 200-500ms | Depends on data size |
| Real-time subscription | <1-2s latency | Network dependent |

### Index Strategy

```sql
-- Already created by script:
CREATE INDEX idx_analytics_summary_date ON analytics_summary(date);
CREATE INDEX idx_payment_orders_status ON payment_orders(payment_status);
CREATE INDEX idx_payment_orders_created_at ON payment_orders(created_at);
CREATE INDEX idx_payment_orders_type ON payment_orders(order_type);
```

---

## Error Handling

### Common Errors & Solutions

**Error:** RLS policy violation
```
Error: new row violates row-level security policy
```
**Solution:** Ensure user has admin role for viewing analytics

**Error:** Trigger function not found
```
Error: function trigger_payment_order_analytics() does not exist
```
**Solution:** Re-run SQL setup script

**Error:** Realtime subscription failed
```
Error: RealtimeClient - connection timeout
```
**Solution:** Check browser internet, verify Realtime enabled in Supabase

---

## Timestamps & Timezones

All timestamps stored in UTC but displayed in Jakarta timezone (Asia/Jakarta):

```typescript
// React component
const lastUpdate = new Date(row.updated_at);
const formatted = lastUpdate.toLocaleString('id-ID', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});
// Output: "13/07/2026, 15:30"
```

---

## Migration Notes

If adding to existing project:

1. Backup `analytics_summary` table
2. Run migration script
3. Backfill data from `payment_orders`
4. Verify triggers working
5. Monitor for 24 hours

---

**For more details, see REALTIME_ANALYTICS_SETUP.md**

