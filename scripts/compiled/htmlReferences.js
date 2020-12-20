var HTMLRefs;
(function (HTMLRefs) {
    HTMLRefs.refs = {};
    HTMLRefs.tabs = {};
    function updateRefs() {
        HTMLRefs.refs.todayTides = document.querySelector("#todayTides");
        HTMLRefs.refs.tomorrowTides = document.querySelector("#tomorrowTides");
        HTMLRefs.refs.titleBar = document.querySelector("#titleBar");
        HTMLRefs.refs.favouritesButton = document.querySelector("#favouritesButton");
        HTMLRefs.refs.currentHeight = document.querySelector("#currentHeight");
        HTMLRefs.refs.mainLocationInfo = document.querySelector("#mainLocationInfo");
        HTMLRefs.refs.extraLocationInfo = document.querySelector("#extraLocationInfo");
        HTMLRefs.refs.moonInfo = document.querySelector("#moonInfo");
        HTMLRefs.refs.extraDates = document.querySelector("#extraDates");
        HTMLRefs.refs.sunrise = document.querySelector("#sunrise");
        HTMLRefs.refs.sunset = document.querySelector("#sunset");
        HTMLRefs.tabs.home = document.querySelector("#homeTab");
        HTMLRefs.tabs.search = document.querySelector("#searchTab");
        HTMLRefs.tabs.settings = document.querySelector("#settingsTab");
        HTMLRefs.tabs.location = document.querySelector("#locationTab");
        HTMLRefs.tabs.buttons = {};
        HTMLRefs.tabs.buttons.home = document.querySelector("#homeTabButton");
        HTMLRefs.tabs.buttons.search = document.querySelector("#searchTabButton");
        HTMLRefs.tabs.buttons.settings = document.querySelector("#settingsTabButton");
    }
    HTMLRefs.updateRefs = updateRefs;
})(HTMLRefs || (HTMLRefs = {}));
