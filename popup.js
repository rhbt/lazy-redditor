
$(document).ready(function() {
	let count = 1;

	document.getElementById("pics").addEventListener('click', function() {
	  redditApi.getCurrentTabUrl(function(url) {
	  	display.clearLastResult();
	  	$.getJSON(redditApi.formatJsonUrl(url), function(json) {
	  		$.each(json.data.children, function(i, obj) {
	  			const imageTypeAndLink = redditApi.getImageTypeAndLink(obj.data.url);
	  			redditApi.embedImage(imageTypeAndLink, count);
	  			count++;
	  		});
	  		display.removeBrokenImages();
			});
	  });
	});

	document.getElementById("comments").addEventListener('click', function() { 
		redditApi.getCurrentTabUrl(function(url) {
			display.clearLastResult();
			const psbThread = redditApi.psbInUrl(url);
			$.getJSON(redditApi.formatJsonUrl(url), function(json) {

				if (redditApi.psbInUrl(url)) {
					$.each(json[1].data.children, function(i, obj) { 
						if (obj.data.body !== "[deleted]") {
							const imageUrl = redditApi.extractImageLink(obj.data.body);
							const imageTypeAndLink = redditApi.getImageTypeAndLink(imageUrl);
							redditApi.embedImage(imageTypeAndLink, count);
							count++;
						}	
					})
				}
				else {
					$.each(json[1].data.children, function(i, obj) { 
						redditApi.embedComment(i, obj.data.body_html);
						count++;
					})					
				}
				display.removeBrokenImages();
			});
		});
	});

	$("#enlarge").on( "click", function() {
		display.enlarge();
	});

})

