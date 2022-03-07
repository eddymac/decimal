"use strict";

/*
 The mdatetime.js classes
 Dependancy = the mdecimal.js file - the MDecimal class
            = the mutilbase.js file - the MUtilBase class

 This provides three date and time oriented classes

 MDate - The Date class -   This handles just dates, hours, minutes, seconds
                            and milliseconds are simply ignored

 MTime - The time class -   This handles just times.  It also doubles as
                            an interval class in some respects

 MDateTime - Date time class -
                            This is a date/time or timestamp class


 The MDate and MDateTime have the Javascript "Date" object as a "base",
 the MTime does not.

 For the following, timezones are ignored, and it uses local times.
 In future there may be a global UTC switch or something.

 Following are summary of methods and functions, not all apply to
 all the above classes, they do not where irrevelant

 Where an MDate, MTime or MDateTime object is required, and the appropriate
 one is not provided, the system will try and create the appropriate
 object using the supplied argument as the creation one.
 i.e:
 setMDate("2019-03-02")
   is same as
 setMDate(new MDate("2019-03-02"))

 All numbers passed can be floats, integers, strings(with numbers in it)
 or MDecimal objects

 All three classes derive from a MDateTimeBase class

 An "MDateTimeMagic(arg)" function is supplied,  this will return null
 (on error) or an instance of one of the three classes, which one depends
 on the argument supplied.

 The Class method/function overview:

 Creation:
 ~~~~~~~~~
 new CLASS("NOW")        - Create object as of "now"
 new CLASS()             - Create object as of null
 new CLASS(object)       - Cast from MDate, MDateTime, MTime and Date objects
 new CLASS(string)       - Set from ISO string (No time zones)
 new CLASS(number)       - Set from JS milliseconds
 new CLASS(all_else)     - Does it's best from "string"

 Setting:
 ~~~~~~~~
 setMDate(MDate_obj)     - Sets date portion of object
 setMTime(MDate_obj)     - Sets time portion of object
 setMDateTime(MDate_obj) - Sets relevant parts of object
 assemble(integers)      - Assembles from integers
                           Only supply integers relevant to object
                           YYYY, MM, DD for MDate
                           HH, MM, SS, MMMM for MTime
                           All 7 for MDateTime
 setDate(day)            - Sets the Date (day) portion of Date
 setMonth(month)         - Sets the Month portion of Date
                            Months start at 1 (Jan),  and ends at 12 (Dec)
 setYear(year)           - Sets the (full) year
 setHours(hour)          - Sets the hour part of time (0 - 23)
 setMinutes(minutes)     - Sets the minutes part of time (0 - 59)
 setSecconds(seconds)    - Sets the seconds part of time (0 - 59)
 setMillisecconds(mils)  - Sets the milliseconds part of time (0 - 999)
 setTime(milliseconds)   - Sets the time based on milliseconds, (0 - 86400000)
 setDays(days)           - Only applciable to MTime as an interval
                           sets the number of days

 Getting:
 ~~~~~~~~
 toString()              - Returns an ISO string representation of the object
 toShortString()         - MTime objects ony - retutns string HH:MM
 getDays()               - MTime intervals only - get number of days as integer
 getYYYY()               - YYYY can be Year, Month, Date (day of month),
                           Hours, Minutes, Seconds, Milliseconds, Day (day of week)
                           or Time (number of milliseconds since midnight)



 Manipulating:
 ~~~~~~~~~~~~~
 addXXXX(amoubnt)        - Adds units to object, XXXX can be:
                           Miliseconds, Seconds, Minutes, Hours,
                           Days, Months, Years
 addMTime(MTime_obj)     - Can also be MTime for adding an mtime interval

 floor()                 - Truncates the time portion - MDateTime only

 Extracting
 ~~~~~~~~~~
 plusXXXXX(amnt)         - Like add.... except it returns new object
                           rather than manipulates current
 diffXXXX(object)        - Difference between this and object (of same type)
                           return a number (Float)
 copy()                  - Creates and returns a deep copy of the object

*/

/*
IMPORT
 */

import {MUtilBase, coalesce} from "./mutilbase.js";
import {MDecimal} from "./mdecimal.js";

var _MDATETIME_MILLIS = 86400000;
var _MDATETIME_MILLIS_HALF = 43200000;

// A valid regular expression for date string
var _MDATETIME_DATEREG = /^\d\d\d\d\-\d\d\-\d\d$/
var _MDATETIME_TIMEREG1 = /^(\d+):(\d+):(\d+)\.(\d+)$/;
var _MDATETIME_TIMEREG2 = /^(\d+):(\d+):(\d+)$/;
var _MDATETIME_TIMEREG3 = /^(\d+):(\d+)$/;

class MDateTimeBase extends MUtilBase  {
    constructor()
    {
        super();
        this._date = null;
        this.reset();
    }

    derSetNull(ind)
    {
        if(ind)
            this._date = null;
    }
    jsDate()
    {
        // The internal date object
        return this._date;
    }

    getDate() { return this._date.getDate(); }
    getMonth() { return this._date.getMonth() + 1; }
    getYear() { return this._date.getFullYear(); }
    getDay() { return this._date.getDay(); }
    getTime() {return this._date.getTime(); }

    setDate(date)
    {
        if(!this.isValue()) return this;
        date = MDecimal.toMDecimal(date);
        if(date.isValue()) this._date.setDate(date.intPart());
        return this;
    }
    setMonth(month)
    {
        if(!this.isValue()) return this;
        month = MDecimal.toMDecimal(month);
        if(month.isValue()) this._date.setMonth(month.intPart() - 1);
        return this;
    }
    setYear(year)
    {
        if(!this.isValue()) return this;
        year = MDecimal.toMDecimal(year);
        if(year.isValue()) this._date.setYear(year.intPart());
        return this;
    }
    lastDate()
    {
        if(!this.isValue()) return null;
        return this._lastday(this._date.getMonth(), this._date.getFullYear());
    }

    eq(inp)
    {
        var ans = this.cmp(inp);
        if (ans == null)
            return null;
        else
            return ans == 0;
    }
    lt(inp)
    {
        var ans = this.cmp(inp);
        if (ans == null)
            return null;
        else
            return ans < 0;
    }
    gt(inp)
    {
        var ans = this.cmp(inp);
        if (ans == null)
            return null;
        else
            return ans > 0;
    }
    ne(inp)
    {
        var ans = this.cmp(inp);
        if (ans == null)
            return null;
        else
            return ans != 0;
    }
    le(inp)
    {
        var ans = this.cmp(inp);
        if (ans == null)
            return null;
        else
            return ans <= 0;
    }
    ge(inp)
    {
        var ans = this.cmp(inp);
        if (ans == null)
            return null;
        else
            return ans >= 0;
    }

    plusDays(days) {return this.copy().addDays(days); }
    plusMonths(months) {return this.copy().addMonths(months); }
    plusYears(years) {return this.copy().addYears(years); }
    plusHours(hours) {return this.copy().addHours(hours); }
    plusMinutes(minutes) {return this.copy().addMinutes(minutes); }
    plusSeconds(seconds) {return this.copy().addSeconds(seconds); }
    plusMilliseconds(millis) {return this.copy().addMilliseconds(millis); }
    plusMTime(mtime) {return this.copy().addMTime(mtime); }

    // private / protected
    _lastday(mm, yy)
    {
        // Gets last day of month, year
        mm += 1;
        if(mm >= 11) {
            mm = 0;
            yy += 1;
        }
        // get the date
        var ted = new Date(new Date(yy, mm, 1, 0, 0, 0, 0).getTime() - _MDATETIME_MILLIS_HALF)
        return ted.getDate()
    }
}

class MDate extends MDateTimeBase {
    constructor(arg)
    {
        super();
        this.setMDate(arg);
    }

    static toMDate(inp)
    {
        if(!(inp instanceof MDate))
            inp = new MDate(inp);
        return inp;
    }

    // Assumption here is that dates are valid
    // does not really check if not
    setMDate(arg)
    {
        // Arg can be a js Date arg, or a Date, MDate, MDateTime, MTime
        this.reset();
        if(arg instanceof MUtilBase) {
            if(!arg.isValue()) {
                return this;
            }
        }

        this.setNull(false);
        if(arg instanceof MDateTime) arg = arg.jsDate();
        if(arg instanceof MTime) {
            return this.now();
        }
        if(typeof arg == "string")
            if(arg.toUpperCase() == "NOW")
                return this.now();
        arg = coalesce(arg, null);
        if(arg == null) {
            this.setNull(true);
            this._date = null;
        } else if (arg instanceof MDate) {
            this._date = new Date(arg.getYear(), arg.getMonth() - 1, arg.getDate(), 0, 0, 0, 0);
        } else if (arg instanceof Date) {
            this._date = new Date(arg.getFullYear(), arg.getMonth(), arg.getDate(), 0, 0, 0, 0);
        } else {
            this._date = new Date(arg);
            this.testValid();
        }
        // Set time to zero
        
        this._date = this._floor(this._date);
        return this;
    }

    now()
    {
        this.reset();
        this._floor(new Date());
        this.setNull(false);
        return this;
    }

    copy() {return new MDate(this); }

    assemble(year, month, day)
    {
        // Manually assemble the date
        this._date = new Date(year, month-1, day, 0, 0, 0, 0);
        this._isblank = false;
        return this;
    }

    testValid()
    {
        // Checks to see if valid
        if(this.isNull())
        {
            this.setValid(true);
        } else if(_MDATETIME_DATEREG.test(this.toString())) {
            this.setValid(true);
        } else {
            this.setValid(false);
        }
        return this.isValid();
    }

    derToString()
    {
        // Returns ISO format string
        return this._date.getFullYear().toString() + "-" +
            (this._date.getMonth() + 1).toString().padStart(2, '0') + "-" +
            this._date.getDate().toString().padStart(2, '0');
    }

    diffDays(odate)
    {
        // Days difference
        // this is from, odate is to (oposite to subtract)
        odate = MDate.toMDate(odate);
        if((!this.isValue()) || (!odate.isValue())) return null;
        return Math.round(odate._date.getTime() / _MDATETIME_MILLIS)
                    - Math.round(this._date.getTime() / _MDATETIME_MILLIS)
    }

    diffMonths(odate)
    {
        // If ay not same assume 31 days as fraction,
        // otherwise things get complicated here
        // this is from, odate is to (oposite to subtract)

        odate = MDate.toMDate(odate);
        if((!this.isValue()) || (!odate.isValue())) return null;
        var d1 = this._date;
        var d2 = odate._date;
        var m1 = Math.round(d1.getTime() /  _MDATETIME_MILLIS);
        var m2 = Math.round(d2.getTime() /  _MDATETIME_MILLIS);

        var neg = false;
        if(m1 > m2) {
            var temp = d1;
            d1 = d2;
            d2 = temp;
            temp = m1;
            m1 = m2;
            m2 = temp;
            neg = true;
        }

        var n1 = (d1.getFullYear() * 12) + d1.getMonth();
        var n2 = (d2.getFullYear() * 12) + d2.getMonth();
        var gap = 0.0;
        var p1 = d1.getDate();
        var p2 = d2.getDate();
        if(p1 != p2) {
            // Days not same
            // Assume 31 days for wach month, gets REALLY confusing if not
            gap = (p2 - p1) / 31;
        }
        if (neg)
            return 0 -((n2 - n1) + gap);
        else
            return (n2 - n1) + gap;
    }

    diffYears(odate)
    {
        // Easy one
        var ret = this.diffMonths(odate);
        if(ret === null) return ret;
        return ret / 12;
    }

    withDay(day)
    {
        // Gets a specific day of the month, defult to 1
        // Does not validate, developer should call isValid if in doubt
        if(!this.isValue()) return new MDate(null);
        day = coalesce(day, 1);
        if(day instanceof MDecimal)
            day = day.intPart();
        else
            day = parseInt(day);
        var dt = this._date;
        return new MDate(new Date(dt.getFullYear(), dt.getMonth(), day, 0, 0, 0, 0));
    }

    withMonthDay(month, day)
    {
        // Gets a specific day of the month, defult to 1st Jan
        // Does not validate, developer should call isValid if in doubt
        if(!this.isValue()) return new MDate(null);
        day = coalesce(day, 1);
        if(day instanceof MDecimal)
            day = day.intPart();
        else
            day = parseInt(day);
        month = coalesce(month, 1);
        if(month instanceof MDecimal)
            month = month.intPart();
        else
            month = parseInt(month);
        month = month - 1;
        var dt = this._date;
        return new MDate(new Date(dt.getFullYear(), month, day, 0, 0, 0, 0));
    }

    addMilliseconds(millis) { return this._addamt(millis, 86400000); }
    addSeconds(seconds) { return this._addamt(seconds, 86400); }
    addMinutes(minutes) { return this._addamt(minutes, 1440); }
    addHours(hours) { return this._addamt(hours, 24); }
    addDays(days) { return this._addamt(days, 1); }

    addMTime(mtime)
    {
        mtime = MTime.toMTime(mtime);
        if((!this.isValue()) || (!mtime.isValue())) return this;
        if(!mtime.isValid()) return this;
        return this._addamt(mtime.getDays(), 1);
    }

    _addamt(amt, factor)
    {
        if(!this.isValue()) return this;
        // Add a day(s) to a date
        amt = coalesce(amt, 0);
        if(factor == 1)
            amt = MDecimal.toMDecimal(amt).intPart();
        else
            amt = MDecimal.toMDecimal(amt).divide(factor).intPart();

        // Do something a bit  weird to round for daylight saving
        this._date = this._floor(new Date(this._date.getTime() + (amt * _MDATETIME_MILLIS) + _MDATETIME_MILLIS_HALF));
        return this;
    }

    addMonths(months)
    {
        // Add month(s) to a date
        months = MDecimal.toMDecimal(months);
        if((!this.isValue()) || (!months.isValue())) return this;
        if(!months.isValid())
            months.setValue(0);
        this._monthsadd(this._date, months);
        return this;
    }
    addYears(years)
    {
        // Add a number of years to a date
        years = MDecimal.toMDecimal(years);
        if((!this.isValue()) || (!years.isValue())) return this;
        if(!years.isValid())
            years.setValue(0);
        this._monthsadd(this._date, years.multiply(12));
        return this;
    }

    // Some gets - pass onto _date


    // Comparisons
    cmp(date)
    {
        // 0: equal
        // 1: date > this
        // -1: date < this
        date = MDate.toMDate(date);
        if((!this.isValue()) || (!date.isValue())) return null;
        var m1 = this._date.getTime();
        var m2 = date._date.getTime();
        if (m1 == m2)
            return 0;
        else if (m1 > m2)
            return 1;
        else
            return -1;
    }

    _monthsadd(indate, months)
    {
        // Internal used for adding months
        var incm = months.intPart();
        // Following return floor
        var adate = this._monthsadddo(indate, incm);
        var fract = months.fracPart()
        if(fract != 0) {
            if (fract > 0) {
                var bdate = this._monthsadddo(adate, 1);
                var diff = Math.floor(fract * (bdate.getTime() - adate.getTime()));
            } else if (fract < 0) {
                var bdate = this._monthsadddo(adate, -1);
                var diff = 0 - Math.floor(fract * (bdate.getTime() - adate.getTime()));  // This is pos
            }
            adate = new Date(adate.getTime() + diff);
            // Following does floor
            adate = new Date(adate.getFullYear(), adate.getMonth(), adate.getDate(), 0, 0, 0, 0);
        }
        this._date = adate;
    }

    _monthsadddo(indate, incm)
    {
        // Utility for above
        var mm = indate.getMonth();
        var yy = indate.getFullYear();
        var dd = indate.getDate();

        // Add or subtract based on 1st of month
        mm = mm + incm;
        if(mm > 11) {
            yy = yy + Math.floor(mm / 12);
            mm = mm % 12;
        }
        if(mm < 0) {
            yy = yy - Math.floor((0 - mm) / 12);
            mm = 0 - ((0 - mm) % 12);
        }
        var wdate = new Date(indate.getFullYear(), indate.getMonth(), 1, 0, 0, 0, 0);

        // Check for last day
        // Add 1 to month

        // If last day(s) of month , and overflows,
        // use last day
        if(dd > 28) {
            var lastday = this._lastday(mm, yy);
            if(dd > lastday) dd = lastday;
        }
        return new Date(yy, mm, dd, 0, 0, 0, 0);
    }

    _floor(date)
    {
        // Get rid of hours etc
        this._date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
        // Return this._date for possible backwards compatability issies
        return this._date;
    }
}



class MTime extends MDateTimeBase {
    constructor(arg)
    {
        super();
        this.reset();
        this._hours = 0;
        this._minutes = 0;
        this._seconds = 0;
        this._millis = 0;
        this._days = 0; // Only used for intervals
        this.setMTime(arg);
    }

    static toMTime(inp)
    {
        if(!(inp instanceof MTime))
            inp = new MTime(inp);
        return inp;
    }

    setMTime(arg)
    {
        this.init();

        if(coalesce(arg, null) == null) return this;
        if(arg instanceof MDate) return this;       // Just zero

        var hours = 0;
        var minutes = 0;
        var seconds = 0;
        var millis = 0;
        this.setNull(false);

        if(arg instanceof MTime) {
            this.basecopy(arg);
            this._days = arg._days;
            this._hours = arg._hours;
            this._minutes = arg._minutes;
            this._seconds = arg._seconds;
            this._millis = arg._millis;
            return this;
        }
        if(arg instanceof MDateTime) arg = arg.jsDate();
        if(arg instanceof Date) {
            hours = arg.getHours();
            minutes = arg.getMinutes();
            seconds = arg.getSeconds();
            millis = arg.getMilliseconds();
        } else  {
            arg = arg.toString();
            if(arg.toUpperCase() == "NOW")
                return this.now();
            else if(arg == "0")
                return this.zero();

            var match = _MDATETIME_TIMEREG1.exec(arg);
            if(match) {
                hours = parseInt(match[1]);
                minutes = parseInt(match[2]);
                seconds = parseInt(match[3]);
                millis = parseInt(match[4].padEnd(3, '0'));
            } else {
                match = _MDATETIME_TIMEREG2.exec(arg);
                if(match) {
                    hours = parseInt(match[1]);
                    minutes = parseInt(match[2]);
                    seconds = parseInt(match[3]);
                } else {
                    match = _MDATETIME_TIMEREG3.exec(arg);
                    if(match) {
                        hours = parseInt(match[1]);
                        minutes = parseInt(match[2]);
                    } else {
                        var mdt = new MDateTime(arg);
                        if(mdt.isValid()) {
                            this.setMTime(mdt);
                        } else {
                            this.setNull(true);
                            this.setValid(false);
                       }
                       return this;
                    }
                }
            }
        }

        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || isNaN(millis)) {
            this.init();
            this.setNull(true);
            this.setValid(false);
            return this;
        }

        if(hours <= 23 && hours >= 0 &&
                minutes <= 59 && minutes >= 0 &&
                seconds <= 59 && seconds >= 0 &&
                millis <= 999 && millis >= 0) {
            this._hours = hours;
            this._minutes = minutes;
            this._seconds = seconds;
            this._millis = millis;
        } else {
            this.init();
            this.setNull(true);
            this.setValid(false);
        }
        return this;
    }

    copy() {return new MTime(this); }

    assemble(hours, minutes, seconds, millis)
    {
        this.init();
        this.setNull(false);
        this._hours = MDecimal.toMDecimal(hours).intPart();
        this._minutes = MDecimal.toMDecimal(minutes).intPart();
        this._seconds = MDecimal.toMDecimal(seconds).intPart();
        this._millis = MDecimal.toMDecimal(millis).intPart();
        this._rationalise();
        return this;
    }

    now()
    {
        var date = new Date();
        this.init();
        this._hours = date.getHours();
        this._minutes = date.getMinutes();
        this._seconds = date.getSeconds();
        this._millis = date.getMilliseconds();
        return this;
    }

    zero()
    {
        this.init();
        this.setNull(false);
        return this;
    }

    init()
    {
        this.reset();
        this._hours = 0;
        this._minutes = 0;
        this._seconds = 0;
        this._millis = 0;
        this._days = 0; // Only used for intervals
        return this;
    }

    truncate()
    {
        if(this.isValue())
            this._millis = 0;
        return this;
    }

    addDays(days)
    {
        days = MDecimal.toMDecimal(days);
        if((!this.isValid()) || (!days.isValue())) return this;
        if(!this.isValue()) this.zero();

        this._days = this._days + days.intPart();
        var hours = days.fracPart() * 24;
        if(hours != 0)
            this._paddhours(new MDecimal(hours));
        this._rationalise();
        return this;
    }

    addHours(hours)
    {
        hours = MDecimal.toMDecimal(hours);
        if((!this.isValid()) || (!hours.isValue())) return this;
        if(!this.isValue()) this.zero();
        this._paddhours(hours);
        this._rationalise();
        return this;
    }

    addMinutes(minutes)
    {
        minutes = MDecimal.toMDecimal(minutes);
        if((!this.isValid()) || (!minutes.isValue())) return this;
        if(!this.isValue()) this.zero();
        this._paddminutes(minutes);
        this._rationalise();
        return this;
    }
    addSeconds(seconds)
    {
        seconds = MDecimal.toMDecimal(seconds);
        if((!this.isValid()) || (!seconds.isValue())) return this;
        if(!this.isValue()) this.zero();
        this._paddseconds(seconds);
        this._rationalise();
        return this;
    }
    addMilliseconds(millis)
    {
        millis = MDecimal.toMDecimal(millis);
        if((!this.isValid()) || (!millis.isValue())) return this;
        if(!this.isValue()) this.zero();
        this._millis += millis.intPart();
        this._rationalise();
        return this;
    }

    addMTime(mtime)
    {
        mtime = MTime.toMTime(otime);
        if((!this.isValid()) || (!mtime.isValue())) return this;
        if(!this.isValue()) this.zero();
        this._hours += otime._hours;
        this._minutes += otime._minutes;
        this._seconds += otime._seconds;
        this._millis += otime._millis;
        this._days += otime._days;
        this._rationalise();
        return this;
    }

    diffMTime(otime)
    {
        otime = MTime.toMTime(otime);
        var ans = new MTime();
        if((!this.isValid()) || (!otime.isValue())) return ans;
        ans.setNull(false);
        ans._hours = otime._hours - this._hours;
        ans._minutes = otime._minutes - this._minutes;
        ans._seconds = otime._seconds - this._seconds;
        ans._millis = otime._millis - this._millis;
        ans._days = otime._days - this._days;
        ans._rationalise();
        return ans;
    }
    diffDays(otime)
    {
        var diff = this.diffMTime(otime);
        if(!diff.isValue()) return null;
        var ans = diff._days;

        var frac = diff._millis / 1000;
        frac = (frac + diff._seconds) / 60
        frac = (frac + diff._minutes) / 60
        frac = (frac + diff._hours) / 24
        return ans + frac;
    }
    diffHours(otime)
    {
        var diff = this.diffMTime(otime);
        if(!diff.isValue()) return null;
        var ans = diff._days;
        ans = (ans * 24) + diff._hours;

        var frac = diff._millis / 1000;
        frac = (frac + diff._seconds) / 60
        frac = (frac + diff._minutes) / 60
        return ans + frac;
    }
    diffMinutes(otime)
    {
        var diff = this.diffMTime(otime);
        if(!diff.isValue()) return null;
        var ans = diff._days;
        ans = (ans * 24) + diff._hours;
        ans = (ans * 60) + diff._minutes;

        var frac = diff._millis / 1000;
        frac = (frac + diff._seconds) / 60
        return ans + frac;
    }
    diffSeconds(otime)
    {
        var diff = this.diffMTime(otime);
        if(!diff.isValue()) return null;
        var ans = diff._days;
        ans = (ans * 24) + diff._hours;
        ans = (ans * 60) + diff._minutes;
        ans = (ans * 60) + diff._seconds;

        var frac = diff._millis / 1000;
        return ans + frac;
    }
    diffMilliseconds(otime)
    {
        var diff = this.diffMTime(otime);
        if(!diff.isValue()) return null;
        var ans = diff._days;
        ans = (ans * 24) + diff._hours;
        ans = (ans * 60) + diff._minutes;
        ans = (ans * 60) + diff._seconds;
        ans = (ans * 1000) + diff._millis;
        return ans;
    }

    getHours() { return this._getval(this._hours); }
    getMinutes() { return this._getval(this._minutes); }
    getSeconds() { return this._getval(this._seconds); }
    getMilliseconds() { return this._getval(this._millis); }
    getDays() { return this._getval(this._days); }
    getTime()
    {
        // Returns as milliseconds (including "days" for intervals)
        return this._getval((((((((this._days * 24) + this._hours) * 60) + this._minutes) * 60) + this._seconds) * 1000) + this._millis);
    }

    _getval(val)
    {
        if(this.isValue)
            return val;
        else
            return null;
    }

    setHours(hours) { if(this.isValue()) {this._hours = this._exint(hours); this._rationalise();} return this; }
    setMinutes(minutes) { if(this.isValue()) {this._minutes = this._exint(minutes); this._rationalise();} return this; }
    setSeconds(seconds) { if(this.isValue()) {this._seconds = this._exint(seconds); this._rationalise();} return this; }
    setMilliseconds(millis) { if(this.isValue()) {this._millis = this._exint(millis); this._rationalise();} return this; }
    setDays(days) { if(this.isValue()) {this._days = this._exint(days); this._rationalise();} return this; }

    derToString()
    {
        // Returns ISO time, does not apply to intervals
         var ret =  this._hours.toString().padStart(2, '0') + ":" +
                    this._minutes.toString().padStart(2, '0') + ":" +
                    this._seconds.toString().padStart(2, '0');
        if(this._millis > 0) ret = ret + "." + this._millis.toString().padStart(3, '0');
        return ret;
    }

    toShortString()
    {
        // Returns ISO time, does not apply to intervals
        if(!this.isValue())
            return "";
        else
            return this._hours.toString().padStart(2, '0') + ":" +
                this._minutes.toString().padStart(2, '0')
    }

    cmp(otime)
    {
        otime = MTime.toMTime(otime);
        if(this.isValue() || otime.isValue()) return null;
        var ret = 0;

        if (this._days > otime._days)
            ret = 1;
        else if (this._days < otime._days)
            ret = -1;
        else if (this._hours > otime._hours)
            ret  = 1;
        else if (this._hours < otime._hours)
            ret  = -1;
        else if (this._minutes > otime._minutes)
            ret  = 1;
        else if (this._minutes < otime._minutes)
            ret  = -1;
        else if (this._seconds > otime._seconds)
            ret  = 1;
        else if (this._seconds < otime._seconds)
            ret  = -1;
        else if (this._millis > otime._millis)
            ret  = 1;
        else if (this._millis < otime._millis)
            ret  = -1;
        return ret;
    }

    _paddhours(hours)
    {
        this._hours = this._hours + hours.intPart();
        var minutes = hours.fracPart() * 60;
        if(minutes != 0)
            this._paddminutes(new MDecimal(minutes));
    }

    _paddminutes(minutes)
    {
        this._minutes = this._minutes + minutes.intPart();
        var seconds = minutes.fracPart() * 60;
        if(seconds != 0)
            this._paddseconds(new MDecimal(seconds));

    }
    _paddseconds(seconds)
    {
        this._seconds = this._seconds + seconds.intPart();
        var millis = Math.round(seconds.fracPart() * 1000);
        this._millis += millis;
    }
    _rationalise()
    {
        // Rationalise the values

        if(this._millis >= 1000) {
            this._seconds += Math.floor(this._millis / 1000);
            this._millis = this._millis % 1000;
        }
        if(this._seconds >= 60) {
            this._minutes += Math.floor(this._seconds / 60);
            this._seconds = this._seconds % 60;
        }
        if(this._minutes >= 60) {
            this._hours += Math.floor(this._minutes / 60);
            this._minutes = this._minutes % 60;
        }
        if(this._hours >= 24) {
            this._days += Math.floor(this._hours / 24);
            this._hours = this._hours % 24;
        }
        if(this._millis < 0) {
            var millis = 0 - this._millis;
            this._seconds -= Math.ceil(millis / 1000);
            this._millis = 1000 - (millis % 1000);
        }
        if(this._seconds < 0) {
            var seconds = 0 - this._seconds;
            this._minutes -= Math.ceil(seconds / 60);
            this._seconds = 60 - (seconds % 60);
        }
        if(this._minutes < 0) {
            var minutes = 0 - this._minutes;
            this._hours -= Math.ceil(minutes / 60);
            this._minutes = 60 - (minutes % 60);
        }
        if(this._hours < 0) {
            var hours = 0 - this._hours;
            this._days -= Math.ceil(hours / 24);
            this._hours = 24 - (hours % 24);
        }
    }


    _exint(inp)
    {
        inp = MDecimal.toMDecimal(inp);
        if(inp.isValid())
            return inp.intPart();
        else
            return 0;
    }
}


class MDateTime extends MDateTimeBase {
    constructor(arg)
    {
        super();
        this.setMDateTime(arg);
    }


    static toMDateTime(inp)
    {
        if(!(inp instanceof MDateTime))
            inp = new MDateTime(inp);
        return inp;
    }

    setMDateTime(arg)
    {
        this.reset();
        arg = coalesce(arg, null);
        if(arg == null) {
            this.setNull();
            return this;
        }
        if(arg instanceof MUtilBase) {
            if(!arg.isValue()) {
                this.setNull();
                if(!arg.isValid())
                    this.setValid(false);
                return this;
            } 
        }
        this.setNull(false);
        if(arg instanceof Date) {
            this._date  = new Date(arg.getTime());
        } else if(arg instanceof MDateTime) {
            this._date  = new Date(arg.jsDate().getTime());
        } else if(arg instanceof MDate) {
            this._date  = new Date(arg.getYear(), arg.getMonth() - 1, arg.getDate(), 0, 0, 0, 0);
        } else if (arg instanceof MTime) {
            this._date = new Date();
            // Daylight saving errors buggered here anyway
            this._date.setHours(arg.getHours());
            this._date.setMinutes(arg.getMinutes());
            this._date.setSeconds(arg.getSeconds());
            this._date.setMilliseconds(arg.getMilliseconds());
        } else if(arg instanceof MDecimal) {
            // Number - assume hjavascript milliseconds
            arg = arg.intPart();
            this._date = new Date(arg);
        } else if(coalesce(arg, "now").toString().toUpperCase() == "NOW") {
            this._date = new Date();
        } else {
            this._date = new Date(arg);
        }
        if(!this.testValid()) {
            this.reset();
            this.setValid(false);
        }
        return this;
    }

    now()
    {
        this.reset();
        this._date = new Date();
        return this;
    }

    copy() {return new MDateTime(this); }

    assemble(year, month, day, hours, minutes, seconds, millis)
    {
        this.reset();
        millis = coalesce(millis, 0);
        seconds = coalesce(seconds, 0);
        minutes = coalesce(minutes, 0);
        hours = coalesce(hours, 0);
        this._date = new Date(year, month-1, day, hours, minutes, seconds, millis);
        this.setNull(false);
        return this;
    }

    testValid()
    {
        return(!(isNaN(this._date.getTime())));
    }

    setMDate(mdate)
    {
        mdate = MDate.toMDate(mdate);
        if(!(mdate.isValue())) return this;
        if(!this.isValue) this.now();

        // Need to be careful as month date can get out of range
        // so create a new jsDate
        // Daylight saving errors cnnot be avoided


        this._date = new Date(mdate.getYear(), mdate.getMonth() - 1, mdate.getDate(),
                                    this._date.getHours(), this._date.getMinutes(), this._date.getSeconds(), this._date.getMilliseconds());
        return this;
    }

    setMTime(mtime)
    {
        mtime = MTime.toMTime(mtime);
        if(!(mtime.isValue())) return this;
        if(!this.isValue) this.now();

        // Create a new object for possible daylight saving errors
        // Daylight saving errors cnnot be avoided
        this._date = new Date(
            this._date.getFullYear(), this._date.getMonth(), this._date.getDate(),
                mtime.getHours(), mtime.getMinutes(), mtime.getSeconds(), mtime.getMilliseconds());
        return this;
    }

    addYears(years)
    {
        if(!this.isValue()) return this;
        var mdate = new MDate(this);
        mdate.addYears(years);
        this.setMDate(mdate);
        return this;
    }

    addMonths(months)
    {
        if(!this.isValue()) return this;
        var mdate = new MDate(this);
        mdate.addMonths(months);
        this.setMDate(mdate);
        return this;
    }

    addDays(days)
    {
        if(!this.isValue()) return this;
        var mdate = new MDate(this);
        mdate.addDays(days);
        this.setMDate(mdate);
        return this;
    }

    // Hours, seconds, milliseconds simply use JS
    addHours(hours) { return this._addmillis(hours, 3600000); }
    addMinutes(minutes) { return this._addmillis(minutes, 60000); }
    addSeconds(seconds) { return this._addmillis(seconds, 1000); }
    addMilliseconds(millis) { return this._addmillis(millis, 1); }

    // MTime can also be an interval
    addMTime(mtime)
    {
        // Will ignoe daylight saving for days here
        mtime = MTime.toMTime(mtime);
        if((!this.isValue()) || (!mtime.isValue())) return this;
        return this._addmillis(mtime.getTime(), 1);
    }

    floor()
    {
        // Zeroes the hours, etc
        if(this.isValue())
            this.setMDateTime(new MDate(this));
        return this;
    }

    diffDays(odate) {
        if(!this.isValue()) return this;
        var d1 = (new MDate(this)).diffDays(odate);
        var d2 = (new MTime(this)).diffDays(odate);
        if(d1 === null || d2 === null)
            return null;
        else
            return d1 + d2;
    }
    diffMonths(odate) { return (new MDate(this)).diffMonths(odate); }
    diffYears(odate) { return (new MDate(this)).diffYears(odate); }
    diffHours(odate) { return this.diffMilliseconds(odate) / 3600000; }
    diffMinutes(odate) { return this.diffMilliseconds(odate) / 60000; }
    diffSeconds(odate) { return this.diffMilliseconds(odate) / 1000; }
    diffMilliseconds(odate)
    {
        odate = MDateTime.toMDateTime(odate);
        if((!this.isValue()) || (!odate.isValue())) return null;
        return odate._date.getTime() - this._date.getTime();
    }

    diffMTime(odate)
    {
        odate = MDateTime.toMDateTime(odate);
        if((!this.isValue()) || (!(odate.isValue()))) return new MTime(null);

        var wdays = (new MDate(this)).diffDays(odate);
        var ans = (new MTime(this)).diffMTime(odate);
        ans._days += wdays;
        return ans;
    }

    // The "with" stuff drops the time portion
    withDay(day) { return new MDateTime((new MDate(this)).withDay(day)); }
    withMonthDay(month, day) { return new MDateTime((new MDate(this)).withMonthDay(month, day)); }

    setHours(hours)
    {
        if(this.isValue())
            this._date.setHours(MDecimal.toMDecimal(hours).intPart());
        return this;
    }
    setMinutes(minutes)
    {
        if(this.isValue())
            this._date.setMinutes(MDecimal.toMDecimal(minutes).intPart());
        return this;
    }
    setSeconds(seconds)
    {
        if(this.isValue())
            this._date.setSeconds(MDecimal.toMDecimal(seconds).intPart());
        return this;
    }
    setMilliseconds(millis)
    {
        if(this.isValue())
            this._date.setMilliseconds(MDecimal.toMDecimal(millis).intPart());
        return this;
    }
    derToString()
    {
       return (new MDate(this)).toString() + "T" + (new MTime(this).toString());
    }
    cmp(odate)
    {
        odate = MDateTime.toMDateTime(odate);
        if(!this.isValue() || (!odate.isValue())) return null;
        var lhs = this._date.getTime();
        var rhs = odate._date.getTime();
        var ret = 0;
        if(lhs > rhs)
            ret = 1;
        else if(lhs < rhs)
            ret = -1;
        return ret;
    }

    getHours() {if (!this.isValue()) return null; else return this._date.getHours(); }
    getMinutes() {if (!this.isValue()) return null; else return this._date.getMinutes(); }
    getSeconds() {if (!this.isValue()) return null; else return this._date.getSeconds(); }
    getMilliseconds() {if (!this.isValue()) return null; else return this._date.getMilliseconds(); }

    // Private stuff
    _addmillis(millis, factor)
    {
        if(!this.isValue()) return this;
        this._date = new Date(this._date.getTime() + MDecimal.toMDecimal(millis).multiply(factor).intPart());
        return this;
    }
}

function MDateTimeMagic(arg)
{
    // Returns appropriate class, or null
    if(coalesce(arg, null) == null) return null;
    var ret = null;
    if(arg instanceof MDate || arg instanceof MTime || arg instanceof MDateTime) {
        if (arg.isValid())
            ret = arg;
    } else if (typeof arg == "string") {
        if (arg.toUpperCase() == "NOW")
            ret = new MDateTime("NOW");
        else if (_MDATETIME_DATEREG.test(arg))
            ret = new MDate(arg);
        else if (_MDATETIME_TIMEREG1.test(arg) || _MDATETIME_TIMEREG2.test(arg) || _MDATETIME_TIMEREG3.test(arg))
            ret = new MTime(arg);
    }
    if(ret === null)
    {
        var mdt = new MDateTime(arg);
        if (mdt.isValid()) {
            if(mdt.getHours() == 0  && mdt.getMinutes() == 0 && mdt.getSeconds() == 0 && mdt.getMilliseconds() == 0)
                ret = new MDate(mdt);
            else
                ret = mdt;
        }
    }
    if(ret) {
        if(!ret.isValid()) {
            ret = null;
        }
    }
    return ret;
}

export {MDate, MDateTime, MTime, MDateTimeMagic};
