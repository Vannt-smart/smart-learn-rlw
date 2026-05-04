import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
        proxyTimeout: 60000,  // 60s – prevents ERR_CONNECTION_ABORTED on file uploads
        timeout: 60000,
      },
      "/uploads": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
        proxyTimeout: 60000,
        timeout: 60000,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Loại trừ pdfjs-dist khỏi quá trình pre-bundle của Vite (dev server).
    // pdfjs-dist chạy code browser-API ngay khi module được khởi tạo, gây lỗi
    // "TypeError: Illegal constructor" nếu esbuild đưa nó vào bundle sớm.
    exclude: ["pdfjs-dist"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Tách pdfjs-dist thành chunk riêng trong production build.
          // Kết hợp với React.lazy trên UploadPage, đảm bảo pdfjs không bao giờ
          // chạy lúc khởi động app.
          "pdfjs-dist": ["pdfjs-dist"],
        },
      },
    },
  },
}));
