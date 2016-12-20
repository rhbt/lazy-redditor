const imageFormats = [".jpeg", ".jpg", ".png", ".gif", ".apng"];

function getCurrentTabUrl(callback) {

  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {

    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(url);
  });
}

function formatURL(url) {
	if (url.slice(-1) !== "/") {
		return url + "/";
	}
	return url;
}

function formatImageURL(url, thumb) {
	const lastFive = url.substr(url.length - 5).toLowerCase();
	const posOfFormat = thumb.lastIndexOf(".");
	const thumbFormat = thumb.substr(posOfFormat);
	if (lastFive == ".gifv") {
		return url.slice(0, -1);
	}
	else if (url.match(/imgur.com\/[a-zA-Z0-9]+$/) && imageFormats.indexOf(thumbFormat)) {
		return url + thumbFormat;
	}
	return url;
}

function filterImages(obj) {
	if (obj.data.selftext_html !== null || 
		  obj.data.url.match(/imgur.com\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/) !== null) {
		return false;
	}
	return true;
}

$(document).ready(function() {

	document.getElementById("pics").addEventListener('click', function() {
	  getCurrentTabUrl(function(url) {
	  	$.getJSON(formatURL(url) + ".json", function(json) {
	  		$.each(json.data.children, function(i, obj) {
	  			if (filterImages(obj)) {
	  				$("#result").append("<img src='" + formatImageURL(obj.data.url, obj.data.thumbnail) + "''>");
	  			}
	  		})
			});
	  });
	});

	document.getElementById("comments").addEventListener('click', function() { 
		getCurrentTabUrl(function(url) {
			let counter = 1;
			$.getJSON(formatURL(url) + ".json", function(json) {
				$.each(json[1].data.children, function(i, obj) {
	  			$("#result").append("<div class='comment'>" + counter + ". " + obj.data.body + "</div>");
	  			counter++;
	  		})
			})
		})
	})
})
