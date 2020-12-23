namespace HTMLRefs {
  export var refs: any = {};
  export var tabs: any = {};

  export function updateRefs() {
    refs.todayTides = document.querySelector("#todayTides");
    refs.tomorrowTides = document.querySelector("#tomorrowTides");
    refs.titleBar = document.querySelector("#titleBar");
    refs.favouritesButton = document.querySelector("#favouritesButton");
    refs.currentHeight = document.querySelector("#currentHeight");
    refs.mainLocationInfo = document.querySelector("#mainLocationInfo");
    refs.extraLocationInfo = document.querySelector("#extraLocationInfo");
    refs.moonInfo = document.querySelector("#moonInfo");
    refs.extraDates = document.querySelector("#extraDates");
    refs.sunrise = document.querySelector("#sunrise");
    refs.sunset = document.querySelector("#sunset");
    refs.continuousMessage = document.querySelector("#continuousMessage");

    tabs.home = document.querySelector("#homeTab");
    tabs.search = document.querySelector("#searchTab");
    tabs.settings = document.querySelector("#settingsTab");
    tabs.location = document.querySelector("#locationTab");

    tabs.buttons = {};
    tabs.buttons.home = document.querySelector("#homeTabButton");
    tabs.buttons.search = document.querySelector("#searchTabButton");
    tabs.buttons.settings = document.querySelector("#settingsTabButton");
  }
}