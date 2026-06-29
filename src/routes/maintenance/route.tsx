import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Settings, Clock, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/maintenance")({
  component: MaintenancePage,
});

function MaintenancePage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white">
      {/* Background decoration - subtle light blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-sky-50/50 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-blue-50/50 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-50/30 blur-[150px]" />
      </div>
      
      <div className="relative z-10 px-4 py-12 text-center max-w-2xl">
        {/* Animated GIF Illustration */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-8 relative"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-sky-400/20 rounded-full blur-3xl group-hover:bg-sky-400/30 transition-all duration-500" />
            <img 
              src="/perbaikan.gif" 
              alt="Sedang Perbaikan" 
              className="relative w-64 h-64 md:w-80 md:h-80 object-contain mx-auto drop-shadow-2xl"
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Sembuhin Sedang dalam <br />
            <span className="text-sky-600">
              Tahap Perbaikan
            </span>
          </h1>
          
          <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">
            Kami sedang melakukan pembaharuan sistem untuk memberikan pengalaman layanan kesehatan yang lebih baik. 
            Mohon maaf atas ketidaknyamanannya.
          </p>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
            <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-sm">Estimasi Selesai</h4>
                <p className="text-slate-500 text-xs mt-1">Kami akan segera kembali dalam beberapa jam ke depan.</p>
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-sm">Data Tetap Aman</h4>
                <p className="text-slate-500 text-xs mt-1">Seluruh data rekam medis dan profil Anda terjamin keamanannya.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em]">
          © 2026 Sembuhin — Digital Healthcare Ecosystem
        </p>
      </div>
    </div>
  );
}
