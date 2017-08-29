
import ResponsiveCalendar from './components/ResponsiveCalendar.vue';
import ICALCalendar from './components/ICALCalendar.vue';
import Modal from './components/Modal.vue';

Vue.config.devtools = true;

export {ResponsiveCalendar, ICALCalendar};


export default ICALCalendar;

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.component('responsive-calendar', ResponsiveCalendar);
  window.Vue.component('responsive-calendar-ical', ICALCalendar);
  window.Vue.component('responsive-calendar-modal', Modal);
}