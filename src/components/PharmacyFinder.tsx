import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Clock, Star, Search, Navigation,
  X, Heart, Share2, Loader2, AlertCircle,
} from 'lucide-react';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: number; // in km
  phone: string;
  hours: string;
  rating: number;
  reviewCount: number;
  hasParking: boolean;
  isFavourite?: boolean;
}

interface PharmacyFinderProps {
  isOpen: boolean;
  onClose: () => void;
  medicineName?: string;
}

const MOCK_PHARMACIES: Pharmacy[] = [
  {
    id: '1',
    name: 'Apotek Sejahtera',
    address: 'Jl. Merdeka No. 45, Jakarta Pusat',
    distance: 0.8,
    phone: '021-1234567',
    hours: 'Buka 24 Jam',
    rating: 4.8,
    reviewCount: 247,
    hasParking: true,
  },
  {
    id: '2',
    name: 'Guardian Pharmacy',
    address: 'Mall Taman Anggrek Lt. 2, Jakarta Barat',
    distance: 1.2,
    phone: '021-2345678',
    hours: '08:00 - 22:00',
    rating: 4.6,
    reviewCount: 189,
    hasParking: true,
  },
  {
    id: '3',
    name: 'Apotek Kimia Farma',
    address: 'Jl. Sudirman No. 120, Jakarta Selatan',
    distance: 1.5,
    phone: '021-3456789',
    hours: '07:00 - 21:00',
    rating: 4.5,
    reviewCount: 156,
    hasParking: false,
  },
];

export function PharmacyFinder({ isOpen, onClose, medicineName }: PharmacyFinderProps) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(MOCK_PHARMACIES);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Simulate loading
      setLoading(true);
      setTimeout(() => setLoading(false), 800);
    }
  }, [isOpen]);

  const filteredPharmacies = pharmacies.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPharmacies = [...filteredPharmacies].sort((a, b) => a.distance - b.distance);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div className="w-full max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 px-5 sm:px-7 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Apotek Terdekat</p>
                  {medicineName && (
                    <h2 className="text-lg font-bold text-slate-900 mt-1">Cari: {medicineName}</h2>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
                >
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              {/* Search */}
              <div className="sticky top-[60px] bg-white border-b border-slate-100 px-5 sm:px-7 py-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari apotek..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="px-5 sm:px-7 py-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                  </div>
                ) : sortedPharmacies.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">Apotek tidak ditemukan</p>
                    <p className="text-sm text-slate-500 mt-1">Coba dengan pencarian lain</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedPharmacies.map((pharmacy) => (
                      <motion.div
                        key={pharmacy.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-slate-200 hover:border-slate-300 p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900">{pharmacy.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                      i < Math.floor(pharmacy.rating)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-600">
                                {pharmacy.rating} ({pharmacy.reviewCount})
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setFavourites(prev =>
                                prev.includes(pharmacy.id)
                                  ? prev.filter(id => id !== pharmacy.id)
                                  : [...prev, pharmacy.id]
                              )
                            }
                            className={`flex-shrink-0 transition-all ${
                              favourites.includes(pharmacy.id) ? 'text-red-500' : 'text-slate-300'
                            }`}
                          >
                            <Heart
                              className="h-5 w-5"
                              fill={favourites.includes(pharmacy.id) ? 'currentColor' : 'none'}
                            />
                          </button>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2.5 text-sm text-slate-600">
                            <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">
                              {pharmacy.address}
                              <br />
                              <span className="font-semibold text-blue-600">{pharmacy.distance} km</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>{pharmacy.hours}</span>
                          </div>

                          <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <a href={`tel:${pharmacy.phone}`} className="font-medium text-blue-600 hover:underline">
                              {pharmacy.phone}
                            </a>
                          </div>

                          {pharmacy.hasParking && (
                            <div className="text-xs font-medium text-emerald-700 bg-emerald-50 w-fit px-2 py-1 rounded">
                              ✓ Ada Parkir
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2.5">
                          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all">
                            <Navigation className="h-4 w-4" />
                            <span>Rute</span>
                          </button>
                          <button className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all">
                            Hubungi
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
