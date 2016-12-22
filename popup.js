$(document).ready(function() {

	document.getElementById("pics").addEventListener('click', function() {
	  redditApi.getCurrentTabUrl(function(url) {
	  	$.getJSON(url + ".json", function(json) {
	  		$.each(json.data.children, function(i, obj) {
	  			if (redditApi.filterImages(obj)) {
	  				$("#result").append("<img src='" + redditApi.formatImageURL(obj.data.url, obj.data.thumbnail) + "''>");
	  			}
	  		});
			});
	  });
	});

	document.getElementById("comments").addEventListener('click', function() { 
		redditApi.getCurrentTabUrl(function(url) {
			const inPSB = redditApi.psbInURL(url);
			let counter = 1;
			$.getJSON(url + ".json", function(json) {
				if (inPSB) {
					$.each(json[1].data.children, function(i, obj) {
						if (obj.data.body !== "[deleted]") {
							$("#result").append("<img src='" + redditApi.extractImageLink(obj.data.body) + "''>");
		  				counter++;
						}
	  			})
				}
				else {
					$.each(json[1].data.children, function(i, obj) {
		  			$("#result").append("<div class='comment'>" + counter + ". " + obj.data.body + "</div>");
		  			counter++;
	  			});
				}
			});
		});
	});

})
