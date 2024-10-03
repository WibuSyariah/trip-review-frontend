import { createApp } from "vue";
import { createPinia } from "pinia";
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-default.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";

import App from "./App.vue";
import router from "./router";
import "./assets/main.css";

const app = createApp(App);
const pinia = createPinia();
const vuetify = createVuetify();

app.use(router);
app.use(pinia);
app.use(vuetify);
app.use(ToastPlugin, {
  position: "top-right",
  duration: 3000,
  queue: true,
});

app.mount("#app");
