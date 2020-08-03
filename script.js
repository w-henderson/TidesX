var globfortesting;

var favouritesHTML = '<div class="favourite" id="favourite-{shortLocationName}" onclick="loadLocationTab(\'{shortLocationName}\')"><span>{locationName}</span><table><tr class="times"><td><img src="images/loading.gif"></td><td><img src="images/loading.gif"></td></tr><tr class="names"><td>Next High</td><td>Next Low</td></tr></table></div>';
var innerFavouritesHTML = '<span>{locationName}</span><table><tr class="times"><td>{next1}</td><td>{next2}</td></tr><tr class="names"><td>Next {1}</td><td>Next {2}</td></tr></table>';

function getTideTimes(location,mode="today") {
  var timeBeforeRequest = new Date();
  var extraURLData = "";
  if (mode == "tomorrow") {
    var tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate()+1);
    extraURLData = "-" + tomorrowDate.getFullYear().toString() + (tomorrowDate.getMonth()+1).toString().padStart(2,"0") + tomorrowDate.getDate().toString().padStart(2,"0");
  }
  $.get("https://cors-anywhere.herokuapp.com/"+sources[location].url+extraURLData, function(data) {
    console.log(((new Date() - timeBeforeRequest)/1000)+"s for request");
    globfortesting = data;

    // parse date data from javascript on page
    var wantedData = data.slice(data.indexOf("var next_high = "),data.indexOf("setTimeout(this.location.reload"));
    var nextHighDate = wantedData.slice(25,wantedData.indexOf(")")).split(",");
    var nextLowRaw = wantedData.substring(wantedData.indexOf("var next_low"));
    var nextLowDate = nextLowRaw.slice(25,nextLowRaw.indexOf(")")).split(",");

    var nextHigh = new Date(
      parseInt(nextHighDate[0]),
      parseInt(nextHighDate[1]),
      parseInt(nextHighDate[2]),
      parseInt(nextHighDate[3]),
      parseInt(nextHighDate[4]),
      parseInt(nextHighDate[5]),
      parseInt(nextHighDate[6])
    );

    var nextLow = new Date(
      parseInt(nextLowDate[0]),
      parseInt(nextLowDate[1]),
      parseInt(nextLowDate[2]),
      parseInt(nextLowDate[3]),
      parseInt(nextLowDate[4]),
      parseInt(nextLowDate[5]),
      parseInt(nextLowDate[6])
    );

    // parse date data from html on page
    var rawTides = data.match(/\d{2}:\d{2}/g) // high, low, high, low
    rawTides = rawTides.slice(0,rawTides.length-1);
    var heights = data.match(/\d\.\d{2}m/g).slice(0,4) // high, low, high, low

    console.log(rawTides);
    console.log(heights);

    var dateWithoutTime = new Date();
    dateWithoutTime.setHours(0,0,0,0);

    var tides = new Array(rawTides.length);
    rawTides.forEach(function(tide,index) {
      tides[index] = dateWithoutTime;
      tides[index].setHours(parseInt(tide.substring(0,2)),parseInt(tide.substring(3,5)),0,0);
      if (new Date() - tides[index] > 0) { // if next is tomorrow
        tides[index].setDate(tides[index].getDate() + 1);
      }
    });

    if (mode == "favouritesPage") {
      if (nextHigh - nextLow > 0) { // if next high is after next low
        document.getElementById("favourite-"+location).innerHTML = innerFavouritesHTML
          .replace("{locationName}","<i class='fas fa-arrow-down'></i> "+sources[location].fullName)
          .replace("{next2}",nextHigh.getHours().toString().padStart(2,"0") + ":" + nextHigh.getMinutes().toString().padStart(2,"0"))
          .replace("{next1}",nextLow.getHours().toString().padStart(2,"0") + ":" + nextLow.getMinutes().toString().padStart(2,"0"))
          .replace("{1}","Low")
          .replace("{2}","High");
      } else { // if next low is after next high
        document.getElementById("favourite-"+location).innerHTML = innerFavouritesHTML
          .replace("{locationName}","<i class='fas fa-arrow-up'></i> "+sources[location].fullName)
          .replace("{next1}",nextHigh.getHours().toString().padStart(2,"0") + ":" + nextHigh.getMinutes().toString().padStart(2,"0"))
          .replace("{next2}",nextLow.getHours().toString().padStart(2,"0") + ":" + nextLow.getMinutes().toString().padStart(2,"0"))
          .replace("{1}","High")
          .replace("{2}","Low");
      }
    } else {
      var firstTide = "High";
      if (parseInt(heights[0].slice(0,4)) < parseInt(heights[1].slice(0,4))) {
        firstTide = "Low";
      }
      var outputHTML = "";
      for (let i = 0; i < rawTides.length; i++) {
        outputHTML += firstTide + ": <span>" + rawTides[i] + " (" + heights[i] + ")</span><br>";
        if (firstTide == "High") { firstTide = "Low" } else { firstTide = "High" }
      }
      document.getElementById(mode+"Tides").innerHTML = outputHTML;
    }
  });
}

function changeTab(tab) {
  document.getElementById("searchTab").className = "tab";
  document.getElementById("searchTabButton").className = "fa fa-search";
  document.getElementById("homeTab").className = "tab";
  document.getElementById("homeTabButton").className = "";
  document.getElementById("settingsTab").className = "tab";
  document.getElementById("settingsTabButton").className = "fa fa-cog";

  document.getElementById(tab+"Tab").className += " tabActive";
  if (tab != "location") {
    document.getElementById(tab+"TabButton").className += " selectedTab";
    if (tab != "home") {
      document.getElementById("titleBar").innerHTML = tab;
    } else {
      document.getElementById("titleBar").innerHTML = "TidesX";
    }
  }
}

function showFavouriteLocations() {
  var locations = window.localStorage.getItem("tidesXFavourites");
  if (locations == null) {
    window.localStorage.setItem("tidesXFavourites","[]")
    locations = [];
  } else {
    locations = JSON.parse(locations);
  }
  if (locations.length == 0) {
    return;
  } else {
    document.getElementById("homeTab").innerHTML = "";
  }

  locations.forEach(function(loc,index) {
    document.getElementById("homeTab").innerHTML += favouritesHTML.replace(/{shortLocationName}/g,loc).replace("{locationName}",sources[loc].fullName);
    getTideTimes(loc,mode="favouritesPage");
  });
}

function loadLocationTab(location) {
  document.getElementById("todayTides").innerHTML = '<img src="images/loading.gif">';
  document.getElementById("tomorrowTides").innerHTML = '<img src="images/loading.gif">';
  changeTab("location");
  if (sources[location].fullName.length > 14) {
    document.getElementById("titleBar").innerHTML = sources[location].fullName.substring(0,14)+"...";
  } else {
    document.getElementById("titleBar").innerHTML = sources[location].fullName;
  }
  getTideTimes(location,"today");
  getTideTimes(location,"tomorrow");
}