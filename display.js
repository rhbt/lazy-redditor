const display = (function displayModule() {

function clearLastResult() {
	$("#result").empty();
}

function sortImages() {
	//sorts images based on number in id
	//needed to properly sort images from 
	//second API call to Imgur 
	$("#result > div").tsort("", {attr:"id"});
}

function removeBrokenImages() {
	$("img").each(function () {
	  this.onerror = function() {
	    $(this).hide();
	  };
	});
}

function storeLastPage(url, json, type) {
	localStorage.lastResult = JSON.stringify(json);
	localStorage.lastResultType = type;
	localStorage.lastUrl = url;
}

function loadLastPage(replyLevels) {
	let saveLastPage, lastResultType, lastResult, lastUrl;
	//try getting local storage
	try {
		//user option to save last page
		saveLastPage = JSON.parse(localStorage.saveLastPage);
		lastResultType = localStorage.lastResultType;
		//data for last page
		lastResult = JSON.parse(localStorage.lastResult);
		lastUrl = localStorage.lastUrl;
	}
	catch(error) {
		saveLastPage = false; //set to false if error occurs
	}

	try {
		//if user has option to load last page, load it
		if (saveLastPage) {
			if (lastResult) {
				if (lastResultType === "images") {
					redditApi.displayImages(lastResult, 1);
				}
				else if (lastResultType === "comments") {
					redditApi.displayComments(lastUrl, lastResult, 1, replyLevels);
				}
			}
		}
		//if not, display instructions instead
		else {
			displayInstructions();
		}
	}
	catch(error) {
	}
}

function clearLastResult() {
	//clears last page result and local storage
	$("#result").empty();
	localStorage.removeItem("lastResult");
	localStorage.removeItem("lastResultType");
	localStorage.removeItem("lastUrl");
}

function shrinkImage() {
	let height = parseInt($(this).css("max-height"));
	let width = parseInt($(this).css("max-width"));
	let newHeight, newWidth;

	$(this).css("max-width", width-100).css("max-height", height-100);
}

function enlargeImage() {
	const height = parseInt($(this).css("max-height"));
	const width = parseInt($(this).css("max-width"));
	$(this).css("max-width", width+100).css("max-height", height+100);
}

function displayInstructions() {
	$("#result").append(
		"<div id='instructions'><li><h1>How to use</h1></li>" +
		"<li><h2>Getting Pictures</h2></li>" +
		"<li><b>1.</b> Go to an image based subreddit " + 
		"like /r/pics or an /r/photoshopbattles thread" +
		"<li><b>2.</b> Click the 'Get Pics' button</li>" +
		"<li><b>3.</b> Images will then be displayed</li>" +
		"<li><h2>Getting Comments</h2></li>" +
		"<li><b>1.</b> Go to the comments section of any thread" + 
		"<li><b>2.</b> Click the 'Get Comments' button</li>" +
		"<li><b>3.</b> Comments from that thread will be displayed</li></div>"
		);
}

return {
	clearLastResult: clearLastResult,
	sortImages: sortImages,
	removeBrokenImages: removeBrokenImages,
	storeLastPage: storeLastPage,
	loadLastPage: loadLastPage,
	clearLastResult: clearLastResult,
	shrinkImage: shrinkImage,
	enlargeImage: enlargeImage
}

})();