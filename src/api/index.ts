import stationsJson from "./stationData";

const REQUEST_URL = "https://tidesx-api.whenderson.workers.dev/?id={}";

const CACHE = new Map<string, CacheEntry>();

type CacheEntry = {
  tides: TidalEvent[];
  expires: number;
}

export type LocationTides = {
  currentHeight: number;
  tides: TideTime[];
}

export type TideTime = {
  past: boolean;
  direction: string;
  date: Date;
  time: Date;
  height: number;
  eventType: "HighWater" | "LowWater" | undefined;
}

export type TidalEvent = {
  EventType: string,
  DateTime: string,
  IsApproximateTime: boolean,
  Height: number,
  IsApproximateHeight: boolean,
  Filtered: boolean,
  Date: string
}

export type Station = {
  type: string,
  geometry: {
    type: string;
    coordinates: number[];
  },
  properties: {
    Id: string;
    Name: string;
    Country: string;
    ContinuousHeightsAvailable: boolean;
    Footnote: string | null;
  }
}

export async function getTides(stationId: string, useCache: boolean = false): Promise<TidalEvent[]> {
  if (useCache && CACHE.has(stationId)) {
    const entry = CACHE.get(stationId)!;

    if (entry.expires > Date.now()) {
      return Promise.resolve(entry.tides);
    }
  }

  const expires = Date.now() + 1000 * 60 * 60;
  const tides = await fetch(REQUEST_URL.replace("{}", stationId))
    .then(data => data.json());

  CACHE.set(stationId, { tides, expires });

  return tides;
}

export function getLocationTides(stationId: string, useCache: boolean = false): Promise<LocationTides> {
  return getTides(stationId, useCache).then(tides => {
    const result = [];

    for (let i = 0; i < tides.length; i++) {
      if (tides[i].Height === undefined) continue;
      if (tides[i].DateTime === undefined) continue;

      let tideDate = new Date(Date.parse(tides[i].Date));
      let tideTime = new Date(Date.parse(tides[i].DateTime + "Z"));
      let currentTime = new Date();
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (tideDate.getTime() >= currentDate.getTime()) {
        result.push({
          past: currentTime.getTime() - tideTime.getTime() > 0,
          direction: tides[i].EventType === "HighWater" ? "High" : "Low",
          date: tideDate,
          time: tideTime,
          height: tides[i].Height,
          eventType: tides[i].EventType as "HighWater" | "LowWater" | undefined
        });
      }
    }

    let timeNow = new Date();
    let previousTide: TidalEvent | null = null;
    let nextTide: TidalEvent | null = null;
    let futureTide: TidalEvent | null = null;
    for (let i = 0; i < tides.length; i++) {
      if (i > 0) previousTide = tides[i - 1];
      nextTide = tides[i];
      futureTide = tides[i + 1];
      if (new Date(Date.parse(nextTide.DateTime + "Z")).getTime() > timeNow.getTime()) break;
    }

    let nextTideTime = new Date(Date.parse(nextTide!.DateTime + "Z")).getTime();
    let nextTideHeight = nextTide!.Height;
    let previousTideTime;
    let previousTideHeight;
    if (previousTide === undefined) {
      previousTideTime = nextTideTime - (1000 * 60 * 60 * 6);
      previousTideHeight = futureTide!.Height;
    } else {
      previousTideTime = new Date(Date.parse(previousTide!.DateTime + "Z")).getTime();
      previousTideHeight = previousTide!.Height;
    }

    // do actual maths
    let linearInterpolate = (timeNow.getTime() - previousTideTime) / (nextTideTime - previousTideTime); // 0 - 1 linear between times
    let sineInterpolate = (Math.sin((linearInterpolate - 0.5) * 180 * Math.PI / 180) + 1) / 2; // 0 - 1 sine between heights (also rad conversion)
    let estimatedHeight = previousTideHeight + sineInterpolate * (nextTideHeight - previousTideHeight); // estimation of current height using sine interpolation

    return {
      currentHeight: estimatedHeight,
      tides: result
    };
  });
}

const stationsMap = new Map<string, Station>();
for (const station of stationsJson) {
  stationsMap.set(station.properties.Id, station);
}

export function getStation(id: string): Station | undefined {
  return stationsMap.get(id);
}