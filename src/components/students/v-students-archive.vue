<template>
  <v-base>
    <section class="v-students-archive">
      <div class="container">
        <div class="v-students-archive__container layout">
          <div class="route">
            <router-link :to="{ name: 'my_students' }">Ученики</router-link>
            <div>/</div>
            <div>Архив учеников</div>
          </div>
          <h1 class="v-students-archive__title text-title">Архив учеников</h1>

          <ul class="v-students-acrchive__list students-list">
            <li
              class="v-students-archive__list-item"
              v-for="(student, index) in archivedStudents"
              :key="student.id"
            >
              <v-student-card v-if="student" :info-items="infoItems(index)" :is-repair="true" :item="student" @repair="repairItem"/>
            </li>
          </ul>
          <div class="null-screen" v-if="!archivedStudents.length && !isLoading">
            <h1>В архиве нет ни одного ученика</h1>
          </div>
        </div>
      </div>
    </section>
  </v-base>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import vBase from '../v-base.vue'
import vStudentCard from './v-student-card.vue'
import { getArchivedStudents, toggleStudentArchive } from '@/api/requests'

const isLoading = ref(false)

const archivedStudents = ref([])
const unArchivedStudents = ref([])

const infoItems = (index) => {
  return [
    {
      title: 'Способ связи',
      value: archivedStudents.value[index].contact,
      phone_number: archivedStudents.value[index].phone_number,
      icon: archivedStudents.value[index].type_connect,
    },
    {
      title: 'Ставка',
      value: archivedStudents.value[index].rate,
      time_rate: archivedStudents.value[index].time_rate
    },
  ]
}


const repairItem = async (student_id) => {
  await toggleStudentArchive(student_id)
  console.log(student_id, archivedStudents.value)
  archivedStudents.value =  archivedStudents.value.filter((student)=>{
    return student.id != student_id
  })
}

const loadData = async () => {
  isLoading.value = true
  archivedStudents.value = await getArchivedStudents()
  isLoading.value = false
}

onMounted(()=>{
  loadData()
})
</script>
