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
      height: 200,
    },
    toolbar: {
      show: false
    },
    zoom: { enabled: false },
    selection: { enabled: false },
    tooltip: { enabled: false },
    series: [{
      data: data
    }],
    xaxis: {
      type: 'datetime',
    },
    title: {
      // text: 'XP Chart',
      align: 'center'
    }
  };
  const chart = new ApexCharts(document.querySelector("#xpGraph"), options);
  chart.render();
}