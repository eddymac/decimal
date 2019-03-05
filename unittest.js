"use strict";
/*
 * Unit test for Decimal object
 */

// Good float test here ... var x=(23-7.37)

// Mocks
// taken alerts out for now
// var alertmess = "";
// alert = function (arg) {alertmess = arg; }
// End of mocks

var UnitTests = {
    test_create: function(undef)
    {
        // Test for new blank
        var x = new Decimal();
        testok("Blank", x.toString() == "");
        x = new Decimal(null);
        testok("Null", x.toString() == "");
        testok("Null test", x.isValid() === true);
        x = new Decimal(undef);
        testok("Undefined", x.toString() == "");
        x = new Decimal("rubbish");
        testok("Rubbish", x.toString() == "");
        testok("Rubbish test", x.isValid() === false);
        x = new Decimal(0);
        testok("Zero int", x.toString() == "0");
        x = new Decimal("0");
        testok("Zero string", x.toString() == "0");
        x = new Decimal(12.34);
        testok("Number float", x.toString() == "12.34");
        x = new Decimal("34.56");
        testok("Number string", x.toString() == "34.56");
        x = new Decimal(-12.34);
        testok("Number negative float", x.toString() == "-12.34");
        testok("value test", x.isValid() === true);
        x = new Decimal(+12.34);
        testok("Number positive float", x.toString() == "12.34");
        x = new Decimal("-34.56");
        testok("Number negative string", x.toString() == "-34.56");
        x = new Decimal("+34.56");
        testok("Number positive string", x.toString() == "34.56");
        x = new Decimal(789);
        testok("Int", x.toString() == "789");
        x = new Decimal("987");
        testok("Int string", x.toString() == "987");
        x = new Decimal(-789);
        testok("negative Int", x.toString() == "-789");
        x = new Decimal("-987");
        testok("negative Int string", x.toString() == "-987");
        x = new Decimal(+789);
        testok("positive Int", x.toString() == "789");
        x = new Decimal("+987");
        testok("positive Int string", x.toString() == "987");
        x = new Decimal(new Decimal("1234.567"));
        testok("Decimal", x.toString() == "1234.567");
    },
    test_isNull: function()
    {
        testok("Is Null", (new Decimal()).isNull());
        testok("Is Not Null", (!(new Decimal("34.56")).isNull()));
    },

    // toString tested in test-create

    test_format: function()
    {
        testok("Null", (new Decimal()).format(3) == "");
        testok("Int", (new Decimal("123")).format(3) == "123.000");
        testok("Int to 0 dp", (new Decimal("123")).format(0) == "123"); 
        testok("Dec to 0 dp", (new Decimal("456.789")).format(0) == "456"); 
        testok("Dec to 2 dp", (new Decimal("456.789")).format(2) == "456.78"); 
        testok("Neg Dec to 2 dp", (new Decimal("-456.789")).format(2) == "-456.78"); 
    },

    test_toNumber: function()
    {
        testok("Positive int", (new Decimal("123")).toNumber() == 123);
        testok("Negative int", (new Decimal("-456")).toNumber() == -456);
        testok("Positive float", (new Decimal("123.321")).toNumber() == 123.321);
        testok("Negative float", (new Decimal("-456.789")).toNumber() == -456.789);
        testok("Blank", (new Decimal(null)).toNumber() == null);
    },

    test_toFloat: function()
    {
        // Same as toNumber
        testok("Positive int", (new Decimal("123")).toFloat() == 123);
    },

    test_isInt: function()
    {
        testok("True", (new Decimal("123")).isInt() === true);
        testok("False", (new Decimal("123.45")).isInt() === false);
        testok("Null", (new Decimal(null)).isInt() === null);
    },

    test_intPart: function()
    {
        testok("Null", (new Decimal(null)).intPart() === null);
        testok("Positive", (new Decimal("123.456")).intPart() == 123);
        testok("Negative", (new Decimal("-8123.456")).intPart() == -8123);
    },

    test_pennies: function()
    {
        testok("Null", (new Decimal(null)).pennies(2, 1) === null);
        testok("Default", (new Decimal("1234.5678")).pennies() == 56);
        testok("Halfpennies", (new Decimal("1234.5678")).pennies(3, 5) == 565);
        testok("Negaitve", (new Decimal("-1234.5678")).pennies() == -56);
        testok("Padout", (new Decimal("1234.5")).pennies() == 50);
    },

    test_decpennies: function()
    {
        testok("Round", (new Decimal("123.456")).roundPennies().toString() == "123.46");
        testok("Ceil", (new Decimal("123.456")).ceilPennies().toString() == "123.46");
        testok("Ceil", (new Decimal("-123.456")).ceilPennies().toString() == "-123.45");
        testok("Floor", (new Decimal("123.456")).floorPennies().toString() == "123.45");
        testok("Floor", (new Decimal("-123.456")).floorPennies().toString() == "-123.46");
        testok("Fix", (new Decimal("123.456")).fixPennies().toString() == "123.45");
        testok("Fixup", (new Decimal("123.456")).fixupPennies().toString() == "123.46");
    },

    test_fromint: function()
    {
        testok("Null", (new Decimal(null)).fromInt(null).toString() == "");
        testok("Positive", (new Decimal()).fromInt(123).toString() == "123");
        testok("Negative", (new Decimal()).fromInt(-123).toString() == "-123");
        testok("Truncate", (new Decimal()).fromInt(123.456).toString() == "123");
    },

    test_add: function()
    {
        function seeadd(descr, x, y, ans)
        {
            testok(descr, (new Decimal(x)).add(y).toString() == ans)
        }
        seeadd("Positives", "1.23", "4.56", "5.79");
        seeadd("Negatives", "-1.23", "-4.56", "-5.79");
        seeadd("Carry", "1.23", "2.91", "4.14");
        seeadd("Neg Pos", "-1.23", "5.56", "4.33");
        seeadd("pos neg", "1.23", "-5.56", "-4.33");
        seeadd("Carryneg", "6.12", "-1.23", "4.89");
        seeadd("Carrynegneg", "-6.12", "1.23", "-4.89");
        testok("Add Dec to Dec", (new Decimal(12.3).add(new Decimal(45.6)).toString() == "57.9"));
    },

    test_subtract: function()
    {
        function seesubtract(descr, x, y, ans)
        {
            testok(descr, (new Decimal(x)).subtract(y).toString() == ans)
        }
        seesubtract("Positives", "4.56", "1.23", "3.33");
        seesubtract("Positives rev", "1.23", "4.56", "-3.33");
        seesubtract("Diff signs", "1.23", "-4.56", "5.79");
        seesubtract("Diff signs rev", "-1.23", "4.56", "-5.79");
        seesubtract("Negatives", "-4.56", "-1.23", "-3.33");
        seesubtract("Negatives rev", "-1.23", "-4.56", "3.33");
        seesubtract("Carry", "6.12", "1.23", "4.89");
        seesubtract("Carry", "6.12", "1.23", "4.89");
        seesubtract("Carry Neg Neg", "-6.12", "-1.23", "-4.89");
        testok("See Decimal", (new Decimal(44.4).subtract(new Decimal(11.1))).toString() == "33.3");
    },

    test_multiply: function()
    {
        function seemult(descr, x, y, ans)
        {
            testok(descr, (new Decimal(x)).multiply(y).toString() == ans)
        }
        seemult("Positives", "1.2", "1.1", "1.32");
        seemult("Integer", "1.234", "2", "2.468");
        seemult("Carry", "2.9", "2", "5.8");
        seemult("Carry both decs", "2.9", "2.2", "6.38");
        seemult("Carry red dec", "2.55", "2", "5.1");
        seemult("Carry Whole", "7", "8", "56");
        seemult("Big", "2.000000002", "8", "16.000000016");
        seemult("Big overflow", "2.000000002", "8.0000000000001", "16.0000000160002");
        seemult("Very Big overflow", "2.00000000000002", "8.000000000000001", "16.000000000000162");
        seemult("Overflow round up", "2.00000009", "3.000000008", "6.000000286000001");
        seemult("Bit overflow round up", "2.00000007", "3.00000008", "6.000000370000006");
        seemult("Zero1", "0", "3.45", "0");
        seemult("Zero2", "23.45", "0", "0");
        seemult("Zero both", "0", "0", "0");
        seemult("Negs 1", "-2", "3.3", "-6.6");
        seemult("Negs 2", "1.23", "-4", "-4.92");
        seemult("Negs Both", "-1.2", "-1.3", "1.56");
        seemult("Blank", "", "66", "");
        testok("mult Dec to Dec", (new Decimal(12.3).multiply(new Decimal(3)).toString() == "36.9"));
    },

    test_divide: function()
    {
        function seediv(descr, x, y, ans)
        {
            testok(descr, (new Decimal(x)).divide(y).toString() == ans)
        }
        seediv("Positives Int", "6", "2", "3");
        seediv("Positives Fracs", "7", "2", "3.5");
        seediv("By Zero", "7.3", "0", "");
        seediv("From Zero", "0", "1.23", "0");
        testok("div Dec by Dec", (new Decimal(72).divide(new Decimal(6)).toString() == "12"));
    },

    test_cmp: function()
    {
        testok("Blank", (new Decimal(12.3)).cmp(null) === null);
        testok("equal", (new Decimal(12.3)).cmp(12.3) === 0);
        testok("penny greater", (new Decimal(12.5)).cmp(12.4) === 1);
        testok("penny less", (new Decimal(12.3)).cmp(12.6) === -1);
        testok("whole greater", (new Decimal(13.3)).cmp(12.1) === 1);
        testok("whole less", (new Decimal(11.3)).cmp(12.4) === -1);
        testok("rhs negative", (new Decimal(11.3)).cmp(-12.4) === 1);
        testok("lhs negative", (new Decimal(-13.3)).cmp(12.1) === -1);
        testok("both negative", (new Decimal(-11.3)).cmp(-12.1) === 1);
        testok("both negative", (new Decimal(-11.3)).cmp(-10.1) === -1);
    },

    test_comparisons: function()
    {
        testok("gt", (new Decimal(12.5)).gt(12.4) === true)
        testok("not gt", (new Decimal(12.5)).gt(12.6) === false)
        testok("lt", (new Decimal(11.3)).lt(12.4) === true);
        testok("not lt", (new Decimal(11.6)).lt(11.4) === false);
        testok("eq", (new Decimal(11.3)).eq(11.3) === true);
        testok("not eq", (new Decimal(11.6)).eq(12.4) === false);
    },

    test_decplaces: function()
    {
        testok("Round up", (new Decimal(12.346)).round(2).toString() == "12.35")
        testok("Round down", (new Decimal(12.343)).round(2).toString() == "12.34")
        testok("fix", (new Decimal(12.346)).fix(2).toString() == "12.34")
        testok("fix up", (new Decimal(12.346)).fixup(2).toString() == "12.35")
        testok("fix up n/a", (new Decimal(12.34)).fixup(2).toString() == "12.34")
        testok("ceil", (new Decimal(12.346)).ceil(2).toString() == "12.35")
        testok("ceil neg", (new Decimal(-12.346)).ceil(2).toString() == "-12.34")
        testok("floor", (new Decimal(12.346)).floor(2).toString() == "12.34")
        testok("floor neg", (new Decimal(-12.346)).floor(2).toString() == "-12.35")
    },

    test_arithmatic: function()
    {
        testok("plus", (new Decimal(1.23)).plus(2.34).toString() == "3.57");
        testok("minus", (new Decimal(1.23)).minus(2.34).toString() == "-1.11");
        testok("times", (new Decimal(-6)).times(3).toString() == "-18");
        testok("over", (new Decimal(138)).over(12).toString() == "11.5");

        // An obvious one to test for

        testok("Does not work for float", (new Decimal(23)).minus(7.37).toString() == "15.63");
    }

}


/*
 * My real dinky unit test library
 */

var numtest = 0;
var numpass = 0;
var numfail = 0;

var testlist = [];
var faillist = [];

var basedesc = "";

function dounittest(tests)
{
    for (var fname in tests) {
        if(fname.substring(0, 5) == "test_") {
            basedesc = "Test " + fname.substring(5);
            tests[fname]();
        }
    }
    displayresults();
}
function teststart()
{
    numtest = 0;
    numpass = 0;
    numfail = 0;

    testlist = [];
    faillist = [];
}

function testok(descr, cond)
{
    numtest += 1;
    var okdesc = "Test";
    var passed = null;
    if(cond) {
        passed = true;
        numpass += 1;
        okdesc = "Pass"
    } else {
        passed = false;
        numfail += 1;
        okdesc = "Fail"
        faillist.push(descr);
    }
    testlist.push([passed, okdesc + ": " + basedesc + ". " + descr]);
    return cond;
}

function displayresults()
{


    var ele  = document.getElementById("results");
    ele.innerHTML = "";

    ele.appendChild(
        doele("div", null, "Number of tests passed: " + numpass.toString() + " / "  + numtest.toString())
    );

    var tlen = testlist.length;
    var oeles = []
    for(var i = 0; i < tlen; i++) {
        var line = testlist[i];
        var passed = line[0];
        var descr = line[1];
        var colour = "yellow";
        if(passed)
            colour = "PaleGreen";
        else
            colour = "Pink";
            
        oeles.push(doele("tr", null, "", [
            doele("td", {style: "background-color:" + colour + ";"}, descr)
        ]));
    }

    ele.appendChild(doele("table", null, "", oeles));
}


function doele(etype, eatts, etext, children, etail)
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

