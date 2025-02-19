let ctx;
let chart;

const chartPointHoverRadius = 8;
const chartLineTension = 0.25;
const chartFontSize = 14;
const chartColor = '#8D8D8D';

const spinner = document.getElementById('spinner');
const canvas = document.getElementById('chart');

/**
 * Get locale value with key. 
 * Optionally replaces placeholders from the string with given values.
 * 
 * @param {String} key Locale key
 * @param {...*} values Values to be replaced from the locale value.
 * 
 * @returns {String} 
 */
function getLocaleValue(key, ...values) {
	return locales[current_locale][key].replace(/{(\d+)}/g, (match, index) => {
		return values[index] || match;
	});
}

/**
 * Initialize chart.js.
 */
function initializeChart() {
	Chart.defaults.color = chartColor;
	Chart.defaults.font.size = chartFontSize;
	ctx = canvas.getContext('2d');

	const callback = function (toolTipItems) {
		const dewPoint = toolTipItems[1].parsed.y - ((100 - toolTipItems[0].parsed.y) / 5);
		return getLocaleValue('dew_point', dewPoint.toFixed(2));
	}

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			intersect: false,
			mode: 'index'
		},

		plugins: { tooltip: { callbacks: { footer: callback } } }
	};

	chart = new Chart(ctx, {type: 'line', data: {}, options});
}

if (window.location.pathname != '/tools' && window.location.pathname != '/logs') {
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
			{ 
				label: getLocaleValue('humidity'),
				data: humidities,
				pointHoverRadius: chartPointHoverRadius,
				tension: chartLineTension
			},
			{ 
				label: getLocaleValue('temperature'),
				data: temperatures,
				pointHoverRadius: chartPointHoverRadius,
				tension: chartLineTension
			}
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
			showNotification(getLocaleValue('log_entry_removal_failed', timestamp), false);
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
			showNotification(getLocaleValue('log_clear_fail'), false);
			return;
		}

		showNotification(getLocaleValue('log_clear_success', result.count), true);

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

		updateChartData(labels, hums, temps);
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
		updateChartData(result.labels, result.humidities, result.temperatures);
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
		updateChartData(result.labels, result.humidities, result.temperatures);
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
		const messageKey = result.success ? 'db_backup_success' : 'db_backup_fail';
		showNotification(getLocaleValue(messageKey, result.path), result.success);
	});
}

/**
 * Runs a `VACUUM;` command on the database.
 */
function optimizeDatabase() {
	fetch('/sensor/database/optimize')
	.then(r => r.json())
	.then(result => {
		const messageKey = result.success ? 'db_optimize_success' : 'db_optimize_fail';
		showNotification(getLocaleValue(messageKey), result.success);
	});
}

/**
 * Deletes all rows from the database. 
 */
function emptyDatabase() {
	if (!confirm(getLocaleValue('db_empty_confirm'))) {
		return;
	}

	fetch('/sensor/database/empty')
	.then(r => r.json())
	.then(result => {
		showNotification(getLocaleValue('db_empty_success', result.sensor_count, result.logs_count), true);
	});
}

/**
 * Gets the current temperature and humidity and sets the navbar text.
 */
function getCurrentTemperature() {
	fetch('/sensor/temperature/current')
	.then(r => r.json())
	.then(result => {
		if (!result.success) {
			return;
		}

		const currTemp = document.getElementById('current-temperature');
		currTemp.innerText = `${result.temperature}°C`;
		currTemp.title = getLocaleValue('nav_temp_hum_tooltip', result.temperature, result.humidity);
	});
}

/**
 * Get sensor statistics from the database.
 */
function getSensorStatistics() {
	fetch('/sensor/statistics')
	.then(r => r.json())
	.then(result => {
		const statCount = document.getElementById('stat-count');
		statCount.innerText = getLocaleValue('tools_samples_count', result.data[0]);

		const statFirst = document.getElementById('stat-first');
		statFirst.innerText = getLocaleValue('tools_first_sample', result.data[1]);

		const statLast = document.getElementById('stat-last');
		statLast.innerText = getLocaleValue('tools_last_sample', result.data[2]);

		const statAvgTemp = document.getElementById('stat-avg-temp');
		statAvgTemp.innerText = getLocaleValue('tools_avg_temperature', result.data[3].toFixed(2));

		const statAvgHum = document.getElementById('stat-avg-hum');
		statAvgHum.innerText = getLocaleValue('tools_avg_humidity', result.data[4].toFixed(2));

		const statWarmestDay = document.getElementById('stat-warmest-day');
		statWarmestDay.innerText = getLocaleValue('tools_warmest_day', 
			result.warmest[0],
			result.warmest[1],
			result.warmest[2]);

		const statColdestDay = document.getElementById('stat-coldest-day');
		statColdestDay.innerText = getLocaleValue('tools_coldest_day', 
			result.coldest[0],
			result.coldest[1],
			result.coldest[2]);
	});
}

/**
 * Sends a notification that download has started.
 */
function downloadDatabaseBackup() {
	showNotification(getLocaleValue('db_backup_started'), true);
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
