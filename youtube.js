// document.onready();

  /* /**
   * Sample JavaScript code for youtube.search.list
   * See instructions for running APIs Explorer code samples locally:
   * https://developers.google.com/explorer-help/guides/code_samples#javascript
   */

//   function authenticate() {
//     return gapi.auth2.getAuthInstance()
//         .signIn({scope: "https://www.googleapis.com/auth/youtube.force-ssl"})
//         .then(function() { console.log("Sign-in successful"); },
//               function(err) { console.error("Error signing in", err); });
//   }
//   function loadClient() {
//     gapi.client.setApiKey("YAIzaSyDKMnHY4LsuosAckGD5kSmHYrumOVHewpI");
//     return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
//         .then(function() { console.log("GAPI client loaded for API"); },
//               function(err) { console.error("Error loading GAPI client for API", err); });
//   }
//   // Make sure the client is loaded and sign-in is complete before calling this method.
//   function execute() {
//     return gapi.client.youtube.search.list({
//       "part": "snippet",
//       "eventType": "completed",
//       "maxResults": 10,
//       "order": "relevance",
//       "q": "surfing"
//     })
//         .then(function(response) {
//                 // Handle the results here (response.result has the parsed body).
//                 console.log("Response", response);
//               },
//               function(err) { console.error("Execute error", err); });
//   }
//   gapi.load("client:auth2", function() {
//     gapi.auth2.init({client_id: "1013246223882-3rl7do5kkdrb7q9k2qicag4htb58bahd.apps.googleusercontent.com"});
//   });




/**
 * This function searches for videos related to the keyword 'dogs'. The video IDs and titles
 * of the search results are logged to Apps Script's log.
 *
 * Note that this sample limits the results to 25. To return more results, pass
 * additional parameters as documented here:
 *   https://developers.google.com/youtube/v3/docs/search/list
 */
//     function searchByKeyword() {
//     var results = YouTube.Search.list('id,snippet', {q: 'dogs', maxResults: 25});
//     for(var i in results.items) {
//       var item = results.items[i];
//       Logger.log('[%s] Title: %s', item.id.videoId, item.snippet.title);
//     }
//   }


$("button").on("click", function(){
    $.ajax({
        url: "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=spoon&key=AIzaSyDKMnHY4LsuosAckGD5kSmHYrumOVHewpI",
        method: "GET"
    }).then(function (response){
        console.log("Response", response);
    })
})




// function search() {
//     var q = $('#query').val();
//     var request = gapi.client.youtube.search.list({
//       q: "spoon",
//       part: 'snippet'
//     });
  
//     request.execute(function(response) {
//       var str = JSON.stringify(response.result);
//       $('#search-container').html('<pre>' + str + '</pre>');
//     });
//   }