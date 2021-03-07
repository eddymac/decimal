"use strict";
/*
 * Unit test for MDecimal object
 */

// Good float test here ... var x=(23-7.37)

// Mocks
// taken alerts out for now
// var alertmess = "";
// alert = function (arg) {alertmess = arg; }
// End of mocks

import {UnitTest} from "./unittest.js";
import {MDate, MDateTime, MTime, MDateTimeMagic} from "../mdatetime.js";
import {MDecimal} from "../mdecimal.js";

class TestMDateTime extends UnitTest {
    // constructor() {super(); }

    test_create(undef)
    {

        var da = new Date();
        // This does JS Date
        this.eq("Blank", (new MDateTime()).toString(),"");
        this.eq("Blank null", (new MDateTime()).isNull(), true);
        this.eq("NOW (may occasionally fail)", Math.floor((new MDateTime("NOW")).jsDate().getTime() / 100), Math.floor(da.getTime()/100));
        this.eq("Iso Date time", (new MDateTime("2019-02-03T12:13:14.567")).toString(), "2019-02-03T12:13:14.567");
        this.eq("Iso Date", (new MDateTime("2019-02-03")).toString(), "2019-02-03T00:00:00");
        this.eq("MTime", (new MDateTime(new MTime("01:02:03.456"))).toString(), (new MDate("NOW")).toString() + "T01:02:03.456");
        this.eq("MDate", (new MDateTime(new MDate("2019-02-03"))).toString(), "2019-02-03T00:00:00");
        this.eq("MDateTime", (new MDateTime(new MDateTime("2019-02-03T12:13:14.567"))).toString(), "2019-02-03T12:13:14.567");
        this.eq("Rubbish", (new MDateTime(new MDateTime("rubbish"))).toString(), "");
        this.eq("Rubbish valid", (new MDateTime("rubbish")).isValid(), false);
        this.eq("Rubbish valid 2", (new MDateTime(new MDateTime("rubbish"))).isValid(), false);
    }
    test_assemble()
    {
        this.eq("Date time ", (new MDateTime()).assemble(2019, 2, 3, 12, 13, 14, 567).toString(), "2019-02-03T12:13:14.567");
    }
    test_isvalid()
    {
        this.eq("False", (new MDateTime("rubbish")).isValid(), false);
        this.eq("True", (new MDateTime("NOW")).isValid(), true);
    }
    test_setstuff()
    {
        this.eq("SetMDate", (new MDateTime("2019-02-03T12:13:14.567")).setMDate("2020-07-24").toString(), "2020-07-24T12:13:14.567");
        this.eq("SetMTime", (new MDateTime("2019-02-03T12:13:14.567")).setMTime("07:08:09.123").toString(), "2019-02-03T07:08:09.123");
    }

    test_addstuff()
    {
        this.eq("Years", (new MDateTime("2019-02-03T12:13:14.567")).addYears(5).toString(), "2024-02-03T12:13:14.567");
        this.eq("Months", (new MDateTime("2019-02-03T12:13:14.567")).addMonths(11).toString(), "2020-01-03T12:13:14.567");
        this.eq("Days", (new MDateTime("2019-02-03T12:13:14.567")).addDays(29).toString(), "2019-03-04T12:13:14.567");
        this.eq("Hours", (new MDateTime("2019-02-03T12:13:14.567")).addHours(13).toString(), "2019-02-04T01:13:14.567");
        this.eq("Minutes", (new MDateTime("2019-02-03T12:13:14.567")).addMinutes(-20).toString(), "2019-02-03T11:53:14.567");
        this.eq("Seconds", (new MDateTime("2019-02-03T12:13:14.567")).addSeconds(20).toString(), "2019-02-03T12:13:34.567");
        this.eq("Millis", (new MDateTime("2019-02-03T12:13:14.567")).addMilliseconds(600).toString(), "2019-02-03T12:13:15.167");
        this.eq("Millis Decimal", (new MDateTime("2019-02-03T12:13:14.567")).addMilliseconds(new MDecimal(600)).toString(), "2019-02-03T12:13:15.167");
        this.eq("MTime", (new MDateTime("2019-02-03T12:13:14.567")).addMTime("02:03:04.2").toString(), "2019-02-03T14:16:18.767");
    }

    test_floor()
    {
        this.eq("Floor", (new MDateTime("2019-02-03T12:13:14.567")).floor().toString(), "2019-02-03T00:00:00");
        this.eq("Floor eq", (new MDateTime("2019-02-03T00:00:00")).floor().toString(), "2019-02-03T00:00:00");
    }

    test_diff()
    {
        this.eq("Days", (new MDateTime("2019-02-03T12:13:14.567")).diffDays("2019-02-06T12:13:14.567"), 3);
        this.eq("Days and bit", (new MDateTime("2019-02-03T12:13:14.567")).diffDays("2019-02-06T18:13:14.567"), 3.25);
        this.eq("Days and bit neg", (new MDateTime("2019-02-03T12:13:14.567")).diffDays("2019-02-06T00:13:14.567"), 2.5);
        this.eq("Months", (new MDateTime("2019-02-03T12:13:14.567")).diffMonths("2019-05-03T12:13:14.567"), 3);
        this.eq("years", (new MDateTime("2019-02-03T12:13:14.567")).diffYears("2022-02-03T12:13:14.567"), 3);
        this.eq("MTime", (new MDateTime("2019-02-03T12:13:14.567")).diffMTime("2019-02-06T13:15:17.967").toString(), "01:02:03.400");
        this.eq("MTime days", (new MDateTime("2019-02-03T12:13:14.567")).diffMTime("2019-02-06T13:15:17.967").getDays(), 3);
        // this.eq("MTime rubbish", (new MDateTime("2019-02-03T12:13:14.567")).diffMTime("rubbish").isValid(), false);
        this.eq("Days Hours", (new MDateTime("2019-02-03T12:13:14.567")).diffDays("2019-02-03T15:13:14.567"), 0.125);
        this.eq("Hours", (new MDateTime("2019-02-03T12:13:14.567")).diffHours("2019-02-03T15:13:14.567"), 3);
        this.eq("Hours and bit", (new MDateTime("2019-02-03T12:13:14.567")).diffHours("2019-02-03T15:43:14.567"), 3.5);
        this.eq("Minutes", (new MDateTime("2019-02-03T12:13:14.567")).diffMinutes("2019-02-03T12:16:14.567"), 3);
        this.eq("Seconds", (new MDateTime("2019-02-03T12:13:14.567")).diffSeconds("2019-02-03T12:13:17.567"), 3);
        this.eq("Millis", (new MDateTime("2019-02-03T12:13:14.567")).diffMilliseconds("2019-02-03T12:13:14.867"), 300);
    }
    test_with()
    {
        this.eq("Day", (new MDateTime("2019-02-03T12:13:14.567")).withDay().toString(), "2019-02-01T00:00:00");
        this.eq("Month Day", (new MDateTime("2019-02-03T12:13:14.567")).withMonthDay().toString(), "2019-01-01T00:00:00");
    }
    test_sets()
    {
        this.eq("Date", (new MDateTime("2019-02-03T12:13:14.567")).setDate(9).toString(), "2019-02-09T12:13:14.567");
        this.eq("Month", (new MDateTime("2019-02-03T12:13:14.567")).setMonth(9).toString(), "2019-09-03T12:13:14.567");
        this.eq("Year", (new MDateTime("2019-02-03T12:13:14.567")).setYear(2009).toString(), "2009-02-03T12:13:14.567");
        this.eq("Hour", (new MDateTime("2019-02-03T12:13:14.567")).setHours(9).toString(), "2019-02-03T09:13:14.567");
        this.eq("Minute", (new MDateTime("2019-02-03T12:13:14.567")).setMinutes(9).toString(), "2019-02-03T12:09:14.567");
        this.eq("Second", (new MDateTime("2019-02-03T12:13:14.567")).setSeconds(9).toString(), "2019-02-03T12:13:09.567");
        this.eq("Milli", (new MDateTime("2019-02-03T12:13:14.567")).setMilliseconds(9).toString(), "2019-02-03T12:13:14.009");
    }

    test_cmp()
    {
        this.eq("Equal", (new MDateTime("2019-02-03T12:13:14.567")).cmp("2019-02-03T12:13:14.567"), 0);
        this.eq("Greater", (new MDateTime("2019-03-03T12:13:14.567")).cmp("2019-02-03T12:13:14.567"), 1);
        this.eq("Less", (new MDateTime("2019-01-03T12:13:14.567")).cmp("2019-02-03T12:13:14.567"), -1);
        this.eq("Rubbish", (new MDateTime("2019-02-03T12:13:14.567")).cmp("rubbish"), null);
    }
    test_gets()
    {
        this.eq("Date", (new MDateTime("2019-02-03T12:13:14.567")).getDate(), 3);
        this.eq("Month", (new MDateTime("2019-02-03T12:13:14.567")).getMonth(), 2);
        this.eq("Year", (new MDateTime("2019-02-03T12:13:14.567")).getYear(), 2019);
        this.eq("Hour", (new MDateTime("2019-02-03T12:13:14.567")).getHours(), 12);
        this.eq("Minute", (new MDateTime("2019-02-03T12:13:14.567")).getMinutes(), 13);
        this.eq("MSeconds", (new MDateTime("2019-02-03T12:13:14.567")).getSeconds(), 14);
        this.eq("MilliSeconds", (new MDateTime("2019-02-03T12:13:14.567")).getMilliseconds(), 567);
        this.eq("Time", (new MDateTime("2019-02-03T12:13:14.567")).getTime(), (new Date("2019-02-03T12:13:14.567")).getTime());
        this.eq("Day", (new MDateTime("2019-02-02T12:13:14.567")).getDay(), 6);
    }

    test_magic()
    {
        this.eq("Date obj", MDateTimeMagic(new MDate("2019-06-07")).toString(), "2019-06-07");
        this.eq("Date string", MDateTimeMagic("2019-06-07").toString(), "2019-06-07");
        this.eq("Time obj", MDateTimeMagic(new MTime("01:02:03.4")).toString(), "01:02:03.400");
        this.eq("Time String", MDateTimeMagic("01:02:03.4").toString(), "01:02:03.400");
        this.eq("Time String", MDateTimeMagic("01:02:03").toString(), "01:02:03");
        this.eq("Time String", MDateTimeMagic("01:02").toString(), "01:02:00");
        this.eq("Date Time obj", MDateTimeMagic(new MDateTime("2019-07-08T01:02:03.4")).toString(), "2019-07-08T01:02:03.400");
        this.eq("Date Time String", MDateTimeMagic("2019-07-08T01:02:03.4").toString(), "2019-07-08T01:02:03.400");
        this.eq("DateTime now", MDateTimeMagic("now").getTime(), (new Date()).getTime());
        this.eq("DateTime now inst", MDateTimeMagic("now") instanceof MDateTime, true);
        this.eq("DateTime Date", MDateTimeMagic(new Date("2019-07-08T01:02:03.4")).toString(), "2019-07-08T01:02:03.400");
        this.eq("DateTime number", MDateTimeMagic((new Date("2019-07-08T01:02:03.4")).getTime()).toString(), "2019-07-08T01:02:03.400");
    }
}

function dounittest()
{
    var ut = new TestMDateTime()
    ut.clearresults();
    ut.run();
    ut.displayresults();
}

window.dounittest = dounittest;

