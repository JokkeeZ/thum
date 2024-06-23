const tvStatus = document.getElementById('tv-status');
const message = document.getElementById('message');
const sendMessage = document.getElementById('send-message');
const timeout = document.getElementById('timeout');

let currentStatus = {
	connected: false,
	is_on: false,
	is_screen_on: false
};

document.addEventListener('DOMContentLoaded', function () {
	checkTVStatus();

	// Check TV status every 1sec.
	setInterval(function () {
		checkTVStatus();
	}, 1000);
});

/**
 * Check if TV is turned on.
 */
function checkTVStatus() {
	fetch('/tv/status')
		.then(r => r.json())
		.then(result => {
			currentStatus = result;
			sendMessage.disabled = !(result.connected && result.is_on);
			setTvStatusText(result.connected, result.is_on);
		});
}

/**
 * Set status text indicating if TV is turned on or off.
 * 
 * @param {boolean} connected
 * @param {boolean} isOn 
 */
function setTvStatusText(connected, isOn) {
	if (connected && isOn) {
		tvStatus.classList.remove('error-txt');
		tvStatus.classList.add('success-txt');
		tvStatus.innerText = 'TV is on';
		return;
	}

	tvStatus.classList.remove('success-txt');
	tvStatus.classList.add('error-txt');
	tvStatus.innerText = 'TV is off';
}

/**
 * Send notification to TV with inverval.
 */
sendMessage.addEventListener('click', function () {
	showNotification(`Timer ${timeout.value} minute(s) added!`, true);
	if (currentStatus.connected && currentStatus.is_on) {
		fetch(`/tv/message/${message.value}/${timeout.value}`)
			.then(r => r.json())
			.then(result => {
				showNotification(result.message, true);
			});
	}
});
