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

