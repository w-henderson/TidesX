import React from 'react';
import '../styles/Navigation.scss';

type Props = {
  title: string;
  selectedTab: string;
  changeTab: (tab: string) => void;
}

class Navigation extends React.Component<Props> {
  render() {
    return (
      <div className="Navigation">
        <div className="tabButtons">
          <i
            className={`fa fa-search${this.props.selectedTab === "search" ? " selectedTab" : ""}`}
            onClick={() => this.props.changeTab("search")} />

          <img
            src="images/icon_white.png"
            className={this.props.selectedTab === "home" ? " selectedTab" : ""}
            onClick={() => this.props.changeTab("home")} alt="TidesX Logo" />

          <i
            className={`fa fa-cog${this.props.selectedTab === "settings" ? " selectedTab" : ""}`}
            onClick={() => this.props.changeTab("settings")} />
        </div>

        <div className="titleBar">{this.props.title}</div>
      </div>
    )
  }
}

export default Navigation;
