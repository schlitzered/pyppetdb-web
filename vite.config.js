// Plugins
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// Utilities
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: !process.env.VITEST,
    }),
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
  server: {
    port: 3000,
    proxy: {
      "/api/": {
        target: "https://localhost:8000",
        changeOrigin: false,
        secure: false,
        ws: true,
      },
      "/docs": {
        target: "https://localhost:8000",
        changeOrigin: false,
        secure: false,
        ws: true,
      },
      "/oauth": {
        target: "https://localhost:8000",
        changeOrigin: false,
        secure: false,
        ws: true,
      },
      "/openapi.json": {
        target: "https://localhost:8000",
        changeOrigin: false,
        secure: false,
        ws: true,
      },
      "/versions": {
        target: "https://localhost:8000",
        changeOrigin: false,
        secure: false,
        ws: true,
      },
    },
  },
});
