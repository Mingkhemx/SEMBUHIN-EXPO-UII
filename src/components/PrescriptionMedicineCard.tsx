import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Star,
  Pill,
  AlertCircle,
  TrendingUp,
  Package,
  RotateCcw,
  Check,
} from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  unit: string;
  seller: string;
  rating: number;
  reviews: number;
  image?: string;
  inStock: boolean;
  prescription?: {
    required: boolean;
    canUpload: boolean;
  };
  shippingDays: number;
  isFavourite?: boolean;
}

interface PrescriptionMedicineCardProps {
  medicine: Medicine;
  onAddToCart?: (medicineId: string) => void;
  onToggleFavourite?: (medicineId: string) => void;
  showPrescriptionLabel?: boolean;
}

export function PrescriptionMedicineCard({
  medicine,
  onAddToCart,
  onToggleFavourite,
  showPrescriptionLabel = true,
}: PrescriptionMedicineCardProps) {
  const [isFavourite, setIsFavourite] = useState(medicine.isFavourite || false);
  const discount = medicine.originalPrice
    ? Math.round(((medicine.originalPrice - medicine.price) / medicine.originalPrice) * 100)
    : 0;

  const handleFavourite = () => {
    setIsFavourite(!isFavourite);
    onToggleFavourite?.(medicine.id);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-slate-200 hover:border-slate-300 bg-white shadow-sm hover:shadow-md overflow-hidden transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 aspect-square flex items-center justify-center overflow-hidden">
        {medicine.image ? (
          <img src={medicine.image} alt={medicine.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <Pill className="h-12 w-12 text-slate-300" />
            <span className="text-xs text-slate-400 font-medium">{medicine.unit}</span>
          </div>
        )}

        {/* Badge Container */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {/* Prescription Badge */}
          {showPrescriptionLabel && medicine.prescription?.required && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-100 border border-red-200"
            >
              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
                Butuh Resep
              </span>
            </motion.div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-red-100 border border-red-200"
            >
              <TrendingUp className="h-3.5 w-3.5 text-red-600" />
              <span className="text-[10px] font-bold text-red-700">{discount}%</span>
            </motion.div>
          )}
        </div>

        {/* Heart Button */}
        <button
          onClick={handleFavourite}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:scale-110"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavourite ? "text-red-500 fill-red-500" : "text-slate-300"
            }`}
          />
        </button>

        {/* Stock Status */}
        {!medicine.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Stok Habis</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name and Dosage */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
            {medicine.name}
          </h3>
          <p className="text-xs text-slate-600 mt-1">{medicine.dosage}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(medicine.rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-600">
            {medicine.rating} ({medicine.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">
              Rp {medicine.price.toLocaleString("id-ID")}
            </span>
            {medicine.originalPrice && (
              <span className="text-xs text-slate-500 line-through">
                Rp {medicine.originalPrice.toLocaleString("id-ID")}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {medicine.quantity} {medicine.unit}
          </p>
        </div>

        {/* Meta Info */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-slate-400" />
            <span>{medicine.seller}</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Tiba dalam {medicine.shippingDays} hari</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart?.(medicine.id)}
          disabled={!medicine.inStock}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            medicine.inStock
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {medicine.inStock ? (
            <>
              <ShoppingCart className="h-4 w-4" />
              Tambah Keranjang
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Notifikasi Stok
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
