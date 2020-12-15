const favouritesHTML = '<div class="favourite" id="favourite-{shortLocationName}" onclick="initLocationTab(\'{shortLocationName}\')"><span>{locationName}</span><table><tr class="times"><td><img src="images/loading.gif"></td><td><img src="images/loading.gif"></td></tr><tr class="names"><td>Next High</td><td>Next Low</td></tr></table></div>';
const innerFavouritesHTML = '<span>{locationName}</span><table><tr class="times"><td>{next1}</td><td>{next2}</td></tr><tr class="names"><td>Next {1}</td><td>Next {2}</td></tr></table>';
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

var currentLocation: Station;
var initialHeight;

// Add event listener to set up everything when page loads
window.addEventListener("load", () => {
  initialHeight = window.innerHeight; // Store the height of the window in a variable to later fix Android keyboard resizing bug
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('service_worker.js', { scope: "/TidesX/" }); // Set up PWA
  UserPreferences.initPrefs(); // Read the settings from local storage and apply them
  initFavouritesPage(); // Initialise and populate the favourites page
});


// Initialise the favourites page and make requests to populate it
function initFavouritesPage(): void {
  // Get or create local storage object
  let favouriteLocations: string[] = UserPreferences.getFavourites();

  // If no favourites, alert user
  let homeTab = document.getElementById("homeTab");
  if (favouriteLocations.length == 0) homeTab.innerHTML = "Your favourite locations will appear here once you've chosen some.";
  else homeTab.innerHTML = "";

  // if sort is on in settings, sort locations alphabetically
  if (UserPreferences.settings.sortSetting) favouriteLocations.sort()

  // add favourite placeholders to page
  favouriteLocations.forEach(function (loc) {
    document.getElementById("homeTab").innerHTML += favouritesHTML
      .replace(/{shortLocationName}/g, loc)
      .replace("{locationName}", StationTools.nameFromId(loc).toLowerCase());
    requestFavouriteLocationAsync(loc); // get tide times to fill in placeholders
  });
}

// Make request to upade a favourite location
function requestFavouriteLocationAsync(stationId: string) {
  let station = StationTools.stationFromId(stationId);
  API.getTides(stationId).then((tideTimes: TidalEvent[]) => {
    let tideComingIn = tideTimes[0].EventType == "HighWater";
    let tide1Date = new Date(Date.parse(tideTimes[0].DateTime));
    let tide2Date = new Date(Date.parse(tideTimes[1].DateTime));

    document.getElementById("favourite-" + stationId).innerHTML = innerFavouritesHTML
      .replace("{locationName}", `<i class='fas fa-arrow-${tideComingIn ? "up" : "down"}'></i> ${station.properties.Name.toLowerCase()}`)
      .replace("{next1}", `${tide1Date.getHours().toString().padStart(2, "0")}:${tide1Date.getMinutes().toString().padStart(2, "0")}`)
      .replace("{next2}", `${tide2Date.getHours().toString().padStart(2, "0")}:${tide2Date.getMinutes().toString().padStart(2, "0")}`)
      .replace("{1}", tideComingIn ? "High" : "Low")
      .replace("{2}", tideComingIn ? "Low" : "High");
  })
}

function initLocationTab(locationId: string): void {
  // prepare page for location change
  currentLocation = StationTools.stationFromId(locationId);
  document.getElementById("todayTides").innerHTML = '<img src="images/loading.gif">';
  document.getElementById("tomorrowTides").innerHTML = '<img src="images/loading.gif">';
  changeTab("location");

  // change the shown name
  document.getElementById("titleBar").innerHTML = currentLocation.properties.Name.toLowerCase();

  // if in favourites, add option to remove, otherwise option to add
  document.getElementById("favouritesButton").innerHTML = JSON.parse(window.localStorage.getItem("tidesXFavourites")).includes(currentLocation.properties.Id)
    ? "Unfavourite"
    : "Favourite";

  // get and then render tide times for today and tomorrow
  requestTideTimesAsync(currentLocation, "today");
  requestTideTimesAsync(currentLocation, "tomorrow");
}

function requestTideTimesAsync(location: Station, day: string) {
  API.getTides(location.properties.Id).then((tides: TidalEvent[]) => {
    let outputHTML = "";
    for (let i = 0; i < tides.length; i++) {
      let tideDate = new Date(Date.parse(tides[i].DateTime));
      var currentTime = new Date();
      if (tideDate.getDate() != currentTime.getDate()) break;
      let pastString = "";
      if (currentTime.getTime() - tideDate.getTime() > 0 && day == "today") {
        pastString = " style=\"opacity: 0.25;\"";
      }
      let tideDirection = tides[i].EventType == "HighWater" ? "High" : "Low";
      outputHTML += `<a${pastString}>${tideDirection}: <span>${tideDate.getHours().toString().padStart(2, "0")}:${tideDate.getMinutes().toString().padStart(2, "0")} (${tides[i].Height.toFixed(2)}m)</span></a><br>`;
    }
    document.getElementById(day + "Tides").innerHTML = outputHTML;
    heightInterpolation(tides);
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

  document.getElementById("currentHeight").innerHTML = (Math.round(estimatedHeight * 100) / 100).toString() + "m";
}

function initSubTab(subtab: string) {
  if (subtab == "extra") { // show extra info
    document.getElementById("mainLocationInfo").className = "subTab";
    document.getElementById("extraLocationInfo").className = "subTab subTabActive";

    // add moon phase information
    let currentDate = new Date();
    var mPhase = moonPhase(currentDate.getDate(), currentDate.getMonth() + 1, currentDate.getFullYear());
    document.getElementById("moonInfo").innerHTML = "<span>Moon Phase:</span><br><img src='images/moon/" + mPhase.toString() + ".svg'> " + moonPhases[mPhase];

    requestExtraTideTimesAsync(currentLocation);
  } else { // return to standard tab and remove extra info
    document.getElementById("mainLocationInfo").className = "subTab subTabActive";
    document.getElementById("extraLocationInfo").className = "subTab";
    document.getElementById("extraDates").innerHTML = '<img src="images/loading.gif" style="height:10vh;">';
  }
}

function requestExtraTideTimesAsync(location: Station) {
  API.getTides(location.properties.Id).then((tides: TidalEvent[]) => {
    let currentWorkingDate: string;
    let outputHTML = "";
    tides.forEach(tide => {
      let dateObj = new Date(Date.parse(tide.DateTime));
      let dateStr = `${days[dateObj.getDay()]} ${dateObj.getDate()} ${months[dateObj.getMonth()]}`;
      if (dateStr != currentWorkingDate && currentLocation != undefined) {
        outputHTML += `</div><span>${dateStr}</span><div class="detailedTides">`;
      } else if (dateStr != currentWorkingDate) {
        outputHTML += `<span>${dateStr}</span><div class="detailedTides">`;
      }
      currentWorkingDate = dateStr;
      let tideDirection = tide.EventType == "HighWater" ? "High" : "Low";
      outputHTML += `${tideDirection}: <span>${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")} (${tide.Height.toFixed(2)}m)</span><br>`;
    });
    document.getElementById("extraDates").innerHTML = outputHTML;
  });
}

// Switch tab
function changeTab(tab: string): void {
  // change classes to render tab change
  document.getElementById("searchTab").className = "tab";
  document.getElementById("searchTabButton").className = "fa fa-search";
  document.getElementById("homeTab").className = "tab";
  document.getElementById("homeTabButton").className = "";
  document.getElementById("settingsTab").className = "tab";
  document.getElementById("settingsTabButton").className = "fa fa-cog";
  document.getElementById("locationTab").className = "tab";
  document.getElementById(tab + "Tab").className += " tabActive";

  // if not showing the location tab, reset it
  if (tab != "location") {
    currentLocation = undefined;
    document.getElementById("currentHeight").innerHTML = "<img src='images/loading.gif'>";
    document.getElementById(tab + "TabButton").className += " selectedTab";
    document.getElementById("mainLocationInfo").className = "subTab subTabActive";
    document.getElementById("extraLocationInfo").className = "subTab";
    document.getElementById("extraDates").innerHTML = '<img src="images/loading.gif" style="height:10vh;">';
    document.getElementById("sunrise").innerHTML = "";
    document.getElementById("sunset").innerHTML = "";
    if (tab != "home") {
      document.getElementById("titleBar").innerHTML = tab;
    } else {
      document.getElementById("titleBar").innerHTML = "TidesX";
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