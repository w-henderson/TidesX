var UserPreferences;
(function (UserPreferences) {
    UserPreferences.settings = {
        "sortSetting": false,
        "cacheSetting": false,
        "darkModeSetting": false
    };
    // Function to toggle a given setting and then update accordingly
    function changeSetting(setting) {
        UserPreferences.settings = JSON.parse(window.localStorage.getItem("tidesXSettings"));
        if (setting == "sort") {
            UserPreferences.settings.sortSetting = !UserPreferences.settings.sortSetting;
        }
        else if (setting == "cache") {
            UserPreferences.settings.cacheSetting = !UserPreferences.settings.cacheSetting;
        }
        else if (setting == "darkmode") {
            UserPreferences.settings.darkModeSetting = !UserPreferences.settings.darkModeSetting;
            if (UserPreferences.settings.darkModeSetting) {
                document.body.className = "darkMode";
                document.querySelector("meta[name='theme-color']").setAttribute("content", "#334");
            }
            else {
                document.body.className = "lightMode";
                document.querySelector("meta[name='theme-color']").setAttribute("content", "#33b4ff");
            }
        }
        window.localStorage.setItem("tidesXSettings", JSON.stringify(UserPreferences.settings));
        if (setting == "sort") {
            initFavouritesPage();
        }
    }
    UserPreferences.changeSetting = changeSetting;
    // Function to initialise preferences, called on page load from display.ts
    function initPrefs() {
        if (window.localStorage.getItem("tidesXSettings") != null) {
            UserPreferences.settings = JSON.parse(window.localStorage.getItem("tidesXSettings"));
            document.getElementById("sortSetting").checked = UserPreferences.settings.sortSetting;
            document.getElementById("cacheSetting").checked = UserPreferences.settings.cacheSetting;
            document.getElementById("darkModeSetting").checked = UserPreferences.settings.darkModeSetting;
            if (UserPreferences.settings.darkModeSetting) {
                document.body.className = "darkMode";
                document.querySelector("meta[name='theme-color']").setAttribute("content", "#334");
            }
        }
        else {
            window.localStorage.setItem("tidesXSettings", '{"sortSetting":false,"cacheSetting":false,"darkModeSetting":false}');
        }
    }
    UserPreferences.initPrefs = initPrefs;
    function getFavourites() {
        var locationString = window.localStorage.getItem("tidesXFavourites");
        if (locationString == null) {
            window.localStorage.setItem("tidesXFavourites", "[]");
            return [];
        }
        else {
            return JSON.parse(locationString);
        }
    }
    UserPreferences.getFavourites = getFavourites;
    function clearFavourites() {
        window.localStorage.setItem("tidesXFavourites", "[]");
        alert("Favourites cleared.");
        initFavouritesPage();
    }
    UserPreferences.clearFavourites = clearFavourites;
    function clearAll() {
        window.localStorage.removeItem('tidesXFavourites');
        window.localStorage.removeItem('tidesXSettings');
        alert('All user data removed.');
        window.location.reload();
    }
    UserPreferences.clearAll = clearAll;
    function updateFavourites() {
        var currentLS = JSON.parse(window.localStorage.getItem("tidesXFavourites"));
        if (currentLS.includes(currentLocation.properties.Id)) { // if location to change is in favourites, remove it
            currentLS.splice(currentLS.indexOf(currentLocation.properties.Id), 1);
            window.localStorage.setItem("tidesXFavourites", JSON.stringify(currentLS));
            document.getElementById("favouritesButton").innerHTML = "Favourite";
        }
        else { // if location to change isn't in favourites, add it
            currentLS.push(currentLocation.properties.Id);
            window.localStorage.setItem("tidesXFavourites", JSON.stringify(currentLS));
            document.getElementById("favouritesButton").innerHTML = "Unfavourite";
        }
        initFavouritesPage();
    }
    UserPreferences.updateFavourites = updateFavourites;
})(UserPreferences || (UserPreferences = {}));
