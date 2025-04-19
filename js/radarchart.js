let radarChart = null;

function initRadarChart(canvasId = 'radarChart') {
  const ctx = document.getElementById(canvasId).getContext('2d');

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Population', 'Median Income', 'Median Rent', 'House Value'],
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
        r: { beginAtZero: true }
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