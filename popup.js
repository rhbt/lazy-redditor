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

document.addEventListener('DOMContentLoaded', function() {

  getCurrentTabUrl(function(url) {

  	$.getJSON(formatURL(url)+".json", function(json) {
  		$.each(json.data.children, function(i, obj) {
  			$("#result").append("<img src='" + obj.data.url + "''>");
  		})
		});

  });

});
