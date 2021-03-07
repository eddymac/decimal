"use strict";

/*
 The MUtuilities global functions
 */



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

class MUtilBase {
    constructor()
    {
        this._isblank = true;
        this._isvalid = true;
    }

    reset()
    {
        this._isblank = true;
        this._isvalid = true;
    }
    basecopy(other)
    {
        this._isblank = other._isblank;
        this._isvalid = other._isvalid;
    }
    isNull() {return this._isblank; }
    isValid() {return this._isvalid; }
    isValue()
    {
        if((!this.isNull()) && (this.isValid()))
            return true;
        else
            return false;
    }
            
    setNull(ind)
    {
        ind = coalesce(ind, null);
        if(ind === null)
            this._isblank = true;
        else if(ind)
            this._isblank = true;
        else
            this._isblank = false;
        this.derSetNull(this.isNull());
    }
    setValid(ind)
    {
        ind = coalesce(ind, null);
        if(ind === null)
            this._isvalid = true;
        else if(ind)
            this._isvalid = true;
        else
            this._isvalid = false;
        this.derSetValid(this.isValid());
    }
    toString()
    {
        if(!this.isValid())
            return "";      // maybe change to "#Error" or something
        if(this.isNull())
            return "";
        else
            return this.derToString();
    }

    // Following can be overridden
    derSetNull(ind) {}
    derSetValid(ind) {}
    derSetNull(ind) {}
    derSetValid(ind) {}
}

export {coalesce, MUtilBase};
            
