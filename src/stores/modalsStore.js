import { defineStore } from 'pinia'

export const useModalsStore = defineStore('modals', {
  state: () => ({
    modals: []
  }),
  getters: {
    modals_count(state) {
      return state.modals.length
    },
  },
  actions: {
    increment(id) {
      this.modals.push(id)
    },
    decrement(id) {
      this.modals = this.modals.filter(modalId => modalId !== id)
    },
    isFirstModal(id) {
      return this.modals[0] === id
    }
  }
})
