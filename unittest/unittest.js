"use strict";

/*
 My dinky unit test program
 Copyright Edward Macnaghten 2019
 License: GPLv3

 Setting up (JavaScript inheritence is ugly)

 var TestMDecimal = function() {UnitTest.call(this); };
 TestMDecimal.prototype  = Object.assign(Object.create(UnitTest.prototype), {
     constructor: TestMDecimal,
     test_create: function(undef)
     {
         var x = new MDecimal();
         this.eq("Blank", x.toString(), "");
         x = new MDecimal(null);
         this.eq("Null", x.toString(), "");
         this.eq("Null test", x.isValid(), true);
     },
     etc

 });

 Then - something like:

 function dounittest()
 {
     var ut = new TestMDecimal();
     ut.clearresults();
     ut.run();
     ut.displayresults();
 }


 Methods provided:

 run() - Runs the tests
 clearresults() - Clears results in a DIV with ID of "testresults" (Static function)
 displayresults() - Displays results in a DIV with ID of "testresults"
 eq(description lhs, rhs) - Tests for equality (lhs === rhs)
 ne(description lhs, rhs) - Tests for inequality (NOT lhs === rhs)
 gt(description lhs, rhs) - Tests for greater than (lhs > rhs)
 lt(description lhs, rhs) - Tests for less than (lhs < rhs)
 ge(description lhs, rhs) - Tests for greater than or equal(lhs >= rhs)
 le(description lhs, rhs) - Tests for less than (lhs <= rhs)

 Application Developer provides:

 Will run all functions starting with "test_", no arguments
 running a "setup" and "teardown" methods (no args) before and after if provided

 All functions/methods starting with character "_" are reserved.

 */

function UnitTest()
{
    this._numtest = 0;
    this._numpass = 0;
    this._numfail = 0;
    this._testlist = [];
    this._faillist = [];
    this._basedesc = "";
}

UnitTest.prototype = {
    constructor: UnitTest,
    run: function()
    {
        this._numtest = 0;
        this._numpass = 0;
        this._numfail = 0;
        this._testlist = [];
        this._faillist = [];
        for (var fname in this) {
            if(fname.substring(0, 5) == "test_") {
                this._basedesc = "Test " + fname.substring(5);
                try {
                    if(this.setup) {
                        this.setup();
                    }
                    this[fname]();
                    if(this.teardown) {
                        this.teardown();
                    }
                } catch (err) {
                    this._numfail += 1;
                    console.log(err.stack);
                    this._testlist.push([false, "ERROR: " + this._basedesc + ". " + fname + ": ERROR " + err.toString()]);
                    this._faillist.push(this._basedesc + ". " + fname + " ERROR " + err.toString());
                }
            }
        }
    },

    eq: function(descr, lhs, rhs)
    {
        var cond = false;
        if(lhs === rhs)
            cond = true;
        this._proccond(descr, cond, "===", lhs, rhs);
        return cond;
    },

    gt: function(descr, lhs, rhs)
    {
        var cond = false;
        if(lhs > rhs)
            cond = true;
        this._proccond(descr, cond, ">", lhs, rhs);
        return cond;
    },
    lt: function(descr, lhs, rhs)
    {
        var cond = false;
        if(lhs < rhs)
            cond = true;
        this._proccond(descr, cond, "<", lhs, rhs);
        return cond;
    },
    ne: function(descr, lhs, rhs)
    {
        var cond = true;
        if(lhs === rhs)
            cond = false;
        this._proccond(descr, cond, "!=", lhs, rhs);
        return cond;
    },

    ge: function(descr, lhs, rhs)
    {
        var cond = false;
        if(lhs >= rhs)
            cond = true;
        this._proccond(descr, cond, ">=", lhs, rhs);
        return cond;
    },
    le: function(descr, lhs, rhs)
    {
        var cond = false;
        if(lhs <= rhs)
            cond = true;
        this._proccond(descr, cond, "<=", lhs, rhs);
        return cond;
    },

    _proccond: function(descr, cond, fstr, lhs, rhs)
    {
        var faildesc = "";
        this._numtest += 1;
        var okdesc = "Test";
        var passed = null;
        if(cond) {
            passed = true;
            this._numpass += 1;
            okdesc = "Pass"
        } else {
            try {
                lhs = this._tostring(lhs);
                rhs = this._tostring(rhs);
                faildesc = ": " + lhs.toString() + " not " + fstr + " " + rhs.toString();
            } catch (err) {
                faildesc = ": Cannot display condition: " + err.toString();
                console.log(this._basedesc + ", " + descr);
                console.log(lhs);
                console.log(rhs);
            }
            passed = false;
            this._numfail += 1;
            okdesc = "Fail"
            this._faillist.push(descr + faildesc);
        }
        this._testlist.push([passed, okdesc + ": " + this._basedesc + ". " + descr + faildesc]);
        return cond;
    },

    clearresults: function()
    {
        var ele  = document.getElementById("testresults");
        ele.innerHTML = "";
    },
    displayresults: function()
    {
        var ele  = document.getElementById("testresults");

        if (this._numpass == this._numtest && this._numfail == 0)
            var lcolour = "PaleGreen";
        else
            var lcolour = "Pink";

        var atts = {style: "background-color:"+lcolour + ";"};

        ele.appendChild(
            this._doele("div", null, "", [
                this._doele("span", null, "Number of tests passed: "),
                this._doele("span", atts, this._numpass.toString() + " / "  + this._numtest.toString())
            ])
        );

        var tlen = this._testlist.length;
        var oeles = []
        for(var i = 0; i < tlen; i++) {
            var line = this._testlist[i];
            var passed = line[0];
            var descr = line[1];
            var colour = "yellow";
            if(passed)
                colour = "PaleGreen";
            else
                colour = "Pink";
            oeles.push(this._doele("tr", null, "", [
                this._doele("td", {style: "background-color:" + colour + ";"}, descr)
            ]));
        }

        ele.appendChild(this._doele("table", null, "", oeles));
    },

    _tostring: function(inp)
    {
        if(typeof inp == "undefined")
            return "undefined";
        else if(inp === null)
            return "null";
        else if (typeof inp == "object")
            return "object";
        else
            return inp.toString();
    },

    _doele: function(etype, eatts, etext, children, etail)
    {
        // Helper for creatin elements
        // args:
        //      tag (defaults to div)
        //      attributes (Object, or if string the class)
        //      text
        //      children (as an array, if applicable)
        //      tail - Text after the tag

        if (typeof etype == "undefined") etype = "div";
        if (typeof eatts == "undefined") eclass = "";
        else if(typeof eatts == "string") eatts = {class: eatts};
        if (typeof etext == 'undefined') etext = "";
        if (typeof etail == 'undefined') etail = "";
        var ele = document.createElement(etype);
        if (typeof eatts == "object") {
            for (var key in eatts) {
                ele.setAttribute(key, eatts[key]);
            }
        }
        if(etext != "")
            ele.appendChild(document.createTextNode(etext));

        if(children) {
            if (typeof children == "object") {
                for(var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (child)
                        ele.appendChild(child);
                }
            }
        }
        // if(etail != "")
            // ele.appendChild(document.createTextNode(etail));
        return ele;
    }
}

