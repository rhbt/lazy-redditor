const images = (function imagesHelper() {

function removeBrokenImages() {
	$("img").each(function () {
	    this.onerror = function() {
	        $(this).hide();
	    };
	});
}

return {
	removeBrokenImages: removeBrokenImages
}

})();