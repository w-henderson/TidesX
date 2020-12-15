var API;
(function (API) {
    var SUBSCRIPTION_KEY = "251a32929be04983aaae6ef03c249e85";
    var CORS_PROXY = "http://cors-anywhere-mirror.herokuapp.com/";
    var REQUEST_URL = "https://admiraltyapi.azure-api.net/uktidalapi/api/V1/Stations/{}/TidalEvents";
    // Returns a promise which resolves to an array TidalEvents for a specific station
    function getTides(stationId) {
        return window.fetch(CORS_PROXY + REQUEST_URL.replace("{}", stationId), {
            headers: { "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY }
        }).then(function (data) {
            return data.json();
        });
    }
    API.getTides = getTides;
})(API || (API = {}));
