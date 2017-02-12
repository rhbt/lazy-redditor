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
	//use button for getting comments, but rename it "Get Pics"
	//if in /r/photoshopbattles thread
	if (url.match(/reddit.com\/r\/photoshopbattles\/comments/)) {
		$("#pics").hide();
		$("#comments").text("Get Pics");
	}
	//hide button to get pictures if in comments section
	else if (url.match(/reddit.com\/r\/[a-zA-Z0-9_-]+\/comments/)) {
		$("#pics").hide();
	}
	//hide button to get comments if not in comments section
	else if (url.match(/reddit.com\/r\/[a-zA-Z0-9_-]+/)) {
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
	//gets image id for Imgur image
	//which is after the last "/"
	const parts = url.split("/");
	return parts[parts.length-1];
}

function formatJsonUrl(url) {
	//char position of "reddit.com"
  const domainPos = url.indexOf("reddit.com");
  //add 10 to char position to get path position 
  const pathPos = domainPos + 10;
  //get part of url after "reddit.com"
  let stringAfterDomain = url.slice(pathPos);
  //check if url has query params
  const queryPos = stringAfterDomain.indexOf("?")
  let queryString = "";
  //if there are query params, get the query string
  if (queryPos !== -1) {
    queryString = stringAfterDomain.slice(queryPos);
    stringAfterDomain = stringAfterDomain.slice(0, queryPos);
  }
  //.json must come after path, but should be before query string
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
	//if in /r/photoshopbattles thread, display pictures instead
	//of comments
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

    //gifv format
    if (extension === ".gifv") {
    	const startOfId = url.lastIndexOf("/");
    	const gifId = url.slice(startOfId + 1, -4);
    	return ["gifv", gifId];
    }
    //not direct Imgur image link, so append .jpg to 
    //end of url to produce direct image link
    else if (url.match(/imgur\.com\/[a-zA-Z0-9]+$/)) {
    	return ["imgurPage", url + ".jpg"];
    }
    //image in Imgur album
    else if (url.match(/imgur.com\/a\/.+/)) {
    	// console.log(url);
    	url = url.match(/imgur.com\/a\/[a-zA-Z0-9]+/)[0];
    	const id = getImgurId(url);
    	return ["imgurAlbum", "album", id];
    }
    //image in Imgur gallery
    else if (url.match(/imgur\.com\/gallery\/[a-zA-Z0-9]+/)) {
    	url = url.match(/imgur\.com\/gallery\/[a-zA-Z0-9]+/)[0];
    	const id = getImgurId(url);
    	return ["imgurGallery", "gallery", id];
    }

    //gif is a gif hosted on Gfycat
    else if (url.match(/gfycat\.com\//) && imageFormats.indexOf(extension) === -1) {
    	return ["gfycat", url];
    }
    //image is a direct link to an image
  	else {
  		return ["directLink", url];
  	}
}

function embedImage(imageTypeAndLink, count) {
	//make API call to Imgur to get image from album or gallery
	if (imageTypeAndLink[0] === "imgurAlbum" || imageTypeAndLink[0] === "imgurGallery") {
		embedImgur(imageTypeAndLink[2], imageTypeAndLink[1], count);
	}
	else if (imageTypeAndLink[0] === "gifv") {
		embedGifv(imageTypeAndLink[1], count);
	}
	//format gif from Gfycat
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
	//make API call to Imgur to get image from
	//album or gallery
	getImgurImage(id, type, function(imageId) {
		$("#result").append("<div id='" 
		+ count + "'><img src='" + "http://imgur.com/" 
		+ imageId + ".jpg" + "'></div>");
		//need to sort images after since images 
		//displayed from API call to Imgur will 
		//load last
		display.sortImages();
   		display.removeBrokenImages();
	})
}

function embedGifv(id, count) {
	$("#result").append("<div id='"
		+ count + "'><video autoplay loop>"
		+ "<source src='" + "http://i.imgur.com/" + id + "webm" 
		+ "' type='video/webm'>"
		+ "<source src='" + "http://i.imgur.com/" + id + "mp4" 
		+ "' type='video/mp4'>"
		+ "</video>"
		+ "</div>");

	setTimeout(function () {      
    	$("#" + count + " > video").get(0).play();
	}, 500);
}

function embedGfycat(url, count) {
	//char position of path
	const pathPos = url.indexOf("gfycat.com/") + 11;
	//get string containing path and query string
	let pathAndQueryString = url.slice(pathPos);
	//find if there is an extension
	const dotPos = pathAndQueryString.lastIndexOf(".");
	//if there is an extension, take it out of pathAndQueryString
	if (dotPos !== -1) {
	  pathAndQueryString = pathAndQueryString.slice(0, dotPos)
	}
	const gfycatUrl = "http://www.gfycat.com/ifr/" + pathAndQueryString;
	//need to use iframe to embed Gfycat url
	$("#result").append("<div class='gfycat' id='" 
		+ count + "'><iframe src='" 
		+ gfycatUrl
		+ "' class='gfycat-iframe' frameborder='0'></iframe></div>");
}

function extractImageLink(text) {
	//finds image link in the form of embedded
	//links with the form: [text](url)
	if (text.match(/\[.+\]\s*\(.+\)/)) {
		const start = text.indexOf("(") + 1;
		const end = text.indexOf(")");
		return text.substr(start, end - start);	
	}
	//find image link that is directly posted
	//in comment
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

//unescapes html
function htmlDecode(input) {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

//makes call to Imgur's API to get images from
//albums and galleries
function getImgurImage(id, type, callback) {
	$.ajax({
    	url: "https://api.imgur.com/3/" + type + "/" + id + "/images",
      type: "GET",
  	  dataType: "json",
    	headers: {"Authorization": "Client-ID 329db6d9e5bb5ab"}
	}).done(function(data) {
		if (data.data.id) {
			callback(data.data.id);
		}
		else {
			callback(data.data[0].id);
		}
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