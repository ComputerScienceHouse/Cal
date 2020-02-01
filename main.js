if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const goog = require('./google.js')
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const {google} = require('googleapis');

// CONFIGURATION FOR MODULES
app.set('view-engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('static'));
// Initialize using signing secret from environment variables
const port = process.env.PORT || 3000;

console.log("Start...");

var calendarTotal = [];
const now = new Date(Date.now());
var baseMonth = (now.getMonth()+1);
var baseYear = now.getFullYear();
var gMonth = baseMonth.toString();
var gYear = baseYear.toString();

function displayCalendar(auth, m, y) {
    console.log(m);
    console.log(y);
    var range = getMonthDateRange(y, m)
    const calendar = google.calendar({version: 'v3', auth});
    var eve = {
        day: 1,
        month: 2,
        year: 2020,
        info: "Kill me",
        time: "2020-01-01T05:00:00.000Z"
    }
    for (var i = 0; i < 10; i++) {
        calendarTotal[i] = eve;
    }
    return "";
    calendar.events.list({
        calendarId: 'rti648k5hv7j3ae3a3rum8potk@group.calendar.google.com',
        timeMin: range.start.toISOString(),
        timeMax: range.end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
            const events = res.data.items;
        if (events.length) {
            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                const date = isoStringToDate(start).getDate();
                
            });
        } else {
            console.log('No upcoming events found.');
        }
    });
}

function getMonthDateRange(year, month) {
    var moment = require('moment');

    // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
    // array is 'year', 'month', 'day', etc
    var startDate = moment([year, month - 1]);

    // Clone the value before .endOf()
    var endDate = moment(startDate).endOf('month');

    // just for demonstration:
    console.log(startDate.toDate());
    console.log(endDate.toDate());

    // make sure to call toDate() for plain JavaScript date type
    return { start: startDate, end: endDate };
}

function isoStringToDate(s) {
    var b = s.split(/\D/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3]||0, b[4]||0, b[5]||0, b[6]||0));
}

app.get('/', function(req, res) {
    goog.auth((auth) => displayCalendar(auth, gMonth, gYear));
    res.render('index.ejs', { month: gMonth, year: gYear });
});

app.get('/b-month', function(req, res) {
    baseMonth--;
    if (baseMonth == 1) {
        baseMonth = 12;
        baseYear--;
    }
    console.log(baseMonth);
    console.log(baseYear);
    goog.auth((auth) => displayCalendar(auth, gMonth, gYear));
    // console.log(calendarTotal)
    res.send(JSON.stringify(calendarTotal));
});

app.get('/f-month', function(req, res) {
    baseMonth++;
    if (baseMonth == 13) {
        baseMonth = 1;
        baseYear++;
    }
    console.log(baseMonth);
    console.log(baseYear);
    goog.auth((auth) => displayCalendar(auth, gMonth, gYear));
    // console.log(calendarTotal)
    res.send(JSON.stringify(calendarTotal));
});

app.listen(port, () => {
    console.log(`Main on port = 3000`);
});