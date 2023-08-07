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