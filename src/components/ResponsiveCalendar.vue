<!--
The responsive calendar component for vue.js
-->
<style lang="scss">
@import '../assets/sass/calendar.scss';
</style>

<template>
<div ref="calendarcontainer" class="container h-100 w-100 mw-100 calendar-container" v-bind:class="['max-size-' + this.maxSize.toLowerCase(), isLoading ? 'isLoading' : '' ]">

	<div class="d-flex justify-content-between align-items-center menu">
		
		<!-- Buttons top left -->
		<div>
			<a class="btn btn-secondary btn-calendar btn-sm" @click="showToday"> 
				{{ today.format('D') }}
			</a>

			<div class="btn-group" role="group" aria-label="Basic example">

				<a class="btn btn-secondary btn-calendar btn-sm ml-1 left-button" @click="prev"> </a>
				<a class="btn btn-secondary btn-calendar btn-sm right-button" @click="next"></a>

			</div>

			<p class="date-range ml-2 hidden show-m-size">{{ rangeToString(fromDate, toDate) }}</p>

		</div>

		<!-- Buttons top right -->
		<div>

			<button class="btn btn-secondary btn-calendar btn-sm mr-1 bars-button" type="button" v-if="Object.keys(calendarInformation).length > 0" @click="showCalendarPicker = true">
						
			</button>

			<div class="btn-group pull-right" role="group" aria-label="Basic example">
				<a class="btn btn-secondary btn-calendar btn-sm" :class="{'btn-active': this.viewActive == 'view-1'}" @click="showOneDay"><span class="hidden-m-size">1</span><span class="hidden show-m-size">{{ i18n.day }}</span></a>
				<a class="btn btn-secondary btn-calendar btn-sm" :class="{'btn-active': this.viewActive == 'view-7'}" @click="showWeek">{{ i18n.week }}</a>
				<a class="btn btn-secondary btn-calendar btn-sm" :class="{'btn-active': this.viewActive == 'view-4'}" @click="showFourDay"><span class="hidden-m-size">4</span><span class="hidden show-m-size">{{ i18n.days4 }}</span></a>
			</div>

		</div>
	</div>

	<div class="month" v-if="template == 'month'">

		<!-- TODO: implement month -->

	</div>


	<template v-else>
		<!-- TODO: consider adding an extra element with a possible scrollbar. Set scrollStart on Vue mounted -->
		<div class="pages">

		<!-- some are current, some are prev, some are next -->
		<div v-for="page in agendaItemPages" class="page" :style="{'marginLeft':currentMarginLeft +'px'}">

		<div class="dayline" :class="[viewActive]">
			<ul>

				<li class="top-info" v-for="day in page.days" v-bind:class="{today: day.isSame(today,'day'), selected: day.isSame(dateActive,'day') } ">

					<a class="d-flex mt-1 justify-content-center" @click="setDateRange(day,day)">
						<span class="p-0 text-center">{{ day.format('dd') }}</span>
						<span class="day p-0 text-center">{{ day.format('D') }}</span>
					</a>

				</li>

			</ul>
		</div>

		<div class="calendar d-flex flex-row" ref="calendar">

			<div class="timeline">
				<ul class="d-flex justify-content-around flex-column">
					<li v-for="timeItem in allTimes()">
						<span>{{ timeItem }}</span>
					</li>
				</ul>
			</div>

			<div class="events" v-bind:style="{ backgroundImage: backgroundImage, backgroundPosition: backgroundPosition }">

				<ul>
					<li v-for="(item, key) in page.agendaItems" class="events-group" v-bind:class="{today: key == today}" v-bind:style="{ width : (100.0/7.0) + '%'}">

						<ul>
							<template v-for="event in item">

								<li v-bind:style="[event.style, eventStyleReset]" v-if="getTime(event.dateStart) != null && getTime(event.dateEnd) != null"
								    class="single-event" data-event="event-1" v-bind:class="event.styleClass">
									<a href="#0" @click="openModal(event)">
										<span class="event-date">{{ getTime(event.dateStart) }} - {{ getTime(event.dateEnd) }}</span>
										<span class="event-name">{{ event.summary ? event.summary : event.item.summary }}</span>
									</a>
								</li>

							</template>
						</ul>
					</li>

				</ul>
			</div>

		</div>

		<div id="loader"></div>

		</div>
		</div>
	</template>

	<modal-detail v-if="showModal" @close="showModal = false">
		<h3 slot="header">{{ currentEvent.summary ? currentEvent.summary : currentEvent.item.summary }}</h3>

		<p slot="body">{{ currentEvent.description }}</p>
		<!--
		<span slot="date">{{ getTime(currentEvent.dateStart) }} - {{ getTime(currentEvent.dateEnd) }}</span>
		<span slot="location">{{ currentEvent.location }}</span>

		<span @click="showModal = false; showCalendarPicker = true;" slot="calendar" v-if="currentEvent.calendarName"><span class="badge badge-pill badge-primary" :style="{'backgroundColor': getCalendarInformation(currentEvent.calendarName).color }">{{ getCalendarInformation(currentEvent.calendarName).displayName }}</span></span>
		-->
	</modal-detail>

	<modal-detail v-if="showCalendarPicker" @close="showCalendarPicker = false">

		<h3 slot="header">Calendars</h3>
		<span slot="date"></span>
		<p slot="body">

			<template v-for="calendar in Object.values(calendarInformation)">
				<div>
					<input class="checkbox-custom" type="checkbox" :value="calendar.name" :id="calendar.name" v-model="enabledCalendars" /> 
					<label :style="{color: calendar.color}" :for="calendar.name" class="checkbox-custom-label"><span style="color: #222222;;">{{ calendar.displayName }}</span></label>
				</div>
			</template>

		</p>

		<span slot="location"></span>
	</modal-detail>


</div>
</template>

<script>

//document.querySelector('li[data-v-c001343a]').getBoundingClientRect()

import _ from 'lodash';
import Moment from 'moment';

//	import touch from '../assets/js/touch';

import {
	extendMoment
} from 'moment-range';

import Modal from './Modal.vue'

const moment = extendMoment(Moment);

var moveStart = null;

var agendaItems = null;

var timelineStart = null;
var timelineEnd = null;
var timelineDuration = null;

//TODO: detect swipe, if left, move to previous week. If right, move to next week.
// See: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
// Start moving immediatly. Move in px ... Stick to percentages 

//TODO: Create something like  `new DateRange(start,end)  (with new Day(day) components??)
// Twee zware operaties: (1) data inladen, (2) berekening breedte/hoogte
class DateRange {

	constructor(fromData, toDate) {

		// debugger;

		this.fromData = fromData.clone();
		this.toDate = toDate.clone();

		this.count = 0;

		this.currentRange = moment.range(this.fromDate, this.toDate);

		console.log('from Date: ' + this.fromData.format());
		console.log('Length2: ' + Array.from(this.currentRange.by('day',{ exclusive: false })).length);
		
		
	}

	static getTime(date) {

		if (date == null) return null;

		return moment(date).format('HH:mm');
	}

	static calculateOverlap(start, end, events, index) {

		var result = [];

		var max = 0;

		for (var i = index; i < events.length; i++) {

			var other = events[i];

			var otherStart = DateRange.getScheduleTimestamp(DateRange.getTime(other.dateStart));
			var otherEnd = DateRange.getScheduleTimestamp(DateRange.getTime(other.dateEnd));

			var overlapStart = Math.max(start, otherStart);
			var overLapEnd = Math.min(end, otherEnd);

			if (start < otherEnd && otherStart < end) {

				var overLappingElements = [other];

				var overlapSets = [];

				overlapSets = overlapSets.concat(DateRange.calculateOverlap(overlapStart, overLapEnd, events, i + 1));

				overlapSets.forEach(function (currentValue, index, array) {
					result.push(overLappingElements.concat(currentValue));
				});

				result.push(overLappingElements);

			}

		}

		return result;

	}

	static getScheduleTimestamp(time) {

		if (!time) return 0.001;

		//accepts hh:mm format - convert hh:mm to time in minutes
		time = time.replace(/ /g, '');
		var timeArray = time.split(':');
		var timeStamp = parseInt(timeArray[0]) * 60 + parseInt(timeArray[1]);

		return timeStamp;
	}

	static calculateHeight(event) {

		if (event.dateStart && event.dateEnd) {

			var start = DateRange.getScheduleTimestamp(moment(event.dateStart).format('HH:mm'));
			var duration = DateRange.getScheduleTimestamp(moment(event.dateEnd).format('HH:mm')) - start;

			//TODO: fix timelineStart en timelineDuration
			var eventTop = 100.0 * (start - timelineStart) / timelineDuration;
			var eventHeight = 100.0 * duration / timelineDuration;

			if (!event.style) {
				event.style = {};
			}

			event.styleClass = [event.calendarName];

			event.style.height = (eventHeight) + '%';
			event.style.top = (Math.max(0, eventTop)) + '%';

		} else {

		}
	}

	static fixWidthForEventGroup(eventGroup) {

		if (eventGroup == null) return;

		var self = this;
		var events = eventGroup;

		var overLapSets = [];

		events.forEach(function (event, index) {

			var start = DateRange.getScheduleTimestamp(moment(event.dateStart).format('HH:mm'));
			var end = DateRange.getScheduleTimestamp(moment(event.dateEnd).format('HH:mm'));

			var overLappingElements = [event];

			var sets = DateRange.calculateOverlap(start, end, events, index + 1);

			sets.forEach(function (currentValue, index, array) {
				var set = overLappingElements.concat(currentValue);
				overLapSets.push(set);
			});

		});

		overLapSets.sort(function (a, b) {

			if (a.length > b.length) {
				return -1;
			} else {
				return 1;
			}

		});

		overLapSets.forEach(function (currentValue, index, array) {

			var width = 100.0 / currentValue.length;

			var usedRanges = [];
			var usedWidth = 0;

			//Calculate all used ranges in a certain overlap set
			currentValue.forEach(function (currentValue, index, array) {

				var left = currentValue.dataLeft;
				var width = currentValue.dataWidth;

				if (typeof left !== typeof undefined && left !== false) {
					usedRanges.push([parseFloat(left), parseFloat(left) + parseFloat(width)]);
				}

			});

			// sort ranges in order of occurences, left to right
			usedRanges.sort(function (a, b) {
				if (a[0] < b[0]) {
					return -1;
				} else {
					return 1;
				}

			});

			var freeRanges = [];

			//find all free ranges
			for (var i = 0; i < usedRanges.length; i++) {

				var previous = (i == 0) ? 0.0 : usedRanges[i - 1][1];

				var next = usedRanges[i][0];

				if ((next - previous) > 0.0) {
					freeRanges.push([previous, next]);
				}

			}

			if (usedRanges.length > 0) {
				var previous = usedRanges[usedRanges.length - 1][1];
				var next = 100.0;

				if ((next - previous) > 0.0) {
					freeRanges.push([previous, next]);
				}
			} else {
				freeRanges.push([0.0, 100.0]);
			}

			// verdeel de ranges in currentValue.lenght stukken waarbij het grootste stuk niet groter is dan 2x het kleinste stuk
			var elementsThatNeedSpace = [];

			currentValue.forEach(function (currentValue, index, array) {

				var attr = currentValue.dataWidth;

				if (typeof attr === typeof undefined || attr === false) {

					elementsThatNeedSpace.push(currentValue);

				} else {

					//this element has already been placed

				}
			});

			//Calculate the number of elements that still require space
			var spacesNeeded = parseFloat(elementsThatNeedSpace.length);

			//If no element needs space, continue with the next overlap set
			if (spacesNeeded == 0) {
				return;
			}

			var spaces = [];

			//there are 2 or more spaces to populate 2 or more ranges

			// sort free ranges by size, biggest first
			var rangeCandidates = freeRanges.sort(function (a, b) {

				if (a[1] - a[0] > b[1] - b[0]) {
					return -1;
				} else {
					return 1;
				}

			});

			//find the largest element
			var largestSize = rangeCandidates[0][1] - rangeCandidates[0][0];

			//calculate the minimum size of an element, it should not be smaller then necessary
			var minimumSize = largestSize / spacesNeeded;
			var totalSize = 0;

			//filter out very small free spaces
			rangeCandidates = rangeCandidates.filter(function (value) {

				var elementSize = value[1] - value[0];

				if (elementSize >= minimumSize) {
					totalSize += elementSize;
					return true;
				} else {
					return false;
				}

			});

			//find the smallest range left
			var smallestRange = rangeCandidates[rangeCandidates.length - 1];

			//And ensure is not larger then this smallest range
			var elementSize = Math.min(smallestRange[1] - smallestRange[0], totalSize / spacesNeeded)

			//loop over the range candidates, start with the smallest
			rangeCandidates.reverse().forEach(function (e, index, array) {

				//how much space do we have?
				var rangeSize = (e[1] - e[0]);

				//calculate how much elements this space should contain
				var elementsInRange = 0;

				if (index != (array.length - 1)) {
					elementsInRange = Math.floor(rangeSize / elementSize);
				} else {
					elementsInRange = spacesNeeded;
				}

				var width = rangeSize / elementsInRange;

				for (var i = 0.0; i < elementsInRange; i++) {
					spaces.push([e[0] + i * (width), e[0] + (i + 1) * (width)]);
				}

				spacesNeeded = spacesNeeded - elementsInRange;

			});

			elementsThatNeedSpace.forEach(function (currentValue, index) {

				if (spaces[index]) {
					var left = spaces[index][0];
					var width = spaces[index][1] - spaces[index][0];

					currentValue.dataWidth = width;
					currentValue.dataLeft = left;

					if (!currentValue.style) {
						currentValue.style = {};
					}

					currentValue.style.width = 'calc(' + width + '% - 1px)';
					currentValue.style.left = left + '%';

				}

			});

		});
	}

	getDays(){
		
		var days = Array.from(this.currentRange.by('day'));


		console.log('days length: ' + days.length);

		if (days.length == 1) {
		//	this.dateActive = fromDate;
			days = Array.from(moment.range(this.fromDate.clone().startOf('week'), this.fromDate.clone().endOf('week')).by('day'));;
		}

		// this.days = days;

		return days;
		
	}

	getAgendaItems() {

		// debugger;
		this.count++;

		// if(this.count > 1){
		// 	console.log('too much loads!');
		// 	return;
		// }

		console.log('get agenda items');
		// (1) First, load the current agenda items
		var e = {};

		for (let day of this.currentRange.by('day')) {
			var r = agendaItems[day.format('YYYYMMDD')];

			e[day.format('YYYYMMDD')] = r ? r : [];
		}

		// (2) Prepare presenting
		for (var i in e) {

			var j = e[i].length

			while (j--) {

				if (e[i][j].style) {
					delete e[i][j].dataWidth;
					delete e[i][j].dataLeft;
					delete e[i][j].style.width;
					delete e[i][j].style.left;
				} else {
					e[i][j].style = {};
				}

				e[i][j].ignore = false;
				e[i][j].style.display = 'block';

				// if (Object.keys(this.calendarInformation).length > 0) {

				// 	if (this.enabledCalendars.indexOf(e[i][j].calendarName) == -1) {
				// 		e[i][j].ignore = true;
				// 		e[i][j].style.display = 'none';
				// 	} else {
				// 		e[i][j].style.backgroundColor = this.calendarInformation[e[i][j].calendarName].color;
				// 	}
				// } else {

				// }

			}

		}

		for (var i in e) {

			DateRange.fixWidthForEventGroup(e[i].filter(function (e) {
				console.log('ignore: ' + e.ignore);
				return !e.ignore;
			}));

			for (var j in e[i].filter(function (e) {
					console.log('ignore: ' + e.ignore);
					return !e.ignore;
				})) {

				DateRange.calculateHeight(e[i][j]);
			}
		}

		console.log(JSON.stringify(e));

		return e;
	}

}

export default {
	
	// Use the modal component
	components: {
		'modal-detail': Modal
	},

	props: {

		//TODO: introduce start of week
		
		initialCalendarInformation: {
			type: Array,
			default: null
		},

		/**
 		* @property {Array.<{dateStart: Date, dateEnd: Date, styleClass: String, summary: String, description: String, location: String}>} events
 		*/
		events: {
			type: Array,
			default: function(){ return []; }
		},

		i18n: {
			type: Object,
			default: function(){ return {day: 'Day',week:'Week',days4:'4 Days'}; }
		},

		/**
		 * @param {('xs'|'s'|'m','l')} maxSize - Sets the maximum size
		 */
		maxSize: {
			type: String,
			default: 'l'
		},

		/**
		 * @param number hourStart - specifices the first hour of the day that should be visible
		 */
		hourStart: {
			type: Number,
			default: 0
		},

		/**
		 * @param number hourStart - specifices the day's last hour that should be visble
		 */
		hourEnd: {
			type: Number,
			default: 24
		}

	},

	data() {
		return {
			
			pages: [ ], //start with, prev, current, and next page. Start with loading current ...
			agendaItemPages: [ ],

			currentMarginLeft: 0,

			isLoading: true,

			//Set to true to show the event details dialog
			showModal: false,

			//Set to true to show the calendar picker
			showCalendarPicker: false,

			//Sets the template to use. Currently, only week is supported
			template: 'week',
			viewActive: null, //can be one, seven, four
			
			//Automatically populated by default with a map. YYYYMMDD as the object's keys. The values are the events (from this.events).
			//agendaItems: {},

			//Array with elements like {name: String, displayName: String, color: String}
			calendarInformation: [],

			//Sets the calendars that should be enabled
			enabledCalendars: [],

			dateActive: moment(),

			// First day to show in the current calendar view
			fromDate: null,

			// Last day to show in the current calendar view
			toDate: null,

			currentPage: null,

			// A range starting from this.fromDate to this.toDate
			currentRange: null,

			// Filled with the event selected. Used in the event detail modal.
			currentEvent: null,

			today: moment(),

			// 
			timelineStart: null,
			timelineEnd: null,
			timelineDuration: null,
			timelineSlotDuration: null,

			// List of moment js objects
			days: [],

			// Allows overriding event styles
			eventStyleReset: {
				//TODO: set height and width to something when on mobile ...
			}
		}
	},

	computed: {

		// Returns an array of background images, used for the timelines
		backgroundImage: function () {
			
			return Array(this.hourEnd - this.hourStart -1).fill('url(\'data:image/svg+xml;utf8,<svg version="1.1" baseProfile="full" width="10" height="1" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="0" x2="10" y2="0" style="stroke:rgb(220,220,220);stroke-width:1" /></svg>\')').join(', ');

		},

		//returns the background positions, used for the timelines
		backgroundPosition: function () {

			var repeats = this.hourEnd - this.hourStart;

			var positions = [];

			for (var i = 1; i < repeats; i++) {
				positions.push('0% ' + (100.0 / repeats) * i + '%');
			}

			return positions.join(', ');
		},

		//
		currentAgendaItems: function () {
			
			return this.currentPage != null ? this.currentPage.getAgendaItems() : [];

		}
	},

	created() {

		if(this.initialCalendarInformation){
			this.calendarInformation = this.initialCalendarInformation;
			this.enabledCalendars = Object.keys(this.calendarInformation);

			console.log(this.enabledCalendars);
		}

		this.timelineSlotDuration = DateRange.getScheduleTimestamp('7:30') - DateRange.getScheduleTimestamp('07:00');
		
		timelineStart = DateRange.getScheduleTimestamp(('0' + this.hourStart).slice(-2) + ':00');

		timelineEnd = DateRange.getScheduleTimestamp(('0' + this.hourEnd).slice(-2) + ':00');

		timelineDuration = timelineEnd - timelineStart;

		if (this.dateStart != null) {
			this.dateActive = moment(this.dateStart, 'YYYY-MM-DD');
		}

		this.showWeek();

	},

	mounted() {

		this.setScrollTop();
		
		var parent = this;

		window.addEventListener('resize', function () {
			parent.resize();
		});
		
		const elementprev = document.getElementsByClassName('prev')[0];
		const element = document.getElementsByClassName('current')[0];

		console.log('set event listeners!');
		this.$refs.calendarcontainer.addEventListener("touchstart", this.touchStart, false);
		this.$refs.calendarcontainer.addEventListener("touchend", this.touchEnd, false);
		this.$refs.calendarcontainer.addEventListener("touchleave", this.touchEnd, false);
		this.$refs.calendarcontainer.addEventListener("touchmove", evt => { 

			elementprev.style.marginLeft = 'calc(-100% + ' + (evt.changedTouches[0].clientX - moveStart) + 'px)';
			element.style.marginLeft = (evt.changedTouches[0].clientX - moveStart) + 'px';

		}, false);

		var eventsGrouped = {};
		
		this.events.forEach(function(event){

			//if dataStart is a momentjs object, use that. Check with moment.isMoment(obj);
			var date = (moment.isMoment(event.dateStart)?event.dateStart:moment(event.dateStart)).format('YYYYMMDD');

			if(!eventsGrouped[date]){
				eventsGrouped[date] = [];
			}
			
			eventsGrouped[date].push(event);
			
		});

		//global
		agendaItems = eventsGrouped;

		//this.currentPage = new DateRange(this.fromDate, this.toDate);

		console.log('these dates ...');
		console.log(this.dateActive.clone().startOf('week').format());
			console.log(this.dateActive.clone().endOf('week').format());

		this.pages = [
			{ data: new DateRange(this.fromDate, this.toDate) },
			];

		this.agendaItemPages = [
			{ agendaItems: this.pages[0].data.getAgendaItems(), days: this.pages[0].data.getDays()  },

			];

		console.log('has loaded current page!');
		

	},

	watch: {
		pages: function(val){

			console.log('change of pages');

		}
	},
	methods: {

		getAgendaItems: function(page){
			// debugger;
			return page.data.getAgendaItems();
		},

		touchStart: function(evt){

			moveStart = evt.changedTouches[0].clientX;
			const elementprev = document.getElementsByClassName('prev')[0];
			const element = document.getElementsByClassName('current')[0];
			element.classList.add('notransition');
			elementprev.classList.add('notransition');
		},

		touchEnd: function(evt){
			//TODO: Reset what's prev, current and next
			const element = document.getElementsByClassName('current')[0];
			const elementprev = document.getElementsByClassName('prev')[0];
			element.classList.remove('notransition');
			elementprev.classList.remove('notransition');
			element.style.marginLeft = '100%';
			elementprev.style.marginLeft = '0%';
			console.log((evt.changedTouches[0].clientX - moveStart) + 'px');

		},

		touchMove: function(evt){
			
			console.log('move');
			console.log((evt.changedTouches[0].clientX - moveStart) + 'px');

			this.currentMarginLeft = (evt.changedTouches[0].clientX - moveStart) + 'px';

		},

		getCalendarDisplayName: function (name) {
			return name.replace('\\','');
		},

		getCalendarInformation: function (name) {
			
			var result = {};

			if(this.calendarInformation[name]){
				result = this.calendarInformation[name];
			}

			return result;

		},

		setScrollTop: function () {
			
			//TODO: fix this!
			//this.$refs.calendar.scrollTop = this.$refs.calendar.scrollHeight * 0.26;

		},

		showDropDown: function () {
			this.$refs.dropdownmenu.style.display = this.$refs.dropdownmenu.style.display == 'block' ? 'none' : 'block';
		},

		rangeToString: function (fromDate, toDate) {

			let result = null;

			if (fromDate.isSame(toDate, 'day')) {
				result = fromDate.format('MMM D, YYYY');
			} else if (fromDate.isSame(toDate, 'month')) {
				result = fromDate.format('MMM D') + ' - ' + toDate.format('D, YYYY');;
			} else {
				result = fromDate.format('MMM D') + ' - ' + toDate.format('MMM D, YYYY');;
			}

			result = result.replace('.', '');
			result = result.charAt(0).toUpperCase() + result.substr(1);

			return result;

		},

		allTimes: function () {
			var times = [];

			for (var i = this.hourStart; i < this.hourEnd; i++) {
				times.push(i + 'u');
				times.push(i + ':30');
			}

			return times;
		},

		resize: _.debounce(function () {

			this.setScrollTop();

		}, 500),

		setDateRange: function (fromDate, toDate) {

			console.log('set date range!');

			this.fromDate = fromDate;
			this.toDate = toDate;

			this.isLoading = false;;

			// this.currentRange = moment.range(this.fromDate, this.toDate);

			// this.viewActive = 'view-' + (this.currentRange.diff('days')+1);

			// var days = Array.from(this.currentRange.by('day'));

			// if (days.length == 1) {
			// 	this.dateActive = fromDate;
			// 	days = Array.from(moment.range(fromDate.clone().startOf('week'), fromDate.clone().endOf('week')).by('days'));;
			// }

			// this.days = days;

			// console.log('days length: ' + days.length);
			// for (var day in days) {
			// 	console.log('day: ' + day);
			// }

			// this.$emit('newDateRange', fromDate, toDate);

			// this.isLoading = true;	

			// var parent = this;
			// this.loadDateRange(fromDate, toDate).then(function(){

			// 	parent.isLoading = false;

			// });

			return null;

		},

		loadDateRange: function (fromDate, toDate) {
			
			console.log('in loadDateRange');

			return new Promise(function(resolve, reject){
				resolve('done');
			});

		},

		showToday: function () {
			this.template = 'week';
			
			//var today = moment();
			this.dateActive = this.today.clone();

			var size = this.currentRange.diff('days');

			if (size == 6) {
				this.setDateRange(this.today.clone().startOf('week'), this.today.clone().endOf('week'));
			} else {
				this.setDateRange(this.today, moment().add(size, 'day'));
			}

		},

		showOneDay: function () {
			this.template = 'week';
			
			this.setDateRange(this.dateActive, this.dateActive);

		},

		showFourDay: function () {
			this.template = 'week';
			
			this.setDateRange(this.dateActive, this.dateActive.clone().add(3, 'day'));

		},

		showWeek: function () {

			this.template = 'week';
			this.viewActive = 'seven';
			
			console.log(this.dateActive.clone().startOf('week').format());
			console.log(this.dateActive.clone().endOf('week').format());
			this.setDateRange(this.dateActive.clone().startOf('week'), this.dateActive.clone().endOf('week'));

		},

		showMonth: function () {

			this.template = 'month';

			this.setDateRange(this.dateActive.clone().startOf('month'), this.dateActive.clone().endOf('month'));

		},

		prev: function () {

			//TODO: calculate current range size
			//const range = moment.range(parent.fromDate, parent.toDate);
			var size = this.currentRange.diff('days') + 1;

			this.dateActive = this.dateActive.clone().add(-size, 'day');

			this.setDateRange(this.fromDate.clone().add(-size, 'day'), this.toDate.clone().add(-size, 'day'));
		},

		next: function () {

			//TODO: calculate current range size
			//const range = moment.range(parent.fromDate, parent.toDate);

			var size = this.currentRange.diff('days') + 1;

			this.dateActive = this.dateActive.clone().add(size, 'day');

			this.template = 'week';

			this.setDateRange(this.fromDate.clone().add(size, 'day'), this.toDate.clone().add(size, 'day'));
		},

		getTime: function (date) {
			
			// return DateRange.getTime(date);

			if (date == null) return null;

			return moment(date).format('HH:mm');

		},

		getDay: function (date, format) {
			//01-05-2016
			//20170702
			return date ? moment(date, 'YYYYMMDD').format(format) : null;
		},

		mq: function () {
			var element = $('.calendar');

			return window.getComputedStyle(element.get(0), '::before').getPropertyValue('content').replace(/["']/g, '');
		},

		openModal: function (event) {

			// this.currentEvent = event;

			this.showModal = true;

			//TODO: find a proper way to open a modal!


		}

		

	}

}

</script>
