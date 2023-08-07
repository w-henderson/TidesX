import React from "react";

export type Prefs = {
  favourites: string[];
  darkMode: boolean;
  imperial: boolean;
  sort: boolean;
  cache: boolean;
}

type ContextType = {
  prefs: Prefs;
  setPrefs: (k: keyof Prefs, v: any) => void;
}

export const PreferenceContext = React.createContext<ContextType>({
  prefs: {
    favourites: [],
    darkMode: false,
    imperial: false,
    sort: false,
    cache: true
  },
  setPrefs: (k: keyof Prefs, v: any) => { }
});

export function tryMigrateFromOldFormat(fallback: Prefs): Prefs {
  const favourites = localStorage.getItem("tidesXFavourites");
  const settings = localStorage.getItem("tidesXSettings");

  if (favourites && settings) {
    localStorage.removeItem("tidesXFavourites");
    localStorage.removeItem("tidesXSettings");

    const newSettings = JSON.parse(settings);

    const prefs = {
      favourites: JSON.parse(favourites),
      darkMode: newSettings.darkModeSetting,
      imperial: newSettings.imperialMeasurements,
      sort: newSettings.sortSetting,
      cache: newSettings.cacheSetting
    };

    localStorage.setItem("tidesXPrefs", JSON.stringify(prefs));

    return prefs;
  } else {
    return fallback;
  }
}