import { colors } from './chartConfig'

const isNightMode = localStorage.getItem('nightMode')

export const monthBarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 30 },
  },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
    datalabels: {
      color: isNightMode ? 'rgba(255, 255, 255, .56)' : '#717680',
      font: { weight: 500, size: 13 },
      anchor: 'end',
      align: 'top',
      offset: 5,
      formatter: (value) => `${value.toLocaleString()} ₽`,
    },
  },
  scales: {
    x: {
      grid: { display: false, drawBorder: false },
      ticks: {
        font: { family: 'Inter', size: 13, fontWeight: 600 },
        color: isNightMode ? '#FFFFFF' : '#344055',
      },
      border: { display: false },
    },
    y: {
      beginAtZero: true,
      display: false,
      grid: { display: false, drawTicks: false },
      ticks: { display: false },
    },
  },
  elements: {
    bar: {
      borderWidth: 0,
    },
  },
}
