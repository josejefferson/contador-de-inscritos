const defaultAPIKey = "AIzaSyAwdIyQX7-nEsdG-Fs-A8uWuFxmROXJi9w";
var defaultTitle = document.title;
var info = {};
var subsTimer;
var attempts = 0;
var error = false;
var cursor = true;
const tips = ["No seu computador, pressione Ctrl + D para salvar seu contador como favorito",
	"Clique duas vezes para entrar em tela cheia",
	"Clique com o botão direito do mouse para ocultar o ponteiro",
	"Você pode adicionar o contador à tela inicial"]

$('body').dblclick(fullscreen);
$('body').contextmenu(() => {
	if (cursor == true) {
		$('*').css('cursor', 'none');
		cursor = false;
		return false;
	} else {
		$('*').css('cursor', 'auto');
		cursor = true;
		return false;
	}
});
$('#tip').text(`Dica: ${tips[Math.floor(Math.random() * tips.length)]}`);
$("#errorGetSubs").click(() => alert("Ocorreu um erro ao atualizar o contador de inscritos. Talvez o contador esteja desatualizado"));
$("#hideSubCount").click(() => alert("Este canal não exibe publicamente seu contador de inscritos"));

window.onload = async () => {
	!error && setUserInfo();
	!error && repairParams();
	!error && await getChannel();
	!error && setDataURLs();
	!error && await getChannelData();
	!error && writeSettings();
	!error && buildManifest();
	!error && startSubCounter();
}

function setUserInfo() {
	let urlParams = new URLSearchParams(window.location.search);
	urlParams.forEach((value, param) => {
		info[param] = value;
	});
}

function repairParams() {
	!info.findChan && (info.findChan = "YouTube");
	!info.bgColor && (info.bgColor = "#000000");
	!info.bgURL && (info.bgURL = "");
	!info.bgOpacity && (info.bgOpacity = "50");
	!info.bgBlur && (info.bgBlur = "15");
	!info.vignette && (info.vignette = "0");
	!info.thumbSize && (info.thumbSize = "200");
	!info.thumbRadius && (info.thumbRadius = "50");
	!info.thumbMargin && (info.thumbMargin = "10");
	!info.nameSize && (info.nameSize = "50");
	!info.counterSize && (info.counterSize = "120");
	!info.counterMargin && (info.counterMargin = "100");
	!info.nameColor && (info.nameColor = "#FFFFFF");
	!info.counterColor && (info.counterColor = "#FFFFFF");
	!info.apiKey && (info.apiKey = "")
	!info.customCSS && (info.customCSS = "");

	!["name", "username", "id"].includes(info.searchType) && (info.searchType = "name");
	!["solid", "url", "chanThumb"].includes(info.bgType) && (info.bgType = "chanThumb");
	!["left", "top"].includes(info.thumbPosition) && (info.thumbPosition = "top");
}

async function getChannel() {
	if (info.searchType == "name") {
		$("#loadingMessage").text("Procurando canal");

		await $.getJSON(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${info.findChan}&key=${info.apiKey || defaultAPIKey}`, data => {
			if (data["pageInfo"]["totalResults"] != 0) {
				replaceQuery("searchType", "id");
				replaceQuery("findChan", data['items'][0]['id']['channelId']);
				info.searchType = "id";
				info.findChan = data['items'][0]['id']['channelId'];
			} else {
				showError("Não foi possível localizar o canal", "Tente verificar se você digitou o nome/nome de usuário/ID do canal corretamente");
			}
		}).fail(err => {
			err.status == "403" && showError(`Erro de autorização (${err.status} ${err.statusText})`, "O YouTube limita a 10000 consultas ao seu servidor por dia\nTente inserir uma chave de API sua");
			err.status != "403" && showError(`Erro ${err.status} ${err.statusText}`, "Sem detalhes sobre este erro");
		});
	}
}

function setDataURLs() {
	info.searchType == "username" && (info.channelInfoURL = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&forUsername=${info.findChan}&key=${info.apiKey || defaultAPIKey}`);
	info.searchType == "id" && (info.channelInfoURL = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${info.findChan}&key=${info.apiKey || defaultAPIKey}`);
}

async function getChannelData() {
	$("#loadingMessage").text("Procurando informações do canal");

	await $.getJSON(info.channelInfoURL, data => {
		if (data["pageInfo"]["totalResults"] != 0) {
			info.name = data['items'][0]['snippet']['title'];
			info.chanThumb = data['items'][0]['snippet']['thumbnails']['medium']['url'];
		} else {
			showError("Não foi possível localizar o canal", "Tente verificar se você digitou o nome/nome de usuário/ID do canal corretamente");
		}
	}).fail(err => {
		err.status == "403" && showError(`Erro de autorização (${err.status} ${err.statusText})`, "O YouTube limita a 10000 consultas ao seu servidor por dia\nTente inserir uma chave de API sua");
		err.status != "403" && showError(`Erro ${err.status} ${err.statusText}`, "Sem detalhes sobre este erro");
	})
}

function writeSettings() {
	defaultTitle = `Contador de inscritos de ${info.name}`;
	document.title = defaultTitle;
	$('link[rel="shortcut icon"]').attr('href', info.chanThumb || 'favicon.png');
	$('.chanThumb').attr('src', info.chanThumb);
	$('.name').text(info.name);
	$('#chanDetails').addClass((info.thumbPosition == 'top') ? 'imgTop' : 'imgLeft');
	$('body').css('background-color', info.bgColor);
	$('#subCounterContainer').css('box-shadow', `inset 0 0 ${info.vignette}px #000`);
	$('#backgroundImage').css({
		"background-color": info.bgColor,
		"background-image": `url('${info.bgType == "url" ? info.bgURL : info.bgType == "chanThumb" && info.chanThumb}')`,
		"filter": `blur(${info.bgBlur}px) opacity(${info.bgOpacity}%)`
	});
	$('.countContainer').css('margin-top', `${info.counterMargin}px`);
	$('.odometer').css({
		"color": info.counterColor,
		"font-size": `${info.counterSize}px`
	});
	$('.chanThumb').css({
		"border-radius": `${info.thumbRadius}%`,
		"width": `${info.thumbSize}px`
	});
	$('.imgTop .chanThumb').css('margin-bottom', `${info.thumbMargin}px`);
	$('.imgLeft .chanThumb').css('margin-right', `${info.thumbMargin}px`);
	$('.name').css({
		"color": info.nameColor,
		"font-size": `${info.nameSize}px`
	});
	$('head').append(`<style>${info.customCSS}</style>`);
}

function buildManifest() {
	let manifest = {
		name: "Contador de inscritos",
		short_name: `Contador de inscritos de ${info.name}`,
		description: "lol",
		icons: [
			{
				src: info.chanThumb,
				type: "image/jpg",
				sizes: "240x240"
			}
		],
		start_url: window.location.search,
		scope: ".",
		display: "standalone",
		background_color: "#ffffff",
		"theme_color": "#ffffff"
	}

	let manifestJSON = JSON.stringify(manifest);
	let manifestURI = encodeURIComponent(manifestJSON);
	let manifestURL = `data:application/json,${manifestURI}`;
	$('head').append(`<link rel="manifest" href="${manifestURL}">`);
}

function startSubCounter() {
	subCounterTimer = window.setTimeout(getSubs, 2000);
}

function stopSubCounter() {
	clearTimeout(subCounterTimer);
}

function getSubs() {
	$("#loadingMessage").text("Verificando número de inscritos do canal");

	info.searchType == 'id' && (dataURL = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${info.findChan}&key=${info.apiKey || defaultAPIKey}`);
	info.searchType == 'username' && (dataURL = `https://www.googleapis.com/youtube/v3/channels?part=statistics&forUsername=${info.findChan}&key=${info.apiKey || defaultAPIKey}`);

	$.getJSON(dataURL, data => {
		let count = data.items[0].statistics.subscriberCount;
		attempts = 0;
		$('#subCounter').html(count);
		$('#errorGetSubs').addClass('hidden');
		if (data.items[0].statistics.hiddenSubscriberCount) {
			$('#hideSubCount').removeClass('hidden');
			document.title = defaultTitle;
		} else {
			$('#hideSubCount').addClass('hidden');
			document.title = `${count} inscritos - ${defaultTitle}`;
		}
	}).fail(() => {
		attempts++;
		if (attempts >= 5) $('#errorGetSubs').removeClass('hidden');
	}).always(() => {
		subCounterTimer = window.setTimeout(getSubs, 10000);
	});

	$('#loadingScreen').fadeOut(200);
}

function replaceQuery(param, value) {
	let urlQuery = new URLSearchParams(window.location.search);
	urlQuery.set(param, value);
    let newURL = window.location.origin + window.location.pathname + "?" + urlQuery.toString();
    window.history.pushState({ path: newURL }, '', newURL);
}

function showError(text, details) {
	error = true;
	$("#loadingMessage").text(text).addClass("text-danger").click(() => {
		alert(details);
	});
	$("#loadingSpinner").addClass("hidden");
	$("#loadingError").removeClass("hidden");
}

function fullscreen() {
	var doc = window.document;
	var docEl = doc.documentElement;

	var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
	var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

	if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
		requestFullScreen.call(docEl);
	} else {
		cancelFullScreen.call(doc);
	}
}
