import ElementPlus from '@/element';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import 'virtual:uno.css';
/* 每个页面公共css */
import '@/assets/index.css';
import '@/assets/outputDefault.css';

import '@/assets/less/theme.less';

const app = createApp(App);

app.use(createPinia());
app.use(ElementPlus);
app.mount(`#app`);
