	function getCurrentTabUrl(callback) {
		
	  const queryInfo = {
	    active: true,
	    currentWindow: true
	  };

	  chrome.tabs.query(queryInfo, function(tabs) {
	    const tab = tabs[0];
	    const url = tab.url;
	    console.assert(typeof url == 'string', 'tab.url should be a string');
	    callback(url);
	  });
	}

$(document).ready(function() {
var counter = 0;
	document.getElementById("pics").addEventListener('click', function() {
	  getCurrentTabUrl(function(url) {
	  	$.getJSON(url + ".json", function(json) {
	  		$.each(json.data.children, function(i, obj) {
	  			const imageUrl = redditApi.formatImageUrl(obj.data.url);
	  			if (imageUrl) {
	  				$("#result").append("<img src='" + imageUrl + "''>");
	  			}
	  		});
			});
	  });
	});

	document.getElementById("comments").addEventListener('click', function() { 
		
		redditApi.getCurrentTabUrl(function(url) {
			const psbThread = redditApi.psbInUrl(url);
			$.getJSON(url + ".json", function(json) {
					$.each(json[1].data.children, function(i, obj) {
						if (!psbThread) {
							$("#result").append("<li class='comment'>" + (i+1) + ". " + redditApi.htmlDecode(obj.data.body_html) + "</li>");
						}
						else if (psbThread && obj.data.body !== "[deleted]") {
							$("#result").append("<img src='" + redditApi.extractImageLink(obj.data.body) + "'>");
						}
	  			})
			});
		});
	});

})
