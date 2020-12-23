var HTML;
(function (HTML) {
    function createFavourite(location) {
        var div = document.createElement("div");
        div.className = "favourite";
        div.onclick = (function (id) { initLocationTab(id); }).bind(this, location.properties.Id);
        var span = document.createElement("span");
        span.textContent = location.properties.Name.toLowerCase();
        div.appendChild(span);
        var table = document.createElement("table");
        var row1 = document.createElement("tr");
        var row2 = document.createElement("tr");
        row1.className = "times";
        row2.className = "names";
        var row1td = document.createElement("td");
        var img = document.createElement("img");
        img.src = "images/loading.gif";
        row1td.appendChild(img);
        row1.appendChild(row1td);
        row1.appendChild(row1td.cloneNode(true));
        var row2high = document.createElement("td");
        var row2low = document.createElement("td");
        row2high.textContent = "Next High";
        row2low.textContent = "Next Low";
        row2.appendChild(row2high);
        row2.appendChild(row2low);
        table.appendChild(row1);
        table.appendChild(row2);
        div.appendChild(table);
        return div;
    }
    HTML.createFavourite = createFavourite;
    function updateFavourite(element, info) {
        element.firstChild.textContent = ""; // change span text
        var icon = document.createElement("i");
        if (info.tideDirection != undefined)
            icon.className = "fas fa-arrow-" + info.tideDirection;
        else
            icon.className = "fa fa-minus";
        element.firstChild.appendChild(icon);
        element.firstChild.appendChild(document.createTextNode(" " + info.locationName));
        element.lastChild.firstChild.firstChild.textContent = info.next1; // change first time
        element.lastChild.firstChild.lastChild.textContent = info.next2; // change second time
        element.lastChild.lastChild.firstChild.textContent = "Next " + info.tide1type; // change first time comment
        element.lastChild.lastChild.lastChild.textContent = "Next " + info.tide2type; // change second time comment
    }
    HTML.updateFavourite = updateFavourite;
    function createTideTime(info) {
        var a = document.createElement("a");
        var directionText = document.createTextNode(info.direction + ": ");
        var timeSpan = document.createElement("span");
        timeSpan.textContent = info.time + " (" + info.height + "m)";
        a.style.opacity = info.past ? "25%" : "100%";
        a.appendChild(directionText);
        a.appendChild(timeSpan);
        return a;
    }
    HTML.createTideTime = createTideTime;
    function updateMoonPhase(element, moonPhase) {
        element.innerHTML = "";
        var titleSpan = document.createElement("span");
        var br = document.createElement("br");
        var image = document.createElement("img");
        var text = document.createTextNode(" " + moonPhases[moonPhase]);
        image.src = "images/moon/" + moonPhase + ".svg";
        titleSpan.textContent = "Moon Phase:";
        element.appendChild(titleSpan);
        element.appendChild(br);
        element.appendChild(image);
        element.appendChild(text);
    }
    HTML.updateMoonPhase = updateMoonPhase;
    function setLoading(element, height) {
        if (height === void 0) { height = false; }
        var loadingImage = document.createElement("img");
        loadingImage.src = "images/loading.gif";
        if (height)
            loadingImage.style.height = "10vh";
        element.innerHTML = "";
        element.appendChild(loadingImage);
    }
    HTML.setLoading = setLoading;
    function updateExtraInfo(element, tides) {
        element.innerHTML = "";
        var div = document.createElement("div");
        div.className = "detailedTides";
        tides.forEach(function (tide) {
            var dateObj = new Date(Date.parse(tide.Date));
            var timeObj;
            if (tide.DateTime !== undefined)
                timeObj = new Date(Date.parse(tide.DateTime));
            var dateStr = days[dateObj.getDay()] + " " + dateObj.getDate() + " " + months[dateObj.getMonth()]; // e.g. "Sunday 20 December"
            if (element.children.length == 0 || element.children[element.children.length - 2].textContent !== dateStr) {
                var titleSpan = document.createElement("span");
                titleSpan.textContent = dateStr;
                element.appendChild(titleSpan);
                var detailedTides = div.cloneNode();
                element.appendChild(detailedTides);
            }
            var tideType = tide.EventType === "HighWater" ? "High" : "Low";
            var infoSpan = document.createElement("span");
            if (tide.Height !== undefined) { // basically if not a low tide in an estuary
                infoSpan.textContent = timeObj.getHours().toString().padStart(2, "0") + ":" + timeObj.getMinutes().toString().padStart(2, "0") + " (" + tide.Height.toFixed(2) + "m)";
                element.lastChild.appendChild(document.createTextNode(tideType + ": "));
                element.lastChild.appendChild(infoSpan);
                element.lastChild.appendChild(document.createElement("br"));
            }
        });
    }
    HTML.updateExtraInfo = updateExtraInfo;
})(HTML || (HTML = {}));
