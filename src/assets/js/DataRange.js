
let timelineSlotDuration = null;
let timelineStart = null;
let timelineEnd  = null;
let timelineDuration  = null;

class DateRange {

    constructor(other, fromDate, toDate) {

        // debugger;
        this.other = other;

        this.fromDate = fromDate.clone();
        this.toDate = toDate.clone();

        this.count = 0;

        this.currentRange = moment().range(fromDate, toDate);
        this.length = Array.from(this.currentRange.by('day')).length;

        this.setAgendaItems();
        this.setDays();
        
    }

    static init (hourStart, hourEnd) {

        timelineSlotDuration = DateRange.getScheduleTimestamp('7:30') - DateRange.getScheduleTimestamp('07:00');
        timelineStart = DateRange.getScheduleTimestamp(('0' + hourStart).slice(-2) + ':00');
        timelineEnd = DateRange.getScheduleTimestamp(('0' + hourEnd).slice(-2) + ':00');
        timelineDuration = timelineEnd - timelineStart;
        
        console.log('timelineDuration is now: ' + timelineDuration);
        
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


    setDays() {

        console.log('get days');

        var days = Array.from(this.currentRange.by('day'));

        if (days.length == 1) {
            //	this.dateActive = fromDate;
            days = Array.from(moment.range(this.fromDate.clone().startOf('week'), this.fromDate.clone().endOf('week')).by('day'));;
        }

        this.days = days;

    }

    setAgendaItems() {

        // (1) First, load the current agenda items
        var e = {};
        
        console.log('get agendaItems!');
        
        this.other.getAgendaItems(this.fromDate,this.toDate).then( (agendaItems) => {

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
    
                    if (Object.keys(this.other.calendarInformation).length > 0) {
    
                        if (this.other.enabledCalendars.indexOf(e[i][j].calendarName) == -1) {
                            e[i][j].ignore = true;
                            e[i][j].style.display = 'none';
                        } else {
                            e[i][j].style.backgroundColor = this.other.calendarInformation[e[i][j].calendarName].color;
                        }
                    } else {
    
                    }
    
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
    
            this.agendaItems = e;

        });
        
    }

}


export { DateRange as default};
