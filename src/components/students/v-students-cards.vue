<template>
  <div class="v-students-cards">
    <ul class="v-students-cards__list students-list">
      <li class="v-students-cards__list-item" v-for="(item, index) in items" :key="item.id">
        <v-student-card
          ref="studentCardsRef"
          :item="item"
          :info-items="infoItems(index)"
          @selected="handleStudentSelection(item, $event)"
          @edit="handleEditStudent"
          @delete="handleDeleteStudent"
        />
      </li>
    </ul>
  </div>
  <!-- <transition name="fade">
    <v-delete-modal
      v-if="modals.deleteModal"
      @close="() => toggleModals('deleteModal')"
      :type="props.type"
    />
  </transition>
 -->
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import vStudentCard from './v-student-card.vue'
import { useSelectedStudentsStore } from '@/stores/selectedStudentsStore'


const emit = defineEmits(['student-selected', 'toggle-modal', 'edit-group'])

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  type: String,
})

const store = useSelectedStudentsStore()

const modals = ref({
  editGroup: false,
  deleteModal: false,
})

const currentGroup = ref(null)

const studentCardsRef = ref(null)
const allCardsSelected = ref(false)

const selectedStudents = ref({})

const toggleModals = (modal) => {
  modals.value[modal] = !modals.value[modal]
}

const handleStudentSelection = (student, isSelected) => {
  const studentId = student.id
  selectedStudents.value[studentId] = isSelected
  if (isSelected) {
    store.pushDeletedStudent(student)
  } else {
    store.removeDeletedStudent(studentId)
  }

  const isAnyStudentSelected = Object.values(selectedStudents.value).some((value) => value)
  console.log(selectedStudents.value)
  emit('student-selected', isAnyStudentSelected, selectedStudents.value)
}

const handleEditStudent = (item) => {
  if (props.type === 'groups') {
    currentGroup.value = item
    store.selected_group = currentGroup.value
    console.log('Текущеая гурппа', item)
    emit('edit-group', item)
  }
}

const infoItems = (studentIndex) => {
  if (props.type === 'groups') {
    return [
      { title: 'Количество учеников', value: props.items[studentIndex].students.length },
      { title: 'Ставка', value: props.items[studentIndex].rate, time_rate: 60},
      { title: 'Баланс', value: props.items[studentIndex].all_balances_positive },
      { title: 'Статус ДЗ', value: props.items[studentIndex].homework_status },
      { title: 'Комментарий', value: props.items[studentIndex].comment },
    ]
  }
  return []
}

const handleDeleteStudent = (student) => {
  console.log(!Object.keys(selectedStudents.value).length || student)
  if(student) {
    store.setDeletedStudent(student)
    emit('toggle-modal', 'deleteModal')
  }

}

const selectAllStudents = (value) => {
  for (const studentId in selectedStudents.value) {
    selectedStudents.value[studentId] = value
  }

  allCardsSelected.value = !allCardsSelected.value

  studentCardsRef.value.forEach((sutdentCard) => {
    sutdentCard.selectStudent(allCardsSelected.value)
  })
}

defineExpose({
  selectAllStudents,
  handleDeleteStudent,
  selectedStudents,
})

onMounted(() => {
  props.items.forEach((student) => {
    selectedStudents.value[student.id] = false
  })
})
</script>
