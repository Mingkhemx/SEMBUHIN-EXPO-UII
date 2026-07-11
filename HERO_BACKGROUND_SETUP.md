# Hero Section Background Setup Guide

## Video Background Instructions

Anda telah mengupdate hero section dengan desain yang lebih profesional dan modern. Sekarang saatnya mengganti video background dengan video profesional dari Pexels.

### Langkah-langkah:

1. **Kunjungi Pexels Videos**: https://www.pexels.com/search/videos/
   
2. **Cari Video yang Sesuai**:
   - Search keywords: "medical", "healthcare", "doctor", "hospital", "health professional", atau "wellness"
   - Filter untuk video berkualitas tinggi (1080p atau lebih)
   - Pilih video yang:
     - Memiliki tone profesional dan clean
     - Tidak terlalu "busy" (background ok sebagai bokeh)
     - Durasi minimal 5-10 detik untuk loop yang smooth
     - Resolusi minimal 1920x1080

3. **Download Video**:
   - Download dalam format MP4
   - Rename file ke: `hero-bg-medical.mp4`

4. **Simpan File**:
   - Letakkan di folder: `/public/`
   - Full path: `/public/hero-bg-medical.mp4`

5. **Test & Optimize**:
   - Setelah di-upload, buka halaman beranda di browser
   - Test video loading di berbagai koneksi internet
   - Pastikan video smooth dan tidak lag

### Video Quality Tips:

✅ **Baik untuk hero section:**
- Video medis profesional dengan doctor/healthcare workers
- Blurred background dengan subject jelas
- Soft lighting dengan tone biru-putih
- Healthcare equipment atau laboratorium yang clean
- Wellness atau fitness professionals

❌ **Hindari:**
- Video yang terlalu cerah/terang
- Video dengan terlalu banyak action/movement
- Video dengan text overlay
- Video dengan watermark besar

### File Size Optimization:

Jika file terlalu besar (> 10MB), gunakan:
- FFmpeg: `ffmpeg -i input.mp4 -b:v 2000k -b:a 128k output.mp4`
- Online tool: https://www.freeconvert.com/video-compressor

### CSS Styling:

Styling sudah di-setup untuk:
- Multiple overlay gradients (professional look)
- Responsive sizing untuk semua devices
- Smooth fade dan transitions
- Dark overlay untuk text readability

### Testing Checklist:

- [ ] Video loads without errors
- [ ] Video plays smoothly on desktop
- [ ] Video plays smoothly on mobile
- [ ] Text readable over video
- [ ] CTA buttons visible and clickable
- [ ] Performance tidak lag (check Chrome DevTools)

---

**Catatan**: Semua overlay dan styling sudah professional dan tidak perlu di-edit. Hanya perlu ganti video background saja.
