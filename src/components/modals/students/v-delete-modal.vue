<template>
  <v-custom-modal ref="customModal" @close="closeModal">
    <template #modal>
      <div class="v-delete-modal">
        <h1 class="modal-title" v-html="formattedText"></h1>
        <div class="caption">Информация о учениках будет удалена безвозратно.</div>
        <div class="v-delete-modal__rule">
          <div class="flex gap-3" v-if="group">
            <div class="styled-checkbox">
              <input v-model="deleteInfo" type="checkbox" :id="'delete-info'" />
              <label :for="'delete-info'"></label>
            </div>
            <label for="delete">Удалить информацию о всех учениках выбранной группы</label>
          </div>
        </div>
      </div>
    </template>
    <template #button>
      <button class="custom-btn red" @click="submitForm">Удалить</button>
    </template>
  </v-custom-modal>
</template>
<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'

import { useSelectedStudentsStore } from '@/stores/selectedStudentsStore'
import { deleteGroup, deleteStudentProfile } from '@/api/requests'

const props = defineProps({
  group: Object,
  student: Array,
  type: String,
  student_amount: Number,
  group_amount: Number,
})

const deleteInfo = ref(false)

const store = useSelectedStudentsStore()

const currentStudent = computed(()=>{
  return store.student
})

const customModal = ref(null)

const defaultPhrase = ref('Вы уверены, что хотите удалить')

const currentAmount = computed(() => {
  /*  return props.student_amount || props.group_amount ? 'singular' : 'plural' */
  if (currentStudent.value.length > 1) {
    return 'plural'
  } else if (currentStudent.value.length === 1) {
    return 'singular'
  } else {
    return 'none'
  }
})

watch(
  () => [props.student_amount, props.group_amount, props.type, props.student],
  () => {
    console.log(
      'Props changed:',
      props.type,
      props.student_amount,
      props.group_amount,
      props.student,
    )
  },
  { immediate: true },
)

const formattedText = computed(() => {
  let additionalyPhrase = ''

  if (currentStudent.value.length === 1 && props.type === 'students') {
    additionalyPhrase += `ученика <p> (${currentStudent.value[0].student_name})?</p>`
  }
  if (currentStudent.value.length > 1 && props.type === 'students') {
    additionalyPhrase += `выбранных учеников <p>(${currentStudent.value.length})?</p>`
  }
  if (props.type === 'groups' && currentStudent.value.length === 1) {
    additionalyPhrase += `группу <p>(${currentStudent.value[0].name})?</p>`
  }
  if (props.type === 'groups' && currentStudent.value.length > 1) {
    additionalyPhrase += `группы <p>(${currentStudent.value.length})?</p>`
  }

  return defaultPhrase.value + ' ' + additionalyPhrase
})

const closeModal = () => {
  console.log('Закрыли модальное окно')
   /* if(currentStudent.value.length === 1) {
    store.student = []
  } */
}

const submitForm = async () => {
  const itemIds = currentStudent.value.map((item)=>{
      return item.id
    })
  if(props.type === 'students') {
    const requestBody = {student_ids: itemIds}
    await deleteStudentProfile(requestBody)
  } else if (props.type == 'groups'){
    const requestBody = {group_ids: itemIds}
    await deleteGroup(requestBody)
  }
}

</script>
