// Author: Beckett Jenen

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
app.use(express.static('static'));
// Initialize using signing secret from environment variables
const port = process.env.PORT || 4000;

console.log("Start...");

const now = new Date(Date.now());
var baseDay = (now.getDay());
var baseMonth = (now.getMonth()+1);
var baseYear = now.getFullYear();

goog.auth((auth) => displayCalendar(auth, baseMonth.toString(), baseYear.toString()));

function displayCalendar(auth, m, y) {
    return new Promise((resolve, reject) => {
        const calendarTotal = [];
        var range = getMonthDateRange(y, m)
        const calendar = google.calendar({version: 'v3', auth});
        calendar.events.list({
            calendarId: 'rti648k5hv7j3ae3a3rum8potk@group.calendar.google.com',
            timeMin: range.start.toISOString(),
            timeMax: range.end.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            timeZone: 'America/New_York',
        }, (err, res) => {
            if (err) {
                console.log('The API returned an error: ' + err);
                reject(err);
            }
            const events = res.data.items;
            if (events.length) {
                events.map((event, i) => {
                    const start = event.start.dateTime || event.start.date;
                    const gTime = isoStringToDate(start);
                    var gLoc = "N/A";
                    var gDes = "N/A";
                    var gMin = gTime.getMinutes();
                    if(event.location !== undefined){
                        if(event.location.length > 500 ){
                            gLoc = "N/A"
                        }else{
                            gLoc = event.location
                        }
                    }
                    if(event.description !== undefined){
                        if(event.description.length > 300 ){
                            gDes = "N/A"
                        }else{
                            gDes = event.description
                        }
                    }
                    if(gMin == "0"){
                        gMin = "00";
                    }
                    var eve = {
                        time: ((alterTimeZone(gTime.getHours())) + ":" + gMin),
                        day: gTime.getDate(),
                        info: event.summary,
                        link: event.htmlLink,
                        loc: gLoc,
                        des: gDes
                    }
                    if (!(i < 25 && eve.day > 25)) {
                        calendarTotal.push(eve);
                    }
                });
            } else {
                console.log('No upcoming events found.');
            }

            resolve(calendarTotal);
        });
    });
}

function getMonthDateRange(year, month) {
    var moment = require('moment');
    var startDate = moment([year, month - 1]);
    var endDate = moment(startDate).endOf('month');
    return { start: startDate, end: endDate };
}

function isoStringToDate(s) {
    var b = s.split(/\D/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3]||0, b[4]||0, b[5]||0, b[6]||0));
}

function alterTimeZone(t){
    var nDate = t+5;
    if(24 < nDate){
        return nDate - 24;
    }else{
        return nDate;
    }
}

app.get('/', function(req, res) {
    res.render('index.ejs');
});

app.post('/getCal', function(req, res) {
    return new Promise((resolve) => {
        goog.auth((auth) => resolve(auth));
    })
      .then((auth) => displayCalendar(auth, req.body.mon.toString(), req.body.yea.toString()))
      .then((calendar) => res.json(calendar))
      .catch(err => res.json({ success: "false", msg: err.msg }));
});

app.listen(port, () => {
    console.log(`Main on port = 8080`);
});