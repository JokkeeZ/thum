const ctx = document.getElementById('chart');
const chart = new Chart(ctx, { type: 'line', data: {} });

/**
 * Set chart styling to fit the page style.
 */
Chart.defaults.color = "#ADBABD";
Chart.defaults.borderColor = "rgba(255,255,255,0.1)";
Chart.defaults.backgroundColor = "rgba(255,255,0,0.1)";

/**
 * @param {String[]} labels
 * @param {number[]} humidities
 * @param {number[]} temperatures
 * @returns {void}
 */
function setChartData(labels, humidities, temperatures) {
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
 * @param {number[]} temperatures
 * @param {number[]} humidities
 * @returns {number[]}
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
 * @returns {void}
 */
function getAllDataFromSensor() {
	fetch(`/sensor`)
	.then(r => r.json())
	.then(result => {
		setChartData(
			result.map(x => x.timestamp),
			result.map(x => x.humidity),
			result.map(x => x.temperature));
	});
}

/**
 * @param {String} week
 * @returns {void}
 */
function getWeeklyDataFromSensor(week) {
	week ??= document.getElementById('week').value;

	fetch(`sensor/weekly/${week}`)
	.then(r => r.json())
	.then(result => {
		setChartData(
			['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
			result.humidities,
			result.temperatures);
	});
}

/**
 * @param {String} date
 * @returns {void}
 */
function getDailyDataFromSensor(date) {
	date ??= document.getElementById('date').value;

	fetch(`/sensor/${date}`)
	.then(r => r.json())
	.then(result => {
		setChartData(
			result.map(x => x.timestamp.split(' ')[1]),
			result.map(x => x.humidity),
			result.map(x => x.temperature));
	});
}

/**
 * @param {String} month
 */
function getMonthlyDataFromSensor(month) {
	month ??= document.getElementById('month').value;
	
	const y = month.split('-')[0];
	const m = month.split('-')[1];

	fetch(`/sensor/monthly/${y}/${m}`)
	.then(r => r.json())
	.then(result => {
		setChartData(
			Array.from({length: result.temperatures.length}, (_, n) => {
				return `${(n + 1).toString().padStart(2, '0')}.${m}.${y}`;
			}),
			result.humidities,
			result.temperatures);
	});
}
