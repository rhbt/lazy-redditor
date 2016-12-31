$(document).ready(function() {

	const saveLastPage = JSON.parse(localStorage.saveLastPage);
	const replyLevels = parseInt(localStorage.replyLevels);

	if (saveLastPage) {
		$('#save-last-page').prop('checked', true);
	}

	$("#reply-levels").val(replyLevels);

	$("#options-tab").on("click", function() {
		$("#options").css("visibility", "visible");
		$("#about").css("visibility", "hidden");
		$("#contact").css("visibility", "hidden");
	});
	$("#about-tab").on("click", function() {
		$("#about").css("visibility", "visible");
		$("#options").css("visibility", "hidden");
		$("#contact").css("visibility", "hidden");
	});
	$("#contact-tab").on("click", function() {
		$("#contact").css("visibility", "visible");
		$("#about").css("visibility", "hidden");
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
			localStorage.saveLastPage = true;
		} 
		else {
			localStorage.saveLastPage = false;
		}
	});
})