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
    // pdfjs-dist sử dụng các Web API (Worker, Blob, ...) ngay khi module được khởi tạo.
    // Nếu để Vite pre-bundle nó, esbuild sẽ chạy code đó trước khi có browser context
    // và gây ra lỗi "TypeError: Illegal constructor".
    // Loại trừ nó khỏi quá trình tối ưu để browser tự load trực tiếp khi cần.
    exclude: ["pdfjs-dist"],
  },
}));
