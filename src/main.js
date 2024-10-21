import { createApp } from 'vue';
import { Quasar } from 'quasar';
import App from './AppChat.vue';

import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/dist/quasar.css';

const myApp = createApp(App)
myApp.use(Quasar, {
  plugins: {},
  config: {
    brand: { negative: 'tomato' },
    dark: 'auto',
  },
});
myApp.mount('#app');