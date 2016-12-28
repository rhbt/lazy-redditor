const images = (function imagesModule() {

function removeBrokenImages() {
	$("img").each(function () {
	  this.onerror = function() {
	    $(this).hide();
	  };
	});
}

function sortImages() {
	$("#result > div").tsort("", {attr:"id"});
}

function removeLastResult() {
	$("#result").empty();
}

function enlarge() {
	const height = parseInt($("img").css("max-height")) + 100;
	const width = parseInt($("img").css("max-width")) + 100;
	$("img").css("max-width", width).css("max-width", height);
}

return {
	removeBrokenImages: removeBrokenImages,
	removeLastResult: removeLastResult,
	sortImages: sortImages,
	enlarge: enlarge
}

})();