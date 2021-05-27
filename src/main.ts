import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import iview from 'view-design'
Vue.use(iview, {
  capture: false,
  // transfer: true,
  size: 'default'
})

Vue.config.productionTip = false

const eventBus = new Vue()
window.eventBus = eventBus

import './assets/theme.less'
import './assets/reset.less'

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
