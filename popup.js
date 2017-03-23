Popup = {

 onLoad: function() {	

 	//display appropriate buttons according to which page is
 	//open in browser
	redditApi.getCurrentTabUrl(function(url) {
		redditApi.displayButtons(url);
	})

	let count = 1;
	let replyLevels = parseInt(localStorage.replyLevels);

	if (replyLevels === undefined) {
		replyLevels = 1;
	}

	//delay loading last result, can prevent opening extension if not delayed
	setTimeout(display.loadLastPage.bind(null, replyLevels), 1000);

	document.getElementById("pics").addEventListener('click', function() {
		//gets the current tab url
	  redditApi.getCurrentTabUrl(function(url) {
	  	//clears last result so doesn't keep appending pictures if
	  	//user keeps pressing button to get pictures
	  	display.clearLastResult();
	  	$.getJSON(redditApi.formatJsonUrl(url), function (json) {
	  		//displays images from JSON payload
	  		redditApi.displayImages(json, count);
	  		//uses local storage to store last result
	  		//so it is available when opening extension again
	  		display.storeLastPage(url, json, "images");
			});
			//adds listener so pictures can be resized by double
			//and single clicks
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

	$(document).on("click", "a", function() {
	  const url = $(this).attr("href");
	  const queryInfo = {
	    active: true,
	    currentWindow: true
	  };
	  chrome.tabs.query(queryInfo, function(tabs) {
	    const tab = tabs[0];
	    chrome.tabs.update(tab.id, {url: url});
	  });
	})

},

imageResizeListener: function() {

	const DELAY = 300;
	let clicks = 0, timer = null;

	$(document).on("click", "img", function(event){
    clicks++;  //count clicks
    const that = $(this)

    //shrink image if clicked once
    if (clicks === 1) {
        timer = setTimeout(function() {
        	display.shrinkImage.call(that);
          clicks = 0;
        }, DELAY);
    } 
    //if second click, enlarge image
    else {
      clearTimeout(timer); //prevent single-click action
      display.enlargeImage.call(that);
      clicks = 0; //after enlarging, reset counter
    }
  })
  .on("dblclick", function(event){
    event.preventDefault(); //cancel system double-click event
  });

}

}

$(document).ready(function() {
	Popup.onLoad();
	Popup.imageResizeListener();
})