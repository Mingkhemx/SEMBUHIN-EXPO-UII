import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, LogOut, ChevronLeft, ChevronRight,
  Shield, Bell, Globe, Heart, Activity, Calendar, MapPin,
  Droplets, AlertTriangle, PhoneCall, Edit3, Camera, Clock,
  MessageSquare, Award, Lock, Stethoscope, UserCircle, Loader2, CheckCircle2, XCircle, ArrowRight, Brain
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const Route = createFileRoute('/profil')({
  head: () => ({
    title: 'Profil Saya — Sembuhin',
    meta: [{ name: 'description', content: 'Kelola profil dan akun Sembuhin Anda' }],
  }),
  component: ProfilPage,
});

type ToastType = 'success' | 'error' | null;

interface MentalScreening {
  id: string
  screening_type: 'phq9' | 'gad7'
  total_score: number
  severity: string
  created_at: string
}

function ProfilPage() {
  const navigate = useNavigate();
  const { user: authUser, isDoctor, signOut, refreshUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatCount, setChatCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mentalScreenings, setMentalScreenings] = useState<MentalScreening[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          setUser(supabaseUser);
          try {
            const { count } = await supabase
              .from('chat_history')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', supabaseUser.id);
            setChatCount(count || 0);
          } catch { /* ignore */ }
          // Fetch mental health screening history
          try {
            const { data: screenings, error: fetchError } = await supabase
              .from('mental_health_screenings')
              .select('id, screening_type, total_score, severity, created_at')
              .eq('user_id', supabaseUser.id)
              .order('created_at', { ascending: false })
              .limit(10);
            
            if (fetchError) {
              console.error('Fetch screenings error:', fetchError);
            }
            setMentalScreenings(screenings || []);
          } catch (err) { 
            console.error('Catch screenings error:', err);
          }
        } else {
          const dummyUserStr = localStorage.getItem('dummy_user');
          if (dummyUserStr) setUser(JSON.parse(dummyUserStr));
        }
      } catch {
        const dummyUserStr = localStorage.getItem('dummy_user');
        if (dummyUserStr) setUser(JSON.parse(dummyUserStr));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auto-hide toast setelah 3 detik
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Debug: Tampilkan avatar URL di console setiap berubah
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengguna';
  const userEmail = user?.email || 'email@contoh.com';
  const userPhone = user?.user_metadata?.phone || 'Belum ditambahkan';
  const userAvatar = user?.user_metadata?.avatar_url
    ? user.user_metadata.avatar_url.split('?')[0] + `?t=${user.updated_at || ''}` 
    : '';
  const createdAt = user?.created_at ? new Date(user.created_at) : new Date();
  const memberSince = createdAt.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const daysSinceJoin = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    console.log('🖼️ Current Avatar URL:', userAvatar);
  }, [userAvatar]);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
  };

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem('dummy_user');
    navigate({ to: '/' });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setImageError(false);
      if (!event.target.files || event.target.files.length === 0) return;
      if (!user?.id) {
        showToast('error', 'Anda harus login terlebih dahulu');
        return;
      }

      const file = event.target.files[0];

      // Validasi ukuran (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'Ukuran foto maksimal 2MB');
        return;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      // Path: {user_id}/avatar.{ext} — folder = user_id agar sesuai policy RLS
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload dengan upsert — timpa file lama
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // Ambil public URL — tambahkan cache buster agar browser tidak pakai cache lama
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

      // Update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });

      if (updateError) throw updateError;

      // Refresh user di AuthContext — agar Header langsung update avatar
      await refreshUser();

      // Refresh state lokal juga
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
      setImageError(false);

      // Sync avatar ke tabel doctors jika user adalah dokter
      if (updatedUser && isDoctor) {
        // Update by user_id (lebih reliable) atau fallback ke email
        const { error: syncErr } = await supabase
          .from('doctors')
          .update({ avatar_url: avatarUrl })
          .or(`user_id.eq.${updatedUser.id},email.eq.${updatedUser.email}`);
        if (syncErr) console.warn('Gagal sync avatar ke doctors:', syncErr.message);
      }

      showToast('success', 'Foto profil berhasil diperbarui!');
    } catch (error: any) {
      const msg = error?.message || 'Gagal upload foto. Pastikan bucket "profiles" sudah dibuat.';
      showToast('error', msg);
    } finally {
      setUploading(false);
      // Reset input agar bisa upload file yang sama lagi
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm font-medium">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999]">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl shadow-slate-100 border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600" />
            )}
            <span className={`text-sm font-semibold ${toast.type === 'success' ? 'text-emerald-800' : 'text-rose-800'}`}>
              {toast.message}
            </span>
            <button onClick={() => setToast(null)} className="ml-2">
              <XCircle className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
        </div>
      )}



      <div className="relative overflow-hidden rounded-3xl bg-white border border-sky-100 shadow-xl shadow-sky-100/50 mb-6">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-sky-500 via-blue-500 to-teal-500 opacity-10"></div>
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative flex-shrink-0">
              {userAvatar && !imageError ? (
                <img 
                  src={userAvatar} 
                  alt={userName} 
                  className="w-28 h-28 rounded-3xl object-cover shadow-2xl border-4 border-white"
                  onError={() => {
                    console.error('❌ Error loading avatar image!');
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-emerald-500 border-4 border-white flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-all duration-300 hover:scale-110 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4.5 h-4.5 text-white animate-spin" /> : <Camera className="w-4.5 h-4.5 text-white" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h2 className="text-2xl font-extrabold text-slate-800">{userName}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  <Award className="w-3.5 h-3.5" /> Terverifikasi
                </span>
              </div>
              <p className="text-slate-500 text-base mb-4">{userEmail}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                <div className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Bergabung {memberSince}
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                <div className="inline-flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> {chatCount} konsultasi
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                <div className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {daysSinceJoin} hari aktif
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Pribadi & Kesehatan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-50/50 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Info Pribadi</h3>
            <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-all duration-300 hover:bg-emerald-50 px-3 py-1.5 rounded-xl">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="px-6 pb-6 space-y-1">
            <InfoRow icon={<User className="w-4 h-4" />} label="Nama Lengkap" value={userName} />
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={userEmail} accent />
            <InfoRow icon={<Phone className="w-4 h-4" />} label="No. Telepon" value={userPhone} warn={userPhone === 'Belum ditambahkan'} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Tanggal Lahir" value="Belum ditambahkan" warn />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Alamat" value="Belum ditambahkan" warn />
            <InfoRow icon={<UserCircle className="w-4 h-4" />} label="Jenis Kelamin" value="Belum ditambahkan" warn last />
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-50/50 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Informasi Kesehatan</h3>
            <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-all duration-300 hover:bg-emerald-50 px-3 py-1.5 rounded-xl">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-3.5">
              <HealthCard
                icon={<Droplets className="w-5 h-5 text-rose-500" />}
                label="Gol. Darah"
                value="Belum diatur"
                bg="bg-rose-50"
                border="border-rose-100"
              />
              <HealthCard
                icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
                label="Alergi"
                value="Belum diatur"
                bg="bg-amber-50"
                border="border-amber-100"
              />
              <HealthCard
                icon={<Heart className="w-5 h-5 text-pink-500" />}
                label="Riwayat Penyakit"
                value="Belum diatur"
                bg="bg-pink-50"
                border="border-pink-100"
              />
              <HealthCard
                icon={<PhoneCall className="w-5 h-5 text-emerald-500" />}
                label="Kontak Darurat"
                value="Belum diatur"
                bg="bg-emerald-50"
                border="border-emerald-100"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              Informasi kesehatan membantu Dr. Sembuhin memberikan saran yang lebih akurat dan personal.
            </p>
          </div>
        </div>
      </div>

      {/* Riwayat Kesehatan Mental */}
      {user && (
        <div className="mb-8 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-50/50 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-500" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Riwayat Kesehatan Mental</h3>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    const { data: screenings, error } = await supabase
                      .from('mental_health_screenings')
                      .select('id, screening_type, total_score, severity, created_at')
                      .eq('user_id', user.id)
                      .order('created_at', { ascending: false })
                      .limit(10);
                    if (error) {
                      showToast('error', `Gagal memuat: ${error.message}`);
                    } else {
                      setMentalScreenings(screenings || []);
                      showToast('success', 'Riwayat berhasil diperbarui');
                    }
                  } catch (err) {
                    showToast('error', 'Gagal memperbarui riwayat');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-all duration-300 hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100"
              >
                Refresh
              </button>

              <button 
                onClick={() => navigate({ to: '/mental-health' })}
                className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-all duration-300 hover:bg-violet-50 px-3 py-1.5 rounded-xl"
              >
                Screening Baru <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="px-6 pb-6">
            {mentalScreenings.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-7 h-7 text-violet-400" />
                </div>
                <p className="text-sm text-slate-500 mb-1">Belum ada riwayat screening</p>
                <p className="text-xs text-slate-400">Lakukan screening PHQ-9 atau GAD-7 untuk memantau kesehatan mental Anda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mentalScreenings.map((s) => {
                  const maxScore = s.screening_type === 'phq9' ? 27 : 21;
                  const typeLabel = s.screening_type === 'phq9' ? 'Depresi (PHQ-9)' : 'Kecemasan (GAD-7)';
                  const typeColor = s.screening_type === 'phq9' 
                    ? 'bg-violet-50 border-violet-100 text-violet-700'
                    : 'bg-rose-50 border-rose-100 text-rose-700';
                  const severityColors: Record<string, string> = {
                    'minimal': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    'mild': 'bg-sky-50 text-sky-700 border-sky-100',
                    'moderate': 'bg-amber-50 text-amber-700 border-amber-100',
                    'mod-severe': 'bg-orange-50 text-orange-700 border-orange-100',
                    'severe': 'bg-red-50 text-red-700 border-red-100',
                  };
                  const severityLabels: Record<string, string> = {
                    'minimal': 'Minimal',
                    'mild': 'Ringan',
                    'moderate': 'Sedang',
                    'mod-severe': 'Cukup Berat',
                    'severe': 'Berat',
                  };
                  const dateStr = new Date(s.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });
                  return (
                    <div key={s.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${typeColor}`}>
                          <Brain className="w-3 h-3" /> {typeLabel}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${severityColors[s.severity] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                          {severityLabels[s.severity] || s.severity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-lg font-bold text-slate-800">{s.total_score}<span className="text-xs font-normal text-slate-400">/{maxScore}</span></p>
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden max-w-[120px]">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                              style={{ width: `${Math.min((s.total_score / maxScore) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400">{dateStr}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistik & Pengaturan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-50/50 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Statistik Aktivitas</h3>
          </div>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-3 gap-3">
              <StatCard value={chatCount.toString()} label="Total Chat" icon={<MessageSquare className="w-5 h-5" />} />
              <StatCard value={daysSinceJoin.toString()} label="Hari Aktif" icon={<Calendar className="w-5 h-5" />} />
              <StatCard value="0" label="Resep" icon={<Stethoscope className="w-5 h-5" />} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-50/50 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Pengaturan Akun</h3>
          </div>
          <div className="px-2 pb-2">
            <MenuButton icon={<User className="w-5 h-5" />} iconBg="bg-slate-100" iconColor="text-slate-600" label="Edit Profil" desc="Perbarui nama, foto, dan info pribadi" />
            <MenuButton icon={<Bell className="w-5 h-5" />} iconBg="bg-amber-50" iconColor="text-amber-600" label="Notifikasi" desc="Atur preferensi notifikasi" />
            <MenuButton icon={<Shield className="w-5 h-5" />} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Keamanan" desc="Password dan verifikasi dua langkah" />
            <MenuButton icon={<Globe className="w-5 h-5" />} iconBg="bg-violet-50" iconColor="text-violet-600" label="Bahasa" desc="Bahasa Indonesia" last />
          </div>
        </div>
      </div>

      {/* Tentang & Doctor Panel */}
      <div className="rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-50/50 overflow-hidden mb-6">
        <div className="px-2 pt-2 pb-2">
          <MenuButton icon={<Activity className="w-5 h-5" />} iconBg="bg-slate-100" iconColor="text-slate-600" label="Tentang Sembuhin" desc="Versi 1.1 • Syarat & Ketentuan" />
          <MenuButton icon={<Lock className="w-5 h-5" />} iconBg="bg-slate-100" iconColor="text-slate-600" label="Kebijakan Privasi" desc="Bagaimana kami melindungi data Anda" last />
        </div>
      </div>

      {/* Doctor Panel Button */}
      {isDoctor && (
        <button
          onClick={() => navigate({ to: '/doctor' })}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white p-5 flex items-center justify-center gap-3 shadow-xl shadow-sky-200 hover:from-sky-600 hover:to-blue-700 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] mb-6"
        >
          <Stethoscope className="w-6 h-6" />
          <span className="text-lg font-bold">Panel Dokter</span>
        </button>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full rounded-2xl bg-white border-2 border-red-100 text-red-600 p-5 flex items-center justify-center gap-3 hover:bg-red-50 transition-all duration-300 hover:border-red-200"
      >
        <LogOut className="w-6 h-6" />
        <span className="text-lg font-bold">Keluar</span>
      </button>
    </div>
  );
}

function InfoRow({ icon, label, value, accent, warn, last }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-3.5 ${!last ? 'border-b border-slate-50' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="text-slate-400">{icon}</span>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${
        warn ? 'text-slate-400 italic' : accent ? 'text-emerald-600' : 'text-slate-800'
      }`}>
        {value}
      </span>
    </div>
  );
}

function HealthCard({ icon, label, value, bg, border }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  border: string;
}) {
  return (
    <div className={`${bg} ${border} rounded-3xl p-4 flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-semibold text-slate-700">{label}</span>
      </div>
      <span className="text-[11px] text-slate-400 italic">{value}</span>
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-sky-50 border border-sky-100 rounded-2xl p-4 flex flex-col items-center text-center gap-1.5">
      <span className="text-sky-400 mb-1">{icon}</span>
      <span className="text-2xl font-extrabold text-slate-800">{value}</span>
      <span className="text-[11px] text-slate-500 font-medium">{label}</span>
    </div>
  );
}

function MenuButton({ icon, iconBg, iconColor, label, desc, last }: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  desc: string;
  last?: boolean;
}) {
  return (
    <button className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-all duration-300 ${!last ? 'border-b border-slate-50' : ''}`}>
      <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
    </button>
  );
}
