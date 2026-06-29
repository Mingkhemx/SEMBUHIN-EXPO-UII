/**
 * AdminMarketplace — Manajemen produk apotek, stok, dan pesanan (Connected to Supabase Realtime)
 */

import { useState, useEffect } from "react";
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
  Loader2,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { AdminLayout, AdminStatCard, StatusBadge } from "@/panel-admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "tersedia" | "habis";
  emoji?: string;
  image_url?: string;
  description?: string;
};

type Order = {
  id: string;
  patient_name: string;
  items: any[];
  total_amount: number;
  status: string;
  created_at: string;
};

type Tab = "products" | "orders" | "low-stock";

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

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("text-left px-5 py-3 text-slate-500 text-xs uppercase font-semibold", className)}>
      {children}
    </th>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminMarketplace() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Obat");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newEmoji, setNewEmoji] = useState("💊");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const CATEGORIES = ["Obat", "Antibiotik", "Suplemen", "Alat Kesehatan", "Kebersihan", "Herbal", "Vitamin", "Demam", "Lambung", "Alergi", "Higienis"];

  useEffect(() => {
    if (editingProduct) {
      setNewName(editingProduct.name);
      setNewCategory(editingProduct.category);
      setNewPrice(editingProduct.price.toString());
      setNewStock(editingProduct.stock.toString());
      setNewEmoji(editingProduct.emoji || "💊");
      setNewDescription(editingProduct.description || "");
      setImagePreview(editingProduct.image_url || "");
      setNewImage(null);
    } else {
      setNewName("");
      setNewCategory("Obat");
      setNewPrice("");
      setNewStock("");
      setNewEmoji("💊");
      setNewDescription("");
      setImagePreview("");
      setNewImage(null);
    }
  }, [editingProduct]);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes
    const productSub = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    const orderSub = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productSub);
      supabase.removeChannel(orderSub);
    };
  }, []);

  async function fetchData() {
    setIsLoading(true);
    await Promise.all([fetchProducts(), fetchOrders()]);
    setIsLoading(false);
  }

  async function fetchProducts() {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
  }

  async function fetchOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data) setOrders(data);
  }

  const lowStockProducts = products.filter((p) => p.stock < 10);

  const tabs: { id: Tab; label: string }[] = [
    { id: "products", label: "Semua Produk" },
    { id: "orders", label: "Pesanan" },
    { id: "low-stock", label: "Stok Menipis" },
  ];

  const inputCls =
    "w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-colors";

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('marketplace')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('marketplace')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error.message);
      toast.error('Gagal mengunggah foto: ' + error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const priceValue = parseInt(newPrice);
    const stockValue = parseInt(newStock);

    if (isNaN(priceValue) || isNaN(stockValue)) {
      toast.error("Harga dan Stok harus berupa angka valid");
      setIsSubmitting(false);
      return;
    }

    let imageUrl = editingProduct?.image_url || "";
    if (newImage) {
      const uploadedUrl = await uploadImage(newImage);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }
    
    const productData = {
      name: newName,
      category: newCategory,
      price: priceValue,
      stock: stockValue,
      emoji: newEmoji,
      image_url: imageUrl,
      description: newDescription,
      status: stockValue > 0 ? "tersedia" : "habis"
    };

    let error;
    if (editingProduct) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert([productData]);
      error = insertError;
    }

    if (error) {
      console.error("Supabase Save Error:", error);
      toast.error(`Gagal ${editingProduct ? 'memperbarui' : 'menambah'} produk: ` + error.message);
    } else {
      toast.success(`Produk berhasil ${editingProduct ? 'diperbarui' : 'ditambahkan'}`);
      setShowAddModal(false);
      setEditingProduct(null);
    }
    setIsSubmitting(false);
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error("Gagal menghapus: " + error.message);
    } else {
      toast.success("Produk dihapus");
    }
  }

  async function handleUpdateOrderStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error("Gagal memperbarui status: " + error.message);
    } else {
      toast.success(`Status pesanan diperbarui ke ${newStatus}`);
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({ ...viewingOrder, status: newStatus });
      }
    }
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
            value={products.length.toString()}
            change="+5.2%"
            positive
            icon={<Package className="h-5 w-5 text-violet-600" />}
            color="bg-violet-50 text-violet-600"
          />
          <AdminStatCard
            label="Pesanan Hari Ini"
            value={orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length.toString()}
            change="+12%"
            positive
            icon={<ShoppingCart className="h-5 w-5 text-sky-600" />}
            color="bg-sky-50 text-sky-600"
          />
          <AdminStatCard
            label="Pendapatan Total"
            value={`Rp ${(orders.reduce((sum, o) => sum + o.total_amount, 0) / 1000000).toFixed(1)}Jt`}
            change="+8.1%"
            positive
            icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
            color="bg-emerald-50 text-emerald-600"
          />
          <AdminStatCard
            label="Stok Menipis"
            value={lowStockProducts.length.toString()}
            change={`${lowStockProducts.length} item`}
            positive={false}
            icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
            color="bg-amber-50 text-amber-600"
          />
        </div>

        {/* ── Tabs + Table card ─────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden min-h-[400px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-sky-600 animate-spin" />
            </div>
          )}

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
                  {products.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-50 to-violet-50 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xl">{product.emoji || <Package className="h-4 w-4 text-slate-400" />}</span>
                            )}
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
                          Rp {product.price.toLocaleString("id-ID")}
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
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {!isLoading && products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 text-sm font-medium">Belum ada produk. Klik "Tambah Produk" untuk memulai.</td>
                    </tr>
                  )}
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
                    <Th>Item</Th>
                    <Th>Total</Th>
                    <Th>Status</Th>
                    <Th>Tanggal</Th>
                    <Th>Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-sky-600 uppercase">#{order.id.slice(0,8)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-slate-900">
                          {order.patient_name || "Guest"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-600">{order.items?.length || 0} items</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-slate-900">Rp {order.total_amount.toLocaleString("id-ID")}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString("id-ID")}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button 
                          onClick={() => setViewingOrder(order)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {!isLoading && orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 text-sm font-medium">Belum ada pesanan masuk.</td>
                    </tr>
                  )}
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
                      <Th className="text-center">Status</Th>
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
                            <div className="h-9 w-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 text-xl">
                              {product.emoji || <AlertTriangle className="h-4 w-4 text-amber-600" />}
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
                            Rp {product.price.toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-bold text-rose-600">
                            {product.stock} tersisa
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <StatusBadge status={product.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
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

      {/* ── Modal Tambah/Edit Produk ──────────────────────────────────────────── */}
      <AnimatePresence>
        {(showAddModal || editingProduct) && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[32px] shadow-2xl z-[60] overflow-hidden"
            >
              <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingProduct ? "Perbarui data obat/alkes" : "Input data obat/alkes secara lengkap"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nama Produk</label>
                    <input
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Masukkan nama obat/alkes..."
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Deskripsi</label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Deskripsi singkat produk..."
                      className={`${inputCls} min-h-[80px] py-2 resize-none`}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Foto Produk</label>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <label className="cursor-pointer p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                <Upload className="h-4 w-4 text-white" />
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                              </label>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full hover:bg-slate-100 transition-colors">
                            <ImageIcon className="h-6 w-6 text-slate-300 mb-1" />
                            <span className="text-[10px] font-bold text-slate-400">UPLOAD</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                          </label>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                            <Loader2 className="h-5 w-5 text-sky-600 animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 mb-2">Gunakan foto berkualitas tinggi (format JPG, PNG). Maksimal 2MB.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kategori</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className={inputCls}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="hidden">
                    {/* Hidden emoji field since it's now a combined input */}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Harga (Rp)</label>
                    <input
                      required
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="Contoh: 15000"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Stok</label>
                    <input
                      required
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      placeholder="Contoh: 100"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="flex-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Simpan Produk"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Modal Detail Pesanan ─────────────────────────────────────────── */}
      <AnimatePresence>
        {viewingOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setViewingOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[32px] shadow-2xl z-[60] overflow-hidden"
            >
              <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Detail Pesanan</h2>
                  <p className="text-xs text-sky-600 font-bold uppercase tracking-widest">#{viewingOrder.id.slice(0, 8)}</p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pasien</p>
                    <p className="font-semibold text-slate-900">{viewingOrder.patient_name || "Guest"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tanggal</p>
                    <p className="font-semibold text-slate-900">{new Date(viewingOrder.created_at).toLocaleString("id-ID")}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Item Pesanan</p>
                  <div className="space-y-3">
                    {viewingOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-2xl">{item.emoji}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.quantity} x Rp {item.price?.toLocaleString("id-ID")}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-900">Rp {(item.quantity * item.price).toLocaleString("id-ID")}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-900">Total Pembayaran</p>
                  <p className="text-xl font-black text-sky-600">Rp {viewingOrder.total_amount.toLocaleString("id-ID")}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["Menunggu", "Diproses", "Dikirim", "Selesai", "Dibatalkan"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateOrderStatus(viewingOrder.id, status)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          viewingOrder.status === status
                            ? "bg-sky-600 text-white shadow-lg shadow-sky-200"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
