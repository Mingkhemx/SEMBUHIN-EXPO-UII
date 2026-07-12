# 🔍 Diagnostic: Find the Real payment_orders Structure

## Problem
Dashboard analytics menampilkan error karena mismatch antara struktur table yang di-expect vs yang sebenarnya ada.

## Solution
Mari kita diagnose struktur yang sebenarnya ada di database.

---

## STEP 1: Run Diagnostic Script

**File:** `supabase-ultra-simple.sql`

1. Buka Supabase SQL Editor → New Query
2. Copy seluruh `supabase-ultra-simple.sql`
3. Paste & **Run**

**Ini akan menampilkan:**
- ✅ Apakah payment_orders table exist
- ✅ List SEMUA columns yang ada
- ✅ Tipe data setiap column
- ✅ Sample data (5 rows pertama)
- ✅ Total rows di table

---

## STEP 2: Screenshot & Share Output

Hasil dari Step 1 akan menunjukkan struktur sebenarnya. Contoh output bisa terlihat seperti:

```
Columns yang ada:
├─ id (UUID)
├─ user_id (UUID)
├─ amount (numeric)
├─ created_at (timestamp)
├─ updated_at (timestamp)
└─ ... (other columns)
```

---

## STEP 3: Try Universal Insert

**File:** `supabase-universal-insert.sql`

1. Buka SQL Editor → New Query
2. Copy `supabase-universal-insert.sql`
3. Paste & Run

**Output:**
- Jika success: "Insert SUCCESS ✓"
- Jika error: Akan keluar pesan error yang spesifik

Pesan error akan memberi tahu kolom mana yang missing/salah.

---

## STEP 4: Report Back

Setelah run diagnostic scripts, share:
1. Screenshot output dari `supabase-ultra-simple.sql`
2. Error message dari `supabase-universal-insert.sql` (jika ada)

Dengan informasi itu, saya bisa buat script yang exactly sesuai dengan struktur database Anda.

---

## Quick Example

### Jika output dari ultra-simple adalah:
```
payment_orders columns:
- id (uuid)
- user_id (uuid)  
- amount (numeric)
- created_at (timestamp with time zone)
```

### Maka insert-nya harus:
```sql
INSERT INTO payment_orders (user_id, amount, created_at)
VALUES (uuid_value, 99000, now());
```

### Bukan:
```sql
INSERT INTO payment_orders (user_id, amount, payment_status, order_type, ...)
-- Error! payment_status tidak exist!
```

---

## Next Action

1. **Run:** `supabase-ultra-simple.sql` 
2. **Screenshot:** Output columns
3. **Run:** `supabase-universal-insert.sql`
4. **Share:** Error (jika ada) atau success message

Dengan itu, analytics dashboard bisa di-config dengan benar! ✅

