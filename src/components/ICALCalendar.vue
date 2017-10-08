<script>
import ResponsiveCalendar from './ResponsiveCalendar.vue';

const IcalExpander = require('ical-expander');
import Moment from 'moment';
import {
	extendMoment
} from 'moment-range';
import VueResource from 'vue-resource';

const moment = extendMoment(Moment);

Vue.use(VueResource);

let calendarColors = ['#F37338', '#FDB632', '#4390BC', '#68A7CA', '#8DBDD8', '#B2D3E6', '#D8E9F3', '#AFC8CF', '#BAD3DA', '#7BC0DD'];

export default {

	mixins: [ResponsiveCalendar],

	data() {
		return {
			agendaItems: {}
		}
	},

	props: {

		ical: {
			type: String,
			required: true
		},

	},

	methods: {

		loadDateRange: function (fromDate, toDate) {
			
			var parent = this;

			return new Promise(function (resolve, reject) {

				parent.currentRange = moment.range(fromDate, toDate);

				if (parent.agendaItems[fromDate.format('YYYYMMDD')] && parent.agendaItems[toDate.format('YYYYMMDD')]) {

					// do nothing
					resolve('done');

				} else {

					fromDate = fromDate.clone().add(-14, 'day');
					toDate = toDate.clone().add(14, 'day');

					Vue.http.get(parent.ical, {
						params: {
							fromDate: fromDate.format('DD-MM-YYYY'),
							toDate: toDate.format('DD-MM-YYYY')
						}
					}).then(response => {
						// success callback
						var raw = response.body;
						//FIXME: split by calendar end
						var calendars = raw.split(/\n\s*\n/);

						var eventsGrouped = {};

						const range = moment.range(fromDate, toDate);
						var allDates = {};

						for (let day of range.by('days')) {
							eventsGrouped[day.format('YYYYMMDD')] = [];
						}

						let calendarNames = {};

						calendars.forEach(function (data, index) {

							console.log('start parsing calendar!');

							try {
								const icalExpander = new IcalExpander({
									ics: data,
									maxIterations: 365
								});
								let calendarName = icalExpander.component.getFirstPropertyValue('x-wr-calname');

								let calendarNameId = 'calendar-' + calendarName.replace(/\W+/g, "_");

								calendarNames[calendarNameId] = {
									name: calendarNameId,
									displayName: parent.getCalendarDisplayName(calendarName),
									color: calendarColors[index]
								};

								const vevents = icalExpander.between(fromDate.toDate(), toDate.toDate());

								[].concat(vevents.events, vevents.occurrences).forEach(function (event) {

									event.calendarName = calendarNameId;

									event.dateStart = event.startDate.toJSDate();
									event.dateEnd = event.endDate.toJSDate();

									var date = moment(event.dateStart).format('YYYYMMDD');

									eventsGrouped[date].push(event);

								});
							} catch (err) {
								console.log(err);
								console.log('parse problems!');
							}

							parent.agendaItems = Object.assign({}, parent.agendaItems, eventsGrouped);

						});

						parent.calendarInformation = calendarNames;
						parent.enabledCalendars = Object.keys(calendarNames);

						var result = {};

						for (let day of parent.currentRange.by('days')) {
							result[day.format('YYYYMMDD')] = parent.agendaItems[day.format('YYYYMMDD')];
						}

						parent.eventsPropReplacement = result;

						resolve('done');

					}, response => {
						// error callback
						console.log('emit httpError!');
						parent.$emit('httperror', response)

						reject(response);

					});


				}

			});

		},

	},

	components: {
		'responsive-calendar': ResponsiveCalendar
	}

}

</script>
