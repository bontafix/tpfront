<template>
  <div class="chart-wrapper">
    <div class="y-axis-labels">
      <div v-for="tick in yTicks" :key="tick" class="y-tick">{{ tick }}</div>
    </div>
    <div class="chart-scroll">
      <Line :data="chartData" :options="chartOptions" :width="1200" :height="400" />
    </div>
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const chartData = {
  labels: Array.from({ length: 50 }, (_, i) => `День ${i + 1}`),
  datasets: [
    {
      label: 'Посещения',
      data: Array.from({ length: 50 }, () => Math.floor(Math.random() * 100)),
      borderColor: 'blue',
      tension: 0.4,
    },
  ],
}

const yTicks = ['100', '80', '60', '40', '20', '0']

const chartOptions = {
  responsive: false,
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      display: false, // скрываем ось Y в самом графике
    },
  },
}
</script>

<style scoped>
.chart-wrapper {
  display: flex;
  align-items: flex-start;
  max-width: 100%;
  overflow-x: auto;
}

.y-axis-labels {
  min-width: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 400px;
  padding-top: 30px; /* подгон под padding графика */
  position: sticky;
  left: 0;
  background: white;
  z-index: 1;
}

.y-tick {
  text-align: right;
  padding-right: 5px;
  font-size: 14px;
}

.chart-scroll {
  overflow-x: auto;
}
</style>
