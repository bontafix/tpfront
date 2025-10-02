// store/modalsStore.js
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { getAllStudents, getGroups, getMyStudents, getStudentAnalytics, getTypesConnect, getTimeZones } from '@/api/requests'

const route = useRoute()

export const useStudentsStore = defineStore('students', {
  state: () => ({
    rate: [
      { text: '30 мин.', value: 30 },
      { text: '45 мин.', value: 45 },
      { text: '1 час', value: 60 },
      { text: '1.5 часа', value: 90 },
      { text: '2 часа', value: 120 },
]
,
/*  '€ (евро)', '$ (доллар)', '₴ (гривна)', '₸ (тенге)', 'Br (Белар.)' */
    currency: ['₽ (рубль)'],

    timeZone:[
     /*  {
        id: 3,
        name: 'UTC+2 (Калининград, Кишинев)',
      },
      {
        id: 1,
        name: 'UTC+3 (Москва, Санкт-Петербург, Минск)',
      },
      {
        id: 4,
        name: 'UTC+4 (Астрахань, Ульяновск, Ижевск, Самара)',
      },
      {
        id: 5,
        name: 'UTC+5 (Екатеринбург, Пермь, Уфа, Астана)',
      },
      {
        id: 6,
        name: 'UTC+6 (Омск)',
      },
      {
        id: 7,
        name: 'UTC+7 (Барнаул, Красноярск, Новосибирск)',
      },
      {
        id: 8,
        name: 'UTC+8 (Иркутск)',
      },
      {
        id: 9,
        name: 'UTC+9 (Чита, Якутск)',
      },
      {
        id: 10,
        name: 'UTC+10 (Владивосток)',
      },
      {
        id: 11,
        name: 'UTC+11 (Магадан, Сахалин)',
      },
      {
        id: 12,
        name: 'UTC+12 (Анадырь, Петропавловск-Камчатский)',
      } */
    ],


    typeConnect: [],

    selectedCurrency: '₽',

    students: [],

    groups: null,

    studentAnalytics: null,
  }),
  getters: {},
  actions: {

    async getStudents(search_item='') {
        const students = await getMyStudents(search_item)
        this.students = students
    },
    async fetchGroups() {
      if(this.groups == null){
        const groups = await getGroups()
        this.groups = groups || []
      }
    },
    async setStudentAnalytics() {
      const route = useRoute()
      const studentId = route.params.id
      if (studentId && this.studentAnalytics === null)
        this.studentAnalytics = await getStudentAnalytics(studentId)
    },
    async setTypeConnects() {
      if(!this.typeConnect.length) {
        this.typeConnect = await getTypesConnect()
      }
    },
    async setTimezone() {
      if(!this.timeZone.length) {
        this.timeZone = await getTimeZones()
      }
    },
    async setCurrencies() {
      if(!this.timeZone) {
        this.timeZone = await getTypesConnect()
      }
    },
    async fetchInfo() {

    }
  },
})

