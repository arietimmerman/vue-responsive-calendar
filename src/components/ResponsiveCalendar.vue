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
		<div v-for="page in agendaItemPages" class="page" :data-test="[ page.dateRange.currentRange.start.format() ]" :class="{'current' : page.active, 'notransition': !page.transition}" :style="{'marginLeft':page.currentMarginLeft}">

		<div class="dayline" :class="[viewActive]">
			<ul>

				<li class="top-info" v-for="day in page.dateRange.days" v-bind:class="{today: day.isSame(today,'day'), selected: day.isSame(dateActive,'day') } ">

					<a class="d-flex mt-1 justify-content-center" @click="showDateRange(day,day)">
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
					<li v-for="(item, key) in page.dateRange.agendaItems" class="events-group" v-bind:class="{today: key == today}" v-bind:style="{ width : (100.0/page.dateRange.length) + '%'}">

						<ul>
							<template v-for="event in item">

								<li v-bind:style="[event.style, eventStyleReset]" v-if="getTime(event.dateStart) != null && getTime(event.dateEnd) != null"
								    class="single-event" data-event="event-1" v-bind:class="event.styleClass">
									<a href="#0" @click="openModal(event)">
										<span class="event-name">{{ event.summary ? event.summary : event.item.summary }}</span>
										<span class="event-date">{{ getTime(event.dateStart) }} - {{ getTime(event.dateEnd) }}</span>
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

import _ from 'lodash';
import Moment from 'moment';

import {
	extendMoment
} from 'moment-range';

import Modal from './Modal.vue'
import DateRange from '../assets/js/DataRange.js'

window.moment = extendMoment(Moment);
window.agendaItems = null;

var moveStart = null;

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
			default: function () {
				return [];
			}
		},

		i18n: {
			type: Object,
			default: function () {
				return {
					day: 'Day',
					week: 'Week',
					days4: '4 Days'
				};
			}
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

			agendaItemPages: [], //start with, prev, current, and next page. Start with loading current ...

			prevAgendaItemPage: {},
			currentAgendaItemPage: {},
			nextAgendaItemPage: {},

			activeIndex: 0,

			isLoading: false,

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

			// Filled with the event selected. Used in the event detail modal.
			currentEvent: null,

			today: moment(),

			// List of moment js objects
			days: [],

			// Allows overriding event styles
			eventStyleReset: {
				//TODO: set height and width to something when on mobile ...
			},

			size: 7
		}
	},

	computed: {

		// Returns an array of background images, used for the timelines
		backgroundImage: function () {

			return Array(this.hourEnd - this.hourStart - 1).fill('url(\'data:image/svg+xml;utf8,<svg version="1.1" baseProfile="full" width="10" height="1" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="0" x2="10" y2="0" style="stroke:rgb(220,220,220);stroke-width:1" /></svg>\')').join(', ');

		},

		//returns the background positions, used for the timelines
		backgroundPosition: function () {

			var repeats = this.hourEnd - this.hourStart;

			var positions = [];

			for (var i = 1; i < repeats; i++) {
				positions.push('0% ' + (100.0 / repeats) * i + '%');
			}

			return positions.join(', ');
		}
	},

	created() {

		if (this.initialCalendarInformation) {
			this.calendarInformation = this.initialCalendarInformation;
			this.enabledCalendars = Object.keys(this.calendarInformation);
		}

		if (this.dateStart != null) {
			this.dateActive = moment(this.dateStart, 'YYYY-MM-DD');
		}

		DateRange.init(this.hourStart, this.hourEnd, this);

		var eventsGrouped = {};

		this.events.forEach(function (event) {

			//if dataStart is a momentjs object, use that. Check with moment.isMoment(obj);
			var date = (moment.isMoment(event.dateStart) ? event.dateStart : moment(event.dateStart)).format('YYYYMMDD');

			if (!eventsGrouped[date]) {
				eventsGrouped[date] = [];
			}

			eventsGrouped[date].push(event);

		});

		//global
		agendaItems = eventsGrouped;

		this.showWeek();
		this.loadNext();
		this.loadPrev();


	},

	mounted() {
		
		var parent = this;
		
		this.$refs.calendarcontainer.addEventListener("touchstart", this.touchStart, false);
		this.$refs.calendarcontainer.addEventListener("touchend", this.touchEnd, false);
		this.$refs.calendarcontainer.addEventListener("touchleave", this.touchEnd, false);
		this.$refs.calendarcontainer.addEventListener("touchmove", evt => {			
			this.prevAgendaItemPage.currentMarginLeft = 'calc(-100% + ' + (evt.changedTouches[0].clientX - moveStart) + 'px)';
			this.nextAgendaItemPage.currentMarginLeft = 'calc(100% + ' + (evt.changedTouches[0].clientX - moveStart) + 'px)';
			this.currentAgendaItemPage.currentMarginLeft = (evt.changedTouches[0].clientX - moveStart) + 'px';

		}, false);

		this.insertDateRange(this.dateActive.clone().startOf('week'), this.dateActive.clone().endOf('week'));

	},

	watch: {
		// TODO: Watch calendarInformation 
		calendarInformation: function(val){
			console.log('calendar information changed!');
		},

		enabledCalendars: function(val){
			console.log('enabledCalendars changed!');
			console.log(val);

			if(this.currentAgendaItemPage.dateRange){
				this.currentAgendaItemPage.dateRange.setAgendaItems();

				this.agendaItemPages = [this.currentAgendaItemPage];
			}

		},

	},
	methods: {

		animationend: function(e){
			console.log('animation end!');
		},

		touchStart: function (evt) {

			this.loadPrev();
			this.loadNext();
			
			moveStart = evt.changedTouches[0].clientX;

			this.prevAgendaItemPage.transition = false;
			this.nextAgendaItemPage.transition = false;
			this.currentAgendaItemPage.transition = false;
			
		},

		touchEnd: function (evt) {
			

			this.prevAgendaItemPage.transition = true;
			this.prevAgendaItemPage.currentMarginLeft = null;
			this.nextAgendaItemPage.transition = true;
			this.nextAgendaItemPage.currentMarginLeft = null;
			this.currentAgendaItemPage.transition = true;
			this.currentAgendaItemPage.currentMarginLeft = null;

			if( (evt.changedTouches[0].clientX - moveStart) > 50 ){
				this.prev();
			}else if( (evt.changedTouches[0].clientX - moveStart) < -50 ){
				this.next();
			}

		},

		getCalendarDisplayName: function (name) {
			return name.replace('\\', '');
		},

		getCalendarInformation: function (name) {

			var result = {};

			if (this.calendarInformation[name]) {
				result = this.calendarInformation[name];
			}

			return result;

		},

		setScrollTop: function (scrollTop) {

			console.log('set scroll top');

			Array.from(document.getElementsByClassName('calendar')).forEach( e => { 
				console.log('set scroll top');

				if(e.scrollTop == 0){
					e.scrollTop = scrollTop === undefined ? e.scrollHeight * 0.26 : scrollTop;
				}

			});

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

			for (var i = this.hourStart; i <= this.hourEnd; i++) {
				times.push(i + 'u');
				times.push(i + ':30');
			}

			return times;
		},

		resize: _.debounce(function () {

			this.setScrollTop();

		}, 500),

		loadAndInsertDateRange: function(fromDate, toDate){

			return new Promise( (resolve, reject) => {
				
				this.loadDateRange(fromDate, toDate).then( () => {

					resolve(this.insertDateRange(fromDate, toDate));

				}).catch((e) => { console.log(e); console.log('ignore error'); })
			});

		},

		insertDateRange: function (fromDate, toDate) {
			
			//FIXME: Only do 'new DateRange' when needed ...

			var newElement = null;

			var insertedIndex = null;

			var added = false;
			
			for (var i = (this.agendaItemPages.length - 1); i >= 0; i--) {
				if(fromDate.isSame(this.agendaItemPages[i].dateRange.currentRange.start)){
					
					console.log('use existing!');
					newElement = this.agendaItemPages[i];

					insertedIndex = i;

					added = true;
					break;

				}else if (fromDate > this.agendaItemPages[i].dateRange.currentRange.start) {
					
					newElement = {
						dateRange: new DateRange(this, fromDate, toDate),
						active: false,
						currentMarginLeft: null,
						transition: false
					};

					this.agendaItemPages.splice(i + 1, 0, newElement);
					
					insertedIndex = i + 1;

					added = true;
					break;

				}

			}

			if (!added) {
				console.log('add element to the start!');
				newElement = {
						dateRange: new DateRange(this, fromDate, toDate),
						active: false,
						currentMarginLeft: null,
						transition: false
					};

				this.agendaItemPages.unshift(newElement);

				insertedIndex = 0;
				
			}
			
			this.activeIndex = this.agendaItemPages.indexOf(this.currentAgendaItemPage);

			if(insertedIndex == (this.activeIndex - 1) ){
				this.prevAgendaItemPage = newElement;
			}else if(insertedIndex == (this.activeIndex + 1) ){
				this.nextAgendaItemPage = newElement;
			}

			this.$nextTick(function () {
				this.setScrollTop();
			});

			return newElement;
		},

		makeElementActive: function (element){
			
				this.$nextTick(function () {
					//TODO: Change this, strange workaround to allow animations to work
					setTimeout(() => {		
						if(this.currentAgendaItemPage){
							this.currentAgendaItemPage.active = false;
						}
						
						this.currentAgendaItemPage = element;
						this.currentAgendaItemPage.active = true;

						this.fromDate = element.dateRange.fromDate;
						this.toDate = element.dateRange.toDate;

						this.dateActive = this.fromDate;

						this.activeIndex = this.agendaItemPages.indexOf(this.currentAgendaItemPage);

						if( (this.activeIndex - 1) > 0 ){
							this.prevAgendaItemPage = this.agendaItemPages[this.activeIndex - 1];
						}
						if( (this.activeIndex + 1) < this.agendaItemPages.length ){
							this.nextAgendaItemPage = this.agendaItemPages[this.activeIndex + 1];;
						}

						this.setScrollTop();

					},0);
				});
		},
		
		showDateRange: function (fromDate, toDate) {

			this.fromDate = fromDate;
			this.toDate = toDate;

			this.$emit('newDateRange', fromDate, toDate);
			
			this.isLoading = true;

			this.loadAndInsertDateRange(fromDate, toDate).then( (element) => {
				
				this.size = element.dateRange.currentRange.diff('days') + 1;
				
				var viewActive = 'view-' + this.size;

				if(this.viewActive != viewActive){
					this.agendaItemPages = [element];
					this.viewActive = viewActive;
				}

				this.makeElementActive(element);
				
				this.isLoading = false;

			});

		},

		loadDateRange: function (fromDate, toDate) {

			console.log('in loadDateRange');

			return new Promise(function (resolve, reject) {
				resolve('done');
			});

		},

		showToday: function () {

			if (this.size == 7) {
				this.showDateRange(this.today.clone().startOf('week'), this.today.clone().endOf('week'));
			} else {

				if(this.size == 1){
					this.showDateRange(this.today, this.today);
				}else{
					this.showDateRange(this.today, moment().add(this.size, 'day'));
				}

			}

		},

		showOneDay: function () {
			this.template = 'week';
			
			this.agendaItemPages = [];
			
			this.showDateRange(this.dateActive, this.dateActive);

		},

		showFourDay: function () {
			this.template = 'week';

			this.agendaItemPages = [];

			this.showDateRange(this.dateActive, this.dateActive.clone().add(3, 'day'));

		},

		showWeek: function () {

			this.template = 'week';

			this.agendaItemPages = [];

			this.showDateRange(this.dateActive.clone().startOf('week'), this.dateActive.clone().endOf('week'));

		},

		showMonth: function () {

			this.template = 'month';

			this.showDateRange(this.dateActive.clone().startOf('month'), this.dateActive.clone().endOf('month'));

		},

		prev: function () {
			this.loadPrev().then( (element) => {
				//this.dateActive = element.dateRange.fromDate;
				this.makeElementActive(element);
			});
		},

		loadPrev: function(){
			

			return this.loadAndInsertDateRange(this.fromDate.clone().add(-this.size, 'day'), this.toDate.clone().add(-this.size, 'day'));			
		},

		loadNext: function(){

			return this.loadAndInsertDateRange(this.fromDate.clone().add(this.size, 'day'), this.toDate.clone().add(this.size, 'day'));			
		},

		next: function () {
			console.log('show next');
			this.loadNext().then( (element) => {
				this.dateActive = element.dateRange.fromDate;
				this.makeElementActive(element)}
			);
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

			this.currentEvent = event;

			this.showModal = true;

		}



	}

}

</script>
