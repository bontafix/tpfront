<template>
  <v-custom-modal>
    <template #modal>
      <div class="v-mass-addition">
        <h2 class="modal-title">Массовое добавление учеников</h2>
        <p class="modal-subtitle mt-2 text-center">Скачайте и загрузите отредактированный шаблон</p>

        <!-- Кнопка для скачивания шаблона -->
        <div class="block mt-4" @click="downloadTemplate" style="cursor: pointer;">
          <div class="file">
            <div class="file__block">
                <img class="file__image" src="/src/assets/images/file-day.svg" alt="" />
                <p class="file__title">Скачайте шаблон ( 200КБ )</p>
              </div>
              <img
                src="/src/assets/images/blue-upload.svg"
                alt=""
                style="cursor: pointer"
              />
          </div>
        </div>

        <v-files-handler :showDropArea="true" v-model="rawFiles"/>
      </div>
    </template>
    <template #button>
      <button class="custom-btn blue" :class="{unactive: !rawFiles.length}" @click="onSubmit">
        Сохранить
      </button>
    </template>
  </v-custom-modal>
</template>

<script setup>
import { ref } from 'vue'

import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'
import vFilesHandler from '@/components/generalComponents/v-files-handler.vue'

import { formatFileSize } from '@/utils'
import { importStudents } from '@/api/students'

const rawFiles = ref([])

const onSubmit = async () => {
  const fileObj = rawFiles.value[0]?.file
  if (!fileObj) return console.warn('Файл не выбран.')

  const formData = new FormData()
  formData.append('file', fileObj, fileObj.name)

  await importStudents(formData)
}

// Функция для скачивания шаблона
const downloadTemplate = () => {
  try {
    // Создаем временную ссылку для скачивания
    const link = document.createElement('a')

    // Пробуем разные пути для совместимости
    const possiblePaths = [
      '/templates/Массовое добавление учеников шаблон.xlsx',
      './templates/Массовое добавление учеников шаблон.xlsx',
      `${window.location.origin}/templates/Массовое добавление учеников шаблон.xlsx`
    ]

    // Используем первый путь
    link.href = possiblePaths[0]
    link.download = 'Массовое добавление учеников шаблон.xlsx'

    // Добавляем ссылку в DOM, кликаем и удаляем
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('Попытка скачивания шаблона:', link.href)
  } catch (error) {
    console.error('Ошибка при скачивании шаблона:', error)

    // Fallback: пробуем прямую загрузку через fetch
    downloadTemplateViaFetch()
  }
}

// Альтернативный способ загрузки через fetch (для проблемных браузеров)
const downloadTemplateViaFetch = async () => {
  try {
    const response = await fetch('/templates/Массовое добавление учеников шаблон.xlsx')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'Массовое добавление учеников шаблон.xlsx'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Освобождаем память
    window.URL.revokeObjectURL(url)

    console.log('Шаблон скачан через fetch')
  } catch (error) {
    console.error('Ошибка при загрузке шаблона через fetch:', error)
    alert('Ошибка при скачивании шаблона. Попробуйте позже или обратитесь к администратору.')
  }
}

const convertFileToBase64Binary = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const arrayBuffer = reader.result
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64String = btoa(binary) // 👈 чистая base64
      resolve(base64String)
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
</script>
