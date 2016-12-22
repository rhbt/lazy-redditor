const redditApi = (function redditApiHelper() {

	const imageFormats = [".jpeg", ".jpg", ".png", ".gif", ".apng"];

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

	function formatImageURL(url, thumb) {
		const lastFive = url.substr(url.length - 5).toLowerCase();
		const posOfFormat = thumb.lastIndexOf(".");
		const thumbFormat = thumb.substr(posOfFormat);
		if (lastFive == ".gifv") {
			return url.slice(0, -1);
		}
		else if (url.match(/imgur.com\/[a-zA-Z0-9]+$/) && imageFormats.indexOf(thumbFormat) !== -1) {
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

	function extractImageLink(text) {
		if (text.match(/\[.+\]\(.+\)/)) {
			const start = text.indexOf("(") + 1;
			const end = text.indexOf(")");
			return addImageFormat(text.substr(start, end - start));
		}
		return addImageFormat(text);
	}

	function addImageFormat(url) {
		const posOfFormat = url.lastIndexOf(".");
		const format = url.substr(posOfFormat);
		if (imageFormats.indexOf(format) !== -1) {
			return url;
		}
		return url + ".jpg";
	}

	function psbInURL(url) {
		if (url.match(/reddit\.com\/r\/photoshopbattles/)) {
			return true;
		}
		return false;
	}

	return {
		getCurrentTabUrl: getCurrentTabUrl,
		formatImageURL: formatImageURL,
		filterImages: filterImages,
		extractImageLink: extractImageLink,
		addImageFormat: addImageFormat,
		psbInURL: psbInURL
	}

})();