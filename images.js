const images = (function imagesHelper() {

function removeBrokenImages() {

	$("img").each(function () {
	    this.onerror = function() {
	        $(this).hide();
	    };
	});
}

function sortImages() {
	$("#result > div").tsort("",{attr:"id"});
}

function removePrevious() {
	$("#result").empty();
}

return {
	removeBrokenImages: removeBrokenImages,
	removePrevious: removePrevious,
	sortImages: sortImages
}

})();