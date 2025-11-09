<template>
  <div class="v-files-handler" :data-instance-id="instanceId">
    <!-- File upload input -->
    <input :id="`file-handler-input-${instanceId}`" ref="fileInput" type="file" @input="handleFileChange" multiple
      class="hidden-input" />
    <div v-if="showDropArea" class="v-files-handler__drop-area" @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false" @drop.prevent="handleFileDrop" :class="{ dragging: isDragging }">
      <img src="/src/assets/images/file-upload.svg" alt="" />
      <div class="v-files-handler__drop-area-subtitle">
        <label :for="`file-handler-input-${instanceId}`">Загрузите файл </label>или перетащите в это
        поле
      </div>
    </div>
    <!-- File list -->
    <ul class="v-files-handler__list">
      <li class="v-files-handler__list-item file" v-for="file in internalFiles" :key="file.uniqueId">
        <a class="flex gap-2" :href="getDownloadUrl(file)" target="_blank">
          <div class="file__block">
            <img class="file__image" src="/src/assets/images/file-day.svg" alt="" />
            <p class="file__title">{{ file.name }} ({{ formatFileSize(file.size, file.isLoadingSize) }})</p>
          </div>
          <img v-if="deletable" src="/src/assets/images/cross-day.svg" alt="" @click="removeFile(file.uniqueId)"
            style="cursor: pointer" />
          <img v-else src="/src/assets/images/upload-file-blue.svg" alt="">
        </a>
      </li>
    </ul>
    <!-- Button to open file selector -->
    <div v-if="showAddButton" class="file-input" @click="openFileSelector">
      <img src="/src/assets/images/add-file-day.svg" alt="" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

// Генерируем случайный идентификатор для экземпляра компонента
const instanceId = Math.random().toString(36).substring(2, 10)

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  showDropArea: {
    type: Boolean,
    default: false,
  },
  showAddButton: {
    type: Boolean,
    default: false,
  },
  deletable: {
    type: Boolean,
    default: true,
  }
})

const domain = import.meta.env.VITE_API_URL

const emit = defineEmits(['update:modelValue', 'file-added', 'file-removed'])

const internalFiles = ref([])

const createdUrls = new Set()

const fileSizeCache = new Map()

const isInternalUpdate = ref(false)

async function getFileSizeFromUrl(url) {
  if (fileSizeCache.has(url)) {
    return fileSizeCache.get(url)
  }

  try {
    const response = await fetch(url, {
      method: 'HEAD'
    })
    if (response.ok) {
      const contentLength = response.headers.get('content-length')
      const size = contentLength ? parseInt(contentLength, 10) : 0
      fileSizeCache.set(url, size)
      return size
    }
    return 0
  } catch (error) {
    console.warn(`Не удалось получить размер файла ${url}:`, error)
    return 0
  }
}

const isFileUrl = (file) => {
  return typeof file === 'string' && (file.startsWith('http') || file.startsWith('/'))
}

const getDownloadUrl = (fileItem) => {
  // console.log(fileItem)
  // console.log(`fileItem ----------------->>>>`)

  if (fileItem.downloadUrl) {
    return fileItem.downloadUrl
  }
  if (fileItem.file instanceof File) {
    if (!fileItem.blobUrl) {
      const blobUrl = URL.createObjectURL(fileItem.file)
      // console.log(blobUrl)
      // console.log(`blobUrl ++++++++++++++++++`)
      fileItem.blobUrl = blobUrl
      createdUrls.add(blobUrl)
    }
    return fileItem.blobUrl
  }
  if (typeof fileItem.file === 'string') {
    if (fileItem?.file_token && fileItem?.file_token?.token_file_url) {
      // return (fileItem.file_token.domainDownload + fileItem.file_token.token_file_url)
      return (domain + fileItem.file_token.token_file_url)
    } else {
      return fileItem.file
    }
  }
  return '#'
}

const downloadFile = async (fileItem) => {
  try {
    if (fileItem.file instanceof File) {
      const url = URL.createObjectURL(fileItem.file)
      const link = document.createElement('a')
      link.href = url
      link.download = fileItem.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return
    }
    // Если это внешний URL, скачиваем через fetch
    if (typeof fileItem.file === 'string') {

      const response = await fetch(fileItem.file)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileItem.name || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return
    }
    console.warn('Неподдерживаемый тип файла для скачивания')
  } catch (error) {
    console.error('Ошибка при скачивании файла:', error)
    // Fallback - попробуем открыть в новой вкладке
    if (typeof fileItem.file === 'string') {
      window.open(fileItem.file, '_blank')
    }
  }
}

// Упрощенная функция для обработки файлов и получения их размеров
const processFilesWithSizes = async (files) => {
  const processedFiles = files.map((file) => {
    const processedFile = {
      ...file,
      uniqueId: file.uniqueId || `${instanceId}-${file.id || Math.random().toString(36).substring(2, 10)}`
    }

    // Если файл - это URL и размер не указан или равен 0
    if (isFileUrl(file.file)) { //  && (!file.size || file.size === 0)
      processedFile.isLoadingSize = true
      processedFile.size = 0

      // Асинхронно получаем размер без блокировки
      getFileSizeFromUrl(file.file).then(size => {
        // Находим файл в массиве и обновляем его размер
        const fileIndex = internalFiles.value.findIndex(f => f.uniqueId === processedFile.uniqueId)
        if (fileIndex !== -1) {
          // Создаем новый объект файла для реактивности
          const updatedFile = {
            ...internalFiles.value[fileIndex],
            size: size,
            isLoadingSize: false
          }

          // Заменяем файл в массиве
          internalFiles.value.splice(fileIndex, 1, updatedFile)
        }
      }).catch(error => {
        console.warn('Ошибка при получении размера файла:', error)
        // В случае ошибки убираем индикатор загрузки
        const fileIndex = internalFiles.value.findIndex(f => f.uniqueId === processedFile.uniqueId)
        if (fileIndex !== -1) {
          const updatedFile = {
            ...internalFiles.value[fileIndex],
            isLoadingSize: false
          }
          internalFiles.value.splice(fileIndex, 1, updatedFile)
        }
      })
    }
    return processedFile
  })

  return processedFiles
}

// Инициализация при монтировании компонента
onMounted(async () => {
  if (props.modelValue.length > 0) {
    const processedFiles = await processFilesWithSizes(props.modelValue)
    internalFiles.value = processedFiles
  }
})

// Очистка созданных URL при размонтировании компонента
onBeforeUnmount(() => {
  createdUrls.forEach(url => {
    URL.revokeObjectURL(url)
  })
  createdUrls.clear()
  fileSizeCache.clear()
})

// Исправленные watch функции
watch(
  () => props.modelValue,
  async (newFiles, oldFiles) => {
    // Предотвращаем обработку если это внутреннее обновление
    if (isInternalUpdate.value) {
      return
    }

    if (!newFiles || newFiles.length === 0) {
      if (internalFiles.value.length > 0) {
        internalFiles.value = []
      }
      return
    }

    // Проверяем, действительно ли изменились файлы
    const filesChanged = !oldFiles ||
      newFiles.length !== oldFiles.length ||
      newFiles.some((file, index) => {
        const oldFile = oldFiles[index]
        if (!oldFile) return true

        // Сравниваем основные свойства файлов
        return file.name !== oldFile.name ||
          file.size !== oldFile.size ||
          file.file !== oldFile.file
      })

    if (!filesChanged) {
      return
    }

    const processedFiles = await processFilesWithSizes(newFiles)
    internalFiles.value = processedFiles
  },
  { deep: true }
)

watch(
  internalFiles,
  (newInternalFiles, oldInternalFiles) => {
    // Проверяем, действительно ли изменились внутренние файлы
    if (oldInternalFiles &&
      newInternalFiles.length === oldInternalFiles.length &&
      newInternalFiles.every((file, index) => {
        const oldFile = oldInternalFiles[index]
        return oldFile &&
          file.uniqueId === oldFile.uniqueId &&
          file.name === oldFile.name &&
          file.size === oldFile.size &&
          file.isLoadingSize === oldFile.isLoadingSize
      })) {
      return
    }

    // Устанавливаем флаг перед эмитом
    isInternalUpdate.value = true

    // Отправляем только данные о файлах без инстанс-идентификаторов
    const cleanFiles = newInternalFiles.map(({ uniqueId, isLoadingSize, blobUrl, ...rest }) => ({
      ...rest,
      file: rest.file,
    }))

    emit('update:modelValue', cleanFiles)

    // Сбрасываем флаг в следующем тике
    nextTick(() => {
      isInternalUpdate.value = false
    })
  },
  { deep: true }
)

const fileInput = ref(null)
const isDragging = ref(false)

const addFilesToList = (filesToAdd) => {
  const newFiles = Array.from(filesToAdd).map((file) => ({
    id: Math.random().toString(36).substring(2, 15),
    name: file.name,
    size: file.size,
    file: file,
    uniqueId: `${instanceId}-${Math.random().toString(36).substring(2, 10)}`
  }))

  // Улучшенная проверка на дубликаты
  const existingFiles = new Set(internalFiles.value.map(f =>
    f.file instanceof File ? `${f.name}-${f.size}-${f.file.lastModified}` : `${f.name}-${f.size}`
  ))

  const filteredFiles = newFiles.filter(f => {
    const fileKey = f.file instanceof File ?
      `${f.name}-${f.size}-${f.file.lastModified}` :
      `${f.name}-${f.size}`
    return !existingFiles.has(fileKey)
  })

  if (filteredFiles.length === 0) return

  internalFiles.value = [...internalFiles.value, ...filteredFiles]
  emit('file-added', filteredFiles)
}

const handleFileChange = (e) => {
  if (e.target.files && e.target.files.length > 0) {
    addFilesToList(e.target.files)
    e.target.value = ''
  }
}

const handleFileDrop = (e) => {
  isDragging.value = false
  const droppedFiles = e.dataTransfer.files
  if (droppedFiles.length > 0) {
    addFilesToList(droppedFiles)
  }
}

const openFileSelector = () => {
  fileInput.value.click()
}

const formatFileSize = (size, isLoading = false) => {
  if (isLoading) {
    return 'загрузка...'
  }
  if (!size || size === 0) {
    return 'размер неизвестен'
  }
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

const removeFile = (uniqueId) => {
  const fileToRemove = internalFiles.value.find((file) => file.uniqueId === uniqueId)
  if (fileToRemove) {
    // Очищаем blob URL если он был создан
    if (fileToRemove.blobUrl) {
      URL.revokeObjectURL(fileToRemove.blobUrl)
      createdUrls.delete(fileToRemove.blobUrl)
    }
    // Удаляем уникальный идентификатор перед отправкой события
    const { uniqueId: _, isLoadingSize, blobUrl, ...cleanFileToRemove } = fileToRemove
    internalFiles.value = internalFiles.value.filter((file) => file.uniqueId !== uniqueId)
    emit('file-removed', cleanFileToRemove)
  }
}

// Метод для обработки событий вставки (может вызываться из родительского компонента)
const handlePaste = (event) => {
  const clipboardData = event.clipboardData || window.clipboardData
  const items = clipboardData.items
  let hasFiles = false
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile()
        if (file) {
          hasFiles = true
          addFilesToList([file])
        }
      }
    }
    return hasFiles // Возвращаем информацию о наличии файлов
  }
  return false
}

// Экспортируем методы для родительского компонента
defineExpose({
  addFilesToList,
  removeFile,
  handlePaste,
  openFileSelector,
  instanceId,
  internalFiles,
  getDownloadUrl,
  downloadFile
})
</script>
