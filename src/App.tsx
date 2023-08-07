import React from 'react';
import './styles/App.scss';

import { getStation } from './api';
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';
import Settings from './components/Settings';
import Location from './components/Location';

import { PreferenceContext, Prefs } from './PreferenceContext';

type State = {
  selectedTab: string;
  location: string | null;
  prefs: Prefs
}

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    const item = localStorage.getItem("tidesXPrefs");

    const prefs = item ? JSON.parse(item) : {
      favourites: [],
      darkMode: false,
      imperial: false,
      sort: false,
      cache: true
    };

    this.state = {
      selectedTab: "home",
      location: null,
      prefs
    }
  }

  setPrefs(key: keyof Prefs, value: any) {
    const prefs = this.state.prefs;
    prefs[key] = value;
    this.setState({ prefs });
    localStorage.setItem("tidesXPrefs", JSON.stringify(prefs));
  }

  render() {
    let title = "TidesX";

    switch (this.state.selectedTab) {
      case "search": title = "Search"; break;
      case "settings": title = "Settings"; break;
      case "location": title = getStation(this.state.location!)!.properties.Name; break;
    }

    return (
      <div className={`App ${this.state.prefs.darkMode ? "darkMode" : "lightMode"}`}>
        <PreferenceContext.Provider value={{ prefs: this.state.prefs, setPrefs: this.setPrefs.bind(this) }}>
          <Navigation
            title={title}
            selectedTab={this.state.selectedTab}
            changeTab={selectedTab => this.setState({ selectedTab })} />

          <div className="main">
            {this.state.selectedTab === "search" && <Search callback={location => this.setState({ selectedTab: "location", location })} />}
            {this.state.selectedTab === "home" && <Home callback={location => this.setState({ selectedTab: "location", location })} />}
            {this.state.selectedTab === "settings" && <Settings />}
            {this.state.selectedTab === "location" && <Location
              location={this.state.location!}
              isFavourite={this.state.prefs.favourites.includes(this.state.location!)} />}
          </div>
        </PreferenceContext.Provider>
      </div>
    )
  }
}

export default App;
