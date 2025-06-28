import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    // Disable runtime error overlay as it may use WebSockets
    // runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: false,
      allow: [
        path.resolve(import.meta.dirname),
      ],
    },
    hmr: false, // Disable HMR completely
    ws: false, // Explicitly disable WebSocket server
    host: "0.0.0.0",
    port: 5173,
    // Force polling instead of file watching to avoid WebSocket usage
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  // Disable all client-side features that might use WebSockets
  define: {
    __VITE_IS_MODERN__: false,
  },
});