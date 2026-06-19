import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mx-auto mt-32 max-w-7xl px-4 pb-20">
      <div className="glass-strong rounded-[3rem] p-10 md:p-16 border border-sky-100/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
        {/* Footer gradient blobs */}
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-sky-200/25 via-blue-100/15 to-transparent blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[350px] h-[350px] rounded-full bg-gradient-to-tl from-cyan-200/20 via-sky-100/10 to-transparent blur-[70px] pointer-events-none" />
        
        <div className="grid gap-12 md:grid-cols-4 relative z-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <img
                src="gif_logo/logo.png"
                alt="Sembuhin"
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="mt-6 text-muted-foreground max-w-md leading-relaxed">
              Platform kesehatan terintegrasi pertama di dunia yang menggabungkan AI Diagnosis, Marketplace Farmasi, dan Digital Health Twin dalam satu ekosistem holografik.
            </p>
            <div className="mt-8 flex items-center gap-5">
              {[
                { src: "/assets/ig.png", label: "Instagram", href: "https://instagram.com/sembuhin" },
                { src: "/assets/tiktok.png", label: "TikTok", href: "https://tiktok.com/@sembuhin" },
                { src: "/assets/X_icon.svg", label: "X (Twitter)", href: "https://x.com/sembuhin" },
                { src: "/assets/yt.png", label: "YouTube", href: "https://youtube.com/@sembuhin" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group inline-flex items-center justify-center h-11 w-11 transition-all duration-200 hover:scale-110"
                >
                  <img
                    src={social.src}
                    alt={social.label}
                    className="h-9 w-9 object-contain opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-sm group-hover:drop-shadow-md"
                  />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Layanan</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/marketplace" className="hover:text-sky-600 transition-colors">Apotek Digital</Link></li>
              <li><Link to="/dokter" className="hover:text-sky-600 transition-colors">Dokter Spesialis</Link></li>
              <li><Link to="/konsul" className="hover:text-sky-600 transition-colors">Konsultasi AI</Link></li>
              <li><Link to="/twin" className="hover:text-sky-600 transition-colors">Health Twin 3D</Link></li>
              <li><Link to="/resep" className="hover:text-sky-600 transition-colors">Resep Digital</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Perusahaan</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>Tentang Kami</li>
              <li>Karir</li>
              <li>Kebijakan Privasi</li>
              <li>Syarat & Ketentuan</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Sembuhin International. Seluruh hak cipta dilindungi.</p>
          <p className="px-4 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            ⚠️ Disclaimer: Bukan pengganti saran medis profesional dari dokter berlisensi.
          </p>
        </div>
      </div>
    </footer>
  );
}
