let ctx;
let chart;

const spinner = document.getElementById('spinner');
const canvas = document.getElementById('chart');

/**
 * Initialize chart.js.
 */
function initializeChart() {
	Chart.defaults.color='#8D8D8D';
	Chart.defaults.font.size = 14;
	ctx = canvas.getContext('2d');

	const callback = function (toolTipItems) {
		const dewPoint = toolTipItems[1].parsed.y -
			((100 - toolTipItems[0].parsed.y) / 5)

		return `Dew point: ${dewPoint.toFixed(2)}°C`;
	}

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		foreground:'pink',
		interaction: {
			intersect: false,
			mode: 'index'
		},

		plugins: { tooltip: { callbacks: { footer: callback } } }
	};

	chart = new Chart(ctx, {type: 'line', data: {}, options});
}

if (window.location.pathname != '/tools') {
	initializeChart();
}

document.addEventListener('DOMContentLoaded', function () {
	getCurrentTemperature();

	// Update current temperature every 10sec.
	setInterval(function () {
		getCurrentTemperature();
	}, 10 * 1000);
});

/**
 * Updates chart datasets and labels.
 * 
 * @param {String[]} labels
 * @param {number[]} humidities
 * @param {number[]} temperatures
 */
function updateChartData(labels, humidities, temperatures) {
	chart.config.data = {
		labels: labels,
		datasets: [
			{ label: 'Humidity', data: humidities },
			{ label: 'Temperature', data: temperatures }
		]
	}

	chart.update();
}

/**
 * Deletes a log entry with a specific timestamp from the database.
 * 
 * @param {String} timestamp Format: `2024-05-18 21:39:20`
 */
function deleteLogByTimestamp(timestamp) {
	fetch(`/sensor/logs/${timestamp}`, {
		method: 'DELETE'
	})
	.then(r => r.json())
	.then(result => {
		if (result.count <= 0) {
			showNotification(`Failed to remove a log entry with timestamp: "${timestamp}".`, false);
			return;
		}

		document.getElementById(`log_${timestamp}`).remove();
	});
}

/**
 * Deletes all log entries from the database.
 * 
 * @param {boolean} logPage Indicates if this call is executed from /logs.
 */
function deleteAllLogs(logPage) {
	fetch('/sensor/logs/all', {
		method: 'DELETE'
	})
	.then(r => r.json())
	.then(result => {
		if (result.count <= 0) {
			showNotification('There was no logs to clear.', false);
			return;
		}

		showNotification(`Successfully cleared ${result.count} log entires.`, true);

		if (logPage) {
			document.querySelectorAll('.log_entry').forEach(e => e.remove());
		}
	});
}

/**
 * Gets the average temperature and humidity for each day.
 */
function getAllDataFromSensor() {
	fetch('/sensor')
	.then(r => r.json())
	.then(result => {
		const labels = Object.keys(result);
		const temps = labels.map(label => result[label].temperature);
		const hums = labels.map(label => result[label].humidity);

		updateChartData(labels, temps, hums);
		spinner.remove();
	});
}

/**
 * Gets weekly data from the database by weekstring value.
 * 
 * @param {String} week Format: `2024-W16`
 */
function getWeeklyDataFromSensor(week) {
	week ??= document.getElementById('week').value;

	fetch(`sensor/weekly/${week}`)
	.then(r => r.json())
	.then(result => {
		updateChartData(
			result.labels,
			result.humidities,
			result.temperatures);

			spinner.remove();
	});
}

/**
 * Gets all the data for specific date by datestring.
 * 
 * @param {String} date Format: `2024-04-18`
 */
function getDailyDataFromSensor(date) {
	date ??= document.getElementById('date').value;

	fetch(`/sensor/daily/${date}`)
	.then(r => r.json())
	.then(result => {
		updateChartData(
			result.map(x => x.timestamp),
			result.map(x => x.humidity),
			result.map(x => x.temperature));

			spinner.remove();
	});
}

/**
 * Gets all the data for specific month by monthstring.
 * 
 * @param {String} month Format: `2024-05`
 */
function getMonthlyDataFromSensor(month) {
	month ??= document.getElementById('month').value;

	const y = month.split('-')[0];
	const m = month.split('-')[1];

	fetch(`/sensor/monthly/${y}/${m}`)
	.then(r => r.json())
	.then(result => {
		updateChartData(
			result.labels,
			result.humidities,
			result.temperatures);

			spinner.remove();
	});
}

/**
 * Makes a backup file of the database.
 */
function backupDatabase() {
	fetch('/sensor/database/backup')
	.then(r => r.json())
	.then(result => {
		if (result.success) {
			showNotification(`Successfully created a backup of the database. (${result.path})`, true);
		} else {
			showNotification(`Database backup creation failed. (${result.path})`, false);
		}
	});
}

/**
 * Runs a `VACUUM;` command on the database.
 */
function optimizeDatabase() {
	fetch('/sensor/database/optimize')
	.then(r => r.json())
	.then(() => showNotification('PRAGMA optimize; executed', true));
}

/**
 * Deletes all rows from the database. 
 */
function emptyDatabase() {
	if (!confirm('Are you completely sure you want to erase all of the data from the database?')) {
		return;
	}

	fetch('/sensor/database/empty')
	.then(r => r.json())
	.then(result => {
		showNotification(`Successfully emptied the database.\n(${result.sensor_count} sensor entries, ${result.logs_count} log entries)`, true);
	});
}

/**
 * Gets the current temperature and humidity and sets the navbar text.
 */
function getCurrentTemperature() {
	fetch('/sensor/temperature/current')
	.then(r => r.json())
	.then(result => {
		const currTemp = document.getElementById('current-temperature');
		currTemp.innerText = `${result.temperature}°C`;
		currTemp.title = `Temperature: ${result.temperature}°C\nHumidity: ${result.humidity}%`;
	});
}

/**
 * Sends a notification that download has started.
 */
function downloadDatabaseBackup() {
	showNotification('Database backup download started..', true);
}

/**
 * Toggles hamburger menu on smaller viewports.
 */
function toggleMenu() {
	const nav = document.getElementById('navigation');

	for (var i = 0; i < nav.children.length; ++i) {
		const child = nav.children[i];
		if (child.classList.contains('nav-item')) {
			if (child.classList.contains('nav-visible')) {
				child.classList.remove('nav-visible');
			} else {
				child.classList.add('nav-visible');
			}
		}
	}
}

/**
 * Makes a notification pop up with text.
 * 
 * @param {String} text Text for the notification.
 * @param {boolean} success true: green, false: red
 */
function showNotification(text, success) {
	const popupContainer = document.getElementById('popup-container');
	const popup = document.createElement('div');

	popup.id = 'notification';
	popup.innerText = text;
	popup.classList.add(success ? 'success' : 'error');

	popup.addEventListener('click', () => {
		popup.classList.remove(...popup.classList);
		setTimeout(() => popupContainer.removeChild(popup), 1000);
	});

	popupContainer.appendChild(popup);

	setTimeout(() => popup.classList.add('show'), 100);

	if (!popupContainer.contains(popup)) return;

	setTimeout(() => {
		popup.classList.remove(...popup.classList);
		setTimeout(() => popupContainer.removeChild(popup), 1000);
	}, 5000);
}
