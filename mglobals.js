"use strict";

/*
 The MUtuilities global functions

 Currently used to convert to appropriate object (if it can)
 if it no already is one

 mglobals.toMDecimal(arg)       - Convert to MDecimal object
 mglobals.toMDate(arg)          - Convert to MDate object
 mglobals.toMTime(arg)          - Convert to MTime object
 mglobals.toMDateTime(arg)      - Convert to MDateTime object
 coalesce(arg, default)         - if arg is not null or undefined or ""
                                  return it, else return default

 */

// Javascript does not seem to mind if some of these are
// not defined, so long as that particular function is
// not called

var mglobals = {
    toMDecimal: function(inp)
    {
        if(!(inp instanceof MDecimal))
            inp = new MDecimal(inp);
        return inp;
    },
    toMDate: function(inp)
    {
        if(!(inp instanceof MDate))
            inp = new MDate(inp);
        return inp;
    },
    toMTime: function(inp)
    {
        if(!(inp instanceof MTime))
            inp = new MTime(inp);
        return inp;
    },
    toMDateTime: function(inp)
    {
        if(!(inp instanceof MDateTime))
            inp = new MDateTime(inp);
        return inp;
    }
}



// coalesce used SO much, put on global

function coalesce(see, def)
{
    // the coalesce function - move to global?
    if(see === 0 || see === "0" || see === false) return see;
    if(typeof see == 'undefined' || see === null)
        return def;
    else
        return see;
}

/*
 A MUtilBase class
 An "interface" class that supports:
 isNull()     - If it is blank
 isValid()    - If it is valid
 toString()   - Convert to a string
 setNull(ind) - Sets to Null
 setValid(ind) - Sets valid flag

 Preoperties and methods may be derived, so the
 private members here (_isblank and _isvalid)
 need to remain private
 Defined to force implementations
 */

function MUtilBase()
{
    this._isblank = true;
    this._isvalid = true;
}

MUtilBase.prototype = {
    constructor: MUtilBase,
    reset: function()
    {
        this._isblank = true;
        this._isvalid = true;
    },
    basecopy: function(other)
    {
        this._isblank = other._isblank;
        this._isvalid = other._isvalid;
    },
    isNull: function() {return this._isblank; },
    isValid: function() {return this._isvalid; },
    isValue: function()
    {
        if((!this.isNull()) && (this.isValid()))
            return true;
        else
            return false;
    },
            
    setNull: function(ind)
    {
        ind = coalesce(ind, null);
        if(ind === null)
            this._isblank = true;
        else if(ind)
            this._isblank = true;
        else
            this._isblank = false;
        this.derSetNull(this.isNull());
    },
    setValid: function(ind)
    {
        ind = coalesce(ind, null);
        if(ind === null)
            this._isvalid = true;
        else if(ind)
            this._isvalid = true;
        else
            this._isvalid = false;
        this.derSetValid(this.isValid());
    },
    toString: function()
    {
        if(!this.isValid())
            return "";      // maybe change to "#Error" or something
        if(this.isNull())
            return "";
        else
            return this.derToString();
    },

    // Following can be overridden
    derSetNull: function(ind) {},
    derSetValid: function(ind) {},
    derSetNull: function(ind) {},
    derSetValid: function(ind) {}
}
            

        

    
