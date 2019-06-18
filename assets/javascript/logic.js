/////////////////////////////////
//Firebase Setup
/////////////////////////////////
const firebaseConfig = {
    apiKey: "AIzaSyADLELNaDJAo8AO85e16M2dTTPhFmlluUk",
    authDomain: "eventplus-6436b.firebaseapp.com",
    databaseURL: "https://eventplus-6436b.firebaseio.com",
    projectId: "eventplus-6436b",
    storageBucket: "eventplus-6436b.appspot.com",
    messagingSenderId: "658113048583",
    appId: "1:658113048583:web:cf53e50460400b32"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Get a reference to the database service
var db = firebase.database();


///////////////////////////
//GLOBAL VARIABLES
/////////////////////////////

var finalSearchQuery = ""
var seatGeekQuery = "https://api.seatgeek.com/2/events?client_id=MTcwMTc2ODJ8MTU2MDQ1NDI2Ni45OA&sort=score.desc";
var youTubeQuery = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&order=viewCount&type=video&videoEmbeddable=true&key=AIzaSyDKMnHY4LsuosAckGD5kSmHYrumOVHewpI&q=";
var addPerformers = "";
var addLocation = "";
var addVenue = "";
var addStartDate = "";
var addEndDate = "";
var addMoreResults = false; //turn this to true when add more results id clicked///////////////////////////////////
var eventList = new Array();

//when the user submits a search term incorporate it into the event search query
$("#searchBtn").on("click", function (event) {
    event.preventDefault();
    //debugger;
    if (validateSearchForm()) {
        //clear the eventList array and the events displayed from previous searches to fill with new events
        eventList.length = 0;
        $("#events").empty();
        finalSearchQuery = formSearchQuery("seatGeek");
        getSearchResults(finalSearchQuery);
        // displayYouTubeVideo();

    } else {
        //don't do anything if the search form is not valid
        return;
    }
});


//this function validates the search form and displays the appropriate messaage to the user
function validateSearchForm() {
    //debugger;
    var artistPopulated = false;
    var venuePopulated = false;
    var locationPopulated = false;
    var validSearch = true;
    //if an artist is populated, the search valid
    if ($("#artistSearch").val() != "") {
        artistPopulated = true;
        validSearch = true;
        addPerformers = $("#artistSearch").val();
        console.log("artist: " + $("#artistSearch").val());
    }
    if ($("#venueSearch").val() != "") {
        locationPopulated = true;
        validSearch = true;
        ////////////////////////////////////////////////////////////////////////////
        //the Seek Geek API accepts zips for location searches
        //parse the zip to an int to see if its a valid US zip
        //if not then display message///////////////////////////////////////////////////////////////////////////

        addLocation = $("#venueSearch").val();
        console.log("venue: " + $("#venueSearch").val());
    }
    if ($("#locationSearch").val() != "") {
        artistPopulated = true;
        validSearch = true;
        addPerformers = $("#locationSearch").val();
        console.log("location: " + $("#locationSearch").val());
    }

    //if the search is accepted, clear the input boxes for the next query
    if (validSearch) {
        $("#venueSearch").val("");
        $("#locationSearch").val("");
        $("#artistSearch").val("");
        //$("#startDateSearch").val("");
        //$("#endDateSearch").val("");
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //add appropriate messages to message box
    /////////////////////////////////////////////////////
    return validSearch;
};

function formSearchQuery(apiToQuery) {
    //debugger;
    var returnQuery = ""

    //add the initial domain and endpoints
    if (apiToQuery === "seatGeek") {
        returnQuery += seatGeekQuery;
        //add the rest of the search terms
        if (addPerformers != "") {
            returnQuery += "&q=" + addPerformers.replace(/\s+/g, "+");
            //format the performers list as per seatGeek API rules (replace space with dash)
            returnQuery += "&performers.slug=" + addPerformers.replace(/\s+/g, "-");
        }
        if (addLocation != "") {
            returnQuery += "&" + addLocation;
        }
        if (addVenue != "") {
            returnQuery += "&" + addVenue;
        }

        if (addStartDate != "" && addEndDate != "") {
            //add dates filter based on search term for each API
        }
    } else if (apiToQuery === "youTube") {
        returnQuery += youTubeQuery;
        if (addPerformers != "") {
            returnQuery += addPerformers;
        } else {
            //this is for the initial load
            returnQuery += "UT Longhorns";
        }
        if (addLocation != "") {
            returnQuery += "&" + addLocation;
        }
        if (addVenue != "") {
            returnQuery += "&" + addVenue;
        }
    }

    return returnQuery;
};

//these are the AJAX queries to get the EVENTS results
//This is ONLY to get results from SeatGeek, EventBright and Meetup
function getSearchResults(queryStr) {
    //debugger;
    //query the SeatGeek API first
    $.ajax({
        url: queryStr,
        method: "GET"
    }).then(function (response) {
        //debugger;
        console.log(response);
        //check if you got any matching results
        if (response.events.length > 0) {
            //create an object to add the records to the Firebase DB
            var resultSet = response.events;
            writeRecords(resultSet, "SeatGeek");
            displayEventCards();
        } else {
            $("#events").append('<p>' + "No matching events found." + '</p>');
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //write message in user communication box that no matching events were found
            ///////////////////////////////////////////////////////////////////////////////////////////////////
        }
    })
    //then query others to add records to the DB

}

//Write the records to the DB
function writeRecords(resultSet, source) {
    //debugger;
    //clear the displayed events list from the Firebase database
    // if(!addMoreResults){
    //     db.ref("events").removeValue();
    // }
    for (var i = 0; i < resultSet.length; i++) {
        var recordData = {
            title: resultSet[i].title,
            source: source,
            vendorID: resultSet[i].id,
            localTime: resultSet[i].datetime_local,
            utcTime: resultSet[i].datetime_utc,
            image: resultSet[i].performers[0].image,
            popularity: resultSet[i].popularity,
            type: resultSet[i].type,
            lowPrice: resultSet[i].stats.lowest_price,
            highPrice: resultSet[i].stats.highest_price,
            venueName: resultSet[i].venue.name,
            venueURL: resultSet[i].url,
            venueStreetAddress: resultSet[i].venue.address,
            venueCity: resultSet[i].venue.city,
            venueCountry: resultSet[i].venue.country,
            venueDisplayLocation: resultSet[i].venue.display_location,
            venueCapacity: resultSet[i].venue.capacity
        }

        if (resultSet[i].performers.length < 4) {
            recordData.performers = resultSet[i].performers
        }
        else {
            recordData.performers = resultSet[i].performers.slice(0, 3);
        }
        //commit the new row to the DB
        //debugger;
        //console.log(recordData);
        var eventUID = db.ref("events").push(JSON.stringify(recordData)).key;
        recordData.fbId = eventUID;
        eventList.push(recordData);
    }
    console.log(eventList);

}
// function displayYouTubeVideo() {
//     //var query = "brad%20paisley"
//     var queryUrl = formSearchQuery("youTube");
//     $("#youtube").empty();
//     $.ajax({
//         url: queryUrl,
//         method: "GET"
//     }).then(function (response) {
//         //console.log("Response", response);
//         // dynamically create videos to our youtube div
//         for (var i=0; i < response.items.length; i++){
//             var video = $("<iframe>");
//             video.attr('width="560" height="315" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen');
//             video.attr("src", "https://www.youtube.com/embed/" + response.items[i].id.videoId + "?enablejsapi=1")
//             $("#youtube").append(video);
//         }

//     })
// }
// displayYouTubeVideo();

//function to call OpenWeatherMap API for event
$(document).on("click", ".card", function () {
    // console.log("clicked");
    // debugger;
    var weatherLoc = $(this).attr("id");
    console.log(weatherLoc);
    var weatherURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + weatherLoc + "&units=imperial&APPID=cad8f1c5857468acbe6f6a9645983b49";
    //empty current weather display location//
    $.ajax({
        url: weatherURL,
        method: "GET",
    }).then(function (response) {
        debugger;
        console.log("weather " + response.main);

        //weather icon url is: http://openweathermap.org/img/w/10d.png - replace 10d.png with the weather icon from the array
    })
});
//function to create cards and display event data
function displayEventCards() {

    for (var i = 0; i < 4; i++) {
        eventList[i]
        //create card and image for event cards
        var image = $("<img class='card-img-top' src=" + eventList[i].image + " alt='Card image cap'>");
        var cityState = eventList[i].venueDisplayLocation.split(", ");
        console.log(cityState[0]);
        var city = eventList[i].venueCity.replace(" ", "+");
        var card = [$("<div class = 'card eventCard' style='width: 17rem; margin: 10px' idValue=" + eventList[i].fbId + " id="+city+ " state="+cityState[1]+">").append
            (image, $("<div class ='card-body'>").append(
                $("<p>" + eventList[i].title + "</br>" + eventList[i].venueName +
                    "</br>" + eventList[i].venueDisplayLocation + "</br>"
                    + eventList[i].localTime + "</br>" + "<a href=" + eventList[i].venueURL + " class='btn btn-primary btn-outline-success' target='_blank'>Event URL</a>" + "</p>")))];


        //display event data with information regarding event
        $("#events").append(card);
        $("#card").append(image);
        // $(card).attr("class=", eventList[i].fbId);
    }
}

