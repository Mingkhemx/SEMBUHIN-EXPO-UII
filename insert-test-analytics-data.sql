-- Insert test data untuk analytics
-- Cara Pakai: Copy-paste ke SQL Editor di Supabase Dashboard

-- Insert test data membership (30 hari terakhir)
INSERT INTO payment_orders (order_id, user_id, amount, status, order_type, created_at) VALUES
('SMBH-MEM-001', 'user-001', 49000, 'paid', 'membership', NOW() - INTERVAL '1 day'),
('SMBH-MEM-002', 'user-002', 49000, 'paid', 'membership', NOW() - INTERVAL '2 days'),
('SMBH-MEM-003', 'user-003', 49000, 'paid', 'membership', NOW() - INTERVAL '3 days'),
('SMBH-MEM-004', 'user-004', 49000, 'paid', 'membership', NOW() - INTERVAL '5 days'),
('SMBH-MEM-005', 'user-005', 49000, 'paid', 'membership', NOW() - INTERVAL '7 days'),
('SMBH-MEM-006', 'user-006', 49000, 'paid', 'membership', NOW() - INTERVAL '10 days'),
('SMBH-MEM-007', 'user-007', 49000, 'paid', 'membership', NOW() - INTERVAL '12 days'),
('SMBH-MEM-008', 'user-008', 49000, 'paid', 'membership', NOW() - INTERVAL '15 days'),
('SMBH-MEM-009', 'user-009', 49000, 'paid', 'membership', NOW() - INTERVAL '18 days'),
('SMBH-MEM-010', 'user-010', 49000, 'paid', 'membership', NOW() - INTERVAL '20 days'),
('SMBH-MEM-011', 'user-011', 49000, 'paid', 'membership', NOW() - INTERVAL '22 days'),
('SMBH-MEM-012', 'user-012', 49000, 'paid', 'membership', NOW() - INTERVAL '25 days'),
('SMBH-MEM-013', 'user-013', 49000, 'paid', 'membership', NOW() - INTERVAL '28 days');

-- Insert test data pharmacy (30 hari terakhir)
INSERT INTO payment_orders (order_id, user_id, amount, status, order_type, created_at) VALUES
('SMBH-PHARM-001', 'user-014', 75000, 'paid', 'pharmacy', NOW() - INTERVAL '1 day'),
('SMBH-PHARM-002', 'user-015', 120000, 'paid', 'pharmacy', NOW() - INTERVAL '2 days'),
('SMBH-PHARM-003', 'user-016', 85000, 'paid', 'pharmacy', NOW() - INTERVAL '4 days'),
('SMBH-PHARM-004', 'user-017', 95000, 'paid', 'pharmacy', NOW() - INTERVAL '6 days'),
('SMBH-PHARM-005', 'user-018', 150000, 'paid', 'pharmacy', NOW() - INTERVAL '8 days'),
('SMBH-PHARM-006', 'user-019', 65000, 'paid', 'pharmacy', NOW() - INTERVAL '11 days'),
('SMBH-PHARM-007', 'user-020', 110000, 'paid', 'pharmacy', NOW() - INTERVAL '14 days'),
('SMBH-PHARM-008', 'user-021', 78000, 'paid', 'pharmacy', NOW() - INTERVAL '17 days'),
('SMBH-PHARM-009', 'user-022', 135000, 'paid', 'pharmacy', NOW() - INTERVAL '21 days'),
('SMBH-PHARM-010', 'user-023', 89000, 'paid', 'pharmacy', NOW() - INTERVAL '24 days'),
('SMBH-PHARM-011', 'user-024', 145000, 'paid', 'pharmacy', NOW() - INTERVAL '27 days'),
('SMBH-PHARM-012', 'user-025', 92000, 'paid', 'pharmacy', NOW() - INTERVAL '29 days');

-- Selesai! 🎉
-- Sekarang analytics akan menampilkan data test ini
