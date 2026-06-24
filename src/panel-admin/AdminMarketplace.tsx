/**
 * AdminMarketplace — Manajemen produk apotek, stok, dan pesanan
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Edit,
  Trash2,
  X,
  Plus,
} from "lucide-react";
import { AdminLayout, AdminStatCard, StatusBadge } from "@/panel-admin/AdminLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: "tersedia" | "habis";
};

type Order = {
  id: string;
  patient: string;
  product: string;
  total: string;
  status: string;
  date: string;
};

type Tab = "products" | "orders" | "low-stock";

// ─── Mock data ────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Obat",
    price: "Rp 8.500",
    stock: 500,
    status: "tersedia",
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    category: "Antibiotik",
    price: "Rp 12.000",
    stock: 300,
    status: "tersedia",
  },
  {
    id: 3,
    name: "Vitamin C 1000mg",
    category: "Suplemen",
    price: "Rp 25.000",
    stock: 150,
    status: "tersedia",
  },
  {
    id: 4,
    name: "Masker N95",
    category: "Alat Kesehatan",
    price: "Rp 35.000",
    stock: 8,
    status: "habis",
  },
  {
    id: 5,
    name: "Hand Sanitizer 500ml",
    category: "Kebersihan",
    price: "Rp 18.000",
    stock: 200,
    status: "tersedia",
  },
  {
    id: 6,
    name: "Tensimeter Digital",
    category: "Alat Kesehatan",
    price: "Rp 285.000",
    stock: 45,
    status: "tersedia",
  },
  {
    id: 7,
    name: "Omeprazole 20mg",
    category: "Obat",
    price: "Rp 15.000",
    stock: 5,
    status: "habis",
  },
  {
    id: 8,
    name: "Minyak Kayu Putih",
    category: "Herbal",
    price: "Rp 22.000",
    stock: 120,
    status: "tersedia",
  },
];

const ORDERS: Order[] = [
  {
    id: "#ORD-001",
    patient: "Anisa Rahma",
    product: "Paracetamol x2",
    total: "Rp 17.000",
    status: "Diproses",
    date: "Hari ini",
  },
  {
    id: "#ORD-002",
    patient: "Budi Santoso",
    product: "Vitamin C x3",
    total: "Rp 75.000",
    status: "Dikirim",
    date: "Hari ini",
  },
  {
    id: "#ORD-003",
    patient: "Citra Dewi",
    product: "Amoxicillin x1",
    total: "Rp 12.000",
    status: "Selesai",
    date: "Kemarin",
  },
  {
    id: "#ORD-004",
    patient: "Dimas Pratama",
    product: "Tensimeter Digital",
    total: "Rp 285.000",
    status: "Diproses",
    date: "Kemarin",
  },
  {
    id: "#ORD-005",
    patient: "Eka Putri",
    product: "Masker N95 x5",
    total: "Rp 175.000",
    status: "Menunggu",
    date: "20 Jun",
  },
];

const CATEGORIES = ["Obat", "Antibiotik", "Suplemen", "Alat Kesehatan", "Kebersihan", "Herbal"];

// ─── Order status badge ───────────────────────────────────────────────────────

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Diproses: "bg-sky-50 text-sky-700 border-sky-200",
    Dikirim: "bg-violet-50 text-violet-700 border-violet-200",
    Selesai: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Menunggu: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const cls = map[status] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      {status}
    </span>
  );
}

// ─── Shared table header cell ─────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-5 py-3 text-slate-500 text-xs uppercase font-semibold">
      {children}
    </th>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminMarketplace() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [showAddModal, setShowAddModal] = useState(false);

  // Add modal form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");

  const lowStockProducts = PRODUCTS.filter((p) => p.stock < 10);

  const tabs: { id: Tab; label: string }[] = [
    { id: "products", label: "Semua Produk" },
    { id: "orders", label: "Pesanan" },
    { id: "low-stock", label: "Stok Menipis" },
  ];

  const inputCls =
    "w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-colors";

  function handleAddProduct() {
    // Reset form & close
    setNewName("");
    setNewCategory(CATEGORIES[0]);
    setNewPrice("");
    setNewStock("");
    setShowAddModal(false);
  }

  return (
    <AdminLayout
      title="Marketplace"
      subtitle="Kelola produk apotek, stok, dan pesanan"
      headerAction={
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </button>
      }
    >
      <div className="space-y-6">
        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <AdminStatCard
            label="Total Produk"
            value="342"
            change="5.2%"
            positive
            icon={<Package className="h-5 w-5 text-violet-600" />}
            color="bg-violet-50 text-violet-600"
          />
          <AdminStatCard
            label="Pesanan Hari Ini"
            value="87"
            change="12%"
            positive
            icon={<ShoppingCart className="h-5 w-5 text-sky-600" />}
            color="bg-sky-50 text-sky-600"
          />
          <AdminStatCard
            label="Pendapatan Bulan Ini"
            value="Rp 24.8Jt"
            change="8.1%"
            positive
            icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
            color="bg-emerald-50 text-emerald-600"
          />
          <AdminStatCard
            label="Stok Menipis"
            value="12"
            change="2 item"
            positive={false}
            icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
            color="bg-amber-50 text-amber-600"
          />
        </div>

        {/* ── Tabs + Table card ─────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors border-b-2 -mb-px",
                  activeTab === tab.id
                    ? "text-sky-600 border-sky-500 bg-sky-50"
                    : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {tab.label}
                {tab.id === "low-stock" && lowStockProducts.length > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold leading-none">
                    {lowStockProducts.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Semua Produk ──────────────────────────────────────── */}
          {activeTab === "products" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <Th>Produk</Th>
                    <Th>Kategori</Th>
                    <Th>Harga</Th>
                    <Th>Stok</Th>
                    <Th>Status</Th>
                    <Th>Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-50 to-violet-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                            <Package className="h-4 w-4 text-slate-400" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-600">{product.category}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-slate-900">
                          {product.price}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={[
                            "text-sm font-semibold",
                            product.stock < 10 ? "text-rose-600" : "text-slate-900",
                          ].join(" ")}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1.5 rounded-lg transition-colors">
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pesanan ───────────────────────────────────────────── */}
          {activeTab === "orders" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <Th>ID Order</Th>
                    <Th>Nama Pasien</Th>
                    <Th>Produk</Th>
                    <Th>Total</Th>
                    <Th>Status</Th>
                    <Th>Tanggal</Th>
                    <Th>Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {ORDERS.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold text-sky-600">{order.id}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-slate-900">
                          {order.patient}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-600">{order.product}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-slate-900">{order.total}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-500">{order.date}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors">
                          Detail
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Stok Menipis ──────────────────────────────────────── */}
          {activeTab === "low-stock" && (
            <div className="overflow-x-auto">
              {lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Package className="h-10 w-10 mb-3" />
                  <p className="text-sm font-medium">Semua stok tersedia dengan baik</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <Th>Produk</Th>
                      <Th>Kategori</Th>
                      <Th>Harga</Th>
                      <Th>Sisa Stok</Th>
                      <Th>Status</Th>
                      <Th>Aksi</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-slate-100 bg-amber-50/60 hover:bg-amber-50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-slate-600">{product.category}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-semibold text-slate-900">
                            {product.price}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-bold text-rose-600">
                            {product.stock} tersisa
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={product.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <button className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1.5 rounded-lg transition-colors">
                            <Edit className="h-3.5 w-3.5" />
                            Restock
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Tambah Produk ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setShowAddModal(false)}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
            >
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-slate-900">Tambah Produk Baru</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nama Produk
                    </label>
                    <input
                      className={inputCls}
                      placeholder="Masukkan nama produk..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Kategori
                    </label>
                    <select
                      className={inputCls}
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Harga (Rp)
                      </label>
                      <input
                        type="number"
                        min={0}
                        className={inputCls}
                        placeholder="0"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Stok
                      </label>
                      <input
                        type="number"
                        min={0}
                        className={inputCls}
                        placeholder="0"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Batalkan
                  </button>
                  <button
                    onClick={handleAddProduct}
                    className="text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    Simpan Produk
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
