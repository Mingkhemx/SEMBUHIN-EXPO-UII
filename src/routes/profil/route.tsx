import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, LogOut, ChevronLeft, ChevronRight,
  Shield, Bell, Globe, Heart, Activity, Calendar, MapPin,
  Droplets, AlertTriangle, PhoneCall, Edit3, Camera, Clock,
  MessageSquare, Award, Lock, Stethoscope,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute('/profil')({
  head: () => ({
    title: 'Profil Saya — Sembuhin',
    meta: [{ name: 'description', content: 'Kelola profil dan akun Sembuhin Anda' }],
  }),
  component: ProfilPage,
});

function ProfilPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          setUser(supabaseUser);
          // Fetch chat count
          try {
            const { count } = await supabase
              .from('chat_history')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', supabaseUser.id);
            setChatCount(count || 0);
          } catch { /* ignore */ }
        } else {
          const dummyUserStr = localStorage.getItem('dummy_user');
          if (dummyUserStr) {
            setUser(JSON.parse(dummyUserStr));
          }
        }
      } catch (error) {
        const dummyUserStr = localStorage.getItem('dummy_user');
        if (dummyUserStr) {
          setUser(JSON.parse(dummyUserStr));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Ignore error for dummy user
    }
    localStorage.removeItem('dummy_user');
    navigate({ to: '/' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-slate-400 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm font-medium">Memuat profil...</p>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengguna';
  const userEmail = user?.email || 'email@contoh.com';
  const userPhone = user?.user_metadata?.phone || 'Belum ditambahkan';
  const userAvatar = user?.user_metadata?.avatar_url || '';
  const createdAt = user?.created_at ? new Date(user.created_at) : new Date();
  const memberSince = createdAt.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const daysSinceJoin = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="pb-16">
      {/* ── Header Bar ── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 py-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate({ to: '/beranda' })}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Profil Saya</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* ── Profile Hero Card ── */}
        <div className="rounded-3xl bg-white border border-slate-200/60 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-24 h-24 rounded-2xl object-cover shadow-sm" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <button className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-emerald-500 border-[3px] border-white flex items-center justify-center shadow-md hover:bg-emerald-600 transition-colors">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-800">{userName}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                  <Award className="w-3 h-3" /> Terverifikasi
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-3">{userEmail}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Bergabung {memberSince}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> {chatCount} konsultasi
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {daysSinceJoin} hari aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Info Pribadi ── */}
        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Info Pribadi</h3>
            <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="px-6 pb-5 space-y-0">
            <InfoRow icon={<User className="w-4 h-4" />} label="Nama Lengkap" value={userName} />
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={userEmail} accent />
            <InfoRow icon={<Phone className="w-4 h-4" />} label="No. Telepon" value={userPhone} warn={userPhone === 'Belum ditambahkan'} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Tanggal Lahir" value="Belum ditambahkan" warn />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Alamat" value="Belum ditambahkan" warn />
            <InfoRow icon={<User className="w-4 h-4" />} label="Jenis Kelamin" value="Belum ditambahkan" warn last />
          </div>
        </div>

        {/* ── Informasi Kesehatan ── */}
        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Informasi Kesehatan</h3>
            <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="px-6 pb-5">
            <div className="grid grid-cols-2 gap-3">
              <HealthCard
                icon={<Droplets className="w-5 h-5 text-rose-500" />}
                label="Gol. Darah"
                value="Belum diatur"
                bg="bg-rose-50"
              />
              <HealthCard
                icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
                label="Alergi"
                value="Belum diatur"
                bg="bg-amber-50"
              />
              <HealthCard
                icon={<Heart className="w-5 h-5 text-pink-500" />}
                label="Riwayat Penyakit"
                value="Belum diatur"
                bg="bg-pink-50"
              />
              <HealthCard
                icon={<PhoneCall className="w-5 h-5 text-emerald-500" />}
                label="Kontak Darurat"
                value="Belum diatur"
                bg="bg-emerald-50"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              Informasi kesehatan membantu Dr. Sembuhin memberikan saran yang lebih akurat dan personal.
            </p>
          </div>
        </div>

        {/* ── Statistik Aktivitas ── */}
        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Statistik Aktivitas</h3>
          </div>
          <div className="px-6 pb-5">
            <div className="grid grid-cols-3 gap-3">
              <StatCard value={chatCount.toString()} label="Total Chat" icon={<MessageSquare className="w-5 h-5" />} />
              <StatCard value={`${daysSinceJoin}`} label="Hari Aktif" icon={<Calendar className="w-5 h-5" />} />
              <StatCard value="0" label="Resep Tersimpan" icon={<Stethoscope className="w-5 h-5" />} />
            </div>
          </div>
        </div>

        {/* ── Pengaturan Akun ── */}
        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Pengaturan Akun</h3>
          </div>
          <div className="px-2 pb-2">
            <MenuButton icon={<User className="w-5 h-5" />} iconBg="bg-slate-100" iconColor="text-slate-600" label="Edit Profil" desc="Perbarui nama, foto, dan info pribadi" />
            <MenuButton icon={<Bell className="w-5 h-5" />} iconBg="bg-amber-50" iconColor="text-amber-600" label="Notifikasi" desc="Atur preferensi notifikasi" />
            <MenuButton icon={<Shield className="w-5 h-5" />} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Keamanan" desc="Password dan verifikasi dua langkah" />
            <MenuButton icon={<Globe className="w-5 h-5" />} iconBg="bg-violet-50" iconColor="text-violet-600" label="Bahasa" desc="Bahasa Indonesia" last />
          </div>
        </div>

        {/* ── Tentang ── */}
        <div className="rounded-3xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-2 pt-2 pb-2">
            <MenuButton icon={<Activity className="w-5 h-5" />} iconBg="bg-slate-100" iconColor="text-slate-600" label="Tentang Sembuhin" desc="Versi 1.1 • Syarat & Ketentuan" />
            <MenuButton icon={<Lock className="w-5 h-5" />} iconBg="bg-slate-100" iconColor="text-slate-600" label="Kebijakan Privasi" desc="Bagaimana kami melindungi data Anda" last />
          </div>
        </div>

        {/* ── Logout ── */}
        <button
          onClick={handleLogout}
          className="w-full rounded-2xl border border-red-200 bg-red-50/50 p-4 flex items-center justify-center gap-3 hover:bg-red-100/60 transition-all group"
        >
          <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
          <span className="font-semibold text-red-600 group-hover:text-red-700 transition-colors">Keluar</span>
        </button>

        <p className="text-center text-[11px] text-slate-400 pb-4">
          Sembuhin v1.1 • © 2025 Sembuhin Health Platform
        </p>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function InfoRow({ icon, label, value, accent, warn, last }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-3.5 ${!last ? 'border-b border-slate-100' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="text-slate-400">{icon}</span>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <span className={`text-sm font-medium ${
        warn ? 'text-slate-400 italic' : accent ? 'text-emerald-600' : 'text-slate-800'
      }`}>
        {value}
      </span>
    </div>
  );
}

function HealthCard({ icon, label, value, bg }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
      <span className="text-[11px] text-slate-400 italic">{value}</span>
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center text-center gap-1">
      <span className="text-slate-400 mb-1">{icon}</span>
      <span className="text-xl font-bold text-slate-800">{value}</span>
      <span className="text-[11px] text-slate-400">{label}</span>
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
    <button className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 transition-colors ${!last ? 'border-b border-slate-100' : ''}`}>
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
    </button>
  );
}
