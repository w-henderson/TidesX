var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var currentLocation;
var initialHeight;
// Add event listener to set up everything when page loads
window.addEventListener("load", function () {
    initialHeight = window.innerHeight; // Store the height of the window in a variable to later fix Android keyboard resizing bug
    if ('serviceWorker' in navigator)
        navigator.serviceWorker.register('service_worker.js', { scope: "/TidesX/" }); // Set up PWA
    UserPreferences.initPrefs(); // Read the settings from local storage and apply them
    alertForChangedFavourites();
    initFavouritesPage(); // Initialise and populate the favourites page
});
// Initialise the favourites page and make requests to populate it
function initFavouritesPage() {
    // Get or create local storage object
    var favouriteLocations = UserPreferences.getFavourites();
    // If no favourites, alert user
    var homeTab = document.getElementById("homeTab");
    if (favouriteLocations.length == 0)
        homeTab.innerHTML = "Your favourite locations will appear here once you've chosen some.";
    else
        homeTab.innerHTML = "";
    // if sort is on in settings, sort locations alphabetically
    if (UserPreferences.settings.sortSetting)
        favouriteLocations.sort();
    // add favourite placeholders to page
    favouriteLocations.forEach(function (loc) {
        var favourite = HTML.createFavourite(StationTools.stationFromId(loc));
        document.querySelector("#homeTab").appendChild(favourite);
        requestFavouriteLocationAsync(favourite, loc);
    });
}
// Make request to upade a favourite location
function requestFavouriteLocationAsync(favourite, stationId) {
    var station = StationTools.stationFromId(stationId);
    API.getTides(stationId).then(function (tideTimes) {
        var futureTideTimes = [];
        var now = new Date().getTime();
        tideTimes.forEach(function (tide) {
            if (Date.parse(tide.DateTime) > now) {
                futureTideTimes.push(tide);
            }
        });
        var tideComingIn = futureTideTimes[0].EventType == "HighWater";
        var tide1Date = new Date(Date.parse(futureTideTimes[0].DateTime));
        var tide2Date = new Date(Date.parse(futureTideTimes[1].DateTime));
        HTML.updateFavourite(favourite, {
            locationName: station.properties.Name.toLowerCase(),
            tideDirection: tideComingIn ? "up" : "down",
            next1: tide1Date.getHours().toString().padStart(2, "0") + ":" + tide1Date.getMinutes().toString().padStart(2, "0"),
            next2: tide2Date.getHours().toString().padStart(2, "0") + ":" + tide2Date.getMinutes().toString().padStart(2, "0"),
            tide1type: futureTideTimes[0].EventType === "HighWater" ? "High" : "Low",
            tide2type: futureTideTimes[0].EventType === "HighWater" ? "Low" : "High"
        });
    });
}
function initLocationTab(locationId) {
    // prepare page for location change
    currentLocation = StationTools.stationFromId(locationId);
    var loadingIcon = document.createElement("img");
    loadingIcon.src = "images/loading.gif";
    var todayTides = document.querySelector("#todayTides");
    var tomorrowTides = document.querySelector("#tomorrowTides");
    todayTides.innerHTML = "";
    tomorrowTides.innerHTML = "";
    todayTides.appendChild(loadingIcon);
    tomorrowTides.appendChild(loadingIcon.cloneNode(true));
    changeTab("location");
    // change the shown name
    document.querySelector("#titleBar").textContent = currentLocation.properties.Name.toLowerCase();
    // if in favourites, add option to remove, otherwise option to add
    document.getElementById("favouritesButton").innerHTML = JSON.parse(window.localStorage.getItem("tidesXFavourites")).includes(currentLocation.properties.Id)
        ? "Unfavourite"
        : "Favourite";
    // get and then render tide times for today and tomorrow
    requestTideTimesAsync(currentLocation, "today");
    requestTideTimesAsync(currentLocation, "tomorrow");
}
function requestTideTimesAsync(location, day) {
    API.getTides(location.properties.Id).then(function (tides) {
        document.querySelector("#" + day + "Tides").innerHTML = "";
        for (var i = 0; i < tides.length; i++) {
            var tideDate = new Date(Date.parse(tides[i].DateTime));
            var currentTime = new Date();
            if (day == "today" && tideDate.getDate() == currentTime.getDate()) {
                document.querySelector("#todayTides").appendChild(HTML.createTideTime({
                    past: currentTime.getTime() - tideDate.getTime() > 0,
                    direction: tides[i].EventType == "HighWater" ? "High" : "Low",
                    time: tideDate.getHours().toString().padStart(2, "0") + ":" + tideDate.getMinutes().toString().padStart(2, "0"),
                    height: tides[i].Height.toFixed(2)
                }));
                document.querySelector("#todayTides").appendChild(document.createElement("br"));
            }
            else if (day == "tomorrow" && (tideDate.getDate() == currentTime.getDate() + 1 || (tideDate.getDate() == 1 && tideDate.getMonth() != currentTime.getMonth()))) {
                document.querySelector("#tomorrowTides").appendChild(HTML.createTideTime({
                    past: false,
                    direction: tides[i].EventType == "HighWater" ? "High" : "Low",
                    time: tideDate.getHours().toString().padStart(2, "0") + ":" + tideDate.getMinutes().toString().padStart(2, "0"),
                    height: tides[i].Height.toFixed(2)
                }));
                document.querySelector("#tomorrowTides").appendChild(document.createElement("br"));
            }
        }
        heightInterpolation(tides);
    });
}
function heightInterpolation(tides) {
    var timeNow = new Date();
    var previousTide;
    var nextTide;
    var futureTideJustInCase;
    for (var i = 0; i < tides.length; i++) {
        if (i > 0)
            previousTide = tides[i - 1];
        nextTide = tides[i];
        futureTideJustInCase = tides[i + 1];
        if (new Date(Date.parse(nextTide.DateTime)).getTime() > timeNow.getTime())
            break;
    }
    var nextTideTime = new Date(Date.parse(nextTide.DateTime)).getTime();
    var nextTideHeight = nextTide.Height;
    var previousTideTime;
    var previousTideHeight;
    if (previousTide == undefined) {
        previousTideTime = nextTideTime - (1000 * 60 * 60 * 6);
        previousTideHeight = futureTideJustInCase.Height;
    }
    else {
        previousTideTime = new Date(Date.parse(previousTide.DateTime)).getTime();
        previousTideHeight = previousTide.Height;
    }
    // do actual maths
    var linearInterpolate = (timeNow.getTime() - previousTideTime) / (nextTideTime - previousTideTime); // 0 - 1 linear between times
    var sineInterpolate = (Math.sin((linearInterpolate - 0.5) * 180 * Math.PI / 180) + 1) / 2; // 0 - 1 sine between heights (also rad conversion)
    var estimatedHeight = previousTideHeight + sineInterpolate * (nextTideHeight - previousTideHeight); // estimation of current height using sine interpolation
    document.querySelector("#currentHeight").textContent = (Math.round(estimatedHeight * 100) / 100).toString() + "m";
}
function initSubTab(subtab) {
    if (subtab == "extra") { // show extra info
        document.getElementById("mainLocationInfo").className = "subTab";
        document.getElementById("extraLocationInfo").className = "subTab subTabActive";
        // add moon phase information
        var currentDate = new Date();
        var mPhase = moonPhase(currentDate.getDate(), currentDate.getMonth() + 1, currentDate.getFullYear());
        document.getElementById("moonInfo").innerHTML = "<span>Moon Phase:</span><br><img src='images/moon/" + mPhase.toString() + ".svg'> " + moonPhases[mPhase];
        requestExtraTideTimesAsync(currentLocation);
    }
    else { // return to standard tab and remove extra info
        document.getElementById("mainLocationInfo").className = "subTab subTabActive";
        document.getElementById("extraLocationInfo").className = "subTab";
        document.getElementById("extraDates").innerHTML = '<img src="images/loading.gif" style="height:10vh;">';
    }
}
function requestExtraTideTimesAsync(location) {
    API.getTides(location.properties.Id).then(function (tides) {
        var currentWorkingDate;
        var outputHTML = "";
        tides.forEach(function (tide) {
            var dateObj = new Date(Date.parse(tide.DateTime));
            var dateStr = days[dateObj.getDay()] + " " + dateObj.getDate() + " " + months[dateObj.getMonth()];
            if (dateStr != currentWorkingDate && currentLocation != undefined) {
                outputHTML += "</div><span>" + dateStr + "</span><div class=\"detailedTides\">";
            }
            else if (dateStr != currentWorkingDate) {
                outputHTML += "<span>" + dateStr + "</span><div class=\"detailedTides\">";
            }
            currentWorkingDate = dateStr;
            var tideDirection = tide.EventType == "HighWater" ? "High" : "Low";
            outputHTML += tideDirection + ": <span>" + dateObj.getHours().toString().padStart(2, "0") + ":" + dateObj.getMinutes().toString().padStart(2, "0") + " (" + tide.Height.toFixed(2) + "m)</span><br>";
        });
        document.getElementById("extraDates").innerHTML = outputHTML;
    });
}
// Switch tab
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
        }
        else {
            document.getElementById("titleBar").innerHTML = "TidesX";
            if (!UserPreferences.settings.cacheSetting) {
                initFavouritesPage();
            }
        }
    }
}
// Prevent resize event from messing up page
function keyboardResize(keyboardOpen) {
    if (keyboardOpen) {
        document.documentElement.style.setProperty("overflow", "auto");
        var metaViewport = document.querySelector("meta[name=viewport]");
        metaViewport.setAttribute("content", "height=" + initialHeight + ", width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
    }
    else {
        var metaViewport = document.querySelector("meta[name=viewport]");
        metaViewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
    }
}
function alertForChangedFavourites() {
    if (window.localStorage.getItem("tidesXMigrated") == undefined && window.localStorage.getItem("tidesXFavourites") != undefined) {
        window.localStorage.setItem("tidesXFavourites", "[]");
        window.localStorage.setItem("tidesXMigrated", "true");
        alert("TidesX has had a big update! We've completely redesigned our code, making it quicker and more reliable. However, we've also changed how we store favourites, meaning your favourites have been cleared. We're sorry for the inconvenience, but you'll just need to use the search feature to put them back again. We hope this update improves your TidesX experience!");
    }
}
