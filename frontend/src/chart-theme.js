// Config radar partagée (Dashboard + Report). Couleurs par dimension SI/SD/SN/SO.
const DIM_COLORS = ['#58a6ff', '#bc8cff', '#f0883e', '#3fb950'];

export function radarData(values) {
  return {
    labels: ['Informationnelle', 'Décisionnelle', 'Normative', 'Opérationnelle'],
    datasets: [{
      data: values ?? [0, 0, 0, 0],
      backgroundColor: 'rgba(88,166,255,.14)',
      borderColor: 'rgba(88,166,255,.85)',
      borderWidth: 2,
      pointBackgroundColor: DIM_COLORS,
      pointBorderColor: 'rgba(0,0,0,.35)',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };
}

export function radarOptions({ animate = true } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: animate ? { duration: 600, easing: 'easeOutQuart' } : false,
    scales: {
      r: {
        min: 0, max: 100,
        angleLines: { color: 'rgba(127,127,127,.18)' },
        grid: { color: 'rgba(127,127,127,.14)' },
        pointLabels: { color: 'var(--text2)', font: { size: 12 } },
        ticks: { display: false, stepSize: 20 },
      },
    },
    plugins: { legend: { display: false } },
  };
}
