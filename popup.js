Popup = {

	onLoad: function() {	

  redditApi.getCurrentTabUrl(function(url) {
  	redditApi.displayButtons(url);
  })

	let count = 1;
	let replyLevels = parseInt(localStorage.replyLevels);

	if (replyLevels === undefined) {
		replyLevels = 1;
	}

	display.loadLastPage(replyLevels);

	document.getElementById("pics").addEventListener('click', function() {
	  redditApi.getCurrentTabUrl(function(url) {
	  	display.clearLastResult();
	  	$.getJSON(redditApi.formatJsonUrl(url), function (json) {
	  		redditApi.displayImages(json, count);
	  		display.storeLastPage(url, json, "images");
			});
	  });
	});

	document.getElementById("comments").addEventListener('click', function() { 
		redditApi.getCurrentTabUrl(function(url) {
			display.clearLastResult();
			const psbThread = redditApi.psbInUrl(url);
			$.getJSON(redditApi.formatJsonUrl(url), function(json) {
				redditApi.displayComments(url, json, count, replyLevels);
				display.storeLastPage(url, json, "comments");

			});
		});
	});

	$("#enlarge").on("click", function() {
		display.enlarge();
	});

	}
}

$(document).ready(function() {
	Popup.onLoad();
})