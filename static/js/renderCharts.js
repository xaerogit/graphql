export function renderSkillsChart(labels, series) {
  const options = {
    chart: {
      type: 'pie',
      animations: {
        enabled: false
      },
      height: 200,
    },
    series: series,
    labels: labels,
    title: {
      // text: 'Best Skills',
      align: 'center'
    },
  };

  const chart = new ApexCharts(document.querySelector("#skillsChart"), options);
  chart.render();
}

export function renderXPChart(data) {
  const options = {
    chart: {
      type: 'line',
      height: 250,
    },
    stroke: {
      width: '2',
      curve: 'smooth',
    },
    toolbar: {
      enabled: false,
    },
    tooltip: {
      enabled: false, 
    },
    series: [{
      data: data
    }],
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return Math.round(value) + " kB";
        }
      }
    },
  };
  const chart = new ApexCharts(document.querySelector("#xpGraph"), options);
  chart.render();
}