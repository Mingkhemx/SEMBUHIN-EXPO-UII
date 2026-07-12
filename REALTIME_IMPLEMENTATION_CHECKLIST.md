# ✅ Real-time Analytics Implementation Checklist

## Phase 1: Database Setup (Supabase SQL)

- [ ] **1.1** Open Supabase Dashboard
  - Link: https://app.supabase.com
  - Select your project: `Sembuhin`

- [ ] **1.2** Go to SQL Editor
  - Click: **SQL Editor** → **New Query**

- [ ] **1.3** Copy & Run SQL Script
  - Open: `supabase-realtime-analytics.sql`
  - Copy ALL content
  - Paste in Supabase SQL Editor
  - Click: **Run** (blue button top-right)
  - ⏱️ Wait: ~5-10 seconds

- [ ] **1.4** Verify Tables Created
  ```sql
  -- Run di SQL Editor untuk verify
  SELECT tablename FROM pg_tables 
  WHERE tablename IN ('analytics_summary', 'payment_orders');
  ```
  Should return: `analytics_summary`, `payment_orders` ✅

- [ ] **1.5** Verify Triggers Created
  ```sql
  SELECT trigger_name FROM information_schema.triggers 
  WHERE trigger_name = 'trigger_payment_order_analytics';
  ```
  Should return: `trigger_payment_order_analytics` ✅

---

## Phase 2: Realtime Configuration (Supabase Dashboard)

- [ ] **2.1** Open Replication Settings
  - Menu: **Database** → **Replication**

- [ ] **2.2** Enable Realtime for `analytics_summary`
  - Find row: `analytics_summary`
  - Toggle: **ON** (harus hijau ✅)

- [ ] **2.3** Enable Realtime for `payment_orders`
  - Find row: `payment_orders`
  - Toggle: **ON** (harus hijau ✅)

- [ ] **2.4** Verify RLS Policies
  - Menu: **Authentication** → **Policies**
  - Table: `analytics_summary`
  - Should see:
    - ✅ "Admin can view analytics summary"
  - Table: `payment_orders`
  - Should see:
    - ✅ "Admin can view all orders"
    - ✅ "Admin can update orders"
    - ✅ "Users can view own orders"
    - ✅ "Users can insert own orders"

---

## Phase 3: React Setup (Local Development)

- [ ] **3.1** Verify Dependencies Installed
  ```bash
  npm list @supabase/supabase-js framer-motion recharts lucide-react date-fns
  ```
  
  If missing, install:
  ```bash
  npm install @supabase/supabase-js framer-motion recharts lucide-react date-fns
  ```

- [ ] **3.2** Check Hook File Exists
  - Path: `src/hooks/useAnalyticsRealtime.ts`
  - Should exist ✅
  - Lines: ~300+

- [ ] **3.3** Check Updated Component
  - Path: `src/panel-admin/AdminAnalytics.tsx`
  - Import should have: `import { useAnalyticsRealtime } from "@/hooks/useAnalyticsRealtime";`
  - Should use hook in component ✅

- [ ] **3.4** Restart Dev Server (if running)
  ```bash
  npm run dev
  # Stop: Ctrl+C
  # Restart: npm run dev
  ```

- [ ] **3.5** Open Dashboard in Browser
  - URL: http://localhost:5173/admin/analytics
  - (adjust port if different)

---

## Phase 4: Testing Real-time

### Test 1: Verify Connection

- [ ] **4.1** Check "Live" Badge
  - Top-right corner of dashboard
  - Should show: **Live** badge (green 🟢)
  - If offline: check browser console for errors

- [ ] **4.2** Open Browser Console
  - Press: **F12** → **Console** tab
  - Should see messages:
    ```
    "Analytics subscription status: SUBSCRIBED"
    ```

### Test 2: Insert Test Data

- [ ] **4.3** Open SQL Editor (Supabase Dashboard)
  - Menu: **SQL Editor** → **New Query**

- [ ] **4.4** Run Test Insert
  ```sql
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
  ```
  - Click: **Run**

- [ ] **4.5** Watch Dashboard
  - Within 1-2 seconds, dashboard should update:
    - ✅ Total revenue increased
    - ✅ Total orders increased
    - ✅ Chart data updated
    - ✅ Last update timestamp changed

- [ ] **4.6** Check Browser Console
  - Should show: `"Payment order change: {...}"`
  - Indicates real-time update triggered ✅

### Test 3: Multiple Inserts

- [ ] **4.7** Insert More Test Data
  ```sql
  INSERT INTO payment_orders (
    user_id, order_type, amount, payment_status, created_at
  ) VALUES 
    ((SELECT id FROM auth.users LIMIT 1), 'pharmacy', 150000, 'paid', now()),
    ((SELECT id FROM auth.users LIMIT 1), 'premium', 300000, 'paid', now()),
    ((SELECT id FROM auth.users LIMIT 1), 'pharmacy', 75000, 'paid', now());
  ```

- [ ] **4.8** Verify Batch Update
  - Dashboard should update for each insert
  - All metrics should reflect new data ✅

### Test 4: Date Range Switching

- [ ] **4.9** Click "30 Hari" Button
  - Should reload data for 30 days ✅

- [ ] **4.10** Click "90 Hari" Button
  - Should reload data for 90 days ✅

- [ ] **4.11** Click Refresh Button
  - Should manually refresh all data ✅

---

## Phase 5: Production Deployment

- [ ] **5.1** Review Code Changes
  - ✅ `supabase-realtime-analytics.sql` - SQL script
  - ✅ `src/hooks/useAnalyticsRealtime.ts` - Hook
  - ✅ `src/panel-admin/AdminAnalytics.tsx` - Component

- [ ] **5.2** Run Type Check (TypeScript)
  ```bash
  npm run type-check
  # or
  tsc --noEmit
  ```

- [ ] **5.3** Build Project
  ```bash
  npm run build
  ```
  - Should complete without errors ✅

- [ ] **5.4** Commit to Git
  ```bash
  git add -A
  git commit -m "feat: implement real-time analytics dashboard with Supabase"
  git push
  ```

- [ ] **5.5** Deploy to Production
  - Via your CI/CD pipeline
  - E.g., GitHub Actions, Vercel, Railway, etc.

- [ ] **5.6** Post-Deployment Test
  - Open production dashboard
  - Verify "Live" badge shows ✅
  - Insert test order
  - Verify auto-update works ✅

---

## Phase 6: Monitoring Setup (Optional)

- [ ] **6.1** Setup Supabase Monitoring
  - Menu: **Database** → **Monitoring**
  - Watch: Query performance, realtime connections

- [ ] **6.2** Setup Alerts (Optional)
  ```sql
  -- Create monitoring query for high error rates
  -- Can be added to your monitoring dashboard
  SELECT 
    DATE_TRUNC('minute', created_at) as minute,
    COUNT(*) as error_count
  FROM payment_orders
  WHERE payment_status = 'failed'
  GROUP BY minute
  ORDER BY minute DESC
  LIMIT 10;
  ```

- [ ] **6.3** Setup Analytics Refresh Job (Optional)
  - For heavy traffic, refresh MV periodically
  - Use Supabase Cron (via Edge Functions)

---

## Phase 7: Documentation & Handoff

- [ ] **7.1** Review Documentation
  - ✅ `REALTIME_ANALYTICS_SETUP.md` - Full guide
  - ✅ `REALTIME_ANALYTICS_QUICK_START.md` - Quick reference
  - ✅ `REALTIME_IMPLEMENTATION_CHECKLIST.md` - This file

- [ ] **7.2** Document Troubleshooting
  - Team familiar with debugging process?
  - ✅ Check in `REALTIME_ANALYTICS_SETUP.md` → Troubleshooting

- [ ] **7.3** Create Team Runbook
  - What to do if dashboard stops updating?
  - Escalation path?

- [ ] **7.4** Schedule Team Training
  - Show team how it works
  - How to monitor & debug

---

## ✨ Success Criteria

- [ ] Dashboard loads without errors
- [ ] "Live" badge shows green
- [ ] New orders instantly visible in dashboard
- [ ] All charts update in real-time
- [ ] Date range filtering works
- [ ] Refresh button works
- [ ] Error handling displays properly
- [ ] No console errors

---

## 🚨 Rollback Plan

If something goes wrong:

### Option 1: Database Rollback
```sql
-- Disable triggers temporarily
ALTER TABLE payment_orders 
DISABLE TRIGGER trigger_payment_order_analytics;

-- Or drop if needed
DROP TRIGGER trigger_payment_order_analytics ON payment_orders;
```

### Option 2: Component Rollback
```bash
git revert <commit-hash>
npm run build
# Redeploy
```

### Option 3: Disable Realtime (Temporary)
```typescript
// In component or hook
const { metrics } = useAnalyticsRealtime({ 
  autoSubscribe: false  // Disable real-time
});

// Use manual polling instead
useEffect(() => {
  const interval = setInterval(() => {
    refresh();
  }, 10000); // Every 10 seconds
  return () => clearInterval(interval);
}, [refresh]);
```

---

## 📞 Support Links

- Supabase Docs: https://supabase.com/docs
- Realtime Guide: https://supabase.com/docs/guides/realtime
- PostgreSQL Triggers: https://www.postgresql.org/docs/current/sql-createtrigger.html
- React Hooks: https://react.dev/reference/react/hooks

---

## Notes

**Date**: July 2026
**Status**: Ready for Implementation
**Estimated Time**: 
- Setup: 5 minutes
- Testing: 10 minutes
- Deployment: 15-30 minutes
- **Total: ~1 hour**

---

**Ready? Start with Phase 1!** 🚀

