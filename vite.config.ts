import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // Kích hoạt bộ máy Tailwind v4 ở đây
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    fs: {
      // Only allow serving files from the project source, not from
      // environment folders like skills/, examples/, download/, upload/
      allow: [path.resolve(__dirname, "./src"), path.resolve(__dirname, "./public"), path.resolve(__dirname, "./index.html")],
    },
  },
  optimizeDeps: {
    // Only scan the app entry, avoid scanning skills/ HTML reference files
    entries: ["index.html", "src/main.tsx"],
  },
})