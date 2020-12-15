// Update search results
function updateSearch(): void {
  let searchString = (<HTMLInputElement>document.getElementById("searchInput")).value;
  if (searchString.length < 2) { // If too many results ask for more characters
    document.getElementById("searchResults").innerHTML = 'Type a few characters to search coastal locations, or <u onclick="updateSearchNear();">tap here</u> to find your closest location.';
  } else { // Perform search
    let locations: Station[] = [];
    stationsJson.forEach((station: Station) => {
      if (station.properties.Name.toLowerCase().includes(searchString.toLowerCase())) {
        locations.push(station);
      }
    });
    locations = locations.sort((a, b) => {
      if (a.properties.Name < b.properties.Name) return -1;
      if (a.properties.Name == b.properties.Name) return 0;
      if (a.properties.Name > b.properties.Name) return 1;
    });
    let resultHTML = "";
    locations.forEach((station: Station) => {
      resultHTML += "<span onclick='initLocationTab(\"" + station.properties.Id + "\");'>" + station.properties.Name.toLowerCase() + "</span>";
    });
    document.getElementById("searchResults").innerHTML = resultHTML;
  }
}

// Update search results based on geolocation
function updateSearchNear() {
  navigator.geolocation.getCurrentPosition(function (position) {
    let closest: Station;
    let distance = 2 ** 16;

    if (position.coords.latitude < 49 || position.coords.latitude > 61 || position.coords.longitude < -8 || position.coords.longitude > 4) {
      document.getElementById("searchResults").innerHTML = "Type a few characters to search coastal locations.<br><br>TidesX is only available for the UK, and we've detected that you're currently outside the UK. If this is incorrect, please open an issue on GitHub.";
      return;
    }

    stationsJson.forEach(function (source: Station) {
      let distanceThisSource = Math.sqrt((position.coords.latitude - source.geometry.coordinates[1]) ** 2 + (position.coords.longitude - source.geometry.coordinates[0]) ** 2);
      if (distanceThisSource < distance) {
        closest = source;
        distance = distanceThisSource;
      }
    });

    initLocationTab(closest.properties.Id);
  }, function (err) {
    document.getElementById("searchResults").innerHTML = "Type a few characters to search coastal locations.<br><br>An error occured during geolocation; please search for your location instead.";
  });
}