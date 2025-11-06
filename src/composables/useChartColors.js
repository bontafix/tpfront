import { computed, watch } from 'vue'
import { useGeneralStore } from '@/stores/generalStore'

export function useChartColors(chartOptionsRef, updateKeyRef = null) {
  const store = useGeneralStore()
  const isNightMode = computed(() => store.nightMode)

  const updateChartColors = () => {
    const night = isNightMode.value

    chartOptionsRef.value = {
      ...chartOptionsRef.value,
      plugins: {
        ...chartOptionsRef.value.plugins,
        datalabels: {
          ...chartOptionsRef.value.plugins?.datalabels,
          color: night ? 'rgba(255, 255, 255, .56)' : '#344055',
        },
      },
      scales: {
        ...chartOptionsRef.value.scales,
        y: {
          ...chartOptionsRef.value.scales?.y,
          ticks: {
            ...chartOptionsRef.value.scales?.y?.ticks,
            color: night ? '#FFFFFF' : '#344055',
          },
        },
        x: {
          ...chartOptionsRef.value.scales?.x,
          ticks: {
            ...chartOptionsRef.value.scales?.x?.ticks,
            color: night ? '#FFFFFF' : '#344055',
          },
        },
      },
    }

    if (updateKeyRef) updateKeyRef.value++ // для перерисовки графика
  }

  watch(isNightMode, updateChartColors, { immediate: true })

  return { isNightMode, updateChartColors }
}
