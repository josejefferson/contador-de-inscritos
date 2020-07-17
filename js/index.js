if (new URLSearchParams(window.location.search).get('pwa') !== null) {
	$('form').removeAttr('target');
}

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js');

	window.addEventListener('beforeinstallprompt', e => {
		if (localStorage.getItem('installPrompt')) {
			e.preventDefault()
		} else {
			localStorage.setItem('installPrompt', 'true')
		}
	})
}

const presetDesktopValues = {
	checks: ["#bgTypeChanThumb", "#thumbPositionTop", "#thumbRadiusCircle"],
	values: {
		"#bgURL": "",
		"#bgOpacity": "50",
		"#bgBlur": "15",
		"#vignette": "0",
		"#thumbSize": "200",
		"#thumbMargin": "10",
		"#nameSize": "50",
		"#counterSize": "120",
		"#counterMargin": "100"
	}
}

const presetMobileValues = {
	checks: ["#bgTypeChanThumb", "#thumbPositionTop", "#thumbRadiusCircle"],
	values: {
		"#bgURL": "",
		"#bgOpacity": "50",
		"#bgBlur": "15",
		"#vignette": "0",
		"#thumbSize": "150",
		"#thumbMargin": "10",
		"#nameSize": "30",
		"#counterSize": "50",
		"#counterMargin": "30"
	}
}

$(window).scroll(() => {
	if ($(window).scrollTop() > $("#startCounter").offset().top + $("#startCounter").outerHeight()) {
		$('#floatingStart').fadeIn();
	} else {
		$('#floatingStart').fadeOut();
	}
});

$('#findChan').on('paste keyup', function () {
	try {
		let chURL = new URL($(this).val());
		if (chURL.href.includes('youtube.com/channel/') || // ID
			chURL.href.includes('youtube.com/c/') || // Custom URL
			chURL.href.includes('youtube.com/user/') || // User
			chURL.href.includes('youtube.com/')) { // Custom URL

			const chunks = chURL.pathname.split('/');
			if (chunks.length != 2) {
				var urlType = chunks[1];
				var channelInfo = chunks[2];
			} else {
				if (['watch', 'playlist'].includes(chunks[1])) throw ''
				var urlType = 'c'
				var channelInfo = chunks[1]
			}

			switch (urlType) {
				case 'channel': $('#findByID').prop('checked', true); break; // ID
				case 'user': $('#findByUsername').prop('checked', true); break; // User
				case 'c': $('#findByName').prop('checked', true); break; // Custom URL
			}

			$(this).val(channelInfo);
		} else { throw '' }
	} catch { }
});

var vue = new Vue({
	el: 'body',
	data: {
		bgOpacity: $('#bgOpacity').val(),
		bgBlur: $('#bgBlur').val(),
		vignette: $('#vignette').val(),
		thumbSize: $('#thumbSize').val(),
		thumbMargin: $('#thumbMargin').val(),
		nameSize: $('#nameSize').val(),
		counterSize: $('#counterSize').val(),
		counterMargin: $('#counterMargin').val()
	}
});

function resetForm() {
	vue.bgOpacity = $('#bgOpacity').val();
	vue.bgBlur = $('#bgBlur').val();
	vue.vignette = $('#vignette').val();
	vue.thumbSize = $('#thumbSize').val();
	vue.thumbMargin = $('#thumbMargin').val();
	vue.nameSize = $('#nameSize').val();
	vue.counterSize = $('#counterSize').val();
	vue.counterMargin = $('#counterMargin').val();
	bgColor.setColor('#000000');
	nameColor.setColor('#ffffff');
	counterColor.setColor('#ffffff');
}

defaultColors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688',
	'#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b',
	'#ffffff', '#000000'
]

const bgColor = Pickr.create({
	el: '#bgColor-picker',
	theme: 'nano',
	default: '#000000',
	comparison: true,
	swatches: defaultColors,
	components: {
		preview: true,
		hue: true,
		interaction: {
			input: true,
			save: true
		}
	},
	strings: {
		save: 'Salvar'
	}
});

const nameColor = Pickr.create({
	el: '#nameColor-picker',
	theme: 'nano',
	default: '#ffffff',
	comparison: true,
	swatches: defaultColors,
	components: {
		preview: true,
		hue: true,
		interaction: {
			input: true,
			save: true
		}
	},
	strings: {
		save: 'Salvar'
	}
});

const counterColor = Pickr.create({
	el: '#counterColor-picker',
	theme: 'nano',
	default: '#ffffff',
	comparison: true,
	swatches: defaultColors,
	components: {
		preview: true,
		hue: true,
		interaction: {
			input: true,
			save: true
		}
	},
	strings: {
		save: 'Salvar'
	}
});

bgColor.on('save', function () {
	$('#bgColor').val(bgColor.getColor().toHEXA().toString());
});

nameColor.on('save', function () {
	$('#nameColor').val(nameColor.getColor().toHEXA().toString());
});

counterColor.on('save', function () {
	$('#counterColor').val(counterColor.getColor().toHEXA().toString());
});

function presetDesktop() {
	if (confirm("AVISO: Se você aplicar este preset, todas as suas personalizações serão perdidas. Continuar?")) {
		presetDesktopValues.checks.forEach(id => $(id).prop("checked", true));
		for (id in presetDesktopValues.values) { $(id).val(presetDesktopValues.values[id]) }
		resetForm();
	}
}

function presetMobile(skipConfirm = false) {
	if (skipConfirm || confirm("AVISO: Se você aplicar este preset, todas as suas personalizações serão perdidas. Continuar?")) {
		presetMobileValues.checks.forEach(id => $(id).prop("checked", true));
		for (id in presetMobileValues.values) { $(id).val(presetMobileValues.values[id]) }
		resetForm();
	}
}

if (window.innerWidth <= 768) {
	presetMobile(true);
}
