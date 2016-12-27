
$(document).ready(function() {
	let count = 1;
	document.getElementById("pics").addEventListener('click', function() {
	  redditApi.getCurrentTabUrl(function(url) {
	  	$.getJSON(url + ".json", function(json) {
	  		$.each(json.data.children, function(i, obj) {
	  			const imageUrl = redditApi.getImageLink(obj.data.url);
	  			if (imageUrl) {
	  				$("#result").append("<img src='" + imageUrl + "'>");
	  			}
	  		});
	  		images.removeBrokenImages();
			});
	  });
	});

	document.getElementById("comments").addEventListener('click', function() { 
		
		redditApi.getCurrentTabUrl(function(url) {
			images.removePrevious();
			const psbThread = redditApi.psbInUrl(url);
			$.getJSON(url + ".json", function(json) {
				$.each(json[1].data.children, function(i, obj) {
					if (!psbThread) {
						$("#result").append("<li class='comment'>" + (i+1) + ". " + redditApi.htmlDecode(obj.data.body_html) + "</li>");
					}
					else if (psbThread && obj.data.body !== "[deleted]") {
						const imageUrl = redditApi.extractImageLink(obj.data.body, count);
						if (imageUrl) {
							$("#result").append("<div id='" + count + "'><img src='" + imageUrl + "'></div>");
						}
					}
					count++;
  			})
				images.removeBrokenImages();
			});
		});
	});

})

