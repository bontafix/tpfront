<template>
  <v-custom-modal>
    <template #modal>
      <div class="v-themes-modal">
        <div class="modal-title">Темы урока</div>

        <ul class="v-themes-modal__list">
          <li class="v-themes-modal__list-item theme" v-for="theme in themes" :key="theme.id">
            <div class="theme__title">
              {{ theme.name }}
            </div>
            <div class="theme__close" @click="() => deleteTheme(theme.id)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M9 3L3 9M3 3L9 9"
                  stroke="#1D4ECC"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </li>
        </ul>
        <v-add-field @submit="submitTheme" />
      </div>
    </template>
    <template #button>
      <button></button>
    </template>
  </v-custom-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import vAddField from '../generalComponents/v-add-field.vue'
import vCustomModal from '../generalComponents/v-custom-modal.vue'
import { setTopic, deleteLessonTopic } from '@/api/requests'

const props = defineProps({
  lessonId: {
    type: Number,
    default: () => 0
  },
  cachedThemes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update-themes'])

const lessonId = computed(() => props.lessonId)
const themes = ref([])
const newThemes = ref([])

const submitTheme = async (newTheme) => {
  const newThemeObj = { id: Date.now(), name: newTheme }
  themes.value.push(newThemeObj)
  newThemes.value.push(newThemeObj)

  const requestBody = {
    lesson_id: lessonId.value,
    name: newTheme
  }
  await setTopic(requestBody)
  emit('update-themes', lessonId.value, [...themes.value])
}

const deleteTheme = async (themeId) => {
  themes.value = themes.value.filter((theme) => theme.id !== themeId)
  // Обновляем кеш в родительском компоненте
  emit('update-themes', lessonId.value, [...themes.value])
  let foundTheme = false
  newThemes.value.forEach((theme)=>{
    if (theme.id === themeId) {
      foundTheme = true
    }
  })
  if(!foundTheme) {
    await deleteLessonTopic(themeId)
  }
}


// Просто синхронизируем с кешированными данными
watch(() => props.cachedThemes, (newCachedThemes) => {
  if (newCachedThemes) {
    console.log('Синхронизируем темы из кеша:', newCachedThemes)
    themes.value = [...newCachedThemes]
  }
}, { immediate: true })

// При изменении урока тоже синхронизируем
watch(lessonId, () => {
  if (props.cachedThemes) {
    themes.value = [...props.cachedThemes]
  }
})
</script>
