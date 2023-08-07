import React from 'react';

import { Station, getLocationTides, getStation } from '../api';

import { PreferenceContext } from '../PreferenceContext';

type Props = {
  id: string;
  callback: () => void;
}

type State = {
  station: Station;
  data?: {
    next1: Date;
    next2: Date;
    next1type: "High" | "Low";
    next2type: "High" | "Low";
    direction: "up" | "down" | undefined;
  }
}

class Favourite extends React.Component<Props, State> {
  static contextType = PreferenceContext;
  context!: React.ContextType<typeof PreferenceContext>;

  constructor(props: Props) {
    super(props);

    this.state = {
      station: getStation(props.id)!
    };
  }

  componentDidMount() {
    getLocationTides(this.props.id, this.context.prefs.cache).then(data => {
      let index = data.tides.findIndex(tide => tide.time > new Date());
      let next1 = data.tides[index];
      let next2 = data.tides[index + 1];

      let direction: "up" | "down" | undefined = data.tides[index].eventType === "HighWater" ? "up" : "down";
      if (!this.state.station.properties.ContinuousHeightsAvailable) direction = undefined;

      this.setState({
        data: {
          next1: next1.time,
          next2: next2.time,
          next1type: next1.eventType === "LowWater" ? "Low" : "High",
          next2type: next2.eventType === "LowWater" ? "Low" : "High",
          direction
        }
      });
    });
  }

  formatDate(date: Date) {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }

  render() {
    let arrowClass = "fas fa-minus";
    if (this.state.data?.direction === "up") arrowClass = "fas fa-arrow-up";
    if (this.state.data?.direction === "down") arrowClass = "fas fa-arrow-down";

    return (
      <div className="Favourite" onClick={this.props.callback}>
        <span>{this.state.data && <i className={arrowClass}></i>} {this.state.station.properties.Name}</span>

        <table>
          <tbody>
            <tr className="times">
              <td>{this.state.data ? this.formatDate(this.state.data.next1) : <img src="images/loading.gif" alt="Loading" />}</td>
              <td>{this.state.data ? this.formatDate(this.state.data.next2) : <img src="images/loading.gif" alt="Loading" />}</td>
            </tr>
            <tr className="names">
              <td>Next {this.state.data?.next1type || "High"}</td>
              <td>Next {this.state.data?.next2type || "Low"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default Favourite;
