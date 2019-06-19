//Call the openweathermap API and dynamically create weather cards
function weather(){
    var weatherLoc = localStorage.getItem("cityname");
    var weatherURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + weatherLoc + "&units=imperial&APPID=cad8f1c5857468acbe6f6a9645983b49";
    // localStorage.clear;
    $.ajax({
        url: weatherURL,
        method: "GET",
    }).then(function (response) {
        debugger;
        console.log(JSON.parse(JSON.stringify(response)));
        for (var i = 0; i < 30; i+=4) {
            console.log("log");
            var weatherCard = $("<div class='card weatherCard'>");
            // var image = $("<img class='card-img-top' src=http://openweathermap.org/img/w/" + response.list[i].weather[0].icon + " alt='weather icon'>");
            var cardBody = $("<div class='card-body'>")
            var cardContents = $("<p class='card-title'>" + response.list[i].dt_txt + "</p>").append($("<p class='card-text'>Temperature: " + response.list[i].main.temp + "</br></p>"));
            $(".card-deck").append(weatherCard);
            weatherCard.append(cardBody);
            // image.append(cardBody);
            cardBody.append(cardContents);
            // weather icon url is: http://openweathermap.org/img/w/10d.png - replace 10d.png with the weather icon from the array
        }
    })
}
weather();