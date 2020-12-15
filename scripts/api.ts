namespace API {
  const SUBSCRIPTION_KEY = "251a32929be04983aaae6ef03c249e85";
  const CORS_PROXY = "https://cors-anywhere-mirror.herokuapp.com/"
  const REQUEST_URL = "https://admiraltyapi.azure-api.net/uktidalapi/api/V1/Stations/{}/TidalEvents";

  // Returns a promise which resolves to an array TidalEvents for a specific station
  export function getTides(stationId: string): Promise<TidalEvent[]> {
    return window.fetch(CORS_PROXY + REQUEST_URL.replace("{}", stationId), {
      headers: { "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY }
    }).then((data: Response) => {
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