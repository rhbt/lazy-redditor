const redditApi = (function redditApiHelper() {

	const imageFormats = [".jpeg", ".jpg", ".png", ".gif", ".apng", "tiff", "bmp", "gifv"];

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

	function getImageExtension(url) {
	  const parts = url.split('.');
	  let extension = parts[parts.length-1];
	  if (extension === "gifv") {
	  	extension = "gif";
	  }
	  return "." + extension;
	}

	function formatImageUrl(url) {
	    const extension = getImageExtension(url);
	    if (url.match(/imgur.com\/[a-zA-Z0-9]+$/)) {
	    	return url + ".jpg";
	    }
	    else if (imageFormats.indexOf(extension) !== -1) {
	      return url;
	    }
	    return false;
	}

	function extractImageLink(text) {
		const start = text.indexOf("(") + 1;
		const end = text.indexOf(")");
		return formatImageUrl(text.substr(start, end - start));
	}

	function psbInUrl(url) {
		return url.match(/reddit\.com\/r\/photoshopbattles\//) !== null;
	}

	function htmlDecode(input) {
	  const doc = new DOMParser().parseFromString(input, "text/html");
	  return doc.documentElement.textContent;
	}

	return {
		getCurrentTabUrl: getCurrentTabUrl,
		formatImageUrl: formatImageUrl,
		extractImageLink: extractImageLink,
		psbInUrl: psbInUrl,
		htmlDecode: htmlDecode
	}

})();