import React from 'react';
import '../styles/Location.scss';

import { LocationTides, getLocationTides } from '../api';
import { getMoonPhase, moonPhases } from '../api/moonPhase';
import TideTimeComponent from './TideTime';

import { PreferenceContext } from '../PreferenceContext';

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type Props = {
  location: string;
  isFavourite: boolean;
}

type State = {
  data: LocationTides | null;
  moreInfo: boolean;
}

class Location extends React.Component<Props, State> {
  static contextType = PreferenceContext;
  context!: React.ContextType<typeof PreferenceContext>;

  constructor(props: Props) {
    super(props);

    this.state = {
      data: null,
      moreInfo: false
    }
  }

  componentDidMount() {
    getLocationTides(this.props.location, this.context.prefs.cache).then(data => {
      this.setState({ data });
    });
  }

  toggleFavourite(ctx: React.ContextType<typeof PreferenceContext>) {
    if (this.props.isFavourite) {
      ctx.setPrefs("favourites", ctx.prefs.favourites.filter(f => f !== this.props.location));
    } else {
      ctx.setPrefs("favourites", [...ctx.prefs.favourites, this.props.location]);
    }
  }

  renderHeight(height: number): string {
    if (this.context.prefs.imperial) return `${(height * 3.28084).toFixed(2)}ft`;
    return `${height.toFixed(2)}m`;
  }

  render() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const phase = getMoonPhase(now.getDate(), now.getMonth() + 1, now.getFullYear());
    const tomorrowDate = new Date();
    tomorrowDate.setHours(0, 0, 0, 0);
    tomorrowDate.setDate(now.getDate() + 1);

    let height = this.state.data ? `(now ${this.renderHeight(this.state.data.currentHeight)})` : null;
    if (Number.isNaN(this.state.data?.currentHeight)) height = "";

    return (
      <PreferenceContext.Consumer>
        {ctx => (
          <div className="Location">
            {!this.state.moreInfo && <>
              {height === "" && <div className="continuousMessage">
                Continuous data is unavailable for this location, most commonly due to it being on an estuary.
              </div>}

              <span>Today <span className="currentHeight">{height ?? <img src="images/loading.gif" alt="Loading" />}</span></span>
              <div id="todayTides" className="detailedTides">
                {this.state.data && this.state.data.tides
                  .filter(t => t.date.getTime() === now.getTime())
                  .map(t => <TideTimeComponent tideTime={t} key={t.time.toString()} />)}

                {!this.state.data && <img src="images/loading.gif" alt="Loading" />}
              </div>

              <span>Tomorrow</span>
              <div className="detailedTides">
                {this.state.data && this.state.data.tides
                  .filter(t => t.date.getTime() === tomorrowDate.getTime())
                  .map(t => <TideTimeComponent tideTime={t} key={t.time.toString()} />)}

                {!this.state.data && <img src="images/loading.gif" alt="Loading" />}
              </div>

              <button style={{ float: "left" }} onClick={() => this.toggleFavourite(ctx)} >{this.props.isFavourite ? "Remove Favourite" : "Favourite"}</button>
              <button style={{ float: "right" }} onClick={() => this.setState({ moreInfo: true })}>More info</button>
            </>}

            {this.state.moreInfo && <>
              <div className="moonInfo">
                <span>Moon Phase:</span><br />
                <img src={`images/moon/${phase}.svg`} alt={`Moon phase ${moonPhases[phase]}`} /> {moonPhases[phase]}
              </div>

              <hr />

              <div id="extraDates">
                {this.state.data && Object.values(groupBy(this.state.data.tides, el => el.date.getTime().toString())).map(d =>
                  <React.Fragment key={d[0].date.getDay()}>
                    <span>{days[d[0].date.getDay()]} {d[0].date.getDate()} {months[d[0].date.getMonth()]}</span>

                    <div className="detailedTides">
                      {d.map(t => <TideTimeComponent tideTime={t} key={t.time.toString()} />)}
                    </div>
                  </React.Fragment>
                )}

                {!this.state.data &&
                  <img src="images/loading.gif" style={{ height: "10vh" }} alt="Loading" />}
              </div>

              <button style={{ float: "right" }} onClick={() => this.setState({ moreInfo: false })}>Back</button>
            </>}
          </div>
        )}
      </PreferenceContext.Consumer>
    )
  }
}

// https://stackoverflow.com/a/34890276
function groupBy<T>(array: T[], key: (item: T) => string): { [key: string]: T[] } {
  return array.reduce((rv, x) => {
    (rv[key(x)] = rv[key(x)] || []).push(x);
    return rv;
  }, {} as { [key: string]: T[] });
}

export default Location;
