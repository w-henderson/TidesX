var API;
(function (API) {
    var REQUEST_URL = "https://0agi9hnrm8.execute-api.eu-west-2.amazonaws.com/default/getTideTimes?id={}";
    // Returns a promise which resolves to an array TidalEvents for a specific station
    function getTides(stationId) {
        return window.fetch(REQUEST_URL.replace("{}", stationId)).then(function (data) {
            return data.json();
        });
    }
    API.getTides = getTides;
})(API || (API = {}));
var StationTools;
(function (StationTools) {
    // Get full name of a station from its ID
    function stationFromId(id) {
        for (var i = 0; i < stationsJson.length; i++) {
            if (stationsJson[i].properties.Id == id)
                return stationsJson[i];
        }
    }
    StationTools.stationFromId = stationFromId;
    function nameFromId(id) {
        return stationFromId(id).properties.Name;
    }
    StationTools.nameFromId = nameFromId;
})(StationTools || (StationTools = {}));
