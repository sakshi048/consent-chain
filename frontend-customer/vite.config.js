import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      "/api/bank": {
        target: "http://127.0.0.1:8081",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/bank/, ""),
      },
    },
  },
});
