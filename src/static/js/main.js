/** @type {CanvasRenderingContext2D} */
let ctx;
/** @type {Chart} */
let chart;

const chartPointHoverRadius = 8;
const chartLineTension = 0.25;
const chartFontSize = 14;
const chartColor = 'rgba(141, 141, 141, 1)';
const chartGridColor = 'rgba(141, 141, 141, 0.2)';

const spinner = document.getElementById('spinner');

/**
 * @type {HTMLCanvasElement}
 */
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

		scales: {
			x: { grid: { color: 'rgba(141, 141, 141, 0.2)' }},
			y: { grid: { color: 'rgba(141, 141, 141, 0.2)' }},
		},

		plugins: { tooltip: { callbacks: { footer: callback } } }
	};

	chart = new Chart(ctx, {type: 'line', data: {}, options});
}

/**
 * On theme change, sets the bootstrap theme to match
 * user preferred color scheme (light/dark).
 * 
 * @param {MediaQueryList} e 
 */
function onThemeChange(e) {
	const html = document.querySelector('html');
	html.setAttribute('data-bs-theme', e.matches ? 'dark' : 'light');
}

document.addEventListener('DOMContentLoaded', function () {
	const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	darkModeMediaQuery.addEventListener('change', onThemeChange);
	onThemeChange(darkModeMediaQuery);

	if (window.location.pathname != '/tools' && window.location.pathname != '/logs') {
		initializeChart();
	}

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
function deleteLogByTimestamp(idx, timestamp) {
	fetch(`/api/sensor/logs/${timestamp}`, {
		method: 'DELETE'
	})
	.then(r => r.json())
	.then(result => {
		if (result.count <= 0) {
			showNotification(getLocaleValue('log_entry_removal_failed', timestamp), false);
			return;
		}

		document.getElementById(`log_${idx}`).remove();
	});
}

/**
 * Deletes all log entries from the database.
 * 
 * @param {boolean} logPage Indicates if this call is executed from /logs.
 */
function deleteAllLogs(logPage) {
	fetch('/api/sensor/logs/all', {
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
			document.querySelectorAll('.log-entry').forEach(e => e.remove());
		}
	});
}

/**
 * Gets the average temperature and humidity for each day.
 */
function getAllDataFromSensor() {
	fetch('/api/sensor')
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

	fetch(`/api/sensor/weekly/${week}`)
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

	fetch(`/api/sensor/daily/${date}`)
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

	const [y, m] = month.split('-');

	fetch(`/api/sensor/monthly/${y}/${m}`)
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
	fetch('/api/sensor/database/backup')
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
	fetch('/api/sensor/database/optimize')
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

	fetch('/api/sensor/database/empty')
	.then(r => r.json())
	.then(result => {
		showNotification(getLocaleValue('db_empty_success', result.sensor_count, result.logs_count), true);
	});
}

/**
 * Gets the current temperature and humidity and sets the navbar text.
 */
function getCurrentTemperature() {
	fetch('/api/sensor/temperature/current')
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
	fetch('/api/sensor/statistics')
	.then(r => r.json())
	.then(result => {
		const statCount = document.getElementById('stat-count');
		statCount.innerText = getLocaleValue('tools_samples_count', result.count);

		const statFirst = document.getElementById('stat-first');
		statFirst.innerText = getLocaleValue('tools_first_sample', result.first_date);

		const statLast = document.getElementById('stat-last');
		statLast.innerText = getLocaleValue('tools_last_sample', result.last_date);

		const statAvgTemp = document.getElementById('stat-avg-temp');
		statAvgTemp.innerText = getLocaleValue('tools_avg_temperature', result.avg_temperature.toFixed(2));

		const statAvgHum = document.getElementById('stat-avg-hum');
		statAvgHum.innerText = getLocaleValue('tools_avg_humidity', result.avg_humidity.toFixed(2));

		const statWarmestDay = document.getElementById('stat-warmest-day');
		statWarmestDay.innerText = getLocaleValue('tools_warmest_day', 
			result.warmest_day.date,
			result.warmest_day.temperature,
			result.warmest_day.humidity);

		const statColdestDay = document.getElementById('stat-coldest-day');
		statColdestDay.innerText = getLocaleValue('tools_coldest_day', 
			result.coldest_day.date,
			result.coldest_day.temperature,
			result.coldest_day.humidity);
	});
}

/**
 * Sends a notification that download has started.
 */
function downloadDatabaseBackup() {
	showNotification(getLocaleValue('db_backup_started'), true);
}

/**
 * Makes a notification pop up with text.
 * 
 * @param {String} text Text for the notification.
 * @param {boolean} success true: green, false: red
 */
function showNotification(text, success) {
	const notifContainer = document.getElementById('notification-container');
	const template = document.getElementById('notification-template').content.cloneNode(true);

	const notification = template.children[0];
	notification.classList.add(success ? 'alert-success' : 'alert-danger');
	notification.children[1].textContent = success ? getLocaleValue('success') : getLocaleValue('error');
	notification.children[2].innerText = text;

	const dismissNotification = () => {
		if (!notifContainer.contains(notification)) return;

		notification.classList.remove('show');
		setTimeout(() => notifContainer.removeChild(notification), 1000);
	};

	notification.addEventListener('click', () => dismissNotification());

	notifContainer.appendChild(notification);

	setTimeout(() => notification.classList.add('show'), 100);
	setTimeout(() => dismissNotification(), 5000);
}
