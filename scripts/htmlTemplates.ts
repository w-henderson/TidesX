namespace HTML {
  export function createFavourite(location: Station): HTMLElement {
    let div = document.createElement("div");
    div.className = "favourite";
    div.onclick = ((id: string) => { initLocationTab(id); }).bind(this, location.properties.Id);

    let span = document.createElement("span");
    span.textContent = location.properties.Name.toLowerCase();
    div.appendChild(span);

    let table = document.createElement("table");
    let row1 = document.createElement("tr");
    let row2 = document.createElement("tr");
    row1.className = "times";
    row2.className = "names";

    let row1td = document.createElement("td");
    let img = document.createElement("img");
    img.src = "images/loading.gif";
    row1td.appendChild(img);

    row1.appendChild(row1td);
    row1.appendChild(row1td.cloneNode(true));

    let row2high = document.createElement("td");
    let row2low = document.createElement("td");
    row2high.textContent = "Next High";
    row2low.textContent = "Next Low";

    row2.appendChild(row2high);
    row2.appendChild(row2low);
    table.appendChild(row1);
    table.appendChild(row2);
    div.appendChild(table);

    return div;
  }

  export function updateFavourite(element: HTMLElement, info: {
    locationName: string,
    tideDirection: string,
    next1: string,
    next2: string,
    tide1type: string,
    tide2type: string
  }): void {
    element.firstChild.textContent = ""; // change span text
    let icon = document.createElement("i");
    if (info.tideDirection != undefined) icon.className = `fas fa-arrow-${info.tideDirection}`;
    else icon.className = "fa fa-minus";
    element.firstChild.appendChild(icon);
    element.firstChild.appendChild(document.createTextNode(" " + info.locationName));

    element.lastChild.firstChild.firstChild.textContent = info.next1; // change first time
    element.lastChild.firstChild.lastChild.textContent = info.next2; // change second time
    element.lastChild.lastChild.firstChild.textContent = "Next " + info.tide1type; // change first time comment
    element.lastChild.lastChild.lastChild.textContent = "Next " + info.tide2type; // change second time comment
  }

  export function createTideTime(info: {
    past: boolean,
    direction: string,
    time: string,
    height: string | undefined
  }): HTMLElement {
    let a = document.createElement("a");
    let directionText = document.createTextNode(info.direction + ": ");
    let timeSpan = document.createElement("span");

    timeSpan.textContent = `${info.time} (${info.height}m)`;
    a.style.opacity = info.past ? "25%" : "100%";

    a.appendChild(directionText);
    a.appendChild(timeSpan);

    return a;
  }

  export function updateMoonPhase(element: HTMLElement, moonPhase: number): void {
    element.innerHTML = "";

    let titleSpan = document.createElement("span");
    let br = document.createElement("br");
    let image = document.createElement("img");
    let text = document.createTextNode(" " + moonPhases[moonPhase]);
    image.src = `images/moon/${moonPhase}.svg`;
    titleSpan.textContent = "Moon Phase:";

    element.appendChild(titleSpan);
    element.appendChild(br);
    element.appendChild(image);
    element.appendChild(text);
  }

  export function setLoading(element: HTMLElement, height: boolean = false) {
    let loadingImage = document.createElement("img");
    loadingImage.src = "images/loading.gif";
    if (height) loadingImage.style.height = "10vh";

    element.innerHTML = "";
    element.appendChild(loadingImage);
  }

  export function updateExtraInfo(element: HTMLElement, tides: TidalEvent[]): void {
    element.innerHTML = "";

    let div = document.createElement("div");
    div.className = "detailedTides";

    tides.forEach((tide: TidalEvent) => {
      let dateObj = new Date(Date.parse(tide.Date));
      let nowDateObj = new Date();
      nowDateObj.setHours(0, 0, 0, 0);

      if (dateObj.getTime() < nowDateObj.getTime()) return;

      let timeObj;
      if (tide.DateTime !== undefined) timeObj = new Date(Date.parse(tide.DateTime + "Z"));
      let dateStr = `${days[dateObj.getDay()]} ${dateObj.getDate()} ${months[dateObj.getMonth()]}`; // e.g. "Sunday 20 December"

      if (element.children.length == 0 || element.children[element.children.length - 2].textContent !== dateStr) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = dateStr;
        element.appendChild(titleSpan);
        let detailedTides = div.cloneNode();
        element.appendChild(detailedTides);
      }

      let tideType = tide.EventType === "HighWater" ? "High" : "Low";
      let infoSpan = document.createElement("span");

      if (tide.Height !== undefined && timeObj !== undefined) { // basically if not a low tide in an estuary
        infoSpan.textContent = `${timeObj.getHours().toString().padStart(2, "0")}:${timeObj.getMinutes().toString().padStart(2, "0")} (${tide.Height.toFixed(2)}m)`;

        element.lastChild.appendChild(document.createTextNode(tideType + ": "));
        element.lastChild.appendChild(infoSpan);
        element.lastChild.appendChild(document.createElement("br"));
      }
    });
  }
}