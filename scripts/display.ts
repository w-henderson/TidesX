const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

var currentLocation: Station;
var initialHeight;

// Add event listener to set up everything when page loads
window.addEventListener("load", () => {
  HTMLRefs.updateRefs(); // Get references to used Nodes

  initialHeight = window.innerHeight; // Store the height of the window in a variable to later fix Android keyboard resizing bug
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('service_worker.js', { scope: "/TidesX/" }); // Set up PWA
  UserPreferences.initPrefs(); // Read the settings from local storage and apply them
  alertForChangedFavourites();
  initFavouritesPage(); // Initialise and populate the favourites page
});


// Initialise the favourites page and make requests to populate it
function initFavouritesPage(): void {
  // Get or create local storage object
  let favouriteLocations: string[] = UserPreferences.getFavourites();

  // If no favourites, alert user
  if (favouriteLocations.length == 0) HTMLRefs.tabs.home.innerHTML = "Your favourite locations will appear here once you've chosen some.";
  else HTMLRefs.tabs.home.innerHTML = "";

  // if sort is on in settings, sort locations alphabetically
  if (UserPreferences.settings.sortSetting) favouriteLocations.sort()

  // add favourite placeholders to page
  favouriteLocations.forEach(function (loc) {
    let favourite = HTML.createFavourite(StationTools.stationFromId(loc));
    HTMLRefs.tabs.home.appendChild(favourite);
    requestFavouriteLocationAsync(favourite, loc);
  });
}

// Make request to upade a favourite location
function requestFavouriteLocationAsync(favourite: HTMLElement, stationId: string) {
  let station = StationTools.stationFromId(stationId);
  API.getTides(stationId).then((tideTimes: TidalEvent[]) => {
    let futureTideTimes = [];
    let now = new Date().getTime();

    tideTimes.forEach((tide: TidalEvent) => {
      if (Date.parse(tide.DateTime) > now) {
        futureTideTimes.push(tide);
      }
    });

    let tideComingIn = futureTideTimes[0].EventType == "HighWater";
    let tide1Date = new Date(Date.parse(futureTideTimes[0].DateTime));
    let tide2Date = new Date(Date.parse(futureTideTimes[1].DateTime));

    let tideDirection = tideComingIn ? "up" : "down";
    if (!station.properties.ContinuousHeightsAvailable) tideDirection = undefined;

    HTML.updateFavourite(favourite, {
      locationName: station.properties.Name.toLowerCase(),
      tideDirection: tideDirection,
      next1: `${tide1Date.getHours().toString().padStart(2, "0")}:${tide1Date.getMinutes().toString().padStart(2, "0")}`,
      next2: `${tide2Date.getHours().toString().padStart(2, "0")}:${tide2Date.getMinutes().toString().padStart(2, "0")}`,
      tide1type: futureTideTimes[0].EventType === "HighWater" ? "High" : "Low",
      tide2type: futureTideTimes[1].EventType === "HighWater" ? "High" : "Low",
    });
  })
}

function initLocationTab(locationId: string): void {
  // prepare page for location change
  currentLocation = StationTools.stationFromId(locationId);

  HTML.setLoading(HTMLRefs.refs.todayTides);
  HTML.setLoading(HTMLRefs.refs.tomorrowTides);

  changeTab("location");

  // change the shown name
  HTMLRefs.refs.titleBar.textContent = currentLocation.properties.Name.toLowerCase();

  // if in favourites, add option to remove, otherwise option to add
  HTMLRefs.refs.favouritesButton.innerHTML = JSON.parse(window.localStorage.getItem("tidesXFavourites")).includes(currentLocation.properties.Id)
    ? "Unfavourite"
    : "Favourite";

  // get and then render tide times for today and tomorrow
  requestTideTimesAsync(currentLocation, "today");
  requestTideTimesAsync(currentLocation, "tomorrow");
}

function requestTideTimesAsync(location: Station, day: string) {
  API.getTides(location.properties.Id).then((tides: TidalEvent[]) => {
    document.querySelector(`#${day}Tides`).innerHTML = "";

    for (let i = 0; i < tides.length; i++) {
      let tideDate = new Date(Date.parse(tides[i].DateTime));
      var currentTime = new Date();
      if (day == "today" && tideDate.getDate() == currentTime.getDate()) {
        HTMLRefs.refs.todayTides.appendChild(
          HTML.createTideTime({
            past: currentTime.getTime() - tideDate.getTime() > 0,
            direction: tides[i].EventType == "HighWater" ? "High" : "Low",
            time: `${tideDate.getHours().toString().padStart(2, "0")}:${tideDate.getMinutes().toString().padStart(2, "0")}`,
            height: tides[i].Height.toFixed(2)
          })
        );
        HTMLRefs.refs.todayTides.appendChild(document.createElement("br"));
        heightInterpolation(tides);
      } else if (day == "tomorrow" && (tideDate.getDate() == currentTime.getDate() + 1 || (tideDate.getDate() == 1 && tideDate.getMonth() != currentTime.getMonth()))) {
        HTMLRefs.refs.tomorrowTides.appendChild(
          HTML.createTideTime({
            past: false,
            direction: tides[i].EventType == "HighWater" ? "High" : "Low",
            time: `${tideDate.getHours().toString().padStart(2, "0")}:${tideDate.getMinutes().toString().padStart(2, "0")}`,
            height: tides[i].Height.toFixed(2)
          })
        );
        HTMLRefs.refs.tomorrowTides.appendChild(document.createElement("br"));
      }
    }
  });
}

function heightInterpolation(tides: TidalEvent[]): void {
  let timeNow = new Date();
  let previousTide: TidalEvent;
  let nextTide: TidalEvent;
  let futureTideJustInCase: TidalEvent;
  for (let i = 0; i < tides.length; i++) {
    if (i > 0) previousTide = tides[i - 1];
    nextTide = tides[i];
    futureTideJustInCase = tides[i + 1];
    if (new Date(Date.parse(nextTide.DateTime)).getTime() > timeNow.getTime()) break;
  }

  let nextTideTime = new Date(Date.parse(nextTide.DateTime)).getTime();
  let nextTideHeight = nextTide.Height;
  let previousTideTime;
  let previousTideHeight;
  if (previousTide == undefined) {
    previousTideTime = nextTideTime - (1000 * 60 * 60 * 6);
    previousTideHeight = futureTideJustInCase.Height;
  } else {
    previousTideTime = new Date(Date.parse(previousTide.DateTime)).getTime();
    previousTideHeight = previousTide.Height;
  }

  // do actual maths
  var linearInterpolate = (timeNow.getTime() - previousTideTime) / (nextTideTime - previousTideTime); // 0 - 1 linear between times
  var sineInterpolate = (Math.sin((linearInterpolate - 0.5) * 180 * Math.PI / 180) + 1) / 2; // 0 - 1 sine between heights (also rad conversion)
  var estimatedHeight = previousTideHeight + sineInterpolate * (nextTideHeight - previousTideHeight); // estimation of current height using sine interpolation

  if (estimatedHeight.toString() !== "NaN") {
    HTMLRefs.refs.currentHeight.textContent = "(now " + (Math.round(estimatedHeight * 100) / 100).toString() + "m)";
    HTMLRefs.refs.continuousMessage.textContent = "";
    HTMLRefs.refs.continuousMessage.style.margin = "0 0 0";
  } else {
    HTMLRefs.refs.currentHeight.textContent = "";
    HTMLRefs.refs.continuousMessage.textContent = "Continuous data is unavailable for this location, most commonly due to it being on an estuary.";
    HTMLRefs.refs.continuousMessage.style.margin = "0 0 2vh";
  };
}

function initSubTab(subtab: string) {
  if (subtab == "extra") { // show extra info
    HTMLRefs.refs.mainLocationInfo.className = "subTab";
    HTMLRefs.refs.extraLocationInfo.className = "subTab subTabActive";

    // add moon phase information
    let currentDate = new Date();
    var mPhase = moonPhase(currentDate.getDate(), currentDate.getMonth() + 1, currentDate.getFullYear());
    HTML.updateMoonPhase(HTMLRefs.refs.moonInfo, mPhase);

    requestExtraTideTimesAsync(currentLocation);
  } else { // return to standard tab and remove extra info
    HTMLRefs.refs.mainLocationInfo.className = "subTab subTabActive";
    HTMLRefs.refs.extraLocationInfo.className = "subTab";
    HTML.setLoading(HTMLRefs.refs.extraDates, true);
  }
}

function requestExtraTideTimesAsync(location: Station) {
  API.getTides(location.properties.Id).then((tides: TidalEvent[]) => {
    HTML.updateExtraInfo(HTMLRefs.refs.extraDates, tides);
  });
}

// Switch tab
function changeTab(tab: string): void {
  // change classes to render tab change
  HTMLRefs.tabs.search.className = "tab";
  HTMLRefs.tabs.settings.className = "tab";
  HTMLRefs.tabs.home.className = "tab";
  HTMLRefs.tabs.location.className = "tab";

  HTMLRefs.tabs.buttons.search.className = "fa fa-search";
  HTMLRefs.tabs.buttons.settings.className = "fa fa-cog";
  HTMLRefs.tabs.buttons.home.className = "";

  document.getElementById(tab + "Tab").className += " tabActive";

  // if not showing the location tab, reset it
  if (tab != "location") {
    currentLocation = undefined;
    HTML.setLoading(HTMLRefs.refs.currentHeight);
    HTMLRefs.refs.continuousMessage.textContent = "";
    HTMLRefs.refs.continuousMessage.style.margin = "0 0 0";
    document.getElementById(tab + "TabButton").className += " selectedTab";
    HTMLRefs.refs.mainLocationInfo.className = "subTab subTabActive";
    HTMLRefs.refs.extraLocationInfo.className = "subTab";
    HTML.setLoading(HTMLRefs.refs.extraDates, true);
    HTMLRefs.refs.sunrise.innerHTML = "";
    HTMLRefs.refs.sunset.innerHTML = "";
    if (tab != "home") {
      HTMLRefs.refs.titleBar.innerHTML = tab;
    } else {
      HTMLRefs.refs.titleBar.innerHTML = "TidesX";
      if (!UserPreferences.settings.cacheSetting) {
        initFavouritesPage();
      }
    }
  }
}

// Prevent resize event from messing up page
function keyboardResize(keyboardOpen: boolean): void {
  if (keyboardOpen) {
    document.documentElement.style.setProperty("overflow", "auto");
    var metaViewport = document.querySelector("meta[name=viewport]")
    metaViewport.setAttribute("content", "height=" + initialHeight + ", width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
  } else {
    var metaViewport = document.querySelector("meta[name=viewport]")
    metaViewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
  }
}

function alertForChangedFavourites(): void {
  if (window.localStorage.getItem("tidesXMigrated") == undefined && window.localStorage.getItem("tidesXFavourites") != undefined) {
    window.localStorage.setItem("tidesXFavourites", "[]");
    window.localStorage.setItem("tidesXMigrated", "true");
    alert("TidesX has had a big update! We've completely redesigned our code, making it quicker and more reliable. However, we've also changed how we store favourites, meaning your favourites have been cleared. We're sorry for the inconvenience, but you'll just need to use the search feature to put them back again. We hope this update improves your TidesX experience!");
  }
}