import { colors } from './chartConfig'
// src/data/studentAnalysisData.js
const percentages = ['24%', '23%', '20%', '15%', '12%', '6%']
// Опции графика
export const studentAnalysisChartOptions = {
  indexAxis: 'y', // Горизонтальный график
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    bar: {
      borderRadius: 10,
      borderSkipped: false,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
    datalabels: {
      color: colors.transperentBlackText,
      anchor: 'end',
      align: 'end',
      offset: 4,
      formatter: (value, context) => {
        const index = context.dataIndex
        return `${percentages[index]} (${value.toLocaleString()} ₽)`
      },
      font: {
        weight: 500,
        size: 13,
      },
    },
  },
  scales: {
    x: {
      max: 30000,
      grid: {
        display: false,
      },
      ticks: {
        display: false,
      },
      border: {
        display: false,
      },
    },
    y: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: colors.blackText,
        font: {
          weight: 500,
          size: 13,
        },
      },
    },
  },
  layout: {
    padding: {
      right: 100,
    },
  },
}
