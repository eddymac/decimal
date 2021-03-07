"use strict";

/*
 Version 1.01
 Copyright: Edward Macnaghten - 5-March-2019
 License - GPL V3.0

 Release 1.00 - 5-March-2019 Initial release
 Release 1.01 - 5 March-2019 Added isValid

 The MDecimal object
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
 var x = new MDecimal()  - Creates blank decimal objct
 var x = new MDecimal(number) - Creates decimal object giving value of number
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

 Arithmatic, the "value" supplied can be string, number or MDecimal (instance of this class)

 x.add(value)       - Adds a value to object, returns current object
 x.subtract(value)  - Subtracts a value from object, returns current object
 x.multiply(value)  - Multiplies an object by value, returns current object
 x.divide(value)    - Divides an object by value, returns current object
 x.plus(value)      - Adds a value to this object and returns a new MDecimal object
 x.minus(value)     - Subtracts a value from this object and returns a new MDecimal object
 x.times(value)     - Multiplies a value and this object and returns a new MDecimal object
 x.over(value)      - Divides the object by the value and returns a new MDecimal object

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
                      denom and unit default to MDECIMAL_PENNIES and MDECIMAL_PENNY_UNIT
                      denom (MDECIMAL_PENNIES) is the number of decimal places pennies use up (2 for USD)
                      unit (MDECIMAL_PENNY_UNIT) is the value of the smallest coin
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

if (typeof MDECIMAL_PENNIES == "undefined") var MDECIMAL_PENNIES = 2;

/*
 * MDECIMAL_PENNY_UNIT is the unit of penny, also can be defined elsewhere
 * This is in effect the value of the smallest coin
 *
 * At time of writing, thi would be 1 for USD, or 5 for Turkish Lira etc
 * need to take into consideratuib MDECIMAL_PENNIES above
 */
if (typeof MDECIMAL_PENNY_UNIT == "undefined") var MDECIMAL_PENNY_UNIT = 1


/*
 *  END OF INTRODUCTION AND USER SETTINGS
 */

/*
 * Import...
 */

import {MUtilBase, coalesce} from "./mutilbase.js";


/*
 * Private static regular expressions
 */

// Matches 123.45, or -345.67, or +555.764
var _MDECIMAL_REGF = /^([+-]?)(\d+)\.(\d+)$/

// Matches 1234, -6789, +9876
var _MDECIMAL_REGH = /^([+-]?)(\d+)$/

class MDecimal extends MUtilBase {
    constructor(setval)
    {
        super();
        this._negative = false;                        // true if negative
        this._whole = 0;                               // Whole number as integer
        this._decimal = 0;                             // MDecimal numbver as integer
        this._dlen = 0;                                // Number of decimal places
        if(coalesce(setval, null) != null)
            this.setValue(setval);          // Populate above
    }

    static toMDecimal(inp)
    {
        if(inp instanceof MDecimal)
            return inp;
        else
            return new MDecimal(inp);
    }

    setValue(setval)
    {
        this.reset();
        this._negative = false;
        this._whole = 0;
        this._decimal = 0;
        this._dlen = 0;
        if (coalesce(setval, "") === "")
            return;

        if(setval instanceof MDecimal)
        {
            this.basecopy(setval);
            this._negative = setval._negative;
            this._whole = setval._whole;
            this._decimal = setval._decimal;
            this._dlen = setval._dlen;
            return;
        }

        setval = setval.toString();
        this._isblank = false;

        var mat = _MDECIMAL_REGF.exec(setval);
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
            mat = _MDECIMAL_REGH.exec(setval);
            if(mat) {
                this._makefm(mat)
            } else {
                this.reset();
                this.setValid(false);
                this.doerror("Unknown input type: " + setval);
            }
        }
        this._simplify();
        return this;
   }

    setZero()
    {
        this.reset();
        this._negative = false;
        this._whole = 0;
        this._decimal = 0;
        this._dlen = 0;
        this.setNull(false);
        return this;
    }

    derToString()
    {
        var nval = "";
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
    }

    format(numdec)
    {
        // prints a format of the number
        // At the moment simply concatenates (fix)
        // Should use round to ronud
        numdec = coalesce(numdec, 2);
        var nval = "";
        if(!this.isValid()) return null;
        if(this.isNull()) return nval;
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
    }

    toNumber()
    {
        if(!this.isValue()) return null;
        var val = this._whole;
        if(this._decimal != 0) val += (this._decimal / this._tenpower(this._dlen));
        if(this._negative) val = 0.0 - val;
        return val;
    }

    toFloat() {return this.toNumber(); }

    isInt()
    {
        if(!this.isValue()) return null;
        return this._decimal == 0;
    }

    intPart()
    {
        if(!this.isValue()) return null;
        if(this._negative) {
            return 0 - this._whole;
        } else {
            return this._whole;
        }
    }

    fracPart()
    {
        if(!this.isValue()) return null;
        if(this._deciaml == 0) return 0.0;

        var val = this._decimal / this._tenpower(this._dlen);
        if(this._negative) val = 0 - val;
        return val;
    }

    pennies(denom, unit)
    {
        // This does floor so that rounding up
        // never occurs
        if(!this.isValue()) return null;
        denom = parseInt(coalesce(denom, MDECIMAL_PENNIES));
        unit = parseInt(coalesce(unit, MDECIMAL_PENNY_UNIT));
        var ret = this._getpennies("floor", denom, unit);
        if(this._negative) ret = 0 - ret;
        return ret;
    }

    roundPennies(denom, unit)
    {
        return this._setpennies("round", denom, unit);
    }
    fixPennies(denom, unit)
    {
        return this._setpennies("floor", denom, unit);
    }
    fixupPennies(denom, unit)
    {
        return this._setpennies("ceil", denom, unit);
    }
    ceilPennies(denom, unit)
    {
        if(this._negative)
            return this._setpennies("floor", denom, unit);
        else {
            return this._setpennies("ceil", denom, unit);
        }
    }
    floorPennies(denom, unit)
    {
        if(this._negative)
            return this._setpennies("ceil", denom, unit);
        else
            return this._setpennies("floor", denom, unit);
    }

    _setpennies(func, denom, unit)
    {
        if(!this.isValue()) return this;
        denom = parseInt(coalesce(denom, MDECIMAL_PENNIES));
        unit = parseInt(coalesce(unit, MDECIMAL_PENNY_UNIT));

        // Sets this up
        this._decimal = this._getpennies(func, denom, unit);

        this._dlen = denom;
        this._overdecimal();
        this._simplify();
        return this;
    }

    _getpennies(func, denom, unit)
    {
        if(!this.isValue()) return 0;
        if(this._deciaml == 0) return 0;

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
    }

    fromInt(inint)
    {
        // From an integer
        // Faster than parsing the thing
        this.setValue(null);
        if(coalesce(inint, null) == null) return this;

        inint = parseInt(inint, 10);
        this.setNull(false);
        if(inint < 0) {
            this._whole = 0 - inint;
            this._negative = true;
        } else {
            this._whole = inint;
        }
        return this;
    }

    plus(addval) { return (new MDecimal(this)).add(addval); }
    minus(subval) { return (new MDecimal(this)).subtract(subval); }
    times(rhsval) { return (new MDecimal(this)).multiply(rhsval); }
    over(rhsval) { return (new MDecimal(this)).divide(rhsval); }

    add(addval)
    {
        if(!this.isValid()) return this;
        if(this.isNull()) this.setZero();
        addval = MDecimal.toMDecimal(addval);
        if(!addval.isValue()) return this;

        if(this._negative == addval._negative) {
            this._doadd(addval);
        } else {
            var mkneg = this._dosubtract(addval);
            if (mkneg) {
                this._negative = (!this._negative);
            }
        }
        return this;
    }
    _doadd(addval)
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
    }

    subtract(subval)
    {
        if(!this.isValid()) return this;
        if(this.isNull()) this.setZero();
        subval = MDecimal.toMDecimal(subval);
        if(subval._isblank) return this;
        if(this._negative != subval._negative)
        {
            this._doadd(subval);
        } else {
           var mkneg = this._dosubtract(subval);
           if(mkneg) this._negative = (!this._negative);
        }
        return this;
    }

    multiply(rhsval)
    {
        // For now, convert hsval to money
        rhsval = MDecimal.toMDecimal(rhsval);
        if((!rhsval.isValue()) || (!this.isValue())) return this;

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

    }

    divide(rhsval)
    {
        // Divide is more difficult
        // and I question it's usefulness
        // as if you need to divide in accounting you
        // are in trouble anyway for total acuracy
        // Simply convert everything to a float here
        if(!this.isValue()) return this;
        rhsval = coalesce(rhsval, null);
        if(rhsval == null) return this;
        if (rhsval instanceof MDecimal) {
            if (!rhsval.isValue()) return this;
            rhsval = rhsval.toFloat();
        }
        rhsval = parseFloat(rhsval);
        var lhsval = this.toFloat();
        if(coalesce(rhsval, 0) == 0) {
            this.setValue(null);
        } else {
            this.setValue(lhsval / rhsval);
        }
        return this;
    }

    cmp(rhsval)
    {
        // Return -1, 0, 1 if this < = > rhs
        rhsval = MDecimal.toMDecimal(rhsval);
        if ((!this.isValue()) || (!rhsval.isValue())) return null;

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
    }

    gt(rhs) {return this.cmp(rhs) == 1}
    lt(rhs) {return this.cmp(rhs) == -1}
    eq(rhs) {return this.cmp(rhs) == 0}

    _dosubtract(subval)
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
    }

    _doactsub(lval, ldec, rval, rdec, dlen)
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
    }


    _makefm(mat)
    {
        if (mat[1] == "-")
            this._negative = true;

        if (mat[2] != "")
            this._whole = parseInt(mat[2]);
    }


    _seezero()
    {
        if(this._negative) {
            if(this._whole == 0 && this._decimal == 0)
                this._negative = false;
        }
        if(this._decimal == 0) this._dlen = 0;
    }

    _tenpower(num)
    {
        // 10 ^^ number
        // Not using "pow" because I want to guarantee integer
        // which I am not sure Math.pow(...) does
        var ans = 1;
        for(;num;num--) ans = ans * 10;
        return ans;
    }

    _samedecs(lhs, rhs)
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
    }

    _simplify()
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
    }

    round(numdecs) { this._decstuff("round", numdecs); return this;}
    fix(numdecs) { this._decstuff("floor", numdecs); return this;}
    fixup(numdecs) { this._decstuff("ceil", numdecs); return this;}
    ceil(numdecs)
    {
        if(this._negative)
            this._decstuff("floor", numdecs);
        else
            this._decstuff("ceil", numdecs);
        return this;
    }
    floor(numdecs)
    {
        if(this._negative)
            this._decstuff("ceil", numdecs);
        else
            this._decstuff("floor", numdecs);
        return this;
    }
    _decstuff(func, numdecs)
    {
        if(!this.isValue()) return;
        // Rounds the thing
        if(this._dlen > numdecs) {
            this._decimal = this._domath(func, this._decimal / this._tenpower(this._dlen - numdecs));
            this._dlen = numdecs;
            this._overdecimal();

            this._simplify();
        }
    }

    _overdecimal()
    {
        var seepow = this._tenpower(this._dlen);
        while(this._decimal >= seepow) {
            this._decimal -= seepow;
            this._whole += 1;
        }
    }

    _domath(func, expr)
    {
        switch(func) {
        case "ceil": return Math.ceil(expr); break;
        case "floor": return Math.floor(expr); break;
        case "round": return Math.round(expr); break;
        }
    }


    /*
    coalesce(see, def)
    {
        if(see === 0 || see === "0" || see === false) return see;
        if(typeof see == 'undefined' || see === null)
            return def;
        else
            return see;
    }
     */

    doerror(errmess)
    {
        console.log("ERROR in MDecimal: " + errmess);
        console.trace();
        // Leave this one out fo now
        // alert("ERROR in MDecimal: " + errmess);
    }
}

export {MDecimal};
