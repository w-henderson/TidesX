// The moonPhase function is a slight modification of https://gist.github.com/L-A/3497902 by Louis-André Labadie
// I have no idea how lunar physics works so I just reformatted it and got rid of the bits that I don't need
// Louis-André, if you ever see this, your variable naming is horrific but the comments make up for it

var moonPhases = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent"
];

function moonPhase(day, month, year) {
  var n0 = parseInt("0");
  var f0 = parseFloat("0.0");
  var AG = f0;   // Moon's age
  var DI = f0;   // Moon's distance in earth radii
  var LA = f0;   // Moon's ecliptic latitude
  var LO = f0;   // Moon's ecliptic longitude
  var Phase = parseInt(0);
  var Zodiac = " ";

  // Related to month length and age calculations
  var n28 = parseInt("28");
  var n30 = parseInt("30");
  var n31 = parseInt("31");
  var dim = new Array(n31, n28, n31, n30, n31, n30, n31, n31, n30, n31, n30, n31);

  day = parseInt(day, 10);
  month = parseInt(month, 10);
  year = parseInt(year, 10);

  moon_posit(year, month, day);

  this.age = round2(AG);
  this.distance = round2(DI);
  this.phase = Phase;
  this.latitude = round2(LA);
  this.longitude = round2(LO);
  this.zodiac = Zodiac;

  function isdayofmonth(y, m, d) {
    if (m != 2) {
      if (1 <= d && d <= dim[m - 1]) {
        return true;
      } else {
        return false;
      };
    }

    var feb = dim[1];
    if (isleapyear(y)) feb += 1;                                   // is leap year
    if (1 <= d && d <= feb) return true;
    return false;
  }

  function isleapyear(y) {
    var x = Math.floor(y - 4 * Math.floor(y / 4));
    var w = Math.floor(y - 100 * Math.floor(y / 100));
    var z = Math.floor(y - 400 * Math.floor(y / 400));

    if (x == 0) {                           // possible leap year
      if (w == 0 && z != 0) {
        return false;                  // not leap year
      } else {
        return true;                   // is leap year
      };
    }

    return false;
  }

  // compute moon position and phase
  function moon_posit(Y, M, D) {
    var YY = n0,
      MM = n0,
      K1 = n0,
      K2 = n0,
      K3 = n0,
      JD = n0,
      IP = f0,
      DP = f0,
      NP = f0,
      RP = f0;

    // calculate the Julian date at 12h UT
    YY = Y - Math.floor((12 - M) / 10);
    MM = M + 9;
    if (MM >= 12) MM = MM - 12;

    K1 = Math.floor(365.25 * (YY + 4712));
    K2 = Math.floor(30.6 * MM + 0.5);
    K3 = Math.floor(Math.floor((YY / 100) + 49) * 0.75) - 38;

    JD = K1 + K2 + D + 59;                  // for dates in Julian calendar
    if (JD > 2299160) JD = JD - K3;        // for Gregorian calendar

    // calculate moon's age in days
    IP = normalize((JD - 2451550.1) / 29.530588853);
    AG = IP * 29.53;

    if (AG < 1.84566) Phase = 0;
    else if (AG < 5.53699) Phase = 1;
    else if (AG < 9.22831) Phase = 2;
    else if (AG < 12.91963) Phase = 3;
    else if (AG < 16.61096) Phase = 4;
    else if (AG < 20.30228) Phase = 5;
    else if (AG < 23.99361) Phase = 6;
    else if (AG < 27.68493) Phase = 7;
    else Phase = 0;

    IP = IP * 2 * Math.PI;                      // Convert phase to radians

    // calculate moon's distance
    DP = 2 * Math.PI * normalize((JD - 2451562.2) / 27.55454988);
    DI = 60.4 - 3.3 * Math.cos(DP) - 0.6 * Math.cos(2 * IP - DP) - 0.5 * Math.cos(2 * IP);

    // calculate moon's ecliptic latitude
    NP = 2 * Math.PI * normalize((JD - 2451565.2) / 27.212220817);
    LA = 5.1 * Math.sin(NP);

    // calculate moon's ecliptic longitude
    RP = normalize((JD - 2451555.8) / 27.321582241);
    LO = 360 * RP + 6.3 * Math.sin(DP) + 1.3 * Math.sin(2 * IP - DP) + 0.7 * Math.sin(2 * IP);

    // correcting if longitude is not greater than 360!
    if (LO > 360) LO = LO - 360;
  }

  // round to 2 decimal places
  function round2(x) {
    return (Math.round(100 * x) / 100.0);
  }

  // normalize values to range 0...1    
  function normalize(v) {
    v = v - Math.floor(v);
    if (v < 0)
      v = v + 1;
    return v;
  }

  console.log(day,month,year);
  return Phase;
};