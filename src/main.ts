import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import manifest from '../package.json';

Vue.config.productionTip = false;
Vue.prototype.$projectName = manifest.name.replace(/^./, t => t.toUpperCase());
Vue.prototype.$projectVersion = manifest.version;

Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: (h) => h(App)
}).$mount('#app');
