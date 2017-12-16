//TODO: Only use polyfill if needed
import "babel-polyfill";

import Vue from 'vue';
import vueApp from './App.vue'

import ResponsiveCalendar from '../index';


Vue.use(ResponsiveCalendar);


new Vue(vueApp).$mount('#app')

