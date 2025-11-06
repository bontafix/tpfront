<template>
  <v-custom-modal @submit="saveGroup">
    <template #modal>
      <div class="v-edit-group">
        <h2 class="modal-title">Редактирование группы</h2>
        <div v-if="!props.groupData" class="loading">
          Загрузка данных группы...
        </div>
        <div v-else class="modal-field col">
          <span class="modal-field__title"> Название группы </span>
          <input type="text" class="custom-input" placeholder="Название группы" v-model="group_name"/>

          <!-- Существующие студенты группы -->
          <div class="modal-field col" v-if="groupStudents.length > 0">
            <span class="modal-field__title">Студенты в группе</span>
            <ul class="v-edit-group__list">
              <li
                class="v-edit-group__list-item"
                v-for="student in groupStudents"
                :key="student.id"
              >
                <div class="styled-checkbox">
                  <input
                    type="checkbox"
                    :id="'student-' + student.id"
                    :checked="isStudentSelected(student.id)"
                    @change="(event) => toggleStudentSelection(student.id, event)"
                  />
                  <label :for="'student-' + student.id"></label>
                </div>
                <label :for="'student-' + student.id">{{ student.student_name }}</label>
              </li>
            </ul>
          </div>

          <!-- Multiselect для управления всеми студентами группы -->
          <div class="modal-field col">
            <span class="modal-field__title">Студенты группы</span>
            <v-styled-select
              :items="availableStudents"
              :is-multiselect="true"
              :default-value="selectedStudentsForSelect"
              @update:modelValue="handleMultiselectChange"
              ref="multiselectRef"
              :key="multiselectKey"
            />
          </div>
        </div>
      </div>
    </template>
  </v-custom-modal>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useStudentsStore } from '@/stores/studentsStore'
import { useSelectedStudentsStore } from '@/stores/selectedStudentsStore'
import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'
import vStyledSelect from '@/components/generalComponents/v-styled-select.vue'
import { updateGroup } from '@/api/requests'

const props = defineProps({
  groupData: {
    type: Object,
    default: null
  }
})


const studentsStore = useStudentsStore()
const selectedStudentsStore = useSelectedStudentsStore()
const multiselectRef = ref(null)
const multiselectKey = ref(0) // Для принудительного перерендера

// Все доступные студенты для выбора
const students = computed(() => {
  return studentsStore.students.map((student) => {
    return {
      id: student.id,
      text: student.student_name,
      student_name: student.student_name
    }
  }) || []
})

// Студенты, которые уже находятся в группе
const groupStudents = computed(() => {
  return props.groupData?.students || []
})

// Все студенты доступны для выбора в multiselect
const availableStudents = computed(() => {
  return students.value
})

const group_name = ref('')
const selectedStudentIds = ref(new Set())
const isUpdatingFromCheckbox = ref(false) // Флаг для предотвращения рекурсии

// Computed для выбранных студентов в мультиселекте
const selectedStudentsForSelect = computed(() => {
  return students.value.filter(student =>
    selectedStudentIds.value.has(student.id)
  )
})

// Проверяет, выбран ли студент
const isStudentSelected = (studentId) => {
  return selectedStudentIds.value.has(studentId)
}

// Переключает выбор студента из существующих в группе
const toggleStudentSelection = (studentId, event) => {
  // Предотвращаем всплытие события
  if (event) {
    event.stopPropagation()
  }

  isUpdatingFromCheckbox.value = true

  const newSelectedIds = new Set(selectedStudentIds.value)

  if (newSelectedIds.has(studentId)) {
    newSelectedIds.delete(studentId)
  } else {
    newSelectedIds.add(studentId)
  }

  selectedStudentIds.value = newSelectedIds

  // Принудительно обновляем мультиселект через key
  nextTick(() => {
    multiselectKey.value++
    isUpdatingFromCheckbox.value = false
  })
}

// Обрабатывает изменения в multiselect
const handleMultiselectChange = (selectedStudents) => {
  // Предотвращаем рекурсию если обновление идет от чекбокса
  if (isUpdatingFromCheckbox.value) {
    return
  }

  // Создаем новый Set из выбранных в мультиселекте студентов
  const newSelectedIds = new Set()

  if (Array.isArray(selectedStudents)) {
    selectedStudents.forEach(student => {
      if (student && student.id) {
        newSelectedIds.add(student.id)
      }
    })
  }

  selectedStudentIds.value = newSelectedIds
}

// Получает всех выбранных студентов
const getAllSelectedStudents = () => {
  return students.value.filter(student => selectedStudentIds.value.has(student.id))
}

// Сохраняет изменения группы
const saveGroup = async () => {
  const selectedStudents = getAllSelectedStudents()
  const groupData = {
    group_id: props.groupData?.id,
    group_name: group_name.value,
    student_ids: selectedStudents.map((student)=> student.id)
  }

  await updateGroup(groupData)
}

// Инициализация данных
const initializeData = () => {
  if (props.groupData) {
    group_name.value = props.groupData.name || ''

    // Инициализируем выбранными всех студентов, которые уже в группе
    const initialIds = new Set(
      groupStudents.value.map(student => student.id)
    )
    selectedStudentIds.value = initialIds

    // Обновляем ключ для перерендера мультиселекта
    multiselectKey.value++
  }
}

const loadData = async () => {
  await studentsStore.getStudents()
}

// Отслеживаем изменения groupData
watch(() => props.groupData, (newData) => {
  if (newData) {
    nextTick(() => {
      initializeData()
    })
  }
}, { deep: true, immediate: true })

onMounted(async () => {
  await loadData()
  if (props.groupData) {
    initializeData()
  }
})
</script>

<style scoped>
.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.v-edit-group__list {
  margin: 10px 0;
  padding: 0;
  list-style: none;
}

.v-edit-group__list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.v-edit-group__list-item label {
  cursor: pointer;
  user-select: none;
}

.modal-field {
  margin-bottom: 16px;
}

.modal-field.col {
  display: flex;
  flex-direction: column;
}

.modal-field__title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #374151;
}
</style>
