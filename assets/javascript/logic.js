function displayVideo() {
    var query = "brad%20paisley"
    var queryUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&type=video&videoEmbeddable=true&q=" + query + "&key=AIzaSyDKMnHY4LsuosAckGD5kSmHYrumOVHewpI";
    
    $.ajax({
        url: queryUrl,
        method: "GET"
    }).then(function (response) {
        console.log("Response", response);
        // dynamically create videos to our youtube div
        for (var i=0; i < response.items.length; i++){
            var video = $("<iframe>");
            video.attr('width="560" height="315" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen');
            video.attr("src", "https://www.youtube.com/embed/" + response.items[i].id.videoId + "?enablejsapi=1")
            $("#youtube").append(video);
        }
        
    })
}
displayVideo();