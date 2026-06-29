import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Ban, ShieldAlert, Clock, LogOut, ArrowLeft, HeartPulse, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export const Route = createFileRoute('/banned')({
  component: BannedPage,
});

function BannedPage() {
  const { userProfile, signOut } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [estimatedOpen, setEstimatedOpen] = useState<string>('');

  useEffect(() => {
    if (userProfile?.ban_until) {
      const banDate = new Date(userProfile.ban_until);
      
      const updateTimer = () => {
        const now = new Date();
        const diff = banDate.getTime() - now.getTime();

        if (diff > 0) {
          // Hitung hari, jam, menit, detik
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          let timeString = "";
          if (days > 0) timeString += `${days} Hari `;
          timeString += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          setTimeLeft(timeString);
          setEstimatedOpen(format(banDate, "EEEE, dd MMMM yyyy 'pukul' HH:mm", { locale: idLocale }));
        } else {
          setTimeLeft('Hukuman berakhir');
          setEstimatedOpen('Silakan hubungi admin untuk aktivasi akun.');
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [userProfile]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[32px] shadow-2xl shadow-rose-500/10 border border-slate-100 overflow-hidden"
      >
        {/* Header with Logo */}
        <div className="bg-rose-600 p-12 text-center relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.25),transparent)]" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Sembuhin - Balanced Size */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <img src="/gif_logo/logo.png" alt="Sembuhin Logo" className="h-16 w-auto object-contain drop-shadow-xl" />
            </motion.div>
            
            {/* Title with Icon - One Line, No Wrap */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4 w-full px-2"
            >
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 shadow-lg">
                <Ban className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight whitespace-nowrap drop-shadow-md">
                Akses Ditangguhkan
              </h1>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="p-10">
          <div className="space-y-8">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-100 to-rose-50 rounded-[24px] blur opacity-25 group-hover:opacity-50 transition duration-1000" />
              <div className="relative bg-white border border-rose-100 rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-3 text-rose-600 font-bold mb-3">
                  <div className="p-2 bg-rose-50 rounded-xl">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <span className="text-sm uppercase tracking-wider">Alasan Penangguhan</span>
                </div>
                <p className="text-slate-700 text-base font-medium leading-relaxed pl-2 border-l-4 border-rose-200 ml-2">
                  {userProfile?.status_reason || 'Pelanggaran ketentuan layanan Sembuhin.'}
                </p>
              </div>
            </motion.div>

            {userProfile?.ban_until && (
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 space-y-4"
              >
                <div className="flex items-center gap-3 text-slate-600 font-bold">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-sm uppercase tracking-wider">Sisa Waktu</span>
                </div>
                <div className="pl-2">
                  <span className="text-slate-800 text-lg font-bold">{timeLeft}</span>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-3 text-slate-600 font-bold mb-2">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <span className="text-sm uppercase tracking-wider">Estimasi Dibuka</span>
                  </div>
                  <div className="pl-2 text-slate-600 text-sm font-medium">
                    {estimatedOpen}
                  </div>
                </div>
              </motion.div>
            )}

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-slate-500 text-sm text-center leading-relaxed px-2"
            >
              Kami menjunjung tinggi keamanan komunitas. Jika Anda merasa ini adalah kesalahan, silakan hubungi tim dukungan melalui <span className="text-sky-600 font-bold hover:underline cursor-pointer">support@sembuhin.id</span>
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="pt-2"
            >
              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[20px] font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 group"
              >
                <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                Keluar Akun
              </button>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            Sembuhin Security Protocol v2.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
