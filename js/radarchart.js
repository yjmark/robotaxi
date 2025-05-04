let radarChart = null;

function initRadarChart(canvasId = 'radarChart') {
  const ctx = document.getElementById(canvasId).getContext('2d');

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['SVI-Enclos', 'Population', 'Building density', 'Commercial POI density'],
      datasets: [{
        label: 'Block Group Stats',
        data: [0, 0, 0, 0],
        fill: true,
        backgroundColor: 'rgba(158, 54, 118, 0.4)',
        borderColor: 'rgb(158, 54, 118)',
        pointBackgroundColor: 'rgb(158, 54, 118)'
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: false   
        }
      },
      scales: {
        r: { 
          beginAtZero: true,
          min: 0,           // 눈금 최소값 (예: 0)
          max: 1,        // 눈금 최대값 (예: 1000)
          ticks: {
            stepSize: 0.2,
            display: false   // 눈금 간격 (예: 0, 200, 400, ..., 1000)
          }
        }
      }
    }
  });
}

function updateRadarChart(dataArray) {
  if (radarChart) {
    radarChart.data.datasets[0].data = dataArray;
    radarChart.update();
  }
}

export { initRadarChart, updateRadarChart };