namespace API {
  const REQUEST_URL = "https://tidesx-api.whenderson.workers.dev/?id={}";

  // Returns a promise which resolves to an array TidalEvents for a specific station
  export function getTides(stationId: string): Promise<TidalEvent[]> {
    return window.fetch(REQUEST_URL.replace("{}", stationId)).then((data: Response) => {
      return data.json();
    });
  }
}

namespace StationTools {
  // Get full name of a station from its ID
  export function stationFromId(id: string): Station {
    for (let i = 0; i < stationsJson.length; i++) {
      if (stationsJson[i].properties.Id == id) return stationsJson[i];
    }
  }

  export function nameFromId(id: string): string {
    return stationFromId(id).properties.Name;
  }
}