import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/main.css'
import './assets/tailwind.css'
import ElementPlus from "element-plus";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

// 配置 i18n
import i18n from "./language";

import router from './router'

import { setupStore } from "./store";

const app = createApp(App)

app.use(ElementPlus, {
	locale: zhCn,
});


setupStore(app)
app.use(i18n);
app.use(router)
app.mount('#app')

