// The moonPhase function is a slight modification of https://gist.github.com/L-A/3497902 by Louis-André Labadie
// I have no idea how lunar physics works so I just reformatted it and got rid of the bits that I don't need

export const moonPhases = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent"
];

export function getMoonPhase(D: number, M: number, Y: number) {
  let n0 = 0;
  let f0 = 0.0;
  let AG = f0;   // Moon's age

  // normalize values to range 0...1    
  function normalize(v: number) {
    v = v - Math.floor(v);
    if (v < 0)
      v = v + 1;
    return v;
  }

  let YY = n0,
    MM = n0,
    K1 = n0,
    K2 = n0,
    K3 = n0,
    JD = n0,
    IP = f0;

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

  if (AG < 1.84566) return 0;
  else if (AG < 5.53699) return 1;
  else if (AG < 9.22831) return 2;
  else if (AG < 12.91963) return 3;
  else if (AG < 16.61096) return 4;
  else if (AG < 20.30228) return 5;
  else if (AG < 23.99361) return 6;
  else if (AG < 27.68493) return 7;
  else return 0;
};