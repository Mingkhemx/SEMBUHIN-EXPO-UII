import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search, ShoppingCart, Star, Plus, Loader2, X, Minus, Trash2, Filter, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Apotek Digital — Sembuhin" },
      {
        name: "description",
        content: "Marketplace obat resmi BPOM. Pengiriman cepat 1 jam.",
      },
      { property: "og:title", content: "Apotek Digital — Sembuhin" },
      {
        property: "og:description",
        content: "Beli obat resmi BPOM, dikirim dalam 1 jam.",
      },
    ],
  }),
  component: Marketplace,
});

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  emoji: string;
  image_url?: string;
  status: string;
  stock: number;
};

const CATEGORIES = ["Semua", "Obat", "Vitamin", "Suplemen", "Alat Kesehatan", "Kebersihan", "Herbal", "Demam", "Lambung", "Alergi", "Higienis"];

function Marketplace() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");
  const [sortBy, setSortBy] = useState("Terpopuler");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();

    // Subscribe to realtime product changes
    const productSub = supabase
      .channel('public:products:user')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productSub);
    };
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    
    if (!error && data) {
      setProducts(data);
    }
    setIsLoading(false);
  }

  const filtered = useMemo(
    () => {
      let result = products.filter(
        (p) =>
          (cat === "Semua" || p.category === cat) &&
          p.name.toLowerCase().includes(q.toLowerCase())
      );

      if (sortBy === "Harga Terendah") {
        result.sort((a, b) => a.price - b.price);
      } else if (sortBy === "Harga Tertinggi") {
        result.sort((a, b) => b.price - a.price);
      } else if (sortBy === "Rating Tertinggi") {
        result.sort((a, b) => b.rating - a.rating);
      }
      
      return result;
    },
    [q, cat, products, sortBy]
  );

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartItems = Object.entries(cart).map(([id, quantity]) => {
    const product = products.find(p => p.id === id);
    return { ...product, quantity };
  }).filter(item => item.id);

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price! * item.quantity), 0);

  const addToCart = (p: Product) => {
    if (p.status === 'habis' || p.stock <= 0) {
      toast.error("Maaf, stok produk ini sedang habis");
      return;
    }
    
    const currentQty = cart[p.id] || 0;
    if (currentQty >= p.stock) {
      toast.error("Maaf, jumlah pesanan melebihi stok yang tersedia");
      return;
    }

    setCart((c) => ({ ...c, [p.id]: currentQty + 1 }));
    toast.success(`${p.name} ditambahkan ke keranjang`);
  };

  const removeFromCart = (id: string) => {
    setCart((c) => {
      const newCart = { ...c };
      if (newCart[id] > 1) {
        newCart[id] -= 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const deleteFromCart = (id: string) => {
    setCart((c) => {
      const newCart = { ...c };
      delete newCart[id];
      return newCart;
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu untuk melakukan pemesanan");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          patient_name: user.user_metadata?.full_name || user.email,
          items: cartItems.map(item => ({
            product_id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            emoji: item.emoji,
            image_url: item.image_url
          })),
          total_amount: cartTotal,
          status: 'Menunggu'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Update product stocks
      for (const item of cartItems) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            stock: item.stock! - item.quantity,
            status: (item.stock! - item.quantity) <= 0 ? 'habis' : 'tersedia'
          })
          .eq('id', item.id);
        
        if (stockError) console.error(`Failed to update stock for ${item.id}:`, stockError);
      }

      toast.success("Pesanan berhasil dibuat! Mohon tunggu konfirmasi dari admin.");
      setCart({});
      setIsCheckoutOpen(false);
    } catch (error: any) {
      toast.error("Gagal melakukan checkout: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* ── Hero Banner (Professional Light Photo Style) ────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mt-4 min-h-[360px] overflow-hidden rounded-[2rem] bg-white text-slate-900 shadow-xl border border-slate-100"
      >
        {/* Background Photo with Light Overlay */}
        <div className="absolute inset-0">
          <img 
            src="/images/pharmacy.jpg" 
            alt="Pharmacy" 
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>
        
        <div className="relative z-10 flex h-full flex-col justify-center p-8 lg:p-12">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-primary/20 text-primary w-fit">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Direktori Apotekin
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-slate-900 tracking-tighter">
              Apotek <span className="text-primary">Digital</span> <br />
              Sembuhin
            </h1>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-lg font-medium">
              Solusi kesehatan terlengkap. Obat resmi BPOM, vitamin, dan alat kesehatan diantar dalam <span className="text-primary font-bold">60 menit</span>.
            </p>
            <div className="flex flex-wrap gap-8 pt-8 border-t border-slate-200">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl md:text-3xl font-black text-slate-900">1.000+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produk Aktif</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl md:text-3xl font-black text-slate-900">4.9</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rating</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl md:text-3xl font-black text-slate-900">24/7</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Siaga</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Search Bar & Filter (Professional Sync) ───────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-2xl p-4 border border-sky-100/60 shadow-md flex flex-col sm:flex-row gap-3 sticky top-24 z-30"
      >
        <div className="relative flex-[2]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama obat, vitamin, atau keluhan kesehatan..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/70 border border-sky-100/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-300 transition-all"
          />
        </div>

        <div className="flex flex-1 items-center gap-3">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/70 border border-sky-100/60 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-400/40 cursor-pointer min-w-[180px]"
          >
            <option>Terpopuler</option>
            <option>Harga Terendah</option>
            <option>Harga Tertinggi</option>
            <option>Rating Tertinggi</option>
          </select>

          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white/70 text-foreground border border-sky-100/60 hover:border-sky-300 transition-all">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          
          <button 
            onClick={() => setIsCheckoutOpen(true)}
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black shadow-lg ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* ── Categories (Professional Chips) ──────────────────────────── */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 px-1">
        {CATEGORIES.map((c, idx) => (
          <motion.button
            key={c}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + idx * 0.05 }}
            onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-all border ${
              cat === c
                ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-300/30"
                : "bg-white/70 text-foreground border-sky-100/60 hover:border-sky-300 hover:bg-sky-50"
            }`}
          >
            {c}
          </motion.button>
        ))}
      </div>

      {/* ── Product Grid ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-slate-200" />
              <div className="p-6 space-y-3">
                <div className="h-4 w-24 bg-slate-200 rounded-full" />
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="h-3 w-32 bg-slate-200 rounded" />
                <div className="h-8 w-28 bg-slate-200 rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          layout
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className={`group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden ${
                  p.status === 'habis' ? 'opacity-75 grayscale-[0.5]' : ''
                }`}
              >
                {/* Image Section */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
                  {p.image_url ? (
                    <img 
                      src={p.image_url} 
                      alt={p.name} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-6xl">
                      {p.emoji}
                    </div>
                  )}
                  
                  {/* Status Overlay */}
                  <div className="absolute left-3 top-3">
                    {p.status === 'habis' ? (
                      <span className="rounded-lg bg-rose-500/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                        Habis
                      </span>
                    ) : p.stock < 10 ? (
                      <span className="rounded-lg bg-amber-500/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                        Sisa {p.stock}
                      </span>
                    ) : (
                      <span className="rounded-lg bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm border border-white/20">
                        Terverifikasi
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 backdrop-blur-sm px-2 py-1 text-[11px] font-bold text-slate-700 shadow-sm flex items-center gap-1 border border-white/20">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {p.rating}
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="mb-2">
                    <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-600">
                      {p.category}
                    </span>
                  </div>
                  
                  <h3 className="font-display text-base font-bold text-slate-900 tracking-tight mb-1.5 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {p.description}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Harga</p>
                      <p className="font-display text-lg font-bold text-slate-900">
                        Rp{p.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                      disabled={p.status === 'habis'}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-all hover:scale-105 active:scale-95 ${
                        p.status === 'habis' 
                          ? 'bg-slate-200 cursor-not-allowed shadow-none text-slate-400' 
                          : 'bg-primary shadow-primary/20 hover:shadow-primary/40'
                      }`}
                    >
                      <Plus className="h-5 w-5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-24 text-center glass rounded-2xl border-2 border-dashed border-slate-200"
        >
          <div className="text-5xl mb-4">🔎</div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">Obat Tidak Ditemukan</h3>
          <p className="text-muted-foreground max-w-md mx-auto">Cari dengan kata kunci lain atau ubah filter.</p>
          <button 
            onClick={() => {setQ(""); setCat("Semua");}}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-all"
          >
            Reset Pencarian
          </button>
        </motion.div>
      )}

      {/* ── Checkout Drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 z-[60] h-full w-full max-w-md bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Keranjang</h2>
                    <p className="text-sm text-muted-foreground">{cartCount} item siap dipesan</p>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="rounded-full p-2 hover:bg-slate-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6">
                  {cartItems.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                      <ShoppingCart className="mb-4 h-16 w-16 opacity-20" />
                      <p className="text-lg font-medium">Keranjangmu kosong</p>
                      <button 
                        onClick={() => setIsCheckoutOpen(false)}
                        className="mt-4 text-sm font-bold text-primary hover:underline"
                      >
                        Lihat Produk →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 rounded-2xl border p-3">
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-50 overflow-hidden">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-3xl">{item.emoji}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold leading-tight">{item.name}</h4>
                            <p className="text-sm font-semibold text-primary">Rp{item.price?.toLocaleString("id-ID")}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center rounded-lg bg-slate-50 p-1">
                              <button 
                                onClick={() => removeFromCart(item.id!)}
                                className="p-1 hover:text-primary"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => addToCart(item as Product)}
                                className="p-1 hover:text-primary"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button 
                              onClick={() => deleteFromCart(item.id!)}
                              className="text-rose-500 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="border-t pt-6">
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">Rp{cartTotal.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Biaya Layanan</span>
                        <span className="font-semibold text-emerald-600">GRATIS</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">Rp{cartTotal.toLocaleString("id-ID")}</span>
                      </div>
                    </div>

                    {!user ? (
                      <div className="rounded-xl bg-amber-50 p-4 text-center">
                        <p className="mb-3 text-xs font-medium text-amber-800">Silakan masuk untuk melanjutkan checkout</p>
                        <button 
                          onClick={() => window.location.href = '/auth'}
                          className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600"
                        >
                          Login Sekarang
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={isSubmitting}
                        onClick={handleCheckout}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-4 text-lg font-bold text-white shadow-glow transition-transform active:scale-95 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Pesan Sekarang"}
                      </button>
                    )}
                    <p className="mt-3 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                      Pengiriman dijamin tiba dalam 60 menit
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
