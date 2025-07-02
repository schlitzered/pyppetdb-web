/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { loadFonts } from "./webfontloader";
import vuetify from "./vuetify";
import pinia from "../store";
import router from "../router/routes";
import axios from "axios";
import VueAxios from "vue-axios";

export function registerPlugins(app) {
  loadFonts();
  app.use(vuetify);
  app.use(pinia);
  app.use(router);
  app.use(VueAxios, axios);
  app.provide("axios", app.config.globalProperties.axios);
}
