const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// get the selected months Weeks
const getCurrentMonthWeeks = (currentMonth) => {
  const currentDate = new Date();

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentMonth, 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const totalDaysInMonth = lastDayOfMonth.getDate();
  const totalWeeksInMonth = Math.ceil((totalDaysInMonth + firstDayOfWeek) / 7);
  const weeksArray = [];
  for (let i = 1; i <= totalWeeksInMonth; i++) {
    weeksArray.push(`Week ${i}`);
  }

  return weeksArray;
};

// get last 6 months
const getXAxisLabels = (allMonths) => {
  const currentMonthIndex = new Date().getMonth();
  let lastSixMonths = [];
  for (let i = 0; i < 6; i++) {
    let monthIndex = (currentMonthIndex - i + 12) % 12;
    lastSixMonths.push(allMonths[monthIndex]);
  }
  return lastSixMonths.reverse();
};

let canvaTagId = $("#myBarChart");
let counslerReportChart;

// get the counsler ID from the URl
const getCounslerId = () => {
  const url = window.location.href;
  const urlObject = new URL(url);

  const pathname = urlObject.pathname;
  const encodedString = pathname.split("/").pop();

  return encodedString;
};

// get the chart
const getChart = (result, currentMonth = null, montsArr = null) => {
  if (counslerReportChart) {
    counslerReportChart.destroy();
  }
  const perDaySalary = montsArr ? parseInt(result[3].dlb_salary) : parseInt(result[0].dlb_salary);
  let amount = [];
  result.map((obj) => amount.push(obj.total_revenue));

  const maxRevenueAmt = Math.max(...result.map((item) => item.total_revenue));

  // Data for the chart
  const data = {
    labels: montsArr ? getXAxisLabels(allMonths) : getCurrentMonthWeeks(currentMonth),
    datasets: [
      {
        label: "Sales",
        data: result.length === 0 ? [] : [...amount],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Configuration options for the chart
  const config = {
    type: "bar",
    data: data,
    options: {
      plugins: {
        datalabels: {
          anchor: "end",
          align: "end",
          formatter: (value) => `${Math.ceil(value / perDaySalary)}X`, // Format values as 'k'
          color: "black",
          font: {
            weight: "bold",
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return `${Math.ceil(value / 10000)}k`; // Format y-axis ticks as 'k'
            },
            stepSize: 100000,
            // stepSize: 50000,
            max: maxRevenueAmt, // Set the maximum value of y-axis to 10k
          },
          // ticks: {
          //   callback: function (value) {
          //     return `${value}`; // Display y-axis ticks as raw values
          //   },
          //   stepSize: 500, // Set the step size to 500
          //   max: 10000, // Set the maximum value of y-axis to 10000
          // },
        },
      },
    },
    plugins: [ChartDataLabels], // Add the data labels plugin
  };

  // Render the chart
  counslerReportChart = new Chart(document.getElementById("myBarChart"), config);
};

// get the default months report
const getMonthlyReportChart = () => {
  $.ajax({
    url: "ajaxReport.php",
    type: "POST",
    dataType: "json",
    data: {
      getMonthWeeksReport: 0,
      getMonthsReport: 1,
      counslarId: getCounslerId(),
    },
    success: (response) => {
      if (response.apiSuccess === 1) {
        const result = response.responsePacket;
        getChart(result, null, true);
      } else {
        getChart([], null, true);
      }
    },
    error: () => {},
  });
};

// get the selected months report
const handleMonthFilterChart = (monthName, e) => {
  $("button").removeClass("btn-secondary"); // Remove highlight class from all buttons
  $(e.target).addClass("btn-secondary");
  $("#clearFilter").html('<div class="btn btn-primary" onclick="handleClearFilter()">Clear Filter</div>');
  $.ajax({
    url: "ajaxReport.php",
    type: "POST",
    dataType: "json",
    data: {
      getMonthWeeksReport: 1,
      getMonthsReport: 0,
      monthNum: allMonths.indexOf(monthName) + 1,
      getUserList: false,
      counslarId: getCounslerId(),
      // userReport: userReportParamValue,
    },
    success: (response) => {
      if (response.apiSuccess === 1) {
        const result = response.responsePacket;
        getChart(result, allMonths.indexOf(monthName) + 1);
      } else {
        getChart([], allMonths.indexOf(monthName) + 1);
      }
    },
    error: () => {},
  });
};

//
const handleClearFilter = () => {
  $("button").removeClass("btn-secondary"); // Remove highlight class from all buttons
  $("#clearFilter").html("");
  getMonthlyReportChart();
};

// get all the months show for filtering
const getMonths = () => {
  let monthsList = "";
  for (let monthName of allMonths) {
    monthsList =
      monthsList +
      `<div class="col-lg-2 col-md-3 col-4 d-flex justify-content-center align-items-center my-2"><button class="btn btn-primary mx-2 monthBtn" onclick="handleMonthFilterChart('${monthName}', event)">
       ${monthName.substr(0, 3)}</button></div>`;
  }
  $("#months").html(monthsList);
};

$(document).ready(function () {
  getCounslerId();
  getMonths();
  getMonthlyReportChart();
});
