// store/modalsStore.js
import { defineStore } from 'pinia'

export const useGeneralStore = defineStore('generalStore', {
  state: () => ({
    nightMode: localStorage.getItem('nightMode') === 'true' || false,
  }),
  getters: {
    modals_count: (state) => state.modals.length,
  },
  actions: {
    setNightMode(mode) {
      this.nightMode = mode
      localStorage.setItem('nightMode', mode)
    },
  },
})
