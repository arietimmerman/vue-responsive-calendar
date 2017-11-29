
import Vue from 'vue';
import Demo from './Demo.vue';
import ResponsiveCalendar from '../index';
Vue.use(ResponsiveCalendar);

new Vue({

  el: '#app',

  render: h => h(Demo),  

  mounted: function () {
    console.log('mounted!');
  },
  
});