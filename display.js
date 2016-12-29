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

return {
	clearLastResult: clearLastResult,
	sortImages: sortImages,
	removeBrokenImages: removeBrokenImages,
	enlarge: enlarge
}

})();