import React from 'react';
import '../styles/Settings.scss';

import { PreferenceContext } from '../PreferenceContext';

type Props = {}

class Settings extends React.Component<Props> {
  changeSetting(ctx: React.ContextType<typeof PreferenceContext>, setting: string) {
    switch (setting) {
      case "darkmode":
        ctx.setPrefs("darkMode", !ctx.prefs.darkMode);
        break;
      case "imperial":
        ctx.setPrefs("imperial", !ctx.prefs.imperial);
        break;
      case "sort":
        ctx.setPrefs("sort", !ctx.prefs.sort);
        break;
      case "cache":
        ctx.setPrefs("cache", !ctx.prefs.cache);
        break;
    }
  }

  resetPrefs() {
    localStorage.clear();
    window.location.reload();
  }

  render() {
    return (
      <PreferenceContext.Consumer>
        {ctx => (
          <div className="Settings">
            <table>
              <tbody>
                <tr>
                  <td>Dark mode</td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={ctx.prefs.darkMode} onChange={() => this.changeSetting(ctx, "darkmode")} />
                      <span className="slider round"></span>
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>Use imperial measurements</td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={ctx.prefs.imperial} onChange={() => this.changeSetting(ctx, "imperial")} />
                      <span className="slider round"></span>
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>Sort favourites</td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={ctx.prefs.sort} onChange={() => this.changeSetting(ctx, "sort")} />
                      <span className="slider round"></span>
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>Cache favourites data</td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={ctx.prefs.cache} onChange={() => this.changeSetting(ctx, "cache")} />
                      <span className="slider round"></span>
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
            <button onClick={() => ctx.setPrefs("favourites", [])}>Clear favourites</button><br />
            <button onClick={this.resetPrefs.bind(this)}>Clear all user data<br />(including settings)</button><br />
            <button onClick={() => window.location.reload()}>Force restart app</button>

            <div className="linksAndThanks">
              Thank you for using TidesX!<br />
              &copy; William Henderson 2023.<br />
              Tide data &copy; <a href="https://www.admiralty.co.uk/ukho/About-Us">UK Hydrographic Office</a>.<br />
              Visit the <a href="https://github.com/w-henderson/TidesX">GitHub</a>.
            </div>
          </div>
        )}
      </PreferenceContext.Consumer>
    )
  }
}

export default Settings;
