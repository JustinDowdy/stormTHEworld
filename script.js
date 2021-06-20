/*
Justin T. Dowdy
Module 6 Weather Dashboard challenge
06/12/2021

Assignment Need-tos: 
I need to link my third party API in javascript.
I need to link data to div boxes created in HTML.
I need to send get my search button working and sent info to localstorage when I click on it.
I need to save my list of previously searched cities.
I need to be able to access previously searched cities by clicking on them.

*/

const openWeatherAPI = "https://api.openweathermap.org/data/2.5/";
const openCurrentWeather = "weather?q=";
const openWeather1 = "onecall?lat=";
const openWeather2 = "&lon=";
const openWeather3 = "&units=imperial";
const openAPIkey = "&APPID=eee981012b240ab34d1f9eee38b81916";
const savedCitySearches = "weatherDashboardSavedCities"; // This is the name of the localstorage
const lastCitySearch = "weatherDashboardLastViewed";
var savedCities = []; 
var lastCityNumber = -1; 

getCityInfo(); // Retrieve saved searches and display on loading page
$("#city-search-btn").click(doLookup); // this puts onClick event onto the search button
$(".modal").modal('hide'); // make sure error modal isn't showing

// Retrieved saved searches from localstorage
function getCityInfo() {
    var cityList = JSON.parse(localStorage.getItem(savedCitySearches));

    lastCityNumber = localStorage.getItem(lastCitySearch);

   //set global variable to list if value is returned
    if (cityList) {
        savedCities = cityList;
        displaySavedCities(); // Load displayed city list that user has previously searched
        displayOldData(); // Last viewed city displayed here
    }
}

// Save searched cities inside of localstorage
function setSavedCities() {
    // Only save if user has put in cities
    if (savedCities.length > 0) {
        // put this in local storage
        localStorage.setItem(lastCitySearch, lastCityNumber);
        localStorage.setItem(savedCitySearches, JSON.stringify(savedCities));
    }
}

// The following function creates a saved button for each city.
function displaySavedCities() {
    // constants for creating html to add to displayed list of cities
    const listCitySearch1 = '<a href="#" class="list-group-item list-group-item-action" value=';
    const listCitySearch2 = '>';
    const listCitySearch3 = '</a>'

    var cityListBox = $("#city-list"); // Links to city list div
    cityListBox.empty(); // this empties old list and updates it with the new list

    // Load displayed city list
    for (let i=0; i<savedCities.length; i++) {
        cityListBox.append(listCitySearch1 + i + listCitySearch2 + savedCities[i].name + listCitySearch3);
    }

    // add event handler for city buttons
    $(".list-group-item-action").click(getCityData);
}

// Add city name to saved searches, and then retrieve longitude, latitude, and correct city name
function getSavedInfo(cityName) {
    // check if selected city is already in list
    var cityFound = false;
    for (let i=0; i<savedCities.length; i++) {
        if (cityName.toLowerCase() === savedCities[i].name.toLowerCase()) {
            cityFound = true;
            lastCityNumber = i;
            localStorage.setItem(lastCitySearch, lastCityNumber);
        }
    }

    if (!cityFound) {
        var newCityInfo = {}; // object for holding data

        // Get current forecast with the API and its key
        var owURL = openWeatherAPI + openCurrentWeather + cityName + openAPIkey;

        $.ajax({
            url: owURL,
            method: "GET"
        }).then(function (response) {
            newCityInfo.name = response.name; // format the city name correctly
            newCityInfo.lat = response.coord.lat; // latitude
            newCityInfo.lon = response.coord.lon; // longitude
            lastCityNumber = savedCities.push(newCityInfo) - 1; // add to array of saved searches
            setSavedCities(); // save array in localstorage
            displaySavedCities();
            displayOldData();
        }).catch(function (error) {
            if (error.status == 404) {
                $("#errorMsg").text('City "' + cityName + '" not found. Please check spelling and try again.');
            }
            else {
                $("#errorMsg").text("Sorry, cannot retrieve weather information. Please try again later.");
            }
            $(".modal").modal('show');
        });
    }
    else {
        displayOldData(); // if city already in list, display its data  
    }
}

// Update display with weather information
function displayOldData() {
    // html needed for building city weather info and 5-day forecast
    const htmlHeading2 = '<h2 class="card-title">';
    const htmlImg = '<img src="';
    const htmlAlt = '" alt="';
    const htmlAltEnd = '">';
    const htmlHeading2end = '</h2>';
    const html1 = '<div class="col mb-2"> ' + 
        '<div class="card text-white bg-primary"> ' +
        '<div class="card-body px-2" id="forecast';
    const html2 = '"> </div> </div> </div>';
    const htmlH5 = '<h5 class="card-title">';
    const htmlH5end = '</h5>';
    const htmlPe = '<p class="card-text">';
    const htmlPend = '</p>';
    const htmlSpan = '<span class="p-2 rounded text-white ';
    const htmlSpanEnd = '"</span>';

    // Determine background color for UV index
    function getColor(uvindex) {
        var boxColor = ""; // initialize return value
        // make sure it's a valid number
        if (!(Number.isNaN(uvindex))) {
            if (uvindex < 4) {
                boxColor = "bg-success";
            }
            else if (uvindex < 8) {
                boxColor = "bg-warning";
            }
            else {
                boxColor = "bg-danger";
            }
        }
        return boxColor;
    }

    // verify lastSearchIndex is valid
    if ((lastCityNumber !== null) && (lastCityNumber>=0) && (lastCityNumber<savedCities.length)) {
        var owURL = openWeatherAPI + openWeather1 + savedCities[lastCityNumber].lat + 
            openWeather2 + savedCities[lastCityNumber].lon + openWeather3 + openAPIkey;

        $.ajax({
            url: owURL,
            method: "GET"
        }).then(function (response) {
            var weatherDiv = $("#weatherdata"); // this links to the div where city data is displayed
            var forecastDiv = $("#5dayforecast"); // this links to the div for the 5-day forecast
            var infoDate = (new Date(response.current.dt * 1000)).toLocaleDateString();
            var weatherTitle = savedCities[lastCityNumber].name + " (" + infoDate + ") ";
            var imgURL = "http://openweathermap.org/img/wn/" + response.current.weather[0].icon + ".png";
            var imgDesc = response.current.weather[0].description;

            // This takes each div box element and deletes each one. Overall I'm trying to delete the last searched city info and puts in the new city info.
            weatherDiv.empty();
            weatherDiv.append(htmlHeading2 + weatherTitle + htmlImg + imgURL + htmlAlt + imgDesc + htmlAltEnd + htmlHeading2end);
            weatherDiv.append(htmlPe + "Temperature: " + response.current.temp + "\xB0 F" + htmlPend);
            weatherDiv.append(htmlPe + "Humidity: " + response.current.humidity + "%" + htmlPend);
            weatherDiv.append(htmlPe + "Wind Speed: " + response.current.wind_speed + " MPH" + htmlPend);
            weatherDiv.append(htmlPe + "UV Index: " + htmlSpan + getColor(response.current.uvi) + htmlSpanEnd + response.current.uvi + htmlPend);

            // Delete last displayed city's 5-day forecast; add in currently selected city's forecast
            forecastDiv.empty();
            for (let i=0; i<5; i++) {
                forecastDiv.append(html1 + i + html2); // insert blue box for the day's forecast
                infoDate = (new Date(response.daily[i].dt * 1000)).toLocaleDateString();
                imgURL = "http://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + ".png";
                imgDesc = response.daily[i].weather[0].description;
                
                $("#forecast" + i).append(htmlH5 + infoDate + htmlH5end +
                    htmlPe + htmlImg + imgURL + htmlAlt + imgDesc + htmlAltEnd + htmlPend +
                    htmlPe + "Temp: " + response.daily[i].temp.day + "\xB0 F" + htmlPend +
                    htmlPe + "Humidity: " + response.daily[i].humidity + "%" + htmlPend);
            }
        }).catch(function (error) {
            $("#errorMsg").text("Sorry, cannot retrieve weather information. Please try again later.");
            $(".modal").modal('show');
        });

        $("#city-column").css("visibility", "visible"); // need to show information div, which was hidden on load
    }
}

// this sets up onClick button event for searching cities
function doLookup(event) {
    event.preventDefault();
    var citySearchInput = $("#city-search-input");
    var city = citySearchInput.val().trim();

    
    if (city === "") {
        $("#errorMsg").text("Please enter a city name.");
        $(".modal").modal('show');
    }
    else {
        citySearchInput.val(""); // this clears out all searches
        getSavedInfo(city);
    }
}

// this sets up onClick button for clicking on previous searched cities
function getCityData(event) {
    event.preventDefault();
    lastCityNumber = $(this).attr("value");
    localStorage.setItem(lastCitySearch, lastCityNumber);
    displayOldData();
}

