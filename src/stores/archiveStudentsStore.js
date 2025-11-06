// store/modalsStore.js
import { defineStore } from 'pinia'

export const useArchivedStudentsStore = defineStore('deletedStudents', {
  state: () => ({
    students: [],
  }),
  getters: {},
  actions: {
    pushArchivedStudent(student) {
      this.students.push(student)
    },

    setArchivedStudents(students) {
      this.students = students
    },
    removeArchivedStudent(studentId) {
      this.student = this.student.filter((student) => student.id !== studentId)
    },
  },
})
