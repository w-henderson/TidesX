namespace UserPreferences {
  export var settings: UserPrefs = {
    "sortSetting": false,
    "cacheSetting": false,
    "darkModeSetting": false
  };

  // Function to toggle a given setting and then update accordingly
  export function changeSetting(setting: string): void {
    settings = JSON.parse(window.localStorage.getItem("tidesXSettings"));
    if (setting == "sort") {
      settings.sortSetting = !settings.sortSetting;
    } else if (setting == "cache") {
      settings.cacheSetting = !settings.cacheSetting;
    } else if (setting == "darkmode") {
      settings.darkModeSetting = !settings.darkModeSetting;
      if (settings.darkModeSetting) {
        document.body.className = "darkMode";
        document.querySelector("meta[name='theme-color']").setAttribute("content", "#334");
      } else {
        document.body.className = "lightMode";
        document.querySelector("meta[name='theme-color']").setAttribute("content", "#33b4ff");
      }
    }
    window.localStorage.setItem("tidesXSettings", JSON.stringify(settings));
    if (setting == "sort") {
      initFavouritesPage();
    }
  }

  // Function to initialise preferences, called on page load from display.ts
  export function initPrefs(): void {
    if (window.localStorage.getItem("tidesXSettings") != null) {
      settings = JSON.parse(window.localStorage.getItem("tidesXSettings"));
      (<HTMLInputElement>document.getElementById("sortSetting")).checked = settings.sortSetting;
      (<HTMLInputElement>document.getElementById("cacheSetting")).checked = settings.cacheSetting;
      (<HTMLInputElement>document.getElementById("darkModeSetting")).checked = settings.darkModeSetting;
      if (settings.darkModeSetting) {
        document.body.className = "darkMode";
        document.querySelector("meta[name='theme-color']").setAttribute("content", "#334");
      }
    } else {
      window.localStorage.setItem("tidesXSettings", '{"sortSetting":false,"cacheSetting":false,"darkModeSetting":false}');
    }
  }

  export function getFavourites(): string[] {
    var locationString: string = window.localStorage.getItem("tidesXFavourites");
    if (locationString == null) {
      window.localStorage.setItem("tidesXFavourites", "[]")
      return [];
    } else {
      return JSON.parse(locationString);
    }
  }
}