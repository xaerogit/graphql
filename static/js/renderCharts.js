export function renderSkillsChart(labels, series) {
  const options = {
    chart: {
      type: 'pie',
      width:  350,
      height: 200,
    },
    series: series,
    labels: labels,
    title: {
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
      width: 500,
      height: 200,
    },
    series: [{
      name: 'XP Amount',
      data: data
    }],
    xaxis: {
      type: 'datetime',
    },
    title: {
      text: 'XP Over Time',
      align: 'center'
    }
  };
  const chart = new ApexCharts(document.querySelector("#xpGraph"), options);
  chart.render();
}