import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    port: 8080,
    fs: {
      // Allow serving files from node_modules (for Human.js model files)
      allow: ['..'],
    },
  },
  build: {
    outDir: "dist",
  },
  optimizeDeps: {
    include: ["hls.js"],
    // Exclude @vladmandic/human — very large, load dynamically at runtime
    exclude: ["@vladmandic/human"],
  },
  resolve: {
    alias: {
      "hls.js": "hls.js/dist/hls.min.js",
    },
  },
});
