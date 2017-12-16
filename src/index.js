import ResponsiveCalendar from './components/ResponsiveCalendar.vue';
import Modal from './components/Modal.vue';

// Install the components
export function install (Vue) {
  Vue.component('responsive-calendar', ResponsiveCalendar);
  Vue.component('responsive-calendar-modal', Modal);
}

// Expose the components
export {
  ResponsiveCalendar,
  Modal
}

/* -- Plugin definition & Auto-install -- */
/* You shouldn't have to modify the code below */

// Plugin
const plugin = {
  /* eslint-disable no-undef */
  version: VERSION,
  install,
}

export default plugin

// Auto-install
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}
