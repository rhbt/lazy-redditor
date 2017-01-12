$(document).ready(function() {
 	let saveLastPage, replyLevels;

 	try {
 		saveLastPage = JSON.parse(localStorage.saveLastPage);	
 	}
 	catch (error) {
 	    saveLastPage = false;
 	}

 	replyLevels = parseInt(localStorage.replyLevels);	

 	if (!replyLevels) {
 		replyLevels = 1;
 	}

	if (saveLastPage) {
		$('#save-last-page').prop('checked', true);
	}

	$("#reply-levels").val(replyLevels);

	$("#options-tab").on("click", function() {
		$("#options").css("visibility", "visible");
		$("#about").css("visibility", "hidden");

	});
	$("#about-tab").on("click", function() {
		$("#about").css("visibility", "visible");
		$("#options").css("visibility", "hidden");
	});


	$(document).on("submit", "#options-form", function() {
		const replyLevels = $("#reply-levels").val();
		const saveLastPageChecked = $("#save-last-page").is(":checked");
		
		if (replyLevels >= 1 &&  replyLevels <= 5) {
			localStorage.replyLevels = replyLevels;
		}
		else {
			localStorage.replyLevels = 1;
		}

		if (saveLastPageChecked) {
			console.log("Saved");
			localStorage.saveLastPage = true;
		} 
		else {
			console.log("Not Saved");
			localStorage.saveLastPage = false;
		}
	});
})