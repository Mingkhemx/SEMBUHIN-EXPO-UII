import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { HeartPulse, Smartphone, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { io, Socket } from 'socket.io-client'
import { PremiumGate } from '@/components/PremiumGate'

export const Route = createFileRoute('/cek-jantung')({
  component: CekJantungPage,
})

function CekJantungPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [heartRate, setHeartRate] = useState<number | null>(null)
  const [pairCode] = useState(() => {
    // Generate random code yang keren (6 karakter)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      if (i === 3) result += '-';
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  })
  const socketRef = useRef<Socket | null>(null);

  // LOGIKA KONEKSI WEBSOCKET (SOCKET.IO)
  useEffect(() => {
    // Hubungkan ke Node.js server kita (berjalan di port 3001 pada IP mesin ini)
    const host = window.location.hostname;
    const socket = io(`http://${host}:3001`);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Berhasil terkoneksi ke Backend WebSocket');
      // Otomatis daftar ke ruangan berdasarkan pairCode
      socket.emit('join_room', pairCode);
    });

    // Menerima data dari aplikasi mobile
    socket.on('receive_heart_rate', (bpm: number) => {
      setHeartRate(bpm);
      setIsConnected(true);
    });

    socket.on('pairing_status', (status: { success: boolean, message: string }) => {
      console.log('📡 Status Pairing:', status);
      if (!status.success) {
        alert(status.message);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [pairCode]);

  // Tombol simulasi ini akan BERTINDAK SEBAGAI HP ANDA untuk testing
  const simulateFromPhone = () => {
    if (!socketRef.current) return;
    
    // Matikan simulasi jika sedang jalan
    if (isConnected) {
      setIsConnected(false);
      setHeartRate(null);
      return;
    }

    // Jika belum jalan, kita mulai kirim data seolah-olah kita ini HP
    // Di aplikasi beneran, script interval ini ada di Android/iOS kalian.
    let currentBpm = 75;
    socketRef.current.emit('send_heart_rate', { room: pairCode, bpm: currentBpm });
    
    const interval = setInterval(() => {
      if (!socketRef.current) return;
      const variance = Math.floor(Math.random() * 7) - 3;
      currentBpm = Math.max(60, Math.min(100, currentBpm + variance));
      
      // Kirim ke server
      socketRef.current.emit('send_heart_rate', { room: pairCode, bpm: currentBpm });
    }, 1000);

    // Simpan id interval di window untuk dibersihkan (hanya untuk hack demo simulasi)
    (window as any).simInterval = interval;
  }

  // Bersihkan interval simulasi saat toggle 
  useEffect(() => {
    if (!isConnected && (window as any).simInterval) {
      clearInterval((window as any).simInterval);
    }
  }, [isConnected]);

  return (
    <PremiumGate>
      <div className="min-h-screen py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-12">
          
          {/* Header Title */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-sm font-bold tracking-wide">
              <Activity className="h-4 w-4" />
              Integrasi Biometrik Real-time
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Monitor <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-400">Detak Jantung</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Hubungkan smartphone Anda untuk mulai melakukan monitoring detak jantung secara instan.
            </p>
          </div>

          {/* Content Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Panel Status & Instruksi */}
            <div className="glass-strong rounded-[2.5rem] p-8 border border-border shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">Status Koneksi</h2>
                  
                  {isConnected ? (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-emerald-400">Perangkat Terhubung</h3>
                        <p className="text-sm text-emerald-400/80 mt-1">
                          Menerima transmisi data biometrik dari HP Anda dengan stabil.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                      <AlertTriangle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-rose-400">Belum Ada Perangkat</h3>
                        <p className="text-sm text-rose-400/80 mt-1">
                          Anda tidak dapat melakukan pengecekan karena smartphone belum terhubung. Silakan lakukan pairing terlebih dahulu.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {!isConnected && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-muted-foreground">Cara Menghubungkan:</h3>
                    <ul className="space-y-3">
                      {[
                        "Buka aplikasi Sembuhin di smartphone Anda.",
                        "Masuk ke menu 'Sinkronisasi Perangkat'.",
                        "Masukkan kode pairing di bawah ini."
                      ].map((step, i) => (
                        <li key={i} className="flex items-center gap-3 text-muted-foreground">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                            {i + 1}
                          </div>
                          {step}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 p-6 rounded-2xl bg-muted/50 border border-border text-center space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Kode Pairing Anda</p>
                      <p className="font-display text-4xl font-extrabold tracking-widest text-foreground">{pairCode}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol Simulasi untuk Keperluan Demo Saja */}
              <div className="mt-8 pt-6 border-t border-border">
                 <button 
                  onClick={simulateFromPhone}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-muted hover:bg-accent px-4 py-3 text-sm font-bold text-muted-foreground transition-colors"
                >
                  <RefreshCw className={cn("h-4 w-4", isConnected && "animate-spin")} />
                  {isConnected ? "Putuskan Koneksi" : "Simulasikan Koneksi DARI HP"}
                </button>
              </div>
            </div>

            {/* Panel Monitor Detak Jantung */}
            <div className="glass-strong rounded-[2.5rem] p-8 border border-border shadow-2xl flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
              
              {/* Ambient Background Glow based on connection wait/active state */}
              <div className={cn(
                "absolute inset-0 opacity-20 blur-[100px] transition-all duration-1000",
                isConnected ? "bg-rose-500" : "bg-slate-500"
              )} />

              <AnimatePresence mode="wait">
                {isConnected ? (
                  <motion.div 
                    key="connected"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative z-10 flex flex-col items-center justify-center w-full"
                  >
                    <p className="text-rose-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                      <HeartPulse className="h-5 w-5 animate-pulse" /> Live Monitoring
                    </p>
                    
                    {/* Detak Jantung Utama */}
                    <div className="relative flex items-center justify-center h-48 w-48 rounded-full border-4 border-rose-500/20 mb-8">
                       {/* Pulse Effect */}
                      <div className="absolute inset-0 rounded-full border-4 border-rose-500/40 animate-ping opacity-20" style={{ animationDuration: '1.5s' }} />
                      <div className="absolute inset-0 rounded-full border-4 border-rose-500/30 animate-ping opacity-20" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                      
                      <div className="text-center">
                        <div className="font-display text-7xl font-bold text-foreground tracking-tighter">
                          {heartRate}
                        </div>
                        <div className="text-rose-400/80 font-medium">BPM</div>
                      </div>
                    </div>

                    {/* Grafik Dummy Simple */}
                    <div className="w-full flex items-end justify-center gap-1 h-12 opacity-60">
                      {[3, 7, 4, 8, 5, 9, 4, 3, 6, 8, 5, 7, 4].map((h, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: isConnected ? `${h * 10}%` : '10%' }}
                          transition={{ repeat: Infinity, duration: 0.5 + (i%3)*0.2, repeatType: "reverse" }}
                          className="w-full max-w-[8px] bg-rose-500 rounded-t-sm"
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="disconnected"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 flex flex-col items-center text-center max-w-sm"
                  >
                    <div className="flex items-center justify-center h-24 w-24 rounded-full bg-muted border border-border text-muted-foreground mb-6">
                      <HeartPulse className="h-10 w-10 opacity-50" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-muted-foreground mb-2">Monitor Offline</h3>
                    <p className="text-muted-foreground">
                      Menunggu koneksi dari perangkat mobile untuk mulai menampilkan detak jantung.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </PremiumGate>
  )
}
