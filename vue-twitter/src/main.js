import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./index.css";
import "./assets/main.css"; // ← ここ絶対必要！

createApp(App).use(router).mount("#app");
