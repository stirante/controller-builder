import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import JsonViewer from 'vue-json-viewer'
// import styleDrawflow from 'drawflow/dist/drawflow.min.css'

// Vue.use(styleDrawflow);
Vue.use(JsonViewer);

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
