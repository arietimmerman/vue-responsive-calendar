import Moment from 'moment';

import {
	extendMoment
} from 'moment-range';
import ResponsiveCalendar from '../index';
window.moment = extendMoment(Moment);

Vue.use(ResponsiveCalendar);

var today = new Date();

var events = [];

var calendars = ['example1','example2','example3'];

var titles = ['Football Event','Playing Bingo','Studying','Meeting with John','Meeting with Isabel','Daily Scrum','Preparing presentation','Presenting Something Important','Travel time'];

var locations = ['New York','Amsterdam','Hilversum, Larenseweg 512','2nd floor, Cap Office','Coffeeshop'];

var descriptions = ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.','Sed ut perspiciatis unde omnis iste natus error','vel illum qui dolorem eum fugiat quo voluptas nulla pariatur','sed quia non numquam','Neque porro quisquam est','Ut enim ad minima veniam.'];

const range = moment.range(moment().subtract(14, 'days'), moment().add(14,'days'));

for (let day of range.by('day')) {

  for(let i = 0; i < Math.floor(Math.random() * 6) + 1;i++){

    var startQ = Math.floor(Math.random() * 24*4) + 1;
    var endQ = startQ + Math.floor(Math.random() * ((24*4)-startQ) ) + 1;

    events.push(
      {
        dateStart: day.clone().add(startQ/4.0*3600,'seconds').toDate(),
        dateEnd: day.clone().add(endQ/4.0*3600,'seconds').toDate(),
        styleClass: null,
        calendarName: calendars[Math.floor(Math.random() * 3)],
        summary: titles[ Math.floor(Math.random() * titles.length ) ],
        description: descriptions[ Math.floor(Math.random() * descriptions.length ) ],
        location: locations[ Math.floor(Math.random() * locations.length ) ]
      }
    );

  }
  
}

const app = new Vue({

  el: '#app',
  mounted: function () {
    console.log('mounted!');
  },
  data: {
    calendarInformation: {
      'example1': {
        name: 'example1',
        displayName: 'Example Calendar',
        color: '#de6e4b'
      },
      'example2': {
        name: 'example2',
        displayName: 'Another One',
        color: '#7fd1b9'
      },
      'example3': {
        name: 'example3',
        displayName: 'Important One',
        color: '#e56399'
      }
    },
    events: events

  }
});