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
var youTubeQuery = "https://www.googleapis.com/youtube/v3/search?key=AIzaSyDKMnHY4LsuosAckGD5kSmHYrumOVHewpI";
var addPerformers = "";
var addLocation = "";
var addVenue = "";
var addStartDate = "";
var addEndDate = "";
var eventIDsList = new Array();

//when the user submits a search term incorporate it into the event search query
$("#searchBtn").on("click", function(event){
    event.preventDefault();
    debugger;
    if(validateSearchForm){
        finalSearchQuery = formSearchQuery("seatGeek");
        getSearchResults(finalSearchQuery);

    }else{
        //don't do anything if the search form is not valid
        return;
    }
});


//this function validates the search form and displays the appropriate messaage to the user
function validateSearchForm () {
    var validSearch = true;
    //put some if-else checks here to validate serach form data

    return validSearch;
};

function formSearchQuery (apiToQuery){
    debugger;
    var returnQuery = ""

    //add the initial domain and endpoints
    if(apiToQuery === "seatGeek"){
        returnQuery += seatGeekQuery;
    }else if(apiToQuery === "youTube"){
        returnQuery += youTubeQuery;
    }

    //add the rest of the search terms
    if(addPerformers != ""){
        returnQuery += "&" + addPerformers;
    }
    if(addLocation != ""){
        returnQuery += "&" + addLocation;
    }
    if(addVenue != ""){
        returnQuery += "&" + addVenue;
    }
 
    if(addStartDate != "" && addEndDate != ""){
        //add dates filter based on search term for each API
    }
    return returnQuery;
};

//these are the AJAX queries to get the EVENTS results
//This is ONLY to get results from SeatGeek, EventBright and Meetup
function getSearchResults(queryStr){
    debugger;
    //query the SeatGeek API first
    $.ajax({
        url: queryStr,
        method: "GET"
    }).then(function (response){
        debugger;
        console.log(response);
        //create an object to add the records to the Firebase DB
        var resultSet = response.events;
        writeRecords(resultSet, "SeatGeek");
    })
 //then query others to add records to the DB

}

//Write the records to the DB
function writeRecords(resultSet, source){
    debugger;
    //clear the eventIDs array to fill new events
    eventIDsList.length = 0;
    //clear the displayed events list from the Firebase database////////////////
    // if(db.ref().hasChild("event")){
    //     db.ref("events").removeValue();
    // }
    for(var i = 0; i < resultSet.length; i++){
        var recordData = {
            title: resultSet[i].title,
            source: source,
            vendorID: resultSet[i].id,
            localTime: resultSet[i].datetime_local,
            utcTime: resultSet[i].datetime_utc,
            image: resultSet[i].image,
            popularity: resultSet[i].popularity,
            type: resultSet[i].type,
            lowPrice: resultSet[i].stats.lowest_price,
            highPrice: resultSet[i].stats.highest_price,
            venueName: resultSet[i].venue.location.name,
            venueURL: resultSet[i].venue.location.url,
            venueStreetAddress: resultSet[i].venue.address,
            venueCity: resultSet[i].venue.city,
            venueCountry: resultSet[i].venue.country,
            venueDisplayLocation: resultSet[i].venue.display_location,
            venueCapacity: resultSet[i].venue.capacity
        }
        
        if (resultSet[i].performers.length < 4){
            recordData.performers = resultSet[i].performers
        }
        else {
            recordData.performers = resultSet[i].performers.slice(0, 3);
        }
        //commit the new row to the DB
        debugger;
        console.log(recordData);
        var eventUID = db.ref("events").push(JSON.stringify(recordData)).key;
        eventIDsList.push(eventUID);
    }
    console.log(eventIDsList);
}