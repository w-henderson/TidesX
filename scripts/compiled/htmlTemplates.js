/* const favouritesHTML = '
<div class="favourite" id="favourite-{shortLocationName}" onclick="initLocationTab(\'{shortLocationName}\')">
  <span>{locationName}</span>
  <table>
    <tr class="times">
      <td><img src="images/loading.gif"></td>
      <td><img src="images/loading.gif"></td>
    </tr>
    <tr class="names">
      <td>Next High</td>
      <td>Next Low</td>
    </tr>
  </table>
</div>';

const innerFavouritesHTML = '
<span>{locationName}</span>
<table>
  <tr class="times">
    <td>{next1}</td>
    <td>{next2}</td>
  </tr>
  <tr class="names">
    <td>Next {1}</td>
    <td>Next {2}</td>
  </tr>
</table>'; */
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
        icon.className = "fas fa-arrow-" + info.tideDirection;
        element.firstChild.appendChild(icon);
        element.firstChild.appendChild(document.createTextNode(" " + info.locationName));
        element.lastChild.firstChild.firstChild.textContent = info.next1; // change first time
        element.lastChild.firstChild.lastChild.textContent = info.next2; // change second time
        element.lastChild.lastChild.firstChild.textContent = "Next " + info.tide1type; // change first time comment
        element.lastChild.lastChild.lastChild.textContent = "Next " + info.tide2type; // change second time comment
    }
    HTML.updateFavourite = updateFavourite;
    /* outputHTML += `<a${pastString}>${tideDirection}: <span>${tideDate.getHours().toString().padStart(2, "0")}:${tideDate.getMinutes().toString().padStart(2, "0")} (${tides[i].Height.toFixed(2)}m)</span></a><br>`; */
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
})(HTML || (HTML = {}));
