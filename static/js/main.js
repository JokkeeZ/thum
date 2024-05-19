const ctx = document.getElementById('chart').getContext('2d');
const chart = new Chart(ctx, { type: 'line', data: {}, options: {
	responsive: true,
	maintainAspectRatio: false,
	interaction: {
		intersect: false,
		mode: 'index'
	},
	plugins: {
		tooltip: {
			callbacks: {
				footer: function(toolTipItems) {
					const dewPoint = toolTipItems[1].parsed.y - 
						((100 - toolTipItems[0].parsed.y) / 5)
				
					return `Dew point: ${dewPoint.toFixed(2)}°C`;
				}
			}
		}
	}
}});

/**
 * Set chart styling to fit the page style.
 */
Chart.defaults.color = "#ADBABD";
Chart.defaults.borderColor = "rgba(255,255,255,0.1)";
Chart.defaults.backgroundColor = "rgba(255,255,0,0.1)";

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
 */
function deleteAllLogs(logPage) {
	fetch('/sensor/logs/all', {
		method: 'DELETE'
	})
	.then(r => r.json())
	.then(result => {
		if (result.count <= 0) {
			showNotification('Failed to clear all logs. (There was no logs)', false);
			return;
		}

		showNotification(`Successfully cleared ${result.count} log entires.`, true);

		if (logPage) {
			document.querySelectorAll('.log_entry').forEach(e => e.remove());
		}
	});
}

/**
 * Gets four AVG samples of data for each day from the database.
 * 
 * 1st sample: `00-06`
 * 
 * 2nd sample: `06-12`
 * 
 * 3rd sample: `12-18`
 * 
 * 4th sample: `18-00`
 */
function getAllDataFromSensor() {
	fetch('/sensor')
	.then(r => r.json())
	.then(result => {
		const labels = Object.keys(result);
		const temps = [];
		const hums = [];
		
		for (let i = 0; i < labels.length; ++i) {
			const label = labels[i];
			temps.push(...result[label].temp);
			hums.push(...result[label].hum);
		}

		updateChartData(labels.flatMap(i => [i, i, i, i]), hums, temps);
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
	});
}

/**
 * Gets all the data for specific date by datestring.
 * 
 * @param {String} date Format: `2024-04-18`
 */
function getDailyDataFromSensor(date) {
	date ??= document.getElementById('date').value;

	fetch(`/sensor/${date}`)
	.then(r => r.json())
	.then(result => {
		updateChartData(
			result.map(x => x.timestamp.split(' ')[1]),
			result.map(x => x.humidities),
			result.map(x => x.temperatures));
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
	.then(result => {
		showNotification('Database VACUUM; executed', true);
	});
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
 * Sends a notification that download has started.
 */
function downloadDatabaseBackup() {
	showNotification('Database backup download started..', true);
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
