import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ShoppingCart, Star, Plus } from "lucide-react";
import { motion } from "framer-motion";

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
  desc: string;
  price: number;
  category: string;
  rating: number;
  emoji: string;
};

const PRODUCTS: Product[] = [
  { id: "1", name: "Paracetamol 500mg", desc: "Pereda demam & nyeri ringan", price: 12000, category: "Demam", rating: 4.8, emoji: "💊" },
  { id: "2", name: "Vitamin C 1000mg", desc: "Tingkatkan imun harian", price: 85000, category: "Vitamin", rating: 4.9, emoji: "🍊" },
  { id: "3", name: "Omeprazole 20mg", desc: "Atasi maag & asam lambung", price: 45000, category: "Lambung", rating: 4.7, emoji: "🌿" },
  { id: "4", name: "Cetirizine 10mg", desc: "Antihistamin untuk alergi", price: 28000, category: "Alergi", rating: 4.6, emoji: "💧" },
  { id: "5", name: "Multivitamin Family", desc: "Nutrisi lengkap sekeluarga", price: 120000, category: "Vitamin", rating: 5.0, emoji: "✨" },
  { id: "6", name: "Hand Sanitizer 100ml", desc: "Anti bakteri pocket size", price: 18000, category: "Higienis", rating: 4.5, emoji: "🧴" },
  { id: "7", name: "Masker Medis 50pcs", desc: "3-ply earloop berkualitas", price: 35000, category: "Higienis", rating: 4.8, emoji: "😷" },
  { id: "8", name: "Probiotik Sachet", desc: "Jaga kesehatan pencernaan", price: 65000, category: "Lambung", rating: 4.7, emoji: "🥛" },
];

const CATEGORIES = ["Semua", "Demam", "Vitamin", "Lambung", "Alergi", "Higienis"];

function Marketplace() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");
  const [cart, setCart] = useState<Record<string, number>>({});

  const filtered = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (cat === "Semua" || p.category === cat) &&
          p.name.toLowerCase().includes(q.toLowerCase())
      ),
    [q, cat]
  );

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, n]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return sum + (p ? p.price * n : 0);
  }, 0);

  return (
    <div className="space-y-8 pb-12">
      <header className="pt-4">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Apotek <span className="text-gradient">Digital</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Obat resmi BPOM. Diantar dalam 1 jam ke pintu rumahmu.
        </p>
      </header>

      <div className="glass-strong sticky top-24 z-30 flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-foreground/50 px-3 py-2 ring-1 ring-white/60">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari obat, vitamin, alat kesehatan..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
          />
        </div>
        <button className="relative flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
          <ShoppingCart className="h-4 w-4" />
          {cartCount} item
          {cartTotal > 0 && (
            <span className="hidden sm:inline">• Rp{cartTotal.toLocaleString("id-ID")}</span>
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              cat === c
                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                : "glass hover:scale-105"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass group flex flex-col overflow-hidden rounded-2xl p-4 transition-all hover:scale-[1.02] hover:shadow-elevated"
          >
            <div className="relative mb-3 flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-white/60 to-blue-100/40 text-6xl">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative drop-shadow-sm">{p.emoji}</span>
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {p.category}
            </div>
            <h3 className="mt-1 font-semibold leading-tight">{p.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-medium">{p.rating}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="font-display text-lg font-bold">
                Rp{p.price.toLocaleString("id-ID")}
              </div>
              <button
                onClick={() =>
                  setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }))
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition-transform hover:scale-110"
                aria-label="Tambah ke keranjang"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
          Tidak ada produk yang cocok.
        </div>
      )}
    </div>
  );
}
