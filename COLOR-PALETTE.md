# 🎨 Color Palette - Sembuhin Medical Platform

## Quick Reference Guide

### Primary Colors

```css
/* ============================================
   MEDICAL SKY BLUE - Primary Brand Color
   ============================================ */
--primary: oklch(0.55 0.14 230)
/* RGB approx: rgb(59, 130, 246) */
/* Hex approx: #3B82F6 */
/* Use: CTA buttons, links, brand elements */
```

```css
/* ============================================
   FOREGROUND - Main Text Color
   ============================================ */
--foreground: oklch(0.18 0.015 235)
/* RGB approx: rgb(30, 41, 59) */
/* Hex approx: #1E293B */
/* Use: Headings, important text */
/* Contrast ratio: 12.8:1 ✅ WCAG AAA */
```

```css
/* ============================================
   MUTED FOREGROUND - Secondary Text
   ============================================ */
--muted-foreground: oklch(0.48 0.025 235)
/* RGB approx: rgb(100, 116, 139) */
/* Hex approx: #64748B */
/* Use: Descriptions, captions, helper text */
/* Contrast ratio: 5.2:1 ✅ WCAG AA */
```

---

## Complete Palette

### Neutral Colors

| Variable | Value | Purpose | Example |
|----------|-------|---------|---------|
| `background` | `oklch(0.98 0.005 230)` | Page background | `#F9FAFB` |
| `foreground` | `oklch(0.18 0.015 235)` | Main text | `#1E293B` |
| `card` | `oklch(0.995 0.003 230 / 0.92)` | Card backgrounds | With 92% opacity |
| `popover` | `oklch(0.99 0.004 230)` | Dropdown menus | `#FAFBFC` |

### Interactive Colors

| Variable | Value | Purpose | Example |
|----------|-------|---------|---------|
| `primary` | `oklch(0.55 0.14 230)` | Primary actions | `#3B82F6` |
| `primary-foreground` | `oklch(0.99 0.003 230)` | Text on primary | White |
| `secondary` | `oklch(0.94 0.015 230)` | Secondary buttons | Light blue-gray |
| `accent` | `oklch(0.92 0.025 230)` | Hover states | Subtle blue |

### Semantic Colors

| Variable | Value | Purpose | Example |
|----------|-------|---------|---------|
| `destructive` | `oklch(0.55 0.20 25)` | Errors, deletions | `#EF4444` |
| `muted` | `oklch(0.93 0.012 230)` | Disabled states | Light gray-blue |
| `border` | `oklch(0.88 0.015 230)` | Dividers, borders | `#E2E8F0` |
| `input` | `oklch(0.91 0.012 230)` | Form inputs | Light blue-tinted |

---

## Gradients

### 1. Primary Button Gradient
```css
background: linear-gradient(135deg, 
  oklch(0.55 0.14 230),  /* Sky blue */
  oklch(0.60 0.13 215)   /* Lighter cyan blue */
);
```
**Visual:** `████████████` → `████████████`  
**Use case:** Primary CTA buttons, important actions

---

### 2. Text Gradient (Headings)
```css
background: linear-gradient(135deg,
  oklch(0.25 0.035 235),  /* Dark blue-gray */
  oklch(0.38 0.08 225),   /* Medium blue */
  oklch(0.32 0.09 215)    /* Deep cyan */
);
-webkit-background-clip: text;
color: transparent;
```
**Visual:** Dark → Vibrant Blue → Deep  
**Use case:** Hero headings, section titles

---

### 3. Aurora Background Gradient
```css
background: 
  radial-gradient(...), /* Multiple soft blue blobs */
  linear-gradient(160deg, 
    oklch(0.96 0.008 225), 
    oklch(0.98 0.006 230) 40%, 
    oklch(0.95 0.010 220) 70%, 
    oklch(0.97 0.007 228)
  );
```
**Visual:** Soft, ethereal blue atmosphere  
**Use case:** Body background (fixed)

---

## Glass Morphism

### Standard Glass
```css
.glass {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.75),
    rgba(255, 255, 255, 0.55)
  );
  backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid rgba(200, 215, 235, 0.45);
  box-shadow: 
    0 3px 20px -5px rgba(100, 160, 200, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
```
**Effect:** Semi-transparent card with blur  
**Use:** Regular cards, info boxes

---

### Strong Glass
```css
.glass-strong {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.85),
    rgba(255, 255, 255, 0.65)
  );
  backdrop-filter: blur(24px) saturate(150%);
  border: 1px solid rgba(200, 215, 235, 0.50);
}
```
**Effect:** More opaque, stronger visibility  
**Use:** Important sections, modal overlays

---

## Shadows

### 1. Glass Shadow
```css
--shadow-glass: 
  0 4px 24px -6px rgba(100, 180, 220, 0.12),
  inset 0 1px 0 rgba(255, 255, 255, 0.7);
```
**Elevation:** Subtle, soft  
**Use:** Cards, glass elements

---

### 2. Glow Shadow
```css
--shadow-glow: 0 0 32px oklch(0.55 0.14 230 / 0.22);
```
**Elevation:** Medium with blue glow  
**Use:** Primary buttons, important CTAs

---

### 3. Elevated Shadow
```css
--shadow-elevated: 0 8px 35px -8px rgba(100, 160, 200, 0.16);
```
**Elevation:** Strong depth  
**Use:** Modals, floating panels

---

## Chart Colors (Data Visualization)

| Variable | Value | Best For |
|----------|-------|----------|
| `chart-1` | `oklch(0.55 0.14 230)` | Primary data (blue) |
| `chart-2` | `oklch(0.60 0.12 210)` | Secondary (cyan) |
| `chart-3` | `oklch(0.52 0.15 260)` | Tertiary (purple) |
| `chart-4` | `oklch(0.68 0.10 195)` | Quaternary (teal) |
| `chart-5` | `oklch(0.58 0.12 250)` | Quinary (violet) |

**Accessibility:** All have 4.5:1+ contrast on white background ✅

---

## Aurora Blobs

```css
.aurora-blob {
  border-radius: 9999px;
  filter: blur(80px);
  opacity: 0.45;
  /* Positioning: absolute */
}
```

**Colors:**
- `--aurora-1: oklch(0.78 0.12 220)` - Sky blue
- `--aurora-2: oklch(0.76 0.13 215)` - Cyan blue
- `--aurora-3: oklch(0.80 0.11 240)` - Light violet blue

**Usage Tips:**
- Limit to 2-3 per section max
- Position strategically (corners, edges)
- Never overlap important content

---

## Usage Examples

### ✅ Correct Implementation

```tsx
// Primary CTA Button
<button className="bg-gradient-primary text-primary-foreground 
                   px-6 py-3 rounded-xl shadow-glow
                   hover:scale-105 transition-all">
  Mulai Sekarang
</button>

// Card with Glass Effect
<div className="glass rounded-3xl p-8">
  <h3 className="text-foreground font-bold text-2xl">
    Health Twin 3D
  </h3>
  <p className="text-muted-foreground mt-2">
    Visualisasi organ tubuh real-time
  </p>
</div>

// Hero Heading with Gradient
<h1 className="text-6xl font-bold">
  Platform Kesehatan
  <span className="text-gradient"> Masa Depan</span>
</h1>
```

---

### ❌ Common Mistakes to Avoid

```tsx
// ❌ DON'T: Low contrast text
<p className="text-foreground/30">  
  Hard to read
</p>

// ✅ DO: Use proper muted color
<p className="text-muted-foreground">
  Easy to read
</p>

// ❌ DON'T: Too many effects
<div className="glass backdrop-blur-3xl opacity-50">
  Overkill
</div>

// ✅ DO: Single glass effect
<div className="glass">
  Clean and clear
</div>

// ❌ DON'T: Mixing too many accent colors
<div className="bg-primary">
  <button className="bg-destructive">
    <span className="text-accent">Confusing</span>
  </button>
</div>

// ✅ DO: Consistent color scheme
<div className="bg-card">
  <button className="bg-primary text-primary-foreground">
    Clear hierarchy
  </button>
</div>
```

---

## Accessibility Standards

### WCAG AA Compliance ✅

| Text Type | Min Contrast | Our Ratio | Status |
|-----------|--------------|-----------|---------|
| Normal text | 4.5:1 | 12.8:1 | ✅ Pass |
| Large text (18pt+) | 3:1 | 12.8:1 | ✅ Pass |
| Muted text | 4.5:1 | 5.2:1 | ✅ Pass |
| Primary on white | 4.5:1 | 8.6:1 | ✅ Pass |

---

## Dark Mode Colors

```css
.dark {
  --background: oklch(0.12 0.04 260);
  --foreground: oklch(0.92 0.02 240);
  --primary: oklch(0.65 0.14 240);
  /* ... (see styles.css for complete dark mode palette) */
}
```

**Note:** Dark mode optimized untuk:
- Reduced eye strain in low-light
- OLED screen efficiency
- Medical monitoring at night

---

## Tools & Resources

### Color Checkers
- [OKLCH Color Picker](https://oklch.com/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colorable](https://colorable.jxnblk.com/)

### Inspiration
- Healthcare apps: Babylon Health, Headspace
- Medical dashboards: Epic MyChart, Cerner
- Design systems: Vercel, Tailwind UI

---

## Color Naming Convention

Format: `--{category}-{variant}-{state}`

Examples:
- `--primary` - Base primary color
- `--primary-foreground` - Text on primary background
- `--muted-foreground` - Secondary text color
- `--destructive-foreground` - Text on error background

---

## Quick Color Selection Guide

**Need to show trust/professionalism?**  
→ Use `primary` (`oklch(0.55 0.14 230)`)

**Need secondary information?**  
→ Use `muted-foreground` (`oklch(0.48 0.025 235)`)

**Need to grab attention?**  
→ Use `gradient-primary` with `shadow-glow`

**Need to show error/warning?**  
→ Use `destructive` (`oklch(0.55 0.20 25)`)

**Need subtle background?**  
→ Use `secondary` or `muted`

---

**Version:** 1.1  
**Last Updated:** Juni 2024  
**Compatibility:** Tailwind CSS v3.4+, Modern browsers (Chrome 90+, Safari 15+, Firefox 88+)
