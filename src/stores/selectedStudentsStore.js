// store/modalsStore.js
import { defineStore } from 'pinia'

export const useSelectedStudentsStore = defineStore('seelctedStudents', {
  state: () => ({
    student: [],
    selected_group: null,
  }),
  getters: {},
  actions: {
    setDeletedStudent(student) {
      this.student = [student]
    },

    pushDeletedStudent(student) {
      this.student.push(student)
    },

    setDeletedStudetns(students) {
      this.student = students
      this.students_amount = students.length
    },
    removeDeletedStudent(studentId) {
      this.student = this.student.filter((student) => student.id !== studentId)
    },
  },
})
