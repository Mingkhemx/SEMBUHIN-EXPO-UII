/**
 * Avatar — komponen reusable untuk menampilkan foto profil atau inisial nama.
 *
 * Cara pakai:
 *   <Avatar src="https://..." name="Dr. Sarah Wijaya" className="h-12 w-12 rounded-full" />
 *
 * - Jika `src` ada & valid → tampilkan <img>
 * - Jika `src` kosong/null → tampilkan lingkaran gradient dengan inisial nama
 * - Inisial otomatis dari nama (skip gelar Dr./drs./prof.), max 2 huruf
 */

import { useState } from "react";
import { cn } from "@/lib/utils";

// Ambil inisial dari nama (max 2 huruf), contoh: "Dr. Sarah Wijaya" -> "SW"
export function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((p) => p && !/^(dr\.?|drs\.?|prof\.?|drg\.?|sp\..*)$/i.test(p));
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[1][0] : "";
  return (first + second).toUpperCase();
}

// Palet gradient yang konsisten berdasarkan hash nama.
const GRADIENTS = [
  "from-sky-500 to-cyan-400",
  "from-violet-500 to-purple-400",
  "from-rose-400 to-pink-400",
  "from-emerald-500 to-teal-400",
  "from-amber-400 to-orange-400",
  "from-blue-500 to-sky-400",
  "from-pink-400 to-rose-400",
  "from-teal-500 to-cyan-400",
  "from-fuchsia-400 to-purple-400",
  "from-indigo-500 to-blue-400",
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getGradient(name: string): string {
  return GRADIENTS[hashName(name || "?") % GRADIENTS.length];
}

export function Avatar({
  src,
  name,
  className,
  textClassName,
  rounded = "rounded-full",
  alt,
}: {
  src?: string | null;
  name: string;
  className?: string;
  textClassName?: string;
  rounded?: string;
  alt?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const showImg = src && !imgError;

  if (showImg) {
    return (
      <img
        src={src}
        alt={alt ?? name}
        onError={() => setImgError(true)}
        className={cn("object-cover", rounded, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br text-white font-bold",
        getGradient(name),
        rounded,
        className
      )}
      aria-label={name}
      role="img"
    >
      <span className={cn("leading-none", textClassName)}>
        {getInitials(name)}
      </span>
    </div>
  );
}
