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
      autoImport: true,
    }),
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 3000,
    proxy: {
      "/api/": {
        target: "http://localhost:8000",
        changeOrigin: false,
        secure: false,
        ws: true,
      },
      "/docs": {
        target: "http://localhost:8000",
        changeOrigin: false,
        secure: false,
        ws: true,
      },
      "/oauth": {
        target: "http://localhost:8000",
        changeOrigin: false,
        secure: false,
        ws: true,
      },
      "/openapi.json": {
        target: "http://localhost:8000",
        changeOrigin: false,
        secure: false,
        ws: true,
      },
      "/versions": {
        target: "http://localhost:8000",
        changeOrigin: false,
        secure: false,
        ws: true,
      },
    },
  },
});
