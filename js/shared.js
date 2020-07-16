var urlParams = new URLSearchParams(window.location.search);
var chanURL = urlParams.get('sharedText');

try {
	let chURL = new URL(chanURL);
	if (chURL.href.includes('youtube.com/channel/') || chURL.href.includes('youtube.com/user/') || chURL.href.includes('youtube.com/c/')) {
		let chunks = chURL.pathname.split('/');
		let channelInfo = chunks[2];

		let mkCounter = new URLSearchParams();
		mkCounter.set('findChan', channelInfo);
		mkCounter.set('findBy', channelInfo.length == 24 ? "id" : "username");

		if (window.innerWidth <= 768) {
			mkCounter.set('thumbSize', '150');
			mkCounter.set('nameSize', '30');
			mkCounter.set('counterSize', '50');
			mkCounter.set('counterMargin', '30');
		}

		window.location.href = `counter.html?${mkCounter.toString()}`
	} else { throw '' }
} catch (err) { showError('A URL solicitada não é válida', 'A URL que você compartilhou não pertence a um canal do YouTube') }

function showError(text, details) {
	$("#loadingMessage").text(text).addClass("text-danger").click(() => {
		alert(details);
	});
	$("#loadingSpinner").addClass("hidden");
	$("#loadingError").removeClass("hidden");
}
