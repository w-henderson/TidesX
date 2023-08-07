import React from 'react';
import '../styles/Home.scss';

import { getStation } from '../api';
import Favourite from './Favourite';

import { PreferenceContext } from '../PreferenceContext';

type Props = {
  callback: (id: string) => void;
}

class Home extends React.Component<Props> {
  renderFavourites(ctx: React.ContextType<typeof PreferenceContext>): JSX.Element[] {
    let favourites = ctx.prefs.favourites.slice();
    if (ctx.prefs.sort) favourites.sort((a, b) => getStation(a)!.properties.Name.localeCompare(getStation(b)!.properties.Name));
    return favourites.map((location, i) => <Favourite key={i} id={location} callback={() => this.props.callback(location)} />)
  }

  render() {
    return (
      <div className="Home">
        <PreferenceContext.Consumer>
          {ctx => ctx.prefs.favourites.length === 0 ? (
            <>
              Your favourite locations will appear here once you've chosen some.
            </>
          ) : this.renderFavourites(ctx)}
        </PreferenceContext.Consumer>
      </div>
    )
  }
}

export default Home;
