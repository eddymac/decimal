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

class TestMDecimal extends UnitTest {
    test_create(undef)
    {
        // Test for new blank
        var x = new MDecimal();
        this.eq("Blank", x.toString(), "");
        x = new MDecimal(null);
        this.eq("Null", x.toString(), "");
        this.eq("Null test", x.isValid(), true);
        x = new MDecimal(undef);
        this.eq("Undefined", x.toString(), "");
        x = new MDecimal("rubbish");
        this.eq("Rubbish", x.toString(), "");
        this.eq("Rubbish test", x.isValid(), false);
        x = new MDecimal(0);
        this.eq("Zero int", x.toString(), "0");
        x = new MDecimal("0");
        this.eq("Zero string", x.toString(), "0");
        x = new MDecimal(12.34);
        this.eq("Number float", x.toString(), "12.34");
        x = new MDecimal("34.56");
        this.eq("Number string", x.toString(), "34.56");
        x = new MDecimal(-12.34);
        this.eq("Number negative float", x.toString(), "-12.34");
        this.eq("value test", x.isValid(), true);
        x = new MDecimal(+12.34);
        this.eq("Number positive float", x.toString(), "12.34");
        x = new MDecimal("-34.56");
        this.eq("Number negative string", x.toString(), "-34.56");
        x = new MDecimal("+34.56");
        this.eq("Number positive string", x.toString(), "34.56");
        x = new MDecimal(789);
        this.eq("Int", x.toString(), "789");
        x = new MDecimal("987");
        this.eq("Int string", x.toString(), "987");
        x = new MDecimal(-789);
        this.eq("negative Int", x.toString(), "-789");
        x = new MDecimal("-987");
        this.eq("negative Int string", x.toString(), "-987");
        x = new MDecimal(+789);
        this.eq("positive Int", x.toString(), "789");
        x = new MDecimal("+987");
        this.eq("positive Int string", x.toString(), "987");
        x = new MDecimal(new MDecimal("1234.567"));
        this.eq("Decimal", x.toString(), "1234.567");
    }
    test_isNull()
    {
        this.eq("Is Null", (new MDecimal()).isNull(), true);
        this.eq("Is Not Null", (new MDecimal("34.56")).isNull(), false);
    }

    // toString tested in test-create

    test_format()
    {
        this.eq("Null", (new MDecimal()).format(3), "");
        this.eq("Int", (new MDecimal("123")).format(3), "123.000");
        this.eq("Int to 0 dp", (new MDecimal("123")).format(0), "123");
        this.eq("Dec to 0 dp", (new MDecimal("456.789")).format(0), "456");
        this.eq("Dec to 2 dp", (new MDecimal("456.789")).format(2), "456.78");
        this.eq("Neg Dec to 2 dp", (new MDecimal("-456.789")).format(2), "-456.78");
        this.eq("Known Error", (new MDecimal("132.01")).format(2), "132.01");
        this.eq("Known Error 2", (new MDecimal("132.0123")).format(2), "132.01");
        this.eq("Known Error 3", (new MDecimal("-132.0123")).format(2), "-132.01");
    }

    test_toNumber()
    {
        this.eq("Positive int", (new MDecimal("123")).toNumber(), 123);
        this.eq("Negative int", (new MDecimal("-456")).toNumber(), -456);
        this.eq("Positive float", (new MDecimal("123.321")).toNumber(), 123.321);
        this.eq("Negative float", (new MDecimal("-456.789")).toNumber(), -456.789);
        this.eq("Blank", (new MDecimal(null)).toNumber(), null);
    }

    test_toFloat()
    {
        // Same as toNumber
        this.eq("Positive int", (new MDecimal("123")).toFloat(), 123);
    }

    test_isInt()
    {
        this.eq("True", (new MDecimal("123")).isInt(), true);
        this.eq("False", (new MDecimal("123.45")).isInt(), false);
        this.eq("Null", (new MDecimal(null)).isInt(), null);
    }

    test_intPart()
    {
        this.eq("Null", (new MDecimal(null)).intPart(), null);
        this.eq("Positive", (new MDecimal("123.456")).intPart(), 123);
        this.eq("Negative", (new MDecimal("-8123.456")).intPart(), -8123);
    }

    test_pennies()
    {
        this.eq("Null", (new MDecimal(null)).pennies(2, 1), null);
        this.eq("Default", (new MDecimal("1234.5678")).pennies(), 56);
        this.eq("Halfpennies", (new MDecimal("1234.5678")).pennies(3, 5), 565);
        this.eq("Negaitve", (new MDecimal("-1234.5678")).pennies(), -56);
        this.eq("Padout", (new MDecimal("1234.5")).pennies(), 50);
    }

    test_decpennies()
    {
        this.eq("Round", (new MDecimal("123.456")).roundPennies().toString(), "123.46");
        this.eq("Ceil", (new MDecimal("123.456")).ceilPennies().toString(), "123.46");
        this.eq("Ceil", (new MDecimal("-123.456")).ceilPennies().toString(), "-123.45");
        this.eq("Floor fixup neg", (new MDecimal("-123.9956")).floorPennies().toString(), "-124");
        this.eq("Floor", (new MDecimal("123.456")).floorPennies().toString(), "123.45");
        this.eq("Floor", (new MDecimal("-123.456")).floorPennies().toString(), "-123.46");
        this.eq("Fix", (new MDecimal("123.456")).fixPennies().toString(), "123.45");
        this.eq("Fixup", (new MDecimal("123.456")).fixupPennies().toString(), "123.46");
    }

    test_fromint()
    {
        this.eq("Null", (new MDecimal(null)).fromInt(null).toString(), "");
        this.eq("Positive", (new MDecimal()).fromInt(123).toString(), "123");
        this.eq("Negative", (new MDecimal()).fromInt(-123).toString(), "-123");
        this.eq("Truncate", (new MDecimal()).fromInt(123.456).toString(), "123");
    }

    test_add()
    {
        self = this;
        function seeadd(descr, x, y, ans)
        {
            self.eq(descr, (new MDecimal(x)).add(y).toString(), ans)
        }
        seeadd("Positives", "1.23", "4.56", "5.79");
        seeadd("Negatives", "-1.23", "-4.56", "-5.79");
        seeadd("Carry", "1.23", "2.91", "4.14");
        seeadd("Neg Pos", "-1.23", "5.56", "4.33");
        seeadd("pos neg", "1.23", "-5.56", "-4.33");
        seeadd("Carryneg", "6.12", "-1.23", "4.89");
        seeadd("Carrynegneg", "-6.12", "1.23", "-4.89");
        this.eq("Add Dec to Dec", (new MDecimal(12.3)).add(new MDecimal(45.6)).toString(), "57.9");
    }

    test_subtract()
    {
        self = this;
        function seesubtract(descr, x, y, ans)
        {
            self.eq(descr, (new MDecimal(x)).subtract(y).toString(), ans)
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
        this.eq("See MDecimal", (new MDecimal(44.4).subtract(new MDecimal(11.1))).toString(), "33.3");
    }

    test_multiply()
    {
        self = this;
        function seemult(descr, x, y, ans)
        {
            self.eq(descr, (new MDecimal(x)).multiply(y).toString(), ans)
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
        this.eq("mult Dec to Dec", (new MDecimal(12.3)).multiply(new MDecimal(3)).toString(), "36.9");
    }

    test_divide()
    {
        self = this;
        function seediv(descr, x, y, ans)
        {
            self.eq(descr, (new MDecimal(x)).divide(y).toString(), ans)
        }
        seediv("Positives Int", "6", "2", "3");
        seediv("Positives Fracs", "7", "2", "3.5");
        seediv("By Zero", "7.3", "0", "");
        seediv("From Zero", "0", "1.23", "0");
        this.eq("div Dec by Dec", (new MDecimal(72)).divide(new MDecimal(6)).toString(), "12");
    }

    test_cmp()
    {
        this.eq("Blank", (new MDecimal(12.3)).cmp(null), null);
        this.eq("equal", (new MDecimal(12.3)).cmp(12.3), 0);
        this.eq("penny greater", (new MDecimal(12.5)).cmp(12.4), 1);
        this.eq("penny less", (new MDecimal(12.3)).cmp(12.6), -1);
        this.eq("whole greater", (new MDecimal(13.3)).cmp(12.1), 1);
        this.eq("whole less", (new MDecimal(11.3)).cmp(12.4), -1);
        this.eq("rhs negative", (new MDecimal(11.3)).cmp(-12.4), 1);
        this.eq("lhs negative", (new MDecimal(-13.3)).cmp(12.1), -1);
        this.eq("both negative", (new MDecimal(-11.3)).cmp(-12.1), 1);
        this.eq("both negative", (new MDecimal(-11.3)).cmp(-10.1), -1);
    }

    test_comparisons()
    {
        this.eq("gt", (new MDecimal(12.5)).gt(12.4), true)
        this.eq("not gt", (new MDecimal(12.5)).gt(12.6), false)
        this.eq("lt", (new MDecimal(11.3)).lt(12.4), true);
        this.eq("not lt", (new MDecimal(11.6)).lt(11.4), false);
        this.eq("eq", (new MDecimal(11.3)).eq(11.3), true);
        this.eq("not eq", (new MDecimal(11.6)).eq(12.4), false);
    }

    test_decplaces()
    {
        this.eq("Round up", (new MDecimal(12.346)).round(2).toString(), "12.35")
        this.eq("Round 0 places", (new MDecimal(12.346)).round(0).toString(), "12")
        this.eq("Round 0 places up", (new MDecimal(12.746)).round(0).toString(), "13")
        this.eq("Round up whole", (new MDecimal(12.996)).round(2).toString(), "13")
        this.eq("Ceil up whole 1", (new MDecimal(14.98)).ceil(1).toString(), "15")
        this.eq("Ceil up frac 1", (new MDecimal(14.88)).ceil(1).toString(), "14.9")
        this.eq("Round down", (new MDecimal(12.343)).round(2).toString(), "12.34")
        this.eq("fix", (new MDecimal(12.346)).fix(2).toString(), "12.34")
        this.eq("fix up", (new MDecimal(12.346)).fixup(2).toString(), "12.35")
        this.eq("fix up n/a", (new MDecimal(12.34)).fixup(2).toString(), "12.34")
        this.eq("ceil", (new MDecimal(12.346)).ceil(2).toString(), "12.35")
        this.eq("ceil neg", (new MDecimal(-12.346)).ceil(2).toString(), "-12.34")
        this.eq("floor", (new MDecimal(12.346)).floor(2).toString(), "12.34")
        this.eq("floor neg", (new MDecimal(-12.346)).floor(2).toString(), "-12.35")
    }

    test_arithmatic()
    {
        this.eq("plus", (new MDecimal(1.23)).plus(2.34).toString(), "3.57");
        this.eq("minus", (new MDecimal(1.23)).minus(2.34).toString(), "-1.11");
        this.eq("times", (new MDecimal(-6)).times(3).toString(), "-18");
        this.eq("over", (new MDecimal(138)).over(12).toString(), "11.5");

        // An obvious one to test for

        this.eq("Does not work for float", (new MDecimal(23)).minus(7.37).toString(), "15.63");
    }

    test_parts()
    {
        this.eq("int", (new MDecimal(1.23)).intPart(), 1);
        this.eq("frac", (new MDecimal(1.23)).fracPart(), 0.23);
        this.eq("int neg", (new MDecimal(-1.23)).intPart(), -1);
        this.eq("frac neg", (new MDecimal(-1.23)).fracPart(), -0.23);
    }

}


function dounittest()
{
    var ut = new TestMDecimal();
    ut.clearresults();
    ut.run();
    ut.displayresults();
}

window.dounittest = dounittest;
