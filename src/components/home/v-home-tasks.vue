<template>
  <div class="v-home-tasks">
    <v-home-right-sec-base>
      <template #title> Актуальные задачи </template>
      <template #container>
        <ul class="v-home-tasks__list">
          <li class="v-home-tasks__list-item task" v-for="task in tasks" :key="task.id">
            <h3 class="task__title">{{ task.title }}</h3>
            <div @click="() => deleteTask(task.id)" class="task__close">
              <img src="/src//assets/images/cross.svg" alt="" />
            </div>
          </li>
        </ul>
        <v-add-field :placeholder="'Тема занятий'" @submit="addTask" />
      </template>
    </v-home-right-sec-base>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { deleteTeacherTask, getTeacherTasks, setTeacherTasks } from '@/api/requests'

import vHomeRightSecBase from './v-home-right-sec-base.vue'
import vAddField from '../generalComponents/v-add-field.vue'

const tasks = ref([])
const newTask = ref(null)

const addTask = async (value) => {
  if (value) {
    const data = { title: value }
    newTask.value = ''
    const task = await setTeacherTasks(data)
    tasks.value.push(task.data)
  }
}

const fetchTeacherTasks = async () => {
  const response = await getTeacherTasks()
  tasks.value = response || []
}

const deleteTask = async (task_id) => {
  tasks.value = tasks.value.filter((task) => task.id !== task_id)
  await deleteTeacherTask(task_id)
}
onMounted(() => {
  fetchTeacherTasks()
})
</script>
