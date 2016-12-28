const redditApi = (function redditApiModule() {

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

function formatJsonUrl(url) {
  const domainPos = url.indexOf("reddit.com");
  const pathPos = domainPos + 10;
  let stringAfterDomain = url.slice(pathPos);
  const queryPos = stringAfterDomain.indexOf("?")
  let queryString = "";
  if (queryPos !== -1) {
    queryString = stringAfterDomain.slice(queryPos);
    stringAfterDomain = stringAfterDomain.slice(0, queryPos);
  }
  return "http://www.reddit.com" + stringAfterDomain + ".json" + queryString;
}


function getImageTypeAndLink(url) {
    const extension = getImageExtension(url);
    if (extension === ".gifv") {
    	url = url.slice(0, -1);
    }
    if (url.match(/imgur\.com\/[a-zA-Z0-9]+$/)) {
    	return ["imgurPage", url + ".jpg"];
    }
    else if (url.match(/imgur.com\/a\/[a-zA-Z0-9]+$/)) {
    	const id = getImgurId(url);
    	return ["imgurAlbum", "album", id];
    }
    else if (url.match(/imgur\.com\/gallery\/[a-zA-Z0-9]+$/)) {
    	const id = getImgurId(url);
    	return ["imgurGallery", "gallery", id];
    }
    else if (url.match(/gfycat\.com\//) && imageFormats.indexOf(extension) === -1) {
    	return ["gfycat", url];
    }
  	else {
  		return ["directLink", url];
  	}
}

function embedImage(imageTypeAndLink, count) {
	if (imageTypeAndLink[0] === "imgurAlbum" || imageTypeAndLink[0] === "imgurGallery") {
		embedImgur(imageTypeAndLink[2], imageTypeAndLink[1], count);
		
	}
	else if (imageTypeAndLink[0] === "gfycat") {
		embedGfycat(imageTypeAndLink[1], count)
	}
	else {
		embedDirectLink(imageTypeAndLink[1], count);
	}
}

function embedDirectLink(imageUrl, count) {
	$("#result").append("<div id='" 
		+ count + "'><img src='" 
		+ imageUrl + "'></div");
}

function embedComment(commentNumber, commentBody) {
	$("#result").append("<li class='comment'>" 
		+ (commentNumber+1) 
		+ ". " 
		+ redditApi.htmlDecode(commentBody) 
		+ "</li>");
}

function embedImgur(id, type, count) {
	getImgurImage(id, type, function(imageId) {
		$("#result").append("<div id='" 
			+ count + "'><img src='" + "http://imgur.com/" 
			+ imageId + ".jpg" + "'></div>");
		
		display.sortImages();
    display.removeBrokenImages();
	})
}

function embedGfycat(url, count) {
	const pathPos = url.indexOf("gfycat.com/") + 11;
	let pathAndParams = url.slice(pathPos);
	const dotPos = pathAndParams.lastIndexOf(".");
	if (dotPos !== -1) {
	  pathAndParams = pathAndParams.slice(0, dotPos)
	}
	const gfycatUrl = "http://www.gfycat.com/ifr/" + pathAndParams;
	$("#result").append("<div class='gfycat' id='" 
		+ count + "'><iframe src='" 
		+ gfycatUrl
		+ "' class='gfycat-iframe' frameborder='0'></iframe></div>");
}

function extractImageLink(text, count) {
	if (text.match(/\[.+\]\(.+\)/)) {
		const start = text.indexOf("(") + 1;
		const end = text.indexOf(")");
		return text.substr(start, end - start);	
	}
	else {
		return text;
	}
}

function psbInUrl(url) {
	return url.match(/reddit\.com\/r\/photoshopbattles\//) !== null;
}

function htmlDecode(input) {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

function getImgurImage(id, type, callback) {
	$.ajax({
    	url: "https://api.imgur.com/3/" + type + "/" + id + "/images",
      type: "GET",
  	  dataType: "json",
    	headers: {"Authorization": "Client-ID 329db6d9e5bb5ab"}
	}).done(function(data) {
			if (type === "gallery") {
				callback(data.data.id);
			}
			else {
				callback(data.data[0].id);
			}
	});
}

return {
	getCurrentTabUrl: getCurrentTabUrl,
	formatJsonUrl: formatJsonUrl,
	getImageTypeAndLink: getImageTypeAndLink,
	extractImageLink: extractImageLink,
	embedImage: embedImage,
	embedComment: embedComment,
	embedImgur: embedImgur,
	embedGfycat: embedGfycat,
	psbInUrl: psbInUrl,
	htmlDecode: htmlDecode
}

})();