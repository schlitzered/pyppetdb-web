/*
 * Copyright 2026 Stephan Schultchen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        find: /^lodash\/(.*)$/,
        replacement: "lodash/$1.js",
      },
    ],
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  ssr: {
    noExternal: ["lodash", "@jsonforms/vue-vuetify"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["tests/e2e/**", "node_modules/**"],
    server: {
      deps: {
        inline: ["vuetify"],
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api/": {
        target: "https://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
        secure: false,
        ws: true,
      },
      "/docs": {
        target: "https://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
        secure: false,
        ws: true,
      },
      "/oauth": {
        target: "https://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
        secure: false,
        ws: true,
      },
      "/openapi.json": {
        target: "https://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
        secure: false,
        ws: true,
      },
      "/versions": {
        target: "https://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
        secure: false,
        ws: true,
      },
    },
  },
});
