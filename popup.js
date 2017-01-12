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

	setTimeout(display.loadLastPage.bind(null, replyLevels), 100);

	document.getElementById("pics").addEventListener('click', function() {
	  redditApi.getCurrentTabUrl(function(url) {
	  	display.clearLastResult();
	  	$.getJSON(redditApi.formatJsonUrl(url), function (json) {
	  		redditApi.displayImages(json, count);
	  		display.storeLastPage(url, json, "images");
			});
			imageResizeListener();
	  });
	});

	document.getElementById("comments").addEventListener('click', function() { 
		redditApi.getCurrentTabUrl(function(url) {
			display.clearLastResult();
			$.getJSON(redditApi.formatJsonUrl(url), function(json) {
				redditApi.displayComments(url, json, count, replyLevels);
				display.storeLastPage(url, json, "comments");

			});
		});
	});


	$(document).on("click", "#clear", function() {
		display.clearLastResult();
	})

},

imageResizeListener: function() {

	const DELAY = 300;
	let clicks = 0, timer = null;

	$(document).on("click", "img", function(event){
    clicks++;  //count clicks
    const that = $(this)

    if (clicks === 1) {
        timer = setTimeout(function() {
        	display.shrinkImage.call(that);
          clicks = 0;             //after action performed, reset counter
        }, DELAY);
    } 
    else {
      clearTimeout(timer);    //prevent single-click action
      display.enlargeImage.call(that);
      clicks = 0;             //after action performed, reset counter
    }
  })
  .on("dblclick", function(event){
    event.preventDefault();  //cancel system double-click event
  });

}

}

$(document).ready(function() {
	Popup.onLoad();
	Popup.imageResizeListener();
})