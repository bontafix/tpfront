<template>
  <v-base>
    <section class="v-students">
      <div class="container">
        <div class="v-students__container layout">
          <div class="v-students__header">
            <div class="v-students__header-block">
              <div class="flex gap-3 justify-between">
                <h1 class="v-students__title text-title">{{ currentTitle }}</h1>
              </div>
              <div class="flex gap-4 justify-between">
                <router-link :to="{ name: 'archive_students' }" class="v-students__menu-link mob">
                  <img src="/src/assets/images/external-link.svg" alt="" />
                  Архив
                </router-link>
                <div class="v-students__header-buttons">
                  <button
                    class="v-students__header-button custom-btn white"
                    @click="() => toggleModals('massAddition')"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_9241_10005)">
                        <path
                          d="M13.3333 13.3332L9.99997 9.9999M9.99997 9.9999L6.66663 13.3332M9.99997 9.9999V17.4999M16.9916 15.3249C17.8044 14.8818 18.4465 14.1806 18.8165 13.3321C19.1866 12.4835 19.2635 11.5359 19.0351 10.6388C18.8068 9.7417 18.2862 8.94616 17.5555 8.37778C16.8248 7.80939 15.9257 7.50052 15 7.4999H13.95C13.6977 6.52427 13.2276 5.61852 12.5749 4.85073C11.9222 4.08295 11.104 3.47311 10.1817 3.06708C9.25943 2.66104 8.25709 2.46937 7.25006 2.50647C6.24304 2.54358 5.25752 2.80849 4.36761 3.28129C3.47771 3.7541 2.70656 4.42249 2.11215 5.23622C1.51774 6.04996 1.11554 6.98785 0.935783 7.9794C0.756025 8.97095 0.803388 9.99035 1.07431 10.961C1.34523 11.9316 1.83267 12.8281 2.49997 13.5832"
                          stroke="#545F72"
                          stroke-width="1.67"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_9241_10005">
                          <rect width="20" height="20" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    <span> Массововое добавление учеников </span>
                  </button>
                  <button
                    class="v-students__header-button custom-btn blue"
                    @click="() => toggleModals('addStudents')"
                  >
                    <img src="/src/assets/images/white-plus.svg" alt="" />
                    <span> Ученик </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="v-students__menu" v-if="!editMode">
            <div class="v-students__menu-block">
              <div class="v-students__menu-buttons">
                <button
                  class="v-students__menu-button"
                  @click="() => toggleMenu('table')"
                  :class="{ active: isTable }"
                >
                  Таблица
                </button>
                <button
                  class="v-students__menu-button"
                  @click="() => toggleMenu('cards')"
                  :class="{ active: isCards }"
                >
                  Карточки
                </button>
              </div>
              <div class="v-students__menu-buttons">
                <button
                  class="v-students__menu-button"
                  @click="() => toggleMenuType('students')"
                  :class="{ active: isStudents }"
                >
                  Ученики
                </button>
                <button
                  class="v-students__menu-button"
                  @click="() => toggleMenuType('groups')"
                  :class="{ active: isGroups }"
                >
                  Группы
                </button>
              </div>
            </div>
            <div class="v-students__menu-block">
              <router-link :to="{ name: 'archive_students' }" class="v-students__menu-link">
                <img src="/src/assets/images/external-link.svg" alt="" />
                Перейти в архив
              </router-link>
              <div class="v-students__menu-search">
                <button class="v-students__menu-search-button">
                  <img src="/src/assets/images/search-icon.svg" alt="" />
                </button>
                <input type="text" class="v-students__menu-search-input" placeholder="Поиск" @input="searchStudents" v-model="searchItem" />
              </div>
            </div>
          </div>

          <div class="v-students__menu" v-else>
            <div class="flex gap-3" v-if="isCards">
              <div class="styled-checkbox">
                <input
                  type="checkbox"
                  id="select-all"
                  @change="allCardsSelected"
                  v-model="allCards"
                />
                <label class="white-bg" for="select-all"></label>
              </div>
              <label for="select-all" class="subtitle">Выбрать все</label>
            </div>
            <div class="v-students__menu-block">
              <button class="custom-btn blue" @click="toggleGroupModal" v-show="isStudents">
                <img src="/src/assets/images/users-group.svg" alt="" />
                <span> Создать группу </span>
              </button>
              <button class="custom-btn white" @click="() => toggleModals('archive')">
                <img src="/src/assets/images/upload-cloud.svg" alt="" />
                <span> Архивировать </span>
              </button>
              <button class="custom-btn white" @click="deleteStudents">
                <img src="/src/assets/images/upload-cloud-red.svg" alt="" />
                <span class="text-red"> Удалить </span>
              </button>
            </div>
          </div>

          <v-students-table
            v-if="isTable && currentTypeItemsLength"
            @student-selected="toggleEditMode"
            @edit-item="editItem"
            @toggle-modal="toggleModals"
            ref="studentsTable"
            :items="itemsToDisplay"
            :type="studentsType"
          />

          <v-students-cards
            ref="studentsCards"
            v-if="isCards && currentTypeItemsLength"
            :items="itemsToDisplay"
            @student-selected="toggleEditMode"
            :type="studentsType"
            @toggle-modal="toggleModals"
            @edit-group="editGroup"
          />

          <div class="loader-container" v-show="!students.length && isLoading">
            <div class="loader"></div>
          </div>
        </div>

        <div class="layout" v-if="parseInt(!students.length) && !isGroups && !isLoading">
          <div class="null-screen">
            <h1>Ещё не добавлено ни одного ученика {{ students.length && !isGroups && !isLoading }}</h1>
          </div>
        </div>

        <div class="layout" v-if="!groups?.length && isGroups && !isLoading">
          <div class="null-screen">
            <h1>Ещё не добавлено ни одной группы</h1>
          </div>
        </div>
      </div>
    </section>
  </v-base>

    <div class="v-finance__menu mob-actions" v-click-outside="() => buttonsActive = false">
          <button class="v-finance__plus mob-actions__plus custom-btn blue" @click="buttonsActive = !buttonsActive">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <div class="v-finance__menu-items mob-actions__menu-items" :class="{ active: buttonsActive }">
            <button class="v-finance__menu-item mob-actions__menu-item" @click="() => toggleModals('addStudents')">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
                  stroke="#717680"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Ученик
            </button>
            <button class="v-finance__menu-item mob-actions__menu-item" @click="() => toggleModals('massAddition')">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332"
                  stroke="#717680"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Массовое
            </button>
          </div>
        </div>

  <!-- Все модальные окна заменены на v-if -->
  <transition name="fade">
    <v-add-students-modal
      v-if="modals.addStudents"
      @close="() => toggleModals('addStudents')"
    />
  </transition>

  <transition name="fade">
    <v-mass-addition
      v-if="modals.massAddition"
      @close="() => toggleModals('massAddition')"
    />
  </transition>

  <transition name="fade">
    <v-group-modal
      v-if="modals.groupModal"
      @close="() => toggleModals('groupModal')"
      :students="selectedGroupStudents"
    />
  </transition>

  <transition name="fade">
    <v-delete-modal
      v-if="modals.deleteModal"
      @close="() => toggleModals('deleteModal')"
      :type="currentType"
      :student="selectedStudent"
      :student_amount="studentsAmount"
      :group_amount="groupAmount"
    />
  </transition>

  <transition name="fade">
    <v-archive-student
      v-if="modals.archive"
      @close="() => toggleModals('archive')"
      @archive-student="toggleEditMode"
      :type="currentType"
    />
  </transition>

  <transition name="fade">
    <v-edit-group-modal
      v-if="modals.editGroup && currentGroup"
      :group-data="currentGroup"
      @close="() => toggleModals('editGroup')"
    />
  </transition>
</template>

<script setup>
import { debounce } from 'lodash'
import { useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { useIsMobile } from '@/composables/useIsMobile'
import { useStudentsStore } from '@/stores/studentsStore'
import vBase from '../v-base.vue'
import vStudentsCards from './v-students-cards.vue'
import vStudentsTable from './v-students-table.vue'
import vGroupModal from '../modals/students/v-group-modal.vue'
import vDeleteModal from '../modals/students/v-delete-modal.vue'
import vMassAddition from '../modals/students/v-mass-addition.vue'
import vEditGroupModal from '../modals/students/v-edit-group-modal.vue'
import vAddStudentsModal from '../modals/students/v-add-students-modal.vue'
import vArchiveStudent from '../modals/students/v-archive-student-modal.vue'

const isMobile = useIsMobile(480)
const allCards = ref(false)
const studentsCards = ref(null)
const studentsTable = ref(null)
const selectedStudents = ref([])
const selectedGroupStudents = ref([])
const isTable = ref(true)
const isCards = ref(false)
const isStudents = ref(true)
const isGroups = ref(false)
const editMode = ref(false)
const router = useRouter()
const store = useStudentsStore()
const searchItem = ref()
const isSearching = ref(false)

/* Для модального удаления */
const currentGroup = ref(null)

const currentType = computed(() => {
  return isStudents.value ? 'students' : isGroups.value ? 'groups' : null
})

const selectedStudent = computed(() => {
  if (selectedStudents.value.length < 1) {
    const student = students.value.filter((student) => student.id === selectedStudents.value[0])
    return [student]
  }
  return null
})

const buttonsActive = ref(false)

const studentsAmount = ref(null)
const groupAmount = ref(null)

const modals = ref({
  archive: false,
  editGroup: false,
  addStudents: false,
  massAddition: false,
  groupModal: false,
  deleteModal: false,
})

const groups = computed(()=>{
  return store.groups
})

const students = computed(()=>{
  if(!store.students.length) {
    editMode.value = false
  }
  return store.students
})

const currentTitle = computed(() => {
  return currentType.value === 'students' ? 'Ученики' : 'Группы'
})

const itemsToDisplay = computed(() => {
  return isGroups.value ? groups.value : students.value
})

const studentsType = computed(() => {
  return isGroups.value ? 'groups' : 'students'
})

const currentTypeItemsLength = computed(()=>{
  if(isGroups.value){
    return groups.value?.length
  }
  return students.value?.length
})

const isLoading = ref(false)

const editItem = (item) => {
  if (isGroups.value) {
    currentGroup.value = item
    toggleModals('editGroup')
  } else {
    router.push({ name: 'student', params: { id: item.id } })
  }
}

const allCardsSelected = () => {
  studentsCards.value.selectAllStudents(allCards.value)
  editMode.value = allCards.value
}

const toggleMenu = (menu) => {
  isTable.value = menu === 'table'
  isCards.value = menu === 'cards'
  localStorage.setItem('menu', menu)
}

const toggleEditMode = (value, selectedCardsStudents) => {
  editMode.value = value
  selectedStudents.value = selectedCardsStudents
}

const toggleMenuType = async (menuType, load=true) => {
  isStudents.value = menuType === 'students'
  isGroups.value = menuType === 'groups'
  localStorage.setItem('menuType', menuType)
  if(load) {
    await loadData()
  }
}

const toggleGroupModal = () => {
  const selectedGroupStudentsIds = isTable.value
    ? studentsTable.value.selectedGroupStudents
    : studentsCards.value.selectedGroupStudents

  const filteredStudents = []
  for (const studentId in selectedGroupStudentsIds) {
    filteredStudents.push(students.value.filter((student) => student.id == studentId)[0])
  }
  selectedGroupStudents.value = filteredStudents
  toggleModals('groupModal')
}

const editGroup = (group) => {
  currentGroup.value = group
  toggleModals('editGroup')
}

const toggleModals = (modalName) => {
  modals.value[modalName] = !modals.value[modalName]
}

const deleteStudents = () => {
  const deletedStudentsIds = Object.keys(selectedStudents.value).filter(
    (studentId) => selectedStudents.value[studentId],
  )
  studentsAmount.value = deletedStudentsIds.length
  modals.value.deleteModal = true
}

const setMenuType = () => {
  const menu = localStorage.getItem('menu')
  const menuType = localStorage.getItem('menuType')
  isGroups.value = menuType === 'groups'
  isStudents.value = menuType === 'students'
  if (menu) {
    toggleMenu(menu)
  }
  if(!isMobile.isMobile.value) {
    if (menuType) {
      toggleMenuType(menuType, false)
    }
  } else {
    toggleMenu('cards')
  }
}

const debouncedSearch = debounce(async (searchTerm) => {
  isSearching.value = true
  try {
    await loadData(searchTerm)
  } finally {
    isSearching.value = false
  }
}, 300)

const searchStudents = (event) => {
  const value = event.target.value.trim()
  searchItem.value = value
  if (value.length === 0) {
    // Если поле пустое, загружаем всех студентов
    loadData('')
  } else if (value.length >= 2) {
    // Начинаем поиск только с 2 символов
    debouncedSearch(value)
  }
}

const loadData = async (search_item='') => {
  isLoading.value = true
  await store.setTimezone()
  if(isStudents.value)
  await store.getStudents(search_item)
  if(isGroups.value) {
    await store.fetchGroups()
  }
  students.value = store.students
  isLoading.value = false
}

onMounted(() => {
  setMenuType()
  loadData()
})
</script>
