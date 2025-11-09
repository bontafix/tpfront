<template>
  <div class="v-home__lesson-homework v-home__lesson-sec">
    <div class="v-home__lesson-homework-row">
      <div class="flex w-full justify-between">
        <h2 class="v-home__subtitle subtitle">{{ sectionTitle }}</h2>
        <div @click="deleteHomework" v-if="deletable">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g opacity="0.32">
              <path d="M15 5L5 15M5 5L15 15" stroke="#717680" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
          </svg>
        </div>

      </div>
      <div class="v-home__lesson-homework-buttons" v-if="mode === 'all'">
        <div
          class="v-home__lesson-homework-header-button"
          :class="{ active: !newHomework }"
          @click="() => toggleHomework(false)"
        >
          Предыдущее
        </div>

        <div
          class="v-home__lesson-homework-header-button"
          :class="{ active: newHomework }"
          @click="toggleHomework"
        >
          Новое
        </div>
      </div>
    </div>

    <div class="v-home__lesson-homework-new" v-if="newHomework">
      <textarea
        v-if="!noHomework"
        class="v-home__lesson-homework-text"
        v-model="homeworkText"
        @paste="handleTextPasteEvent"
        placeholder="Введите текст домашнего задания. Для вставки файлов используйте Ctrl+V"
      ></textarea>

      <v-files-handler
        ref="fileHandler"
        v-model="filesList"
        v-if="!noHomework"
        @file-removed="homeworkFileRemoved"
        @file-added="homeworkFileAdded"
        @update:modelValue="updateFilesList"
      />

      <div class="v-home__lesson-homework-deadline" v-if="!noHomework && mode === 'all'">
        <div class="v-home__lesson-homework-block">
          <div class="flex gap-3 items-center" v-if="!nextLesson">
            Дедлайн
            <VueDatePicker
              class="custom-datepicker"
              v-model="deadline"
              :locale="'ru-ru'"
              :auto-apply="true"
              :format="formatDate"
              :teleport="true"
              :append-to-body="true"
            >
              <template #clear-icon="{ clear }"> </template>
            </VueDatePicker>
          </div>
        </div>
        <div class="inline-flex gap-3 h-full">
          <div class="file-input" @click="openFilesModal">
            <img class="day-el" src="/src/assets/images/add-file-day.svg" alt="" />
            <img class="night-el" src="/src/assets/images/add-file-night.svg" alt="" />
          </div>
          <button
            class="v-home__lesson-homework-button save"
            :class="{ unactive: !canSave }"
            @click="saveHomework"
          >
            Сохранить
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3" v-if="mode === 'all'">
        <div class="styled-checkbox">
          <input type="checkbox" id="no-homework" v-model="noHomework" />
          <label for="no-homework"></label>
        </div>

        <label for="no-homework">Без задания</label>
      </div>
      <button
        class="v-home__lesson-homework-button save mob"
        :class="{ unactive: !canSave }"
        @click="saveHomework"
      >
        Сохранить
      </button>
    </div>

    <div class="v-home__lesson-homework-prev" v-if="!newHomework">
      <div class="v-home__lesson-homework-prev-header">
        <p class="block-description">{{ homeWork }}</p>
        <div class="flex gap-3 items-center" v-if="!nextLesson">
          <p class="block-description">Дедлайн </p>
          <input
            class="styled-datepicker"
            :class="{ red: isDeadlineOverdue, green: !isDeadlineOverdue }"
            type="date"
            readonly
            :value="previousDeadline"
          />
        </div>
      </div>
      <v-files-handler v-model="prevFilesList" :deletable="false"/>
      <h3 class="v-home__lesson-homework-prev-title">Ответ ученика</h3>
      <v-files-handler v-model="studentAnswer" />
      <textarea
        v-if="!noHomework && !isHwCompleted && !submissionAnswer"
        class="v-home__lesson-homework-text mt-2"
        v-model="homeworkText"
        @paste="handleTextPasteEvent"
        placeholder="Ваш комментарий"
      ></textarea>
      <div class="v-home__lesson-homework-footer mt-2">
        <div class="flex justify-between items-center w-full">
            <p>
            {{ submissionAnswer }}
          </p>

          <div class="flex gap-2 items-center v-home__lesson-homework-mark">
            <span>Оценка</span>
            <template v-if="(lastHomework && lastHomework[0]?.submissions?.length > 0) || isHwCompleted">
              <v-styled-select :is-readonly="true" :default-value="submissionMark" />
            </template>
            <template v-else>
              <v-styled-select
                :is-readonly="false"
                :default-value="mark"
                @update:model-value="(value) => selectMark(value)"
                :items="[2, 3, 4, 5]"
                :position="'top'"
              />
            </template>
          </div>
        </div>
        <button
          class="v-home__lesson-homework-button save"
          v-show="!isHwCompleted && !submissionAnswer"
          :class="{ unactive: !hasChanges }"
          @click="saveHomework"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatDate, formatDateToBase, domain, domainDownload } from '@/utils'
import { nextTick, onMounted, ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import '@vuepic/vue-datepicker/dist/main.css'
import VueDatePicker from '@vuepic/vue-datepicker'
import vFilesModal from '../modals/v-files-modal.vue'
import vFilesHandler from '../generalComponents/v-files-handler.vue'
import vStyledSelect from '../generalComponents/v-styled-select.vue'

const props = defineProps({
  mode: {
    type: String,
    default: () => 'all',
  },
  mark_position: {
    type: String,
    default: () => ''
  },
  title: String,
  subtitle: String,
  comment: String,
  mark: Number,
  homeWorkDeadline: Date,
  lastHomework: {
    type: Object,
    default: () => null,
  },
  hwData: Object,
  submissionData: {
    type: Array,
    default: () => [],
  },
  noPrevHw: {
    type: Boolean,
    default: () => false
  },
  deletable: {
    type: Boolean,
    default: () => true
  }
})

const emit = defineEmits(['toggle-modal', 'save-homework', 'save-submission', 'delete-homework'])

const filesList = ref([])
const studentPrevFilesList = ref([])
const fileHandler = ref(null)
const deadline = ref(new Date())
const homeworkText = ref('')
const noHomework = ref(false)
const nextLesson = ref(false)
const newHomework = ref(props.mode === 'all')
const selectedMark = ref(null)

const sectionTitle = computed(() => {
  return props.title || 'Домашнее задание'
})

const prevFilesList = computed(() => {
  const homeworkData = getHomeworkData()
  // console.log(homeworkData)
  // console.log(`homeworkData |||||||||||||||||||||||||||`)
  if (!homeworkData) return []

  return formatFilesToken(homeworkData.files)
})

// Обновленный computed для studentAnswer
const studentAnswer = computed(() => {
  const homeworkData = getHomeworkData()
  console.log(homeworkData)
  console.log(`homeworkData studentAnswer --------------------->`)
  if (!homeworkData) return []

  // return formatFiles(homeworkData.student_answers, 'file_path', 'file_name')
  return formatFilesToken(homeworkData.student_answers)
})

const homeWork = computed(() => {
  if(props.lastHomework && props.lastHomework.length > 0) {
    return props.lastHomework[0].title || ''
  }
  if(props.hwData) {
    return props.hwData.title
  }
  return ''
})

const previousDeadline = computed(() => {
  if (props.lastHomework && props.lastHomework.length > 0) {
    return props.lastHomework[0].due_date
  } if(props.hwData) {
    return props.hwData.due_date
  }
  return ''
})

const submissionMark = computed(() => {
  if (props.submissionData && props.submissionData.length) {
    return props.submissionData[0].grade
  } else if(props.lastHomework){
    return props.lastHomework[0]?.submissions?.length ? props.lastHomework[0].submissions[0].grade : null
  }
  return null
})

const submissionAnswer = computed(() => {
  if (props.submissionData && props.submissionData.length) {
    return props.submissionData[0].feedback || ''
  } else if(props.lastHomework){
    return props.lastHomework[0]?.submissions?.length ? props.lastHomework[0].submissions[0].feedback : ''
  }
  return ''
})

const isHwCompleted = computed(() => {
  return props.mode ? props.mode === 'completed' : true
})

const isDeadlineOverdue = computed(() => {
  if (props.homeWorkDeadline) {
    return props.homeWorkDeadline > new Date()
  }
  return null
})

const hasChanges = computed(() => {
  return homeworkText.value.length > 0 || (selectedMark.value !== null && selectedMark.value !== 2)
})

// Новый computed для проверки возможности сохранения
const canSave = computed(() => {
  if (noHomework.value) return true
  return homeworkText.value.length > 0 || filesList.value.length > 0
})

const getHomeworkData = () => {
  if (props.hwData) return props.hwData
  if (props.lastHomework && props.lastHomework.length > 0) return props.lastHomework[0]
  return null
}

// Вспомогательная функция для форматирования файлов
const formatFiles = (files, pathField = 'file_url', nameField = 'file_url') => {
  if (!files || !files.length) return []
  console.log(files)
  return files.map(file => {
    const filePath = file[pathField] || file.file_path
    const pathSeparator = filePath?.startsWith('/') ? '' : '/'
    
    return {
      id: file.id,
      name: file[nameField]?.replace('homework_files/', '') || file.file_name,
      size: file.file_size || 0,
      file: pathField === 'file_url' 
        ? `${domainDownload}${pathSeparator}${filePath}` 
        : `${domainDownload}/homework_answers${pathSeparator}${filePath}`,
      description: file.description || file.comment || '',
      homework_id: file.homework_id,
      uploaded_at: file.uploaded_at,
      file_type: file.file_type
    }
  })
}


const formatFilesToken = (files, pathField = 'file_url', nameField = 'file_url') => {
  if (!files || !files.length) return []
  console.log(files)
  return files.map(file => {
    const filePath = file[pathField] || file.file_path
    const pathSeparator = filePath?.startsWith('/') ? '' : '/'
    
    return {
      id: file.id,
      name: file[nameField]?.replace('homework_files/', '') || file.file_name,
      size: file.file_size || 0,
      file: pathField === 'file_url' 
        ? `${domainDownload}${pathSeparator}${filePath}` 
        : `${domainDownload}/homework_answers${pathSeparator}${filePath}`,
      file_token: { ...file, domainDownload},  
      description: file.description || file.comment || '',
      homework_id: file.homework_id,
      uploaded_at: file.uploaded_at,
      file_type: file.file_type
    }
  })
}


const deleteHomework = () => {
  emit('delete-homework')
}

const selectMark = (value) => {
  selectedMark.value = value
}

const openFilesModal = () => {
 emit('toggle-modal', 'files')
}

// Обработчик обновления списка файлов из v-files-handler
const updateFilesList = (newFiles) => {
  console.log('Обновление списка файлов:', newFiles)
  filesList.value = newFiles
}

// Обработчик добавления файлов (включая через Ctrl+V)
const homeworkFileAdded = (newFiles) => {
  console.log('Добавлены новые файлы:', newFiles)
  // Файлы уже добавлены в v-files-handler через v-model
  // Этот обработчик можно использовать для дополнительной логики если нужно
}

const saveHomework = () => {
  console.log('Сохранение домашнего задания...')
  console.log('Список файлов при сохранении:', filesList.value)
  console.log('Новая дата --- ', formatDateToBase(deadline.value))

  const conductedDate = new Date()
  let hwdata = null;

  if(newHomework.value) {
    hwdata = {
      title: homeworkText.value,
      due_date: formatDateToBase(deadline.value),
      no_homework: noHomework.value,
      conducted_date: formatDateToBase(conductedDate, 'yyyy-mm-dd'),
      files: filesList.value
    }
    console.log('Данные для сохранения нового ДЗ:', hwdata)
    emit('save-homework', hwdata)

  } else if(!newHomework.value && (props.lastHomework || props.hwData)) {
    const homeWorkId = props.lastHomework ? props.lastHomework[0].id : props.hwData.id
    hwdata = {
        submission_date: formatDateToBase(conductedDate, 'yyyy-mm-dd'),
        grade: String(selectedMark.value),
        feedback: homeworkText.value,
        conducted_date: formatDateToBase(conductedDate, 'yyyy-mm-dd'),
        homework_id: homeWorkId,
    }
    console.log('Данные для сохранения ответа на ДЗ:', hwdata)
    emit('save-submission', hwdata)
  }
}

const toggleHomework = (value = true) => {
  if(!props.noPrevHw) {
    newHomework.value = value
  }
}

// Обработчик события вставки для текстового поля (textarea)
const handleTextPasteEvent = (event) => {
  console.log('Обработка события вставки в textarea')
  if (fileHandler.value) {
    const hasFiles = fileHandler.value.handlePaste(event)
    console.log('Файлы найдены при вставке:', hasFiles)
    if (hasFiles) {
      event.preventDefault()
      // Добавляем небольшую задержку для синхронизации
      nextTick(() => {
        console.log('Файлы после вставки:', filesList.value)
      })
    }
  }
}

const handleSaveFiles = (files) => {
  console.log('handleSaveFiles вызван с файлами:', files)
  filesList.value = files
  if (fileHandler.value) {
    fileHandler.value.internalFiles = files
  }
}

const homeworkFileRemoved = (file) => {
  console.log('Удален файл:', file)
  filesList.value = filesList.value.filter((item) => item.id !== file.id)
}

// Отслеживаем изменения в списке файлов для отладки
watch(filesList, (newFiles, oldFiles) => {
  console.log('filesList изменился:', {
    old: oldFiles?.length || 0,
    new: newFiles?.length || 0,
    files: newFiles
  })
}, { deep: true })

defineExpose({
  handleSaveFiles
})

onMounted(() => {
  console.log('Компонент домашнего задания смонтирован')
})
</script>
