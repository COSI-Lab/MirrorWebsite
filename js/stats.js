function condenseByte(byteAmt) {
	
	let res = byteAmt;

	let i = 0;
	const sizeArr = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

	while(res / 1000 >= 1) {
		res /= 1000.0;
		i++;
	}

	return res.toFixed(2) + sizeArr[i];
}

function toGB(byte) {
	return byte / 1000000000.0;
}

function toTB(byte) {
	return byte / 1000000000000.0;
}

function renderStatsTable(section, data) {
	section.querySelector('.content h4').innerText = data.time;
	section.querySelector('.content table .rx').innerText = condenseByte(data.rx);
	section.querySelector('.content table .tx').innerText = condenseByte(data.tx);
	section.querySelector('.content table .total').innerText = condenseByte(data.rx + data.tx);
	section.querySelector('.content table .rate').innerText = data.rate.toFixed(2) + ' Mbit/s';
}

function renderDonut(donutElement, fullPerc, txPerc, rxPerc) {
	let segments = donutElement.getElementsByClassName('donut-segment');

	segments[0].setAttribute('stroke-dasharray', `${fullPerc * txPerc} ${100 - (fullPerc * txPerc)}`);
	segments[0].setAttribute('stroke-dashoffset', "25");
	segments[1].setAttribute('stroke-dasharray', `${fullPerc * rxPerc} ${100 - (fullPerc * rxPerc)}`);
	segments[1].setAttribute('stroke-dashoffset', `${25 - (fullPerc * txPerc)}`);
}

function renderRadials() {
	let todayDonut = document.querySelector('#today_stats .radial svg');
	let yesterdayDonut = document.querySelector('#yesterday_stats .radial svg');
	let thisMonthDonut = document.querySelector('#month_stats .radial svg');
	let lastMonthDonut = document.querySelector('#prev_month_stats .radial svg');

	let today = window.dayData[0];
	let todayTotal = today.rx + today.tx;
	let todayTxPercentage = (today.tx / todayTotal) * 100;
	let todayRxPercentage = (today.rx / todayTotal) * 100;

	let yesterday = window.dayData[1];
	let yesterdayTotal = yesterday.rx + yesterday.tx;
	let yesterdayTxPercentage = (yesterday.tx / yesterdayTotal) * 100;
	let yesterdayRxPercentage = (yesterday.rx / yesterdayTotal) * 100;
	
	let thisMonth = window.monthData[0];
	let thisMonthTotal = thisMonth.rx + thisMonth.tx;
	let thisMonthTxPercentage = (thisMonth.tx / thisMonthTotal) * 100;
	let thisMonthRxPercentage = (thisMonth.rx / thisMonthTotal) * 100;
	
	let lastMonth = window.monthData[1];
	let lastMonthTotal = lastMonth.rx + lastMonth.tx;
	let lastMonthTxPercentage = (lastMonth.tx / lastMonthTotal) * 100;
	let lastMonthRxPercentage = (lastMonth.rx / lastMonthTotal) * 100;

	let dayDiff,
		monthDiff,
		todayFullPercentage,
		yesterdayFullPercentage,
		thisMonthFullPercentage,
		lastMonthFullPercentage;

	if(todayTotal < yesterdayTotal) {
		dayDiff = (todayTotal - yesterdayTotal) / yesterdayTotal;
		todayFullPercentage = (1-(-1*dayDiff)).toFixed(2);
		yesterdayFullPercentage = 1;
	} else {
		dayDiff = (yesterdayTotal - todayTotal) / todayTotal;
		yesterdayFullPercentage = (1-(-1*dayDiff)).toFixed(2);
		todayFullPercentage = 1;
	}

	renderDonut(todayDonut, todayFullPercentage, todayTxPercentage, todayRxPercentage);
	renderDonut(yesterdayDonut, yesterdayFullPercentage, yesterdayTxPercentage, yesterdayRxPercentage);

	if(thisMonthTotal < lastMonthTotal) {
		monthDiff = (thisMonthTotal - lastMonthTotal) / lastMonthTotal;
		thisMonthFullPercentage = (1-(-1*monthDiff)).toFixed(2);
		lastMonthFullPercentage = 1;
	} else {
		monthDiff = (lastMonthTotal - thisMonthTotal) / thisMonthTotal;
		lastMonthFullPercentage = (1-(-1*monthDiff)).toFixed(2);
		thisMonthFullPercentage = 1;
	}
				
	renderDonut(thisMonthDonut, thisMonthFullPercentage, thisMonthTxPercentage, thisMonthRxPercentage);
	renderDonut(lastMonthDonut, lastMonthFullPercentage, lastMonthTxPercentage, lastMonthRxPercentage);
}

function renderMonthChart() {
	let txs = monthData.map(month => month.tx).map(tx => (toTB(tx)).toFixed(3)).reverse();
	let rxs = monthData.map(month => month.rx).map(rx => (toTB(rx)).toFixed(3)).reverse();

	let times = monthData.map(month => month.time).reverse();

	txs = ['tx', ...txs];
	rxs = ['rx', ...rxs];
	times = ['x', ...times];

	var monthChart = c3.generate({
		bindto: '#month-graph',
		data: {
			x: 'x',
			columns: [times, txs, rxs],
			type: 'bar',
			groups: [['rx', 'tx']],
			colors: { tx: '#606060', rx: '#94CD27' }
		},
		axis: {
			rotated: isMobile,
			x: { type: 'category' },
			y: {
				label: {
					text: 'Bandwidth (In TB)',
					position: 'outer-middle'
				}
			}
		}
	})
}

function renderDayChart() {
	let times = dayData.map(day => day.time).reverse();
	let txs = dayData.map(day => day.tx).map(tx => (toTB(tx)).toFixed(3)).reverse();
	let rxs = dayData.map(day => day.rx).map(rx => (toTB(rx)).toFixed(3)).reverse();

	times = ['x', ...times];
	txs = ['tx', ...txs];
	rxs = ['rx', ...rxs];

	var weekChart = c3.generate({
		bindto: '#week-graph',
		data: {
			x: 'x',
			columns: [times, txs, rxs],
			type: 'bar',
			groups: [['rx', 'tx']],
			colors: { tx: '#606060', rx: '#94CD27' }
		},
		axis: {
			rotated: isMobile,
			x: { type: 'category' },
			y: {
				label: {
					text: 'Bandwidth (In TB)',
					position: 'outer-middle'
				}
			}
		}
	});
}

function renderHourChart() {
	let times = hourData.map(hour => hour.time).map(hour => hour.split(' ')[1].split(':')[0]).reverse();
	let txs = hourData.map(hour => hour.tx).map(tx => (toGB(tx)).toFixed(3)).reverse();
	let rxs = hourData.map(hour => hour.rx).map(rx => (toGB(rx)).toFixed(3)).reverse();

	times = ['x', ...times];
	txs = ['tx', ...txs];
	rxs = ['rx', ...rxs];

	var hourChart = c3.generate({
		bindto: '#hour-graph',
		data: {
			x: 'x',
			columns: [times, txs, rxs],
			type: 'bar',
			groups: [['rx', 'tx']],
			colors: { tx: '#606060', rx: '#94CD27' }
		},
		axis: {
			rotated: isMobile,
			x: { type: 'category' },
			y: {
				label: {
					text: 'Bandwidth (In GB)',
					position: 'outer-middle'
				}
			}
		}
	});
}

var isMobile = false;

$(document).ready(function() {
    let todayStatsArea = document.getElementById("today_stats");
	let yesterdayStatsArea = document.getElementById("yesterday_stats");
	let monthStatsArea = document.getElementById("month_stats");
	let prevMonthStatsArea = document.getElementById("prev_month_stats");

	let monthJson = window.monthData[0];
	let prevMonthJson = window.monthData[1];
	let todayJson = window.dayData[0];
	let yesterdayJson = window.dayData[1];

	renderStatsTable(todayStatsArea, todayJson);
	renderStatsTable(yesterdayStatsArea, yesterdayJson);
	renderStatsTable(monthStatsArea, monthJson);
	renderStatsTable(prevMonthStatsArea, prevMonthJson);

	let mql = window.matchMedia("(max-width: 500px)");
	function mqHandler(evt) {
		if(evt.matches) {
			isMobile = true;
		} else {
			isMobile = false;
		}
		renderMonthChart();
		renderDayChart();
		renderHourChart();
	}

	mql.addListener(mqHandler);
	if(window.matchMedia('(max-width: 500px)').matches) {
		isMobile = true;
	}

	renderMonthChart();
	renderDayChart();
	renderHourChart();

	document.getElementById("updated").innerText = LastUpdate;

	renderRadials();
});
