import React from 'react';
import '../styles/Search.scss';

import { Station } from '../api';
import stationData from '../api/stationData';

type Props = {
  callback: (stationId: string) => void;
}

type State = {
  query: string;
  geolocationError: string | null;
}

class Search extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      query: "",
      geolocationError: null
    }
  }

  updateSearch(e: any) {
    this.setState({
      query: e.target.value,
      geolocationError: null
    });
  }

  updateSearchNear() {
    navigator.geolocation.getCurrentPosition(position => {
      let closest: Station | null = null;
      let distance = 2 ** 16;

      if (position.coords.latitude < 49 || position.coords.latitude > 61 || position.coords.longitude < -8 || position.coords.longitude > 4) {
        this.setState({ geolocationError: "outOfBounds" });
        return;
      }

      for (let source of stationData) {
        let distanceThisSource = Math.sqrt((position.coords.latitude - source.geometry.coordinates[1]) ** 2
          + (position.coords.longitude - source.geometry.coordinates[0]) ** 2);

        if (distanceThisSource < distance) {
          closest = source;
          distance = distanceThisSource;
        }
      };

      this.props.callback(closest!.properties.Id);
    }, e => {
      this.setState({ geolocationError: "error" });
    });
  }

  render() {
    return (
      <div className="Search">
        <input
          value={this.state.query}
          onChange={this.updateSearch.bind(this)}
          placeholder="Location Name"
          autoComplete="off"
          onFocus={undefined /*"keyboardResize(true);"*/}
          onBlur={undefined /*"keyboardResize(false);*"*/} />

        <div id="searchResults">
          {this.state.geolocationError === null && this.state.query.length < 2 && <>
            Type a few characters to search coastal locations, or <u onClick={this.updateSearchNear.bind(this)}>tap here</u> to find your closest location.
          </>}

          {this.state.geolocationError === null && this.state.query.length >= 2 && <>
            {stationData
              .filter(s => s.properties.Name.toLowerCase().includes(this.state.query.toLowerCase()))
              .sort((a, b) => a.properties.Name.localeCompare(b.properties.Name))
              .map(s => (
                <span
                  key={s.properties.Id}
                  onClick={() => this.props.callback(s.properties.Id)}>
                  {s.properties.Name}
                </span>
              ))}
          </>}

          {this.state.geolocationError === "outOfBounds" && <>
            Type a few characters to search coastal locations.<br /><br />TidesX is only available for the UK, and we've detected that you're currently outside the UK. If this is incorrect, please open an issue on GitHub.
          </>}

          {this.state.geolocationError === "error" && <>
            Type a few characters to search coastal locations.<br /><br />An error occured during geolocation; please search for your location instead.
          </>}
        </div>
      </div>
    )
  }
}

export default Search;
