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
var addLocationZip = "";
var addRadius = "25mi";//this is the default
var addVenue = "";
var addStartDate = "";
var addEndDate = "";
var addMoreResults = false; //turn this to true when add more results id clicked///////////////////////////////////
var eventList = new Array();
var graphEvents = new Array();
var graphPrices = new Array();
var graphColors = ['#769FB6', '#E1F2FE', '#373E40', '#188FA7'];
var graphHighestMaxPrice = 400;

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
        displayYouTubeVideo();

    } else {
        //don't do anything if the search form is not valid
        return;
    }
})

// DROPDOWN SEARCH BUTTON ID SETTING FUNCTION by GABE
$("#artistSearch, #venueSearch, #zipSearch").click(function(){
    if (this.id == 'artistSearch') {
        console.log("artist search");
        $(".searchBar").prop("id", "artistSearch");
    }
    else if (this.id == 'venueSearch') {
        console.log("venue search");
        $(".searchBar").prop("id", "venueSearch");
    }
    else if (this.id == 'zipSearch') {
        console.log("zip search");
        $(".searchBar").prop("id", "zipSearch");
    }
})


//this function validates the search form and displays the appropriate messaage to the user
function validateSearchForm() {
    //debugger;
    var artistPopulated = false;
    var venuePopulated = false;
    var locationPopulated = false;
    var validSearch = true;
    //if an artist is populated, the search is valid
    if ($("#artistSearch").val() != "") {
        artistPopulated = true;
        validSearch = true;
        addPerformers = $("#artistSearch").val();
        console.log("artist: " + $("#artistSearch").val());
    }
    //if a venue is populated, the search is valid
    if ($("#venueSearch").val() != "") {
        venuePopulated = true;
        validSearch = true;
        addVenue = $("#venueSearch").val();
        console.log("venue: " + $("#venueSearch").val());
    }
    if ($("#zipSearch").val() != "") {
        ////////////////////////////////////////////////////////////////////////////
        //the Seek Geek API accepts zips for location searches
        //parse the zip to an int to see if its a valid US zip
        //if not then display message///////////////////////////////////////////////////////////////////////////
        locationPopulated = true;
        validSearch = true;
        addLocationZip = $("#zipSearch").val();
        //addRadius = $("#radius").val();
        console.log("location: " + $("#zipSearch").val());
    }

    //If a start date is added but not the end date, Default end date to be the same as start date.//////////////////////

    //if the search is accepted, clear the input boxes for the next query
    if (validSearch) {
        //clear the input boxes
        $("#venueSearch").val("");
        $("#zipSearch").val("");
        $("#artistSearch").val("");
        $("#startDateSearch").val("");
        $("#endDateSearch").val("");

        //clear the stored variables to prepare for the next search
        addPerformers = "";
        addLocationZip = "";
        addRadius = "25mi"; //this is the default
        addVenue = "";
        addStartDate = "";
        addEndDate = "";

    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //add appropriate messages to message box
    /////////////////////////////////////////////////////
    return validSearch;
}

function formSearchQuery (apiToQuery){
    // debugger;
    var returnQuery = ""

    //add the initial domain and endpoints
    if (apiToQuery === "seatGeek") {
        returnQuery += seatGeekQuery;
        //add the rest of the search terms
        if (addPerformers != "") {
            returnQuery += "&q=" + addPerformers.replace(/\s+/g, "+");
        }
        if (addLocationZip != "") {
            returnQuery += "&geoip=" + addLocationZip + "&range=" + addRadius;
        }
        if (addVenue != "") {
            if (addPerformers != "") {
                returnQuery += "&" + addVenue;
            } else {
                returnQuery += "&q=" + addVenue;
            }
        }

        if ($("#startDateSearch").val() != "") {
            debugger;
            // //format the date into the format reequired by the API (YYYY-MM-DD)
            // var startDate = moment($("#startDateSearch").val(), "MM/DD/YYYY");
            // var endDate = moment($("#endDateSearch").val(), "MM/DD/YYYY");

            //add dates filter based on search term for each API
            addStartDate = $("#startDateSearch").val();
            //if end date is populated use it else default it to the start date
            if($("#endDateSearch").val() != ""){
                addEndDate = $("#endDateSearch").val();
            }else{
                addEndDate = $("#startDateSearch").val();
            }
            returnQuery += "&datetime_utc.gte=" + addStartDate + "&datetime_utc.lte=" + addEndDate;
        }
    } else if (apiToQuery === "youTube") {
        returnQuery += youTubeQuery;
        if (addPerformers != "") {
            returnQuery += addPerformers;
        }
        if (addVenue != "") {
            returnQuery += "&" + addVenue;
        }
    }

    return returnQuery;
}

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
            displayGraph();
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
        //console.log(recordData);
        var eventUID = db.ref("events").push(JSON.stringify(recordData)).key;
        recordData.fbId = eventUID;
        eventList.push(recordData);
    }
    console.log(eventList);

}
function displayYouTubeVideo() {
    //var query = "brad%20paisley"
    var queryUrl = formSearchQuery("youTube");
    $("#youtube").empty();
    $.ajax({
        url: queryUrl,
        method: "GET"
    }).then(function (response) {
        //console.log("Response", response);
        // dynamically create videos to our youtube div
        for (var i = 0; i < response.items.length; i++) {
            var video = $("<iframe>");
            video.attr('width="560" height="315" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen');
            video.attr("src", "https://www.youtube.com/embed/" + response.items[i].id.videoId + "?enablejsapi=1")
            $("#youtube").append(video);
        }

    })
    window.open("details.html", "_blank");
}

//function to create cards and display event data
function displayEventCards() {
    var loops = 0
    if (eventList.length > 4) {
        loops = 4;
    } else {
        loops = eventList.length;
    }
    for (var i = 0; i < loops; i++) {
        eventList[i];
        //create card and image for event cards
        var image = $("<img class='card-img-top' src=" + eventList[i].image + " alt='Card image cap'>");
        var cityState = eventList[i].venueDisplayLocation.split(", ");
        console.log(cityState[0]);
        var city = eventList[i].venueCity.replace(" ", "+");
        var card = [$("<div class = 'card eventCard' style='width: 17rem; margin: 10px' idValue=" + eventList[i].fbId + " id=" + city + " state=" + cityState[1] + ">").append
            (image, $("<div class ='card-body'>").append($("<p class= 'eventDetails'>" + eventList[i].title + "</br>"
                + eventList[i].venueName + "</br>" + eventList[i].venueDisplayLocation + "</br>" + moment(eventList[i].localTime).format("ddd MMM DD, YYYY hh:mma zz") + "</p>").append
                ($("<button type='button' class='btn btn-secondary btn-modal' idValue=" + eventList[i].fbId + " >More Info</button>"))))];
        //display event data with information regarding event
        $("#events").append(card);
        $("#card").append(image);
        // $(card).attr("class=", eventList[i].fbId);

        //added by avinash to create pricing array for events
        //Limit event name to 15 character before storing
        if(eventList[i].title.length < 16){
            graphEvents.push(eventList[i].title);
        }else{
            graphEvents.push(eventList[i].title.substring(0, 15));
        }
        graphPrices.push([eventList[i].lowPrice, eventList[i].highPrice])
        if(eventList[i].highPrice > graphHighestMaxPrice){
            graphHighestMaxPrice = eventList[i].highPrice;
        }
    }
}

$(document).on("click", ".btn-modal", function () {
    console.log(this);
    var matchingId = $(this).attr("idvalue");
    for (var i = 0; i < eventList.length; i++) {
        if (matchingId === eventList[i].fbId) {
            $(".modal-title").text(eventList[i].title);
            $(".modalImage").attr("src", eventList[i].image);
            $(".venueName").text(eventList[i].venueName);
            $(".venueLocation").text(eventList[i].venueDisplayLocation);
            $(".eventtime").text(moment(eventList[i].localTime).format("ddd MMM DD, YYYY hh:mma z"));
            $(".prices").text("Low Price: $" + eventList[i].lowPrice + " - High Price: $" + eventList[i].highPrice);
            $(".eventURL").attr("href", eventList[i].venueURL);
            $("#eventModal").modal("show");
        }
    }
})

//this function displays a graph from the ticket price data from the events displayed 
function displayGraph(){
    var xscale = d3.scale.linear()
    .domain([0, graphHighestMaxPrice])//this is the spread of the ticket prices min to max
    .range([0, 270]); //this is the width of our grid

    var yscale = d3.scale.linear()
        .domain([0, graphEvents.length])//this is the number of events in our list
        .range([0, 250]);//this is the height of our grid

    var colorScale = d3.scale.quantize()
        .domain([0, graphEvents.length])//this is the number of events in our list
        .range(graphColors);//this is the color to apply to each event in list

    var canvas = d3.select('#graphCell')//this is the size of our chart
        .append('svg')
        .attr({
        'width': 400,
        'height': 300
        });

    var xAxis = d3.svg.axis();
    if(parseInt(graphHighestMaxPrice) > 3000){
        xAxis
        .orient('bottom')
        .scale(xscale)
        .tickFormat(d3.format("s"))
    }else{
            xAxis
            .orient('bottom')
            .scale(xscale)
        }
    

  var yAxis = d3.svg.axis();
  yAxis
    .orient('left')
    .scale(yscale)
    .tickSize(2)
    .tickFormat(function(d, i) {
      return graphEvents[i];
     })
    .tickValues(d3.range(10));

  var y_xis = canvas.append('g')
    .attr("transform", "translate(100,15)")
    .attr('id', 'yaxis')
    .call(yAxis);

  var x_xis = canvas.append('g')
    .attr("transform", "translate(100,262)")
    .attr('id', 'xaxis')
    .call(xAxis);

  var chart = canvas.append('g')
    .attr("transform", "translate(100,0)")
    .attr('id', 'bars')
    .selectAll('rect')
    .data(graphPrices)
    .enter()
    .append('rect')
    .attr('height', 15)
    .attr({
      'x': function(d) {
        return xscale(d[0]);
      },
      'y': function(d, i) {
        return yscale(i) + 10;
      }
    })
    .style('fill', function(d, i) {
      return colorScale(i);
    })
    .attr('width', function(d) {
      return 0;
    });

    var chart2 = canvas.append('g')
    .attr('id', 'prices')
    .selectAll('text')
    .data(graphPrices)
    .enter()
    .append('text')
    .text(function (d) {
      return "$" + d[0] + " - $" + d[1];
        })
    .attr({
      'x': function(d) {
        return xscale (d[0]) + 100; 
      },
      'y': function(d, i) {
        return yscale(i) + 36;
      }
    })
    .attr("font-size", "12px");


  var transit = d3.select("svg").selectAll("rect")
    .data(graphPrices)
    .text(function (d) {return "$" + d[0] + " - $" + d[1];})
    .transition()
    .duration(1000)
    .attr("width", function(d) {
      return xscale(d[1]) - xscale(d[0]);
    })
}

