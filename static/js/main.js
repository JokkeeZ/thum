const ctx = document.getElementById('chart');
const chart = new Chart(ctx, { type: 'line', data: {} });

/**
 * Set chart styling to fit the page style.
 */
Chart.defaults.color = "#ADBABD";
Chart.defaults.borderColor = "rgba(255,255,255,0.1)";
Chart.defaults.backgroundColor = "rgba(255,255,0,0.1)";

document.addEventListener('resize', chart.resize());

/**
 * Updates chart datasets and labels.
 * 
 * @param {String[]} labels
 * @param {number[]} humidities
 * @param {number[]} temperatures
 * @returns {void}
 */
function updateChartData(labels, humidities, temperatures) {
	chart.config.data = {
		labels: labels,
		datasets: [
			{ label: 'Humidity', data: humidities }, 
			{ label: 'Temperature', data: temperatures },
			{ label: 'Dew point', data: calculateDewPoints(humidities, temperatures) }
		]
	}

	chart.update();
}

/**
 * Deletes a log entry with a specific timestamp from the db.
 * 
 * @param {string} timestamp
 */
function deleteLogByTimestamp(timestamp) {
	fetch(`/sensor/logs/${timestamp}`, {
		method: 'DELETE'
	})
	.then(r => r.json())
	.then(result => {
		if (result.count > 0) {
			document.getElementById(`log_${timestamp}`).remove();
		}
	});
}

/**
 * Calculates dew points from temperatures and humidities.
 * 
 * @param {number[]} temperatures
 * @param {number[]} humidities
 * @returns {number[]} Array of dew points.
 */
function calculateDewPoints(temperatures, humidities) {
	let values = [];

	const a = 17.27;
	const b = 237.7;

	for (let i = 0; i < temperatures.length; ++i) {
		const gamma = (a * temperatures[i]) / 
			(b + temperatures[i]) + Math.log(humidities[i] / 100);
		values.push((b * gamma) / (a - gamma));
	}

	return values;
}

/**
 * Gets all available data from the db.
 * 
 * @returns {void}
 */
function getAllDataFromSensor() {
	fetch(`/sensor`)
	.then(r => r.json())
	.then(result => {
		updateChartData(
			result.map(x => x.timestamp),
			result.map(x => x.humidities),
			result.map(x => x.temperatures));
	});
}

/**
 * Gets weekly data from the db by weekstring value.
 * 
 * @param {String} week Format: `2024-W10`
 * @returns {void}
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
 * @param {String} date Format: `2024-01-20`
 * @returns {void}
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
 * @param {String} month Format: `2024-01`
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
