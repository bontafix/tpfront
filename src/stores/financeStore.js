// store/modalsStore.js
import { getStudentEarning, getStudentsEarnings, getStudnetGoals, getStudnetSource, getTeacherExpenses, getTeacherIncome, getTeacherOperations } from '@/api/requests'
import { defineStore } from 'pinia'

export const useFinanceStore = defineStore('financeStore', {
  state: () => ({
    currentRange: '',
    operations: [],
    expenses: [],
    income: [],

    studentGoals: [],
    studentSources: [],
    studentEarnings: [],
  }),
  getters: {
  },
  actions: {
    async fetchFinanceOpeartion() {
      if (!this.operations.length) {
        this.operations = await getTeacherOperations()
      }
    },
    async fetchFinanceExpenses() {
      if(!this.expenses.length) {
        this.expenses = await getTeacherExpenses()
      }
    },
    async fetchFinanceIncome() {
      if(!this.income.length) {
        this.income = await getTeacherIncome()
      }
    },
    async fetchStudentGoals() {
      if(!Object.values(this.studentGoals).length) {
        const response = await getStudnetGoals()
        this.studentGoals = response.goals
      }
    },
    async fetchStudentSources() {
      if(!Object.values(this.studentSources).length) {
        const response = await getStudnetSource()
        this.studentSources = response.source
      }
    },
    async fetchStudentEarnings() {
      if(!Object.values(this.studentEarnings).length) {
        const response = await getStudentsEarnings()
        this.studentEarnings = response.students.splice(0, 6)
        console.log('Делаем запрос', response.students)
      }
    }
  },
})
