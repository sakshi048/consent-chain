import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "..", "");
  const bank = {
    target: env.FIP_BASE_URL || "http://127.0.0.1:8081",
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/api\/bank/, ""),
    configure(proxy) {
      proxy.on("proxyReq", (req) => {
        if (env.AA_API_KEY) req.setHeader("X-AA-Token", env.AA_API_KEY);
      });
    },
  };
  const proxy = {
    "/api/bank": bank,
    "/api/aa": {
      target: "http://127.0.0.1:8082",
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\/api\/aa/, ""),
    },
  };
  return {
    plugins: [react()],
    server: { port: 5173, strictPort: true, proxy },
    preview: { port: 4173, proxy },
  };
});
