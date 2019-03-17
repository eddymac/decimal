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

var TestMTime = function() {UnitTest.call(this); };
TestMTime.prototype  = Object.assign(Object.create(UnitTest.prototype), {
    constructor: TestMTime,
    test_create: function()
    {
        this.eq("undefined", (new MTime()).toString(), "00:00:00");
        this.eq("null", (new MTime(null)).toString(), "00:00:00");
        this.eq("invalid", (new MTime("rubbish")).toString(), null);
        this.eq("String1", (new MTime("01:02")).toString(), "01:02:00");
        this.eq("String2", (new MTime("01:02:03")).toString(), "01:02:03");
        this.eq("String3", (new MTime("01:02:03.14")).toString(), "01:02:03.140");
        this.eq("Invalid range", (new MTime("25:02:03.14")).toString(), null);
        this.eq("Invalid NaN", (new MTime("aa:02:03.14")).toString(), null);

        var da = new Date();
        var ta = new MTime("NOW");
        this.eq("Now hours", ta.getHours(), da.getHours());
        this.eq("Now Minutes", ta.getMinutes(), da.getMinutes());
        this.eq("Now Seconds", ta.getSeconds(), da.getSeconds());

        da = new Date(1994, 8, 5, 6, 10, 20, 0);
        this.eq("Date", (new MTime(da)).toString(), "06:10:20");

        


    },
    test_now: function()
    {
        this.eq("Now function", (new MTime()).now().toString().substring(0, 8), (new MTime("NOW")).toString().substring(0, 8));
    },
    test_assemble()
    {
        this.eq("Assemble", (new MTime()).assemble(1, 2, 73, 45).toString(), "01:03:13.045");
    },
    test_reset: function()
    {
        var da = new MTime("NOW");
        this.eq("reset", da.reset().toString(), "00:00:00");
    },
    test_isvalid: function()
    {
        this.eq("Valid", (new MTime()).isValid(), true);
        this.eq("Not Valid", (new MTime("rubbish")).isValid(), false);
    },
    test_truncate: function()
    {
        var da = new MTime("01:02:03.456");
        this.ne("Not trunc", da.getMilliseconds(), 0);
        this.eq("Trunc", da.truncate().getMilliseconds(), 0);
    },

    test_adddays: function()
    {
        var da = (new MTime()).addDays(2);
        this.eq("Add day iteger main", da.toString(), "00:00:00");
        this.eq("Add day iteger days", da.getDays(), 2);
        var da = (new MTime()).addDays(3.25);
        this.eq("Add day 3.25 main", da.toString(), "06:00:00");
        this.eq("Add day 3.25 days", da.getDays(), 3);
        da.addDays(1.5);
        this.eq("Add day again 1.5 main", da.toString(), "18:00:00");
        this.eq("Add day 1.5 days", da.getDays(), 4);
        this.eq("Add days with minutes", (new MTime()).addDays((3/24) + (5 /(24 * 60))).toString(), "03:05:00");
        this.eq("Add days with minutes", (new MTime()).addDays((3/24) + (5 /(24 * 60))+ (20 / (24 * 3600) + (420 / (86400000)))).toString(), "03:05:20.420");
        this.eq("Add days with minutes Decimal", (new MTime()).addDays(new MDecimal((3/24) + (5 /(24 * 60))+ (20 / (24 * 3600) + (420 / (86400000))))).toString(), "03:05:20.420");

        var da = (new MTime()).addDays(-1.125);
        this.eq("Add day neg main", da.toString(), "21:00:00");
        this.eq("Add day integer days", da.getDays(), -2);
    },
    test_addhours: function()
    {
        this.eq("Add hours int", (new MTime("01:02:03")).addHours(3).toString(), "04:02:03");
        this.eq("Add hours big int", (new MTime("06:02:03")).addHours(23).toString(), "05:02:03");
        this.eq("Add hours big int Decimal", (new MTime("06:02:03")).addHours(new MDecimal(23)).toString(), "05:02:03");
        this.eq("Add hours big int days", (new MTime("06:02:03")).addHours(23).getDays(), 1);
        this.eq("Add hours neg", (new MTime("01:02:03")).addHours(-3).toString(), "22:02:03");
        this.eq("Add hours neg days", (new MTime("01:02:03")).addHours(-3).getDays(), -1);
    },
    test_addminutes: function()
    {
        this.eq("Add minutes", (new MTime("01:02:03")).addMinutes(20).toString(), "01:22:03");
        this.eq("Add minutes Decimal", (new MTime("01:02:03")).addMinutes(new MDecimal(20)).toString(), "01:22:03");
        this.eq("Add big minutes", (new MTime("01:02:03")).addMinutes(100).toString(), "02:42:03");
    },
    test_addseconds: function()
    {
        this.eq("Add seconds", (new MTime("01:02:03")).addSeconds(20).toString(), "01:02:23");
        this.eq("Add seconds Decimal", (new MTime("01:02:03")).addSeconds(new MDecimal(20)).toString(), "01:02:23");
        this.eq("Add big seconds", (new MTime("01:02:03")).addSeconds(100).toString(), "01:03:43");
    },
    test_addmillis: function()
    {
        this.eq("Add Millis", (new MTime("01:02:03")).addMilliseconds(20).toString(), "01:02:03.020");
        this.eq("Add millis Decimal", (new MTime("01:02:03")).addMilliseconds(new MDecimal(20)).toString(), "01:02:03.020");
        this.eq("Add big millis", (new MTime("01:02:03")).addMilliseconds(1234).toString(), "01:02:04.234");
        this.eq("Add neg millis", (new MTime("01:02:03")).addMilliseconds(-20).toString(), "01:02:02.980");
    },
    test_diffmtime: function()
    {
        this.eq("Diff time", (new MTime("10:11:12.555")).diffMTime("16:01:01.1").toString(), "05:49:48.545");
        this.eq("Diff time days", (new MTime("10:11:12.555")).diffMTime("16:01:01.1").getDays(), 0);
        this.eq("Diff time neg", (new MTime("10:11:12.555")).diffMTime("04:01:01.1").toString(), "17:49:48.545");
        this.eq("Diff time neg days", (new MTime("10:11:12.555")).diffMTime("04:01:01.1").getDays(), -1);
    },
    test_diffdays: function()
    {
        this.eq("Diff days", (new MTime("01:02:03")).diffDays((new MTime("01:02:03")).addDays(4)), 4);
        this.eq("Diff days hours", (new MTime("01:02:03")).diffDays((new MTime("13:02:03")).addDays(4)), 4.5);
        this.eq("Diff days seconds", (new MTime("01:02:03")).diffDays((new MTime("15:40:27")).addDays(4)), 4.61);
        this.eq("Diff days millis", (new MTime("01:02:03")).diffDays((new MTime("15:41:53.4")).addDays(4)), 4.611);
    },
    test_diffhours: function()
    {
        this.eq("Diff hours", (new MTime("01:02:03")).diffHours("01:02:03"), 0);
        this.eq("Diff hours hours", (new MTime("01:02:03")).diffHours("13:02:03"), 12);
        this.eq("Diff hours seconds", (new MTime("01:02:03")).diffHours("15:40:27"), 14.64);
        this.eq("Diff hours millis", (new MTime("01:02:03")).diffHours("15:41:53.4"), 14.664);
        this.eq("Diff hours with days", (new MTime("01:02:03")).diffHours((new MTime("01:02:03")).addDays(4)), 96);
        this.eq("Diff hours with days hours", (new MTime("01:02:03")).diffHours((new MTime("13:02:03")).addDays(4)), 108);
        this.eq("Diff hours with days seconds", (new MTime("01:02:03")).diffHours((new MTime("15:40:27")).addDays(4)), 110.64);
        this.eq("Diff hours with days millis", (new MTime("01:02:03")).diffHours((new MTime("15:41:53.4")).addDays(4)), 110.664);
    },
    test_diffminutes: function()
    {
        this.eq("Diff minutes", (new MTime("01:02:03")).diffMinutes("01:04:03"), 2);
        this.eq("Diff minutes neg", (new MTime("01:02:03")).diffMinutes("01:00:03"), -2);
        this.eq("Diff minutes neg carry", (new MTime("01:02:03")).diffMinutes("00:59:03"), -3);
        this.eq("Diff minutes hours", (new MTime("01:02:03")).diffMinutes("13:02:03"), 720);
        this.eq("Diff minutes seconds", (new MTime("01:02:03")).diffMinutes("15:40:27"), 878.4);
        this.eq("Diff minutes millis", (new MTime("01:02:03")).diffMinutes("15:41:53.4"), 879.84);
    },
    test_diffseconds: function()
    {
        this.eq("Diff seconds", (new MTime("01:02:03")).diffSeconds("01:02:05"), 2);
        this.eq("Diff seconds carry", (new MTime("01:02:03")).diffSeconds("01:03:01"), 58);
        this.eq("Diff seconds neg", (new MTime("01:02:03")).diffSeconds("01:02:01"), -2);
        this.eq("Diff seconds neg carry", (new MTime("01:02:03")).diffSeconds("01:01:59"), -4);
        this.eq("Diff seconds hours", (new MTime("01:02:03")).diffSeconds("13:02:03"), 43200);
        this.eq("Diff seconds seconds", (new MTime("01:02:03")).diffSeconds("15:40:27"), 52704);
        this.eq("Diff seconds millis", (new MTime("01:02:03")).diffSeconds("15:41:53.4"), 52790.4);
    },
    test_diffmillis: function()
    {
        this.eq("Diff millis", (new MTime("01:02:03.123")).diffMilliseconds("01:02:03.326"), 203);
        this.eq("Diff millis carry", (new MTime("01:02:03.123")).diffMilliseconds("01:02:04.1"), 977);
        this.eq("Diff millis neg", (new MTime("01:02:03.123")).diffMilliseconds("01:02:03.121"), -2);
        this.eq("Diff millis neg carry", (new MTime("01:02:03.123")).diffMilliseconds("01:02:02.456"), -667);
        this.eq("Diff millis hours", (new MTime("01:02:03")).diffMilliseconds("13:02:03"), 43200000);
        this.eq("Diff millis seconds", (new MTime("01:02:03")).diffMilliseconds("15:40:27"), 52704000);
        this.eq("Diff millis millis", (new MTime("01:02:03")).diffMilliseconds("15:41:53.4"), 52790400);
    },
    test_gets: function()
    {
        var da = (new MTime("03:04:05.678")).addDays(2);

        this.eq("days", da.getDays(), 2);
        this.eq("hours", da.getHours(), 3);
        this.eq("minutes", da.getMinutes(), 4);
        this.eq("seconds", da.getSeconds(), 5);
        this.eq("millis", da.getMilliseconds(), 678);
    },
    test_sets: function()
    {
        // Does _rationalise as well
        var db = (new MTime("03:04:05.678")).addDays(2);

        this.eq("Days 1", (new MTime(db)).setDays(3).getDays(), 3);
        this.eq("Days 2", (new MTime(db)).setDays(3.123).toString(), "03:04:05.678");
        this.eq("Hours 1", (new MTime(db)).setHours(5).toString(), "05:04:05.678");
        this.eq("Hours 2", (new MTime(db)).setHours(26).toString(), "02:04:05.678");
        this.eq("Hours 2 days", (new MTime(db)).setHours(26).getDays(), 3);
        this.eq("Hours 3", (new MTime(db)).setHours(-10).toString(), "14:04:05.678");
        this.eq("Hours 3 days", (new MTime(db)).setHours(-10).getDays(), 1);
        this.eq("Minutes 1", (new MTime(db)).setMinutes(6).toString(), "03:06:05.678");
        this.eq("Minutes 2 hours", (new MTime(db)).setMinutes(86).toString(), "04:26:05.678");
        this.eq("Minutes 2 hours days", (new MTime(db)).setMinutes(1573).toString(), "05:13:05.678");
        this.eq("Minutes 2 hours days 2", (new MTime(db)).setMinutes(1573).getDays(), 3);
        this.eq("Minutes 3", (new MTime(db)).setMinutes(-10).toString(), "02:50:05.678");
        this.eq("Minutes 3 days", (new MTime(db)).setMinutes(-10).getDays(), 2);
        this.eq("Seconds 1", (new MTime(db)).setSeconds(6).toString(), "03:04:06.678");
        this.eq("Seconds 2 minutes", (new MTime(db)).setSeconds(146.1234).toString(), "03:06:26.678");
        this.eq("Seconds 3", (new MTime(db)).setSeconds(-70).toString(), "03:02:50.678");
        this.eq("Millis 1", (new MTime(db)).setMilliseconds(123).toString(), "03:04:05.123");
        this.eq("Millis 2 Seconds", (new MTime(db)).setMilliseconds(2123.1234).toString(), "03:04:07.123");
        this.eq("Millis 3", (new MTime(db)).setMilliseconds(-3678).toString(), "03:04:01.322");

        // Do short string here
        this.eq("Short string", db.toShortString(), "03:04");
    }
});

function dounittest()
{
    var ut = new TestMTime()
    ut.clearresults();
    ut.run();
    ut.displayresults();
}

