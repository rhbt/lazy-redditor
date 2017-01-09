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

function displayButtons(url) {
	if (url.match(/reddit.com\/r\/photoshopbattles\/comments/)) {
		$("#pics").hide();
		$("#comments").text("Get Pics");
	}
	else if (url.match(/reddit.com\/r\/[a-zA-Z0-9]+\/comments/)) {
		$("#pics").hide();
	}
	else if (url.match(/reddit.com\/r\/[a-zA-Z0-9]+/)) {
		$("#comments").hide();
	}
	else {
		$("#pics").hide();
		$("#comments").hide();
	}
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

function displayImages(json, count) {
	$.each(json.data.children, function(i, obj) {
		const imageTypeAndLink = getImageTypeAndLink(obj.data.url);
		embedImage(imageTypeAndLink, count);
		count++;
	});
	display.removeBrokenImages();
}

function displayComments(url, json, count, replyLevels) {
	if (psbInUrl(url)) {
		$.each(json[1].data.children, function(i, obj) { 
			if (obj.data.body !== "[deleted]" && obj.data.body !== undefined) {
				const imageUrl = extractImageLink(obj.data.body);
				const imageTypeAndLink = getImageTypeAndLink(imageUrl);
				embedImage(imageTypeAndLink, count);
				count++;
			}	
		})
	}
	else {
		$.each(json[1].data.children, function(i, obj) { 
			embedComment(count, obj.data, 1);
		    if (obj.data.replies) {
		      traverseComments(obj.data.replies.data.children, 2, replyLevels);
		    }
		  count++;
		})				
	}
	display.removeBrokenImages();
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

function embedComment(commentNumber, commentData, level) {
	let topLevelCommentNumber = "";
	if (commentNumber) {
		topLevelCommentNumber = "<b>" + commentNumber + "</b>. ";
	}

	$("#result").append("<li class='comment level-" + level + "'>"
		+ topLevelCommentNumber
		+ "<b>" + commentData.author + "</b>"
		+ htmlDecode(commentData.body_html) 
		+ "</li>");
}

function traverseComments(json, level, maxLevel) {
	if (level <= maxLevel) {
	  $.each(json, function(i, obj) {
	  	if (obj.data.body_html !== undefined){ 
	  	embedComment(false, obj.data, level);
	  	}
	    if (obj.data.replies) {
	    	traverseComments(obj.data.replies.data.children, level + 1, maxLevel);
	    }
	  }) 
	}
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

function extractImageLink(text) {
	if (text.match(/\[.+\]\s*\(.+\)/)) {
		const start = text.indexOf("(") + 1;
		const end = text.indexOf(")");
		return text.substr(start, end - start);	
	}
	else if (text.match(/http:\/\/\S*/)) {
	  return text.match(/http:\/\/\S*/)[0];
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
			callback(data.data[0].id);
	});
}

return {
	getCurrentTabUrl: getCurrentTabUrl,
	displayButtons: displayButtons,
	formatJsonUrl: formatJsonUrl,
	displayImages: displayImages,
	displayComments: displayComments,
}

})();