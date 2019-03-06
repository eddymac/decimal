"use strict";

/*
 Version 1.01
 Copyright: Edward Macnaghten - 5-March-2019
 License - GPL V3.0

 Release 1.00 - 5-March-2019 Initial release
 Release 1.01 - 5 March-2019 Added isValid
 
 The Decimal object
 This assumes integers addition and subtraction are OK even if numbers are stored as floats
 IEEE 754 specification works for this up to the accuracy of the mantissa.
 The HTML5 specification states 64 bit floating points using IEEE 754 should be used.
 that is 11 bit exponent and 52 bit mantissa (fraction), allowing 2 ^ 53 to be stored
 as integers  accurately.
 Thant should give an accuracy up to +/- 9,007,199,254,740,992
 The object stores fractions (pennies) as integers, allowing for up to 15 decimal places.
 (NOTE - This accuracy goes away if you store values as fractions, but this object does not)

 Also worth noting that this object does not check for overflow errors, so any use with
 numbers greater than that you will start seeing inaccuracies silently

 Methods
 var x = new Decimal()  - Creates blank decimal objct
 var x = new Decimal(number) - Creates decimal object giving value of number
    number can be: string, examples: "1.23" "-1.456" "3.00" "54"
                                     "" sets to null
                   javascript number (floating point)
                   null (Sets to null)
 x.setValue(number) - Same as above on existing object
 x.isNull()         - Returns true if null, false otherwise
 x.isValid()        - Returns true if valid or blank, False if initialised wrong (will always be blank)
 x.toString()       - Returns money number as string (null -> "")
                                           {decimals} must be >= 0
 x.format(decimals) - Returns as string to {decimals} number of decimal places
                                                null -> ""
 x.toFloat()        - Returns the number as a float (null returns null)
 x.toNumber()       - Same as toFloat()
 x.isInt()          - Returns true if an integer (no fraction), false if not
 x.intPart()        - Returns int part of number (negative if appropriate)
 x.fracPart()       - Returns fraction part of number as fraction (negative if appropriate)

 Arithmatic, the "value" supplied can be string, number or Decimal (instance of this class)

 x.add(value)       - Adds a value to object, returns current object
 x.subtract(value)  - Subtracts a value from object, returns current object
 x.multiply(value)  - Multiplies an object by value, returns current object
 x.divide(value)    - Divides an object by value, returns current object
 x.plus(value)      - Adds a value to this object and returns a new Decimal object
 x.minus(value)     - Subtracts a value from this object and returns a new Decimal object
 x.times(value)     - Multiplies a value and this object and returns a new Decimal object
 x.over(value)      - Divides the object by the value and returns a new Decimal object

 Comparisons

 x.cmp(value)       - Returns 0 if equal, -1 if object < value, 1 if object > value
 x.gt(value)        - Returns true if object > value, false otherwise
 x.lt(value)        - Returns true if object < value, false otherwise
 x.eq(value)        - Returns true if object = value, false otherwise

 x.round(decimals)  - Rounds the value to decimals number of places (decimals must be >= 0)
 x.floor(decimals)  - Rounds down the value to decimals number of places (decimals decimals must be >= 0)
 x.ceil(decimals)   - Rounds up the value to decimals number of places (decimals must be >= 0)
 x.fix(decimals)    - Truncates the fraction to decimals number of places (decimals must be >= 0)
 x.fixup(decimals)  - Truncates the fraction to decimals number of places, always rounding to higer digit
                                            (decimals must be >= 0)

 x.pennies(denom, unit)
                    - Returns number of pennies,
                      denom and unit default to DECIMAL_PENNIES and DECIMAL_PENNY_UNIT
                      denom (DECIMAL_PENNIES) is the number of decimal places pennies use up (2 for USD)
                      unit (DECIMAL_PENNY_UNIT) is the value of the smallest coin
 x.roundPennies     - Rounds the number of decimal places to nearest penny
 x.fixPennies       - Fix the number of decimal places to nearest penny (truncates)
 x.fixupPennies     - Fix ups the number of decimal places to nearest penny (always rounds to higher digit)
 x.floorPennies     - Rounds down (in value) to number of pennies
 x.ceilPennies      - Rounds up (in value) to number of pennies
 */

/*
 
 * This should be set somewhere else as well
 * DEECIMAL_PENNIES is the number of decimal places for pennies (2 for USD, etc)
 *                  cannot be less then 0
 */

if (typeof DECIMAL_PENNIES == "undefined") var DECIMAL_PENNIES = 2;

/*
 * DECIMAL_PENNY_UNIT is the unit of penny, also can be defined elsewhere
 * This is in effect the value of the smallest coin
 *
 * At time of writing, thi would be 1 for USD, or 5 for Turkish Lira etc
 * need to take into consideratuib DECIMAL_PENNIES above
 */
if (typeof DECIMAL_PENNY_UNIT == "undefined") var DECIMAL_PENNY_UNIT = 1


/*
 *  END OF INTRODUCTION AND USER SETTINGS
 */


/*
 * Private static regular expressions
 */

// Matches 123.45, or -345.67, or +555.764
var _DECIMAL_REGF = /^([+-]?)(\d+)\.(\d+)$/

// Matches 1234, -6789, +9876
var _DECIMAL_REGH = /^([+-]?)(\d+)$/

function Decimal(setval)
{
    this._negative = false;                        // true if negative
    this._whole = 0;                               // Whole number as integer
    this._decimal = 0;                             // Decimal numbver as integer
    this._dlen = 0;                                // Number of decimal places
    this._isblank = true;                          // True if blank
    this._isvalid = true;                          // False if invalid number entered
    if(this.coalesce(setval, null) != null)
        this.setValue(setval.toString());          // Populate above
}


Decimal.prototype = {
    constructor: Decimal,

    setValue: function(setval)
    {
        this._negative = false;
        this._whole = 0;
        this._decimal = 0;
        this._dlen = 0;
        this._isblank = true;
        this._isvalid = true;
        if (this.coalesce(setval, "") === "")
            return;

        if(setval instanceof Decimal)
        {
            this._negative = setval._negative;
            this._whole = setval._whole;
            this._decimal = setval._decimal;
            this._dlen = setval._dlen;
            this._iablank = setval._isblank;
            return;
        }

        setval = setval.toString();
        this._isblank = false;

        var mat = _DECIMAL_REGF.exec(setval);
        if(mat) {
            this._makefm(mat)
            var dec = mat[3];
            // This should stop it going too wrong
            if (dec.length > 15) {
                dec = dec.substring(0, 15);
            }

            if(dec != "")
                this._decimal = parseInt(dec, 10);
            if(this._decimal > 0)
                this._dlen = dec.length;
        } else {
            mat = _DECIMAL_REGH.exec(setval);
            if(mat) {
                this._makefm(mat)
            } else {
                this._isblank = true;
                this._isvalid = false;
                this.doerror("Unknown input type: " + setval);
            }
        }
        this._simplify();
        return this;
    },

    isNull: function()
    {
        return this._isblank;
    },

    isValid: function()
    {
        return this._isvalid;
    },

    toString: function()
    {
        var nval = "";
        if(this._isblank) return nval;
        if(this._negative) nval = "-";
        nval = nval + this._whole.toString()
        if(this._decimal > 0) {
            var dstr = this._decimal.toString();
            var dslen = dstr.length;

            if(dslen < this._dlen)
                dstr = "0".repeat(this._dlen - dslen) + dstr;
            else if (dslen > this._dlen)
                dstr = dstr.substring(0, this._dlen);
            nval = nval + "." + dstr;
        }
        return nval;
    },

    format: function(numdec)
    {
        // prints a format of the number
        // At the moment simply concatenates (fix)
        // Should use round to ronud
        numdec = this.coalesce(numdec, 2);
        var nval = "";
        if(this._isblank) return nval;
        if(this._negative) nval = "-";
        nval = nval + this._whole.toString();

        if(numdec > 0) {
            var dstr = this._decimal.toString().padStart(this._dlen, "0");
            var dslen = dstr.length;
            if(dslen < numdec) 
                dstr = dstr.padEnd(numdec, '0');
            else if(dslen > numdec)
                dstr = dstr.substring(0, numdec);
            nval = nval + "." + dstr;
        }
        return nval;
    },

    toNumber: function()
    {
        if(this._isblank) return null;
        var val = this._whole;
        if(this._decimal != 0) val += (this._decimal / this._tenpower(this._dlen));
        if(this._negative) val = 0.0 - val;
        return val;
    },

    toFloat: function() {return this.toNumber(); },

    isInt: function()
    {
        if(this._isblank) return null;
        return this._decimal == 0;
    },

    intPart: function()
    {
        if(this._isblank) return null;
        if(this._negative) {
            return 0 - this._whole;
        } else {
            return this._whole;
        }
    },

    fracPart: function()
    {
        if(this._isblank) return null;
        if(this._deciaml == 0) return 0.0;

        var val = this._decimal / this._tenpower(this._dlen);
        if(this._negative) val = 0 - val;
        return val;
    },

    pennies: function(denom, unit)
    {
        // Return pennies
        if(this._isblank) return null;
        var ret = this._getpennies("floor", denom, unit);
        if(this._negative) ret = 0 - ret;
        return ret;
    },

    roundPennies: function(denom, unit)
    {
        this._decimal = this._getpennies("round", denom, unit);
        this._dlen = denom;
        this._simplify();
        return this;
    },
    fixPennies: function(denom, unit)
    {
        this._decimal = this._getpennies("floor", denom, unit);
        this._dlen = denom;
        this._simplify();
        return this;
    },
    fixupPennies: function(denom, unit)
    {
        this._decimal = this._getpennies("ceil", denom, unit);
        this._dlen = denom;
        this._simplify();
        return this;
    },
    ceilPennies: function(denom, unit)
    {
        if(this._negative)
            this._decimal = this._getpennies("floor", denom, unit);
        else
            this._decimal = this._getpennies("ceil", denom, unit);
        this._dlen = denom;
        this._simplify();
        return this;
    },
    floorPennies: function(denom, unit)
    {
        if(this._negative)
            this._decimal = this._getpennies("ceil", denom, unit);
        else
            this._decimal = this._getpennies("floor", denom, unit);
        this._dlen = denom;
        this._simplify();
        return this;
    },

    _getpennies: function(func, denom, unit)
    {
        if(this._deciaml == 0) return 0;

        denom = parseInt(this.coalesce(denom, DECIMAL_PENNIES));
        unit = parseInt(this.coalesce(unit, DECIMAL_PENNY_UNIT));
        if(unit == 0) unit = 1;

        var ret = this._decimal;
        if(denom > this._dlen) {
            ret = ret * this._tenpower(denom - this._dlen);
        } else if (this._dlen > denom) {
            // What to do?  Round ? Fix? Floor? Ceil
            // At the moment, simply "fix"
            ret = this._domath(func, ret / this._tenpower(this._dlen - denom));
        }
        if(unit != 1) {
            ret = this._domath(func, ret / unit) * unit;
        }
        return ret;
    },

    fromInt: function(inint)
    {
        // From an integer
        // Faster than parsing the thing
        this.setValue(null);
        if(this.coalesce(inint, null) == null) return this;

        inint = parseInt(inint, 10);
        this._isblank = false;
        if(inint < 0) {
            this._whole = 0 - inint;
            this._negative = true;
        } else {
            this._whole = inint;
        }
        return this;
    },

    plus: function(addval) { return (new Decimal(this)).add(addval); },
    minus: function(subval) { return (new Decimal(this)).subtract(subval); },
    times: function(rhsval) { return (new Decimal(this)).multiply(rhsval); },
    over: function(rhsval) { return (new Decimal(this)).divide(rhsval); },

    add: function(addval)
    {
        if(!(addval instanceof Decimal))
            addval = new Decimal(addval)
        if(addval._isblank) return this;

        this._isblank = false;

        if(this._negative == addval._negative) {
            this._doadd(addval);
        } else {
            var mkneg = this._dosubtract(addval);
            if (mkneg) {
                this._negative = (!this._negative);
            }
        }
        return this;
    },
    _doadd: function(addval)
    {
        this._whole = this._whole + addval._whole;

        var nums = this._samedecs(this, addval);

        var adec = nums[0] + nums[1];
        var dlen = nums[2];
        var aover = this._tenpower(dlen);
        if (adec >= aover)
        {
            adec = adec - aover;
            this._whole += 1;
        }
        this._decimal = adec;
        if(adec == 0)
            this._dlen = 0;
        else
            this._dlen = dlen;
    },

    subtract: function(subval)
    {
        if(!(subval instanceof Decimal))
            subval = new Decimal(subval)
        if(subval._isblank) return this;
        if(this._negative != subval._negative)
        {
            this._doadd(subval);
        } else {
           var mkneg = this._dosubtract(subval);
           if(mkneg) this._negative = (!this._negative);
        }
        return this;
    },

    multiply: function(rhsval)
    {
        // For now, convert hsval to money
        if(!(rhsval instanceof Decimal)) {
            rhsval = new Decimal(rhsval);
        }
        if(rhsval._isblank || this._isblank) return this;

        if(rhsval._negative) this._negative = (!this._negative);
        
        var nums = this._samedecs(this, rhsval);

        if (nums[2] == 0) { // Rest should be 0 too
            this._whole = this._whole * rhsval._whole;
            return this;
        }

        // a.b
        // c.d
        // [ac] . [ad + bc] [bd ]
        // digits being base 10 ^ dlen

        var outc = nums[0] * nums[1];
        var outb = (this._whole * nums[1]) + (nums[0] * rhsval._whole);
        var outa = this._whole * rhsval._whole;

        var dlen = nums[2];
        var flen = this._tenpower(dlen);

        // I assume % function OK with integers, otherwise
        // Also with floor
        // do my own sometime

        if(outc > flen) {
            outb += Math.floor(outc / flen);
            outc = outc % flen;
        }

        if(outb > flen) {
            outa += Math.floor(outb / flen);
            outb = outb % flen;
        }

        // if dlen > 7, then we need to truncate outc so no more than 15 decimal places
        var dblen = dlen;
        if(dblen > 7) {
            dblen = 15 - dlen;
        }
        var glen = flen;

        if(dblen <= 0) {
            // Should not really ever by < 0, butr what the hell
            dblen = 0;
            outb += Math.round(outc / flen);
            outc = 0;
        } else if(dblen < dlen) {
            glen = this._tenpower(dblen);
            outc = Math.round(outc / this._tenpower(dlen - dblen));
        } else if(dblen > dlen) {
            // System error
            this.doerror("Multiplication error");
            glen = 0;
            outc = 0;
        }

        if(outc != 0) {
            outb = (outb * glen) + outc;
            dlen = dlen + dblen;
        }

        this._whole = outa;
        this._decimal = outb;
        this._dlen = dlen;
        this._simplify();
        return this;
        
    },

    divide: function(rhsval)
    {
        // Divide is more difficult
        // and I question it's usefulness
        // as if you need to divide in accounting you
        // are in trouble anyway for total acuracy
        // Simply convert everything to a float here
        if(this._isblank) return this;
        rhsval = this.coalesce(rhsval, null);
        if(rhsval == null) return this;
        if (rhsval instanceof Decimal) {
            if (rhsval._isblank) return this;
            rhsval = rhsval.toFloat();
        }
        rhsval = parseFloat(rhsval);
        var lhsval = this.toFloat();
        if(this.coalesce(rhsval, 0) == 0) {
            this.setValue(null);
        } else {
            this.setValue(lhsval / rhsval);
        }
        return this;
    },

    cmp: function(rhsval)
    {
        // Return -1, 0, 1 if this < = > rhs
        if(!(rhsval instanceof Decimal)) {
            rhsval = new Decimal(rhsval);
        }
        if (this._isblank || rhsval._isblank) return null;

        var ans = 0;
        var nums = this._samedecs(this, rhsval);
        if(this._negative == rhsval._negative) {
            if(this._whole == rhsval._whole) {
                if(nums[0] == nums[1]) {
                    ans = 0;
                } else if (nums[0] > nums[1]) {
                    ans = 1;
                } else {
                    ans = -1;
                }
            } else if(this._whole > rhsval._whole) {
                ans = 1;
            } else {
                ans = -1;
            }
        } else {
            ans = 1;
        }
        if(this._negative) {
            if(ans == 1) ans = -1;
            else if (ans == -1) ans = 1;
        }
        return ans;
    },

    gt: function(rhs) {return this.cmp(rhs) == 1},
    lt: function(rhs) {return this.cmp(rhs) == -1},
    eq: function(rhs) {return this.cmp(rhs) == 0},

    _dosubtract: function(subval)
    {
        var mkneg = false;
        var nums = this._samedecs(this, subval);

        if(this._whole < subval._whole)
            mkneg = true;
        else if (this._whole == subval._whole) {
            if (nums[0] < nums[1]) {
                mkneg = true;
            } else if (nums[0] == nums[1]) {
                this._whole = 0;
                this._decimal = 0;
                this._dlen = 0;
                this._negative = false;
                return false;
            }
        }

        var ans = null;
        if(mkneg)
            ans = this._doactsub(subval._whole, nums[1], this._whole, nums[0], nums[2]);
        else
            ans = this._doactsub(this._whole, nums[0], subval._whole, nums[1], nums[2]);

        this._whole = ans[0];
        this._decimal = ans[1];
        this._dlen = nums[2];
        return mkneg;
    },

    _doactsub: function(lval, ldec, rval, rdec, dlen)
    {
        // Actual subtraction
        // LHS should be larger then RHS here
        lval = lval - rval;
        ldec = ldec - rdec;
        if(ldec < 0) {
            ldec = ldec + this._tenpower(dlen);
            lval -= 1;
        }
        return [lval, ldec];
    },


    _makefm: function(mat)
    {
        if (mat[1] == "-")
            this._negative = true;

        if (mat[2] != "")
            this._whole = parseInt(mat[2]);
    },


    _seezero: function()
    {
        if(this._negative) {
            if(this._whole == 0 && this._decimal == 0)
                this._negative = false;
        }
        if(this._decimal == 0) this._dlen = 0;
    },

    _tenpower: function(num)
    {
        // 10 ^^ number
        // Not using "pow" because I want to guarantee integer
        // which I am not sure Math.pow(...) does
        var ans = 1;
        for(;num;num--) ans = ans * 10;
        return ans;
    },

    _samedecs: function(lhs, rhs)
    {
        // Makes the decimal lengths the same
        // Returns lhs dec value, rhs dec value, dec length
        var ldec = lhs._decimal;
        var ldl = lhs._dlen;;
        var rdec = rhs._decimal;
        var rdl = rhs._dlen;;

        if(rdec == 0) {
            if(ldec == 0) {
                return [0, 0, 0];   // Make efficient for integers
            } else {
                rdl = ldl;
            }
        } else {
            while(ldl > rdl) {
                rdl += 1;
                rdec = rdec * 10;
            }
        }
        if(ldec == 0) {
            ldl = rdl;
        } else {
            while(rdl > ldl) {
                ldl += 1;
                ldec = ldec * 10;
            }
        }
        return [ldec, rdec, ldl];
    },

    _simplify: function()
    {
        // Minimizes value of dlen
        if(this._decimal == 0) {
            this._dlen = 0;
            return;
        }
        for(;;) {
            var dig = this._decimal % 10;
            if(dig != 0) break;
            this._decimal = this._decimal / 10;
            this._dlen -= 1;
        }
    },

    round: function(numdecs) { this._decstuff("round", numdecs); return this;},
    fix: function(numdecs) { this._decstuff("floor", numdecs); return this;},
    fixup: function(numdecs) { this._decstuff("ceil", numdecs); return this;},
    ceil: function(numdecs)
    {
        if(this._negative)
            this._decstuff("floor", numdecs);
        else
            this._decstuff("ceil", numdecs);
        return this;
    },  
    floor: function(numdecs)
    {
        if(this._negative)
            this._decstuff("ceil", numdecs);
        else
            this._decstuff("floor", numdecs);
        return this;
    },  
    _decstuff: function(func, numdecs)
    {
        // Rounds the thing
        if(this._dlen > numdecs) {
            this._decimal = this._domath(func, this._decimal / this._tenpower(this._dlen - numdecs));
            this._dlen = numdecs;
            this._simplify();
        }
    },

    _domath: function(func, expr)
    {
        switch(func) {
        case "ceil": return Math.ceil(expr); break;
        case "floor": return Math.floor(expr); break;
        case "round": return Math.round(expr); break;
        }
    },

    coalesce: function(see, def)
    {
        if(see === 0 || see === "0" || see === false) return see;
        if(typeof see == 'undefined' || see === null)
            return def;
        else
            return see;
    },

    doerror: function(errmess)
    {
        console.log("ERROR in Decimal: " + errmess);
        console.trace();
        // Leave this one out fo now
        // alert("ERROR in Decimal: " + errmess);
    }
}


