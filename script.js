const favouritesHTML = '<div class="favourite" id="favourite-{shortLocationName}" onclick="loadLocationTab(\'{shortLocationName}\')"><span>{locationName}</span><table><tr class="times"><td><img src="images/loading.gif"></td><td><img src="images/loading.gif"></td></tr><tr class="names"><td>Next High</td><td>Next Low</td></tr></table></div>';
const innerFavouritesHTML = '<span>{locationName}</span><table><tr class="times"><td>{next1}</td><td>{next2}</td></tr><tr class="names"><td>Next {1}</td><td>Next {2}</td></tr></table>';
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var extraDatesHTML = [];

var initialHeight;
function setup() {
  initialHeight = window.innerHeight;

  // set up as pwa
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service_worker.js', {
      scope: "/TidesX/"
    })
      .then(function (reg) {
        console.log("Service worker registered.");
      }).catch(function (err) {
        console.log("Service worker not registered. This happened:", err)
      });
  }

  // read settings from localstorage and apply them
  if (window.localStorage.getItem("tidesXSettings") != null) {
    var settings = JSON.parse(window.localStorage.getItem("tidesXSettings"));
    document.getElementById("sortSetting").checked = settings[0].sortSetting;
    document.getElementById("cacheSetting").checked = settings[0].cacheSetting;
    document.getElementById("darkModeSetting").checked = settings[0].darkModeSetting;
    if (settings[0].darkModeSetting) {
      document.body.className = "darkMode";
      document.querySelector("meta[name='theme-color']").setAttribute("content", "#334");
    }
  } else {
    window.localStorage.setItem("tidesXSettings", '[{"sortSetting":false,"cacheSetting":false,"darkModeSetting":false}]');
  }
}

// request tide times and call applicable render method
function requestTideTimes(location, mode = "today") {
  // setup request
  var timeBeforeRequest = new Date();
  var extraURLData = "";
  if (mode == "tomorrow") {
    var tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    extraURLData = "-" + tomorrowDate.getFullYear().toString() + (tomorrowDate.getMonth() + 1).toString().padStart(2, "0") + tomorrowDate.getDate().toString().padStart(2, "0");
  } else if (mode != "today" && mode != "favouritesPage") {
    extraURLData = "-" + mode;
  }

  // perform request
  window.fetch("https://cors-anywhere-mirror.herokuapp.com/" + sources[location].url + extraURLData)
    .then((response) => {
      response.text().then((data) => {
        console.log(((new Date() - timeBeforeRequest) / 1000) + "s for request");

        // parse raw tide data from html on page (leave as string because date manipulation not needed)
        var rawTides = data.match(/\d{2}:\d{2}<\/span>/g) // high, low, high, low
        rawTides.forEach(function (tide, index) { rawTides[index] = tide.replace("</span>", "") });
        var heights = data.match(/\d\.\d{2}m/g).slice(0, rawTides.length) // high, low, high, low

        console.log({ rawTides, heights });

        // detect page type and call render method
        if (mode == "favouritesPage") {
          renderFavouritesPage(data, location, sources);
        } else if (mode == "today" || mode == "tomorrow") {
          renderLocationPage(rawTides, heights, mode);
          if (mode == "today") { heightInterpolation(rawTides, heights); addSunriseSunsetInfo(data); }
        } else {
          // additional information, render
          var firstTide = parseInt(heights[0].slice(0, 4)) > parseInt(heights[1].slice(0, 4)) ? "High" : "Low";
          var actualDate = new Date(mode.slice(0, 4), parseInt(mode.slice(4, 6)) - 1, mode.slice(6, 8));
          var formattedDate = days[actualDate.getDay()] + " " + actualDate.getDate().toString() + " " + months[actualDate.getMonth()];
          var outputHTML = "<span dateForSort='" + mode + "'>" + formattedDate + "</span><div class='detailedTides'>";

          for (let i = 0; i < rawTides.length; i++) {
            outputHTML += firstTide + ": <span>" + rawTides[i] + " (" + heights[i] + ")</span><br>";
            if (firstTide == "High") { firstTide = "Low" } else { firstTide = "High" }
          }

          extraDatesHTML.push(outputHTML + "</div>");
          showExtraDates(); // checks if all dates are ready, if not waits
        }
      });
    });
}

function renderFavouritesPage(data, location, sources) {
  // parse page javascript to get date object so we can manipulate it as a date
  var wantedData = data.slice(data.indexOf("var next_high = "), data.indexOf("setTimeout(this.location.reload"));
  var nextHighDate = wantedData.slice(25, wantedData.indexOf(")")).split(",");
  var nextLowRaw = wantedData.substring(wantedData.indexOf("var next_low"));
  var nextLowDate = nextLowRaw.slice(25, nextLowRaw.indexOf(")")).split(",");
  var nextHigh = new Date(parseInt(nextHighDate[0]), parseInt(nextHighDate[1]), parseInt(nextHighDate[2]), parseInt(nextHighDate[3]), parseInt(nextHighDate[4]), parseInt(nextHighDate[5]), parseInt(nextHighDate[6]));
  var nextLow = new Date(parseInt(nextLowDate[0]), parseInt(nextLowDate[1]), parseInt(nextLowDate[2]), parseInt(nextLowDate[3]), parseInt(nextLowDate[4]), parseInt(nextLowDate[5]), parseInt(nextLowDate[6]));

  if (nextHigh - nextLow > 0) { // if next high is after next low
    document.getElementById("favourite-" + location).innerHTML = innerFavouritesHTML
      .replace("{locationName}", "<i class='fas fa-arrow-down'></i> " + sources[location].fullName)
      .replace("{next2}", nextHigh.getHours().toString().padStart(2, "0") + ":" + nextHigh.getMinutes().toString().padStart(2, "0"))
      .replace("{next1}", nextLow.getHours().toString().padStart(2, "0") + ":" + nextLow.getMinutes().toString().padStart(2, "0"))
      .replace("{1}", "Low")
      .replace("{2}", "High");
  } else { // if next low is after next high
    document.getElementById("favourite-" + location).innerHTML = innerFavouritesHTML
      .replace("{locationName}", "<i class='fas fa-arrow-up'></i> " + sources[location].fullName)
      .replace("{next1}", nextHigh.getHours().toString().padStart(2, "0") + ":" + nextHigh.getMinutes().toString().padStart(2, "0"))
      .replace("{next2}", nextLow.getHours().toString().padStart(2, "0") + ":" + nextLow.getMinutes().toString().padStart(2, "0"))
      .replace("{1}", "High")
      .replace("{2}", "Low");
  }
}

function renderLocationPage(rawTides, heights, mode) {
  var firstTide = parseInt(heights[0].slice(0, 4)) > parseInt(heights[1].slice(0, 4)) ? "High" : "Low"; // if first tide is higher than second then first tide is high
  var outputHTML = "";
  for (let i = 0; i < rawTides.length; i++) {
    var tideDate = new Date();
    tideDate.setHours(parseInt(rawTides[i].substring(0, 2)), parseInt(rawTides[i].substring(3, 5)), 0, 0);
    var currentTime = new Date();
    pastString = "";
    if (currentTime - tideDate > 0 && mode == "today") {
      pastString = " style=\"opacity: 0.25;\"";
    }
    outputHTML += "<a" + pastString + ">" + firstTide + ": <span>" + rawTides[i] + " (" + heights[i] + ")</span></a><br>";
    if (firstTide == "High") { firstTide = "Low" } else { firstTide = "High" }
  }
  document.getElementById(mode + "Tides").innerHTML = outputHTML;
}

function heightInterpolation(rawTides, heights) {
  // calculate nextIndex (index of next tide) and previousIndex (index of last tide)
  var timeNow = new Date();
  var previousIndex = -1;
  var nextIndex = -1;
  rawTides.forEach(function (tide, index) {
    var parsedTide = new Date();
    parsedTide.setHours(parseInt(tide.slice(0, 2)), parseInt(tide.substring(3)), 0, 0);
    if (parsedTide - timeNow > 0 && nextIndex == -1) {
      nextIndex = index;
      previousIndex = nextIndex - 1;
    }
  });

  if (previousIndex >= 0 && nextIndex >= 0) {
    // if both previous and next tides are today, get their times and heights
    var previousHeight = heights[previousIndex];
    var previousTime = new Date();
    previousTime.setHours(rawTides[previousIndex].slice(0, 2), rawTides[previousIndex].substring(3), 0, 0);
    var nextTime = new Date();
    nextTime.setHours(rawTides[nextIndex].slice(0, 2), rawTides[nextIndex].substring(3), 0, 0);
    var nextHeight = heights[nextIndex];
  } else if (nextIndex < 0) {
    // if next tide is tomorrow, set height to height of tide before previous and time to six hours after previous
    var nextTime = new Date();
    nextTime.setHours(rawTides[rawTides.length - 1].slice(0, 2), rawTides[rawTides.length - 1].substring(3), 0, 0);
    nextTime.setHours(nextTime.getHours() + 6);
    var nextHeight = heights[heights.length - 2];
    var previousHeight = heights[heights.length - 1];
    var previousTime = new Date();
    previousTime.setHours(rawTides[rawTides.length - 1].slice(0, 2), rawTides[rawTides.length - 1].substring(3), 0, 0);
  } else if (previousIndex < 0) {
    // if previous tide was yesterday, set height to height of tide after next and time to six hours before next
    var previousHeight = heights[nextIndex + 1];
    var previousTime = new Date();
    previousTime.setHours(rawTides[nextIndex].slice(0, 2), rawTides[nextIndex].substring(3), 0, 0);
    previousTime.setHours(previousTime.getHours() - 6);
    var nextTime = new Date();
    nextTime.setHours(rawTides[nextIndex].slice(0, 2), rawTides[nextIndex].substring(3), 0, 0);
    var nextHeight = heights[nextIndex];
  }
  previousHeight = parseFloat(previousHeight.slice(0, 4));
  nextHeight = parseFloat(nextHeight.slice(0, 4));

  // do actual maths
  var linearInterpolate = (timeNow.getTime() - previousTime.getTime()) / (nextTime.getTime() - previousTime.getTime()); // 0 - 1 linear between times
  var sineInterpolate = (Math.sin((linearInterpolate - 0.5) * 180 * Math.PI / 180) + 1) / 2; // 0 - 1 sine between heights (also rad conversion)
  var estimatedHeight = previousHeight + sineInterpolate * (nextHeight - previousHeight); // estimation of current height using sine interpolation

  document.getElementById("currentHeight").innerHTML = (Math.round(estimatedHeight * 100) / 100).toString() + "m";
}

function addSunriseSunsetInfo(data) {
  // parse data to find sunrise and sunset
  var sunrise = data.match(/<div>Sunrise:<span>(.*?)<\/span><\/div>/)[0]
    .replace("<div>Sunrise:<span>", "")
    .replace("</span></div>", "");
  var sunset = data.match(/<div>Sunset:<span>(.*?)<\/span><\/div>/)[0]
    .replace("<div>Sunset:<span>", "")
    .replace("</span></div>", "");

  // render it
  document.getElementById("sunrise").innerHTML = "<span>Sunrise: </span>" + sunrise;
  document.getElementById("sunset").innerHTML = "<span>Sunset: </span>" + sunset;
}

function changeTab(tab) {
  // change classes to render tab change
  document.getElementById("searchTab").className = "tab";
  document.getElementById("searchTabButton").className = "fa fa-search";
  document.getElementById("homeTab").className = "tab";
  document.getElementById("homeTabButton").className = "";
  document.getElementById("settingsTab").className = "tab";
  document.getElementById("settingsTabButton").className = "fa fa-cog";
  document.getElementById("locationTab").className = "tab";

  document.getElementById(tab + "Tab").className += " tabActive";
  if (tab != "location") {
    shownLocation = "";
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
      if (!JSON.parse(window.localStorage.getItem("tidesXSettings"))[0].cacheSetting) {
        showFavouriteLocations();
      }
    }
  }
}

function showFavouriteLocations() {
  // get or create local storage object
  var locations = window.localStorage.getItem("tidesXFavourites");
  if (locations == null) {
    window.localStorage.setItem("tidesXFavourites", "[]")
    locations = [];
  } else {
    locations = JSON.parse(locations);
  }

  // if no favourites, alert user then return
  if (locations.length == 0) {
    document.getElementById("homeTab").innerHTML = "Your favourite locations will appear here once you've chosen some.";
    return;
  } else {
    document.getElementById("homeTab").innerHTML = "";
  }

  // if sort is on in settings, sort locations alphabetically
  if (JSON.parse(window.localStorage.getItem("tidesXSettings"))[0].sortSetting) {
    locations.sort();
  }

  // add favourite placeholders to page
  locations.forEach(function (loc, index) {
    document.getElementById("homeTab").innerHTML += favouritesHTML
      .replace(/{shortLocationName}/g, loc)
      .replace("{locationName}", sources[loc].fullName);
    requestTideTimes(loc, mode = "favouritesPage"); // get tide times to fill in placeholders
  });
}

var shownLocation = ""; // current location name

function loadLocationTab(location) {
  // prepare page for location change
  shownLocation = location;
  document.getElementById("todayTides").innerHTML = '<img src="images/loading.gif">';
  document.getElementById("tomorrowTides").innerHTML = '<img src="images/loading.gif">';
  changeTab("location");

  // change the shown name
  document.getElementById("titleBar").innerHTML = sources[location].fullName;

  // if in favourites, add option to remove, otherwise option to add
  document.getElementById("favouritesButton").innerHTML = JSON.parse(window.localStorage.getItem("tidesXFavourites")).includes(location)
    ? "Unfavourite"
    : "Favourite";

  // get and then render tide times for today and tomorrow
  requestTideTimes(location, "today");
  requestTideTimes(location, "tomorrow");
}

function updateFavourites() {
  var currentLS = JSON.parse(window.localStorage.getItem("tidesXFavourites"));
  if (currentLS.includes(shownLocation)) { // if location to change is in favourites, remove it
    currentLS.splice(currentLS.indexOf(shownLocation), 1);
    window.localStorage.setItem("tidesXFavourites", JSON.stringify(currentLS));
    document.getElementById("favouritesButton").innerHTML = "Favourite";
  } else { // if location to change isn't in favourites, add it
    currentLS.push(shownLocation);
    window.localStorage.setItem("tidesXFavourites", JSON.stringify(currentLS));
    document.getElementById("favouritesButton").innerHTML = "Unfavourite";
  }
  showFavouriteLocations();
}

function updateSearch() {
  var searchString = document.getElementById("searchInput").value;
  if (searchString.length < 2) { // if too many results ask for more characters
    document.getElementById("searchResults").innerHTML = 'Type a few characters to search coastal locations, or <u onclick="updateSearchNear();">tap here</u> to find your closest location.';
  } else { // perform search
    var resultHTML = "";
    Object.keys(sources).forEach(function (source) {
      if (sources[source].fullName.toLowerCase().includes(searchString.toLowerCase())) {
        resultHTML += "<span onclick='loadLocationTab(\"" + source + "\");'>" + sources[source].fullName + "</span>";
      }
    });
    document.getElementById("searchResults").innerHTML = resultHTML;
  }
}

function updateSearchNear() {
  navigator.geolocation.getCurrentPosition(function (position) {
    let closest;
    let distance = 2 ** 16;

    if (position.coords.latitude < 49 || position.coords.latitude > 61 || position.coords.longitude < -8 || position.coords.longitude > 4) {
      document.getElementById("searchResults").innerHTML = "Type a few characters to search coastal locations.<br><br>TidesX is only available for the UK, and we've detected that you're currently outside the UK. If this is incorrect, please open an issue on GitHub.";
      return;
    }

    Object.keys(sources).forEach(function (source) {
      let distanceThisSource = Math.sqrt((position.coords.latitude - sources[source].coords[0]) ** 2 + (position.coords.longitude - sources[source].coords[1]) ** 2);
      if (distanceThisSource < distance) {
        closest = source;
        distance = distanceThisSource;
      }
    });

    loadLocationTab(closest);
  }, function (err) {
    document.getElementById("searchResults").innerHTML = "Type a few characters to search coastal locations.<br><br>An error occured during geolocation; please search for your location instead.";
  });
}

function keyboardResize(keyboardUp) {
  // prevent resize event from messing up page
  if (keyboardUp) {
    document.documentElement.style.setProperty("overflow", "auto");
    var metaViewport = document.querySelector("meta[name=viewport]")
    metaViewport.setAttribute("content", "height=" + initialHeight + ", width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
  } else {
    var metaViewport = document.querySelector("meta[name=viewport]")
    metaViewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
  }
}

function changeSetting(setting) {
  var settings = JSON.parse(window.localStorage.getItem("tidesXSettings"));
  if (setting == "sort") {
    settings[0].sortSetting = !settings[0].sortSetting;
  } else if (setting == "cache") {
    settings[0].cacheSetting = !settings[0].cacheSetting;
  } else if (setting == "darkmode") {
    settings[0].darkModeSetting = !settings[0].darkModeSetting;
    if (settings[0].darkModeSetting) {
      document.body.className = "darkMode";
      document.querySelector("meta[name='theme-color']").setAttribute("content", "#334");
    } else {
      document.body.className = "lightMode";
      document.querySelector("meta[name='theme-color']").setAttribute("content", "#33b4ff");
    }
  }
  console.log(settings);
  window.localStorage.setItem("tidesXSettings", JSON.stringify(settings));
  if (setting == "sort") {
    showFavouriteLocations();
  }
}

function toggleSubTab(tab) {
  if (tab == "extra") { // show extra info
    document.getElementById("mainLocationInfo").className = "subTab";
    document.getElementById("extraLocationInfo").className = "subTab subTabActive";
    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);

    // for 5 days from the day after tomorrow, format their dates into tidetimes.org.uk's format then request and render them
    for (let i = 0; i < 5; i++) {
      currentDate.setDate(currentDate.getDate() + 1);
      var dateString = currentDate.getFullYear().toString() + (currentDate.getMonth() + 1).toString().padStart(2, "0") + currentDate.getDate().toString().padStart(2, "0");
      console.log(dateString);
      requestTideTimes(shownLocation, dateString);
    }

    // add moon phase information
    currentDate = new Date();
    var mPhase = moonPhase(parseInt(currentDate.getDate()), parseInt(currentDate.getMonth()) + 1, parseInt(currentDate.getFullYear()));
    document.getElementById("moonInfo").innerHTML = "<span>Moon Phase:</span><br><img src='images/moon/" + mPhase.toString() + ".svg'> " + moonPhases[mPhase];
  } else { // return to standard tab and remove extra info
    document.getElementById("mainLocationInfo").className = "subTab subTabActive";
    document.getElementById("extraLocationInfo").className = "subTab";
    document.getElementById("extraDates").innerHTML = '<img src="images/loading.gif" style="height:10vh;">';
  }
}

function showExtraDates() {
  if (extraDatesHTML.length == 5) { // if all extra dates have loaded, show them then reset the variable
    extraDatesHTML.sort();
    document.getElementById("extraDates").innerHTML = extraDatesHTML.join("");
    extraDatesHTML = [];
  }
}