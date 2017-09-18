
import ResponsiveCalendar from './components/ResponsiveCalendar.vue';
import ICALCalendar from './components/ICALCalendar.vue';
import Modal from './components/Modal.vue';

export {ResponsiveCalendar, ICALCalendar};

export default ResponsiveCalendar;

if (typeof window !== 'undefined' && window.Vue) {
  console.log('register vue-responsive-calendar components!');
  
  window.Vue.component('responsive-calendar', ResponsiveCalendar);
  window.Vue.component('responsive-calendar-ical', ICALCalendar);
  window.Vue.component('responsive-calendar-modal', Modal);
}