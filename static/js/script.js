$(document).ready(function() {
    var win = $(window);
    var checkOnce = false;
    var popOverSettings = {
        animation: false,
        html: true,
        placement: 'top',
        container: 'body',
        trigger: 'hover',
        offset: '180',
        selector: "[rel='popover']", //Sepcify the selector here
        content: "<div id='poppedOver'><p>Error</p></div>"
    }

    $('body').popover(popOverSettings);
    $().tooltip({container: 'body'})

    bigSmol();

    win.resize(bigSmol);

    function bigSmol(){
        if (win.width() < 660) {
            $(".smallTable").show();
            $(".bigTable").hide();
            // $("body").css("background-color", "#B0197E");
            if (checkOnce == false) {
                resetEvents();
                displayEvents();
                checkOnce = true;
            }
        }else if(win.width() >= 660) {
            $(".smallTable").hide();
            $(".bigTable").show();
            // $("body").css("background-color", "#fff");
        }
    }
});

function updateInfo(x){
    try{
        var objectRow = x.closest('td').className;
        var objectRowP = "";
        var dayName = " ~ ";
        if (objectRow == "col0") {
            objectRowP = dayName + "Sunday";
        }else if (objectRow == "col1") {
            objectRowP = dayName + "Monday";
        }else if (objectRow == "col2") {
            objectRowP = dayName + "Tuesday";
        }else if (objectRow == "col3") {
            objectRowP = dayName + "Wednesday";
        }else if (objectRow == "col4") {
            objectRowP = dayName + "Thursday";
        }else if (objectRow == "col5") {
            objectRowP = dayName + "Friday";
        }else if (objectRow == "col6") {
            objectRowP = dayName + "Saturday";
        }
    }catch{
        objectRowP = "";
    }

    $("body").on('shown.bs.popover', function () {
        var obj = $(x);
        $("#poppedOver").html(
            '<p><b>Day: </b>' + obj.data("d") + objectRowP + '</p>'
            + '<p><b>Title: </b>' + obj.text() + '</p>'
            + '<p><b>Location: </b>' + obj.data("loc") + '</p>'
            + '<p><b>Description: </b>' + obj.data("des") + '</p>'
        );
    })
}

function parseSC(st){
    var stP = st.replace(/'/g, "&#39;").replace(/,/g, "&#44;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`/g, "&#96;");

    return stP;
}

function getCalendar(d){
    const data = { mon: (d.getMonth()+1), yea: d.getFullYear() };

    fetch('/getCal', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(r => r.json())
    .then(r => {
        resetEvents();
        generateCalendar(d, r);
        $(".popover").popover('hide');
        displayEvents();
    })
    .catch(err => console.log(err));
}

function generateCalendar(d, r) {
    calData = [];
    var importPointer = 0;
    var days = howManyDays(d)+1;
    var shift = getDayFirstDate(d);
    clear();

    for(var i = 1; i < days; i++) {
        var eventPerDay = "";
        var posi_row = Math.floor(((i-1)+shift)/7);
        var posi_col = Math.floor(((i-1)+shift)%7);
        try{
            while(i == r[importPointer].day){
                if (r[importPointer].day != null) {
                    eventPerDay += "<br>" + "<br>";
                    eventPerDay += "<a class='eventLine' target='_blank' rel='popover' onmouseover='updateInfo(this)' data-d='" + i 
                    + "' href='" + r[importPointer].link
                    + "' data-loc='" + r[importPointer].loc
                    + "' data-des='"+ parseSC(r[importPointer].des)
                    + "'>" + r[importPointer].time + " | " + parseSC(r[importPointer].info) + "</a>";
                    importPointer++;
                }
            }
        }catch(err){}
        var element = "<span class='cal-numbers'>" + i + "</span>" + eventPerDay;
        $('#calendar_display .r' + posi_row).children('.col' + posi_col).html(element);
    }
}
function clear(){
    $('#calendar_display tbody td').each(function(){
        $(this).html('');
    })
}

function getDayFirstDate(d) {
    var tempd = new Date();
    tempd.setFullYear(d.getFullYear());
    tempd.setMonth(d.getMonth());
    tempd.setDate(1);
    tempd.setHours(0);
    tempd.setMinutes(0);
    tempd.setSeconds(0);
    return tempd.getDay();
}

function howManyDays(d) {
    var m = d.getMonth()+1 ;
    if(m == 1 || m == 3 || m == 5 || m == 7 || m == 8 || m == 10 || m == 12) return 31;
    if(m == 2) {
        if(isLeapYear(d.getFullYear())) {
            return 29
        } else {
            return 28
        }
    }
    return 30;
}

function isLeapYear(year) {
    if(year % 400 == 0) {
        return true;
    } else if(year % 100 == 0) {
        return false;
    } else if(year % 4 == 0) {
        return true;
    } else {
        return false;
    }
}

function updateDate(d, sign) {
    var m = d.getMonth();
    if(sign) {
        if(m + 1 > 11) {
            d.setFullYear(d.getFullYear()+1);
            d.setMonth(0);
        } else {
            d.setMonth(m + 1);
        }
    } else {
        if(m - 1 < 0) {
            d.setFullYear(d.getFullYear()-1);
            d.setMonth(11);
        } else {
            d.setMonth(m - 1);
        }
    }
}

$(function(){
    var d = new Date();
    $('#data_chooser').html((d.getMonth()+1) + '/' + d.getFullYear());
    getCalendar(d);

    $('.left').click(function() {
        updateDate(d, 0);
        $('#data_chooser').html((d.getMonth()+1) + '/' + d.getFullYear());
        getCalendar(d);

        return false;
    });

    $('.right').click(function() {
        updateDate(d, 1);
        $('#data_chooser').html((d.getMonth()+1) + '/' + d.getFullYear());
        getCalendar(d);

        return false;
    });

});

function displayEvents(){
    if(!($(".smallTable").firstChild)) {
        var allEvents = jQuery('.eventLine').clone();
        allEvents.appendTo('.smallTable');
        $('.smallTable > .eventLine').each(function () {
            var obj = $(this);
            var currentDay = obj.data("d");
            var currentHTML = obj.html();
            obj.attr("href", "#");
            obj.attr("target", "");
            obj.html(obj.data("d") + " | " + currentHTML + "<hr>");
        });
    }
}

function resetEvents(){
    $('.smallTable > .eventLine').each(function () {
        var obj = $(this);
        obj.remove();
    });
}
