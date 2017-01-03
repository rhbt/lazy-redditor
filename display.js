const display = (function displayModule() {

function clearLastResult() {
	$("#result").empty();
}

function sortImages() {
	$("#result > div").tsort("", {attr:"id"});
}

function removeBrokenImages() {
	$("img").each(function () {
	  this.onerror = function() {
	    $(this).hide();
	  };
	});
}

function enlarge() {
	const height = parseInt($("img").css("max-height")) + 100;
	const width = parseInt($("img").css("max-width")) + 100;
	$("img").css("max-width", width).css("max-width", height);

}

function storeLastPage(url, json, type) {
	localStorage.lastResult = JSON.stringify(json);
	localStorage.lastResultType = type;
	localStorage.lastUrl = url;
}

function loadLastPage(replyLevels) {
	let saveLastPage, lastResultType, lastResult, lastUrl;
	try {
		saveLastPage = JSON.parse(localStorage.saveLastPage);
		lastResultType = localStorage.lastResultType;
		lastResult = JSON.parse(localStorage.lastResult);
		
		lastUrl = localStorage.lastUrl;
	}
	catch(e) {
		saveLastPage = false;
	}
	try {
		if (saveLastPage) {
			if (lastResult) {
				if (lastResultType === "images") {
					redditApi.displayImages(lastResult, 1);
				}
				else {
					redditApi.displayComments(lastUrl, lastResult, 1, replyLevels);
				}
			}
		}
	}
	catch(e) {
	}
}

return {
	clearLastResult: clearLastResult,
	sortImages: sortImages,
	removeBrokenImages: removeBrokenImages,
	enlarge: enlarge,
	storeLastPage: storeLastPage,
	loadLastPage: loadLastPage
}

})();