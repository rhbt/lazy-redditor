const redditApi = (function redditApiHelper() {

const imageFormats = [".jpeg", ".jpg", ".png", ".gif", ".apng", ".tiff", ".bmp", ".gifv"];

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
  return "." + extension;
}

function getImgurId(url) {
	const parts = url.split("/");
	return parts[parts.length-1];
}

function embedGfycat(url, count) {
	var i = url.indexOf("gfycat.com/") + 11;
	const first = url.slice(0, i);
	let second = url.slice(i);
	const dotPos = second.lastIndexOf(".");
	if (dotPos !== -1) {
	  second = second.slice(0, dotPos)
	}
	const gfycatUrl = "http://www.gfycat.com/" + "ifr/" + second;
	console.log(gfycatUrl);
	$("#result").append("<div class='gfycat' id='" + count + "'>" + "<iframe src='" + gfycatUrl
		+ "' class='gfycat-iframe' frameborder='0'></iframe>" + "</div>");
}

function getImageLink(url, count) {
    const extension = getImageExtension(url);
    if (url.match(/imgur\.com\/[a-zA-Z0-9]+$/)) {
    	return url + ".jpg";
    }
    else if (url.match(/imgur.com\/a\/[a-zA-Z0-9]+$/)) {
    	const id = getImgurId(url);
    	getImgurImage(id, "album", count, function(imageId) {
    		$("#result").append("<div id='" + count + "'><img src='" + "http://imgur.com/" + imageId + ".jpg" + "'></div>");
    		images.sortImages();
    	});
    	
    	return false;
    }
    else if (url.match(/imgur\.com\/gallery\/[a-zA-Z0-9]+$/)) {
    	const id = getImgurId(url);
    	getImgurImage(id, "gallery", count, function(imageId) {
    		$("#result").append("<div id='" + count + "'><img src='" + "http://imgur.com/" + imageId + ".jpg" + "'></div>");
    		images.sortImages();
    	})

    	return false;
    }
    else if (url.match(/gfycat\.com\//) && imageFormats.indexOf(extension) === -1) {
    	embedGfycat(url, count);
  
    	return false;
    }
    else if (extension === ".gifv") {
   		return url.slice(0, -1);
    }
    return url;
}

function extractImageLink(text, count) {
	if (text.match(/\[.+\]\(.+\)/)) {
		const start = text.indexOf("(") + 1;
		const end = text.indexOf(")");
		return getImageLink(text.substr(start, end - start), count);	
	}
	else {
		return getImageLink(text, count);
	}
}

function psbInUrl(url) {
	return url.match(/reddit\.com\/r\/photoshopbattles\//) !== null;
}

function htmlDecode(input) {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

function getImgurImage(id, type, count, callback) {
	$.ajax({
    	url: "https://api.imgur.com/3/" + type + "/" + id + "/images",
        type: "GET",
  	    dataType: "json",
    	headers: {"Authorization": "Client-ID 329db6d9e5bb5ab"}
	}).done(function(data) {
		if (type === "album") {
			callback(data.data[0].id);
		}
		else if (type === "gallery") {
			callback(data.data[0].id)
		}
	});
}

return {
	getCurrentTabUrl: getCurrentTabUrl,
	getImageLink: getImageLink,
	extractImageLink: extractImageLink,
	psbInUrl: psbInUrl,
	htmlDecode: htmlDecode
}

})();