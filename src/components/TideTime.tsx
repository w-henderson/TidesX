import React from 'react';

import { TideTime } from '../api';

type Props = {
  tideTime: TideTime
}

class TideTimeComponent extends React.Component<Props> {
  render() {
    const height = this.props.tideTime.height.toFixed(2) + "m";
    const time = `${this.props.tideTime.time.getHours().toString().padStart(2, "0")}:${this.props.tideTime.time.getMinutes().toString().padStart(2, "0")}`;

    return (
      <div style={{ opacity: this.props.tideTime.past ? 0.25 : 1 }}>
        {this.props.tideTime.direction}: <span>{time} ({height})</span>
      </div>
    )
  }
}

export default TideTimeComponent;
