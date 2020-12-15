var favouritesHTML = '<div class="favourite" id="favourite-{shortLocationName}" onclick="loadLocationTab(\'{shortLocationName}\')"><span>{locationName}</span><table><tr class="times"><td><img src="images/loading.gif"></td><td><img src="images/loading.gif"></td></tr><tr class="names"><td>Next High</td><td>Next Low</td></tr></table></div>';
var innerFavouritesHTML = '<span>{locationName}</span><table><tr class="times"><td>{next1}</td><td>{next2}</td></tr><tr class="names"><td>Next {1}</td><td>Next {2}</td></tr></table>';
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var currentLocation = "";
var initialHeight;
// Add event listener to set up everything when page loads
window.addEventListener("load", function () {
    initialHeight = window.innerHeight; // Store the height of the window in a variable to later fix Android keyboard resizing bug
    if ('serviceWorker' in navigator)
        navigator.serviceWorker.register('service_worker.js', { scope: "/TidesX/" }); // Set up PWA
    UserPreferences.initPrefs(); // Read the settings from local storage and apply them
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
        document.getElementById("homeTab").innerHTML += favouritesHTML
            .replace(/{shortLocationName}/g, loc)
            .replace("{locationName}", StationTools.nameFromId(loc).toLowerCase());
        requestFavouriteLocationAsync(loc); // get tide times to fill in placeholders
    });
}
// Make request to upade a favourite location
function requestFavouriteLocationAsync(stationId) {
    var station = StationTools.stationFromId(stationId);
    API.getTides(stationId).then(function (tideTimes) {
        var tideComingIn = tideTimes[0].EventType == "HighWater";
        var tide1Date = new Date(Date.parse(tideTimes[0].DateTime));
        var tide2Date = new Date(Date.parse(tideTimes[1].DateTime));
        document.getElementById("favourite-" + stationId).innerHTML = innerFavouritesHTML
            .replace("{locationName}", "<i class='fas fa-arrow-" + (tideComingIn ? "up" : "down") + "'></i> " + station.properties.Name.toLowerCase())
            .replace("{next1}", tide1Date.getHours().toString().padStart(2, "0") + ":" + tide1Date.getMinutes().toString().padStart(2, "0"))
            .replace("{next2}", tide2Date.getHours().toString().padStart(2, "0") + ":" + tide2Date.getMinutes().toString().padStart(2, "0"))
            .replace("{1}", tideComingIn ? "High" : "Low")
            .replace("{2}", tideComingIn ? "Low" : "High");
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
        currentLocation = "";
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
function initLocationTab(location) {
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
