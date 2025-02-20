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
  // Get the current URL from the browser
  const url = window.location.href;

  // Create a URL object
  const urlObject = new URL(url);

  // Use URLSearchParams to extract query parameters
  const params = new URLSearchParams(urlObject.search);

  // Get the value of the userId parameter
  const userId = params.get("userid");
  return userId;
};

// // get the counsler ID from the URl
// const getCounslerId = () => {
//   const url = window.location.href;
//   const urlObject = new URL(url);

//   const pathname = urlObject.pathname;
//   const encodedString = pathname.split("/").pop();

//   return encodedString;
// };

function getWeeksInMonth(year, month) {
  // Create a date object for the first day of the month
  const firstDay = new Date(year, month - 1, 1);

  // Create a date object for the last day of the month
  const lastDay = new Date(year, month, 0);

  // Get the ISO week number for the first day of the month
  const firstWeekNumber = getWeekNumber(firstDay);

  // Get the ISO week number for the last day of the month
  const lastWeekNumber = getWeekNumber(lastDay);

  // Calculate the number of weeks
  return lastWeekNumber - firstWeekNumber + 1;
}

function getWeekNumber(date) {
  // Create a copy of the date object
  const currentDate = new Date(date.getTime());

  // Set the day of the week to Thursday (ISO week starts on Monday and week 1 contains January 4th)
  currentDate.setDate(currentDate.getDate() + 4 - (currentDate.getDay() || 7));

  // Calculate the first day of the year
  const yearStart = new Date(currentDate.getFullYear(), 0, 1);

  // Calculate the ISO week number
  const weekNumber = Math.ceil(((currentDate - yearStart) / 86400000 + 1) / 7);

  return weekNumber;
}

// get the chart
const getChart = (result, currentMonth = null, montsArr = null) => {
  if (counslerReportChart) {
    counslerReportChart.destroy();
  }
  // const perDaySalary = montsArr ? parseInt(result[3].dlb_salary) : parseInt(result[0].dlb_salary);
  var perDaySalary = [];
  const today = new Date();
  const month = today.getMonth() + 1; // getMonth() is zero-based
  const day = today.getDate();
  if (montsArr) {
    perDaySalary = result.map((item) => {
      if (item.month_number == month) {
        let perDay = Number(item.dlb_salary) / 30;
        return perDay * day;
      } else {
        return Number(item.dlb_salary);
      }
    });
  } else {
    //Weekly perDay salary count
    let date = result.map((item) => item.dlb_revenue_date);
    let dateSeprate = date[0].split("-");
    let numberOfWeeks = getWeeksInMonth(Number(dateSeprate[0]), Number(dateSeprate[1]));
    for (var i = 0; i < result.length; i++) {
      perDaySalary.push(Number(result[i].dlb_salary) / numberOfWeeks);
    }
  }
  // if (montsArr) {
  //   perDaySalary = Number(Math.max(...result.map((item) => item.dlb_salary)));
  // } else {
  //   const currentYear = new Date().getFullYear();
  //   const totalDays = new Date(currentYear, currentMonth, 0).getDate();
  //   perDaySalary = Number(Math.max(...result.map((item) => item.dlb_salary)) / totalDays);
  // }

  let amount = [];
  result.map((obj) => amount.push(Number(obj.total_revenue)));

  const maxRevenueAmt = Math.max(...result.map((item) => Number(item.total_revenue)));

  result.map((item) => item.dlb_salary);

  let backgroundColor = [];
  let borderColor = [];
  result.map((item, index) => {
    let amt = Number(item.total_revenue) / Number(perDaySalary[index] || 0);
    if (amt <= 10) {
      backgroundColor.push("rgba(255, 99, 132, 1)");
      borderColor.push("rgba(255, 99, 132, 1)");
    } else if (amt > 10 && amt <= 15) {
      backgroundColor.push("rgba(255, 206, 86, 1)");
      borderColor.push("rgba(255, 206, 86, 1)");
    } else {
      backgroundColor.push("rgba(75, 192, 192, 1)");
      borderColor.push("rgba(75, 192, 192, 1)");
    }
  });

  // Math.ceil(Number(value) / Number(perDaySalary || 0)

  // Data for the chart
  const data = {
    labels: montsArr ? getXAxisLabels(allMonths) : getCurrentMonthWeeks(currentMonth),
    datasets: [
      {
        label: "Sales",
        data: result.length === 0 ? [] : [...amount],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        // backgroundColor: [
        //   "rgba(255, 99, 132, 0.2)",
        //   "rgba(54, 162, 235, 0.2)",
        //   "rgba(255, 206, 86, 0.2)",
        //   "rgba(75, 192, 192, 0.2)",
        //   "rgba(153, 102, 255, 0.2)",
        //   "rgba(255, 159, 64, 0.2)",
        // ],
        // borderColor: [
        //   "rgba(255, 99, 132, 1)",
        //   "rgba(54, 162, 235, 1)",
        //   "rgba(255, 206, 86, 1)",
        //   "rgba(75, 192, 192, 1)",
        //   "rgba(153, 102, 255, 1)",
        //   "rgba(255, 159, 64, 1)",
        // ],
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
          formatter: (value, context) => {
            //let perDay = result[context.dataIndex].dlb_salary//`${Math.ceil(Number(value) / Number(perDaySalary || 0))}`;
            //perDay = perDay/30
            //return `${Math.ceil(Number(value) / Number(perDay || 0))}X`; // Format values as 'k'
            return `${Math.ceil(Number(value) / perDaySalary[context.dataIndex])}X`;
          },
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
        const userResult = response.userResult;
        $("#counslerInfo").html(`${userResult?.Cname} (${userResult?.salary}))`);
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
  handleFilterAnimation("monthsFilter");
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

// show hide the Months name
const handleShowHideMonthsName = () => {
  $(".monthsOpen, .monthsClose").toggleClass("monthsOpen monthsClose");

  if ($("#montheFilterEye").hasClass("fa-eye")) {
    $("#montheFilterEye").addClass("fa-eye-slash").removeClass("fa-eye");
  } else if ($("#montheFilterEye").hasClass("fa-eye-slash")) {
    $("#montheFilterEye").addClass("fa-eye").removeClass("fa-eye-slash");
  }
};

// Filter animations
const handleFilterAnimation = (filterType = "byLabel") => {
  if (window.screen.width <= 768) {
    if (filterType === "byLabel") {
      $("#monthsFilter").on("click", handleShowHideMonthsName);
    } else if (filterType === "monthsFilter") {
      $(".monthsOpen, .monthsClose").toggleClass("monthsOpen monthsClose");
      $("#montheFilterEye").addClass("fa-eye").removeClass("fa-eye-slash");
    }
  }
};

$(document).ready(function () {
  getCounslerId();
  getMonths();
  getMonthlyReportChart();
  handleFilterAnimation();
});
