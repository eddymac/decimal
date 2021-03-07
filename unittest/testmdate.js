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
import {MDate, MTime, MDateTime} from "../mdatetime.js";
import {MDecimal} from "../mdecimal.js";

class TestMDate extends UnitTest {
    constructor()
    {
        super();
    }

    test_create(undef)
    {
        var today = new Date();
        var dstr = today.getFullYear().toString()
            + "-" + (today.getMonth() + 1).toString().padStart(2, '0')
            +  "-" + today.getDate().toString().padStart(2, '0');
        this.eq("Blank", "", (new MDate()).toString());
        this.eq("Now", dstr, (new MDate("now")).toString());
        this.eq("Now2", dstr, (new MDate()).now().toString());
        this.eq("MTime", dstr, (new MDate(new MTime("01:02:03"))).toString());

        this.eq("String", "1959-08-25", (new MDate("1959-08-25")).toString())
        this.eq("MDate", "1959-08-25", (new MDate(new MDate("1959-08-25"))).toString())
        this.eq("Date (with time)", "1959-08-25", (new MDate(new Date(1959, 7, 25, 13, 11, 10, 0))).toString())
        this.eq("Date (with no time)", "1959-08-25", (new MDate(new Date(1959, 7, 25, 0, 0, 0, 0))).toString())
        this.eq("Number", "1959-08-25", (new MDate((new Date(1959, 7, 25, 13, 11, 10, 0)).getTime())).toString())
    }
    test_isvalid()
    {
        this.eq("Valid", true, (new MDate("1959-08-25")).isValid())
        this.eq("Out of range", false, (new MDate("1959-08-32")).isValid())
        this.eq("Rubbish", false, (new MDate("rubbish")).isValid())
        // this.eq("Invalid JS Date", false, (new MDate((new Date("rubbish")))).isValid())
    }
    test_jsdate()
    {
        this.eq("JS Date", 7, (new MDate("1994-08-06")).jsDate().getMonth());
    }
    test_daysdiff()
    {
        this.eq("Number", 31, (new MDate("2016-07-03")).diffDays("2016-08-03"));
        this.eq("Days Negative", -30, (new MDate("2016-07-03")).diffDays("2016-06-03"));
        this.eq("Over time zone", 31 + 31 + 30 + 31 + 30 + 31, (new MDate("2016-07-03")).diffDays("2017-01-03"));
        this.eq("Over time zone negative", 0 - (30 + 31 + 30 + 31 + 29 + 31), (new MDate("2016-07-03")).diffDays("2016-01-03"));
    }
    test_monthsdiff()
    {
        this.eq("Number", 1, (new MDate("2016-07-03")).diffMonths("2016-08-03"));
        this.eq("Neg", -2, (new MDate("2016-07-03")).diffMonths("2016-05-03"));
        this.eq("Some months", 2 + (5 / 31), (new MDate("2016-07-03")).diffMonths("2016-09-08"));
        this.eq("Pos some months neg", 2 - (3 / 31), (new MDate("2016-07-08")).diffMonths("2016-09-05"));
        this.eq("Some months neg", 0 - (2 + (5 / 31)), (new MDate("2016-07-08")).diffMonths("2016-05-03"));
        this.eq("Years", 25, (new MDate("2016-07-03")).diffMonths("2018-08-03"));
        this.eq("Neg years", -23, (new MDate("2016-07-03")).diffMonths("2014-08-03"));
    }
    test_yearsdiff()
    {
        this.eq("Number", 2, (new MDate("2016-07-03")).diffYears("2018-07-03"));
        this.eq("Neg with fract", -3.25, (new MDate("2016-07-03")).diffYears("2013-04-03"));
    }

    test_withday()
    {
        this.eq("Default", "1962-09-01", (new MDate("1962-09-22")).withDay().toString())
        this.eq("Day set", "1962-09-03", (new MDate("1962-09-22")).withDay(3.1).toString())
        this.eq("Day decimal", "1962-09-04", (new MDate("1962-09-22")).withDay(new MDecimal(4)).toString())
        this.eq("Day string", "1962-09-05", (new MDate("1962-09-22")).withDay("5").toString())
    }
    test_withmonthday()
    {
        this.eq("Default", "1962-01-01", (new MDate("1962-09-22")).withMonthDay().toString())
        this.eq("Default day", "1962-03-01", (new MDate("1962-09-22")).withMonthDay(3).toString())
        this.eq("Both set", "1962-03-04", (new MDate("1962-09-22")).withMonthDay(3, 4).toString())
        this.eq("Day default", "1962-01-05", (new MDate("1962-09-22")).withMonthDay(null, 5.1).toString())
        this.eq("Day decimals", "1962-04-05", (new MDate("1962-09-22")).withMonthDay(new MDecimal(4), new MDecimal(5)).toString())
        this.eq("Day strings", "1962-09-05", (new MDate("1962-09-22")).withMonthDay("9", "5.3").toString())
    }
    test_daysadd()
    {
        this.eq("Normal", "2020-03-04", (new MDate("2020-03-02")).addDays(2).toString());
        this.eq("MDecimal", "2020-02-28", (new MDate("2020-03-04")).addDays(new MDecimal("-5.2")).toString());
        this.eq("Timezone1", "2015-07-01", (new MDate("2015-01-01")).addDays(31 + 28 + 31 + 30 + 31 + 30).toString());
        this.eq("Timezone1 neg", "2015-01-01", (new MDate("2015-07-01")).addDays(0 - (31 + 28 + 31 + 30 + 31 + 30)).toString());
        this.eq("Timezone2", "2016-01-01", (new MDate("2015-07-01")).addDays(31 + 31 + 30 + 31 + 30 + 31).toString());
        this.eq("Timezone2 neg", "2015-07-01", (new MDate("2016-01-01")).addDays(0 -(31 + 31 + 30 + 31 + 30 + 31)).toString());

    }
    test_mtimeadd()
    {
        this.eq("Add 0", "2020-03-04", (new MDate("2020-03-04")).addMTime("23:59:59.999").toString());
        this.eq("Add 1", "2020-03-05", (new MDate("2020-03-04")).addMTime((new MTime("23:59:59.999")).addMinutes(1)).toString());
    }
    test_monthsadd()
    {
        this.eq("Number", "2019-03-02", (new MDate("2019-01-02")).addMonths(2).toString());
        this.eq("Neg", "2019-12-02", (new MDate("2020-03-02")).addMonths(-3).toString());
        this.eq("Fract", "2019-03-17", (new MDate("2019-01-02")).addMonths(2.5).toString());
        this.eq("Neg fract", "2018-09-17", (new MDate("2019-01-02")).addMonths(-3.5).toString());
        this.eq("MDecimal", "2019-09-17", (new MDate("2019-06-17")).addMonths(new MDecimal(3)).toString());
        this.eq("Lastday test", "2019-02-28", (new MDate("2019-01-30")).addMonths(1).toString());
        this.eq("Lastday neg test", "2019-04-30", (new MDate("2019-05-31")).addMonths(-1).toString());
    }
    test_yearssadd()
    {
        this.eq("Number", "2019-03-02", (new MDate("2017-03-02")).addYears(2).toString());
        this.eq("Fract", "2019-09-02", (new MDate("2017-03-02")).addYears(2.5).toString());
        this.eq("Fract with days", "2019-09-11", (new MDate("2017-03-02")).addYears(2.5 + (10 / (31 * 12))).toString());
        this.eq("Neg", "2015-03-02", (new MDate("2017-03-02")).addYears(-2).toString());

        // These 2 in the correct ballpark - canno really do better
        this.eq("Neg fract", "2013-09-02", (new MDate("2017-03-02")).addYears(-3.5).toString());
        this.eq("Neg fract with days", "2013-08-28", (new MDate("2017-03-02")).addYears(-3.5 - (5 / (31 * 12))).toString());
    }

    test_plus()
    {
        this.eq("Days", "2020-03-06", (new MDate("2020-03-04")).plusDays(2).toString());
        this.eq("Months", "2020-05-04", (new MDate("2020-03-04")).plusMonths(2).toString());
        this.eq("Years", "2022-03-04", (new MDate("2020-03-04")).plusYears(2).toString());
        this.eq("Hours", "2020-03-05", (new MDate("2020-03-04")).plusHours(35).toString());
        this.eq("Hours twide", "2020-03-05", (new MDate("2020-03-04")).plusHours(35).plusHours(23).toString());
        this.eq("Minutes", "2020-03-05", (new MDate("2020-03-04")).plusMinutes(35 * 60).toString());
        this.eq("Seconds", "2020-03-05", (new MDate("2020-03-04")).plusSeconds(35 * 3600).toString());
        this.eq("Milliseconds", "2020-03-05", (new MDate("2020-03-04")).plusMilliseconds(35 * 3600000).toString());
    }

    test_gets()
    {
        this.eq("Date", 14, (new MDate("2019-03-14")).getDate());
        this.eq("Month", 3, (new MDate("2019-03-14")).getMonth());
        this.eq("Year", 2019, (new MDate("2019-03-14")).getYear());
        this.eq("Day", 4, (new MDate("2019-03-14")).getDay());
    }
    test_assemble()
    {
        this.eq("Assemble", "2019-04-03", (new MDate()).assemble(2019, 4, 3).toString());
    }
    test_LastDate()
    {
        this.eq("April", 30, (new MDate()).assemble(2019, 4, 3).lastDate());
        this.eq("Feb 19", 28, (new MDate("2019-02-03")).lastDate());
        this.eq("Feb 20", 29, (new MDate("2020-02-03")).lastDate());
        this.eq("Mar last", 31, (new MDate("2020-03-31")).lastDate());
    }

    test_cmp()
    {
        this.eq("Equals", 0, (new MDate("2018-07-24")).cmp("2018-07-24"));
        this.eq("Less Than", -1, (new MDate("2018-07-23")).cmp("2018-07-24"));
        this.eq("Greater than", 1, (new MDate("2018-07-25")).cmp("2018-07-24"));

        this.eq("Der eq", true, (new MDate("2018-07-24")).eq("2018-07-24"));
        this.eq("Der not eq", false, (new MDate("2018-07-24")).eq("2018-07-25"));
        this.eq("Der gt", true, (new MDate("2018-08-24")).gt("2018-07-24"));
        this.eq("Der not gt", false, (new MDate("2018-07-24")).gt("2018-07-24"));
        this.eq("Der lt", true, (new MDate("2018-08-24")).lt(new MDate("2018-08-25")));

        this.eq("Der ne", false, (new MDate("2018-07-24")).ne("2018-07-24"));
        this.eq("Der not ne", true, (new MDate("2018-07-24")).ne("2018-07-25"));
        this.eq("Der not le", false, (new MDate("2018-08-24")).le("2018-07-24"));
        this.eq("Der le", true, (new MDate("2018-07-24")).le("2018-07-24"));
        this.eq("Der not ge", false, (new MDate("2018-08-24")).ge(new MDate("2018-08-25")));
        this.eq("Der ge equals", true, (new MDate("2018-08-24")).ge(new MDate("2018-08-24")));
        this.eq("Der ge greater", true, (new MDate("2018-08-24")).ge(new MDate("2018-08-23")));
    }
}

function dounittest()
{
    var ut = new TestMDate()
    ut.clearresults();
    ut.run();
    ut.displayresults();
}

window.dounittest = dounittest;


