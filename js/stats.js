function condenseByte(byteAmt) {
  let res = byteAmt;

  let i = 0;
  const sizeArr = ["B", "KB", "MB", "GB", "TB", "PB"];

  while (res / 1000 >= 1) {
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
  section.querySelector(".content h4").innerText = data.time;
  section.querySelector(".content table .rx").innerText = condenseByte(data.rx);
  section.querySelector(".content table .tx").innerText = condenseByte(data.tx);
  section.querySelector(".content table .total").innerText = condenseByte(
    data.rx + data.tx
  );
  section.querySelector(".content table .rate").innerText =
    data.rate.toFixed(2) + " Mbit/s";
}

function renderDonut(donutElement, fullPerc, txPerc, rxPerc) {
  let segments = donutElement.getElementsByClassName("donut-segment");

  function setupDonut() {
    segments[0].setAttribute("stroke-dashoffset", "25");
    segments[1].setAttribute("stroke-dashoffset", `${25 - fullPerc * txPerc}`);

    segments[0].setAttribute("stroke-dasharray", "0 100");
    segments[1].setAttribute("stroke-dasharray", "0 100");

    segments[0].setAttribute("stroke", "#606060");
    segments[1].setAttribute("stroke", "#94CD27");
  }

  requestAnimationFrame(function() {
    setupDonut();
    requestAnimationFrame(function() {
      segments[0].setAttribute(
        "stroke-dasharray",
        `${fullPerc * txPerc} ${100 - fullPerc * txPerc}`
      );
      setTimeout(function() {
        segments[1].setAttribute(
          "stroke-dasharray",
          `${fullPerc * rxPerc} ${100 - fullPerc * rxPerc}`
        );
      }, 600);
    });
  });
}

function renderRadials() {
  let todayDonut = document.querySelector("#today_stats .radial svg");
  let yesterdayDonut = document.querySelector("#yesterday_stats .radial svg");
  let thisMonthDonut = document.querySelector("#month_stats .radial svg");
  let lastMonthDonut = document.querySelector("#prev_month_stats .radial svg");

  let today = window.dayData[0];
  let todayTotal = today.rx + today.tx;
  let todayTxPercentage = today.tx / todayTotal * 100;
  let todayRxPercentage = today.rx / todayTotal * 100;

  let yesterday = window.dayData[1];
  let yesterdayTotal = yesterday.rx + yesterday.tx;
  let yesterdayTxPercentage = yesterday.tx / yesterdayTotal * 100;
  let yesterdayRxPercentage = yesterday.rx / yesterdayTotal * 100;

  let thisMonth = window.monthData[0];
  let thisMonthTotal = thisMonth.rx + thisMonth.tx;
  let thisMonthTxPercentage = thisMonth.tx / thisMonthTotal * 100;
  let thisMonthRxPercentage = thisMonth.rx / thisMonthTotal * 100;

  let lastMonth = window.monthData[1];
  let lastMonthTotal = lastMonth.rx + lastMonth.tx;
  let lastMonthTxPercentage = lastMonth.tx / lastMonthTotal * 100;
  let lastMonthRxPercentage = lastMonth.rx / lastMonthTotal * 100;

  let dayDiff,
    monthDiff,
    todayFullPercentage,
    yesterdayFullPercentage,
    thisMonthFullPercentage,
    lastMonthFullPercentage;

  if (todayTotal < yesterdayTotal) {
    dayDiff = (todayTotal - yesterdayTotal) / yesterdayTotal;
    todayFullPercentage = (1 - -1 * dayDiff).toFixed(2);
    yesterdayFullPercentage = 1;
  } else {
    dayDiff = (yesterdayTotal - todayTotal) / todayTotal;
    yesterdayFullPercentage = (1 - -1 * dayDiff).toFixed(2);
    todayFullPercentage = 1;
  }

  renderDonut(
    todayDonut,
    todayFullPercentage,
    todayTxPercentage,
    todayRxPercentage
  );
  renderDonut(
    yesterdayDonut,
    yesterdayFullPercentage,
    yesterdayTxPercentage,
    yesterdayRxPercentage
  );

  if (thisMonthTotal < lastMonthTotal) {
    monthDiff = (thisMonthTotal - lastMonthTotal) / lastMonthTotal;
    thisMonthFullPercentage = (1 - -1 * monthDiff).toFixed(2);
    lastMonthFullPercentage = 1;
  } else {
    monthDiff = (lastMonthTotal - thisMonthTotal) / thisMonthTotal;
    lastMonthFullPercentage = (1 - -1 * monthDiff).toFixed(2);
    thisMonthFullPercentage = 1;
  }

  renderDonut(
    thisMonthDonut,
    thisMonthFullPercentage,
    thisMonthTxPercentage,
    thisMonthRxPercentage
  );
  renderDonut(
    lastMonthDonut,
    lastMonthFullPercentage,
    lastMonthTxPercentage,
    lastMonthRxPercentage
  );
}

function calcMonthEstimate(currAgg, rate) {
  const numDays = moment().daysInMonth();

  // rate * 8 (to MB) * 3600 (to hours) * 24 (to day) * numDays (to month) / 1000 (to GB) / 1000 (to TB)
  let estimate = rate / 8 * 3600 * 24 * numDays / 1000 / 1000 - currAgg;

  return parseFloat(estimate.toFixed(3));
}

function renderMonthChart() {
  let txs = monthData
    .map(month => month.tx)
    .map(tx => toTB(tx).toFixed(3))
    .reverse();
  let rxs = monthData
    .map(month => month.rx)
    .map(rx => toTB(rx).toFixed(3))
    .reverse();
  let rates = monthData
    .map(month => month.rate)
    .map(rate => rate.toFixed(2))
    .reverse();
  let times = monthData.map(month => month.time).reverse();

  let estimates = [];
  let estimate = calcMonthEstimate(
    parseFloat(rxs[11]) + parseFloat(txs[11]),
    rates[11]
  );

  txs = ["tx", ...txs];
  rxs = ["rx", ...rxs];
  times = ["x", ...times];
  estimates = [
    "estimated additional bandwidth",
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    estimate
  ];

  var monthChart = c3.generate({
    bindto: "#month-graph",
    data: {
      x: "x",
      columns: [times, rxs, txs, estimates],
      type: "bar",
      groups: [["rx", "tx", "estimated additional bandwidth"]],
      colors: {
        tx: "#606060",
        rx: "#94CD27",
        "estimated additional bandwidth": "#D8D8D8"
      },
      order: null
    },
    tooltip: {
      format: {
        title: function(x) {
          return "Avg Rate: " + rates[x] + "Mbit/s";
        },
        value: function(value) {
          return value + "TB";
        }
      }
    },
    axis: {
      rotated: isMobile,
      x: { type: "category" },
      y: {
        label: {
          text: "Bandwidth (In TB)",
          position: "outer-middle"
        }
      }
    }
  });
}

function calcDayEstimate(currAgg, rate) {
  // rate * 8 (to MB) * 3600 (to hours) * 24 (to day) / 1000 (to GB) / 1000 (to TB)
  let estimate = rate / 8 * 3600 * 24 / 1000 / 1000 - currAgg;

  return parseFloat(estimate.toFixed(3));
}

function renderDayChart() {
  let times = dayData.map(day => day.time).reverse();
  let txs = dayData
    .map(day => day.tx)
    .map(tx => toTB(tx).toFixed(3))
    .reverse();
  let rxs = dayData
    .map(day => day.rx)
    .map(rx => toTB(rx).toFixed(3))
    .reverse();
  let rates = dayData
    .map(day => day.rate)
    .map(rate => rate.toFixed(2))
    .reverse();

  let estimates = [];
  let estimate = calcDayEstimate(
    parseFloat(rxs[6]) + parseFloat(txs[6]),
    rates[6]
  );

  times = ["x", ...times];
  txs = ["tx", ...txs];
  rxs = ["rx", ...rxs];
  estimates = ["estimated additional bandwidth", 0, 0, 0, 0, 0, 0, estimate];

  var weekChart = c3.generate({
    bindto: "#week-graph",
    data: {
      x: "x",
      columns: [times, rxs, txs, estimates],
      type: "bar",
      groups: [["rx", "tx", "estimated additional bandwidth"]],
      colors: {
        tx: "#606060",
        rx: "#94CD27",
        "estimated additional bandwidth": "#D8D8D8"
      },
      order: null
    },
    tooltip: {
      format: {
        title: function(x) {
          return "Avg Rate: " + rates[x] + "Mbit/s";
        },
        value: function(value) {
          return value + "TB";
        }
      }
    },
    axis: {
      rotated: isMobile,
      x: { type: "category" },
      y: {
        label: {
          text: "Bandwidth (In TB)",
          position: "outer-middle"
        }
      }
    }
  });
}

function renderHourChart() {
  let times = hourData
    .map(hour => hour.time)
    .map(hour => hour.split(" ")[1].split(":")[0])
    .reverse();
  let txs = hourData
    .map(hour => hour.tx)
    .map(tx => toGB(tx).toFixed(3))
    .reverse();
  let rxs = hourData
    .map(hour => hour.rx)
    .map(rx => toGB(rx).toFixed(3))
    .reverse();
  let rates = hourData
    .map(hour => hour.rate)
    .map(rate => rate.toFixed(2))
    .reverse();

  times = ["x", ...times];
  txs = ["tx", ...txs];
  rxs = ["rx", ...rxs];

  var hourChart = c3.generate({
    bindto: "#hour-graph",
    data: {
      x: "x",
      columns: [times, txs, rxs],
      type: "bar",
      groups: [["rx", "tx"]],
      colors: { tx: "#606060", rx: "#94CD27" }
    },
    tooltip: {
      format: {
        title: function(x) {
          return "Avg Rate: " + rates[x] + "Mbit/s";
        },
        value: function(value) {
          return value + "GB";
        }
      }
    },
    axis: {
      rotated: isMobile,
      x: { type: "category" },
      y: {
        label: {
          text: "Bandwidth (In GB)",
          position: "outer-middle"
        }
      }
    }
  });
}

function renderHourTable() {
  let tableContainer = document.getElementById("hour-table");
  let table = createTable(hourData.reverse());
  tableContainer.appendChild(table);
}

function renderWeekTable() {
  let tableContainer = document.getElementById("week-table");
  let table = createTable(dayData.reverse());
  tableContainer.appendChild(table);
}

function renderMonthTable() {
  let tableContainer = document.getElementById("month-table");
  let table = createTable(monthData.reverse());
  tableContainer.appendChild(table);
}

function createTable(data) {
  let table = document.createElement("table");

  let headerRow = document.createElement("tr");
  headerRow.innerHTML =
    "<td>Time</td><td>Recieved</td><td>Transferred</td><td>Total</td><td>Rate</td>";
  table.appendChild(headerRow);

  for (let item of data) {
    let conTx = condenseByte(item.tx);
    let conRx = condenseByte(item.rx);
    let conTotal = condenseByte(item.rx + item.tx);
    let rate = item.rate.toFixed(2) + "Mbit/s";

    let itemRow = document.createElement("tr");
    itemRow.innerHTML = `
		<td>${item.time}</td>
		<td>${conRx}</td>
		<td>${conTx}</td>
		<td>${conTotal}</td>
		<td>${rate}</td>
	`;
    table.appendChild(itemRow);
  }

  return table;
}

function renderPBBar() {
  let container = document.getElementById("pb-container");

  const { total } = window.pb;

  let totalSpan = document.createElement("span");

  const percentage = total / 5e15;

  document.documentElement.style.setProperty(
    "--pb-width",
    Math.min(100, percentage * 100) + "%"
  );

  const remainingMBytes = (5e15 - total) / 1e6;

  document.documentElement.style.setProperty("--pb-background", "#94CD27");
  const currDailyRate = monthData[0].rate / 8 * 3600 * 24;
  const daysLeft = Math.ceil(remainingMBytes / currDailyRate);

  let date = moment()
    .add(daysLeft, "days")
    .format("MM/DD/YYYY");

  const totalTB = parseFloat((total / 1e12).toFixed(3));

  totalSpan.innerHTML = `
			${(5000 - totalTB).toFixed(
        3
      )}TB remaining. Mirror should reach 5PB on ${date}, or ${daysLeft} day${
    daysLeft > 1 ? "s" : ""
  }<br>
			<small>This is based on this month's avg rate of ${monthData[0].rate.toFixed(
        2
      )} mbit/s</small>`;

  container.appendChild(totalSpan);
}

function renderMonthEstimate() {
  const numDays = moment().daysInMonth();

  let estimateContainer = document.getElementById("month-estimate");

  estimateContainer.innerHTML = `Estimate bandwidth for ${
    window.monthData[11].time
  }:
		${(window.monthData[11].rate / 8 * 3600 * 24 * numDays / 1000 / 1000).toFixed(
      3
    )}TB`;
}

function renderAlltimeStats() {
  let alltimeDiv = document.getElementById("alltimeStats");

  const mirrorInitialDate = moment([2016, 3, 24]);
  const now = moment();
  const daysSinceStart = now.diff(mirrorInitialDate, "days");

  alltimeDiv.innerHTML = `
    <p>It's been ${daysSinceStart} days since the current mirror was initalized and it's pushed out a total of ${condenseByte(
    window.pb.total
  )} bandwidth between Rx and Tx.</p>
  `;
}

function renderDistrousageStats() {
  let distusageDiv = document.getElementById("distusage");

  let duData = window.distrousage;

  duData.sort((a, b) => {
    if (a.bytes < b.bytes) return 1;
    if (a.bytes > b.bytes) return -1;
    return 0;
  });

  const todayTotal = duData.reduce((s, e) => s + e.bytes, 0);

  console.log(todayTotal);

  duData = duData.map(entry => {
    return {
      distro: entry.distro,
      bytes: entry.bytes,
      perc: entry.bytes / todayTotal * 100
    };
  });

  let duDataViewable = duData.filter(entry => entry.perc >= 1.0);

  const viewTotal = duDataViewable.reduce((s, e) => s + e.bytes, 0);
  const viewPerc = duDataViewable.reduce((s, e) => s + e.perc, 0.0);

  duDataViewable.push({
    distro: "other",
    bytes: todayTotal - viewTotal,
    perc: 100.0 - viewPerc
  });

  console.table(duDataViewable);

  var duDataPieChart = c3.generate({
    bindto: "#distusage-chart",
    data: {
      columns: duDataViewable.map(entry => [entry.distro, entry.perc]),
      type: "pie"
    },
    size: {
      width: 300,
      height: 400
    }
  });

  const duTable = document.getElementById("distusage-table");

  let table = document.createElement("table");

  let headerRow = document.createElement("tr");
  headerRow.innerHTML = "<td>Number</td><td>Distro</td><td>Bytes</td>";
  table.appendChild(headerRow);

  for (const i in duDataViewable) {
    let itemRow = document.createElement("tr");
    itemRow.innerHTML = `
    <td>${parseInt(i) + 1}</td>
    <td>${duDataViewable[i].distro}</td>
    <td>${condenseByte(duDataViewable[i].bytes)}</td>
    `;

    table.appendChild(itemRow);
  }

  duTable.appendChild(table);
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
    if (evt.matches) {
      isMobile = true;
    } else {
      isMobile = false;
    }
    renderMonthChart();
    renderDayChart();
    renderHourChart();
  }

  mql.addListener(mqHandler);
  if (window.matchMedia("(max-width: 500px)").matches) {
    isMobile = true;
  }

  renderMonthChart();
  renderDayChart();
  renderHourChart();

  document.getElementById("updated").innerText = LastUpdate;

  renderRadials();

  renderPBBar();

  renderHourTable();
  renderWeekTable();
  renderMonthTable();

  renderMonthEstimate();

  renderAlltimeStats();

  renderDistrousageStats();
});
