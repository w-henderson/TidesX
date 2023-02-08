interface TidalEvent {
    EventType: string,
    DateTime: string,
    IsApproximateTime: boolean,
    Height: number,
    IsApproximateHeight: boolean,
    Filtered: boolean,
    Date: string
}

interface Station {
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
        Footnote: string;
    }
}

interface UserPrefs {
    sortSetting: boolean,
    cacheSetting: boolean,
    darkModeSetting: boolean,
    imperialMeasurements: boolean
}