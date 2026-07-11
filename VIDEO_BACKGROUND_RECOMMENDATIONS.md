# Professional Video Background Recommendations

## 🎬 Where to Find Videos

### Recommended Platforms:

1. **Pexels Videos** (Free) - https://www.pexels.com/search/videos/
2. **Pixabay Videos** (Free) - https://pixabay.com/videos/
3. **Unsplash Videos** (Free) - https://unsplash.com/videos
4. **Shutterstock** (Paid) - https://www.shutterstock.com/video/
5. **Adobe Stock** (Paid) - https://stock.adobe.com/video/

## 🔍 Search Keywords for Healthcare Theme

### Primary Keywords:

- `medical professional`
- `healthcare provider`
- `doctor office`
- `health clinic`
- `hospital interior`
- `medical technology`
- `health examination`
- `wellness professional`

### Secondary Keywords:

- `health care`
- `medical science`
- `laboratory`
- `diagnostic`
- `patient care`
- `healthcare worker`
- `telemedicine`
- `health technology`

## ✅ Ideal Video Characteristics

### Technical Specs:

- **Resolution**: 1920x1080 (1080p) minimum, 4K preferred
- **Aspect Ratio**: 16:9 (widescreen)
- **Frame Rate**: 24fps or 30fps (60fps untuk smooth effect)
- **File Format**: MP4 (H.264 codec)
- **Duration**: 5-15 seconds (looping video)
- **File Size**: < 5MB untuk optimal loading (after compression)

### Visual Characteristics:

- **Lighting**: Soft, professional lighting (tidak terlalu terang)
- **Color Tone**: Cool tones (blue, white, grey) atau warm professional (beige, brown)
- **Subject**: Healthcare professional, medical equipment, atau clinical setting
- **Depth**: Shallow depth of field (blurred background) preferred
- **Motion**: Smooth camera movement (pan/zoom) atau slow subject movement
- **Clarity**: HD quality, minimal grain/noise

### Content Guidelines:

✅ **Perfect For**:

- Close-up shots dari healthcare professional
- Doctor sedang memeriksa patient (respectful angle)
- Medical equipment atau laboratory setup
- Hospital corridor atau medical office
- Healthcare meeting atau consultation
- Blurred medical background dengan clear foreground

❌ **Avoid**:

- Graphic medical procedures
- Emergency/trauma scenes
- Overly emotional content
- Patients in distress
- Unclear or low-quality videos
- Videos dengan big watermarks/logos
- Content dengan strict copyright

## 🎨 Color Schemes That Work Well

### Option 1: Cool Professional (Recommended for Sembuhin)

```
Primary: Blues, Cyans, Whites
Secondary: Grays, Light Greens
Overlay: Dark gradient (current setup)
Result: Professional, trustworthy, medical
```

### Option 2: Warm Professional

```
Primary: Warm whites, beiges, light oranges
Secondary: Warm grays, soft browns
Overlay: Warm dark gradient
Result: Friendly, approachable, caring
```

### Option 3: Modern Clinical

```
Primary: Pure white, light gray, blacks
Secondary: Accent colors (minimal)
Overlay: Strong dark gradient
Result: Modern, cutting-edge, technical
```

## 📥 Download & Setup Instructions

### Step 1: Find Video

1. Go to https://www.pexels.com/search/videos/
2. Search using keywords above
3. Filter by resolution (1080p+)
4. Preview video (watch for quality)
5. Check viewing rights (usually free for commercial use)

### Step 2: Download

1. Click download button
2. Select resolution (HD preferred)
3. Save file as: `hero-bg-medical.mp4`

### Step 3: Compress (if needed)

```bash
# Using FFmpeg (install: brew install ffmpeg)
ffmpeg -i downloaded_video.mp4 -b:v 2500k -b:a 128k hero-bg-medical.mp4

# For slower internet (< 3MB)
ffmpeg -i downloaded_video.mp4 -b:v 1500k -b:a 96k -s 1920x1080 hero-bg-medical.mp4
```

### Step 4: Place File

```
/home/migwara/Documents/Sembuhin/
└── public/
    └── hero-bg-medical.mp4  ← Place here
```

### Step 5: Test

- Open `http://localhost:5173/beranda`
- Video should play on loop
- Check no errors in console
- Test on mobile (responsive)

## 🎯 Recommended Videos Examples

If you need specific recommendations, look for videos with these characteristics:

### Healthcare Professional (Best Choice)

- **Setting**: Modern clinic or hospital
- **Subject**: Doctor, nurse, or healthcare provider
- **Activity**: Discussing, examining, working at desk
- **Lighting**: Professional, well-lit
- **Duration**: 8-12 seconds
- **Camera**: Slight pan or zoom

### Medical Technology (Modern Look)

- **Setting**: Lab or modern facility
- **Subject**: Medical equipment or technology
- **Activity**: Working with equipment, data analysis
- **Lighting**: Clean, clinical lighting
- **Duration**: 10-15 seconds
- **Camera**: Smooth zoom or pan

### Health Consultation (Engaging)

- **Setting**: Clinical or office environment
- **Subject**: Consultation between professional and person
- **Activity**: Discussion or examination
- **Lighting**: Warm professional lighting
- **Duration**: 10-12 seconds
- **Camera**: Medium shot, stable

## 📊 Performance Optimization

### File Size Management:

```
Target: < 5MB (ideal < 3MB)

Bitrate Options:
- Full HD 1920x1080: 2000-2500 kbps
- HD 1280x720: 1200-1500 kbps
- Mobile optimized: 800-1200 kbps
```

### Loading Strategy:

- Video akan lazy-load pada hero section
- Background fallback gradient jika video gagal load
- Autoplay tanpa sound untuk better UX
- Loop infinite

### Browser Compatibility:

- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (iOS 11+)
- ✅ Mobile browsers: Full support

## 🎬 Testing Video

After uploading, test:

```javascript
// Open browser console and run:
const video = document.querySelector("video");
console.log("Video loaded:", video.readyState === 4);
console.log("Duration:", video.duration, "seconds");
console.log("Current time:", video.currentTime);
console.log("Playing:", !video.paused);
```

## 💡 Pro Tips

1. **Multiple Formats**: Consider having fallback image if video fails
2. **Thumbnail**: Add poster image untuk loading state
3. **Autoplay Policy**: Muted autoplay works best on modern browsers
4. **Optimization**: Test on slow 3G connection
5. **Analytics**: Track video performance dengan Sentry/Datadog
6. **Responsive**: Video scales beautifully (sudah included in code)

## 🔗 Quick Links

- Pexels Videos: https://www.pexels.com/search/videos/
- FFmpeg Download: https://ffmpeg.org/download.html
- Video Compressor: https://www.freeconvert.com/video-compressor/
- Quality Check: https://www.youtube.com/quality/
- Performance: https://web.dev/video/

---

**Next Action**:

1. Choose and download video from Pexels
2. Compress if needed
3. Place in `/public/` folder
4. Test on localhost
5. Push to GitHub when ready!
